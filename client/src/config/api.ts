import { endpoints } from "./endpoints";
import axiosInstance from "./axios";
import { Contribution, Event } from "@shared/schema";

// Generic request function using axios
export async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  data?: unknown,
): Promise<T> {
  try {
    const response = await axiosInstance.request<T>({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error: any) {
    // Axios wraps errors, extract the response data if available
    if (error.response) {
      // Server responded with error status
      // Preserve the full error response for validation errors
      const errorData = error.response.data;
      const apiError = new Error(errorData?.message || errorData?.error || error.response.statusText || `HTTP ${error.response.status}`);
      // Attach the full error data for validation error handling
      (apiError as any).response = error.response;
      (apiError as any).data = errorData;
      throw apiError;
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Network error: No response from server');
    } else {
      // Error in request setup
      throw error;
    }
  }
}

// Example typed API functions consuming endpoints
export const api = {
  auth: {
    login: (payload: { email: string; password: string }) =>
      request<{ message: string; user: { id: string; name: string; email: string; phone?: string }; token: string; expiresIn: string }>("POST", endpoints.auth.login(), payload),
    signup: (payload: { name: string; email: string; phone: string; password: string }) =>
      request<{ message: string; user: { id: string; name: string; email: string; phone?: string }; token: string; expiresIn: string }>("POST", endpoints.auth.signup(), payload),
    logout: () => request<void>("POST", endpoints.auth.logout()),
    me: () => request<{ id: string; name: string; email: string; phone?: string }>("GET", endpoints.auth.me()),
  },
  events: {
    list: () => request<{ events: Event[]; eventsStats: any }>("GET", endpoints.events.list()),
    create: (payload: Record<string, unknown>) => request<Event>("POST", endpoints.events.create(), payload),
    byId: (id: string) => request<Event>("GET", endpoints.events.byId(id)),
    contribute: (id: string, payload: Record<string, unknown>) =>
      request<void>("POST", endpoints.events.contribute(id), payload),
    createPledge: (id: string, payload: Record<string, unknown>) =>
      request<{ id: string }>("POST", endpoints.events.createPledge(id), payload),
    getContributions: (id: string, phone?: string) => {
      const query = phone ? `?phone=${encodeURIComponent(phone)}` : "";
      return request<Contribution[]>("GET", `${endpoints.events.contribute(id)}${query}`);
    },
  },
  contributions: {
    verifyPhone: (payload: { phone: string; eventId: string }) =>
      request<{ message: string; token: string; expiresIn: string }>("POST", endpoints.contributions.verifyPhone(), payload),
  },
  payments: {
    process: (payload: {
      eventId?: string;
      contributionId?: string;
      amount: number;
      paymentMethod?: "card" | "mobile_money" | "bank_transfer" | "cash" | "other";
      paymentProvider?: string;
      payerName: string;
      payerEmail?: string;
      payerPhone: string;
      metadata?: Record<string, unknown>;
    }) => request<{ success: boolean; message: string }>("POST", "/payments/process", payload),
  },
};

export type Api = typeof api;
