// src/screens/chat/ChatRoomScreen.tsx

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useChatRoom } from "@/hooks/useChat";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { Avatar } from "@/components/common/Avatar";
import { ChatStackParamList } from "@/navigation/AppNavigator";
import { Message } from "@/types/chat.types";
import { useAppTheme } from "@/context/ThemeContext";
import { makeChatRoomStyles } from "@/styles/chatRoom.styles";
import { useShadows } from "@/constants/shadows";

type RouteProps = RouteProp<ChatStackParamList, "ChatRoom">;

type ListRow =
  | { type: "date"; id: string; label: string }
  | { type: "message"; id: string; message: Message };

export default function ChatRoomScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = makeChatRoomStyles(COLORS, isDark, insets);
  const shadows = useShadows(isDark);
  const shadowStyle = isDark ? shadows.tinted.sm : shadows.sm;
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { conversationId, recipientName } = route.params;

  const userId = useAuthStore((s) => s.user?.id ?? "");
  const conversations = useChatStore((s) => s.conversations);
  const conversation = conversations.find((c) => c.id === conversationId);
  const isOnline = conversation?.isOnline ?? false;

  const { messages, sendMessage, handleTyping, isOtherTyping } = useChatRoom(
    conversationId,
    conversation?.participantId ?? "",
  );

  const flatListRef = useRef<FlatList<ListRow>>(null);
  const isNearBottomRef = useRef(true);
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);
  const [isOptionsMenuVisible, setIsOptionsMenuVisible] = useState(false);

  // Flatten messages + date separators once per `messages` change instead of
  // recomputing "did the day change" inside renderItem on every row render.
  const rows = useMemo<ListRow[]>(() => {
    const result: ListRow[] = [];
    let lastDay: string | null = null;

    for (const message of messages) {
      const day = message.createdAt.slice(0, 10);
      if (day !== lastDay) {
        result.push({
          type: "date",
          id: `date-${day}`,
          label: new Date(message.createdAt).toLocaleDateString("en-MW", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }),
        });
        lastDay = day;
      }
      result.push({ type: "message", id: message.id, message });
    }

    return result;
  }, [messages]);

  const handleOptionsPress = useCallback(() => {
    setIsOptionsMenuVisible((visible) => !visible);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ListRow }) => {
      if (item.type === "date") {
        return (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{item.label}</Text>
          </View>
        );
      }
      return (
        <MessageBubble
          message={item.message}
          isMine={item.message.senderId === userId}
        />
      );
    },
    [styles, userId],
  );

  const scrollToLatest = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setShowScrollToLatest(false);
  }, []);

  const handleScroll = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const distanceFromBottom =
        nativeEvent.contentSize.height -
        nativeEvent.layoutMeasurement.height -
        nativeEvent.contentOffset.y;
      const isNearBottom = distanceFromBottom < 72;

      isNearBottomRef.current = isNearBottom;
      setShowScrollToLatest(!isNearBottom);
    },
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.screenContent}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons
                name="chevron-back"
                size={26}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>

            <Avatar
              uri={conversation?.participantAvatar ?? null}
              name={recipientName}
              size="sm"
            />

            <View style={styles.headerInfo}>
              <Text style={styles.headerName} numberOfLines={1}>
                {recipientName}
              </Text>
              <Text style={styles.headerStatus}>
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.headerAction}
              onPress={handleOptionsPress}
              accessibilityLabel="Conversation options"
              accessibilityRole="button"
            >
              <Ionicons
                name="ellipsis-vertical"
                size={18}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* MESSAGES */}
          <FlatList
            ref={flatListRef}
            data={rows}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={Platform.OS === "android"}
            maxToRenderPerBatch={16}
            windowSize={10}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            // Preserve the reader's place when they are viewing earlier messages.
            // Only follow new content while they are already at the latest message.
            onContentSizeChange={() => {
              if (isNearBottomRef.current) {
                flatListRef.current?.scrollToEnd({ animated: rows.length > 0 });
              }
            }}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Ionicons
                  name="chatbubble-outline"
                  size={40}
                  color={COLORS.textTertiary}
                />
                <Text style={styles.emptyChatText}>
                  Send a message to start the conversation
                </Text>
              </View>
            }
            ListFooterComponent={
              isOtherTyping ? (
                <View style={styles.typingIndicator}>
                  <Text style={styles.typingText}>
                    {recipientName} is typing...
                  </Text>
                </View>
              ) : null
            }
          />

          {showScrollToLatest && rows.length > 0 && (
            <TouchableOpacity
              style={styles.scrollToLatest}
              onPress={scrollToLatest}
              accessibilityLabel="Jump to latest message"
              accessibilityHint="Scrolls to the most recent message"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-down" size={18} color={COLORS.white} />
            </TouchableOpacity>
          )}

          {isOptionsMenuVisible && (
            <>
              <Pressable
                style={styles.optionsBackdrop}
                onPress={() => setIsOptionsMenuVisible(false)}
                accessibilityLabel="Close conversation options"
                accessibilityRole="button"
              />
              <View style={[styles.optionsMenu, shadowStyle]} accessibilityViewIsModal>
                <TouchableOpacity
                  style={styles.optionsMenuItem}
                  onPress={() => setIsOptionsMenuVisible(false)}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="person-outline"
                    size={15}
                    color={COLORS.textPrimary}
                  />
                  <Text style={styles.optionsMenuText}>View profile</Text>
                </TouchableOpacity>
                <View style={styles.optionsDivider} />
                <TouchableOpacity
                  style={styles.optionsMenuItem}
                  onPress={() => setIsOptionsMenuVisible(false)}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="ban-outline"
                    size={15}
                    color={COLORS.danger}
                  />
                  <Text style={styles.optionsMenuDanger}>Block user</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* INPUT BAR */}
          <ChatInput
            onSend={sendMessage}
            onTyping={handleTyping}
            bottomInset={insets.bottom}
          />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
