import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = "/" 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation(redirectTo);
    }
  }, [isAuthenticated, isLoading, setLocation, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  onlyRedirectFromHomepage?: boolean;
}

export function PublicRoute({ 
  children, 
  redirectTo = "/dashboard",
  onlyRedirectFromHomepage = false
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && onlyRedirectFromHomepage && location === "/") {
      setLocation(redirectTo);
    } else if (!isLoading && isAuthenticated && !onlyRedirectFromHomepage) {
      setLocation(redirectTo);
    }
  }, [isAuthenticated, isLoading, setLocation, redirectTo, onlyRedirectFromHomepage, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && onlyRedirectFromHomepage && location === "/") {
    return null;
  } else if (isAuthenticated && !onlyRedirectFromHomepage) {
    return null;
  }

  return <>{children}</>;
}
