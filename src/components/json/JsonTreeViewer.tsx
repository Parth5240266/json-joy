import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isSensitiveKey } from '@/lib/json-utils';

interface JsonTreeViewerProps {
  data: unknown;
  initialExpanded?: boolean;
}

interface TreeNodeProps {
  nodeKey: string;
  value: unknown;
  depth: number;
  isLast: boolean;
  defaultExpanded?: boolean;
}

function TreeNode({ nodeKey, value, depth, isLast, defaultExpanded = true }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded && depth < 2);
  
  const isSensitive = isSensitiveKey(nodeKey);
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  
  const valueType = useMemo(() => {
    if (value === null) return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'string';
    if (isArray) return 'array';
    return 'object';
  }, [value, isArray]);

  const renderValue = () => {
    if (isObject) {
      const items = isArray ? value : Object.entries(value as Record<string, unknown>);
      const count = isArray ? (value as unknown[]).length : Object.keys(value as object).length;
      
      return (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-0.5 hover:bg-secondary/50 rounded px-0.5 -ml-0.5"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="syntax-bracket">{isArray ? '[' : '{'}</span>
          </button>
          
          {!expanded && (
            <span className="text-muted-foreground text-sm ml-1">
              {count} {isArray ? 'items' : 'keys'}
            </span>
          )}
          
          {!expanded && <span className="syntax-bracket">{isArray ? ']' : '}'}</span>}
          
          {expanded && (
            <div className="ml-4 border-l border-border/50 pl-2">
              {isArray
                ? (value as unknown[]).map((item, index) => (
                    <TreeNode
                      key={index}
                      nodeKey={String(index)}
                      value={item}
                      depth={depth + 1}
                      isLast={index === (value as unknown[]).length - 1}
                      defaultExpanded={depth < 1}
                    />
                  ))
                : Object.entries(value as Record<string, unknown>).map(([k, v], index, arr) => (
                    <TreeNode
                      key={k}
                      nodeKey={k}
                      value={v}
                      depth={depth + 1}
                      isLast={index === arr.length - 1}
                      defaultExpanded={depth < 1}
                    />
                  ))}
              <span className="syntax-bracket">{isArray ? ']' : '}'}</span>
            </div>
          )}
        </>
      );
    }

    // Primitive values
    const valueClasses = cn(
      'font-mono',
      valueType === 'string' && 'syntax-string',
      valueType === 'number' && 'syntax-number',
      valueType === 'boolean' && 'syntax-boolean',
      valueType === 'null' && 'syntax-null',
      isSensitive && 'sensitive-highlight'
    );

    if (valueType === 'string') {
      return <span className={valueClasses}>"{String(value)}"</span>;
    }
    return <span className={valueClasses}>{String(value)}</span>;
  };

  return (
    <div className="py-0.5 font-mono text-sm leading-relaxed">
      {!isArray || depth > 0 ? (
        <>
          <span className={cn('syntax-key', isSensitive && 'sensitive-highlight')}>
            "{nodeKey}"
          </span>
          <span className="text-muted-foreground">: </span>
        </>
      ) : null}
      {renderValue()}
      {!isLast && !isObject && <span className="text-muted-foreground">,</span>}
    </div>
  );
}

export function JsonTreeViewer({ data, initialExpanded = true }: JsonTreeViewerProps) {
  if (data === null || data === undefined) {
    return (
      <div className="p-4 text-muted-foreground text-sm">
        No data to display
      </div>
    );
  }

  return (
    <div className="p-4 font-mono text-sm overflow-auto scrollbar-thin h-full bg-card rounded-lg border border-border">
      <TreeNode
        nodeKey="root"
        value={data}
        depth={0}
        isLast={true}
        defaultExpanded={initialExpanded}
      />
    </div>
  );
}
