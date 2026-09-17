// src/styles/notifications.styles.ts

import { StyleSheet } from "react-native";

import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

export const makeNotificationsStyles = (COLORS: AppColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: SPACING.sm,
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
    },
    backBtn: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: SPACING.borderRadius.full,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.divider,
    },

    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.textPrimary,
    },
    markAll: {
      fontSize: 14,
      color: COLORS.primary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
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
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.screenPadding,
      gap: SPACING.md,
    },
    sectionHeader: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textSecondary,
      letterSpacing: 0.5,
    },
    item: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: COLORS.surface,
      borderRadius: SPACING.borderRadius.lg,

      // Remove the strong border if you're using shadows
      borderWidth: 0,
    },

    itemUnread: {
      // Keep the card white
      backgroundColor: COLORS.surface,

      // Subtle unread indicator
      borderLeftWidth: 3,
      borderLeftColor: COLORS.primary,
    },

    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: SPACING.borderRadius.full,
      backgroundColor: COLORS.background,
      alignItems: "center",
      justifyContent: "center",
    },

    unreadIcon: {
      backgroundColor: COLORS.primaryLight,
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
      marginTop: 6,
    },
  });
