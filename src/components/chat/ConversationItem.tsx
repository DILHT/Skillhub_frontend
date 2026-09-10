// src/components/chat/ConversationItem.tsx

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Conversation } from "../../types/chat.types";
import { Avatar } from "../common/Avatar";
import { useAppTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/theme";
import { SPACING } from "../../constants/spacing";
import { TYPOGRAPHY } from "../../constants/typography";
import { formatDistanceToNow, parseISO } from "date-fns";

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
}) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);

  const timeAgo = formatDistanceToNow(parseISO(conversation.lastMessageAt), {
    addSuffix: false,
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar with online indicator */}
      <View style={styles.avatarWrapper}>
        <Avatar
          uri={conversation.participantAvatar}
          name={conversation.participantName}
          size="lg"
        />
        {conversation.isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Conversation info */}
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {conversation.participantName}
          </Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.preview,
              conversation.unreadCount > 0 && styles.previewUnread,
            ]}
            numberOfLines={1}
          >
            {conversation.lastMessage}
          </Text>
          {conversation.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      paddingHorizontal: SPACING.screenPadding,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.divider,
    },
    avatarWrapper: { position: "relative" },
    onlineDot: {
      position: "absolute",
      bottom: 1,
      right: 1,
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor: COLORS.success,
      borderWidth: 2,
      borderColor: COLORS.surface,
    },
    info: { flex: 1 },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 3,
    },
    name: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
      flex: 1,
    },
    time: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textTertiary,
      marginLeft: SPACING.sm,
    },
    bottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    preview: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      maxWidth : "70%"
    },
    previewUnread: {
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    badge: {
      backgroundColor: COLORS.primary,
      borderRadius: SPACING.borderRadius.full,
      minWidth: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 5,
      marginLeft: SPACING.sm,
    },
    badgeText: {
      color: COLORS.white,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
  });
