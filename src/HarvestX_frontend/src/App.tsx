import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import CreateListing from "./pages/CreateListing";
import Marketplace from "./pages/Marketplace";
import InvestorDashboard from "./pages/InvestorDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/investor-dashboard" element={<InvestorDashboard />} />
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/register" element={<Register />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;