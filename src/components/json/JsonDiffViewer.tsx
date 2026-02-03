import { DiffResult } from '@/lib/json-utils';
import { cn } from '@/lib/utils';
import { Plus, Minus, RefreshCw } from 'lucide-react';

interface JsonDiffViewerProps {
  differences: DiffResult[];
}

export function JsonDiffViewer({ differences }: JsonDiffViewerProps) {
  if (differences.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No differences found</p>
          <p className="text-xs mt-1">The two JSON objects are identical</p>
        </div>
      </div>
    );
  }

  const formatValue = (value: unknown): string => {
    if (value === undefined) return 'undefined';
    return JSON.stringify(value, null, 2);
  };

  return (
    <div className="h-full overflow-auto scrollbar-thin p-4 space-y-2">
      {differences.map((diff, index) => (
        <div
          key={index}
          className={cn(
            'p-3 rounded-lg border font-mono text-sm',
            diff.type === 'added' && 'diff-added border-diff-added/30',
            diff.type === 'removed' && 'diff-removed border-diff-removed/30',
            diff.type === 'modified' && 'diff-modified border-diff-modified/30'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            {diff.type === 'added' && <Plus className="h-4 w-4" />}
            {diff.type === 'removed' && <Minus className="h-4 w-4" />}
            {diff.type === 'modified' && <RefreshCw className="h-4 w-4" />}
            <span className="font-semibold">{diff.path}</span>
            <span className="text-xs opacity-70 capitalize">({diff.type})</span>
          </div>

          {diff.type === 'modified' && (
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-diff-removed-bg/50 border border-diff-removed/20">
                <span className="opacity-70">Old: </span>
                <pre className="whitespace-pre-wrap">{formatValue(diff.oldValue)}</pre>
              </div>
              <div className="p-2 rounded bg-diff-added-bg/50 border border-diff-added/20">
                <span className="opacity-70">New: </span>
                <pre className="whitespace-pre-wrap">{formatValue(diff.newValue)}</pre>
              </div>
            </div>
          )}

          {diff.type === 'added' && (
            <pre className="text-xs whitespace-pre-wrap opacity-80">
              {formatValue(diff.newValue)}
            </pre>
          )}

          {diff.type === 'removed' && (
            <pre className="text-xs whitespace-pre-wrap opacity-80">
              {formatValue(diff.oldValue)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
