// src/screens/auth/LoginScreen.tsx

import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Button, Input } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/context/ThemeContext";
import { useShadows } from "@/constants/shadows";
import { useAuthStore } from "@/store/authStore";
import { MOCK_CLIENT_USER, MOCK_PROVIDER_USER } from "@/mock/mockData";
import { User } from "@/types/user.types";
import { makeLoginStyles, makeDevStyles } from "@/styles/auth/login.styles";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function isEmailVerificationError(message?: string) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes("unverified") ||
    (normalized.includes("email") &&
      (normalized.includes("verify") ||
        normalized.includes("verified") ||
        normalized.includes("verification")))
  );
}

export default function LoginScreen() {
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const { colors: COLORS, isDark } = useAppTheme();
  const shadows = useShadows(isDark);
  const styles = makeLoginStyles(COLORS, isDark);
  const devStyles = makeDevStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const { login, isLoggingIn, loginError } = useAuth({
    onEmailNotVerified: (email) => {
      navigation.navigate("OTP", { email, canResendImmediately: true });
    },
  });
  const { setUser, logoutReason, clearLogoutReason } = useAuthStore();

  useEffect(() => {
    if (logoutReason) {
      Alert.alert("Signed Out", logoutReason);
      clearLogoutReason();
    }
  }, []);

  // ── DEV BYPASS ─────────────────────────────────────────────────────────────
  // FIX: Import MOCK_CLIENT_USER and MOCK_PROVIDER_USER directly.
  // Both are typed as User (not AuthUser | undefined), so setUser() accepts them.
  // Previously the code used MOCK_AUTH_RESPONSE.user which is typed as
  // AuthUser | undefined — that caused the TypeScript error.
  const handleDevLogin = (role: "client" | "provider") => {
    const user: User =
      role === "provider" ? MOCK_PROVIDER_USER : MOCK_CLIENT_USER;
    setUser(user, "dev-token");
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const currentEmail = watch("email").trim().toLowerCase();
  const showVerifyEmailAction = isEmailVerificationError(loginError);

  const onSubmit = (data: LoginFormData) => {
    login({ ...data, email: data.email.trim().toLowerCase() });
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
          <View style={styles.flex}>
            {/* HEADER */}
            <View style={styles.header}>
              <Image
                source={require("../../../assets/logo.jpg")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in to access your account
              </Text>
            </View>

            {/* FORM */}
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

              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              {loginError && (
                <View style={styles.apiErrorBox}>
                  <Text style={styles.apiErrorText}>{loginError}</Text>
                  {showVerifyEmailAction && (
                    <TouchableOpacity
                      style={[
                        styles.verifyEmailAction,
                        currentEmail === "" && styles.verifyEmailActionDisabled,
                      ]}
                      disabled={currentEmail === ""}
                      onPress={() =>
                        navigation.navigate("OTP", {
                          email: currentEmail,
                          canResendImmediately: true,
                        })
                      }
                    >
                      <Text style={styles.verifyEmailActionText}>
                        {currentEmail === ""
                          ? "Enter email to verify"
                          : "Verify email"}
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
                size="md"
                style={styles.submitButton}
              />

              {/* DEV ONLY bypass buttons */}
              {(__DEV__ || process.env.EXPO_PUBLIC_USE_MOCK === "true") && (
                <View style={devStyles.container}>
                  <View style={devStyles.divider}>
                    <View style={devStyles.line} />
                    <Text style={devStyles.dividerLabel}>DEV ONLY</Text>
                    <View style={devStyles.line} />
                  </View>
                  <View style={devStyles.buttonRow}>
                    <TouchableOpacity
                      style={devStyles.devButton}
                      onPress={() => handleDevLogin("client")}
                    >
                      <Text style={devStyles.devButtonText}>
                        Login as Client
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[devStyles.devButton, devStyles.devButtonProvider]}
                      onPress={() => handleDevLogin("provider")}
                    >
                      <Text style={devStyles.devButtonText}>
                        Login as Provider
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Choose")}>
              <Text style={styles.footerLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
