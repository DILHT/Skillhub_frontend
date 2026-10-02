import { StyleSheet } from "react-native";

import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

export const makeProgressStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    wrap: { gap: SPACING.xs },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
    },
    count: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
    },
    track: {
      height: 6,
      borderRadius: 3,
      backgroundColor: COLORS.divider,
      overflow: "hidden",
    },
    fill: { height: "100%", borderRadius: 3, backgroundColor: COLORS.primary },
  });

export const makeDocTypeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    row: { flexDirection: "row", gap: SPACING.sm },
    card: {
      flex: 1,
      minHeight: 88,
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      borderRadius: SPACING.borderRadius.lg,
      borderWidth: 1,
      borderColor: COLORS.divider,
      backgroundColor: COLORS.surface,
    },
    cardActive: {
      borderColor: COLORS.primary,
      backgroundColor: COLORS.primaryLight,
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textSecondary,
    },
    labelActive: { color: COLORS.primary },
    check: { position: "absolute", top: SPACING.xs, right: SPACING.xs },
  });

export const makeUploadStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    card: {
      minHeight: 96,
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      padding: SPACING.md,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: COLORS.divider,
      backgroundColor: COLORS.surface,
    },
    cardEmpty: { borderStyle: "dashed" },
    cardFilled: { borderStyle: "solid", borderColor: COLORS.successText },
    thumb: { width: 72, height: 72, borderRadius: 10 },
    copy: { flex: 1, gap: 3, alignItems: "flex-start" },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      flexWrap: "wrap",
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
    },
    desc: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textTertiary,
      lineHeight: 16,
    },
    uploadIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.primaryLight,
    },
    addIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.primaryLight,
    },
    badge: {
      backgroundColor: COLORS.primaryLight,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: SPACING.borderRadius.full,
    },
    badgeOptional: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.divider,
    },
    badgeText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.primary,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
    },
    badgeTextOptional: { color: COLORS.textTertiary },
    statusRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    statusText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.successText,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    actions: { flexDirection: "row", gap: SPACING.md, marginTop: 2 },
    actionBtn: { paddingVertical: 2 },
    actionText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.primary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    actionTextMuted: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textTertiary,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
    },
  });

export const makeKycStyles = (COLORS: AppColors, _isDark: boolean) =>
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

    infoBanner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: SPACING.md,
      padding: SPACING.md,
      borderRadius: SPACING.borderRadius.lg,
      backgroundColor: COLORS.primaryLight,
    },
    infoCopy: { flex: 1, gap: 4 },
    infoTitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.primary,
    },
    infoText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      lineHeight: 18,
    },

    section: { gap: SPACING.md },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.md ?? TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
    },
    uploadGrid: { gap: SPACING.md },

    tipsCard: {
      backgroundColor: COLORS.surface,
      borderRadius: SPACING.borderRadius.lg,
      padding: SPACING.md,
      gap: SPACING.sm,
      borderWidth: 1,
      borderColor: COLORS.divider,
    },
    tipsTitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
    },
    tipRow: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm },
    tipText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      lineHeight: 20,
    },

    footer: {
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.sm,
      gap: SPACING.xs,
      backgroundColor: COLORS.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: COLORS.divider,
    },
    submitButton: { borderRadius: SPACING.borderRadius.full },
    requiredNote: {
      marginTop: SPACING.sm,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textTertiary,
      textAlign: "center",
    },
  });
