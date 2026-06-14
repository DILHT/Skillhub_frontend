// src/screens/auth/OTPScreen.tsx
// Fixed:
// - All console.log removed (were logging raw OTP value)
// - Added Resend OTP button
// - Added 60s countdown before resend is enabled

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/service/authService';
import { Button } from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

type RouteParams = {
  OTP: {
    email: string;
    firstName?: string;
    lastName?: string;
    canResendImmediately?: boolean;
  };
};

const RESEND_COUNTDOWN = 60; // seconds before resend is enabled

export default function OTPScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'OTP'>>();
  const {
    email,
    firstName = '',
    lastName = '',
    canResendImmediately = false,
  } = route.params;

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(canResendImmediately ? 0 : RESEND_COUNTDOWN);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [isResendError, setIsResendError] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { verifyOTP, isVerifying, verifyError } = useAuth();

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
    if (!canResendImmediately) startCountdown();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [canResendImmediately]);

  function startCountdown() {
    setCountdown(RESEND_COUNTDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const handleVerify = () => {
    if (otp.length !== 6) return;
    verifyOTP({ email, otp, firstName, lastName });
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage('');
    setIsResendError(false);
    try {
      await authService.resendOTP(email);
      setResendMessage('A new code has been sent to your email.');
      startCountdown();
    } catch (e: any) {
      setResendMessage(e?.message ?? 'Failed to resend. Please try again.');
      setIsResendError(true);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={36} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <TextInput
            ref={inputRef}
            style={styles.otpInput}
            value={otp}
            onChangeText={(v) => setOtp(v.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor={COLORS.textTertiary}
          />

          {verifyError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{verifyError}</Text>
            </View>
          )}

          {resendMessage !== '' && (
            <View style={[
              styles.errorBox,
              !isResendError && { backgroundColor: COLORS.successBg, borderColor: COLORS.successBorder },
            ]}>
              <Text style={[
                styles.errorText,
                !isResendError && { color: COLORS.successText },
              ]}>{resendMessage}</Text>
            </View>
          )}

          <Button
            label="Verify & Create Account"
            onPress={handleVerify}
            isLoading={isVerifying}
            disabled={otp.length !== 6}
            fullWidth
            size="lg"
            style={styles.button}
          />

          {/* RESEND BUTTON */}
          <View style={styles.resendRow}>
            <Text style={styles.resendHint}>Didn't receive the code? </Text>
            {countdown > 0 ? (
              <Text style={styles.resendCountdown}>
                Resend in {countdown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                <Text style={styles.resendLink}>
                  {isResending ? 'Sending...' : 'Resend code'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  container: {
    flex: 1, padding: SPACING.screenPadding,
    paddingTop: SPACING.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  backBtn: { position: 'absolute', top: SPACING.md, left: SPACING.screenPadding },
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
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  email: { color: COLORS.primary, fontFamily: TYPOGRAPHY.fontFamily.medium },
  otpInput: {
    width: 200, height: 64,
    borderWidth: 2, borderColor: COLORS.border,
    borderRadius: SPACING.borderRadius.lg,
    textAlign: 'center',
    fontSize: 28,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
    letterSpacing: 8,
    marginBottom: SPACING.lg,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg, borderWidth: 1, borderColor: COLORS.errorBorder,
    borderRadius: SPACING.borderRadius.md, padding: SPACING.md,
    width: '100%', marginBottom: SPACING.md,
  },
  errorText: { color: COLORS.danger, fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center' },
  button: { marginBottom: SPACING.lg, width: '100%' },
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendHint: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  resendCountdown: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary },
  resendLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
});
