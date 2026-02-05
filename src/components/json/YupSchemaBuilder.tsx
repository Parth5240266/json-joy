import { useState } from 'react';
import { ChevronRight, ChevronDown, Type, Plus, X, Hash, ToggleLeft, Calendar, List, Braces, AlignLeft, Mail, Link2, ShieldCheck, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FieldNode,
  FieldValidations,
  updateNodeAtPath,
} from '@/lib/yup-schema-generator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface YupSchemaBuilderProps {
  node: FieldNode | null;
  onNodeChange: (updated: FieldNode) => void;
}

// Type icons mapping
const typeIcons: Record<string, React.ReactNode> = {
  string: <AlignLeft className="h-3 w-3" />,
  number: <Hash className="h-3 w-3" />,
  boolean: <ToggleLeft className="h-3 w-3" />,
  date: <Calendar className="h-3 w-3" />,
  array: <List className="h-3 w-3" />,
  object: <Braces className="h-3 w-3" />,
};

// Type colors mapping
const typeColors: Record<string, string> = {
  string: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  number: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  boolean: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
  date: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  array: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30',
  object: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
};

// Validation chip component
function ValidationChip({
  label,
  onRemove,
  children,
  variant = 'default',
}: {
  label: string;
  onRemove: () => void;
  children?: React.ReactNode;
  variant?: 'default' | 'required' | 'constraint';
}) {
  const variantStyles = {
    default: 'bg-secondary/80 hover:bg-secondary text-secondary-foreground border-border/50',
    required: 'bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30',
    constraint: 'bg-primary/10 hover:bg-primary/15 text-primary border-primary/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-all duration-200 animate-scale-in',
        variantStyles[variant]
      )}
    >
      {children ? (
        <>
          <span className="text-muted-foreground">{label}</span>
          {children}
        </>
      ) : (
        <span>{label}</span>
      )}
      <button
        onClick={onRemove}
        className="ml-0.5 hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// Number input for validation values
function ValidationInput({
  type = 'number',
  value,
  onChange,
  className,
}: {
  type?: 'number' | 'date';
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Input
      type={type}
      className={cn(
        'h-6 text-xs px-2 py-0 border-0 bg-background/60 rounded font-mono focus:ring-1 focus:ring-primary/50',
        type === 'number' ? 'w-14' : 'w-28',
        className
      )}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function ValidationEditorNew({
  path,
  kind,
  validations,
  onUpdate,
}: {
  path: string;
  kind: string;
  validations: FieldValidations;
  onUpdate: (updater: (n: FieldNode) => void) => void;
}) {
  // Get available validation options based on field kind
  const getAvailableOptions = () => {
    if (kind === 'string' && validations.kind === 'string') {
      const v = validations.v;
      const options = [];
      if (!v.required) options.push({ key: 'required', label: 'Required' });
      if (v.minLength === undefined) options.push({ key: 'minLength', label: 'Min Length' });
      if (v.maxLength === undefined) options.push({ key: 'maxLength', label: 'Max Length' });
      if (!v.email) options.push({ key: 'email', label: 'Email' });
      if (!v.url) options.push({ key: 'url', label: 'URL' });
      return options;
    }
    if (kind === 'number' && validations.kind === 'number') {
      const v = validations.v;
      const options = [];
      if (!v.required) options.push({ key: 'required', label: 'Required' });
      if (v.min === undefined) options.push({ key: 'min', label: 'Min Value' });
      if (v.max === undefined) options.push({ key: 'max', label: 'Max Value' });
      if (!v.integer) options.push({ key: 'integer', label: 'Integer' });
      if (!v.positive) options.push({ key: 'positive', label: 'Positive' });
      if (!v.negative) options.push({ key: 'negative', label: 'Negative' });
      return options;
    }
    if (kind === 'boolean' && validations.kind === 'boolean') {
      const v = validations.v;
      const options = [];
      if (!v.required) options.push({ key: 'required', label: 'Required' });
      return options;
    }
    if (kind === 'array' && validations.kind === 'array') {
      const v = validations.v;
      const options = [];
      if (!v.required) options.push({ key: 'required', label: 'Required' });
      if (v.min === undefined) options.push({ key: 'min', label: 'Min Items' });
      if (v.max === undefined) options.push({ key: 'max', label: 'Max Items' });
      return options;
    }
    if (kind === 'object' && validations.kind === 'object') {
      const v = validations.v;
      const options = [];
      if (!v.required) options.push({ key: 'required', label: 'Required' });
      return options;
    }
    if (kind === 'date' && validations.kind === 'date') {
      const v = validations.v;
      const options = [];
      if (!v.required) options.push({ key: 'required', label: 'Required' });
      if (v.min === undefined) options.push({ key: 'min', label: 'Min Date' });
      if (v.max === undefined) options.push({ key: 'max', label: 'Max Date' });
      return options;
    }
    return [];
  };

  const availableOptions = getAvailableOptions();
  const hasConfiguredValidations = () => {
    if (kind === 'string' && validations.kind === 'string') {
      const v = validations.v;
      return v.required || v.minLength !== undefined || v.maxLength !== undefined || v.email || v.url;
    }
    if (kind === 'number' && validations.kind === 'number') {
      const v = validations.v;
      return v.required || v.min !== undefined || v.max !== undefined || v.integer || v.positive || v.negative;
    }
    if (kind === 'boolean' && validations.kind === 'boolean') {
      return validations.v.required;
    }
    if (kind === 'array' && validations.kind === 'array') {
      const v = validations.v;
      return v.required || v.min !== undefined || v.max !== undefined;
    }
    if (kind === 'object' && validations.kind === 'object') {
      return validations.v.required;
    }
    if (kind === 'date' && validations.kind === 'date') {
      const v = validations.v;
      return v.required || v.min !== undefined || v.max !== undefined;
    }
    return false;
  };

  const handleAddValidation = (optionKey: string) => {
    if (kind === 'string' && validations.kind === 'string') {
      onUpdate((n) => {
        if (n.validations.kind === 'string') {
          if (optionKey === 'required') n.validations.v.required = true;
          else if (optionKey === 'minLength') n.validations.v.minLength = 0;
          else if (optionKey === 'maxLength') n.validations.v.maxLength = 100;
          else if (optionKey === 'email') n.validations.v.email = true;
          else if (optionKey === 'url') n.validations.v.url = true;
        }
      });
    } else if (kind === 'number' && validations.kind === 'number') {
      onUpdate((n) => {
        if (n.validations.kind === 'number') {
          if (optionKey === 'required') n.validations.v.required = true;
          else if (optionKey === 'min') n.validations.v.min = 0;
          else if (optionKey === 'max') n.validations.v.max = 100;
          else if (optionKey === 'integer') n.validations.v.integer = true;
          else if (optionKey === 'positive') n.validations.v.positive = true;
          else if (optionKey === 'negative') n.validations.v.negative = true;
        }
      });
    } else if (kind === 'boolean' && validations.kind === 'boolean') {
      if (optionKey === 'required') {
        onUpdate((n) => {
          if (n.validations.kind === 'boolean') n.validations.v.required = true;
        });
      }
    } else if (kind === 'array' && validations.kind === 'array') {
      onUpdate((n) => {
        if (n.validations.kind === 'array') {
          if (optionKey === 'required') n.validations.v.required = true;
          else if (optionKey === 'min') n.validations.v.min = 0;
          else if (optionKey === 'max') n.validations.v.max = 100;
        }
      });
    } else if (kind === 'object' && validations.kind === 'object') {
      if (optionKey === 'required') {
        onUpdate((n) => {
          if (n.validations.kind === 'object') n.validations.v.required = true;
        });
      }
    } else if (kind === 'date' && validations.kind === 'date') {
      onUpdate((n) => {
        if (n.validations.kind === 'date') {
          if (optionKey === 'required') n.validations.v.required = true;
          else if (optionKey === 'min') n.validations.v.min = new Date().toISOString();
          else if (optionKey === 'max') n.validations.v.max = new Date().toISOString();
        }
      });
    }
  };

  // Render configured validations
  const renderConfiguredValidations = () => {
    if (kind === 'string' && validations.kind === 'string') {
      const v = validations.v;
      return (
        <>
          {v.required && (
            <ValidationChip
              label="Required"
              variant="required"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'string') n.validations.v.required = false;
                })
              }
            />
          )}
          {v.minLength !== undefined && (
            <ValidationChip
              label="min:"
              variant="constraint"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'string') n.validations.v.minLength = undefined;
                })
              }
            >
              <ValidationInput
                value={v.minLength}
                onChange={(val) => {
                  const parsed = val ? parseInt(val, 10) : undefined;
                  onUpdate((n) => {
                    if (n.validations.kind === 'string') n.validations.v.minLength = parsed;
                  });
                }}
              />
            </ValidationChip>
          )}
          {v.maxLength !== undefined && (
            <ValidationChip
              label="max:"
              variant="constraint"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'string') n.validations.v.maxLength = undefined;
                })
              }
            >
              <ValidationInput
                value={v.maxLength}
                onChange={(val) => {
                  const parsed = val ? parseInt(val, 10) : undefined;
                  onUpdate((n) => {
                    if (n.validations.kind === 'string') n.validations.v.maxLength = parsed;
                  });
                }}
              />
            </ValidationChip>
          )}
          {v.email && (
            <ValidationChip
              label="Email"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'string') n.validations.v.email = false;
                })
              }
            />
          )}
          {v.url && (
            <ValidationChip
              label="URL"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'string') n.validations.v.url = false;
                })
              }
            />
          )}
        </>
      );
    }
    if (kind === 'number' && validations.kind === 'number') {
      const v = validations.v;
      return (
        <>
          {v.required && (
            <ValidationChip
              label="Required"
              variant="required"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'number') n.validations.v.required = false;
                })
              }
            />
          )}
          {v.min !== undefined && (
            <ValidationChip
              label="min:"
              variant="constraint"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'number') n.validations.v.min = undefined;
                })
              }
            >
              <ValidationInput
                value={v.min}
                onChange={(val) => {
                  const parsed = val === '' ? undefined : parseFloat(val);
                  onUpdate((n) => {
                    if (n.validations.kind === 'number') n.validations.v.min = parsed;
                  });
                }}
              />
            </ValidationChip>
          )}
          {v.max !== undefined && (
            <ValidationChip
              label="max:"
              variant="constraint"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'number') n.validations.v.max = undefined;
                })
              }
            >
              <ValidationInput
                value={v.max}
                onChange={(val) => {
                  const parsed = val === '' ? undefined : parseFloat(val);
                  onUpdate((n) => {
                    if (n.validations.kind === 'number') n.validations.v.max = parsed;
                  });
                }}
              />
            </ValidationChip>
          )}
          {v.integer && (
            <ValidationChip
              label="Integer"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'number') n.validations.v.integer = false;
                })
              }
            />
          )}
          {v.positive && (
            <ValidationChip
              label="Positive"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'number') {
                    n.validations.v.positive = false;
                  }
                })
              }
            />
          )}
          {v.negative && (
            <ValidationChip
              label="Negative"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'number') {
                    n.validations.v.negative = false;
                  }
                })
              }
            />
          )}
        </>
      );
    }
    if (kind === 'boolean' && validations.kind === 'boolean') {
      const v = validations.v;
      return (
        <>
          {v.required && (
            <ValidationChip
              label="Required"
              variant="required"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'boolean') n.validations.v.required = false;
                })
              }
            />
          )}
        </>
      );
    }
    if (kind === 'array' && validations.kind === 'array') {
      const v = validations.v;
      return (
        <>
          {v.required && (
            <ValidationChip
              label="Required"
              variant="required"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'array') n.validations.v.required = false;
                })
              }
            />
          )}
          {v.min !== undefined && (
            <ValidationChip
              label="min:"
              variant="constraint"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'array') n.validations.v.min = undefined;
                })
              }
            >
              <ValidationInput
                value={v.min}
                onChange={(val) => {
                  const parsed = val ? parseInt(val, 10) : undefined;
                  onUpdate((n) => {
                    if (n.validations.kind === 'array') n.validations.v.min = parsed;
                  });
                }}
              />
            </ValidationChip>
          )}
          {v.max !== undefined && (
            <ValidationChip
              label="max:"
              variant="constraint"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'array') n.validations.v.max = undefined;
                })
              }
            >
              <ValidationInput
                value={v.max}
                onChange={(val) => {
                  const parsed = val ? parseInt(val, 10) : undefined;
                  onUpdate((n) => {
                    if (n.validations.kind === 'array') n.validations.v.max = parsed;
                  });
                }}
              />
            </ValidationChip>
          )}
        </>
      );
    }
    if (kind === 'object' && validations.kind === 'object') {
      const v = validations.v;
      return (
        <>
          {v.required && (
            <ValidationChip
              label="Required"
              variant="required"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'object') n.validations.v.required = false;
                })
              }
            />
          )}
        </>
      );
    }
    if (kind === 'date' && validations.kind === 'date') {
      const v = validations.v;
      return (
        <>
          {v.required && (
            <ValidationChip
              label="Required"
              variant="required"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'date') n.validations.v.required = false;
                })
              }
            />
          )}
          {v.min !== undefined && (
            <ValidationChip
              label="after:"
              variant="constraint"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'date') n.validations.v.min = undefined;
                })
              }
            >
              <ValidationInput
                type="date"
                value={v.min ? new Date(v.min).toISOString().slice(0, 10) : ''}
                onChange={(val) => {
                  const parsed = val ? new Date(val + 'T00:00:00Z').toISOString() : undefined;
                  onUpdate((n) => {
                    if (n.validations.kind === 'date') n.validations.v.min = parsed;
                  });
                }}
              />
            </ValidationChip>
          )}
          {v.max !== undefined && (
            <ValidationChip
              label="before:"
              variant="constraint"
              onRemove={() =>
                onUpdate((n) => {
                  if (n.validations.kind === 'date') n.validations.v.max = undefined;
                })
              }
            >
              <ValidationInput
                type="date"
                value={v.max ? new Date(v.max).toISOString().slice(0, 10) : ''}
                onChange={(val) => {
                  const parsed = val ? new Date(val + 'T00:00:00Z').toISOString() : undefined;
                  onUpdate((n) => {
                    if (n.validations.kind === 'date') n.validations.v.max = parsed;
                  });
                }}
              />
            </ValidationChip>
          )}
        </>
      );
    }
    return null;
  };

  const configured = hasConfiguredValidations();

  if (!configured) return null;

  return (
    <div className="flex flex-wrap gap-1.5">{renderConfiguredValidations()}</div>
  );
}

function AddValidationButton({
  availableOptions,
  onAdd,
}: {
  availableOptions: Array<{ key: string; label: string }>;
  onAdd: (key: string) => void;
}) {
  if (availableOptions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 p-1">
        {availableOptions.map((option) => (
          <DropdownMenuItem
            key={option.key}
            onClick={() => onAdd(option.key)}
            className="cursor-pointer rounded-md"
          >
            {option.key === 'required' && <ShieldCheck className="h-3.5 w-3.5 mr-2 text-destructive" />}
            {(option.key === 'min' || option.key === 'max' || option.key === 'minLength' || option.key === 'maxLength') && (
              <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-primary" />
            )}
            {option.key === 'email' && <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />}
            {option.key === 'url' && <Link2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />}
            {option.key === 'integer' && <Hash className="h-3.5 w-3.5 mr-2 text-muted-foreground" />}
            {(option.key === 'positive' || option.key === 'negative') && (
              <span className="h-3.5 w-3.5 mr-2 text-xs font-mono text-muted-foreground flex items-center justify-center">
                {option.key === 'positive' ? '+' : '−'}
              </span>
            )}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FieldTreeNode({
  node,
  path,
  rootNode,
  onRootChange,
  depth,
}: {
  node: FieldNode;
  path: string;
  rootNode: FieldNode;
  onRootChange: (updated: FieldNode) => void;
  depth: number;
}) {
  const [open, setOpen] = useState(depth < 2);
  const isRoot = node.key === 'root';
  const displayKey = isRoot ? '(root)' : node.key;
  const hasChildren =
    (node.kind === 'object' && node.children && node.children.length > 0) ||
    (node.kind === 'array' && node.itemSchema && typeof node.itemSchema === 'object');

  const handleUpdate = (updater: (n: FieldNode) => void) => {
    const updated = updateNodeAtPath(rootNode, path, updater);
    onRootChange(updated);
  };

  // Get available validation options
  const getAvailableOptions = () => {
    const kind = node.kind;
    const validations = node.validations;
    if (kind === 'string' && validations.kind === 'string') {
      const v = validations.v;
      const options = [];
      if (!v.required) options.push({ key: 'required', label: 'Required' });
      if (v.minLength === undefined) options.push({ key: 'minLength', label: 'Min Length' });
      if (v.maxLength === undefined) options.push({ key: 'maxLength', label: 'Max Length' });
      if (!v.email) options.push({ key: 'email', label: 'Email' });
      if (!v.url) options.push({ key: 'url', label: 'URL' });
      return options;
    }
    if (kind === 'number' && validations.kind === 'number') {
      const v = validations.v;
      const options = [];
      if (!v.required) options.push({ key: 'required', label: 'Required' });
      if (v.min === undefined) options.push({ key: 'min', label: 'Min Value' });
      if (v.max === undefined) options.push({ key: 'max', label: 'Max Value' });
      if (!v.integer) options.push({ key: 'integer', label: 'Integer' });
      if (!v.positive) options.push({ key: 'positive', label: 'Positive' });
      if (!v.negative) options.push({ key: 'negative', label: 'Negative' });
      return options;
    }
    if (kind === 'boolean' && validations.kind === 'boolean') {
      const v = validations.v;
      const options = [];
      if (!v.required) options.push({ key: 'required', label: 'Required' });
      return options;
    }
    if (kind === 'array' && validations.kind === 'array') {
      const v = validations.v;
      const options = [];
      if (!v.required) options.push({ key: 'required', label: 'Required' });
      if (v.min === undefined) options.push({ key: 'min', label: 'Min Items' });
      if (v.max === undefined) options.push({ key: 'max', label: 'Max Items' });
      return options;
    }
    if (kind === 'object' && validations.kind === 'object') {
      const v = validations.v;
      const options = [];
      if (!v.required) options.push({ key: 'required', label: 'Required' });
      return options;
    }
    if (kind === 'date' && validations.kind === 'date') {
      const v = validations.v;
      const options = [];
      if (!v.required) options.push({ key: 'required', label: 'Required' });
      if (v.min === undefined) options.push({ key: 'min', label: 'Min Date' });
      if (v.max === undefined) options.push({ key: 'max', label: 'Max Date' });
      return options;
    }
    return [];
  };

  const handleAddValidation = (optionKey: string) => {
    if (node.kind === 'string' && node.validations.kind === 'string') {
      handleUpdate((n) => {
        if (n.validations.kind === 'string') {
          if (optionKey === 'required') n.validations.v.required = true;
          else if (optionKey === 'minLength') n.validations.v.minLength = 0;
          else if (optionKey === 'maxLength') n.validations.v.maxLength = 100;
          else if (optionKey === 'email') n.validations.v.email = true;
          else if (optionKey === 'url') n.validations.v.url = true;
        }
      });
    } else if (node.kind === 'number' && node.validations.kind === 'number') {
      handleUpdate((n) => {
        if (n.validations.kind === 'number') {
          if (optionKey === 'required') n.validations.v.required = true;
          else if (optionKey === 'min') n.validations.v.min = 0;
          else if (optionKey === 'max') n.validations.v.max = 100;
          else if (optionKey === 'integer') n.validations.v.integer = true;
          else if (optionKey === 'positive') n.validations.v.positive = true;
          else if (optionKey === 'negative') n.validations.v.negative = true;
        }
      });
    } else if (node.kind === 'boolean' && node.validations.kind === 'boolean') {
      if (optionKey === 'required') {
        handleUpdate((n) => {
          if (n.validations.kind === 'boolean') n.validations.v.required = true;
        });
      }
    } else if (node.kind === 'array' && node.validations.kind === 'array') {
      handleUpdate((n) => {
        if (n.validations.kind === 'array') {
          if (optionKey === 'required') n.validations.v.required = true;
          else if (optionKey === 'min') n.validations.v.min = 0;
          else if (optionKey === 'max') n.validations.v.max = 100;
        }
      });
    } else if (node.kind === 'object' && node.validations.kind === 'object') {
      if (optionKey === 'required') {
        handleUpdate((n) => {
          if (n.validations.kind === 'object') n.validations.v.required = true;
        });
      }
    } else if (node.kind === 'date' && node.validations.kind === 'date') {
      handleUpdate((n) => {
        if (n.validations.kind === 'date') {
          if (optionKey === 'required') n.validations.v.required = true;
          else if (optionKey === 'min') n.validations.v.min = new Date().toISOString();
          else if (optionKey === 'max') n.validations.v.max = new Date().toISOString();
        }
      });
    }
  };

  const availableOptions = getAvailableOptions();
  const kindLabel = node.kind === 'date' ? 'string (date)' : node.kind;

  return (
    <div className="py-0.5 group/node">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          className={cn(
            'flex items-start gap-2 py-2 px-2 -mx-2 rounded-lg transition-colors',
            'hover:bg-muted/40'
          )}
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center gap-2 text-left min-w-0 shrink-0',
                hasChildren && 'cursor-pointer',
                !hasChildren && 'cursor-default'
              )}
            >
              {hasChildren ? (
                open ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform" />
                )
              ) : (
                <span className="w-4 shrink-0" />
              )}
              <span className="font-semibold text-foreground truncate">{displayKey}</span>
            </button>
          </CollapsibleTrigger>
          
          <Badge
            variant="outline"
            className={cn(
              'shrink-0 text-[10px] font-medium px-1.5 py-0 h-5 gap-1 border',
              typeColors[node.kind] || 'bg-muted text-muted-foreground border-border'
            )}
          >
            {typeIcons[node.kind]}
            {kindLabel}
          </Badge>

          <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
            <ValidationEditorNew
              path={path}
              kind={node.kind}
              validations={node.validations}
              onUpdate={handleUpdate}
            />
            <AddValidationButton
              availableOptions={availableOptions}
              onAdd={handleAddValidation}
            />
          </div>
        </div>
        <CollapsibleContent className="animate-accordion-down">
          {node.kind === 'object' &&
            node.children?.map((child) => (
              <div key={child.key} className="ml-6 border-l-2 border-border/40 pl-3">
                <FieldTreeNode
                  node={child}
                  path={path ? `${path}.${child.key}` : child.key}
                  rootNode={rootNode}
                  onRootChange={onRootChange}
                  depth={depth + 1}
                />
              </div>
            ))}
          {node.kind === 'array' && node.itemSchema && typeof node.itemSchema === 'object' && (
            <div className="ml-6 border-l-2 border-border/40 pl-3">
              <FieldTreeNode
                node={node.itemSchema as FieldNode}
                path={path ? `${path}.item` : 'item'}
                rootNode={rootNode}
                onRootChange={onRootChange}
                depth={depth + 1}
              />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function YupSchemaBuilder({ node, onNodeChange }: YupSchemaBuilderProps) {
  if (!node) {
    return (
      <div className="p-6 text-center rounded-xl border-2 border-dashed border-border bg-muted/20">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
          <Type className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Paste or upload JSON to analyze and build a Yup schema.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <div className="p-1.5 rounded-md bg-primary/10">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">Fields & Validations</span>
        <span className="text-xs text-muted-foreground ml-auto">Click + to add rules</span>
      </div>
      <div className="p-3 overflow-auto max-h-[calc(100%-52px)]">
        <FieldTreeNode
          node={node}
          path=""
          rootNode={node}
          onRootChange={onNodeChange}
          depth={0}
        />
      </div>
    </div>
  );
}

