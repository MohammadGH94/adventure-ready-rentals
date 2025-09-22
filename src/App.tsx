import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import HowItWorks from "./pages/HowItWorks";
import ListGear from "./pages/ListGear";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";
import InfoPage from "./pages/InfoPage";
import Architecture from "./pages/Architecture";
import ListingDetails from "./pages/ListingDetails";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/list-gear" element={
              <ProtectedRoute>
                <ListGear />
              </ProtectedRoute>
            } />
            <Route path="/signin" element={
              <ProtectedRoute requireAuth={false}>
                <SignIn />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/gear/:id" element={<ListingDetails />} />
            <Route path="/info/:slug" element={<InfoPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
