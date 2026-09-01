// src/screens/auth/RegisterScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

// Password special chars must match backend exactly: !@#$%^&*
const PASSWORD_SPECIAL = /[!@#$%^&*]/;

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        new RegExp(
          `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*${PASSWORD_SPECIAL.source})`,
        ),
        "Password must include uppercase, lowercase, number, and special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<any>();

  const [selectedRole, setSelectedRole] = useState<"client" | "provider">(
    "client",
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState("");

  const { registerStep1, isRegistering, registerError, registerErrorStatus } =
    useAuth({
      onRegisterSuccess: (email, firstName, lastName) => {
        navigation.navigate("OTP", { email, firstName, lastName });
      },
    });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const displayError =
    registerErrorStatus != null && registerErrorStatus >= 500
      ? "The server had a problem creating your account. This is usually a temporary server issue — please try again in a moment."
      : registerError;

  const onSubmit = (data: RegisterFormData) => {
    if (!acceptedTerms) {
      setTermsError(
        "You must agree to the Terms and Privacy Policy to continue",
      );
      return;
    }
    setTermsError("");

    registerStep1({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      role: selectedRole,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join SkillHub today</Text>

          {/* ── ROLE SELECTOR ─────────────────────────────────────────────── */}
          <View style={styles.roleSection}>
            <Text style={styles.roleSectionLabel}>I want to...</Text>
            <View style={styles.roleCards}>
              {(["client", "provider"] as const).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleCard,
                    selectedRole === role && styles.roleCardActive,
                  ]}
                  onPress={() => setSelectedRole(role)}
                  activeOpacity={0.8}
                >
                  <View style={styles.roleCardCheck}>
                    {selectedRole === role && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={COLORS.primary}
                      />
                    )}
                  </View>
                  <Ionicons
                    name={
                      role === "client" ? "search-outline" : "briefcase-outline"
                    }
                    size={28}
                    color={
                      selectedRole === role
                        ? COLORS.primary
                        : COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.roleCardTitle,
                      selectedRole === role && styles.roleCardTitleActive,
                    ]}
                  >
                    {role === "client" ? "Find services" : "Offer services"}
                  </Text>
                  <Text style={styles.roleCardDesc}>
                    {role === "client"
                      ? "Book skilled professionals for any job"
                      : "Earn money by sharing your skills"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── FORM ──────────────────────────────────────────────────────── */}
          <View style={styles.form}>
            <View style={styles.nameRow}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <Input
                    ref={ref}
                    label="First name"
                    placeholder="John"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.firstName?.message}
                    style={styles.halfInput}
                    isRequired
                  />
                )}
              />
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <Input
                    ref={ref}
                    label="Last name"
                    placeholder="Banda"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.lastName?.message}
                    style={styles.halfInput}
                    isRequired
                  />
                )}
              />
            </View>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref}
                  label="Email address"
                  placeholder="john@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                  placeholder="e.g. SecurePass123!"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  leftIcon="lock-closed-outline"
                  hint="Min 8 · uppercase · lowercase · number · ! @ # $ % ^ & *"
                  isRequired
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref}
                  label="Confirm password"
                  placeholder="Repeat your password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  leftIcon="lock-closed-outline"
                  isRequired
                />
              )}
            />

            {/* ── TERMS CHECKBOX ────────────────────────────────────────── */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                setAcceptedTerms(!acceptedTerms);
                if (!acceptedTerms) setTermsError("");
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxChecked,
                ]}
              >
                {acceptedTerms && (
                  <Ionicons name="checkmark" size={13} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                I agree to SkillHub's{" "}
                <Text style={styles.checkboxLink}>Terms of Service</Text> and{" "}
                <Text style={styles.checkboxLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {termsError !== "" && (
              <View style={styles.termsErrorRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color={COLORS.danger}
                />
                <Text style={styles.termsErrorText}>{termsError}</Text>
              </View>
            )}

            {displayError && (
              <View style={styles.apiError}>
                <Text style={styles.apiErrorText}>{displayError}</Text>
              </View>
            )}

            <Button
              label="Create account"
              onPress={handleSubmit(onSubmit)}
              isLoading={isRegistering}
              fullWidth
              size="lg"
              style={styles.submitButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    flex: { flex: 1 },
    scrollContent: {
      padding: SPACING.screenPadding,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.xl,
    },
    backButton: { marginBottom: SPACING.lg, alignSelf: "flex-start" },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
      marginBottom: SPACING.xs,
    },
    subtitle: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textSecondary,
      marginBottom: SPACING.xl,
    },
    roleSection: { marginBottom: SPACING.xl },
    roleSectionLabel: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
      marginBottom: SPACING.sm,
    },
    roleCards: { flexDirection: "row", gap: SPACING.md },
    roleCard: {
      flex: 1,
      paddingTop: SPACING.lg,
      padding: SPACING.md,
      borderRadius: SPACING.borderRadius.lg,
      borderWidth: 1.5,
      borderColor: COLORS.border,
      backgroundColor: COLORS.surface,
      alignItems: "center",
      gap: SPACING.xs,
      position: "relative",
    },
    roleCardActive: {
      borderColor: COLORS.primary,
      backgroundColor: COLORS.primaryLight,
    },
    roleCardCheck: {
      position: "absolute",
      top: SPACING.sm,
      right: SPACING.sm,
      width: 20,
      height: 20,
    },
    roleCardTitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textSecondary,
      textAlign: "center",
    },
    roleCardTitleActive: { color: COLORS.primary },
    roleCardDesc: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.textTertiary,
      textAlign: "center",
      lineHeight: 16,
    },
    form: { gap: SPACING.md },
    nameRow: { flexDirection: "row", gap: SPACING.md},
    halfInput: { flex: 1 },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: SPACING.sm,
      marginTop: SPACING.xs,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: COLORS.border,
      backgroundColor: COLORS.surface,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
      flexShrink: 0,
    },
    checkboxChecked: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    checkboxLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      flex: 1,
      lineHeight: 20,
    },
    checkboxLink: {
      color: COLORS.primary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    termsErrorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: -SPACING.xs,
    },
    termsErrorText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.danger,
      flex: 1,
    },
    apiError: {
      backgroundColor: COLORS.errorBg,
      borderWidth: 1,
      borderColor: COLORS.errorBorder,
      borderRadius: SPACING.borderRadius.md,
      padding: SPACING.md,
    },
    apiErrorText: {
      color: COLORS.danger,
      fontSize: TYPOGRAPHY.fontSize.sm,
      textAlign: "center",
    },
    submitButton: { marginTop: SPACING.sm },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: SPACING.xl,
    },
    footerText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
    },
    footerLink: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.primary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
  });
