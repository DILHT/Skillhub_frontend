import { Dimensions, StyleSheet } from "react-native";

import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const makeServiceDetailsStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    // ─────────────────────────────────────────────────────────────
    // SCREEN
    // ─────────────────────────────────────────────────────────────

    safeArea: {
      flex: 1,
      backgroundColor: COLORS.surface,
    },

    loadingContainer: {
      padding: SPACING.screenPadding,
    },

    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.md,
      padding: SPACING.xl,
      backgroundColor: COLORS.surface,
    },

    errorText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      textAlign: "center",
    },

    // ─────────────────────────────────────────────────────────────
    // IMAGE GALLERY
    // ─────────────────────────────────────────────────────────────

    imageContainer: {
      position: "relative",
      height: 300,
      overflow: "visible",
      backgroundColor: COLORS.border,
    },

    image: {
      width: SCREEN_WIDTH,
      height: 300,
    },

    imageOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.10)",
      zIndex: 1,
      pointerEvents: "none",
    },

    // ─────────────────────────────────────────────────────────────
    // BACK BUTTON
    // ─────────────────────────────────────────────────────────────

    backButton: {
      position: "absolute",
      top: 36,
      left: SPACING.md,
      width: 40,
      height: 40,
      borderRadius: SPACING.borderRadius.full,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    },

    // ─────────────────────────────────────────────────────────────
    // IMAGE DOTS
    // ─────────────────────────────────────────────────────────────

    dotsRow: {
      position: "absolute",
      bottom: SPACING.sm,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 5,
      zIndex: 2,
    },

    dot: {
      width: 6,
      height: 6,
      borderRadius: SPACING.borderRadius.full,
      backgroundColor: "rgba(255,255,255,0.55)",
    },

    dotActive: {
      width: 16,
      height: 6,
      borderRadius: SPACING.borderRadius.full,
      backgroundColor: COLORS.white,
    },

    // ─────────────────────────────────────────────────────────────
    // AVAILABILITY
    // ─────────────────────────────────────────────────────────────

    unavailableBadge: {
      position: "absolute",
      top: 36,
      right: SPACING.md,
      backgroundColor: "rgba(255, 0, 0, 0.2)",
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: SPACING.borderRadius.full,
      zIndex: 2,
    },

    unavailableText: {
      color: COLORS.white,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    // ─────────────────────────────────────────────────────────────
    // MAIN CONTENT CONTAINER
    // ─────────────────────────────────────────────────────────────

    bottom: {
      flex: 1,
      marginTop: -20,
      borderTopLeftRadius: SPACING.borderRadius.xl,
      borderTopRightRadius: SPACING.borderRadius.xl,
      backgroundColor: COLORS.surface,
      overflow: "hidden",
      zIndex: 1,
    },

    scroll: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: 30,
    },

    content: {
      padding: SPACING.screenPadding,
      gap: SPACING.sm,
    },

    // ─────────────────────────────────────────────────────────────
    // TOP META
    // ─────────────────────────────────────────────────────────────

    topMeta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 28,
    },

    categoryChip: {
      alignSelf: "flex-start",
      backgroundColor: COLORS.primaryLight,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 4,
      borderRadius: SPACING.borderRadius.full,
    },

    categoryText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.primary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    price: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.primary,
    },

    // ─────────────────────────────────────────────────────────────
    // TITLE
    // ─────────────────────────────────────────────────────────────

    title: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.textPrimary,
      lineHeight: 32,
      marginTop: SPACING.xs,
    },

    // ─────────────────────────────────────────────────────────────
    // META INFORMATION
    // ─────────────────────────────────────────────────────────────

    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: SPACING.md,
      marginTop: SPACING.xs,
    },

    locationRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      minWidth: 0,
    },

    locationText: {
      flexShrink: 1,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    distanceText: {
      flexShrink: 0,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    rating: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      flexShrink: 0,
    },

    ratingText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    divider: {
      height: 1,
      backgroundColor: COLORS.divider,
      marginVertical: SPACING.sm,
    },

    // ─────────────────────────────────────────────────────────────
    // SECTION TITLES
    // ─────────────────────────────────────────────────────────────

    sectionLabel: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
      marginTop: SPACING.sm,
    },

    // ─────────────────────────────────────────────────────────────
    // PROVIDER CARD
    // ─────────────────────────────────────────────────────────────

    providerCard: {
      marginVertical: SPACING.lg,
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      backgroundColor: COLORS.surface,
      borderRadius: SPACING.borderRadius.full,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: COLORS.divider,
    },

    providerLeft: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
    },

    providerInfo: {
      flex: 1,
      minWidth: 0,
      gap: SPACING.xs,
    },

    providerNameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
    },

    providerName: {
      flexShrink: 1,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
    },

    responseTime: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textTertiary,
    },

    providerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
    },

    providerIcon: {
      width: 40,
      height: 40,
      borderRadius: SPACING.borderRadius.full,
      backgroundColor: COLORS.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },

    // ─────────────────────────────────────────────────────────────
    // DESCRIPTION
    // ─────────────────────────────────────────────────────────────

    description: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      lineHeight: 24,
      marginTop: SPACING.xs,
    },

    // ─────────────────────────────────────────────────────────────
    // TAGS
    // ─────────────────────────────────────────────────────────────

    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.sm,
      marginTop: SPACING.xs,
    },

    tag: {
      backgroundColor: COLORS.primaryLight,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 5,
      borderRadius: SPACING.borderRadius.full,
    },

    tagText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
      textTransform: "capitalize",
    },

    // ─────────────────────────────────────────────────────────────
    // STICKY BOTTOM BAR
    // ─────────────────────────────────────────────────────────────

    bottomBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.lg,
      backgroundColor: COLORS.surface,
      borderTopWidth: 1,
      borderTopColor: COLORS.divider,
    },

    bottomPriceCol: {
      flexShrink: 0,
      gap: 2,
    },

    bottomPriceLabel: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
    },

    bottomPrice: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
    },

    bookButton: {
      flex: 1,
      marginLeft: 0,
      borderRadius: SPACING.borderRadius.full,
    },
  });
