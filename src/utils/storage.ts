// src/utils/storage.ts
// AsyncStorage wrapper with get/set/clear

import AsyncStorage from '@react-native-async-storage/async-storage';

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

  clear: async (): Promise<void> => {
    try {
      // Only clear app-specific keys, not the entire AsyncStorage
      // (zustand/persist also uses AsyncStorage)
      await AsyncStorage.removeItem('refreshToken');
    } catch {}
  },
};