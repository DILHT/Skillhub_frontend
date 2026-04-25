// App.tsx
// PURPOSE: The entry point of the entire application.
// RULE: This file only sets up "providers" — wrappers that give
// the whole app access to navigation, data fetching, and state.
// It should contain ZERO business logic.

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation';

// Create the React Query client once at the app level.
// This manages ALL your API call caching and loading states.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,          // Retry failed requests twice (good for low-bandwidth Africa networks)
      staleTime: 30000,  // Consider data fresh for 30 seconds before refetching
    },
  },
});

export default function App() {
  return (
    // SafeAreaProvider: handles iPhone notches and Android status bars
    <SafeAreaProvider>
      {/* QueryClientProvider: gives every component access to useQuery/useMutation */}
      <QueryClientProvider client={queryClient}>
        {/* NavigationContainer: the root container for ALL navigation */}
        <NavigationContainer>
          {/* RootNavigator decides: show Auth screens OR show Main app */}
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}