// src/components/chat/ChatInput.tsx

import React, { useCallback, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/theme";
import { SPACING } from "../../constants/spacing";
import { TYPOGRAPHY } from "../../constants/typography";

interface ChatInputProps {
  onSend: (text: string) => void | Promise<void>;
  onTyping?: () => void;
  /** Minimum gap between typing-event emissions. */
  typingDebounceMs?: number;
  /** Bottom safe-area inset supplied by the chat screen. */
  bottomInset?: number;
}

const MAX_LENGTH = 1000;
const MIN_INPUT_HEIGHT = 48;
const MAX_INPUT_HEIGHT = 140;

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onTyping,
  typingDebounceMs = 1500,
  bottomInset = 0,
}) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark, bottomInset);

  const [text, setText] = useState("");
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canSend = text.trim().length > 0 && !isSending;

  // Fire onTyping at most once per typingDebounceMs, instead of on every
  // keystroke (avoids spamming the socket/typing-event channel).
  const notifyTyping = useCallback(() => {
    if (!onTyping || typingTimeoutRef.current) return;
    onTyping();
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, typingDebounceMs);
  }, [onTyping, typingDebounceMs]);

  const handleChange = useCallback(
    (value: string) => {
      setText(value);
      notifyTyping();
    },
    [notifyTyping],
  );

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setText("");
    setInputHeight(MIN_INPUT_HEIGHT);

    try {
      setIsSending(true);
      await onSend(trimmed);
    } catch {
      // Send failed — restore the draft so the user doesn't lose it.
      setText(trimmed);
    } finally {
      setIsSending(false);
    }
  }, [text, isSending, onSend]);

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.attachButton}
          accessibilityLabel="Attach file"
          accessibilityRole="button"
        >
          <Ionicons
            name="attach-outline"
            size={22}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            {
              height: Math.min(
                Math.max(inputHeight, MIN_INPUT_HEIGHT),
                MAX_INPUT_HEIGHT,
              ),
            },
          ]}
          value={text}
          onChangeText={handleChange}
          onContentSizeChange={(e) =>
            setInputHeight(e.nativeEvent.contentSize.height)
          }
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textTertiary}
          multiline
          textAlignVertical="center"
          scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
          maxLength={MAX_LENGTH}
          returnKeyType="default"
          blurOnSubmit={false}
          accessibilityLabel="Message input"
        />

        <TouchableOpacity
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          onPress={handleSend}
          disabled={!canSend}
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: !canSend }}
          accessibilityRole="button"
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

const makeStyles = (
  COLORS: AppColors,
  _isDark: boolean,
  bottomInset: number,
) =>
  StyleSheet.create({
    container: {
      backgroundColor: COLORS.surface,
      borderTopWidth: 1,
      borderTopColor: COLORS.divider,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      paddingBottom: Math.max(bottomInset, SPACING.xl),
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: SPACING.sm,
    },
    attachButton: {
      width: 44,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: SPACING.borderRadius.full,
    },
    input: {
      flex: 1,
      backgroundColor: COLORS.inputBackground,
      borderWidth: 1,
      borderColor: COLORS.divider,
      borderRadius: SPACING.borderRadius.xl,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textPrimary,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: SPACING.borderRadius.full,
      backgroundColor: COLORS.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    sendButtonActive: {
      backgroundColor: COLORS.primary,
    },
  });
