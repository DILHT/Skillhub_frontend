import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, StyleSheet, TouchableOpacity
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
 
// Phone validation regex for common African formats:
//   +265 99x xxx xxx  (Malawi)
//   +254 7xx xxx xxx  (Kenya)
//   +27 7x xxx xxxx   (South Africa)
//   +234 xxx xxxx xxxx (Nigeria)
// We accept any E.164 format starting with +
const phoneRegex = /^\+[1-9]\d{7,14}$/;
 
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Enter number with country code e.g. +265991234567'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],  // Attach this error to the confirmPassword field
  }
);
 
type RegisterFormData = z.infer<typeof registerSchema>;
 
export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { register, isRegistering, registerError } = useAuth();
 
  // Role selection is NOT inside react-hook-form because it's a
  // custom UI element (two cards, not a text input).
  // We manage it with useState and manually include it in submit.
  const [selectedRole, setSelectedRole] = useState<'client' | 'provider'>('client');
 
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '', lastName: '',
      email: '', phone: '',
      password: '', confirmPassword: '',
    },
  });
 
  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...rest } = data; // Remove confirmPassword before sending to API
    register({ ...rest, role: selectedRole });
  };
 
  return (
    <SafeAreaView style={regStyles.safeArea}>
      <KeyboardAvoidingView
        style={regStyles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={regStyles.flex}
          contentContainerStyle={regStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={regStyles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
 
          <Text style={regStyles.title}>Create account</Text>
          <Text style={regStyles.subtitle}>Join SkillHub today</Text>
 
          {/* ── ROLE SELECTOR ───────────────────────────────────────────── */}
          {/*
            This is the most important UI element on this screen.
            A user's role determines EVERYTHING they see in the app.
            Client → can browse, book, pay
            Provider → can list services, accept bookings, receive payments
          */}
          <View style={regStyles.roleSection}>
            <Text style={regStyles.roleTitle}>I want to...</Text>
            <View style={regStyles.roleCards}>
              {(['client', 'provider'] as const).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    regStyles.roleCard,
                    selectedRole === role && regStyles.roleCardActive,
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Ionicons
                    name={role === 'client' ? 'search-outline' : 'briefcase-outline'}
                    size={24}
                    color={selectedRole === role ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text style={[
                    regStyles.roleCardTitle,
                    selectedRole === role && regStyles.roleCardTitleActive,
                  ]}>
                    {role === 'client' ? 'Find services' : 'Offer services'}
                  </Text>
                  <Text style={regStyles.roleCardDesc}>
                    {role === 'client'
                      ? 'Book skilled professionals'
                      : 'Earn by sharing your skills'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
 
          {/* ── FORM FIELDS ─────────────────────────────────────────────── */}
          <View style={regStyles.form}>
            <View style={regStyles.nameRow}>
              <Controller
                control={control} name="firstName"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <Input
                    ref={ref} label="First name" placeholder="John"
                    value={value} onChangeText={onChange} onBlur={onBlur}
                    error={errors.firstName?.message}
                    style={regStyles.halfInput} isRequired
                  />
                )}
              />
              <Controller
                control={control} name="lastName"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <Input
                    ref={ref} label="Last name" placeholder="Banda"
                    value={value} onChangeText={onChange} onBlur={onBlur}
                    error={errors.lastName?.message}
                    style={regStyles.halfInput} isRequired
                  />
                )}
              />
            </View>
 
            <Controller
              control={control} name="email"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref} label="Email" placeholder="john@example.com"
                  keyboardType="email-address" autoCapitalize="none"
                  value={value} onChangeText={onChange} onBlur={onBlur}
                  error={errors.email?.message} leftIcon="mail-outline" isRequired
                />
              )}
            />
 
            <Controller
              control={control} name="phone"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref} label="Phone number" placeholder="+265991234567"
                  keyboardType="phone-pad"
                  value={value} onChangeText={onChange} onBlur={onBlur}
                  error={errors.phone?.message} leftIcon="call-outline"
                  hint="Include country code (e.g. +265 for Malawi)"
                  isRequired
                />
              )}
            />
 
            <Controller
              control={control} name="password"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref} label="Password" placeholder="Min. 8 characters"
                  secureTextEntry
                  value={value} onChangeText={onChange} onBlur={onBlur}
                  error={errors.password?.message} leftIcon="lock-closed-outline"
                  isRequired
                />
              )}
            />
 
            <Controller
              control={control} name="confirmPassword"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref} label="Confirm password" placeholder="Repeat password"
                  secureTextEntry
                  value={value} onChangeText={onChange} onBlur={onBlur}
                  error={errors.confirmPassword?.message} leftIcon="lock-closed-outline"
                  isRequired
                />
              )}
            />
 
            {registerError && (
              <View style={regStyles.apiErrorBox}>
                <Text style={regStyles.apiErrorText}>{registerError}</Text>
              </View>
            )}
 
            <Button
              label="Create account"
              onPress={handleSubmit(onSubmit)}
              isLoading={isRegistering}
              fullWidth size="lg"
              style={regStyles.submitButton}
            />
          </View>
 
          <View style={regStyles.footer}>
            <Text style={regStyles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={regStyles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
 
const regStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scrollContent: { padding: SPACING.screenPadding, paddingTop: SPACING.sm },
  backButton: { marginBottom: SPACING.lg, alignSelf: 'flex-start' },
  title: { fontSize: TYPOGRAPHY.fontSize.xxl, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  roleSection: { marginBottom: SPACING.xl },
  roleTitle: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  roleCards: { flexDirection: 'row', gap: SPACING.md },
  roleCard: {
    flex: 1, padding: SPACING.md, borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface,
    alignItems: 'center', gap: SPACING.xs,
  },
  roleCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  roleCardTitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, textAlign: 'center' },
  roleCardTitleActive: { color: COLORS.primary },
  roleCardDesc: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textTertiary, textAlign: 'center' },
  form: { gap: SPACING.md },
  nameRow: { flexDirection: 'row', gap: SPACING.md },
  halfInput: { flex: 1 },
  apiErrorBox: {
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: SPACING.borderRadius.md, padding: SPACING.md,
  },
  apiErrorText: { color: COLORS.danger, fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center' },
  submitButton: { marginTop: SPACING.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl, paddingBottom: SPACING.xl },
  footerText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  footerLink: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.primary },
});