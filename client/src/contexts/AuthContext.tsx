import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/config/api";
import { queryClient } from "@/lib/queryClient";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    //todo: remove mock functionality - check for stored auth token
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login({ email, password });
    // Store token for future authenticated requests
    if (response.token) {
      localStorage.setItem("token", response.token);
    }
    setUser(response.user);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const signup = async (name: string, email: string, phone: string, password: string) => {
    const response = await api.auth.signup({ name, email, phone, password });
    // Store token for future authenticated requests
    if (response.token) {
      localStorage.setItem("token", response.token);
    }
    setUser(response.user);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const logout = () => {
    try {
      // Best-effort invalidate server session
      api.auth.logout().catch(() => {});
    } finally {
      // Clear all client auth data
      setUser(null);
      try {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.clear();
      } catch {}

      // Clear React Query cache
      try {
        queryClient.clear();
      } catch {}

      // Optional: force navigation to home to avoid stale protected views
      try {
        if (typeof window !== 'undefined') {
          window.location.assign("/");
        }
      } catch {}
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
