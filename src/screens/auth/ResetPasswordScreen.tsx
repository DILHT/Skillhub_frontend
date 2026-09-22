// src/screens/auth/ResetPasswordScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/common';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { authService } from '@/service/authService';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { AuthStackParamList } from '@/navigation/AuthNavigator';

// Must match RegisterScreen exactly
const PASSWORD_SPECIAL = /[!@#$%^&*]/;

const schema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*${PASSWORD_SPECIAL.source})`),
      'Password must include uppercase, lowercase, number, and special character'
    ),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const RESEND_COUNTDOWN = 60;

export default function ResetPasswordScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'ResetPassword'>>();
  const { email } = route.params;

  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [isResendError, setIsResendError] = useState(false);
  const tokenInputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    setTimeout(() => tokenInputRef.current?.focus(), 300);
    startCountdown();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function startCountdown() {
    setCountdown(RESEND_COUNTDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage('');
    setIsResendError(false);
    try {
      await authService.forgotPassword(email);
      setResendMessage('A new code has been sent to your email.');
      startCountdown();
    } catch (e: any) {
      setResendMessage(e?.message ?? 'Failed to resend. Please try again.');
      setIsResendError(true);
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (token.length !== 6) {
      setApiError('Please enter the 6-digit code from your email.');
      return;
    }
    setIsLoading(true);
    setApiError('');
    try {
      await authService.resetPassword({
        email,
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      Alert.alert(
        'Password Reset',
        'Your password has been reset successfully. You can now sign in with your new password.',
        [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }]
      );
    } catch (e: any) {
      setApiError(e?.message ?? 'Reset failed. Please check your code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Reset Password" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="lock-open-outline" size={36} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Set new password</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {/* CODE INPUT — same style as OTPScreen */}
          <TextInput
            ref={tokenInputRef}
            style={styles.otpInput}
            value={token}
            onChangeText={(v) => {
              setToken(v.replace(/[^0-9]/g, '').slice(0, 6));
              if (apiError) setApiError('');
            }}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor={COLORS.textTertiary}
            cursorColor={COLORS.primary}
            selectionColor={COLORS.primary}
          />

          {/* PASSWORD FIELDS */}
          <View style={styles.fields}>
            <Controller
              control={control} name="newPassword"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref} label="New password"
                  placeholder="e.g. SecurePass123!"
                  secureTextEntry
                  value={value} onChangeText={onChange} onBlur={onBlur}
                  error={errors.newPassword?.message}
                  leftIcon="lock-closed-outline"
                  hint="Min 8 · uppercase · lowercase · number · ! @ # $ % ^ & *"
                  isRequired
                />
              )}
            />

            <Controller
              control={control} name="confirmPassword"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref} label="Confirm new password"
                  placeholder="Repeat your new password"
                  secureTextEntry
                  value={value} onChangeText={onChange} onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  leftIcon="lock-closed-outline"
                  isRequired
                />
              )}
            />
          </View>

          {/* RESEND / STATUS MESSAGE */}
          {resendMessage !== '' && (
            <View style={[
              styles.messageBox,
              isResendError
                ? { backgroundColor: COLORS.errorBg, borderColor: COLORS.errorBorder }
                : { backgroundColor: COLORS.successBg, borderColor: COLORS.successBorder },
            ]}>
              <Text style={[
                styles.messageText,
                { color: isResendError ? COLORS.danger : COLORS.successText },
              ]}>
                {resendMessage}
              </Text>
            </View>
          )}

          {/* API / TOKEN ERROR */}
          {apiError !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{apiError}</Text>
            </View>
          )}

          <Button
            label="Reset Password"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            fullWidth size="lg"
            style={styles.submitButton}
          />

          {/* RESEND ROW */}
          <View style={styles.resendRow}>
            <Text style={styles.resendHint}>Didn't receive the code? </Text>
            {countdown > 0 ? (
              <Text style={styles.resendCountdown}>Resend in {countdown}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                <Text style={styles.resendLink}>
                  {isResending ? 'Sending...' : 'Resend code'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.screenPadding,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  emailHighlight: { color: COLORS.primary, fontFamily: TYPOGRAPHY.fontFamily.medium },
  otpInput: {
    width: 200, height: 64,
    borderWidth: 2, borderColor: COLORS.border,
    borderRadius: SPACING.borderRadius.lg,
    textAlign: 'center',
    fontSize: 28,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
    letterSpacing: 8,
    marginBottom: SPACING.xl,
  },
  fields: { width: '100%', gap: SPACING.md },
  messageBox: {
    width: '100%', borderWidth: 1,
    borderRadius: SPACING.borderRadius.md,
    padding: SPACING.md, marginTop: SPACING.md,
  },
  messageText: { fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center' },
  errorBox: {
    width: '100%',
    backgroundColor: COLORS.errorBg, borderWidth: 1, borderColor: COLORS.errorBorder,
    borderRadius: SPACING.borderRadius.md, padding: SPACING.md, marginTop: SPACING.md,
  },
  errorText: { color: COLORS.danger, fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center' },
  submitButton: { marginTop: SPACING.lg, width: '100%' },
  resendRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.lg },
  resendHint: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  resendCountdown: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary },
  resendLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
});
