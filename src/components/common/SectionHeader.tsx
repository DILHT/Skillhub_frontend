// src/components/common/SectionHeader.tsx
// Replaces the 11 sectionTitle / sectionLabel / cardTitle declarations.
//
// `title`    — 17/600, heading above a list section.
// `overline` — 11/600 uppercase, the small caption inside a card.
// Pick one per screen and stay with it.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

export type SectionHeaderVariant = 'title' | 'overline';

export interface SectionHeaderAction {
  label: string;
  onPress: () => void;
}

export interface SectionHeaderProps {
  title: string;
  variant?: SectionHeaderVariant;
  /** Trailing link, e.g. { label: 'See all', onPress }. */
  action?: SectionHeaderAction;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  variant = 'title',
  action,
  style,
}) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);

  return (
    <View style={[styles.row, style]}>
      <Text style={variant === 'overline' ? styles.overline : styles.title} numberOfLines={2}>
        {title}
      </Text>
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          // ~16dp line box + 16 each side = 48dp effective target. At 8 it was 32.
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          accessibilityRole="button"
        >
          <Text style={styles.action}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
      marginBottom: SPACING.sm,
    },
    title: {
      // Intent: a section heading.
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.textPrimary,
    },
    overline: {
      // Intent: a heading too, just a quieter one — weight stays at 600.
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    action: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: COLORS.primary,
    },
  });
