import { useState, useCallback, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JsonEditor } from '@/components/json/JsonEditor';
import { ToolLayout } from '@/components/json/ToolLayout';
import { YupSchemaBuilder } from '@/components/json/YupSchemaBuilder';
import { StatusMessage } from '@/components/json/StatusMessage';
import { Toolbar } from '@/components/json/Toolbar';
import { useTheme } from '@/hooks/use-theme';
import { useDebounce } from '@/hooks/use-debounce';
import { validateJSON, copyToClipboard, downloadFile } from '@/lib/json-utils';
import {
  analyzeJson,
  analyzeMultipleSamples,
  generateYupSchema,
  type FieldNode,
} from '@/lib/yup-schema-generator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileCode,
  Copy,
  Download,
  Upload,
  ShieldCheck,
} from 'lucide-react';

const SAMPLE_JSON = `{
  "age": 25,
  "email": "user@example.com",
  "name": "John Doe",
  "isActive": true,
  "score": 98.5,
  "website": "https://example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "tags": ["a", "b"],
  "profile": {
    "bio": "Hello",
    "avatar": "https://example.com/avatar.jpg"
  }
}`;

type OutputLang = 'typescript' | 'javascript';

export default function YupSchemaPage() {
  const { theme } = useTheme();
  const [input, setInput] = useState(SAMPLE_JSON);
  const [tree, setTree] = useState<FieldNode | null>(null);
  const [output, setOutput] = useState('');
  const [outputLang, setOutputLang] = useState<OutputLang>('typescript');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [samples, setSamples] = useState<unknown[]>([]);
  const [enhanceMode, setEnhanceMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedInput = useDebounce(input, 400);

  // Analyze JSON and build tree
  useEffect(() => {
    if (!debouncedInput.trim()) {
      setTree(null);
      setError(null);
      return;
    }
    const result = validateJSON(debouncedInput);
    if (!result.valid) {
      setError(result.error?.message ?? 'Invalid JSON');
      setTree(null);
      return;
    }
    setError(null);
    try {
      const data = JSON.parse(debouncedInput);
      if (enhanceMode && samples.length > 0) {
        const merged = analyzeMultipleSamples([data, ...samples]);
        setTree(merged);
      } else {
        setTree(analyzeJson(data));
      }
    } catch {
      setTree(null);
    }
  }, [debouncedInput, enhanceMode, samples]);

  // Regenerate schema when tree or output lang changes
  useEffect(() => {
    if (!tree) {
      setOutput('');
      return;
    }
    try {
      const code = generateYupSchema(tree, { language: outputLang });
      setOutput(code);
    } catch {
      setOutput('');
    }
  }, [tree, outputLang]);

  const handleNodeChange = useCallback((updated: FieldNode) => {
    setTree(updated);
  }, []);

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
    const ext = outputLang === 'typescript' ? 'ts' : 'js';
    downloadFile(output, `schema.${ext}`, 'text/plain');
  }, [output, outputLang]);

  const handleAddSample = useCallback(() => {
    const result = validateJSON(input);
    if (!result.valid) {
      setError(result.error?.message ?? 'Invalid JSON');
      return;
    }
    try {
      const data = JSON.parse(input);
      setSamples((prev) => [...prev, data]);
      setEnhanceMode(true);
    } catch {
      setError('Invalid JSON');
    }
  }, [input]);

  const handleClearSamples = useCallback(() => {
    setSamples([]);
    setEnhanceMode(false);
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      const toAdd: unknown[] = [];
      const reader = (file: File) => {
        return new Promise<void>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => {
            try {
              const text = r.result as string;
              const data = JSON.parse(text);
              toAdd.push(data);
            } catch {
              reject(new Error(`Invalid JSON in ${file.name}`));
              return;
            }
            resolve();
          };
          r.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          r.readAsText(file);
        });
      };
      (async () => {
        try {
          for (let i = 0; i < files.length; i++) {
            await reader(files[i]);
          }
          if (toAdd.length > 0) {
            setSamples((prev) => [...prev, ...toAdd]);
            setEnhanceMode(true);
          }
        } catch (err) {
          setError((err as Error).message);
        }
        e.target.value = '';
      })();
    },
    []
  );

  return (
    <MainLayout>
      <ToolLayout
        title="JSON to Yup Validation Schema"
        description="Paste JSON to detect field structure. Configure validations manually for each field in the tree and export as JavaScript or TypeScript."
        toolbar={
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={outputLang}
                onValueChange={(v) => setOutputLang(v as OutputLang)}
              >
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleAddSample}
                disabled={!!error || !input.trim()}
              >
                <Upload className="h-4 w-4" />
                Add as sample
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Upload JSON files
              </Button>
              {samples.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSamples}
                  className="text-muted-foreground"
                >
                  Clear {samples.length} sample{samples.length !== 1 ? 's' : ''}
                </Button>
              )}
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
          <div className="h-full flex flex-col gap-4">
            <div className="flex-1 min-h-0 flex flex-col">
              <JsonEditor
                value={input}
                onChange={setInput}
                theme={theme}
                height="100%"
                language="json"
              />
            </div>
            {error && (
              <StatusMessage type="error" message="Invalid JSON" details={error} />
            )}
            {samples.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Enhance mode: validations inferred from {samples.length + 1} sample(s).
              </p>
            )}
          </div>
        }
        rightPanel={
          <div className="h-full flex flex-col gap-4">
            <Tabs defaultValue="builder" className="flex-1 min-h-0 flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="builder" className="gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Fields & validations
                </TabsTrigger>
                <TabsTrigger value="output" className="gap-2">
                  <FileCode className="h-4 w-4" />
                  Schema code
                </TabsTrigger>
              </TabsList>
              <TabsContent value="builder" className="flex-1 min-h-0 mt-3">
                <div className="h-full overflow-auto">
                  <YupSchemaBuilder node={tree} onNodeChange={handleNodeChange} />
                </div>
              </TabsContent>
              <TabsContent value="output" className="flex-1 min-h-0 mt-3">
                <div className="h-full flex flex-col gap-2">
                  {output ? (
                    <div className="flex-1 min-h-0">
                      <JsonEditor
                        value={output}
                        readOnly
                        theme={theme}
                        height="100%"
                        language={outputLang === 'typescript' ? 'typescript' : 'javascript'}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 rounded-lg border border-border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
                      Enter valid JSON to generate Yup schema.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        }
      />
    </MainLayout>
  );
}
