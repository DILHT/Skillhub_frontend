// src/service/authService.ts
// Added: resendOTP() for the OTP screen resend button
// Removed: all console.log statements

import { apiClient } from './api';
import { AuthResponse, RegisterResponse, RefreshResponse, User } from '../types/user.types';

function toBackendRegisterRole(role: 'client' | 'provider') {
  return role === 'provider' ? 'provider' : 'client';
}

export const authService = {

  // POST /auth/register/email
  registerStep1: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'client' | 'provider';
  }): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register/email', {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: toBackendRegisterRole(data.role),
      acceptedTerms: true,
      acceptedPrivacy: true,
    });
    return response.data;
  },

  // POST /auth/verify/email/otp
  verifyEmailOTP: async (data: {
    email: string;
    otp: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/verify/email/otp', {
      email: data.email,
      otp: data.otp,
    });
    return response.data;
  },

  // Resend email verification OTP.
  resendOTP: async (email: string): Promise<void> => {
    const error = new Error(
      `Email verification resend is not available from the backend yet. Please use the latest code already sent to ${email}.`
    );
    throw error;
  },

  // POST /auth/login/email
  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login/email', {
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  // GET /auth/profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile');
    const data = response.data as any;
    return data?.user ?? data;
  },

  // PUT /auth/profile
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
  }): Promise<User> => {
    const response = await apiClient.put('/auth/profile', data);
    const d = response.data as any;
    return d?.user ?? d;
  },

  // POST /auth/token/refresh
  refreshToken: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await apiClient.post<RefreshResponse>('/auth/token/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // POST /auth/password/forgot
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/password/forgot', { email });
    return response.data;
  },

  // POST /auth/password/reset  — field names from backend ResetPasswordRequest DTO
  resetPassword: async (data: {
    email: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/password/reset', {
      email: data.email,
      token: data.token,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
    return response.data;
  },

  // POST /auth/logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
