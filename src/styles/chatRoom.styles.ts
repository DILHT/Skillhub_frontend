// src/styles/chatRoom.styles.ts

import { StyleSheet } from "react-native";
import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

export const makeChatRoomStyles = (
  COLORS: AppColors,
  _isDark: boolean,
  _insets: any,
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      // This colour also fills the status-bar safe area above the header.
      backgroundColor: COLORS.surface,
    },
    screenContent: { flex: 1, backgroundColor: COLORS.background },
    flex: { flex: 1 },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      padding: SPACING.screenPadding,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
      backgroundColor: COLORS.surface,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.divider,
    },
    backBtn: { padding: 2 },
    headerInfo: { flex: 1 },
    headerName: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
    },
    headerStatus: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
    },
    headerAction: { padding: 4 },

    // Messages
    messageList: {
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.lg,
      flexGrow: 1,
      gap: SPACING.sm,
    },

    // Date separator
    dateSeparator: {
      alignItems: "center",
      marginTop: SPACING.md,
      marginBottom: SPACING.sm,
    },
    dateSeparatorText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textTertiary,
      backgroundColor: COLORS.divider,
      paddingHorizontal: SPACING.md,
      paddingVertical: 3,
      borderRadius: SPACING.borderRadius.full,
    },

    // Typing indicator
    typingIndicator: {
      paddingHorizontal: SPACING.screenPadding,
      paddingBottom: SPACING.sm,
    },
    typingText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.textSecondary,
      fontStyle: "italic",
    },

    // Empty state
    emptyChat: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: SPACING.xxxl,
      gap: SPACING.md,
      padding: SPACING.xl,
    },
    emptyChatText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      textAlign: "center",
    },
    scrollToLatest: {
      position: "absolute",
      right: SPACING.md,
      bottom: SPACING.md,
      width: 44,
      height: 44,
      borderRadius: SPACING.borderRadius.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.primary,
      elevation: 4,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    optionsBackdrop: {
      ...StyleSheet.absoluteFill,
      zIndex: 10,
    },
    optionsMenu: {
      position: "absolute",
      top: 48,
      right: SPACING.md,
      zIndex: 11,
      minWidth: 190,
      paddingVertical: SPACING.xs,
      borderRadius: SPACING.borderRadius.md,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.divider,
    },
    optionsMenuItem: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
    },
    optionsMenuText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
    },
    optionsMenuDanger: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.danger,
    },
    optionsDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: COLORS.divider,
      marginHorizontal: SPACING.sm,
    },
  });
