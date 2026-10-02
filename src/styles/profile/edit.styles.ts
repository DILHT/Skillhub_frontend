import { StyleSheet } from "react-native";

import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

export const makeEditProfileStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.surface },
    flex: { flex: 1 },
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
      paddingVertical: SPACING.xxl,
      backgroundColor: COLORS.background,
      flexGrow: 1,
    },
    form: { gap: SPACING.md, flex: 1 },

    /* Inputs */
    labelStyle: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
    },

    containerStyle: {
      minHeight: 52,
      backgroundColor: COLORS.surface,
      borderRadius: SPACING.borderRadius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: COLORS.border,
    },

    textAreaContainer: {
      minHeight: 100,
      backgroundColor: COLORS.surface,
      borderRadius: SPACING.borderRadius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: COLORS.border,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
    },

    textAreaInput: {
      height: "100%",
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      textAlignVertical: "top",
    },

    saveButton : {
      marginVertical: SPACING.lg,
      borderRadius: SPACING.borderRadius.full,
    },

    readOnlyField: {
      backgroundColor: COLORS.inputBackground,
      borderRadius: SPACING.borderRadius.lg,
      padding: SPACING.md,
      gap: 4,
      display: "none",
    },
    readOnlyLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
    },
    readOnlyValue: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textSecondary,
    },
    readOnlyHint: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.textTertiary,
    },
    errorBox: {
      backgroundColor: COLORS.errorBg,
      borderWidth: 1,
      borderColor: COLORS.errorBorder,
      borderRadius: SPACING.borderRadius.lg,
      padding: SPACING.md,
    },
    errorText: {
      color: COLORS.danger,
      fontSize: TYPOGRAPHY.fontSize.sm,
      textAlign: "center",
    },

    avatarSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    avatarWrapper: {
      width: 100,
      height: 100,
      borderRadius: 50,
      position: "relative",
    },
    avatarImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: COLORS.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: COLORS.divider,
    },
    avatarEditBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: COLORS.surface,
    },
    avatarHint: {
      marginTop: 8,
      fontSize: 13,
      color: COLORS.textSecondary,
    },
  });
