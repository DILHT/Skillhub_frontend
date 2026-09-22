// // src/navigation/index.tsx

// import React, { useEffect, useState } from 'react';
// import { View, ActivityIndicator } from 'react-native';
// import { useAuthStore } from '../store/authStore';
// import { authService } from '../service/authService';
// import AuthNavigator from './AuthNavigator';
// import AppNavigator from './AppNavigator';
// import { COLORS } from '../constants/colors';

// export default function RootNavigator() {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   const isHydrated = useAuthStore((state) => state.isHydrated);
//   const logout = useAuthStore((state) => state.logout);
//   const [isValidating, setIsValidating] = useState(false);

//   useEffect(() => {
//     if (!isHydrated) return;
//     if (!isAuthenticated) return;

//     // Verify the persisted token is still accepted by the backend.
//     // If it fails (expired, dev-token, server restart, etc.) → force logout.
//     setIsValidating(true);
//     authService.getProfile()
//       .then(() => setIsValidating(false))
//       .catch(() => {
//         logout();
//         setIsValidating(false);
//       });
//   }, [isHydrated]);

//   if (!isHydrated || isValidating) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//       </View>
//     );
//   }

//   return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
// }
// src/navigation/index.tsx

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import { authService } from '../service/authService';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import { COLORS } from '../constants/colors';

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const logout = useAuthStore((state) => state.logout);
  const [isValidating, setIsValidating] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenOnboarding')
      .then((val) => {
        setHasSeenOnboarding(val === 'true');
      })
      // The render gate below is `hasSeenOnboarding === null`, so leaving this
      // unresolved means an infinite launch spinner with no way out. Treat a
      // failed read as "not seen" — showing onboarding once more is recoverable;
      // never booting is not.
      .catch(() => setHasSeenOnboarding(false));
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) return;

    // In mock/demo mode there is no backend to validate against —
    // trust the persisted session so the demo survives app restarts.
    if (process.env.EXPO_PUBLIC_USE_MOCK === 'true') {
      setIsValidating(false);
      return;
    }

    // Verify the persisted token is still accepted by the backend.
    // If it fails (expired, dev-token, server restart, etc.) → force logout.
    setIsValidating(true);
    authService.getProfile()
      .then(() => setIsValidating(false))
      .catch(() => {
        logout();
        setIsValidating(false);
      });
  }, [isHydrated]);

  if (!isHydrated || isValidating || hasSeenOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!hasSeenOnboarding) {
    return <OnboardingScreen onDone={() => setHasSeenOnboarding(true)} />;
  }

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}