import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { parseCurl, ParsedCurl } from '@/lib/curl-parser';
import { AlertCircle } from 'lucide-react';

interface CurlPasteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (parsed: ParsedCurl) => void;
}

export function CurlPasteDialog({ open, onOpenChange, onImport }: CurlPasteDialogProps) {
  const [curlText, setCurlText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    if (!curlText.trim()) {
      setError('Please paste a cURL command');
      return;
    }

    try {
      const parsed = parseCurl(curlText);
      
      if (!parsed.url) {
        setError('Could not extract URL from cURL command');
        return;
      }

      onImport(parsed);
      setCurlText('');
      setError(null);
      onOpenChange(false);
    } catch (e) {
      setError('Failed to parse cURL command');
    }
  };

  const handleClose = () => {
    setCurlText('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import from cURL</DialogTitle>
          <DialogDescription>
            Paste a cURL command to automatically extract the URL, headers, and request body.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            placeholder={`curl -X GET 'https://api.example.com/data' \\
  -H 'Authorization: Bearer token123' \\
  -H 'Content-Type: application/json'`}
            value={curlText}
            onChange={(e) => {
              setCurlText(e.target.value);
              setError(null);
            }}
            className="min-h-[200px] font-mono text-sm"
          />

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Supported options:</p>
            <ul className="list-disc list-inside ml-2">
              <li>-X, --request (HTTP method)</li>
              <li>-H, --header (Request headers)</li>
              <li>-d, --data, --data-raw (Request body)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
