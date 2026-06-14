// src/components/chat/ChatInput.tsx

import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

interface ChatInputProps {
  onSend: (text: string) => void;
  onTyping?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onTyping }) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);

  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  const handleChange = (value: string) => {
    setText(value);
    onTyping?.(); // Notify parent to emit typing event
  };

  const canSend = text.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        {/* Attachment button — future lesson */}
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="attach-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChange}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textTertiary}
          multiline
          maxLength={1000}
          returnKeyType="default"
          blurOnSubmit={false}
        />

        <TouchableOpacity
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Ionicons
            name="send"
            size={18}
            color={canSend ? COLORS.white : COLORS.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.lg : SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  attachButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SPACING.borderRadius.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    maxHeight: 120,
    minHeight: 36,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
});
