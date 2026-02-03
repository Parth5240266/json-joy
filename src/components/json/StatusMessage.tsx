import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
  details?: string;
}

export function StatusMessage({ type, message, details }: StatusMessageProps) {
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg border',
          type === 'success' && 'bg-success/10 border-success/30 text-success',
          type === 'error' && 'bg-destructive/10 border-destructive/30 text-destructive',
          type === 'info' && 'bg-primary/10 border-primary/30 text-primary'
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{message}</p>
          {details && (
            <p className="text-xs mt-1 opacity-80 font-mono">{details}</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
