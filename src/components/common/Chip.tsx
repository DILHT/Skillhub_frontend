// src/components/common/Chip.tsx
// Filter chips, selectors and tags.
//
// USAGE RULE: always render inside a horizontal ScrollView, never a
// wrapping flex row. A wrapping row compresses every chip when one more
// is added; a scroll view keeps them at their natural width.

import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { Badge } from './Badge';

export type ChipSize = 'sm' | 'md';
export type ChipVariant = 'pill' | 'block';

// A chip is deliberately shorter than a button — MD3 filter chips are 32dp —
// but the *touch target* must still reach 48dp. Rather than inflate the
// visual chip off the type scale, extend the hit area.
//   sm: 4pv*2 + 1bw*2 + ~16 line box ≈ 26dp  → 11 needed each side
//   md: 8pv*2 + 1bw*2 + ~16 line box ≈ 34dp  →  7 needed each side
// Horizontal slop is capped at 4 because chips sit 8dp apart in a row;
// anything larger would overlap the neighbouring chip's touch area.
const HIT_SLOP: Record<ChipSize, { top: number; bottom: number; left: number; right: number }> = {
  sm: { top: 12, bottom: 12, left: 4, right: 4 },
  md: { top: 8, bottom: 8, left: 4, right: 4 },
};

// `icon` is typed to a real glyph name, but callers often hold an arbitrary
// string from the backend (a category's iconUrl, say) which would render as a
// blank square. Narrow it here instead of casting at the call site.
export function toIoniconName(
  value: string | null | undefined,
  fallback: keyof typeof Ionicons.glyphMap = 'grid-outline'
): keyof typeof Ionicons.glyphMap {
  if (value && value in Ionicons.glyphMap) {
    return value as keyof typeof Ionicons.glyphMap;
  }
  return fallback;
}

// The tinted active state appends an alpha suffix to a hex colour, which only
// works for the 6-digit form. Anything else (a named colour, an already-alpha
// 8-digit value) returns undefined so the caller can fall back cleanly.
function hexWithAlpha(color: string, alpha: string): string | undefined {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color + alpha : undefined;
}

export interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  /** sm = dense filter rows (pV 4), md = primary filters (pV 8). Default sm. */
  size?: ChipSize;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Trailing count badge — only rendered when > 0. */
  count?: number;
  /** pill = fully rounded (default), block = radius md for grid selectors. */
  variant?: ChipVariant;
  /**
   * Per-item accent (e.g. a category colour). When set AND active, the chip
   * uses a tint of this colour instead of solid primary. Inactive styling is
   * unchanged, and omitting it leaves default behaviour exactly as-is.
   */
  color?: string;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  active,
  onPress,
  size = 'sm',
  icon,
  count,
  variant = 'pill',
  color,
  style,
}) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);

  // Only an active chip with a colour departs from the default styling.
  const isTinted = Boolean(color) && active;
  const tintedContainer: ViewStyle | undefined = isTinted
    ? {
        // Falls back to the plain surface if the colour isn't 6-digit hex,
        // so the border and label still read against it.
        backgroundColor: hexWithAlpha(color!, '20') ?? COLORS.surface,
        borderColor: color,
      }
    : undefined;

  // Active + colour → the colour itself. Active without colour → white on
  // solid primary, unchanged. Inactive → unchanged either way.
  const contentColor = isTinted
    ? color!
    : active
      ? COLORS.white
      : COLORS.textSecondary;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        active && styles.active,
        tintedContainer,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      hitSlop={HIT_SLOP[size]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'md' ? 16 : 14}
          color={contentColor}
        />
      )}
      <Text
        style={[styles.label, active && styles.labelActive, isTinted && { color }]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {typeof count === 'number' && count > 0 && (
        <Badge label={String(count)} tone={active ? 'neutral' : 'danger'} size="sm" />
      )}
    </TouchableOpacity>
  );
};

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs + 2,
      paddingHorizontal: SPACING.md,
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.surface,
      // A flex container's default cross-axis rule is `stretch`. In a
      // horizontal ScrollView that means chips grow to the full height of the
      // row — and if that row sits in a flex:1 parent, to the whole screen.
      // Opting out here makes the component immune regardless of its parent.
      alignSelf: 'center',
    },
    // Explicit minHeight gives the chip a real intrinsic height instead of one
    // derived from padding, so it stays stable under font scaling too.
    size_sm: { paddingVertical: SPACING.xs, minHeight: 36 },
    size_md: { paddingVertical: SPACING.sm, minHeight: 44 },
    variant_pill: { borderRadius: SPACING.borderRadius.full },
    variant_block: { borderRadius: SPACING.borderRadius.md },
    active: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    label: {
      // Intent: chip labels are secondary metadata, not headings.
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: COLORS.textSecondary,
    },
    labelActive: { color: COLORS.white },
  });
