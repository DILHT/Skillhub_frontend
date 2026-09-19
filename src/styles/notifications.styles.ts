// src/styles/notifications.styles.ts

import { StyleSheet } from "react-native";

import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

export const makeNotificationsStyles = (COLORS: AppColors) =>
  StyleSheet.create({
    // Extends the header surface through the status-bar safe area.
    safeArea: { flex: 1, backgroundColor: COLORS.surface },
    content: { flex: 1, backgroundColor: COLORS.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: SPACING.sm,
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
      backgroundColor: COLORS.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS.divider,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
    },
    backButton: {
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

    markAll: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.primary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    markAllButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      minHeight: 40,
      paddingHorizontal: SPACING.xs,
      borderRadius: SPACING.borderRadius.sm,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 12,
    },
    emptyText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textSecondary,
    },
    retryButton: {
      marginTop: 8,
      backgroundColor: COLORS.primary,
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 999,
    },
    retryText: { color: COLORS.white, fontSize: 15, fontWeight: "600" },
    notificationsStyles: {
      paddingTop: SPACING.md,
      paddingBottom: SPACING.xl,
      paddingHorizontal: SPACING.screenPadding,
      gap: SPACING.sm,
    },
    sectionHeader: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textSecondary,
      letterSpacing: 0.5,
      marginTop: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    item: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: SPACING.md,
      minHeight: 84,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      backgroundColor: COLORS.surface,
      borderRadius: SPACING.borderRadius.lg,
      borderWidth: 1,
      borderColor: COLORS.border,
    },

    itemUnread: {
      backgroundColor: COLORS.primaryLight,
      borderLeftWidth: 3,
      borderLeftColor: COLORS.primary,
    },

    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: SPACING.borderRadius.full,
      backgroundColor: COLORS.surfaceSecondary,
      alignItems: "center",
      justifyContent: "center",
    },

    unreadIcon: {
      backgroundColor: COLORS.surface,
    },

    itemContent: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },

    itemContentTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: SPACING.sm,
    },

    itemTitle: {
      flex: 1,
      minWidth: 0,
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    itemTitleUnread: {
      fontFamily: TYPOGRAPHY.fontFamily.bold,
    },

    itemBody: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      lineHeight: 19,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
    },

    itemTime: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.textTertiary,
      marginTop: 2,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
    },

    unreadDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: COLORS.primary,
      marginTop: SPACING.xs,
    },
  });
