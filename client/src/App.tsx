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
