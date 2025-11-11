import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './env';

// Create axios instance with default configuration
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include credentials (cookies) in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized - could redirect to login
    if (error.response?.status === 401) {
      // Optionally clear token and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
