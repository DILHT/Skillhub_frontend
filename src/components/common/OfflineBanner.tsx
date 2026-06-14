// src/components/common/OfflineBanner.tsx
// Shows a persistent banner when there is no internet connection

import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';

export function OfflineBanner() {
  const { colors: COLORS } = useAppTheme();
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = useState(new Animated.Value(-60))[0];
  const styles = makeStyles(COLORS);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(!!offline);

      Animated.timing(slideAnim, {
        toValue: offline ? 0 : -60,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return unsubscribe;
  }, []);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}
    >
      <Ionicons name="wifi-outline" size={16} color={COLORS.white} />
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const makeStyles = (COLORS: AppColors) => StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingTop: 50,
    zIndex: 9999,
  },
  text: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
  },
});
