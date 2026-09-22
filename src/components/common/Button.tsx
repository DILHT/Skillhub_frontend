import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

// Variants that paint a solid colour behind the label. Their label and
// spinner are white; every other variant sits on the surface and uses
// the primary tint.
const SOLID_VARIANTS: ReadonlySet<ButtonVariant> = new Set<ButtonVariant>([
  'primary',
  'danger',
  'success',
]);

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...rest
}) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);

  const isDisabled = disabled || isLoading;

  // Explicit Record lookups instead of styles[`variant_${variant}`]. The
  // template-literal form is unchecked, so a variant added to only one of
  // the two style groups would silently render unstyled. These maps make
  // TypeScript demand every variant and size appear in all four places.
  const containerByVariant: Record<ButtonVariant, ViewStyle> = {
    primary:   styles.variant_primary,
    secondary: styles.variant_secondary,
    outline:   styles.variant_outline,
    danger:    styles.variant_danger,
    ghost:     styles.variant_ghost,
    success:   styles.variant_success,
  };
  const labelByVariant: Record<ButtonVariant, TextStyle> = {
    primary:   styles.label_primary,
    secondary: styles.label_secondary,
    outline:   styles.label_outline,
    danger:    styles.label_danger,
    ghost:     styles.label_ghost,
    success:   styles.label_success,
  };
  const containerBySize: Record<ButtonSize, ViewStyle> = {
    sm: styles.size_sm,
    md: styles.size_md,
    lg: styles.size_lg,
  };
  const labelBySize: Record<ButtonSize, TextStyle> = {
    sm: styles.label_sm,
    md: styles.label_md,
    lg: styles.label_lg,
  };

  const containerStyle: ViewStyle[] = [
    styles.base,
    containerByVariant[variant],
    containerBySize[size],
    isDisabled && styles.disabled,
    fullWidth && styles.fullWidth,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.label,
    labelByVariant[variant],
    labelBySize[size],
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={isDisabled}
      activeOpacity={0.75}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={SOLID_VARIANTS.has(variant) ? COLORS.white : COLORS.primary}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          {/* numberOfLines keeps a long label from wrapping and growing the
              button taller than its neighbours in a flex:1 action bar. */}
          <Text style={textStyle} numberOfLines={1}>
            {label}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SPACING.borderRadius.md,
    gap: SPACING.xs,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  // ── VARIANTS ───────────────────────────────────────────────────────────────
  variant_primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  variant_secondary: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
  },
  variant_danger: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  variant_success: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },

  // ── SIZES ──────────────────────────────────────────────────────────────────
  size_sm: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    minHeight: 36,
  },
  size_md: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    minHeight: 48,
  },
  size_lg: {
    // SPACING.lg (24), not xl (32): 32 each side left too little room for
    // the label once a button was constrained by flex:1.
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 56,
  },

  // ── STATE ──────────────────────────────────────────────────────────────────
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },

  // ── LABEL STYLES ───────────────────────────────────────────────────────────
  label: {
    // Real weight — fontFamily.medium resolved to the same system face as
    // regular, so button labels never actually rendered heavier.
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: 0.2,
  },
  label_primary: { color: COLORS.white },
  label_secondary: { color: COLORS.primary },
  label_outline: { color: COLORS.primary },
  label_danger: { color: COLORS.white },
  label_ghost: { color: COLORS.primary },
  label_success: { color: COLORS.white },

  label_sm: { fontSize: TYPOGRAPHY.fontSize.sm },
  label_md: { fontSize: TYPOGRAPHY.fontSize.md },
  label_lg: { fontSize: TYPOGRAPHY.fontSize.lg },
});
