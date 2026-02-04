import { useState, useCallback, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JsonEditor } from '@/components/json/JsonEditor';
import { ToolLayout } from '@/components/json/ToolLayout';
import { Toolbar, ToolbarButton } from '@/components/json/Toolbar';
import { StatusMessage } from '@/components/json/StatusMessage';
import { HeadersEditor, HeaderItem } from '@/components/json/HeadersEditor';
import { CurlPasteDialog } from '@/components/json/CurlPasteDialog';
import { useTheme } from '@/hooks/use-theme';
import { useDebounce } from '@/hooks/use-debounce';
import {
  validateJSON,
  copyToClipboard,
  downloadFile,
} from '@/lib/json-utils';
import { jsonToTypeScript, jsonToJavaScript, fetchJsonFromUrl } from '@/lib/code-generator';
import { ParsedCurl } from '@/lib/curl-parser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileType, Code, Globe, Loader2, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const SAMPLE_JSON = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "isActive": true,
  "roles": ["admin", "user"],
  "profile": {
    "age": 30,
    "avatar": "https://example.com/avatar.jpg"
  },
  "createdAt": "2024-01-15T10:30:00Z"
}`;

type OutputType = 'typescript' | 'javascript' | null;
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export default function CodeGeneratorPage() {
  const { theme } = useTheme();
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState('');
  const [outputType, setOutputType] = useState<OutputType>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<HeaderItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [interfaceName, setInterfaceName] = useState('Root');
  const [curlDialogOpen, setCurlDialogOpen] = useState(false);
  const [headersOpen, setHeadersOpen] = useState(false);

  const debouncedInput = useDebounce(input, 300);

  // Auto-validate on input change
  useEffect(() => {
    if (!debouncedInput.trim()) {
      setError(null);
      return;
    }

    const result = validateJSON(debouncedInput);
    if (!result.valid) {
      setError(result.error?.message || 'Invalid JSON');
    } else {
      setError(null);
    }
  }, [debouncedInput]);

  const handleCurlImport = useCallback((parsed: ParsedCurl) => {
    setUrl(parsed.url);
    setMethod((parsed.method as HttpMethod) || 'GET');
    
    // Convert parsed headers to HeaderItem format
    const newHeaders: HeaderItem[] = Object.entries(parsed.headers).map(([key, value]) => ({
      id: crypto.randomUUID(),
      key,
      value,
      enabled: true,
    }));
    setHeaders(newHeaders);
    
    // Auto-expand headers section if there are headers
    if (newHeaders.length > 0) {
      setHeadersOpen(true);
    }
  }, []);

  const handleFetchUrl = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      // Build headers object from enabled headers
      const requestHeaders: Record<string, string> = {};
      headers
        .filter((h) => h.enabled && h.key.trim())
        .forEach((h) => {
          requestHeaders[h.key.trim()] = h.value;
        });

      const result = await fetchJsonFromUrl(url, {
        method,
        headers: requestHeaders,
      });

      if (result.success && result.data) {
        setInput(JSON.stringify(result.data, null, 2));
        setOutput('');
        setOutputType(null);
      } else {
        setError(result.error || 'Failed to fetch JSON');
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setIsFetching(false);
    }
  }, [url, method, headers]);

  const handleGenerateTypeScript = useCallback(() => {
    const validation = validateJSON(input);
    if (!validation.valid) {
      setError(validation.error?.message || 'Invalid JSON');
      setOutput('');
      return;
    }

    try {
      const ts = jsonToTypeScript(input, interfaceName);
      setOutput(ts);
      setOutputType('typescript');
      setError(null);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      setOutput('');
    }
  }, [input, interfaceName]);

  const handleGenerateJavaScript = useCallback(() => {
    const validation = validateJSON(input);
    if (!validation.valid) {
      setError(validation.error?.message || 'Invalid JSON');
      setOutput('');
      return;
    }

    try {
      const js = jsonToJavaScript(input, interfaceName.toLowerCase());
      setOutput(js);
      setOutputType('javascript');
      setError(null);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      setOutput('');
    }
  }, [input, interfaceName]);

  const handleCopy = useCallback(async () => {
    const textToCopy = output || input;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [output, input]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const extension = outputType === 'typescript' ? 'ts' : 'js';
    const mimeType = 'text/plain';
    downloadFile(output, `generated.${extension}`, mimeType);
  }, [output, outputType]);

  const activeHeaderCount = headers.filter((h) => h.enabled && h.key.trim()).length;

  return (
    <MainLayout>
      <ToolLayout
        title="JSON Code Generator"
        description="Fetch JSON from URL with custom headers (like Postman) and generate TypeScript or JavaScript code"
        toolbar={
          <div className="flex flex-col gap-3">
            {/* URL and Method Row */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={method} onValueChange={(v) => setMethod(v as HttpMethod)}>
                <SelectTrigger className="w-24 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1 min-w-[200px]">
                <Input
                  type="url"
                  placeholder="https://api.example.com/data.json"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-9"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFetchUrl();
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleFetchUrl}
                disabled={isFetching}
                variant="default"
                size="sm"
                className="gap-2"
              >
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                Send
              </Button>

              <Button
                onClick={() => setCurlDialogOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Terminal className="h-4 w-4" />
                Paste cURL
              </Button>
            </div>

            {/* Headers Section (Collapsible) */}
            <Collapsible open={headersOpen} onOpenChange={setHeadersOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between h-8 px-2 text-sm font-normal"
                >
                  <span className="flex items-center gap-2">
                    Headers
                    {activeHeaderCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                        {activeHeaderCount}
                      </span>
                    )}
                  </span>
                  {headersOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <HeadersEditor headers={headers} onChange={setHeaders} />
              </CollapsibleContent>
            </Collapsible>

            {/* Generation Actions Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Interface name:</span>
                <Input
                  type="text"
                  placeholder="Root"
                  value={interfaceName}
                  onChange={(e) => setInterfaceName(e.target.value || 'Root')}
                  className="h-9 w-32"
                />
              </div>
              <ToolbarButton
                onClick={handleGenerateTypeScript}
                icon={<FileType className="h-4 w-4" />}
                label="TypeScript"
                variant="primary"
              />
              <ToolbarButton
                onClick={handleGenerateJavaScript}
                icon={<Code className="h-4 w-4" />}
                label="JavaScript"
                variant="primary"
              />
              <div className="flex-1" />
              <Toolbar
                onCopy={handleCopy}
                onDownload={output ? handleDownload : undefined}
                copySuccess={copySuccess}
                disabled={!output}
              />
            </div>
          </div>
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
          <div className="h-full flex flex-col gap-4">
            {error && (
              <StatusMessage type="error" message="Error" details={error} />
            )}
            {outputType && !error && (
              <StatusMessage
                type="success"
                message={`Generated ${outputType === 'typescript' ? 'TypeScript' : 'JavaScript'} code`}
              />
            )}
            <div className="flex-1 min-h-0">
              <JsonEditor
                value={output}
                readOnly
                theme={theme}
                height="100%"
                language={outputType === 'typescript' ? 'typescript' : outputType === 'javascript' ? 'javascript' : 'json'}
              />
            </div>
          </div>
        }
      />

      <CurlPasteDialog
        open={curlDialogOpen}
        onOpenChange={setCurlDialogOpen}
        onImport={handleCurlImport}
      />
    </MainLayout>
  );
}
