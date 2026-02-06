import { useState, useCallback, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JsonEditor } from '@/components/json/JsonEditor';
import { JsonTable } from '@/components/json/JsonTable';
import { ToolLayout } from '@/components/json/ToolLayout';
import { Toolbar } from '@/components/json/Toolbar';
import { StatusMessage } from '@/components/json/StatusMessage';
import { useTheme } from '@/hooks/use-theme';
import { useDebounce } from '@/hooks/use-debounce';
import { validateJSON, copyToClipboard } from '@/lib/json-utils';

const SAMPLE_JSON = `[
  { "id": 1, "name": "Alice", "email": "alice@example.com", "role": "Admin", "active": true },
  { "id": 2, "name": "Bob", "email": "bob@example.com", "role": "User", "active": true },
  { "id": 3, "name": "Charlie", "email": "charlie@example.com", "role": "User", "active": false },
  { "id": 4, "name": "Diana", "email": "diana@example.com", "role": "Moderator", "active": true }
]`;

export default function TablePage() {
  const { theme } = useTheme();
  const [input, setInput] = useState(SAMPLE_JSON);
  const [tableData, setTableData] = useState<unknown[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationInfo, setPaginationInfo] = useState<{ currentPage: number; totalPages: number; totalRows: number } | null>(null);

  const debouncedInput = useDebounce(input, 300);

  // Auto-parse on input change
  useEffect(() => {
    if (!debouncedInput.trim()) {
      setTableData([]);
      setError(null);
      return;
    }

    const validation = validateJSON(debouncedInput);
    if (!validation.valid) {
      setTableData([]);
      setError(validation.error?.message || 'Invalid JSON');
      return;
    }

    try {
      const parsed = JSON.parse(debouncedInput);
      if (!Array.isArray(parsed)) {
        setTableData([]);
        setError('JSON must be an array of objects to display as a table');
        return;
      }
      setTableData(parsed);
      setError(null);
    } catch {
      setTableData([]);
      setError('Failed to parse JSON');
    }
  }, [debouncedInput]);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(input);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [input]);

  const handlePaginationChange = useCallback((info: { currentPage: number; totalPages: number; totalRows: number }) => {
    setPaginationInfo(info);
  }, []);

  return (
    <MainLayout>
      <ToolLayout
        title="JSON to Table Converter"
        description="Convert array-based JSON into a responsive HTML table"
        toolbar={
          <Toolbar
            onCopy={handleCopy}
            copySuccess={copySuccess}
            validationStatus={error ? 'invalid' : tableData.length > 0 ? 'valid' : null}
          />
        }
        leftPanel={
          <JsonEditor
            value={input}
            onChange={setInput}
            theme={theme}
            height="100%"
          />
        }
        rightPanel={
          <div className="h-full flex flex-col">
            {error && (
              <StatusMessage type="error" message="Cannot Display Table" details={error} />
            )}
            <div className="flex-1 min-h-0 mt-2">
              {tableData.length > 0 ? (
                <JsonTable data={tableData} onPaginationChange={handlePaginationChange} />
              ) : !error && (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Enter an array of objects to see the table
                </div>
              )}
            </div>
          </div>
        }
        statusBar={
          paginationInfo && paginationInfo.totalRows > 0 && (
            <span>Page {paginationInfo.currentPage} of {paginationInfo.totalPages} ({paginationInfo.totalRows} total rows)</span>
          )
        }
      />
    </MainLayout>
  );
}
