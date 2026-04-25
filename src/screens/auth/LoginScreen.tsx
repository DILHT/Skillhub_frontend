import React from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { useAuthStore } from '@/store/authStore'; // add this import
import { MOCK_AUTH_RESPONSE, MOCK_PROVIDER_USER } from '@/mock/mockData';

// ── ZOD SCHEMA ────────────────────────────────────────────────────────────────
//
// This schema defines BOTH the TypeScript type AND the validation rules.
// One definition, two benefits.
//
// z.object() creates a schema for an object with these fields:
//   email: must be a string, must be a valid email format
//   password: must be a string, minimum 8 characters
 
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


// TypeScript type inferred FROM the schema — no duplication
// LoginFormData = { email: string; password: string }
type LoginFormData = z.infer<typeof loginSchema>;
 
// ── COMPONENT ─────────────────────────────────────────────────────────────────
 
export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login, isLoggingIn, loginError } = useAuth(); // Our custom hook
  const { setUser } = useAuthStore();

  // Add this function inside the component:
const handleDevLogin = (role: 'client' | 'provider') => {
  // Bypass the API completely — inject mock user directly into the store.
  // RootNavigator sees isAuthenticated = true → shows AppNavigator instantly.
  const user = role === 'provider'
    ? MOCK_PROVIDER_USER
    : MOCK_AUTH_RESPONSE.user;
  setUser(user, 'dev-token');
};
 
  // ── FORM SETUP ─────────────────────────────────────────────────────────────
  //
  // useForm initializes the form with:
  //   resolver: zodResolver(loginSchema) — connects zod validation to the form
  //   defaultValues: initial values for each field
  //
  // The hook returns functions and objects we use to control the form:
  //   control: connects <Controller> to this form
  //   handleSubmit: wraps our onSubmit with validation
  //   formState.errors: validation errors for each field
 
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
 
  // ── SUBMIT HANDLER ─────────────────────────────────────────────────────────
  //
  // handleSubmit() from react-hook-form:
  //   1. Runs zod validation on all fields
  //   2. If validation FAILS → populates errors, does NOT call our function
  //   3. If validation PASSES → calls our function with the validated data
  //
  // Notice how clean this is: we just call login() with the data.
  // Loading, error, navigation — all handled by the useAuth hook.
 
  const onSubmit = (data: LoginFormData) => {
    login(data);
  };
 
  // ── RENDER ─────────────────────────────────────────────────────────────────
 
  return (
    <SafeAreaView style={screenStyles.safeArea}>
      {/*
        KeyboardAvoidingView: Moves the form up when keyboard appears,
        so the active input is never hidden behind it.
        Platform.OS === 'ios' uses 'padding', Android uses 'height'.
      */}
      <KeyboardAvoidingView
        style={screenStyles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={screenStyles.flex}
          contentContainerStyle={screenStyles.scrollContent}
          keyboardShouldPersistTaps="handled" // Tap outside keyboard dismisses it
          showsVerticalScrollIndicator={false}
        >
 
          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <View style={screenStyles.header}>
            {/* Replace this with your actual logo */}
            <View style={screenStyles.logoPlaceholder}>
              <Text style={screenStyles.logoText}>S</Text>
            </View>
            <Text style={screenStyles.title}>Welcome back</Text>
            <Text style={screenStyles.subtitle}>
              Sign in to find or offer services
            </Text>
          </View>
 
          {/* ── FORM ───────────────────────────────────────────────────── */}
          <View style={screenStyles.form}>
 
            {/*
              Controller bridges react-hook-form with our custom Input.
              It passes: value, onChange (onChangeText), onBlur, ref
              to whatever component is returned from render().
            */}
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
                  returnKeyType="next"  // Shows "Next" on keyboard
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message} // Zod error message
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
                  secureTextEntry   // Triggers password visibility toggle in Input
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
 
            {/* Forgot password link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={screenStyles.forgotPassword}
            >
              <Text style={screenStyles.forgotPasswordText}>
                Forgot password?
              </Text>
            </TouchableOpacity>
 
            {/*
              API Error Display
              loginError comes from our useAuth hook (the API error message).
              Form validation errors are shown inline in each Input.
              API errors (wrong password, account not found) are shown here.
            */}
            {loginError && (
              <View style={screenStyles.apiErrorBox}>
                <Text style={screenStyles.apiErrorText}>{loginError}</Text>
              </View>
            )}
 
            {/* Submit button */}
            <Button
              label="Sign in"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoggingIn}
              fullWidth
              size="lg"
              style={screenStyles.submitButton}
            />

            {__DEV__ && (
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
 
          {/* ── FOOTER ─────────────────────────────────────────────────── */}
          <View style={screenStyles.footer}>
            <Text style={screenStyles.footerText}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={screenStyles.footerLink}>Create account</Text>
            </TouchableOpacity>
          </View>
 
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
 
const screenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,              // Makes content fill screen even when short
    padding: SPACING.screenPadding,
    justifyContent: 'center', // Centers form on large screens
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: SPACING.borderRadius.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  logoText: {
    fontSize: 28,
    fontFamily: 'System',
    color: COLORS.white,
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
  form: {
    gap: SPACING.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: 'System',
  },
  apiErrorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: SPACING.borderRadius.md,
    padding: SPACING.md,
  },
  apiErrorText: {
    color: COLORS.danger,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xxl,
    paddingBottom: SPACING.md,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: 'System',
  },
});

const devStyles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  devButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.borderRadius.md,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    alignItems: 'center',
  },
  devButtonProvider: {
    backgroundColor: '#EDE9FE',
    borderColor: '#C4B5FD',
  },
  devButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#78350F',
  },
});