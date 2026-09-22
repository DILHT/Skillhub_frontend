// src/components/common/Badge.tsx
// Small status/count pill. Tone colours come from theme tokens — never
// inline hex, so light and dark stay in step automatically.

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

export type BadgeTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  /** sm = count badges, md = status pills. Defaults to md. */
  size?: BadgeSize;
  style?: ViewStyle;
}

interface ToneColors {
  bg: string;
  text: string;
}

// One place that maps a semantic tone onto the palette.
function getToneColors(tone: BadgeTone, COLORS: AppColors): ToneColors {
  const map: Record<BadgeTone, ToneColors> = {
    neutral: { bg: COLORS.surfaceSecondary, text: COLORS.textSecondary },
    success: { bg: COLORS.successBg, text: COLORS.successText },
    warning: { bg: COLORS.warningBg, text: COLORS.warningText },
    danger: { bg: COLORS.errorBg, text: COLORS.errorText },
    info: { bg: COLORS.infoLight, text: COLORS.info },
    accent: { bg: COLORS.primaryLight, text: COLORS.primary },
  };
  return map[tone];
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  tone = 'neutral',
  size = 'md',
  style,
}) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const { bg, text } = getToneColors(tone, COLORS);

  return (
    <View style={[styles.badge, styles[`size_${size}`], { backgroundColor: bg }, style]}>
      <Text style={[styles.label, styles[`label_${size}`], { color: text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const makeStyles = (_COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    badge: {
      borderRadius: SPACING.borderRadius.full,
      alignSelf: 'flex-start',
      alignItems: 'center',
      justifyContent: 'center',
    },
    size_sm: {
      paddingHorizontal: SPACING.xs + 2,
      paddingVertical: 1,
      minWidth: 18,
    },
    size_md: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: 3,
    },
    label: {
      // Intent: badge text is an emphasised micro-label.
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    label_sm: { fontSize: 10 },
    label_md: { fontSize: TYPOGRAPHY.fontSize.xs },
  });
