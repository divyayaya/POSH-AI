import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FileComplaint from "./pages/FileComplaint";
import HRDashboard from "./pages/HRDashboard";
import HumanReview from "./pages/HumanReview";
import Investigation from "./pages/Investigation";  
import AdminWebhookTest from "./pages/AdminWebhookTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/file-complaint" element={<FileComplaint />} />
          <Route path="/hr-dashboard" element={<HRDashboard />} />
          <Route path="/human-review/:caseId" element={<HumanReview />} />
          <Route path="/investigation/:caseId" element={<Investigation />} />
          <Route path="/admin/webhook-test" element={<AdminWebhookTest />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;