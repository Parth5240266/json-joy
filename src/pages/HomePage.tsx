import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Braces,
  FileCheck,
  TreePine,
  GitCompare,
  Table,
  FileCode,
  Code,
  ArrowRight,
  Zap,
  Shield,
  Eye,
} from 'lucide-react';

const tools = [
  {
    path: '/formatter',
    label: 'JSON Formatter',
    description: 'Format and beautify JSON with customizable indentation',
    icon: Braces,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    path: '/validator',
    label: 'JSON Validator',
    description: 'Validate JSON and get detailed error messages with line numbers',
    icon: FileCheck,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    path: '/viewer',
    label: 'JSON Viewer',
    description: 'View JSON as an interactive, collapsible tree with syntax highlighting',
    icon: TreePine,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    path: '/diff',
    label: 'JSON Diff',
    description: 'Compare two JSON objects and see added, removed, and modified keys',
    icon: GitCompare,
    gradient: 'from-orange-500 to-red-500',
  },
  {
    path: '/table',
    label: 'JSON to Table',
    description: 'Convert array-based JSON into a responsive HTML table',
    icon: Table,
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    path: '/converter',
    label: 'JSON Converter',
    description: 'Convert JSON to CSV or XML format for easy data exchange',
    icon: FileCode,
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    path: '/code-generator',
    label: 'Code Generator',
    description: 'Fetch JSON from URL and generate TypeScript interfaces or JavaScript code',
    icon: Code,
    gradient: 'from-rose-500 to-pink-500',
  },
];

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'All processing happens in your browser. No server calls, no waiting.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data never leaves your device. We detect and highlight sensitive keys.',
  },
  {
    icon: Eye,
    title: 'Beautiful UI',
    description: 'Monaco editor with syntax highlighting, dark mode, and responsive design.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <MainLayout>
      <div className="flex-1 overflow-auto">
        {/* Hero Section */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-hero-gradient opacity-50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.15),transparent_50%)]" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              100% Client-Side Processing
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Powerful{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                JSON Tools
              </span>
              <br />
              for Developers
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Format, validate, compare, and convert JSON with a beautiful interface.
              Your data stays private — everything runs in your browser.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/formatter">
                <Button size="lg" className="gap-2 text-base px-8">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/validator">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                  Validate JSON
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Tools Grid */}
        <section className="py-16 px-6 bg-secondary/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                All the JSONJoy Tools You Need
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A comprehensive toolkit for working with JSON data. Each tool is designed
                to be fast, intuitive, and privacy-focused.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <motion.div key={tool.path} variants={item}>
                    <Link to={tool.path}>
                      <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {tool.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    variants={item}
                    className="text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/JsonJoy_logo.png" 
                alt="JSONJoy Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="font-semibold">JSONJoy</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Your all-in-one JSON toolkit • All rights reserved
            </p>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
}
