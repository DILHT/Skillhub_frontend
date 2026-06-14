// src/hooks/useAuth.ts
// Auth mutations are not retried because registration/verification are not idempotent.

import { useMutation } from '@tanstack/react-query';
import { authService } from '../service/authService';
import { socketService } from '../service/socketService';
import { useAuthStore } from '../store/authStore';
import { storage } from '../utils/storage';
import { User } from '../types/user.types';

function normalizeUserRole(role: unknown): User['role'] {
  if (role === 'PROVIDER' || role === 'provider') return 'provider';
  if (role === 'BOTH' || role === 'both') return 'both';
  if (role === 'ADMIN' || role === 'admin') return 'admin';
  return 'client';
}

function buildUserFromAuthResponse(authUser: any): User {
  return {
    id: authUser?.id ?? '',
    email: authUser?.email,
    phone: authUser?.phone,
    fullName: authUser?.fullName,
    firstName: authUser?.firstName,
    lastName: authUser?.lastName,
    profilePicture: authUser?.profilePicture ?? null,
    avatar: authUser?.profilePicture ?? null,
    role: normalizeUserRole(authUser?.role),
    emailVerified: authUser?.emailVerified,
    phoneVerified: authUser?.phoneVerified,
    twoFactorEnabled: authUser?.twoFactorEnabled,
    isVerified: authUser?.emailVerified || authUser?.phoneVerified,
  };
}

async function handleAuthSuccess(
  data: { accessToken: string; refreshToken: string; user?: any },
  setUser: (user: User, token: string) => void
) {
  await storage.set('refreshToken', data.refreshToken);
  let user = buildUserFromAuthResponse(data.user);

  try {
    const fullProfile = await authService.getProfile();
    user = {
      ...user,
      ...fullProfile,
      role: normalizeUserRole(fullProfile.role),
      avatar: fullProfile.profilePicture ?? null,
      isVerified: fullProfile.emailVerified || fullProfile.phoneVerified,
    };
  } catch {
    // Non-fatal — use minimal user from token response
  }

  setUser(user, data.accessToken);
  socketService.connect(data.accessToken);
}

interface UseAuthOptions {
  onRegisterSuccess?: (email: string, firstName: string, lastName: string) => void;
  onEmailNotVerified?: (email: string) => void;
}

function maskEmail(email?: string) {
  if (!email) return undefined;
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.slice(0, 2)}***@${domain}`;
}

function getErrorDetails(error: unknown) {
  const err = error as Error & { status?: number; code?: string };
  return {
    message: err?.message ?? 'Unknown error',
    status: err?.status,
    code: err?.code,
  };
}

function logAuthEvent(event: string, details?: Record<string, unknown>) {
  if (!__DEV__) return;
  console.info(`[AUTH] ${event}`, details ?? {});
}

function logAuthError(event: string, error: unknown) {
  if (!__DEV__) return;
  console.warn(`[AUTH] ${event}`, getErrorDetails(error));
}

export function useAuth(options: UseAuthOptions = {}) {
  const { setUser, logout: clearStore } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authService.login(data),
    retry: false,
    onMutate: (variables) => {
      logAuthEvent('login:start', { email: maskEmail(variables.email) });
    },
    onSuccess: async (data) => {
      logAuthEvent('login:success', { hasAccessToken: Boolean(data.accessToken) });
      await handleAuthSuccess(data, setUser);
    },
    onError: (error, variables) => {
      logAuthError('login:error', error);
      const err = error as any;
      // 403 means account exists but email not yet verified — take user to OTP screen
      if (err?.status === 403 && options.onEmailNotVerified) {
        logAuthEvent('login:redirect-to-verify', { email: maskEmail(variables.email) });
        options.onEmailNotVerified(variables.email);
      }
    },
  });

  const registerStep1Mutation = useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: 'client' | 'provider';
    }) => authService.registerStep1(data),
    retry: false,
    onMutate: (variables) => {
      logAuthEvent('register:start', {
        email: maskEmail(variables.email),
        role: variables.role,
      });
    },
    onSuccess: (_data, variables) => {
      logAuthEvent('register:otp-sent', { email: maskEmail(variables.email) });
      options.onRegisterSuccess?.(variables.email, variables.firstName, variables.lastName);
    },
    onError: (error, variables) => {
      logAuthError('register:error', error);
      const err = error as any;
      // 409 means the first request reached the server (user + OTP created) but the
      // response was lost to a network error.  The account exists and an OTP was sent,
      // so forward the user to OTP verification instead of showing a dead-end error.
      if (err?.status === 409 && options.onRegisterSuccess) {
        logAuthEvent('register:already-exists-redirect-otp', { email: maskEmail(variables.email) });
        options.onRegisterSuccess(variables.email, variables.firstName, variables.lastName);
      }
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (data: { email: string; otp: string; firstName?: string; lastName?: string }) =>
      authService.verifyEmailOTP({ email: data.email, otp: data.otp }),
    retry: false,
    onMutate: (variables) => {
      logAuthEvent('verify-otp:start', {
        email: maskEmail(variables.email),
        otpLength: variables.otp.length,
      });
    },
    onSuccess: async (data) => {
      logAuthEvent('verify-otp:success', { hasAccessToken: Boolean(data.accessToken) });
      await handleAuthSuccess(data, setUser);
    },
    onError: (error) => {
      logAuthError('verify-otp:error', error);
    },
  });

  const handleLogout = async () => {
    logAuthEvent('logout:start');
    try { await authService.logout(); } catch {}
    socketService.disconnect();
    clearStore();
    await storage.clear();
    logAuthEvent('logout:complete');
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error?.message,

    registerStep1: registerStep1Mutation.mutate,
    isRegistering: registerStep1Mutation.isPending,
    registerError: registerStep1Mutation.error?.message,
    registerErrorStatus: (registerStep1Mutation.error as any)?.status as number | undefined,

    verifyOTP: verifyOTPMutation.mutate,
    isVerifying: verifyOTPMutation.isPending,
    verifyError: verifyOTPMutation.error?.message,

    logout: handleLogout,
  };
}
