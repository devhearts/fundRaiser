import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/Navigation";
import HomePage from "@/pages/HomePage";
import CreateEventPage from "@/pages/CreateEventPage";
import EventLandingPage from "@/pages/EventLandingPage";
import DashboardPage from "@/pages/DashboardPage";
import ProtectedRoute, { PublicRoute } from "@/components/ProtectedRoute";
import axiosInstance from "@/config/axios";

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      {/* Public routes - redirect to dashboard if authenticated, but only from homepage */}
      <Route path="/">
        <PublicRoute onlyRedirectFromHomepage={true}>
          <HomePage />
        </PublicRoute>
      </Route>
      
      {/* Protected routes - redirect to home if not authenticated */}
      <Route path="/create">
        <ProtectedRoute>
          <CreateEventPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      
      {/* Event pages are public for viewing */}
      <Route path="/event/:id" component={EventLandingPage} />
      
      {/* Catch all */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Check and initialize services on app startup
  useEffect(() => {
    const checkAndInitializeServices = async () => {
      try {
        // Check health endpoint to see service status
        const healthResponse = await axiosInstance.get('/health');
        const services = healthResponse.data?.services;

        // If Google Sheets is not initialized, initialize it
        if (services?.googleSheets === 'not_initialized') {
          console.log('🔄 Google Sheets service not initialized. Initializing...');

          try {
            const initResponse = await axiosInstance.get('/init');
            const initData = initResponse.data;

            if (initData.status === 'ready' || initData.initialized) {
              console.log('✅ Services initialized successfully:', initData.message);
            } else {
              console.warn('⚠️ Services initialization completed with warnings:', initData.message);
              if (initData.errors?.length > 0) {
                console.error('Initialization errors:', initData.errors);
              }
            }
          } catch (initError: any) {
            console.error('❌ Failed to initialize services:', initError.response?.data?.message || initError.message);
          }
        } else {
          console.log('✅ All services are already initialized');
        }
      } catch (error: any) {
        // Silently fail - don't block app from loading if health check fails
        // This could happen if server is down or network issues
        console.warn('⚠️ Could not check service status:', error.response?.data?.message || error.message);
      }
    };

    // Run initialization check
    checkAndInitializeServices();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen">
            <Navigation />
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
