// src/navigation/index.tsx
// =============================================================================
// ROOT NAVIGATOR — the auth gate
// =============================================================================
// ONE JOB: read isAuthenticated from the store and render the correct navigator.
//
// When isAuthenticated changes (login or logout), this component re-renders
// automatically and React Navigation swaps the navigator tree.
//
// The dev login bypass lives in LoginScreen (the __DEV__ buttons).
// It does NOT belong here — having bypass logic here breaks the auth gate
// because __DEV__ is always true in development, so the gate never checks
// the real auth state.
// =============================================================================

import React from 'react';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  // Subscribe to isAuthenticated only — component re-renders when this changes.
  // Reading only the slice you need (not the whole store object) is more
  // efficient: if user.firstName changes, this component does NOT re-render.
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // That's it. One condition. Two outcomes.
  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}