import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JsonEditor } from '@/components/json/JsonEditor';
import { ToolLayout } from '@/components/json/ToolLayout';
import { Toolbar, ToolbarButton } from '@/components/json/Toolbar';
import { StatusMessage } from '@/components/json/StatusMessage';
import { useTheme } from '@/hooks/use-theme';
import {
  jsonToCSV,
  jsonToXML,
  validateJSON,
  copyToClipboard,
  downloadFile,
  formatBytes,
  calculateSize,
} from '@/lib/json-utils';
import { FileSpreadsheet, FileCode } from 'lucide-react';

const SAMPLE_JSON = `[
  { "id": 1, "name": "Widget", "price": 29.99, "category": "Electronics" },
  { "id": 2, "name": "Gadget", "price": 49.99, "category": "Electronics" },
  { "id": 3, "name": "Tool", "price": 19.99, "category": "Hardware" }
]`;

type ConversionType = 'csv' | 'xml';

export default function ConverterPage() {
  const { theme } = useTheme();
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState('');
  const [conversionType, setConversionType] = useState<ConversionType | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sizeInfo, setSizeInfo] = useState<string>('');

  const handleConvertToCSV = useCallback(() => {
    const validation = validateJSON(input);
    if (!validation.valid) {
      setError(validation.error?.message || 'Invalid JSON');
      setOutput('');
      return;
    }

    try {
      const csv = jsonToCSV(input);
      setOutput(csv);
      setConversionType('csv');
      setError(null);
      const size = calculateSize(input, csv);
      setSizeInfo(`JSON: ${formatBytes(size.original)} → CSV: ${formatBytes(size.processed)}`);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      setOutput('');
    }
  }, [input]);

  const handleConvertToXML = useCallback(() => {
    const validation = validateJSON(input);
    if (!validation.valid) {
      setError(validation.error?.message || 'Invalid JSON');
      setOutput('');
      return;
    }

    try {
      const xml = jsonToXML(input, 'data');
      setOutput(xml);
      setConversionType('xml');
      setError(null);
      const size = calculateSize(input, xml);
      setSizeInfo(`JSON: ${formatBytes(size.original)} → XML: ${formatBytes(size.processed)}`);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      setOutput('');
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
    if (!output) return;
    const extension = conversionType === 'csv' ? 'csv' : 'xml';
    const mimeType = conversionType === 'csv' ? 'text/csv' : 'application/xml';
    downloadFile(output, `converted.${extension}`, mimeType);
  }, [output, conversionType]);

  return (
    <MainLayout>
      <ToolLayout
        title="JSON Converter"
        description="Convert JSON to CSV or XML format"
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarButton
              onClick={handleConvertToCSV}
              icon={<FileSpreadsheet className="h-4 w-4" />}
              label="To CSV"
              variant="primary"
            />
            <ToolbarButton
              onClick={handleConvertToXML}
              icon={<FileCode className="h-4 w-4" />}
              label="To XML"
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
              <StatusMessage type="error" message="Conversion Error" details={error} />
            )}
            {conversionType && !error && (
              <StatusMessage
                type="success"
                message={`Converted to ${conversionType.toUpperCase()}`}
                details={sizeInfo}
              />
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
