// src/store/authStore.ts
// Added: updateToken() action for token refresh without full re-login

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  role: UserRole | null;
  logoutReason: string | null;

  setUser: (user: User, accessToken: string) => void;
  updateToken: (accessToken: string) => void;  // ← new: used by token refresh
  updateUser: (partial: Partial<User>) => void;
  logout: (reason?: string) => void;
  clearLogoutReason: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      role: null,
      logoutReason: null,

      setUser: (user, accessToken) =>
        set({
          user,
          token: accessToken,
          isAuthenticated: true,
          role: user.role,
        }),

      // Called by token refresh — updates token without touching user data
      updateToken: (accessToken) =>
        set({ token: accessToken }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      logout: (reason) =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          role: null,
          logoutReason: reason ?? null,
        }),

      clearLogoutReason: () => set({ logoutReason: null }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'skillhub-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);