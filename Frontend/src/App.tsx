/**
 * App Component
 * 
 * Root application component that sets up routing, providers, and global UI.
 * 
 * @module App
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ContractSigningPage } from "./pages/ContractSigningPage";
import { LanguageProvider } from "./contexts/LanguageContext";

// Initialize React Query client for data fetching
const queryClient = new QueryClient();

/**
 * App - Root application component
 * 
 * Configures the application with:
 * - React Query for async state management
 * - Tooltip provider for UI tooltips
 * - Toast notifications (dual toaster setup)
 * - React Router for client-side routing
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Toast Notification Systems */}
      <Toaster />
      <Sonner />

      {/* Application Routes */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/contract/:id/sign" element={
            <LanguageProvider>
              <ContractSigningPage />
            </LanguageProvider>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
