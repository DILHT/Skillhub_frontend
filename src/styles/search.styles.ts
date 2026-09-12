// src/styles/search.styles.ts

import { StyleSheet } from "react-native";

import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

export const makeSearchStyles = (COLORS: AppColors, isDark: boolean) =>
  StyleSheet.create({
    // ─────────────────────────────────────────────────────────────
    // SCREEN
    // ─────────────────────────────────────────────────────────────

    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    // ─────────────────────────────────────────────────────────────
    // HEADER
    // ─────────────────────────────────────────────────────────────

    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
    },

    backBtn: {
      width: 46,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: SPACING.borderRadius.full,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: isDark ? COLORS.divider : COLORS.primaryLight,
    },

    inputWrapper: {
      flex: 1,
      height: 46,
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: SPACING.borderRadius.full,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: isDark ? COLORS.divider : COLORS.primaryLight,
    },

    input: {
      flex: 1,
      minWidth: 0,
      height: "100%",
      paddingVertical: 0,
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
    },

    // ─────────────────────────────────────────────────────────────
    // SEARCH RESULT HEADER
    // ─────────────────────────────────────────────────────────────

    searchResults: {
      paddingBottom: SPACING.xs,
      fontSize: TYPOGRAPHY.fontSize.lg,
      lineHeight: 24,
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
    },

    // ─────────────────────────────────────────────────────────────
    // RESULTS LIST
    // ─────────────────────────────────────────────────────────────

    listContent: {
      flexGrow: 1,
      paddingHorizontal: SPACING.screenPadding,
      paddingBottom: SPACING.xxl,
    },

    // ─────────────────────────────────────────────────────────────
    // EMPTY SEARCH STATE
    // ─────────────────────────────────────────────────────────────

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.xxl,
      gap: SPACING.sm,
    },

    emptyTitle: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
      textAlign: "center",
    },

    emptySubtitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },

    // ─────────────────────────────────────────────────────────────
    // INITIAL SEARCH PROMPT
    // ─────────────────────────────────────────────────────────────

    promptState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: SPACING.xxl,
      paddingTop: SPACING.xxl,
      gap: SPACING.md,
    },

    promptText: {
      maxWidth: 280,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },

    // ─────────────────────────────────────────────────────────────
    // ERROR STATE
    // ─────────────────────────────────────────────────────────────

    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: SPACING.xl,
      gap: SPACING.md,
    },

    errorStateTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
      textAlign: "center",
    },

    errorStateText: {
      maxWidth: 320,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },

    retryButton: {
      minWidth: 120,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      marginTop: SPACING.xs,
      paddingHorizontal: SPACING.lg,
      borderRadius: SPACING.borderRadius.full,
      backgroundColor: COLORS.primary,
    },

    retryButtonText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.white,
    },
  });
