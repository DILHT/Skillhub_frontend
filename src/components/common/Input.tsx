import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  TextInputProps,  // All native TextInput props
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY } from '@/constants/typography';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
 
// ─── TYPES ───────────────────────────────────────────────────────────────────
 
interface InputProps extends TextInputProps {
  label?: string;          // The floating label above the field
  error?: string;          // Error message from react-hook-form
  hint?: string;           // Helper text below the field
  leftIcon?: keyof typeof Ionicons.glyphMap;   // Ionicon name
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isRequired?: boolean;    // Shows a red asterisk on the label
}
 
// ─── COMPONENT ───────────────────────────────────────────────────────────────
//
// forwardRef is REQUIRED for react-hook-form to control this input.
// Without it, the form cannot focus the field or read its value.
//
// How forwardRef works:
//   <Input ref={someRef} />
//   The ref is "forwarded" into the native <TextInput>, so react-hook-form
//   can call someRef.current.focus() on it directly.
 
export const Input = forwardRef<any, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isRequired = false,
  secureTextEntry,
  style,
  ...rest
}, ref) => {
 
  // ── LOCAL STATE ────────────────────────────────────────────────────────────
  //
  // These states only affect THIS component's appearance.
  // They are NOT in Zustand because nothing outside this component cares.
  // Rule: local UI state stays in useState. Shared app state goes to Zustand.
 
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
 
  // If this is a password field, we manage visibility internally
  const isPasswordField = secureTextEntry;
  const shouldHideText = isPasswordField && !isPasswordVisible;
 
  // ── DERIVED STYLES ─────────────────────────────────────────────────────────
  //
  // The border changes color based on state:
  //   error → red border (highest priority)
  //   focused → primary color border
  //   default → gray border
 
  const containerBorderColor = error
    ? COLORS.danger
    : isFocused
    ? COLORS.primary
    : COLORS.border;
 
  // ── RENDER ─────────────────────────────────────────────────────────────────
 
  return (
    <View style={inputStyles.wrapper}>
 
      {/* LABEL */}
      {label && (
        <View style={inputStyles.labelRow}>
          <Text style={inputStyles.label}>{label}</Text>
          {isRequired && (
            <Text style={inputStyles.requiredStar}> *</Text>
          )}
        </View>
      )}
 
      {/* INPUT CONTAINER — the visible box */}
      <View style={[
        inputStyles.container,
        { borderColor: containerBorderColor },
        isFocused && inputStyles.focused,
      ]}>
 
        {/* LEFT ICON */}
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? COLORS.primary : COLORS.textSecondary}
            style={inputStyles.leftIcon}
          />
        )}
 
        {/* THE ACTUAL TEXT INPUT */}
        <TextInput
          ref={ref}           // Forward the ref here — this is the key line
          style={[inputStyles.input, style]}
          secureTextEntry={shouldHideText}
          placeholderTextColor={COLORS.textTertiary}
 
          // Track focus state to change border color
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e); // Call consumer's onFocus too (if provided)
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);  // Call consumer's onBlur too (if provided)
          }}
 
          {...rest} // Spread all other props: value, onChangeText, placeholder, etc.
        />
 
        {/* RIGHT ICON — either a custom icon or password toggle */}
        {isPasswordField ? (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
            <Ionicons name={rightIcon} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
 
      {/* ERROR MESSAGE — shown when error prop is provided */}
      {error && (
        <View style={inputStyles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color={COLORS.danger} />
          <Text style={inputStyles.errorText}>{error}</Text>
        </View>
      )}
 
      {/* HINT TEXT — shown when no error */}
      {hint && !error && (
        <Text style={inputStyles.hintText}>{hint}</Text>
      )}
    </View>
  );
});
 
// Required when using forwardRef — gives the component a name in React DevTools
Input.displayName = 'Input';
 
const inputStyles = StyleSheet.create({
  wrapper: {
    gap: SPACING.xs,       // Space between label, input, and error
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  requiredStar: {
    color: COLORS.danger,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: SPACING.borderRadius.md,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: SPACING.md,
    minHeight: 52,
    gap: SPACING.sm,
  },
  focused: {
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,               // Takes all remaining space inside the container
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  leftIcon: {
    // No extra style needed — gap on container handles spacing
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.danger,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    flex: 1,
  },
  hintText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
});