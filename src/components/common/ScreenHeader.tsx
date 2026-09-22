// src/components/common/ScreenHeader.tsx
// Reusable header — replaces the copy-pasted header rows.
//
// Stacked screens use the default (back arrow + centred title).
// Tab-root screens (Home, Bookings, Wallet, Profile) pass `large`, which
// drops the back arrow and left-aligns a 24px title.

import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: ReactNode;
  showBack?: boolean;
  /** Tab-root treatment: 24px left-aligned title, no back arrow. */
  large?: boolean;
}

export function ScreenHeader({
  title,
  onBack,
  rightElement,
  showBack = true,
  large = false,
}: ScreenHeaderProps) {
  // This header renders inside every stack, so it can't name one param list.
  // It only ever calls goBack(), which exists on all of them — NavigationProp
  // <ParamListBase> expresses exactly that without reaching for `any`.
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { colors: COLORS, isDark } = useAppTheme();
  const s = makeStyles(COLORS, isDark);

  // `large` implies a tab root, which has nothing to go back to.
  const withBack = showBack && !large;

  return (
    <View style={s.header}>
      {withBack ? (
        <TouchableOpacity
          onPress={onBack ?? (() => navigation.goBack())}
          // 22dp glyph + 13 each side = 48dp effective target. At 12 it was 46.
          hitSlop={{ top: 13, bottom: 13, left: 13, right: 13 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      ) : (
        !large && <View style={s.spacer} />
      )}

      <Text style={large ? s.titleLarge : s.title} numberOfLines={1}>
        {title}
      </Text>

      {rightElement ?? (!large && <View style={s.spacer} />)}
    </View>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
      paddingHorizontal: SPACING.screenPadding,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.divider,
      backgroundColor: COLORS.surface,
    },
    title: {
      // Intent: a screen title.
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.textPrimary,
    },
    titleLarge: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.textPrimary,
    },
    spacer: { width: 30 },
  });
