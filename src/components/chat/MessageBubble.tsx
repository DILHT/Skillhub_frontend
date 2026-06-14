// src/components/chat/MessageBubble.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../../types/chat.types';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { format, parseISO } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean; // true = sent by current user (right side)
}

// Shows the correct read receipt icon based on message status
function StatusIcon({ status }: { status: Message['status'] }) {
  const { colors: COLORS } = useAppTheme();
  if (status === 'sending') return <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.6)" />;
  if (status === 'sent') return <Ionicons name="checkmark-outline" size={12} color="rgba(255,255,255,0.7)" />;
  if (status === 'delivered') return <Ionicons name="checkmark-done-outline" size={12} color="rgba(255,255,255,0.7)" />;
  if (status === 'read') return <Ionicons name="checkmark-done-outline" size={12} color={COLORS.successBorder} />;
  return null;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMine }) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);

  const timeString = format(parseISO(message.createdAt), 'HH:mm');

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.content, isMine ? styles.contentMine : styles.contentTheirs]}>
          {message.content}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>
            {timeString}
          </Text>
          {isMine && <StatusIcon status={message.status} />}
        </View>
      </View>
    </View>
  );
};

const makeStyles = (COLORS: AppColors, isDark: boolean) => StyleSheet.create({
  row: {
    marginVertical: 2,
    paddingHorizontal: SPACING.screenPadding,
  },
  rowMine: { alignItems: 'flex-end' },
  rowTheirs: { alignItems: 'flex-start' },

  bubble: {
    maxWidth: '78%',
    borderRadius: SPACING.borderRadius.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 4,
  },
  // My messages: always blue in both modes
  bubbleMine: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  // Their messages: surface in light, surfaceSecondary in dark
  bubbleTheirs: {
    backgroundColor: isDark ? COLORS.surfaceSecondary : COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: isDark ? 0 : 1,
    borderColor: isDark ? 'transparent' : COLORS.border,
  },

  content: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: 22,
  },
  contentMine: { color: COLORS.white },
  contentTheirs: { color: COLORS.textPrimary },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
  },
  time: { fontSize: TYPOGRAPHY.fontSize.xs },
  timeMine: { color: 'rgba(255,255,255,0.65)' },
  timeTheirs: { color: COLORS.textTertiary },
});
