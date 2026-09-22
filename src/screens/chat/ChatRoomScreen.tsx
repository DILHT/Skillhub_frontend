// src/screens/chat/ChatRoomScreen.tsx

import React, { useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ChatStackParamList } from '@/navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useChatRoom } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { Avatar } from '@/components/common/Avatar';
import { Message } from '@/types/chat.types';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

type RouteProps = RouteProp<ChatStackParamList, 'ChatRoom'>;

export default function ChatRoomScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<ChatStackParamList, 'ChatRoom'>>();
  const route = useRoute<RouteProps>();
  const { conversationId, recipientName } = route.params;

  const userId = useAuthStore((s) => s.user?.id ?? '');
  const conversations = useChatStore((s) => s.conversations);
  const conversation = conversations.find((c) => c.id === conversationId);
  const isOnline = conversation?.isOnline ?? false;
  const networkOnline = useIsOnline();

  const { messages, sendMessage, handleTyping, isOtherTyping } = useChatRoom(
    conversationId,
    conversation?.participantId ?? ''
  );

  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom whenever a new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages.length]);

  // Group messages by date to show date separators
  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isMine = item.senderId === userId;

    // Show date separator when the day changes
    const prevMessage = messages[index - 1];
    const showDateSeparator =
      !prevMessage ||
      item.createdAt.slice(0, 10) !== prevMessage.createdAt.slice(0, 10);

    return (
      <>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {new Date(item.createdAt).toLocaleDateString('en-MW', {
                weekday: 'long', month: 'long', day: 'numeric',
              })}
            </Text>
          </View>
        )}
        <MessageBubble message={item} isMine={isMine} />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <Avatar
            uri={conversation?.participantAvatar ?? null}
            name={recipientName}
            size="sm"
          />

          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>{recipientName}</Text>
            <Text style={styles.headerStatus}>
              {isOnline ? '● Online' : 'Offline'}
            </Text>
          </View>

        </View>

        {/* MESSAGES */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubble-outline" size={40} color={COLORS.textTertiary} />
              <Text style={styles.emptyChatText}>
                Send a message to start the conversation
              </Text>
            </View>
          }
          // Typing indicator below messages
          ListFooterComponent={
            isOtherTyping ? (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>{recipientName} is typing...</Text>
              </View>
            ) : null
          }
        />

        {/* INPUT BAR */}
        <ChatInput
          onSend={(text) => {
            if (!networkOnline) {
              Alert.alert('No Connection', "You're offline. Please reconnect and try again.");
              return;
            }
            sendMessage(text);
          }}
          onTyping={handleTyping}
        />

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backBtn: { padding: 2 },
  headerInfo: { flex: 1 },
  headerName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  headerStatus: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  headerAction: { padding: 4 },

  // Messages
  messageList: {
    paddingVertical: SPACING.md,
    flexGrow: 1,
  },

  // Date separator
  dateSeparator: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dateSeparatorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
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
    fontStyle: 'italic',
  },

  // Empty state
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxxl,
    gap: SPACING.md,
    padding: SPACING.xl,
  },
  emptyChatText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
