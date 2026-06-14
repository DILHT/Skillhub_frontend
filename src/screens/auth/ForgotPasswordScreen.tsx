// src/screens/auth/ForgotPasswordScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/common';
import { authService } from '@/service/authService';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { control, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={36} color={COLORS.primary} />
          </View>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successSubtitle}>
            We sent a password reset link to{'\n'}
            <Text style={styles.emailHighlight}>{getValues('email')}</Text>
          </Text>
          <Text style={styles.successHint}>
            Didn't receive it? Check your spam folder or try again.
          </Text>
          <Button
            label="Back to Sign In"
            onPress={() => navigation.navigate('Login')}
            fullWidth size="lg"
            style={styles.button}
          />
          <TouchableOpacity onPress={() => setSubmitted(false)}>
            <Text style={styles.retryText}>Try a different email</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Ionicons name="lock-open-outline" size={36} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          <Controller
            control={control} name="email"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                ref={ref} label="Email address" placeholder="you@example.com"
                keyboardType="email-address" autoCapitalize="none"
                value={value} onChangeText={onChange} onBlur={onBlur}
                error={errors.email?.message}
                leftIcon="mail-outline" isRequired
              />
            )}
          />

          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            label="Send reset link"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            fullWidth size="lg"
            style={styles.button}
          />

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backToLogin}>
            <Text style={styles.backToLoginText}>Back to Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1, padding: SPACING.screenPadding,
    paddingTop: SPACING.sm,
  },
  backButton: { marginBottom: SPACING.xl, alignSelf: 'flex-start' },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xl,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg, borderWidth: 1, borderColor: COLORS.errorBorder,
    borderRadius: SPACING.borderRadius.md, padding: SPACING.md, marginTop: SPACING.sm,
  },
  errorText: { color: COLORS.danger, fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center' },
  button: { marginTop: SPACING.lg },
  backToLogin: { alignSelf: 'center', marginTop: SPACING.lg },
  backToLoginText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.sm, fontFamily: TYPOGRAPHY.fontFamily.medium },
  successContainer: {
    flex: 1, padding: SPACING.screenPadding,
    alignItems: 'center', justifyContent: 'center', gap: SPACING.md,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl, fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary, textAlign: 'center',
  },
  successSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 24,
  },
  emailHighlight: { color: COLORS.primary, fontFamily: TYPOGRAPHY.fontFamily.medium },
  successHint: {
    fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary,
    textAlign: 'center', lineHeight: 20,
  },
  retryText: { color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.sm, marginTop: SPACING.sm },
});
