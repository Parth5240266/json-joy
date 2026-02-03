import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { isSensitiveKey } from '@/lib/json-utils';

interface JsonTableProps {
  data: unknown[];
}

export function JsonTable({ data }: JsonTableProps) {
  const { headers, rows } = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { headers: [], rows: [] };
    }

    const allHeaders = new Set<string>();
    data.forEach((item) => {
      if (item && typeof item === 'object') {
        Object.keys(item as Record<string, unknown>).forEach((key) => allHeaders.add(key));
      }
    });

    const headers = Array.from(allHeaders);
    const rows = data.map((item) => {
      if (!item || typeof item !== 'object') return {};
      return item as Record<string, unknown>;
    });

    return { headers, rows };
  }, [data]);

  if (headers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No tabular data to display. JSON must be an array of objects.
      </div>
    );
  }

  const formatValue = (value: unknown): string => {
    if (value === null) return 'null';
    if (value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getValueClass = (value: unknown, key: string): string => {
    const isSensitive = isSensitiveKey(key);
    
    if (isSensitive) return 'sensitive-highlight';
    if (value === null) return 'syntax-null';
    if (typeof value === 'boolean') return 'syntax-boolean';
    if (typeof value === 'number') return 'syntax-number';
    if (typeof value === 'string') return 'syntax-string';
    return '';
  };

  return (
    <div className="h-full overflow-auto scrollbar-thin rounded-lg border border-border">
      <Table>
        <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur-sm">
          <TableRow>
            <TableHead className="w-12 text-center font-mono text-xs">#</TableHead>
            {headers.map((header) => (
              <TableHead
                key={header}
                className={cn(
                  'font-mono text-xs whitespace-nowrap',
                  isSensitiveKey(header) && 'sensitive-highlight'
                )}
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index} className="hover:bg-secondary/30">
              <TableCell className="text-center font-mono text-xs text-muted-foreground">
                {index + 1}
              </TableCell>
              {headers.map((header) => (
                <TableCell
                  key={header}
                  className={cn(
                    'font-mono text-xs max-w-[300px] truncate',
                    getValueClass(row[header], header)
                  )}
                  title={formatValue(row[header])}
                >
                  {formatValue(row[header])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
