// src/screens/auth/LoginScreen.tsx

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { useAuthStore } from '@/store/authStore';
import { MOCK_CLIENT_USER, MOCK_PROVIDER_USER } from '@/mock/mockData';
import { User } from '@/types/user.types';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function isEmailVerificationError(message?: string) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes('unverified') ||
    (normalized.includes('email') &&
      (normalized.includes('verify') ||
        normalized.includes('verified') ||
        normalized.includes('verification')))
  );
}

export default function LoginScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const devStyles = makeDevStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const { login, isLoggingIn, loginError } = useAuth({
    onEmailNotVerified: (email) => {
      navigation.navigate('OTP', { email, canResendImmediately: true });
    },
  });
  const { setUser, logoutReason, clearLogoutReason } = useAuthStore();

  useEffect(() => {
    if (logoutReason) {
      Alert.alert('Signed Out', logoutReason);
      clearLogoutReason();
    }
  }, []);

  // ── DEV BYPASS ─────────────────────────────────────────────────────────────
  // FIX: Import MOCK_CLIENT_USER and MOCK_PROVIDER_USER directly.
  // Both are typed as User (not AuthUser | undefined), so setUser() accepts them.
  // Previously the code used MOCK_AUTH_RESPONSE.user which is typed as
  // AuthUser | undefined — that caused the TypeScript error.
  const handleDevLogin = (role: 'client' | 'provider') => {
    const user: User = role === 'provider' ? MOCK_PROVIDER_USER : MOCK_CLIENT_USER;
    setUser(user, 'dev-token');
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const currentEmail = watch('email').trim().toLowerCase();
  const showVerifyEmailAction = isEmailVerificationError(loginError);

  const onSubmit = (data: LoginFormData) => {
    login({ ...data, email: data.email.trim().toLowerCase() });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Image
                source={require('../../../assets/logo.jpg')}
                style={styles.logo}
                resizeMode="contain"
              />
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to find or offer services
            </Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref}
                  label="Email address"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  leftIcon="mail-outline"
                  isRequired
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref}
                  label="Password"
                  placeholder="Enter your password"
                  secureTextEntry
                  autoComplete="password"
                  returnKeyType="done"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  leftIcon="lock-closed-outline"
                  isRequired
                />
              )}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            {loginError && (
              <View style={styles.apiErrorBox}>
                <Text style={styles.apiErrorText}>{loginError}</Text>
                {showVerifyEmailAction && (
                  <TouchableOpacity
                    style={[
                      styles.verifyEmailAction,
                      currentEmail === '' && styles.verifyEmailActionDisabled,
                    ]}
                    disabled={currentEmail === ''}
                    onPress={() => navigation.navigate('OTP', {
                      email: currentEmail,
                      canResendImmediately: true,
                    })}
                  >
                    <Text style={styles.verifyEmailActionText}>
                      {currentEmail === '' ? 'Enter email to verify' : 'Verify email'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Button
              label="Sign in"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoggingIn}
              fullWidth
              size="lg"
              style={styles.submitButton}
            />

            {/* DEV ONLY bypass buttons */}
            {(__DEV__ || process.env.EXPO_PUBLIC_USE_MOCK === 'true') && (
              <View style={devStyles.container}>
                <View style={devStyles.divider}>
                  <View style={devStyles.line} />
                  <Text style={devStyles.dividerLabel}>DEV ONLY</Text>
                  <View style={devStyles.line} />
                </View>
                <View style={devStyles.buttonRow}>
                  <TouchableOpacity
                    style={devStyles.devButton}
                    onPress={() => handleDevLogin('client')}
                  >
                    <Text style={devStyles.devButtonText}>Login as Client</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[devStyles.devButton, devStyles.devButtonProvider]}
                    onPress={() => handleDevLogin('provider')}
                  >
                    <Text style={devStyles.devButtonText}>Login as Provider</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Create account</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: SPACING.xxl },
  logo: {
  width: 120,
  height: 120,
  marginBottom: SPACING.lg,
},
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontFamily: 'System',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: { gap: SPACING.md },
  forgotPassword: { alignSelf: 'flex-end' },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: 'System',
  },
  apiErrorBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: SPACING.borderRadius.md,
    padding: SPACING.md,
  },
  apiErrorText: {
    color: COLORS.danger,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
  },
  verifyEmailAction: {
    alignSelf: 'center',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.borderRadius.md,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  verifyEmailActionDisabled: {
    opacity: 0.5,
  },
  verifyEmailActionText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  submitButton: { marginTop: SPACING.sm },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xxl,
    paddingBottom: SPACING.md,
  },
  footerText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  footerLink: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.primary, fontFamily: 'System' },
});

const makeDevStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  container: { marginTop: SPACING.md },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  line: { flex: 1, height: 1, backgroundColor: COLORS.divider },
  dividerLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    letterSpacing: 0.5,
  },
  buttonRow: { flexDirection: 'row', gap: SPACING.md },
  devButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.borderRadius.md,
    backgroundColor: COLORS.warningBg,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    alignItems: 'center',
  },
  devButtonProvider: {
    backgroundColor: '#EDE9FE',
    borderColor: '#C4B5FD',
  },
  devButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.warningText,
  },
});
