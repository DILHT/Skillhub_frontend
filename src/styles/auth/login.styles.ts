import { StyleSheet } from "react-native";
import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

export const makeLoginStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    flex: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      padding: SPACING.screenPadding,
      justifyContent: "center",
    },
    header: { alignItems: "center", marginBottom: SPACING.xxl },
    logo: {
      width: 150,
      height: 150,
      marginBottom: SPACING.lg,
      borderRadius: SPACING.borderRadius.full,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xxxl,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
      marginBottom: SPACING.xs,
    },
    subtitle: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      textAlign: "center",
    },
    form: { gap: SPACING.md },
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
    forgotPassword: { alignSelf: "flex-end" },
    forgotPasswordText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.primary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
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
      textAlign: "center",
    },
    verifyEmailAction: {
      alignSelf: "center",
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
    submitButton: {
      marginTop: SPACING.md,
      borderRadius: SPACING.borderRadius.full,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "flex-end",
      marginTop: SPACING.xl,
      paddingBottom: SPACING.md,
    },
    footerText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
    },
    footerLink: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.primary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
  });

export const makeDevStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    container: { marginTop: SPACING.md },
    divider: {
      flexDirection: "row",
      alignItems: "center",
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
    buttonRow: { flexDirection: "row", gap: SPACING.md },
    devButton: {
      flex: 1,
      paddingVertical: SPACING.sm,
      borderRadius: SPACING.borderRadius.md,
      backgroundColor: COLORS.warningBg,
      borderWidth: 1,
      borderColor: COLORS.warningBorder,
      alignItems: "center",
    },
    devButtonProvider: {
      backgroundColor: "#EDE9FE",
      borderColor: "#C4B5FD",
    },
    devButtonText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.warningText,
    },
  });
