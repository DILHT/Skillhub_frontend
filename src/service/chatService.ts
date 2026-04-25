// src/service/chatService.ts
//
// REST calls for chat — fetching conversation list and message history.
// Real-time sending/receiving is handled by socketService, not here.
//
// SEPARATION:
//   chatService  → fetch history from REST API  (past messages, conversation list)
//   socketService → real-time events            (new messages, typing, presence)

import { apiClient } from './api';
import { Conversation, Message } from '../types/chat.types';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../mock/mockData';

const IS_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

function mockDelay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const chatService = {

  // GET /conversations — all conversations for current user, newest first
  getConversations: async (): Promise<Conversation[]> => {
    if (IS_MOCK) {
      await mockDelay();
      return MOCK_CONVERSATIONS;
    }
    const response = await apiClient.get<Conversation[]>('/conversations');
    return response.data;
  },

  // GET /conversations/:id/messages — paginated message history
  getMessages: async (
    conversationId: string,
    page = 1
  ): Promise<Message[]> => {
    if (IS_MOCK) {
      await mockDelay(300);
      return MOCK_MESSAGES.filter((m) => m.conversationId === conversationId);
    }
    const response = await apiClient.get<Message[]>(
      `/conversations/${conversationId}/messages`,
      { params: { page, limit: 30 } }
    );
    return response.data;
  },

  // POST /conversations — start a new conversation (e.g. from ServiceDetailScreen)
  startConversation: async (participantId: string): Promise<Conversation> => {
    if (IS_MOCK) {
      await mockDelay(600);
      return MOCK_CONVERSATIONS[0];
    }
    const response = await apiClient.post<Conversation>('/conversations', {
      participantId,
    });
    return response.data;
  },

  // PATCH /conversations/:id/read — mark all messages as read
  markAsRead: async (conversationId: string): Promise<void> => {
    if (IS_MOCK) return;
    await apiClient.patch(`/conversations/${conversationId}/read`);
  },
};