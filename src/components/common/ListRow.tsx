// src/components/common/ListRow.tsx
// The icon + label + value + chevron row used by Profile, Settings and
// every detail screen. Replaces MenuItem / SettingRow / InfoRow /
// DetailRow / ProfileRow.
//
// Omit `onPress` to get a static info row (no chevron, not tappable).
// Dividers between rows are drawn by <Card divided>, not by the row.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

export type ListRowTone = 'default' | 'danger';

export interface ListRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  /** Right-aligned beside the label, or beneath it when `stacked`. */
  value?: string | React.ReactNode;
  /** Omit for a static info row — no chevron, no press feedback. */
  onPress?: () => void;
  tone?: ListRowTone;
  /** Trailing element (Switch, Badge, custom). Suppresses the chevron. */
  right?: React.ReactNode;
  /** Label above value, for detail rows rather than menu rows. */
  stacked?: boolean;
  style?: ViewStyle;
}

export const ListRow: React.FC<ListRowProps> = ({
  icon,
  label,
  value,
  onPress,
  tone = 'default',
  right,
  stacked = false,
  style,
}) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);

  const isDanger = tone === 'danger';
  // A chevron promises navigation — only show it when the row is tappable
  // and nothing else already occupies the trailing slot.
  const showChevron = Boolean(onPress) && !right && !isDanger;

  const content = (
    <>
      {icon && (
        <View style={[styles.iconBox, isDanger && styles.iconBoxDanger]}>
          <Ionicons name={icon} size={18} color={isDanger ? COLORS.danger : COLORS.primary} />
        </View>
      )}

      <View style={[styles.textCol, stacked && styles.textColStacked]}>
        <Text
          style={[
            stacked ? styles.labelStacked : styles.label,
            isDanger && styles.labelDanger,
          ]}
          numberOfLines={stacked ? 1 : 2}
        >
          {label}
        </Text>
        {stacked && typeof value === 'string' && (
          <Text style={styles.valueStacked}>{value}</Text>
        )}
        {stacked && value !== undefined && typeof value !== 'string' && value}
      </View>

      {!stacked && typeof value === 'string' && (
        <Text style={styles.value} numberOfLines={2}>
          {value}
        </Text>
      )}
      {!stacked && value !== undefined && typeof value !== 'string' && value}

      {right}
      {showChevron && (
        <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
      )}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, style]}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={[styles.row, style]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      {content}
    </TouchableOpacity>
  );
};

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.screenPadding,
      // Deliberately transparent: the surface belongs to the containing
      // <Card>. A square background here would paint over the card's
      // rounded corners, and clipping it away would kill the iOS shadow.
      backgroundColor: 'transparent',
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: SPACING.borderRadius.md,
      backgroundColor: COLORS.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBoxDanger: { backgroundColor: COLORS.errorBg },
    textCol: { flex: 1 },
    textColStacked: { gap: 2 },
    label: {
      // Intent: a row label is the emphasised half of the pair.
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.textPrimary,
    },
    labelStacked: {
      // Stacked rows invert the emphasis: the label is a caption above the
      // value, so it takes the lighter weight and the value carries the row.
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: COLORS.textTertiary,
    },
    labelDanger: { color: COLORS.danger },
    value: {
      // Intent: secondary metadata sitting beside the label.
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: COLORS.textSecondary,
      textAlign: 'right',
      flexShrink: 1,
    },
    valueStacked: {
      // Intent: the emphasised content of a detail row.
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.textPrimary,
    },
  });
