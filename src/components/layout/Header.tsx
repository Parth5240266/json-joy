import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import {
  Sun,
  Moon,
  Braces,
  FileCheck,
  TreePine,
  GitCompare,
  Table,
  FileCode,
  Code,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const tools = [
  { path: '/formatter', label: 'Formatter', icon: Braces },
  { path: '/validator', label: 'Validator', icon: FileCheck },
  { path: '/viewer', label: 'Viewer', icon: TreePine },
  { path: '/diff', label: 'Diff', icon: GitCompare },
  { path: '/table', label: 'Table', icon: Table },
  { path: '/converter', label: 'Converter', icon: FileCode },
  { path: '/code-generator', label: 'Code Gen', icon: Code },
];

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Braces className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline">JSON Tools</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/">
              <Button
                variant={location.pathname === '/' ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = location.pathname === tool.path;
              return (
                <Link key={tool.path} to={tool.path}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn('gap-2', isActive && 'bg-secondary')}
                  >
                    <Icon className="h-4 w-4" />
                    {tool.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                  location.pathname === '/'
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50'
                )}
              >
                <Home className="h-5 w-5" />
                Home
              </Link>
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = location.pathname === tool.path;
                return (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/50'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {tool.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
