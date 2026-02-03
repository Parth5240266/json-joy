// Code generation utilities

export interface FetchResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Fetch JSON from a URL (client-side)
 */
export async function fetchJsonFromUrl(url: string): Promise<FetchResult> {
  try {
    // Validate URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    new URL(formattedUrl); // Validate URL format

    const response = await fetch(formattedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (e) {
    const error = e as Error;
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return {
        success: false,
        error: 'CORS error: The server may not allow cross-origin requests. Try a public API or use a CORS proxy.',
      };
    }
    return {
      success: false,
      error: error.message || 'Failed to fetch JSON',
    };
  }
}

/**
 * Infer TypeScript type from a JavaScript value
 */
function inferType(value: unknown, depth = 0): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  const type = typeof value;

  if (type === 'string') return 'string';
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    
    // Get unique types from array elements
    const elementTypes = new Set<string>();
    for (const item of value) {
      elementTypes.add(inferType(item, depth + 1));
    }
    
    const types = Array.from(elementTypes);
    if (types.length === 1) {
      return `${types[0]}[]`;
    }
    return `(${types.join(' | ')})[]`;
  }

  if (type === 'object') {
    return 'object'; // Will be handled by interface generation
  }

  return 'unknown';
}

/**
 * Check if value is a plain object (not array, null, etc.)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Generate TypeScript interface name from key
 */
function toInterfaceName(key: string): string {
  return key
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert JSON to TypeScript interfaces
 */
export function jsonToTypeScript(jsonString: string, rootName = 'Root'): string {
  const data = JSON.parse(jsonString);
  const interfaces: Map<string, string> = new Map();
  const usedNames: Set<string> = new Set();

  function getUniqueName(baseName: string): string {
    let name = toInterfaceName(baseName);
    let counter = 1;
    while (usedNames.has(name)) {
      name = `${toInterfaceName(baseName)}${counter}`;
      counter++;
    }
    usedNames.add(name);
    return name;
  }

  function processValue(value: unknown, key: string, parentName: string): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    const type = typeof value;

    if (type === 'string') return 'string';
    if (type === 'number') return 'number';
    if (type === 'boolean') return 'boolean';

    if (Array.isArray(value)) {
      if (value.length === 0) return 'unknown[]';

      const firstItem = value[0];
      if (isPlainObject(firstItem)) {
        const itemInterfaceName = getUniqueName(key);
        processObject(firstItem, itemInterfaceName);
        return `${itemInterfaceName}[]`;
      }

      return `${inferType(firstItem)}[]`;
    }

    if (isPlainObject(value)) {
      const nestedInterfaceName = getUniqueName(key);
      processObject(value, nestedInterfaceName);
      return nestedInterfaceName;
    }

    return 'unknown';
  }

  function processObject(obj: Record<string, unknown>, interfaceName: string): void {
    const properties: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      const type = processValue(value, key, interfaceName);
      properties.push(`  ${safeKey}: ${type};`);
    }

    const interfaceStr = `export interface ${interfaceName} {\n${properties.join('\n')}\n}`;
    interfaces.set(interfaceName, interfaceStr);
  }

  // Handle root value
  if (isPlainObject(data)) {
    usedNames.add(rootName);
    processObject(data, rootName);
  } else if (Array.isArray(data)) {
    if (data.length > 0 && isPlainObject(data[0])) {
      const itemName = getUniqueName(`${rootName}Item`);
      processObject(data[0], itemName);
      interfaces.set('_root_type', `export type ${rootName} = ${itemName}[];`);
    } else {
      const elementType = data.length > 0 ? inferType(data[0]) : 'unknown';
      interfaces.set('_root_type', `export type ${rootName} = ${elementType}[];`);
    }
  } else {
    interfaces.set('_root_type', `export type ${rootName} = ${inferType(data)};`);
  }

  // Build output with root type at top, then interfaces in order
  const output: string[] = [];
  
  // Add root type alias if it exists
  if (interfaces.has('_root_type')) {
    output.push(interfaces.get('_root_type')!);
    interfaces.delete('_root_type');
  }
  
  // Add main interface first if it exists
  if (interfaces.has(rootName)) {
    output.push(interfaces.get(rootName)!);
    interfaces.delete(rootName);
  }
  
  // Add remaining interfaces
  for (const [, interfaceStr] of interfaces) {
    output.push(interfaceStr);
  }

  return output.join('\n\n');
}

/**
 * Convert JSON to JavaScript code with JSDoc comments
 */
export function jsonToJavaScript(jsonString: string, varName = 'data'): string {
  const data = JSON.parse(jsonString);
  const lines: string[] = [];

  // Generate JSDoc for the structure
  lines.push('/**');
  lines.push(` * @typedef {Object} ${toInterfaceName(varName)}`);
  
  if (isPlainObject(data)) {
    for (const [key, value] of Object.entries(data)) {
      const type = getJSDocType(value);
      lines.push(` * @property {${type}} ${key}`);
    }
  }
  
  lines.push(' */');
  lines.push('');

  // Generate the variable declaration
  lines.push(`/** @type {${toInterfaceName(varName)}} */`);
  lines.push(`const ${varName} = ${JSON.stringify(data, null, 2)};`);
  lines.push('');
  lines.push(`export default ${varName};`);
  lines.push('');

  // Generate fetch function template
  lines.push('// Fetch function template');
  lines.push('/**');
  lines.push(` * Fetches ${varName} from an API endpoint`);
  lines.push(' * @param {string} url - The API endpoint URL');
  lines.push(` * @returns {Promise<${toInterfaceName(varName)}>}`);
  lines.push(' */');
  lines.push(`export async function fetch${toInterfaceName(varName)}(url) {`);
  lines.push('  const response = await fetch(url, {');
  lines.push("    method: 'GET',");
  lines.push('    headers: {');
  lines.push("      'Accept': 'application/json',");
  lines.push("      'Content-Type': 'application/json',");
  lines.push('    },');
  lines.push('  });');
  lines.push('');
  lines.push('  if (!response.ok) {');
  lines.push('    throw new Error(`HTTP error! status: ${response.status}`);');
  lines.push('  }');
  lines.push('');
  lines.push('  return response.json();');
  lines.push('}');

  return lines.join('\n');
}

/**
 * Get JSDoc type string for a value
 */
function getJSDocType(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  const type = typeof value;

  if (type === 'string') return 'string';
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'Array';
    const firstType = getJSDocType(value[0]);
    return `${firstType}[]`;
  }

  if (type === 'object') return 'Object';

  return '*';
}
