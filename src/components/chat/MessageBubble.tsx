// src/components/chat/MessageBubble.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Message } from "../../types/chat.types";
import { useAppTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/theme";
import { SPACING } from "../../constants/spacing";
import { TYPOGRAPHY } from "../../constants/typography";
import { format, parseISO, isValid } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean; // true = sent by current user (right side)
}

function StatusIcon({ status }: { status: Message["status"] }) {
  const { colors: COLORS } = useAppTheme();
  switch (status) {
    case "sending":
      return (
        <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.6)" />
      );
    case "sent":
      return (
        <Ionicons
          name="checkmark-outline"
          size={12}
          color="rgba(255,255,255,0.7)"
        />
      );
    case "delivered":
      return (
        <Ionicons
          name="checkmark-done-outline"
          size={12}
          color="rgba(255,255,255,0.7)"
        />
      );
    case "read":
      return (
        <Ionicons
          name="checkmark-done-outline"
          size={12}
          color={COLORS.successBorder}
        />
      );
    default:
      return null;
  }
}

// createdAt isn't guaranteed to be parseable (bad payload, clock skew, etc.)
// — never let a malformed date crash the bubble.
function formatMessageTime(createdAt: string): string {
  const parsed = parseISO(createdAt);
  return isValid(parsed) ? format(parsed, "HH:mm") : "";
}

function MessageBubbleComponent({ message, isMine }: MessageBubbleProps) {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const timeString = formatMessageTime(message.createdAt);

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleTheirs,
        ]}
      >
        <Text
          style={[
            styles.content,
            isMine ? styles.contentMine : styles.contentTheirs,
          ]}
        >
          {message.content}
        </Text>
        <View style={styles.meta}>
          {!!timeString && (
            <Text
              style={[
                styles.time,
                isMine ? styles.timeMine : styles.timeTheirs,
              ]}
            >
              {timeString}
            </Text>
          )}
          {isMine && <StatusIcon status={message.status} />}
        </View>
      </View>
    </View>
  );
}

// Re-renders are driven by a live FlatList in a chat screen — memoize so a
// new message arriving doesn't re-render every bubble already on screen.
export const MessageBubble = React.memo(
  MessageBubbleComponent,
  (prev, next) =>
    prev.message.id === next.message.id &&
    prev.message.status === next.message.status &&
    prev.message.content === next.message.content &&
    prev.isMine === next.isMine,
);

const makeStyles = (COLORS: AppColors, isDark: boolean) =>
  StyleSheet.create({
    row: {
      marginVertical: SPACING.xs,
      paddingHorizontal: SPACING.screenPadding,
    },
    rowMine: { alignItems: "flex-end" },
    rowTheirs: { alignItems: "flex-start" },

    bubble: {
      maxWidth: "84%",
      borderRadius: SPACING.borderRadius.lg,
      paddingHorizontal: SPACING.md,
      paddingVertical: 10,
      gap: 4,
    },
    bubbleMine: {
      backgroundColor: COLORS.primary,
      borderBottomRightRadius: 4,
    },
    bubbleTheirs: {
      backgroundColor: isDark ? COLORS.surfaceSecondary : COLORS.surface,
      borderBottomLeftRadius: 4,
    },

    content: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      lineHeight: 22,
    },
    contentMine: { color: COLORS.white },
    contentTheirs: { color: COLORS.textPrimary },

    meta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 3,
    },
    time: { fontSize: TYPOGRAPHY.fontSize.xs, fontFamily: TYPOGRAPHY.fontFamily.medium },
    timeMine: { color: "rgba(255,255,255,0.65)" },
    timeTheirs: { color: COLORS.textTertiary },
  });
