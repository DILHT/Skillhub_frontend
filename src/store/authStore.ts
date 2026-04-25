// src/store/authStore.ts
// PURPOSE: The single source of truth for authentication state.
// Every component in the app that needs to know "is the user logged in?"
// or "what is the user's role?" reads from HERE.
//
// Zustand is our state manager. Think of it as a "global useState" that
// any component can subscribe to — no prop drilling, no Context boilerplate.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user.types';

// TypeScript interface: defines the exact shape of our auth state.
// Having this means TypeScript will tell you if you try to access
// a property that doesn't exist.
interface AuthState {
  // STATE (data)
  user: User | null;          // null = not logged in
  token: string | null;       // JWT token from backend
  isAuthenticated: boolean;   // convenience boolean
  role: 'client' | 'provider' | null; // controls which features are visible

  // ACTIONS (functions that change the state)
  setUser: (user: User, token: string) => void;   // called after successful login
  logout: () => void;                              // clears everything
  updateUser: (partial: Partial<User>) => void;   // update profile info
}

// create() makes the Zustand store.
// persist() wraps it so state survives app restarts (stored in AsyncStorage).
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state (app just opened, no one is logged in)
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,

      // Called when login API succeeds.
      // We update all auth-related state in one operation (atomic update).
      setUser: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          role: user.role, // comes from backend: 'client' or 'provider'
        }),

      // Called on logout button press or when token expires.
      // Reset everything to initial state.
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          role: null,
        }),

      // Called when user edits their profile.
      // Partial<User> means "any subset of User fields" — very flexible.
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: 'skillhub-auth',           // key used in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // use mobile storage
      // Only persist these fields. Don't persist sensitive session data
      // you don't need across restarts.
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
);