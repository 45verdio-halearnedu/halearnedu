
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthPage from "./components/AuthPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CommunityPage from "./pages/CommunityPage";
import ChamaDetailsPage from "./pages/ChamaDetailsPage";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show AuthPage if user is not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Show main app if user is authenticated
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Index />} />
        <Route path="/marketplace" element={<Index />} />
        <Route path="/p2p-marketplace" element={<Index />} />
        <Route path="/my-loans" element={<Index />} />
        <Route path="/portfolio" element={<Index />} />
        <Route path="/insights" element={<Index />} />
        <Route path="/staking" element={<Index />} />
        <Route path="/wallet" element={<Index />} />
        <Route path="/education" element={<Index />} />
        <Route path="/bill-payments" element={<Index />} />
        <Route path="/savings-goals" element={<Index />} />
        <Route path="/qr-payments" element={<Index />} />
        <Route path="/mobile-money" element={<Index />} />
        <Route path="/disputes" element={<Index />} />
        <Route path="/token-management" element={<Index />} />
        <Route path="/chamas" element={<Index />} />
        <Route path="/micro-investments" element={<Index />} />
        <Route path="/tuition-wallets" element={<Index />} />
        <Route path="/settings" element={<Index />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/chama/:chamaId" element={<ChamaDetailsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
