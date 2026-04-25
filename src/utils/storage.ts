// AsyncStorage wrappers — always wrap raw AsyncStorage calls.
// WHY: Raw AsyncStorage has no TypeScript generics, no error handling,
//      and no JSON parsing. Our wrapper adds all three.
 
import AsyncStorage from '@react-native-async-storage/async-storage';
 
export const storage = {
  // Save any value (automatically serialized to JSON)
  set: async <T>(key: string, value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage.set failed for key "${key}":`, error);
    }
  },
 
  // Get a value (automatically parsed from JSON)
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Storage.get failed for key "${key}":`, error);
      return null;
    }
  },
 
  // Remove a specific key
  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage.remove failed for key "${key}":`, error);
    }
  },
 
  // Clear ALL stored data (used on logout)
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage.clear failed:', error);
    }
  },
};