import React, { useCallback, useEffect, useMemo, useRef } from "react";
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
import { useAppTheme } from "@/context/ThemeContext";
import useShadows from "@/constants/shadows";
import { makeNameScreenStyle } from "@/styles/auth/name.styles";

const TOTAL_STEPS = [1, 2, 3];
const CURRENT_STEP = 2;

const NAME_REGEX = /^[\p{L}][\p{L}\s'’-]*$/u;

const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(2, `${label} must be at least 2 characters`)
    .max(50, `${label} is too long`)
    .regex(NAME_REGEX, `${label} contains invalid characters`);

const nameSchema = z.object({
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
});

type NameFormData = z.infer<typeof nameSchema>;

export default function NameScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeNameScreenStyle(COLORS, isDark);
  const shadows = useShadows(isDark);
  const shadowStyle = isDark ? shadows.tinted.sm : shadows.sm;
  const route = useRoute<any>();
  const { serviceMode } = route.params ?? {};

  const navigation = useNavigation<any>();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  // ── Field focus chaining ────────────────────────────────────────────────
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleFocusLastName = useCallback(() => {
    lastNameRef.current?.focus();
  }, []);

  const onSubmit = useCallback(
    (data: NameFormData) => {
      navigation.navigate("Register", {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        serviceMode,
      });
    },
    [navigation, serviceMode],
  );

  const handleNext = useMemo(
    () => handleSubmit(onSubmit),
    [handleSubmit, onSubmit],
  );

  const handleNavigateToLogin = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);

  // focus the first name input on mount
  useFocusEffect(
    useCallback(() => {
      const focusFirstName = () => firstNameRef.current?.focus();

      // Screen is already settled (e.g. returning from Register via back)
      const state = navigation.getState();
      const isTransitioning = state?.routes?.[state.index]?.state === undefined;

      const unsubscribe = navigation.addListener("transitionEnd", (e: any) => {
        if (!e.data.closing) focusFirstName();
      });

      // Fallback in case transitionEnd doesn't fire (animation disabled)
      const timeout = setTimeout(focusFirstName, 350);

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

        <View style={styles.headerText}>
          <Text style={styles.title}>What should we call you?</Text>
          <Text style={styles.subtitle}>
            Please enter the name you would like to be known by on the platform.
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
              name="firstName"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={(el: TextInput) => {
                    ref(el);
                    firstNameRef.current = el;
                  }}
                  containerStyle={styles.containerStyle}
                  labelStyle={styles.labelStyle}
                  label="First name"
                  placeholder="John"
                  autoCapitalize="words"
                  autoComplete="given-name"
                  textContentType="givenName"
                  returnKeyType="next"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleFocusLastName}
                  error={errors.firstName?.message}
                  isRequired
                  showSoftInputOnFocus={true}
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={(el: TextInput) => {
                    ref(el);
                    lastNameRef.current = el;
                  }}
                  containerStyle={styles.containerStyle}
                  labelStyle={styles.labelStyle}
                  label="Last name"
                  placeholder="Doe"
                  autoCapitalize="words"
                  autoComplete="family-name"
                  textContentType="familyName"
                  returnKeyType="done"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleNext}
                  error={errors.lastName?.message}
                  isRequired
                />
              )}
            />
          </View>

          <>
            <Button
              label="Next"
              onPress={handleNext}
              fullWidth
              size="md"
              disabled={!isValid}
              style={styles.submitButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleNavigateToLogin}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </>
        </ScrollView>
      </KeyboardAvoidingView>

      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
    </SafeAreaView>
  );
}
