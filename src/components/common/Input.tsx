import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY } from '@/constants/typography';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isRequired?: boolean;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

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
  const { colors: COLORS, isDark } = useAppTheme();
  const inputStyles = makeStyles(COLORS, isDark);

  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPasswordField = secureTextEntry;
  const shouldHideText = isPasswordField && !isPasswordVisible;

  const containerBorderColor = error
    ? COLORS.danger
    : isFocused
    ? COLORS.primary
    : COLORS.border;

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

      {/* INPUT CONTAINER */}
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
          ref={ref}
          style={[inputStyles.input, style]}
          secureTextEntry={shouldHideText}
          placeholderTextColor={COLORS.textTertiary}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />

        {/* RIGHT ICON */}
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

      {/* ERROR MESSAGE */}
      {error && (
        <View style={inputStyles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color={COLORS.danger} />
          <Text style={inputStyles.errorText}>{error}</Text>
        </View>
      )}

      {/* HINT TEXT */}
      {hint && !error && (
        <Text style={inputStyles.hintText}>{hint}</Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const makeStyles = (COLORS: AppColors, isDark: boolean) => StyleSheet.create({
  wrapper: {
    gap: SPACING.xs,
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
    backgroundColor: isDark ? COLORS.surface : COLORS.white,
  },
  input: {
    flex: 1,
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
