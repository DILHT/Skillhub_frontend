// src/context/ThemeContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';
import { lightColors, darkColors, AppColors, getCardStyle } from '../constants/theme';

interface ThemeContextValue {
  colors: AppColors;
  isDark: boolean;
  cardStyle: object;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  cardStyle: {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();
  const colors = isDark ? darkColors : lightColors;
  const cardStyle = getCardStyle(isDark);

  return (
    <ThemeContext.Provider value={{ colors, isDark, cardStyle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
