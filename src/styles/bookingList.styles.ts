import { StyleSheet } from "react-native";

import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";
import { SearchBar } from "react-native-screens";

export const makeBookingListStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: SPACING.sm,
      padding: SPACING.screenPadding,
      paddingBottom: SPACING.md,
    },


    addButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.surface,
    },

    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.xxxl,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.textPrimary,
    },

    headerSpacer: {
      width: 42,
    },

    filterContainer: {
      marginBottom: SPACING.sm,
    },

    tabsList: {
      flexGrow: 0,
      marginBottom: SPACING.md, 
    },

    tabsRow: {
      paddingHorizontal: SPACING.screenPadding,
      gap: SPACING.sm,
      paddingVertical: SPACING.sm,
    },

    tab: {
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

    tabActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },

    tabLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textSecondary,
    },

    tabLabelActive: {
      color: COLORS.white,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
    },

    listContent: { padding: SPACING.screenPadding, paddingTop: 0, flexGrow: 1 },
    skeletonCard: { marginBottom: SPACING.md },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: SPACING.xxxl,
      gap: SPACING.md,
    },
    emptyTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
    },
    emptySubtitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      textAlign: "center",
    },
    browseButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.sm,
      borderRadius: SPACING.borderRadius.full,
      marginTop: SPACING.sm,
    },
    browseButtonText: {
      color: COLORS.white,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 12,
    },
    errorStateTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: COLORS.textPrimary,
    },
    errorStateText: {
      fontSize: 14,
      color: COLORS.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    retryButton: {
      marginTop: 8,
      backgroundColor: COLORS.primary,
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 999,
    },
    retryButtonText: {
      color: COLORS.white,
      fontSize: 15,
      fontWeight: "600",
    },
  });
