import { StyleSheet } from "react-native";
import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

export const makeNameScreenStyle = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    flex: {
      flex: 1,
    },

    /* Header */
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

    /* Content */
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.xxl,
    },

    form: {
      flex: 1,
      gap: SPACING.lg,
    },

    /* Inputs */
    labelStyle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
      marginBottom: SPACING.xs,
    },

    containerStyle: {
      minHeight: 52,
      backgroundColor: COLORS.surface,
      borderRadius: SPACING.borderRadius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: COLORS.border,
    },

    /* Submit */
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
