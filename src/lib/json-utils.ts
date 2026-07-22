// JSON utility functions

export interface ValidationResult {
  valid: boolean;
  error?: {
    message: string;
    line?: number;
    column?: number;
  };
}

export interface SizeInfo {
  original: number;
  processed: number;
  savings: number;
  savingsPercent: number;
}

// Sensitive keys to highlight
const SENSITIVE_KEYS = [
  'password', 'secret', 'token', 'api_key', 'apikey', 'api-key',
  'auth', 'authorization', 'bearer', 'credential', 'private_key',
  'access_token', 'refresh_token', 'session', 'cookie'
];

export function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive));
}

export function validateJSON(input: string): ValidationResult {
  if (!input.trim()) {
    return { valid: false, error: { message: 'Input is empty' } };
  }

  try {
    JSON.parse(input);
    return { valid: true };
  } catch (e) {
    const error = e as SyntaxError;
    const match = error.message.match(/at position (\d+)/);
    let line = 1;
    let column = 1;

    if (match) {
      const position = parseInt(match[1], 10);
      const lines = input.substring(0, position).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    return {
      valid: false,
      error: {
        message: error.message,
        line,
        column,
      },
    };
  }
}

export function formatJSON(input: string, spaces: number = 2): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, spaces);
}

export function minifyJSON(input: string): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}

export function calculateSize(original: string, processed: string): SizeInfo {
  const originalSize = new Blob([original]).size;
  const processedSize = new Blob([processed]).size;
  const savings = originalSize - processedSize;
  const savingsPercent = originalSize > 0 ? (savings / originalSize) * 100 : 0;

  return {
    original: originalSize,
    processed: processedSize,
    savings: Math.abs(savings),
    savingsPercent: Math.abs(savingsPercent),
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function jsonToCSV(input: string): string {
  const data = JSON.parse(input);
  
  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of objects to convert to CSV');
  }

  if (data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Add headers
  csvRows.push(headers.map(h => `"${h}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function parseCSVValue(value: string): unknown {
  const trimmed = value.trim();

  if (trimmed === '') return '';
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;
  if (trimmed.toLowerCase() === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

export function csvToJSON(input: string, spaces: number = 2): string {
  const rows = input
    .split(/\r?\n/)
    .map(row => row.trim())
    .filter(Boolean);

  if (rows.length === 0) {
    throw new Error('CSV input is empty');
  }

  const headers = parseCSVLine(rows[0]).map(header => header.trim());

  if (headers.length === 0 || headers.some(header => !header)) {
    throw new Error('CSV must include a valid header row');
  }

  const data = rows.slice(1).map(row => {
    const values = parseCSVLine(row);
    return headers.reduce<Record<string, unknown>>((record, header, index) => {
      record[header] = parseCSVValue(values[index] ?? '');
      return record;
    }, {});
  });

  return JSON.stringify(data, null, spaces);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatTomlValue(value: unknown): string {
  if (value === null || value === undefined) return '""';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return `[${value.map(item => formatTomlValue(item)).join(', ')}]`;
  }

  return JSON.stringify(value);
}

function toTomlSection(obj: Record<string, unknown>, prefix: string = ''): string[] {
  const lines: string[] = [];
  const nested: Array<[string, Record<string, unknown>]> = [];

  for (const [key, value] of Object.entries(obj)) {
    const safeKey = /^[A-Za-z0-9_-]+$/.test(key) ? key : JSON.stringify(key);

    if (isPlainObject(value)) {
      nested.push([prefix ? `${prefix}.${safeKey}` : safeKey, value]);
    } else {
      lines.push(`${safeKey} = ${formatTomlValue(value)}`);
    }
  }

  for (const [section, value] of nested) {
    if (lines.length > 0) lines.push('');
    lines.push(`[${section}]`);
    lines.push(...toTomlSection(value, section));
  }

  return lines;
}

export function jsonToTOML(input: string): string {
  const data = JSON.parse(input);

  if (Array.isArray(data)) {
    return data
      .map((item, index) => {
        if (!isPlainObject(item)) {
          return `[[items]]\nvalue = ${formatTomlValue(item)}`;
        }

        return `[[items]]\n${toTomlSection(item).join('\n')}`;
      })
      .join('\n\n');
  }

  if (!isPlainObject(data)) {
    throw new Error('JSON must be an object or array to convert to TOML');
  }

  return toTomlSection(data).join('\n');
}

export function jsonToXML(input: string, rootName: string = 'root'): string {
  const data = JSON.parse(input);
  
  function convert(obj: unknown, nodeName: string = 'item'): string {
    if (obj === null) return `<${nodeName}></${nodeName}>`;
    if (typeof obj !== 'object') return `<${nodeName}>${escapeXML(String(obj))}</${nodeName}>`;
    
    if (Array.isArray(obj)) {
      return obj.map(item => convert(item, nodeName)).join('\n');
    }

    const entries = Object.entries(obj as Record<string, unknown>);
    const children = entries.map(([key, value]) => {
      const safeName = key.replace(/[^a-zA-Z0-9_-]/g, '_');
      return convert(value, safeName);
    }).join('\n');
    
    return `<${nodeName}>\n${indent(children)}\n</${nodeName}>`;
  }

  function escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function indent(str: string): string {
    return str.split('\n').map(line => '  ' + line).join('\n');
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${convert(data, rootName)}`;
  return xml;
}

export interface DiffResult {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  path: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export function compareJSON(left: string, right: string): DiffResult[] {
  const leftObj = JSON.parse(left);
  const rightObj = JSON.parse(right);
  const results: DiffResult[] = [];

  function compare(l: unknown, r: unknown, path: string = '') {
    if (l === r) {
      results.push({ type: 'unchanged', path: path || 'root' });
      return;
    }

    if (typeof l !== typeof r) {
      results.push({ type: 'modified', path: path || 'root', oldValue: l, newValue: r });
      return;
    }

    if (typeof l !== 'object' || l === null || r === null) {
      results.push({ type: 'modified', path: path || 'root', oldValue: l, newValue: r });
      return;
    }

    if (Array.isArray(l) !== Array.isArray(r)) {
      results.push({ type: 'modified', path: path || 'root', oldValue: l, newValue: r });
      return;
    }

    const leftObj = l as Record<string, unknown>;
    const rightObj = r as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)]);

    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key;
      
      if (!(key in leftObj)) {
        results.push({ type: 'added', path: newPath, newValue: rightObj[key] });
      } else if (!(key in rightObj)) {
        results.push({ type: 'removed', path: newPath, oldValue: leftObj[key] });
      } else {
        compare(leftObj[key], rightObj[key], newPath);
      }
    }
  }

  compare(leftObj, rightObj, '');
  return results.filter(r => r.type !== 'unchanged');
}

export function downloadFile(content: string, filename: string, mimeType: string = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
