import { useState } from 'react';
import { ChevronRight, ChevronDown, Type, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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

function ValidationEditor({
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
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span>Required</span>
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'string') n.validations.v.required = false;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {v.minLength !== undefined && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span className="text-muted-foreground">min:</span>
              <Input
                type="number"
                className="h-5 w-12 text-[11px] px-1 py-0 border-0 bg-background/50"
                value={v.minLength}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  onUpdate((n) => {
                    if (n.validations.kind === 'string') n.validations.v.minLength = val;
                  });
                }}
              />
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'string') n.validations.v.minLength = undefined;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {v.maxLength !== undefined && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span className="text-muted-foreground">max:</span>
              <Input
                type="number"
                className="h-5 w-12 text-[11px] px-1 py-0 border-0 bg-background/50"
                value={v.maxLength}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  onUpdate((n) => {
                    if (n.validations.kind === 'string') n.validations.v.maxLength = val;
                  });
                }}
              />
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'string') n.validations.v.maxLength = undefined;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {v.email && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span>Email</span>
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'string') n.validations.v.email = false;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {v.url && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span>URL</span>
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'string') n.validations.v.url = false;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </>
      );
    }
    if (kind === 'number' && validations.kind === 'number') {
      const v = validations.v;
      return (
        <>
          {v.required && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span>Required</span>
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'number') n.validations.v.required = false;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {v.min !== undefined && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span className="text-muted-foreground">min:</span>
              <Input
                type="number"
                className="h-5 w-14 text-[11px] px-1 py-0 border-0 bg-background/50"
                value={v.min}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                  onUpdate((n) => {
                    if (n.validations.kind === 'number') n.validations.v.min = val;
                  });
                }}
              />
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'number') n.validations.v.min = undefined;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {v.max !== undefined && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span className="text-muted-foreground">max:</span>
              <Input
                type="number"
                className="h-5 w-14 text-[11px] px-1 py-0 border-0 bg-background/50"
                value={v.max}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                  onUpdate((n) => {
                    if (n.validations.kind === 'number') n.validations.v.max = val;
                  });
                }}
              />
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'number') n.validations.v.max = undefined;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {v.integer && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span>Integer</span>
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'number') n.validations.v.integer = false;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {v.positive && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span>Positive</span>
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'number') {
                      n.validations.v.positive = false;
                      if (n.validations.v.negative) n.validations.v.negative = false;
                    }
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {v.negative && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span>Negative</span>
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'number') {
                      n.validations.v.negative = false;
                      if (n.validations.v.positive) n.validations.v.positive = false;
                    }
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </>
      );
    }
    if (kind === 'boolean' && validations.kind === 'boolean') {
      const v = validations.v;
      return (
        <>
          {v.required && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span>Required</span>
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'boolean') n.validations.v.required = false;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </>
      );
    }
    if (kind === 'array' && validations.kind === 'array') {
      const v = validations.v;
      return (
        <>
          {v.required && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span>Required</span>
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'array') n.validations.v.required = false;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {v.min !== undefined && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span className="text-muted-foreground">min:</span>
              <Input
                type="number"
                className="h-5 w-12 text-[11px] px-1 py-0 border-0 bg-background/50"
                value={v.min}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  onUpdate((n) => {
                    if (n.validations.kind === 'array') n.validations.v.min = val;
                  });
                }}
              />
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'array') n.validations.v.min = undefined;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {v.max !== undefined && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span className="text-muted-foreground">max:</span>
              <Input
                type="number"
                className="h-5 w-12 text-[11px] px-1 py-0 border-0 bg-background/50"
                value={v.max}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  onUpdate((n) => {
                    if (n.validations.kind === 'array') n.validations.v.max = val;
                  });
                }}
              />
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'array') n.validations.v.max = undefined;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </>
      );
    }
    if (kind === 'object' && validations.kind === 'object') {
      const v = validations.v;
      return (
        <>
          {v.required && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span>Required</span>
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'object') n.validations.v.required = false;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </>
      );
    }
    if (kind === 'date' && validations.kind === 'date') {
      const v = validations.v;
      return (
        <>
          {v.required && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span>Required</span>
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'date') n.validations.v.required = false;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {v.min !== undefined && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span className="text-muted-foreground">min:</span>
              <Input
                type="date"
                className="h-5 w-28 text-[11px] px-1 py-0 border-0 bg-background/50"
                value={v.min ? new Date(v.min).toISOString().slice(0, 10) : ''}
                onChange={(e) => {
                  const val = e.target.value ? new Date(e.target.value + 'T00:00:00Z').toISOString() : undefined;
                  onUpdate((n) => {
                    if (n.validations.kind === 'date') n.validations.v.min = val;
                  });
                }}
              />
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'date') n.validations.v.min = undefined;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {v.max !== undefined && (
            <div className="inline-flex items-center gap-1 bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[11px]">
              <span className="text-muted-foreground">max:</span>
              <Input
                type="date"
                className="h-5 w-28 text-[11px] px-1 py-0 border-0 bg-background/50"
                value={v.max ? new Date(v.max).toISOString().slice(0, 10) : ''}
                onChange={(e) => {
                  const val = e.target.value ? new Date(e.target.value + 'T00:00:00Z').toISOString() : undefined;
                  onUpdate((n) => {
                    if (n.validations.kind === 'date') n.validations.v.max = val;
                  });
                }}
              />
              <button
                onClick={() =>
                  onUpdate((n) => {
                    if (n.validations.kind === 'date') n.validations.v.max = undefined;
                  })
                }
                className="hover:bg-destructive/20 rounded p-0.5 -mr-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </>
      );
    }
    return null;
  };

  const configured = hasConfiguredValidations();

  if (!configured) return null;

  return (
    <>
      {renderConfiguredValidations()}
    </>
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
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
          <Plus className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {availableOptions.map((option) => (
          <DropdownMenuItem
            key={option.key}
            onClick={() => onAdd(option.key)}
            className="cursor-pointer"
          >
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
    <div className="py-1">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center gap-1 rounded px-1 -ml-1 hover:bg-secondary/50 text-left min-w-0',
                hasChildren && 'cursor-pointer'
              )}
            >
              {hasChildren ? (
                open ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )
              ) : (
                <span className="w-4 shrink-0" />
              )}
              <span className="font-medium text-foreground truncate">{displayKey}</span>
              <span className="text-muted-foreground text-xs shrink-0">({kindLabel})</span>
            </button>
          </CollapsibleTrigger>
          <ValidationEditor
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
        <CollapsibleContent>
          {node.kind === 'object' &&
            node.children?.map((child) => (
              <div key={child.key} className="ml-4 border-l border-border/50 pl-2">
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
            <div className="ml-4 border-l border-border/50 pl-2">
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
      <div className="p-4 text-sm text-muted-foreground rounded-lg border border-border bg-card">
        Paste or upload JSON to analyze and build a Yup schema.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 overflow-auto max-h-full">
      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground">
        <Type className="h-4 w-4" />
        Fields & validations
      </div>
      <div className="space-y-0.5">
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
