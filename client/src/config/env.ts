// Centralized environment/config access for the frontend
// 
// API_BASE_URL uses relative path "/api" by default, which works with Vite proxy
// Vite dev server proxies /api/* requests to the backend (localhost:3030)
// This eliminates CORS issues since requests appear to come from the same origin

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;
