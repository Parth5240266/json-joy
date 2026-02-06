import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isSensitiveKey } from '@/lib/json-utils';

interface JsonTableProps {
  data: unknown[];
  onPaginationChange?: (info: { currentPage: number; totalPages: number; totalRows: number }) => void;
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function JsonTable({ data, onPaginationChange }: JsonTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  // Pagination calculations
  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const paginatedRows = rows.slice(startIndex, endIndex);

  // Reset to page 1 when data or rowsPerPage changes
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Notify parent of pagination changes
  useMemo(() => {
    onPaginationChange?.({ currentPage, totalPages, totalRows });
  }, [currentPage, totalPages, totalRows, onPaginationChange]);

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

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
    <div className="h-full flex flex-col rounded-lg border border-border">
      {/* Scroll container for table */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto scrollbar-thin">
        <table className="w-full min-w-max caption-bottom text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-secondary/95 backdrop-blur-sm [&_tr]:border-b">
            <tr className="border-b transition-colors">
              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-12 font-mono text-xs whitespace-nowrap sticky left-0 z-20 bg-secondary/95">
                #
              </th>
              {headers.map((header) => (
                <th
                  key={header}
                  className={cn(
                    'h-12 px-4 text-left align-middle font-medium text-muted-foreground font-mono text-xs whitespace-nowrap',
                    isSensitiveKey(header) && 'sensitive-highlight'
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {paginatedRows.map((row, index) => (
              <tr 
                key={startIndex + index} 
                className="border-b transition-colors hover:bg-secondary/30"
              >
                <td className="p-4 align-middle text-center font-mono text-xs text-muted-foreground sticky left-0 bg-background/95">
                  {startIndex + index + 1}
                </td>
                {headers.map((header) => (
                  <td
                    key={header}
                    className={cn(
                      'p-4 align-middle font-mono text-xs max-w-[300px] truncate',
                      getValueClass(row[header], header)
                    )}
                    title={formatValue(row[header])}
                  >
                    {formatValue(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - fixed at bottom */}
      {totalRows > 0 && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-border bg-secondary/50 flex-shrink-0">
          {/* Rows per page selector */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground whitespace-nowrap">Rows per page:</span>
            <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
              <SelectTrigger className="w-[70px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page info */}
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Showing {startIndex + 1}-{endIndex} of {totalRows}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2 whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
