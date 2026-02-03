import { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { JsonEditor } from '@/components/json/JsonEditor';
import { JsonDiffViewer } from '@/components/json/JsonDiffViewer';
import { Toolbar, ToolbarButton } from '@/components/json/Toolbar';
import { StatusMessage } from '@/components/json/StatusMessage';
import { useTheme } from '@/hooks/use-theme';
import { compareJSON, DiffResult, validateJSON } from '@/lib/json-utils';
import { GitCompare, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const SAMPLE_LEFT = `{
  "name": "Project Alpha",
  "version": "1.0.0",
  "dependencies": {
    "react": "18.2.0",
    "typescript": "5.0.0"
  },
  "deprecated": true
}`;

const SAMPLE_RIGHT = `{
  "name": "Project Alpha",
  "version": "2.0.0",
  "dependencies": {
    "react": "18.3.0",
    "typescript": "5.0.0",
    "vite": "5.0.0"
  }
}`;

export default function DiffPage() {
  const { theme } = useTheme();
  const [leftInput, setLeftInput] = useState(SAMPLE_LEFT);
  const [rightInput, setRightInput] = useState(SAMPLE_RIGHT);
  const [differences, setDifferences] = useState<DiffResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasCompared, setHasCompared] = useState(false);

  const handleCompare = useCallback(() => {
    const leftValidation = validateJSON(leftInput);
    const rightValidation = validateJSON(rightInput);

    if (!leftValidation.valid) {
      setError(`Left JSON: ${leftValidation.error?.message}`);
      setDifferences([]);
      return;
    }

    if (!rightValidation.valid) {
      setError(`Right JSON: ${rightValidation.error?.message}`);
      setDifferences([]);
      return;
    }

    try {
      const diffs = compareJSON(leftInput, rightInput);
      setDifferences(diffs);
      setError(null);
      setHasCompared(true);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      setDifferences([]);
    }
  }, [leftInput, rightInput]);

  const handleReset = useCallback(() => {
    setLeftInput('');
    setRightInput('');
    setDifferences([]);
    setError(null);
    setHasCompared(false);
  }, []);

  const handleSwap = useCallback(() => {
    const temp = leftInput;
    setLeftInput(rightInput);
    setRightInput(temp);
    setDifferences([]);
    setHasCompared(false);
  }, [leftInput, rightInput]);

  return (
    <MainLayout>
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 px-6 py-4 border-b border-border"
        >
          <h1 className="text-xl font-semibold text-foreground">JSON Diff Checker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare two JSON objects and see the differences
          </p>
        </motion.div>

        {/* Toolbar */}
        <div className="flex-shrink-0 px-6 py-3 border-b border-border bg-secondary/30">
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarButton
              onClick={handleCompare}
              icon={<GitCompare className="h-4 w-4" />}
              label="Compare"
              variant="primary"
            />
            <ToolbarButton
              onClick={handleSwap}
              icon={<RotateCcw className="h-4 w-4" />}
              label="Swap"
            />
            <ToolbarButton
              onClick={handleReset}
              icon={<RotateCcw className="h-4 w-4" />}
              label="Reset"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          {/* Left Panel */}
          <div className="flex-1 min-h-0 flex flex-col p-4 lg:border-r border-border">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Original JSON
            </div>
            <div className="flex-1 min-h-0">
              <JsonEditor
                value={leftInput}
                onChange={setLeftInput}
                theme={theme}
                height="100%"
              />
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1 min-h-0 flex flex-col p-4 border-t lg:border-t-0 lg:border-r border-border">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Modified JSON
            </div>
            <div className="flex-1 min-h-0">
              <JsonEditor
                value={rightInput}
                onChange={setRightInput}
                theme={theme}
                height="100%"
              />
            </div>
          </div>

          {/* Diff Results */}
          <div className="flex-1 min-h-0 flex flex-col p-4 border-t lg:border-t-0 border-border">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Differences ({differences.length})
            </div>
            <div className="flex-1 min-h-0">
              {error && (
                <StatusMessage type="error" message="Comparison Error" details={error} />
              )}
              {!error && hasCompared && (
                <JsonDiffViewer differences={differences} />
              )}
              {!error && !hasCompared && (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Click "Compare" to see differences
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        {hasCompared && !error && (
          <div className="flex-shrink-0 px-6 py-2 border-t border-border bg-secondary/30 text-xs text-muted-foreground">
            Found {differences.length} difference{differences.length !== 1 ? 's' : ''} •
            Added: {differences.filter(d => d.type === 'added').length} •
            Removed: {differences.filter(d => d.type === 'removed').length} •
            Modified: {differences.filter(d => d.type === 'modified').length}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
