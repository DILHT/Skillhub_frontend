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

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

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

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    isDisabled && styles.disabled,
    fullWidth && styles.fullWidth,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.label,
    styles[`label_${variant}`],
    styles[`label_${size}`],
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
          color={variant === 'primary' ? COLORS.white : COLORS.primary}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={textStyle}>{label}</Text>
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
    paddingHorizontal: SPACING.xl,
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
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    letterSpacing: 0.2,
  },
  label_primary: { color: COLORS.white },
  label_secondary: { color: COLORS.primary },
  label_outline: { color: COLORS.primary },
  label_danger: { color: COLORS.white },
  label_ghost: { color: COLORS.primary },

  label_sm: { fontSize: TYPOGRAPHY.fontSize.sm },
  label_md: { fontSize: TYPOGRAPHY.fontSize.md },
  label_lg: { fontSize: TYPOGRAPHY.fontSize.lg },
});
