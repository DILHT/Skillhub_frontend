// src/hooks/useAuth.ts
// Updated Lesson 05 — connects/disconnects socket alongside auth

import { useMutation } from '@tanstack/react-query';
import { authService } from '../service/authService';
import { socketService } from '../service/socketService';
import { useAuthStore } from '../store/authStore';
import { storage } from '../utils/storage';

export function useAuth() {
  const { setUser, logout: clearStore } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authService.login(data),

    onSuccess: async (data) => {
      await storage.set('refreshToken', data.refreshToken);
      setUser(data.user, data.token);

      // Connect socket immediately after login so real-time
      // features are available as soon as the app tab loads
      socketService.connect(data.token);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: async (data) => {
      await storage.set('refreshToken', data.refreshToken);
      setUser(data.user, data.token);
      socketService.connect(data.token);
    },
  });

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the API fails we still log out locally
    } finally {
      socketService.disconnect(); // Close socket before clearing state
      clearStore();
      await storage.clear();
    }
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: (loginMutation.error as any)?.message,

    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: (registerMutation.error as any)?.message,

    logout: handleLogout,
  };
}