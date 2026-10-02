import { StyleSheet } from "react-native";
import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

export const makeRegisterScreenStyle = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
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

    flex: {
      flex: 1,
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
    inputWrapper: {
      gap: SPACING.xs,
    },

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

    /* Password / input requirements */
    inputInstructions: {
      gap: SPACING.xs,
      paddingTop: SPACING.xs,
      paddingLeft: SPACING.xs,
    },

    inputInstruction: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      minHeight: 20,
    },

    check: {
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
    },

    checkMet: {
      backgroundColor: COLORS.success,
      borderColor: COLORS.success,
    },

    inputInstructionText: {
      flex: 1,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.textSecondary,
      lineHeight: 17,
    },

    inputInstructionTextMet: {
      color: COLORS.success,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    /* Terms checkbox */
    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginTop: SPACING.xs,
      marginBottom: SPACING.md,
    },

    checkbox: {
      width: 20,
      height: 20,
      marginTop: 1,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: COLORS.border,
      backgroundColor: COLORS.surface,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    checkboxChecked: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },

    checkboxLabel: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      lineHeight: 20,
    },

    checkboxLink: {
      color: COLORS.primary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    termsErrorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      marginTop: -SPACING.xs,
    },

    termsErrorText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.xs,
      lineHeight: 17,
      color: COLORS.danger,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
    },

    /* API error */
    apiError: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: SPACING.sm,
      padding: SPACING.md,
      backgroundColor: COLORS.errorBg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: COLORS.errorBorder,
      borderRadius: SPACING.borderRadius.md,
    },

    apiErrorText: {
      flex: 1,
      color: COLORS.danger,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      lineHeight: 20,
    },

    /* Submit */
    submitButton: {
      marginTop: SPACING.xs,
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
