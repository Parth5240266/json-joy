import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ToolLayoutProps {
  title: string;
  description: string;
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  toolbar?: ReactNode;
  statusBar?: ReactNode;
}

export function ToolLayout({
  title,
  description,
  leftPanel,
  rightPanel,
  toolbar,
  statusBar,
}: ToolLayoutProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 px-6 py-4 border-b border-border"
      >
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </motion.div>

      {/* Toolbar */}
      {toolbar && (
        <div className="flex-shrink-0 px-6 py-3 border-b border-border bg-secondary/30">
          {toolbar}
        </div>
      )}

      {/* Main Content - Two Panel Layout */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* Left Panel - Input */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 min-h-0 flex flex-col p-4 lg:border-r border-border"
        >
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Input
          </div>
          <div className="flex-1 min-h-0">
            {leftPanel}
          </div>
        </motion.div>

        {/* Right Panel - Output */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 min-h-0 flex flex-col p-4 border-t lg:border-t-0 border-border"
        >
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Output
          </div>
          <div className="flex-1 min-h-0">
            {rightPanel}
          </div>
        </motion.div>
      </div>

      {/* Status Bar */}
      {statusBar && (
        <div className="flex-shrink-0 px-6 py-2 border-t border-border bg-secondary/30 text-xs text-muted-foreground">
          {statusBar}
        </div>
      )}
    </div>
  );
}
