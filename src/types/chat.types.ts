// src/types/chat.types.ts

// A single chat message
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  createdAt: string;   // ISO string
}

// A conversation between two users (one client, one provider)
export interface Conversation {
  id: string;
  participantId: string;        // The other person's user id
  participantName: string;
  participantAvatar: string | null;
  participantRole: 'client' | 'provider';
  lastMessage: string;          // Preview text shown in the list
  lastMessageAt: string;        // ISO string — used for sorting
  unreadCount: number;
  isOnline: boolean;            // Real-time presence from socket
}

// What the client emits to send a message
export interface SendMessagePayload {
  conversationId: string;
  receiverId: string;
  content: string;
  type: 'text';
}

// Events the socket server emits to this client
export interface ServerToClientEvents {
  'message:new': (message: Message) => void;
  'message:delivered': (data: { messageId: string }) => void;
  'message:read': (data: { conversationId: string }) => void;
  'user:online': (data: { userId: string }) => void;
  'user:offline': (data: { userId: string }) => void;
  'typing:start': (data: { conversationId: string; userId: string }) => void;
  'typing:stop': (data: { conversationId: string; userId: string }) => void;
}

// Events this client emits to the server
export interface ClientToServerEvents {
  'message:send': (payload: SendMessagePayload) => void;
  'message:read': (data: { conversationId: string }) => void;
  'typing:start': (data: { conversationId: string }) => void;
  'typing:stop': (data: { conversationId: string }) => void;
  'room:join': (conversationId: string) => void;
  'room:leave': (conversationId: string) => void;
}