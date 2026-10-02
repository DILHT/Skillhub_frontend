import { StyleSheet } from "react-native";

import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

export const makeMenuStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    item: {
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
    iconBoxDanger: { backgroundColor: COLORS.errorBg },
    textCol: {
      paddingLeft: SPACING.xs,
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    label: {
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

export const makeProfileStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: SPACING.screenPadding,
      paddingBottom: SPACING.md,
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
    },
    userCard: {
      paddingTop: SPACING.xs,
      padding: SPACING.lg,
      alignItems: "center",
      gap: SPACING.md,
    },
    userInfo: { alignItems: "center", gap: 4 },
    userName: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
    },
    userRole: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.primary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    userEmail: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: SPACING.borderRadius.full,
      borderWidth: 1,
      borderColor: COLORS.primary,
    },
    editButtonText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.primary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    verifyBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: COLORS.warningBg,
      padding: SPACING.md,
      marginHorizontal: SPACING.screenPadding,
      marginTop: SPACING.md,
      borderRadius: SPACING.borderRadius.lg,
      borderWidth: 1,
      borderColor: COLORS.warningBorder,
    },
    verifyText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.warningText,
    },
    section: {
      marginTop: SPACING.lg,
      paddingHorizontal: SPACING.screenPadding,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textTertiary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: SPACING.sm,
    },
    sectionCard: {
      borderRadius: 20,
      overflow: "hidden",
      marginVertical: 7,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.divider,
      padding: 4,
    },
    divider: {
      height: 1,
      backgroundColor: COLORS.divider,
      marginLeft: SPACING.screenPadding + 36 + SPACING.md,
    },
  });
