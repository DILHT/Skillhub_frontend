// src/store/chatStore.ts
//
// WHY A CHAT STORE?
// Messages arrive from TWO sources:
//   1. REST API (chatService.getMessages) — historical messages on screen open
//   2. Socket.io (socketService)          — live messages while screen is open
//
// Both sources write to the SAME store. The ChatRoomScreen reads from ONE place.
// This unification is the key design decision for the chat feature.

import { create } from 'zustand';
import { Conversation, Message } from '../types/chat.types';

interface ChatState {
  conversations: Conversation[];
  // Messages keyed by conversationId for O(1) lookup
  // { 'conv-1': [msg1, msg2, ...], 'conv-2': [...] }
  messagesByConversation: Record<string, Message[]>;
  typingUsers: Record<string, string[]>; // conversationId → userId[]
  onlineUsers: Set<string>;              // userIds currently online

  // Conversation actions
  setConversations: (conversations: Conversation[]) => void;
  updateConversationLastMessage: (conversationId: string, message: Message) => void;
  decrementUnread: (conversationId: string) => void;

  // Message actions
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;          // incoming or sent
  updateMessageStatus: (messageId: string, status: Message['status']) => void;

  // Presence and typing
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  messagesByConversation: {},
  typingUsers: {},
  onlineUsers: new Set(),

  setConversations: (conversations) => set({ conversations }),

  // Called when a new message arrives — update the conversation preview
  updateConversationLastMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: message.content,
              lastMessageAt: message.createdAt,
              // Only increment unread if this message is FROM the other person
              // (we don't count our own messages as unread)
              unreadCount: c.unreadCount + 1,
            }
          : c
      ),
    })),

  decrementUnread: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    })),

  // Load historical messages (from REST API)
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
      },
    })),

  // Append a single new message (from socket OR after sending)
  addMessage: (message) =>
    set((state) => {
      const existing = state.messagesByConversation[message.conversationId] ?? [];
      // Avoid duplicates if both REST and socket deliver the same message
      const alreadyExists = existing.some((m) => m.id === message.id);
      if (alreadyExists) return state;
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: [...existing, message],
        },
      };
    }),

  updateMessageStatus: (messageId, status) =>
    set((state) => {
      const updated = { ...state.messagesByConversation };
      for (const convId in updated) {
        updated[convId] = updated[convId].map((m) =>
          m.id === messageId ? { ...m, status } : m
        );
      }
      return { messagesByConversation: updated };
    }),

  setUserOnline: (userId) =>
    set((state) => ({
      onlineUsers: new Set([...state.onlineUsers, userId]),
    })),

  setUserOffline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    }),

  setTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const current = state.typingUsers[conversationId] ?? [];
      const next = isTyping
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId);
      return {
        typingUsers: { ...state.typingUsers, [conversationId]: next },
      };
    }),
}));