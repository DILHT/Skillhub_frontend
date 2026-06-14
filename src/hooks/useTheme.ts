// src/hooks/useTheme.ts

import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const mode = useThemeStore((s) => s.mode);

  const isDark =
    mode === 'dark' ||
    (mode === 'system' && systemScheme === 'dark');

  return { isDark, mode };
}