import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/env";
import axiosInstance from "@/config/axios";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const response = await axiosInstance.request({
    method: method as any,
    url,
    data,
  });
  // Return a Response-like object for backward compatibility if needed
  // But ideally, use axios directly instead
  return response as unknown as Response;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  <T,>({ on401: unauthorizedBehavior }: { on401: UnauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/") as string;
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
    
    try {
      const response = await axiosInstance.get<T>(url);
      return response.data;
    } catch (error: any) {
      if (unauthorizedBehavior === "returnNull" && error.response?.status === 401) {
        return null as T;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
