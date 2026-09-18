import { StyleSheet } from "react-native";

import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

export const makeHomeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    // ============================================================
    // SCREEN
    // ============================================================

    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    listContent: {
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.xxxl,
      flexGrow: 1,
    },

    // ============================================================
    // TOP HEADER
    // ============================================================

    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    },

    searchBar: {
      flex: 1,

      height: 48,
      borderRadius: SPACING.borderRadius.full,

      backgroundColor: COLORS.surface,

      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 15,
      gap: 10,

      borderWidth: 1,
      borderColor: _isDark ? COLORS.divider : COLORS.primaryLight,
    },

    searchPlaceholderHeading: {
      flex: 1,

      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,

      color: COLORS.textSecondary,
    },

    searchPlaceholder: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
    },

    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    notifButton: {
      width: 48,
      height: 48,

      borderRadius: SPACING.borderRadius.full,

      backgroundColor: COLORS.surface,

      alignItems: "center",
      justifyContent: "center",

      borderWidth: 1,
      borderColor: COLORS.divider,
    },

    notifDot: {
      width: 5,
      height: 5,

      borderRadius: 5,

      backgroundColor: COLORS.danger,

      position: "absolute",
      top: 9,
      right: 10,

      borderWidth: 1.5,
      borderColor: COLORS.surface,
    },

    notifBadge: {
      position: "absolute",

      top: 6,
      right: 6,

      minWidth: 17,
      height: 17,

      borderRadius: 9,

      backgroundColor: COLORS.danger,

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 4,
    },

    notifBadgeText: {
      color: COLORS.white,

      fontSize: 9,

      fontFamily: TYPOGRAPHY.fontFamily.bold,
    },

    // ============================================================
    // GREETING
    // ============================================================

    greetingContainer: {
      marginTop: SPACING.xs,
      marginBottom: SPACING.lg,
    },

    greeting: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      lineHeight: 32,

      fontFamily: TYPOGRAPHY.fontFamily.extraBold,

      color: COLORS.textPrimary,
    },

    greetingName: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      lineHeight: 32,

      fontFamily: TYPOGRAPHY.fontFamily.extraBold,

      color: COLORS.primary,
    },

    // ============================================================
    // HOME CONTENT
    // ============================================================

    homeContent: {
      paddingTop: SPACING.xs,
    },

    // ============================================================
    // CATEGORIES
    // ============================================================

    categoriesScroll: {
      paddingVertical: 3,
      paddingRight: SPACING.md,
    },

    allChip: {
      height: 38,

      paddingHorizontal: 15,

      borderRadius: 19,

      backgroundColor: COLORS.surface,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 7,

      marginRight: 8,

      borderWidth: 1,
      borderColor: COLORS.divider,
    },

    allChipActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },

    allChipLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,

      fontFamily: TYPOGRAPHY.fontFamily.medium,

      color: COLORS.textSecondary,
    },

    allChipLabelActive: {
      color: COLORS.white,

      fontFamily: TYPOGRAPHY.fontFamily.bold,
    },

    // ============================================================
    // SECTION HEADERS
    // ============================================================

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      marginTop: SPACING.xl,
      marginBottom: SPACING.xs,
    },

    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,

      fontFamily: TYPOGRAPHY.fontFamily.bold,

      color: COLORS.textPrimary,
    },

    seeAll: {
      fontSize: TYPOGRAPHY.fontSize.sm,

      color: COLORS.primary,

      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    resultCount: {
      fontSize: TYPOGRAPHY.fontSize.xs,

      color: COLORS.textTertiary,

      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    // ============================================================
    // FEATURED SERVICES
    // ============================================================

    featuredScroll: {
      paddingVertical: SPACING.sm,
      paddingRight: SPACING.md,
    },

    // ============================================================
    // ERROR STATE
    // ============================================================

    errorContainer: {
      flex: 1,

      alignItems: "center",
      justifyContent: "center",

      padding: SPACING.xl,

      gap: SPACING.md,
    },

    errorTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,

      fontFamily: TYPOGRAPHY.fontFamily.bold,

      color: COLORS.textPrimary,

      textAlign: "center",
    },

    errorSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,

      color: COLORS.textSecondary,

      textAlign: "center",
    },

    // ============================================================
    // EMPTY STATE
    // ============================================================

    emptyState: {
      alignItems: "center",
      justifyContent: "center",

      paddingTop: SPACING.xxxl,

      gap: SPACING.sm,
    },

    emptyTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,

      fontFamily: TYPOGRAPHY.fontFamily.bold,

      color: COLORS.textPrimary,
    },

    emptySubtitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,

      color: COLORS.textSecondary,

      textAlign: "center",
    },
  });
