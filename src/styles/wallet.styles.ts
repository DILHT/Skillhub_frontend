import { StyleSheet } from "react-native";

import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

export const makeWalletStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: {
      padding: SPACING.screenPadding,
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.xxxl,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.textPrimary,
    },

    section: {
      paddingHorizontal: SPACING.screenPadding,
      paddingBottom: SPACING.screenPadding,
    },

    balanceCard: {
      backgroundColor: COLORS.primary,
      borderRadius: SPACING.borderRadius.lg,
      padding: SPACING.lg,
      gap: SPACING.xxs,
    },

    balanceLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: "#ffffffbf",
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      marginBottom: SPACING.sm,
    },
    balanceAmount: {
      fontSize: TYPOGRAPHY.fontSize.xxxl,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.white,
    },
    escrowText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: "rgba(255,255,255,0.65)",
      marginBottom: SPACING.sm,
    },
    actionRow: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.lg },
    actionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 44,
      borderRadius: SPACING.borderRadius.md,
      backgroundColor: "rgba(255,255,255,0.15)",
      gap: SPACING.xs,
    },
    actionLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.white,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: SPACING.sm,
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
    transactionList: {
      backgroundColor: COLORS.surface,
      borderRadius: SPACING.borderRadius.lg,
      borderWidth: 1,
      borderColor: COLORS.divider,
      overflow: "hidden",
    },
    emptyTxn: {
      padding: SPACING.xl,
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.sm,
    },
    emptyTxnText: {
      color: COLORS.textSecondary,
      fontSize: TYPOGRAPHY.fontSize.sm,
    },
    txnRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
    },
    txnIcon: {
      width: 40,
      height: 40,
      borderRadius: SPACING.borderRadius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    txnInfo: { flex: 1, minWidth: 0 },
    txnDescription: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textPrimary,
    },
    txnDate: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      marginTop: 2,
    },
    txnAmount: {
      maxWidth: "35%",
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
    },
    txnDivider: {
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
