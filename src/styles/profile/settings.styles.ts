import { StyleSheet } from "react-native";

import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

export const makeRowStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.screenPadding,
      backgroundColor: COLORS.surface,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: COLORS.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    danger: { backgroundColor: COLORS.errorBg },
    label: {
      flex: 1,
      paddingLeft: SPACING.sm,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
    },
    value: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      marginTop: 2,
    },
  });

export const makeSettingsStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.surface },

    headerSpacer: { width: 40 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
      backgroundColor: COLORS.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS.divider,
    },

    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.surface,
    },

    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.textPrimary,
    },

    content: {
      padding: SPACING.screenPadding,
      gap: SPACING.lg,
      flexGrow: 1,
      backgroundColor: COLORS.background,
    },

    sectionLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textTertiary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },

    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.screenPadding,
      backgroundColor: COLORS.surface,
    },
    toggleLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
    },
    toggleLabel: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
    },
    version: {
      textAlign: "center",
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textTertiary,
      marginTop: SPACING.lg,
    },
  });
