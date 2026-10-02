// src/screens/auth/RegisterScreen.tsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/context/ThemeContext";
import { makeRegisterScreenStyle } from "@/styles/auth/register.styles";
import useShadows from "@/constants/shadows";

// Password special chars must match backend exactly: !@#$%^&*
const PASSWORD_SPECIAL = /[!@#$%^&*]/;

const TOTAL_STEPS = [1, 2, 3];
const CURRENT_STEP = 3;

const registerSchema = z
  .object({
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

const PASSWORD_REQUIREMENTS: {
  id: string;
  label: string;
  test: (password: string) => boolean;
}[] = [
  { id: "length", label: "8 characters or more", test: (p) => p.length >= 8 },
  { id: "lowercase", label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "uppercase", label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "number", label: "Number", test: (p) => /\d/.test(p) },
  {
    id: "special",
    label: "Special character (e.g. !?<>@#$%)",
    test: (p) => PASSWORD_SPECIAL.test(p),
  },
];

/** Maps a failed-request status code to a user-friendly message. */
function getErrorMessage(
  status: number | null | undefined,
  fallback: string | null | undefined,
): string | null {
  if (status == null) {
    return fallback ? fallback : null;
  }
  if (status === 409) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (status >= 500) {
    return "The server had a problem creating your account. This is usually temporary — please try again in a moment.";
  }
  return (
    fallback ?? "Something went wrong. Please check your details and try again."
  );
}

export default function RegisterScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeRegisterScreenStyle(COLORS, isDark);
  const shadows = useShadows(isDark);
  const shadowStyle = isDark ? shadows.tinted.sm : shadows.sm;

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { serviceMode, firstName, lastName } = route.params;

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
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const passwordChecklist = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((req) => ({
        ...req,
        met: req.test(password ?? ""),
      })),
    [password],
  );

  const displayError = useMemo(
    () => getErrorMessage(registerErrorStatus, registerError),
    [registerErrorStatus, registerError],
  );

  // ── Field focus chaining ────────────────────────────────────────────────
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNavigateToLogin = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);

  const handleToggleTerms = useCallback(() => {
    setAcceptedTerms((prev) => {
      const next = !prev;
      if (next) setTermsError("");
      return next;
    });
  }, []);

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
      firstName,
      lastName,
      role: serviceMode,
    });
  };

  // focus the email input on mount
  useFocusEffect(
    useCallback(() => {
      const focusEmail = () => emailRef.current?.focus();

      // Screen is already settled (e.g. returning from Register via back)
      const state = navigation.getState();
      const isTransitioning = state?.routes?.[state.index]?.state === undefined;

      const unsubscribe = navigation.addListener("transitionEnd", (e: any) => {
        if (!e.data.closing) focusEmail();
      });

      // Fallback in case transitionEnd doesn't fire (animation disabled)
      const timeout = setTimeout(focusEmail, 350);

      return () => {
        unsubscribe();
        clearTimeout(timeout);
      };
    }, [navigation]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>

          <View style={styles.stepContainer}>
            {TOTAL_STEPS.map((item) => (
              <View
                key={item}
                style={[
                  styles.stepIndicator,
                  item <= CURRENT_STEP && styles.stepIndicatorActive,
                  shadowStyle,
                ]}
              />
            ))}
          </View>

          {/* Keeps the progress indicator visually centered */}
          <View style={styles.headerSpacer} />
        </View>

        <View>
          <Text style={styles.title}>Finish setting up</Text>
          <Text style={styles.subtitle}>
            Please fill all details to finish setting up your account
          </Text>
        </View>
      </View>

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
          {/* ── FORM ──────────────────────────────────────────────────────── */}
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={(el: TextInput) => {
                    ref(el);
                    emailRef.current = el;
                  }}
                  containerStyle={[styles.containerStyle]}
                  labelStyle={styles.labelStyle}
                  label="Email"
                  placeholder="john@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  error={errors.email?.message}
                  isRequired
                  showSoftInputOnFocus={true}
                />
              )}
            />

            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <Input
                    ref={(el: TextInput) => {
                      ref(el);
                      passwordRef.current = el;
                    }}
                    containerStyle={styles.containerStyle}
                    labelStyle={styles.labelStyle}
                    label="Password"
                    placeholder="e.g. SecurePass123!"
                    secureTextEntry
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="next"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                    error={errors.password?.message}
                    isRequired
                  />
                )}
              />
              <View style={styles.inputInstructions}>
                {passwordChecklist.map((req) => (
                  <View key={req.id} style={styles.inputInstruction}>
                    <View style={[styles.check, req.met && styles.checkMet]}>
                      {req.met && (
                        <Ionicons
                          name="checkmark"
                          size={9}
                          color={COLORS.white}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.inputInstructionText,
                        req.met && styles.inputInstructionTextMet,
                      ]}
                    >
                      {req.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={(el: TextInput) => {
                    ref(el);
                    confirmPasswordRef.current = el;
                  }}
                  containerStyle={styles.containerStyle}
                  labelStyle={styles.labelStyle}
                  label="Confirm password"
                  placeholder="Repeat your password"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="done"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleSubmit(onSubmit)}
                  error={errors.confirmPassword?.message}
                  isRequired
                />
              )}
            />

            {/* ── TERMS CHECKBOX ────────────────────────────────────────── */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={handleToggleTerms}
              activeOpacity={0.7}
              disabled={isRegistering}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedTerms }}
              accessibilityLabel="Agree to Terms of Service and Privacy Policy"
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
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.apiErrorText}>{displayError}</Text>
              </View>
            )}
          </View>

          <Button
            label="Create account"
            onPress={handleSubmit(onSubmit)}
            isLoading={isRegistering}
            disabled={isRegistering}
            fullWidth
            size="md"
            style={styles.submitButton}
          />
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={handleNavigateToLogin}
              disabled={isRegistering}
            >
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
    </SafeAreaView>
  );
}
