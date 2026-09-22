// App.tsx
// Added: ErrorBoundary wrapping entire app
// Added: OfflineBanner for no-internet detection
// Note: install @react-native-community/netinfo first:
//   npx expo install @react-native-community/netinfo

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { OfflineBanner } from './src/components/common/OfflineBanner';
import RootNavigator from './src/navigation';
import { ThemeProvider } from './src/context/ThemeContext';
// The client and its cache key live in src/service/queryClient so the logout
// paths outside React can clear them. Do not re-create a QueryClient here.
import {
  queryClient,
  QUERY_CACHE_KEY,
  TWENTY_FOUR_HOURS,
} from './src/service/queryClient';

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: QUERY_CACHE_KEY,
});

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister, maxAge: TWENTY_FOUR_HOURS }}
          >
            <NavigationContainer>
              <StatusBar style="auto" />
              <OfflineBanner />
              <RootNavigator />
            </NavigationContainer>
          </PersistQueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}