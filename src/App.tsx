import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Seo } from "@/components/Seo";
import HomePage from "./pages/HomePage";
import FormatterPage from "./pages/FormatterPage";
import ValidatorPage from "./pages/ValidatorPage";
import ViewerPage from "./pages/ViewerPage";
import DiffPage from "./pages/DiffPage";
import TablePage from "./pages/TablePage";
import ConverterPage from "./pages/ConverterPage";
import CodeGeneratorPage from "./pages/CodeGeneratorPage";
import YupSchemaPage from "./pages/YupSchemaPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Seo />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/formatter" element={<FormatterPage />} />
          <Route path="/validator" element={<ValidatorPage />} />
          <Route path="/viewer" element={<ViewerPage />} />
          <Route path="/diff" element={<DiffPage />} />
          <Route path="/table" element={<TablePage />} />
          <Route path="/converter" element={<ConverterPage />} />
          <Route path="/code-generator" element={<CodeGeneratorPage />} />
          <Route path="/yup-schema" element={<YupSchemaPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
