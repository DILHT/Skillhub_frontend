import React from 'react';
import {
  TouchableOpacity,   // The pressable wrapper (better than Pressable for most cases)
  Text,
  ActivityIndicator,  // The built-in spinner
  StyleSheet,         // Creates optimised style objects
  ViewStyle,          // TypeScript type for style objects
  TextStyle,
  TouchableOpacityProps, // TypeScript type for all TouchableOpacity props
} from 'react-native';
import { COLORS } from '../../constants/colors';     // We define these below
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
 
// ─── TYPES ───────────────────────────────────────────────────────────────────
//
// This interface defines the "contract" for this component.
// Anyone using <Button /> gets TypeScript autocomplete and error checking.
// If they forget a required prop, TypeScript shows a red underline.
 
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
 
// We extend TouchableOpacityProps to inherit all native props (onPress, etc.)
// Then we add our OWN props on top. This is the standard pattern.
interface ButtonProps extends TouchableOpacityProps {
  label: string;           // REQUIRED: the button text
  variant?: ButtonVariant; // OPTIONAL: defaults to 'primary'
  size?: ButtonSize;       // OPTIONAL: defaults to 'md'
  isLoading?: boolean;     // OPTIONAL: shows spinner when true
  leftIcon?: React.ReactNode;  // OPTIONAL: icon before the label
  rightIcon?: React.ReactNode; // OPTIONAL: icon after the label
  fullWidth?: boolean;     // OPTIONAL: stretches to fill container
}
 
// ─── COMPONENT ───────────────────────────────────────────────────────────────
//
// This is a FUNCTIONAL component. In 2024, all React Native components
// are functional (not class-based). React.FC is the TypeScript type.
 
export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',   // Default value — if not passed, use 'primary'
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,                 // Allow consumers to add extra styles
  ...rest                // Spread ALL other TouchableOpacity props (onPress, etc.)
}) => {
 
  // ── STYLE COMPUTATION ──────────────────────────────────────────────────────
  //
  // We compute the final style by combining:
  //   1. The base button style (always applied)
  //   2. The variant style (changes color based on variant prop)
  //   3. The size style (changes padding/height based on size prop)
  //   4. The disabled style (reduces opacity when disabled or loading)
  //   5. The fullWidth style (optional)
  //   6. Any custom style passed by the consumer
 
  const isDisabled = disabled || isLoading; // Disable during loading too
 
  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],  // e.g. styles.variant_primary
    styles[`size_${size}`],        // e.g. styles.size_md
    isDisabled && styles.disabled,
    fullWidth && styles.fullWidth,
    style as ViewStyle,            // Consumer's custom override
  ].filter(Boolean) as ViewStyle[];
 
  const textStyle: TextStyle[] = [
    styles.label,
    styles[`label_${variant}`],
    styles[`label_${size}`],
  ].filter(Boolean) as TextStyle[];
 
  // ── RENDER ─────────────────────────────────────────────────────────────────
 
  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={isDisabled}
      activeOpacity={0.75}  // How transparent on press (0 = invisible, 1 = no change)
      {...rest}             // Spread onPress, testID, accessibilityLabel, etc.
    >
      {/* Show spinner OR content — never both */}
      {isLoading ? (
        <ActivityIndicator
          size="small"
          // Spinner color depends on variant: light spinner on dark bg, dark on light
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
//
// StyleSheet.create() does two important things:
//   1. Validates style objects at startup (catches typos)
//   2. Sends styles to native layer once, not every render (performance)
//
// RULE: All dimensions use our SPACING/COLORS/TYPOGRAPHY constants.
//       Never hardcode numbers like 16 or '#007AFF' directly.
 
const styles = StyleSheet.create({
  // Base style — applied to EVERY button regardless of variant/size
  base: {
    flexDirection: 'row',      // Icon + text side by side
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SPACING.borderRadius.md,
    gap: SPACING.xs,           // Space between icon and text
    borderWidth: 1.5,
    borderColor: 'transparent', // Overridden per variant
  },
 
  // ── VARIANTS (color logic) ──────────────────────────────────────────────
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
 
  // ── SIZES (dimension logic) ─────────────────────────────────────────────
  size_sm: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    minHeight: 36,
  },
  size_md: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    minHeight: 48,    // 48dp minimum tap target — accessibility requirement
  },
  size_lg: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    minHeight: 56,
  },
 
  // ── STATE ───────────────────────────────────────────────────────────────
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
 
  // ── LABEL STYLES ────────────────────────────────────────────────────────
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