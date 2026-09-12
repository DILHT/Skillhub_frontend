import { Platform } from 'react-native';

export const lightColors = {
  // Brand
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryDark: '#1D4ED8',

  // Semantic
  success: '#16A34A',
  successLight: '#F0FDF4',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  info: '#0284C7',
  infoLight: '#F0F9FF',

  // Semantic box colors (error / success feedback boxes)
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  errorText: '#DC2626',
  successBg: '#F0FDF4',
  successBorder: '#86EFAC',
  successText: '#15803D',
  warningBg: '#FEF3C7',
  warningBorder: '#FCD34D',
  warningText: '#92400E',

  // Surfaces — pure white and light grey, zero blue tint
  background: '#f1f5f9',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  shadow: '#F8FAFC',
  border: '#E2E8F0',
  divider: '#F1F5F9',
  inputBackground: '#F8FAFC',

  // Text — high contrast dark on white
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textDisabled: '#CBD5E1',
  textOnPrimary: '#FFFFFF',

  // Tab bar
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const darkColors = {
  // Brand — slightly lighter blue for dark backgrounds
  primary: '#3B82F6',
  primaryLight: '#1E3A8A',
  primaryDark: '#2563EB',

  // Semantic
  success: '#22C55E',
  successLight: '#052E16',
  warning: '#F59E0B',
  warningLight: '#1C1400',
  danger: '#EF4444',
  dangerLight: '#1F0000',
  info: '#38BDF8',
  infoLight: '#0C1A2E',

  // Semantic box colors (error / success feedback boxes)
  errorBg: '#2A1212',
  errorBorder: '#5C2626',
  errorText: '#F87171',
  successBg: '#0F2417',
  successBorder: '#1E5234',
  successText: '#4ADE80',
  warningBg: '#1C1400',
  warningBorder: '#92400E',
  warningText: '#F59E0B',

  // Surfaces — PURE GREY, zero blue tint
  background: '#111827',
  surface: '#1F2937',
  surfaceSecondary: '#374151',
  shadow: '#9CA3AF',
  border: '#374151',
  divider: '#1F2937',
  inputBackground: '#374151',


  // Text — high contrast on dark grey
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textDisabled: '#4B5563',
  textOnPrimary: '#FFFFFF',

  // Tab bar
  tabBar: '#1F2937',
  tabBarBorder: '#374151',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type AppColors = typeof lightColors;

export const getCardStyle = (isDark: boolean) => ({
  backgroundColor: isDark ? darkColors.surface : lightColors.surface,
  ...(isDark
    ? { borderWidth: 1, borderColor: darkColors.border }
    : {
        ...Platform.select({
          ios: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
          android: { elevation: 3 },
        }),
      }),
});
