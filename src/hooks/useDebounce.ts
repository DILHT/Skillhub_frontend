// =============================================================================
// FILE 4: src/hooks/useDebounce.ts
// =============================================================================
//
// WHAT IS DEBOUNCING?
//   Without debounce: user types "plumber" (7 chars) → 7 API calls
//   With debounce: user types "plumber" → waits 400ms → 1 API call
//
// Essential for search inputs. Saves bandwidth (critical for Africa)
// and prevents your backend from being hammered by every keystroke.
//
// HOW IT WORKS:
//   1. User types a character → sets a 400ms timer
//   2. User types another character → CANCELS previous timer, sets new one
//   3. User stops typing → 400ms passes → debounced value updates
//   4. useServices() sees the new value → fires the API call
 
import { useState, useEffect } from 'react';
 
export function useDebounce<T>(value: T, delayMs: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
 
  useEffect(() => {
    // Start a timer to update the debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);
 
    // CLEANUP FUNCTION: React calls this when:
    //   a) value changes (cancels the previous timer before setting a new one)
    //   b) component unmounts (prevents state update on unmounted component)
    return () => clearTimeout(timer);
  }, [value, delayMs]);
 
  return debouncedValue;
}
 
// Usage in SearchScreen:
//   const [searchText, setSearchText] = useState('');
//   const debouncedSearch = useDebounce(searchText, 400);
//   const { data } = useServices({ search: debouncedSearch });
//   // debouncedSearch only changes 400ms after the user stops typing
 