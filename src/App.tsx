
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route element={<Layout />}>
            <Route path="/autofix/modes" element={<ModeSelectionPage />} />
            <Route path="/autofix/normal" element={<NormalModePage />} />
            <Route path="/autofix/pro" element={<ProModePage />} />
            <Route path="/seo-checker" element={<SEOCheckerPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
