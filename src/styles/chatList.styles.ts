import { StyleSheet } from "react-native";

import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";
import { SearchBar } from "react-native-screens";

export const makeChatListStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      padding: SPACING.screenPadding,
      paddingBottom: SPACING.md,
    //   borderBottomWidth: 1,
    //   borderBottomColor: COLORS.divider,
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.xxxl,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.textPrimary,
    },
    headerBadge: {
      backgroundColor: COLORS.danger,
      borderRadius: SPACING.borderRadius.full,
      minWidth: 22,
      height: 22,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: SPACING.xs,
    },
    headerBadgeText: {
      color: COLORS.white,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    skeletonRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      padding: SPACING.screenPadding,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.divider,
    },
    skeletonInfo: { flex: 1, gap: SPACING.xs },
    emptyState: {
      alignItems: "center",
      paddingTop: SPACING.xxxl,
      gap: SPACING.md,
      padding: SPACING.screenPadding,
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
  });
