import { useState, useCallback, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JsonEditor } from '@/components/json/JsonEditor';
import { JsonTreeViewer } from '@/components/json/JsonTreeViewer';
import { ToolLayout } from '@/components/json/ToolLayout';
import { Toolbar } from '@/components/json/Toolbar';
import { StatusMessage } from '@/components/json/StatusMessage';
import { useTheme } from '@/hooks/use-theme';
import { useDebounce } from '@/hooks/use-debounce';
import { validateJSON, copyToClipboard } from '@/lib/json-utils';

const SAMPLE_JSON = `{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secret123",
    "roles": ["admin", "user"],
    "settings": {
      "theme": "dark",
      "notifications": true
    }
  },
  "products": [
    { "id": 1, "name": "Widget", "price": 29.99 },
    { "id": 2, "name": "Gadget", "price": 49.99 }
  ],
  "metadata": {
    "api_key": "sk_live_abc123",
    "lastUpdated": null
  }
}`;

export default function ViewerPage() {
  const { theme } = useTheme();
  const [input, setInput] = useState(SAMPLE_JSON);
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedInput = useDebounce(input, 300);

  // Auto-parse on input change
  useEffect(() => {
    if (!debouncedInput.trim()) {
      setParsedData(null);
      setError(null);
      return;
    }

    const result = validateJSON(debouncedInput);
    if (result.valid) {
      try {
        setParsedData(JSON.parse(debouncedInput));
        setError(null);
      } catch {
        setParsedData(null);
      }
    } else {
      setParsedData(null);
      setError(result.error?.message || 'Invalid JSON');
    }
  }, [debouncedInput]);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(input);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [input]);

  return (
    <MainLayout>
      <ToolLayout
        title="JSON Viewer"
        description="View JSON as an interactive, collapsible tree with syntax highlighting"
        toolbar={
          <Toolbar
            onCopy={handleCopy}
            copySuccess={copySuccess}
            validationStatus={error ? 'invalid' : parsedData ? 'valid' : null}
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
              <StatusMessage type="error" message="Invalid JSON" details={error} />
            )}
            <div className="flex-1 min-h-0 mt-2">
              {parsedData ? (
                <JsonTreeViewer data={parsedData} />
              ) : !error && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Enter valid JSON to see the tree view
                </div>
              )}
            </div>
          </div>
        }
      />
    </MainLayout>
  );
}
