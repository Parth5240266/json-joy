import { useState, useCallback, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JsonEditor } from '@/components/json/JsonEditor';
import { ToolLayout } from '@/components/json/ToolLayout';
import { Toolbar } from '@/components/json/Toolbar';
import { StatusMessage } from '@/components/json/StatusMessage';
import { useTheme } from '@/hooks/use-theme';
import { useDebounce } from '@/hooks/use-debounce';
import { validateJSON, copyToClipboard } from '@/lib/json-utils';

const SAMPLE_JSON = `{
  "name": "Test JSON",
  "isValid": true
}`;

export default function ValidatorPage() {
  const { theme } = useTheme();
  const [input, setInput] = useState(SAMPLE_JSON);
  const [copySuccess, setCopySuccess] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const debouncedInput = useDebounce(input, 300);

  // Auto-validate on input change
  useEffect(() => {
    if (!debouncedInput.trim()) {
      setValidationResult(null);
      return;
    }

    const result = validateJSON(debouncedInput);
    if (result.valid) {
      setValidationResult({
        valid: true,
        message: 'Valid JSON',
        details: 'Your JSON is syntactically correct',
      });
    } else {
      setValidationResult({
        valid: false,
        message: 'Invalid JSON',
        details: result.error
          ? `${result.error.message}${result.error.line ? ` at Line ${result.error.line}, Column ${result.error.column}` : ''}`
          : 'Unknown error',
      });
    }
  }, [debouncedInput]);

  const handleValidate = useCallback(() => {
    const result = validateJSON(input);
    if (result.valid) {
      setValidationResult({
        valid: true,
        message: 'Valid JSON',
        details: 'Your JSON is syntactically correct',
      });
    } else {
      setValidationResult({
        valid: false,
        message: 'Invalid JSON',
        details: result.error
          ? `${result.error.message}${result.error.line ? ` at Line ${result.error.line}, Column ${result.error.column}` : ''}`
          : 'Unknown error',
      });
    }
  }, [input]);

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
        title="JSON Validator"
        description="Validate your JSON and get detailed error messages"
        toolbar={
          <Toolbar
            onValidate={handleValidate}
            onCopy={handleCopy}
            copySuccess={copySuccess}
            validationStatus={validationResult?.valid ? 'valid' : validationResult?.valid === false ? 'invalid' : null}
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
          <div className="h-full flex flex-col items-center justify-center p-8">
            {validationResult ? (
              <StatusMessage
                type={validationResult.valid ? 'success' : 'error'}
                message={validationResult.message}
                details={validationResult.details}
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">Enter JSON to validate</p>
                <p className="text-sm mt-2">Results will appear here</p>
              </div>
            )}
          </div>
        }
      />
    </MainLayout>
  );
}
