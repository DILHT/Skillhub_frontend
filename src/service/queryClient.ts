// src/service/queryClient.ts
//
// The QueryClient singleton lives here rather than inside App.tsx so that
// non-React code can reach it — specifically the two logout paths:
//   1. useAuth.handleLogout()        — the user signs out
//   2. api.ts refresh-failure branch — the session expired
// Both must wipe the cache, or the next account on the device reads the
// previous user's bookings, wallet and transactions from the persisted copy.

import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const QUERY_CACHE_KEY = 'skillhub-query-cache';
export const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60 * 1000,
      gcTime: TWENTY_FOUR_HOURS,
    },
    mutations: {
      retry: false,
    },
  },
});

// Drops both the in-memory cache and the AsyncStorage copy the persister
// writes. Clearing only the in-memory client is not enough: the persister
// rehydrates from disk on next launch and the stale data comes back.
export async function clearQueryCache(): Promise<void> {
  queryClient.clear();
  try {
    await AsyncStorage.removeItem(QUERY_CACHE_KEY);
  } catch {
    // Non-fatal — the in-memory clear above has already taken effect.
  }
}
