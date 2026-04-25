// //       It receives data, calls the API, and returns the result.
// import { apiClient } from './api';
// import { AuthResponse } from '../types/user.types';

// // ── REQUEST / RESPONSE TYPES ──────────────────────────────────────────────────
// //
// // Defining these types here documents what the API expects and returns.
// // If the backend changes a field name, TypeScript shows a compile error.
 
// interface LoginRequest {
//   email: string;
//   password: string;
// }
 
// interface RegisterRequest {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   password: string;
//   role: 'client' | 'provider';
// }
 
// interface OTPVerifyRequest {
//   phone: string;
//   code: string;
// }


// // ── SERVICE OBJECT ────────────────────────────────────────────────────────────
// //
// // We export an OBJECT with methods, not individual functions.
// // This keeps all auth-related API calls grouped together.
// // Usage: authService.login(data) — clear and readable.
 
// export const authService = {
 
//   // POST /auth/login
//   // Returns: { user, token, refreshToken }
//   login: async (data: LoginRequest): Promise<AuthResponse> => {
//     const response = await apiClient.post<AuthResponse>('/auth/login', data);
//     return response.data;
//     // Note: We return response.data (the payload), not the full axios response
//   },
 
//   // POST /auth/register
//   register: async (data: RegisterRequest): Promise<AuthResponse> => {
//     const response = await apiClient.post<AuthResponse>('/auth/register', data);
//     return response.data;
//   },
 
//   // POST /auth/verify-otp
//   verifyOTP: async (data: OTPVerifyRequest): Promise<{ verified: boolean }> => {
//     const response = await apiClient.post('/auth/verify-otp', data);
//     return response.data;
//   },
 
//   // POST /auth/refresh  — get a new token using the refresh token
//   refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
//     const response = await apiClient.post('/auth/refresh', { refreshToken });
//     return response.data;
//   },
 
//   // POST /auth/logout  — tell the backend to invalidate this session
//   logout: async (): Promise<void> => {
//     await apiClient.post('/auth/logout');
//     // The calling code (useAuth hook) handles clearing the store
//   },
 
//   // POST /auth/forgot-password
//   forgotPassword: async (email: string): Promise<{ message: string }> => {
//     const response = await apiClient.post('/auth/forgot-password', { email });
//     return response.data;
//   },
// };

// ─────────────────────────────────────────────────────────────────────────────
// FILE 2: src/services/authService.ts  (UPDATED — replace Lesson 02 version)
// ─────────────────────────────────────────────────────────────────────────────
 
import { apiClient } from './api';
import { AuthResponse } from '../types/user.types';
import {
  MOCK_AUTH_RESPONSE,
  MOCK_CLIENT_USER,
  MOCK_PROVIDER_USER,
} from '../mock/mockData';
 
const IS_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
 
function mockDelay(ms = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
 
interface LoginRequest {
  email: string;
  password: string;
}
 
interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'client' | 'provider';
}
 
interface OTPVerifyRequest {
  phone: string;
  code: string;
}
 
export const authService = {
 
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    if (IS_MOCK_AUTH) {
      await mockDelay();
      // Simulate a wrong-password error so you can test error UI:
      // if (data.password !== 'password123') {
      //   throw { message: 'Invalid email or password', status: 401 };
      // }
 
      // Return provider user if email contains 'provider', client otherwise
      const user = data.email.includes('provider')
        ? MOCK_PROVIDER_USER
        : MOCK_CLIENT_USER;
      return { ...MOCK_AUTH_RESPONSE, user };
    }
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
 
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    if (IS_MOCK_AUTH) {
      await mockDelay(1000);
      const user = {
        ...MOCK_CLIENT_USER,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
      };
      return { ...MOCK_AUTH_RESPONSE, user };
    }
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
 
  verifyOTP: async (data: OTPVerifyRequest): Promise<{ verified: boolean }> => {
    if (IS_MOCK_AUTH) {
      await mockDelay(600);
      return { verified: data.code === '123456' }; // Any 6 digits work except this mock check
    }
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },
 
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    if (IS_MOCK_AUTH) {
      await mockDelay(200);
      return { token: 'mock-refreshed-token' };
    }
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },
 
  logout: async (): Promise<void> => {
    if (IS_MOCK_AUTH) {
      await mockDelay(100);
      return;
    }
    await apiClient.post('/auth/logout');
  },
 
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    if (IS_MOCK_AUTH) {
      await mockDelay(600);
      return { message: 'Password reset link sent to your email' };
    }
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },
};
