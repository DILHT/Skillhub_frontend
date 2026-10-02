// src/screens/auth/ChooseScreen.tsx

import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/common";
import { useAppTheme } from "@/context/ThemeContext";
import useShadows from "@/constants/shadows";
import { StyleSheet } from "react-native";
import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

type ServiceMode = "find" | "offer" | "both";

const OPTIONS: {
  value: ServiceMode;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}[] = [
  {
    value: "find",
    icon: "search-outline",
    title: "Find a Service",
    description:
      "Discover skilled providers and find the right service for your needs.",
  },
  {
    value: "offer",
    icon: "briefcase-outline",
    title: "Offer a Service",
    description:
      "Share your skills, offer services, and connect with potential customers.",
  },
  {
    value: "both",
    icon: "swap-horizontal-outline",
    title: "Both",
    description:
      "Find services when you need them and offer your own skills to others.",
  },
];

export default function ChooseScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyle(COLORS, isDark);
  const shadows = useShadows(isDark);

  const navigation = useNavigation<any>();

  const [selected, setSelected] = useState<ServiceMode | null>(null);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNext = () => {
    if (!selected) return;

    navigation.navigate("Name", {
      serviceMode: selected,
    });
  };

  const handleNavigateToLogin = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);

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
            {[1, 2, 3].map((item) => (
              <View
                key={item}
                style={[
                  styles.stepIndicator,
                  item === 1 && styles.stepIndicatorActive,
                  shadows.sm,
                ]}
              />
            ))}
          </View>

          {/* Keeps the progress indicator visually centered */}
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>What do you want to do?</Text>

          <Text style={styles.subtitle}>
            Choose how you’d like to use the platform. You can find services,
            offer your own, or do both.
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
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.options}>
            {OPTIONS.map((option) => {
              const isSelected = selected === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.8}
                  onPress={() => setSelected(option.value)}
                  style={[
                    styles.option,
                    shadows.sm,
                    isSelected && styles.optionSelected,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      isSelected && styles.iconContainerSelected,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={16}
                      color={isSelected ? COLORS.primary : COLORS.textSecondary}
                    />
                  </View>

                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{option.title}</Text>

                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>

                  <View
                    style={[styles.radio, isSelected && styles.radioSelected]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={COLORS.background}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View>
            <Button
              label="Next"
              onPress={handleNext}
              fullWidth
              size="md"
              disabled={!selected}
              style={styles.submitButton}
            />
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleNavigateToLogin}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
    </SafeAreaView>
  );
}

export const makeStyle = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    flex: {
      flex: 1,
    },

    header: {
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.lg,
      gap: SPACING.md,
    },

    headerTop: {
      flexDirection: "row",
      alignItems: "center",
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
    },

    stepContainer: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: SPACING.xs,
    },

    headerSpacer: {
      width: 40,
    },

    stepIndicator: {
      width: 36,
      height: 8,
      borderRadius: 5,
      backgroundColor: COLORS.surface,
    },

    stepIndicatorActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },

    headerText: {
      gap: SPACING.xs,
    },

    title: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.textPrimary,
      lineHeight: 32,
      letterSpacing: -0.4,
    },

    subtitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      lineHeight: 20,
      maxWidth: 420,
    },

    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.xxl,
      justifyContent: "space-between",
    },

    options: {
      gap: SPACING.md,
    },

    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      padding: SPACING.md,
      minHeight: 92,
      borderRadius: SPACING.borderRadius.lg,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
    },

    optionSelected: {
      borderWidth: 1.5,
      borderColor: COLORS.primary,
      backgroundColor: COLORS.surface,
    },

    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.background,
    },

    iconContainerSelected: {
      backgroundColor: COLORS.primary + "12",
    },

    optionContent: {
      flex: 1,
      gap: SPACING.xs,
    },

    optionTitle: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
    },

    optionDescription: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textTertiary,
      lineHeight: 18,
    },

    radio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      // borderWidth: 1,
      // borderColor: COLORS.border,
      backgroundColor: COLORS.background,
    },

    radioSelected: {
      borderColor: COLORS.primary,
      backgroundColor: COLORS.primary,
    },

    submitButton: {
      marginTop: SPACING.xl,
      minHeight: 52,
      borderRadius: SPACING.borderRadius.full,
    },

    /* Footer */
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: SPACING.md,
    },

    footerText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
    },

    footerLink: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.primary,
    },
  });
