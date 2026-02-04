import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export interface HeaderItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface HeadersEditorProps {
  headers: HeaderItem[];
  onChange: (headers: HeaderItem[]) => void;
}

export function HeadersEditor({ headers, onChange }: HeadersEditorProps) {
  const addHeader = () => {
    onChange([
      ...headers,
      { id: crypto.randomUUID(), key: '', value: '', enabled: true },
    ]);
  };

  const updateHeader = (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    onChange(
      headers.map((h) =>
        h.id === id ? { ...h, [field]: value } : h
      )
    );
  };

  const removeHeader = (id: string) => {
    onChange(headers.filter((h) => h.id !== id));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Headers</span>
        <div className="flex items-center gap-1">
          {headers.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={addHeader}
            className="h-7 px-2 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {headers.length === 0 ? (
        <div className="text-xs text-muted-foreground py-2 text-center border border-dashed border-border rounded-md">
          No headers. Click "Add" to add custom headers.
        </div>
      ) : (
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {headers.map((header) => (
            <div
              key={header.id}
              className={`flex items-center gap-2 ${!header.enabled ? 'opacity-50' : ''}`}
            >
              <Switch
                checked={header.enabled}
                onCheckedChange={(checked) => updateHeader(header.id, 'enabled', checked)}
                className="scale-75"
              />
              <Input
                placeholder="Header name"
                value={header.key}
                onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                className="h-8 text-sm flex-1"
              />
              <Input
                placeholder="Value"
                value={header.value}
                onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                className="h-8 text-sm flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeHeader(header.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
