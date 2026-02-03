import { useState, useCallback, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JsonEditor } from '@/components/json/JsonEditor';
import { ToolLayout } from '@/components/json/ToolLayout';
import { Toolbar } from '@/components/json/Toolbar';
import { StatusMessage } from '@/components/json/StatusMessage';
import { useTheme } from '@/hooks/use-theme';
import { useDebounce } from '@/hooks/use-debounce';
import {
  formatJSON,
  minifyJSON,
  validateJSON,
  calculateSize,
  formatBytes,
  copyToClipboard,
  downloadFile,
} from '@/lib/json-utils';

const SAMPLE_JSON = `{
  "name": "JSON Tools",
  "version": "1.0.0",
  "description": "A powerful JSON utility toolkit",
  "features": [
    "Format",
    "Minify",
    "Validate",
    "Compare"
  ],
  "settings": {
    "theme": "dark",
    "indentation": 2
  }
}`;

export default function FormatterPage() {
  const { theme } = useTheme();
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState('');
  const [indentation, setIndentation] = useState<2 | 4>(2);
  const [copySuccess, setCopySuccess] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | 'pending' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sizeInfo, setSizeInfo] = useState<string>('');

  const debouncedInput = useDebounce(input, 300);

  // Auto-validate on input change
  useEffect(() => {
    if (!debouncedInput.trim()) {
      setValidationStatus(null);
      setError(null);
      return;
    }

    const result = validateJSON(debouncedInput);
    setValidationStatus(result.valid ? 'valid' : 'invalid');
    if (!result.valid && result.error) {
      setError(`${result.error.message}${result.error.line ? ` (Line ${result.error.line}, Column ${result.error.column})` : ''}`);
    } else {
      setError(null);
    }
  }, [debouncedInput]);

  const handleFormat = useCallback(() => {
    try {
      const formatted = formatJSON(input, indentation);
      setOutput(formatted);
      const size = calculateSize(input, formatted);
      setSizeInfo(`Original: ${formatBytes(size.original)} → Formatted: ${formatBytes(size.processed)}`);
      setError(null);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      setOutput('');
    }
  }, [input, indentation]);

  const handleMinify = useCallback(() => {
    try {
      const minified = minifyJSON(input);
      setOutput(minified);
      const size = calculateSize(input, minified);
      setSizeInfo(`Original: ${formatBytes(size.original)} → Minified: ${formatBytes(size.processed)} (${size.savingsPercent.toFixed(1)}% smaller)`);
      setError(null);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      setOutput('');
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    const result = validateJSON(input);
    setValidationStatus(result.valid ? 'valid' : 'invalid');
    if (!result.valid && result.error) {
      setError(`${result.error.message}${result.error.line ? ` (Line ${result.error.line}, Column ${result.error.column})` : ''}`);
    } else {
      setError(null);
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    const textToCopy = output || input;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [output, input]);

  const handleDownload = useCallback(() => {
    const content = output || input;
    downloadFile(content, 'formatted.json', 'application/json');
  }, [output, input]);

  return (
    <MainLayout>
      <ToolLayout
        title="JSON Formatter & Beautifier"
        description="Format and beautify your JSON with customizable indentation"
        toolbar={
          <Toolbar
            onFormat={handleFormat}
            onMinify={handleMinify}
            onValidate={handleValidate}
            onCopy={handleCopy}
            onDownload={handleDownload}
            copySuccess={copySuccess}
            validationStatus={validationStatus}
            indentation={indentation}
            onIndentationChange={setIndentation}
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
          <div className="h-full flex flex-col gap-4">
            {error && (
              <StatusMessage type="error" message="Invalid JSON" details={error} />
            )}
            {validationStatus === 'valid' && !error && output && (
              <StatusMessage type="success" message="Valid JSON" details={sizeInfo} />
            )}
            <div className="flex-1 min-h-0">
              <JsonEditor
                value={output}
                readOnly
                theme={theme}
                height="100%"
              />
            </div>
          </div>
        }
        statusBar={sizeInfo && <span>{sizeInfo}</span>}
      />
    </MainLayout>
  );
}
