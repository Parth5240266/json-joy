import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Copy,
  Download,
  Check,
  AlertCircle,
  Wand2,
  Minimize2,
  FileCheck,
  Loader2,
} from 'lucide-react';

interface ToolbarButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
}

export function ToolbarButton({
  onClick,
  icon,
  label,
  variant = 'default',
  disabled = false,
  loading = false,
}: ToolbarButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      size="sm"
      variant={variant === 'primary' ? 'default' : 'outline'}
      className={cn(
        'gap-2',
        variant === 'success' && 'border-success text-success hover:bg-success/10',
        variant === 'destructive' && 'border-destructive text-destructive hover:bg-destructive/10'
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

interface ToolbarProps {
  onFormat?: () => void;
  onMinify?: () => void;
  onValidate?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  copySuccess?: boolean;
  validationStatus?: 'valid' | 'invalid' | 'pending' | null;
  disabled?: boolean;
  children?: ReactNode;
  indentation?: 2 | 4;
  onIndentationChange?: (value: 2 | 4) => void;
}

export function Toolbar({
  onFormat,
  onMinify,
  onValidate,
  onCopy,
  onDownload,
  copySuccess,
  validationStatus,
  disabled = false,
  children,
  indentation,
  onIndentationChange,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onFormat && (
        <ToolbarButton
          onClick={onFormat}
          icon={<Wand2 className="h-4 w-4" />}
          label="Format"
          variant="primary"
          disabled={disabled}
        />
      )}

      {onMinify && (
        <ToolbarButton
          onClick={onMinify}
          icon={<Minimize2 className="h-4 w-4" />}
          label="Minify"
          disabled={disabled}
        />
      )}

      {onValidate && (
        <ToolbarButton
          onClick={onValidate}
          icon={
            validationStatus === 'valid' ? (
              <Check className="h-4 w-4" />
            ) : validationStatus === 'invalid' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <FileCheck className="h-4 w-4" />
            )
          }
          label="Validate"
          variant={
            validationStatus === 'valid'
              ? 'success'
              : validationStatus === 'invalid'
              ? 'destructive'
              : 'default'
          }
          disabled={disabled}
        />
      )}

      {indentation !== undefined && onIndentationChange && (
        <div className="flex items-center gap-1 px-2">
          <span className="text-xs text-muted-foreground">Indent:</span>
          <Button
            size="sm"
            variant={indentation === 2 ? 'default' : 'ghost'}
            className="h-7 px-2 text-xs"
            onClick={() => onIndentationChange(2)}
          >
            2
          </Button>
          <Button
            size="sm"
            variant={indentation === 4 ? 'default' : 'ghost'}
            className="h-7 px-2 text-xs"
            onClick={() => onIndentationChange(4)}
          >
            4
          </Button>
        </div>
      )}

      <div className="flex-1" />

      {children}

      {onCopy && (
        <ToolbarButton
          onClick={onCopy}
          icon={copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          label={copySuccess ? 'Copied!' : 'Copy'}
          variant={copySuccess ? 'success' : 'default'}
          disabled={disabled}
        />
      )}

      {onDownload && (
        <ToolbarButton
          onClick={onDownload}
          icon={<Download className="h-4 w-4" />}
          label="Download"
          disabled={disabled}
        />
      )}
    </div>
  );
}
