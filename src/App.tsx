
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import ModeSelectionPage from "./pages/ModeSelectionPage";
import NormalModePage from "./pages/NormalModePage";
import ProModePage from "./pages/ProModePage";
import SEOCheckerPage from "./pages/SEOCheckerPage";
import AutoblogPage from "./pages/AutoblogPage";
import AutoblogConfigPage from "./pages/AutoblogConfigPage";
import BlogProjectsPage from "./pages/BlogProjectsPage";
import BlogConfigPage from "./pages/BlogConfigPage";
import HistoryPage from "./pages/HistoryPage";
import WritingStylePage from "./pages/WritingStylePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/writing-style" element={<WritingStylePage />} />
            
            <Route path="/autofix/modes" element={<ModeSelectionPage />} />
            <Route path="/autofix/normal" element={<NormalModePage />} />
            <Route path="/autofix/pro" element={<ProModePage />} />
            <Route path="/seo-checker" element={<SEOCheckerPage />} />
            
            {/* Autoblog Routes */}
            <Route path="/autoblog/create" element={<AutoblogPage />} />
            <Route path="/autoblog/list" element={<AutoblogPage />} />
            <Route path="/autoblog/template" element={<AutoblogPage />} />
            <Route path="/autoblog/config/:id" element={<AutoblogConfigPage />} />
            
            {/* Blog Routes */}
            <Route path="/blog/create" element={<BlogProjectsPage />} />
            <Route path="/blog/articles" element={<BlogProjectsPage />} />
            <Route path="/blog/template" element={<BlogProjectsPage />} />
            <Route path="/blog/config/:id" element={<BlogConfigPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
