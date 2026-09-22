// src/utils/storage.ts
// AsyncStorage wrapper with get/set/clear

import AsyncStorage from '@react-native-async-storage/async-storage';
import { QUERY_CACHE_KEY } from '../service/queryClient';

export const storage = {
  get: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // silent fail — non-critical
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {}
  },

  // Clears the session-scoped keys only — NOT the whole AsyncStorage, which
  // also holds the zustand slices, the onboarding flag and UI preferences.
  //
  // The React Query cache is included because it holds the signed-in user's
  // bookings, wallet balance and transactions, persisted for 24h. Leaving it
  // behind means the next account on this device reads the previous user's
  // data off disk before the first refetch lands.
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(['refreshToken', QUERY_CACHE_KEY]);
    } catch {}
  },
};