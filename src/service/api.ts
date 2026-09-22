// src/service/api.ts
// Production-ready version:
// - All console.log removed
// - Token refresh with retry on 401
// - Proper error handling

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import { storage } from '../utils/storage';
import { clearQueryCache } from './queryClient';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://skillhub-backend-3pqd.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 45000,
  validateStatus: () => true, // route ALL responses through success interceptor
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

function isAuthEndpointUrl(url: string) {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/verify') ||
    url.includes('/auth/password') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/token/refresh') ||
    url.includes('/auth/account/reactivate')
  );
}

function logAuthApiEvent(event: string, details: Record<string, unknown>) {
  if (!__DEV__) return;
  console.info(`[API][auth] ${event}`, details);
}

// ── TOKEN REFRESH STATE ───────────────────────────────────────────────────────
// Tracks whether a refresh is already in progress so we don't fire
// multiple simultaneous refresh requests when several calls return 401

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

function processQueue(error: any, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await storage.get('refreshToken');
  if (!refreshToken) throw new Error('No refresh token available');

  // Call refresh endpoint directly (bypass interceptor to avoid infinite loop)
  const response = await axios.post(
    `${BASE_URL}/auth/token/refresh`,
    { refreshToken },
    { validateStatus: () => true }
  );

  if (response.status >= 400) {
    throw new Error('Session expired. Please sign in again.');
  }

  // Unwrap envelope if present
  const body = response.data;
  const data = body?.data ?? body;
  const newAccessToken = data?.accessToken ?? data?.access_token;

  if (!newAccessToken) throw new Error('Invalid refresh response');

  // Save new token to store
  useAuthStore.getState().updateToken(newAccessToken);

  return newAccessToken;
}

// ── REQUEST INTERCEPTOR ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const url = config.url ?? '';
    if (isAuthEndpointUrl(url)) {
      logAuthApiEvent('request', {
        method: config.method?.toUpperCase(),
        url,
        hasToken: Boolean(token),
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  async (response) => {
    const body = response.data;
    const url = response.config?.url ?? '';

    const isAuthEndpoint = isAuthEndpointUrl(url);

    if (isAuthEndpoint) {
      logAuthApiEvent('response', {
        method: response.config?.method?.toUpperCase(),
        url,
        status: response.status,
      });
    }

    // ── Handle 401 with token refresh ────────────────────────────────────────
    if (response.status === 401 && !isAuthEndpoint) {
      if (isRefreshing) {
        // Another refresh is already in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          response.config.headers.Authorization = `Bearer ${token}`;
          return apiClient(response.config as AxiosRequestConfig);
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        isRefreshing = false;

        // Retry the original request with new token
        const retryConfig = response.config as AxiosRequestConfig;
        retryConfig.headers = {
          ...retryConfig.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return apiClient(retryConfig);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Refresh failed — log user out. This is the second logout path
        // (the first is useAuth.handleLogout); it has to wipe the cache too,
        // or an expired session leaves the previous user's data on disk.
        useAuthStore.getState().logout('Session expired. Please sign in again.');
        await clearQueryCache();
        await storage.clear();

        const err = new Error('Session expired. Please sign in again.');
        (err as any).status = 401;
        return Promise.reject(err);
      }
    }

    // ── Handle other 4xx / 5xx ────────────────────────────────────────────────
    if (response.status >= 400) {
      const d = body as any;
      const serverMessage = d?.message ?? (Array.isArray(d?.errors) ? d.errors[0] : undefined);
      const message =
        serverMessage ??
        (response.status >= 500
          ? 'Server error. Please try again in a moment.'
          : `Request failed (${response.status})`);

      if (isAuthEndpoint) {
        logAuthApiEvent('error-response', {
          url,
          status: response.status,
          message,
        });
      }

      const err = new Error(message);
      (err as any).status = response.status;
      (err as any).errors = d?.errors;
      return Promise.reject(err);
    }

    // ── Unwrap success envelope { success, message, data, meta } → data ──────
    try {
      if (
        body !== null &&
        body !== undefined &&
        typeof body === 'object' &&
        !Array.isArray(body) &&
        'success' in body &&
        'data' in body
      ) {
        response.data = body.data;
      }
    } catch {
      // Pass through unchanged if unwrap fails
    }

    return response;
  },

  // Only fires for true network failures (timeout, no connection, SSL)
  async (error: AxiosError) => {
    const url = error.config?.url ?? '';
    const message =
      error.code === 'ECONNABORTED'
        ? 'Request timed out. Please check your connection and try again.'
        : 'Network error. Please check your connection and try again.';

    if (isAuthEndpointUrl(url)) {
      logAuthApiEvent('network-error', {
        method: error.config?.method?.toUpperCase(),
        url,
        code: error.code,
      });
    }

    const err = new Error(message);
    (err as any).code = error.code;
    (err as any).isNetworkError = true;
    return Promise.reject(err);
  }
);
