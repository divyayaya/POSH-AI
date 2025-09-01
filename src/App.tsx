import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Unauthorized from "./pages/Unauthorized";
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
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/file-complaint" element={
              <ProtectedRoute>
                <FileComplaint />
              </ProtectedRoute>
            } />
            <Route path="/hr-dashboard" element={
              <ProtectedRoute requiredRoles={['hr_admin', 'icc_primary', 'icc_secondary']}>
                <HRDashboard />
              </ProtectedRoute>
            } />
            <Route path="/human-review/:caseId" element={
              <ProtectedRoute requiredRoles={['icc_primary', 'icc_secondary']}>
                <HumanReview />
              </ProtectedRoute>
            } />
            <Route path="/investigation/:caseId" element={
              <ProtectedRoute requiredRoles={['investigator', 'hr_admin']}>
                <Investigation />
              </ProtectedRoute>
            } />
            <Route path="/admin/webhook-test" element={
              <ProtectedRoute requiredRoles={['hr_admin']}>
                <AdminWebhookTest />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;