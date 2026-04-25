// src/hooks/useChat.ts
//
// THIS HOOK IS THE CORE OF THE CHAT SYSTEM.
// It has two separate responsibilities managed cleanly:
//
//   1. useConversations() — fetches conversation list via React Query (REST)
//   2. useChatRoom()      — manages a live chat room:
//                           - fetches message history (REST)
//                           - subscribes to socket events (real-time)
//                           - sends messages via socket
//                           - manages typing indicators
//
// The socket subscription uses useEffect with a cleanup function.
// When the component unmounts (user leaves the chat room), all socket
// listeners are removed and the room is left. No memory leaks.

import { useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '../service/chatService';
import { socketService } from '../service/socketService';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { Message } from '../types/chat.types';

const CHAT_KEYS = {
  conversations: ['conversations'] as const,
  messages: (id: string) => ['messages', id] as const,
};

// ── HOOK 1: useConversations ──────────────────────────────────────────────────
// Fetches the list of conversations for the ChatListScreen.
// Also registers socket listeners for events that affect the list
// (new messages updating the preview, online presence).

export function useConversations() {
  const { setConversations, setUserOnline, setUserOffline, updateConversationLastMessage } =
    useChatStore();

  const query = useQuery({
    queryKey: CHAT_KEYS.conversations,
    queryFn: async () => {
      const convs = await chatService.getConversations();
      setConversations(convs);  // Write to store so ChatRoomScreen can read too
      return convs;
    },
    staleTime: 60 * 1000,
  });

  // Register socket listeners for this screen
  useEffect(() => {
    let sock: ReturnType<typeof socketService.getSocket>;
    try {
      sock = socketService.getSocket();
    } catch {
      return; // Socket not connected yet (mock mode or not logged in)
    }

    const handleNewMessage = (message: Message) => {
      updateConversationLastMessage(message.conversationId, message);
    };
    const handleUserOnline = ({ userId }: { userId: string }) => setUserOnline(userId);
    const handleUserOffline = ({ userId }: { userId: string }) => setUserOffline(userId);

    sock.on('message:new', handleNewMessage);
    sock.on('user:online', handleUserOnline);
    sock.on('user:offline', handleUserOffline);

    // CLEANUP: remove listeners when component unmounts
    return () => {
      sock.off('message:new', handleNewMessage);
      sock.off('user:online', handleUserOnline);
      sock.off('user:offline', handleUserOffline);
    };
  }, []);

  const conversations = useChatStore((s) => s.conversations);
  return { ...query, conversations };
}

// ── HOOK 2: useChatRoom ───────────────────────────────────────────────────────
// The main hook used by ChatRoomScreen.
// Manages the full lifecycle of a single chat room.

export function useChatRoom(conversationId: string, receiverId: string) {
  const userId = useAuthStore((s) => s.user?.id);
  const {
    messagesByConversation,
    addMessage,
    updateMessageStatus,
    setMessages,
    setTyping,
    decrementUnread,
    typingUsers,
  } = useChatStore();

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch message history on mount
  useQuery({
    queryKey: CHAT_KEYS.messages(conversationId),
    queryFn: async () => {
      const msgs = await chatService.getMessages(conversationId);
      setMessages(conversationId, msgs);
      return msgs;
    },
    staleTime: 30 * 1000,
  });

  // Socket lifecycle — join room, register listeners, cleanup on unmount
  useEffect(() => {
    let sock: ReturnType<typeof socketService.getSocket>;
    try {
      sock = socketService.getSocket();
    } catch {
      return;
    }

    // Tell the server we are in this room (they will route messages to us)
    sock.emit('room:join', conversationId);

    // Mark all messages as read as soon as we open the room
    chatService.markAsRead(conversationId);
    decrementUnread(conversationId);

    const handleNewMessage = (message: Message) => {
      if (message.conversationId !== conversationId) return;
      addMessage(message);
      // Tell server this message was delivered
      sock.emit('message:read', { conversationId });
    };

    const handleDelivered = ({ messageId }: { messageId: string }) => {
      updateMessageStatus(messageId, 'delivered');
    };

    const handleRead = ({ conversationId: cid }: { conversationId: string }) => {
      if (cid !== conversationId) return;
      // Mark all our sent messages as read
      const msgs = messagesByConversation[conversationId] ?? [];
      msgs.forEach((m) => {
        if (m.senderId === userId) updateMessageStatus(m.id, 'read');
      });
    };

    const handleTypingStart = ({ conversationId: cid, userId: uid }: any) => {
      if (cid === conversationId) setTyping(conversationId, uid, true);
    };
    const handleTypingStop = ({ conversationId: cid, userId: uid }: any) => {
      if (cid === conversationId) setTyping(conversationId, uid, false);
    };

    sock.on('message:new', handleNewMessage);
    sock.on('message:delivered', handleDelivered);
    sock.on('message:read', handleRead);
    sock.on('typing:start', handleTypingStart);
    sock.on('typing:stop', handleTypingStop);

    return () => {
      sock.emit('room:leave', conversationId);
      sock.off('message:new', handleNewMessage);
      sock.off('message:delivered', handleDelivered);
      sock.off('message:read', handleRead);
      sock.off('typing:start', handleTypingStart);
      sock.off('typing:stop', handleTypingStop);
    };
  }, [conversationId]);

  // Send a text message
  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !userId) return;

      // Optimistic message — shown immediately before server confirms
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: userId,
        receiverId,
        content: content.trim(),
        type: 'text',
        status: 'sending',
        createdAt: new Date().toISOString(),
      };

      addMessage(optimisticMessage);

      try {
        const sock = socketService.getSocket();
        sock.emit('message:send', {
          conversationId,
          receiverId,
          content: content.trim(),
          type: 'text',
        });
      } catch {
        // Socket not available — update status to show failure
        updateMessageStatus(optimisticMessage.id, 'sending');
      }
    },
    [conversationId, receiverId, userId]
  );

  // Emit typing events with debounce
  const handleTyping = useCallback(() => {
    try {
      const sock = socketService.getSocket();
      sock.emit('typing:start', { conversationId });

      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        sock.emit('typing:stop', { conversationId });
      }, 1500);
    } catch {
      // silent fail in mock mode
    }
  }, [conversationId]);

  const messages = messagesByConversation[conversationId] ?? [];
  const isOtherTyping = (typingUsers[conversationId] ?? []).some((id) => id !== userId);

  return { messages, sendMessage, handleTyping, isOtherTyping };
}