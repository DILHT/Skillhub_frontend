import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import { storage } from '../utils/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

// ── CREATE INSTANCE ───────────────────────────────────────────────────────────
 
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,     // 15 seconds — generous for African mobile networks
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});


// ── REQUEST INTERCEPTOR ───────────────────────────────────────────────────────
//
// Runs BEFORE every outgoing request.
// Job: Attach the JWT token to the Authorization header.
//
// Without this, every service file would need to manually add the token.
// With this, the token is added automatically to ALL requests.
 
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get the token from our Zustand store
    const token = useAuthStore.getState().token;
 
    // If a token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
 
    return config; // Must return the config to proceed
  },
  (error) => Promise.reject(error) // Pass through request errors
);



// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
//
// Runs AFTER every incoming response.
// Job 1: If response is 401 (Unauthorized), the token expired → log user out.
// Job 2: Transform the error into a format our app understands.
//
// Without this, a 401 would crash or show a confusing "Network Error".
// With this, the user is automatically logged out and sent to Login.
 
apiClient.interceptors.response.use(
  (response) => response, // Success — pass through unchanged
 
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state and send to login
      // The RootNavigator reacts automatically (from Lesson 01)
      useAuthStore.getState().logout();
      await storage.clear(); // Clear any cached data
    }
 
    // Transform the error so our app always sees a consistent shape
    const message =
      (error.response?.data as any)?.message ?? // Backend error message
      error.message ??                           // Network error message
      'An unexpected error occurred';            // Fallback
 
    // Re-throw with our standardized format
    return Promise.reject({ message, status: error.response?.status });
  }
);