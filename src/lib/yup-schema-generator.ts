// JSON to Yup validation schema generator
// Analyzes JSON structure and infers/generates Yup schemas

export type FieldKind = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array' | 'date';

export interface StringValidations {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  email: boolean;
  url: boolean;
  matches?: string; // regex pattern as string
}

export interface NumberValidations {
  required: boolean;
  min?: number;
  max?: number;
  positive: boolean;
  negative: boolean;
  integer: boolean;
}

export interface ArrayValidations {
  required: boolean;
  min?: number;
  max?: number;
}

export interface ObjectValidations {
  required: boolean;
}

export interface DateValidations {
  required: boolean;
  min?: string;
  max?: string;
}

export type FieldValidations =
  | { kind: 'string'; v: StringValidations }
  | { kind: 'number'; v: NumberValidations }
  | { kind: 'boolean'; v: { required: boolean } }
  | { kind: 'null'; v: object }
  | { kind: 'object'; v: ObjectValidations }
  | { kind: 'array'; v: ArrayValidations }
  | { kind: 'date'; v: DateValidations };

export interface FieldNode {
  key: string;
  path: string;
  kind: FieldKind;
  validations: FieldValidations;
  children?: FieldNode[];
  /** For arrays: element type (primitive or object shape) */
  itemSchema?: FieldNode | FieldKind;
  /** Sample values used for inference (from single or multiple samples) */
  samples: unknown[];
}

// --- Detection helpers ---

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/i;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

function isDateLike(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (ISO_DATE_REGEX.test(value)) return true;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function looksLikeEmail(value: unknown): boolean {
  return typeof value === 'string' && EMAIL_REGEX.test(value);
}

function looksLikeUrl(value: unknown): boolean {
  return typeof value === 'string' && URL_REGEX.test(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Infer field kind from a single value */
function inferKind(value: unknown): FieldKind {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    if (isDateLike(value)) return 'date';
    return 'string';
  }
  if (Array.isArray(value)) return 'array';
  if (isPlainObject(value)) return 'object';
  return 'string';
}

/** Infer validations from a single value - only sets required, no automatic min/max/email/etc */
function inferValidationsFromValue(value: unknown, kind: FieldKind): FieldValidations {
  if (kind === 'string') {
    return {
      kind: 'string',
      v: {
        required: value !== null && value !== undefined && value !== '',
        minLength: undefined,
        maxLength: undefined,
        email: false,
        url: false,
      },
    };
  }
  if (kind === 'number') {
    return {
      kind: 'number',
      v: {
        required: value !== null && value !== undefined,
        min: undefined,
        max: undefined,
        positive: false,
        negative: false,
        integer: false,
      },
    };
  }
  if (kind === 'boolean') {
    return { kind: 'boolean', v: { required: value !== null && value !== undefined } };
  }
  if (kind === 'null') {
    return { kind: 'null', v: {} };
  }
  if (kind === 'object') {
    return { kind: 'object', v: { required: value !== null && value !== undefined } };
  }
  if (kind === 'array') {
    return {
      kind: 'array',
      v: {
        required: value !== null && value !== undefined,
        min: undefined,
        max: undefined,
      },
    };
  }
  if (kind === 'date') {
    return { kind: 'date', v: { required: value !== null && value !== undefined } };
  }
  return { kind: 'string', v: { required: false } };
}

/** Merge validations from multiple samples - only sets required if present in all samples */
function mergeStringValidations(samples: unknown[]): StringValidations {
  const required = samples.length > 0 && samples.every((s) => s !== null && s !== undefined && String(s).length > 0);
  return {
    required: !!required,
    minLength: undefined,
    maxLength: undefined,
    email: false,
    url: false,
  };
}

function mergeNumberValidations(samples: unknown[]): NumberValidations {
  const required = samples.length > 0 && samples.every((s) => s !== null && s !== undefined);
  return {
    required: !!required,
    min: undefined,
    max: undefined,
    positive: false,
    negative: false,
    integer: false,
  };
}

function mergeArrayValidations(samples: unknown[]): ArrayValidations {
  return {
    required: samples.length > 0 && samples.every((s) => s !== null && s !== undefined),
    min: undefined,
    max: undefined,
  };
}

/** Collect all values at a path from multiple JSON samples */
function collectValues(samples: unknown[], path: string): unknown[] {
  const out: unknown[] = [];
  for (const root of samples) {
    const parts = path.split('.').filter(Boolean);
    let current: unknown = root;
    for (const part of parts) {
      if (current == null) break;
      if (Array.isArray(current)) {
        const idx = parseInt(part, 10);
        if (!Number.isNaN(idx)) current = current[idx];
        else break;
      } else if (isPlainObject(current)) {
        current = (current as Record<string, unknown>)[part];
      }
    }
    out.push(current);
  }
  return out;
}

/** Build a single FieldNode from a value (and optional path) */
function buildNodeFromValue(
  key: string,
  path: string,
  value: unknown,
  samples: unknown[]
): FieldNode {
  const kind = inferKind(value);
  const validations = inferValidationsFromValue(value, kind);

  const node: FieldNode = {
    key,
    path,
    kind,
    validations,
    samples: [...samples],
  };

  if (kind === 'object' && isPlainObject(value)) {
    node.children = Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      buildNodeFromValue(k, path ? `${path}.${k}` : k, v, [(value as Record<string, unknown>)[k]])
    );
  }

  if (kind === 'array' && Array.isArray(value)) {
    if (value.length > 0) {
      const first = value[0];
      if (isPlainObject(first)) {
        node.itemSchema = buildNodeFromValue('item', `${path}[]`, first, value.slice(0, 1).map((x) => x));
      } else {
        node.itemSchema = inferKind(first);
      }
    } else {
      node.itemSchema = 'string';
    }
  }

  return node;
}

/** Merge two field nodes (for multiple samples): merge validations and children */
function mergeNodes(a: FieldNode, b: FieldNode): FieldNode {
  const allSamples = [...a.samples, ...b.samples];
  const kind = a.kind;

  let validations: FieldValidations = a.validations;
  if (kind === 'string' && a.validations.kind === 'string' && b.validations.kind === 'string') {
    validations = { kind: 'string', v: mergeStringValidations(allSamples) };
  } else if (kind === 'number' && a.validations.kind === 'number' && b.validations.kind === 'number') {
    validations = { kind: 'number', v: mergeNumberValidations(allSamples) };
  } else if (kind === 'array' && a.validations.kind === 'array' && b.validations.kind === 'array') {
    validations = { kind: 'array', v: mergeArrayValidations(allSamples) };
  }

  const merged: FieldNode = {
    key: a.key,
    path: a.path,
    kind: a.kind,
    validations,
    samples: allSamples,
  };

  if (kind === 'object') {
    const aChildren = a.children ?? [];
    const bChildren = b.children ?? [];
    const keys = new Set([...aChildren.map((c) => c.key), ...bChildren.map((c) => c.key)]);
    merged.children = Array.from(keys).map((key) => {
      const ca = aChildren.find((c) => c.key === key);
      const cb = bChildren.find((c) => c.key === key);
      if (!ca) return cb!;
      if (!cb) return ca;
      return mergeNodes(ca, cb);
    });
  }

  if (kind === 'array') {
    if (a.itemSchema && b.itemSchema) {
      if (typeof a.itemSchema === 'object' && typeof b.itemSchema === 'object') {
        merged.itemSchema = mergeNodes(a.itemSchema as FieldNode, b.itemSchema as FieldNode);
      } else {
        merged.itemSchema = a.itemSchema;
      }
    } else {
      merged.itemSchema = a.itemSchema ?? b.itemSchema ?? 'string';
    }
  }

  return merged;
}

/** Extract field tree from a single JSON value (root can be object or array) */
export function analyzeJson(value: unknown): FieldNode | null {
  if (value === null || value === undefined) return null;

  if (Array.isArray(value)) {
    const first = value[0];
    if (isPlainObject(first)) {
      const itemNode = buildNodeFromValue('item', '', first, [first]);
      return {
        key: 'root',
        path: '',
        kind: 'array',
        validations: {
          kind: 'array',
          v: {
            required: true,
            min: undefined,
            max: undefined,
          },
        },
        samples: [value],
        itemSchema: itemNode,
      };
    }
    return {
      key: 'root',
      path: '',
      kind: 'array',
      validations: {
        kind: 'array',
        v: { required: true, min: undefined, max: undefined },
      },
      samples: [value],
      itemSchema: first !== undefined ? inferKind(first) : 'string',
    };
  }

  if (isPlainObject(value)) {
    return buildNodeFromValue('root', '', value, [value]);
  }

  return buildNodeFromValue('root', '', value, [value]);
}

/** Deep clone a field node (for immutable updates from UI) */
export function cloneFieldNode(node: FieldNode): FieldNode {
  const cloned: FieldNode = {
    key: node.key,
    path: node.path,
    kind: node.kind,
    validations: JSON.parse(JSON.stringify(node.validations)),
    samples: [...node.samples],
  };
  if (node.children?.length) {
    cloned.children = node.children.map(cloneFieldNode);
  }
  if (node.itemSchema !== undefined) {
    cloned.itemSchema =
      typeof node.itemSchema === 'object' ? cloneFieldNode(node.itemSchema as FieldNode) : node.itemSchema;
  }
  return cloned;
}

/** Update validations for a node at path (path is dot-separated, e.g. "profile.age") */
export function updateNodeAtPath(
  node: FieldNode,
  path: string,
  updater: (n: FieldNode) => void
): FieldNode {
  const parts = path.split('.').filter(Boolean);
  if (parts.length === 0) {
    const cloned = cloneFieldNode(node);
    updater(cloned);
    return cloned;
  }
  const key = parts[0];
  const rest = parts.slice(1).join('.');

  if (node.kind === 'object' && node.children) {
    const child = node.children.find((c) => c.key === key);
    if (!child) return cloneFieldNode(node);
    const updatedChild = rest
      ? updateNodeAtPath(child, rest, updater)
      : (() => {
          const c = cloneFieldNode(child);
          updater(c);
          return c;
        })();
    const cloned = cloneFieldNode(node);
    cloned.children = node.children.map((c) => (c.key === key ? updatedChild : cloneFieldNode(c)));
    return cloned;
  }
  if (node.kind === 'array' && node.itemSchema && typeof node.itemSchema === 'object') {
    const itemNode = node.itemSchema as FieldNode;
    const updatedItem = key === 'item' && !rest
      ? (() => {
          const c = cloneFieldNode(itemNode);
          updater(c);
          return c;
        })()
      : updateNodeAtPath(itemNode, rest || key, updater);
    const cloned = cloneFieldNode(node);
    cloned.itemSchema = updatedItem;
    return cloned;
  }
  return cloneFieldNode(node);
}

/** Analyze multiple JSON samples and merge into one tree (enhance mode) */
export function analyzeMultipleSamples(values: unknown[]): FieldNode | null {
  if (values.length === 0) return null;
  let acc: FieldNode | null = analyzeJson(values[0]);
  if (!acc) return null;
  for (let i = 1; i < values.length; i++) {
    const next = analyzeJson(values[i]);
    if (!next) continue;
    acc = mergeNodes(acc, next);
  }
  return acc;
}

/** Indent all lines after the first with pad */
function indentChain(chain: string, pad: string): string {
  const lines = chain.split('\n');
  return lines.map((l, i) => (i === 0 ? l : pad + l)).join('\n');
}

/** Generate Yup schema code from a FieldNode (output as string) */
export function generateYupSchema(
  node: FieldNode,
  options: { language: 'javascript' | 'typescript'; indent?: number }
): string {
  const baseIndent = options.indent ?? 2;
  const pad = ' '.repeat(baseIndent);

  function fieldToYup(n: FieldNode, depth: number): string {
    const idt = ' '.repeat((depth + 1) * baseIndent);
    const idtInner = ' '.repeat((depth + 2) * baseIndent);
    if (n.kind === 'string') {
      const v = n.validations.kind === 'string' ? n.validations.v : null;
      if (!v) return 'yup.string()';
      let chain = 'yup.string()';
      if (v.required) chain += '\n  .required()';
      if (v.minLength != null) chain += `\n  .min(${v.minLength})`;
      if (v.maxLength != null) chain += `\n  .max(${v.maxLength})`;
      if (v.email) chain += '\n  .email()';
      if (v.url) chain += '\n  .url()';
      if (v.matches) chain += `\n  .matches(/${v.matches}/)`;
      return indentChain(chain, idtInner);
    }
    if (n.kind === 'number') {
      const v = n.validations.kind === 'number' ? n.validations.v : null;
      if (!v) return 'yup.number()';
      let chain = 'yup.number()';
      if (v.required) chain += '\n  .required()';
      if (v.min != null) chain += `\n  .min(${v.min})`;
      if (v.max != null) chain += `\n  .max(${v.max})`;
      if (v.positive) chain += '\n  .positive()';
      if (v.negative) chain += '\n  .negative()';
      if (v.integer) chain += '\n  .integer()';
      return indentChain(chain, idtInner);
    }
    if (n.kind === 'boolean') {
      const v = n.validations.kind === 'boolean' ? n.validations.v : null;
      let chain = 'yup.boolean()';
      if (v?.required) chain += '\n  .required()';
      return indentChain(chain, idtInner);
    }
    if (n.kind === 'date') {
      const v = n.validations.kind === 'date' ? n.validations.v : null;
      let chain = 'yup.date()';
      if (v?.required) chain += '\n  .required()';
      if (v?.min) chain += `\n  .min(new Date('${v.min}'))`;
      if (v?.max) chain += `\n  .max(new Date('${v.max}'))`;
      return indentChain(chain, idtInner);
    }
    if (n.kind === 'object') {
      if (!n.children || n.children.length === 0) return 'yup.object()';
      const shape = n.children
        .filter((c) => c.key !== 'root')
        .map((c) => {
          const schema = fieldToYup(c, depth + 1);
          return `${idt}${c.key}: ${schema.replace(/\n/g, '\n' + idt)},`;
        })
        .join('\n');
      return `yup.object({\n${shape}\n${' '.repeat(depth * baseIndent)}})`;
    }
    if (n.kind === 'array') {
      let ofSchema: string;
      if (n.itemSchema && typeof n.itemSchema === 'object') {
        ofSchema = fieldToYup(n.itemSchema as FieldNode, depth + 1);
      } else {
        const prim = typeof n.itemSchema === 'string' ? n.itemSchema : 'string';
        if (prim === 'number') ofSchema = 'yup.number()';
        else if (prim === 'boolean') ofSchema = 'yup.boolean()';
        else ofSchema = 'yup.string()';
      }
      let chain = `yup.array().of(${ofSchema})`;
      const v = n.validations.kind === 'array' ? n.validations.v : null;
      if (v?.required) chain += '\n  .required()';
      if (v?.min != null) chain += `\n  .min(${v.min})`;
      if (v?.max != null) chain += `\n  .max(${v.max})`;
      return indentChain(chain, idtInner);
    }
    return 'yup.mixed()';
  }

  let schemaBody: string;
  if (node.kind === 'object' && node.children?.length) {
    const shapeEntries = node.children
      .filter((c) => c.key !== 'root')
      .map((c) => {
        const s = fieldToYup(c, 0);
        return `${pad}${c.key}: ${s.replace(/\n/g, '\n' + pad)},`;
      });
    schemaBody = `yup.object({\n${shapeEntries.join('\n')}\n})`;
  } else if (node.kind === 'array') {
    schemaBody = fieldToYup(node, 0);
  } else {
    schemaBody = fieldToYup(node, 0);
  }

  if (options.language === 'typescript') {
    return `import * as yup from 'yup';\n\nconst schema = ${schemaBody};\n\nexport type InferType = yup.InferType<typeof schema>;\n\nexport default schema;`;
  }
  return `const yup = require('yup');\n\nconst schema = ${schemaBody};\n\nmodule.exports = schema;`;
}
