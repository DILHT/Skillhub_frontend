// src/service/socketService.ts
//
// SINGLETON PATTERN — one socket connection for the entire app lifetime.
//
// WHY SINGLETON?
//   If every component created its own socket, you'd have dozens of connections
//   to the server. One connection, shared by all components through this module.
//
// HOW IT WORKS:
//   1. connect(token) — called once after login, stores the socket instance
//   2. getSocket()    — any hook or component calls this to get the instance
//   3. disconnect()   — called on logout to cleanly close the connection
//
// The socket is NOT in Zustand because it is not serialisable state.
// It is a live network object — it belongs in a module-level variable.

import { io, Socket } from 'socket.io-client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from '../types/chat.types';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:3000';
const IS_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// Typed socket — TypeScript knows exactly which events exist and their payloads
type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Module-level singleton — exists for the entire app session
let socket: AppSocket | null = null;

export const socketService = {

  // Call this immediately after login succeeds
  connect: (token: string): AppSocket => {
    if (IS_MOCK) {
      // In mock mode return a fake socket object that does nothing
      // This lets the rest of the app run without a real server
      return createMockSocket() as unknown as AppSocket;
    }

    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
      auth: { token },          // JWT sent on handshake — server validates this
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,  // Wait 2s between retries (good for mobile)
    }) as AppSocket;


    return socket;
  },

  // Returns the existing socket — throws if connect() was never called
  getSocket: (): AppSocket => {
    if (IS_MOCK) return createMockSocket() as unknown as AppSocket;
    if (!socket) throw new Error('[Socket] Not connected. Call socketService.connect() first.');
    return socket;
  },

  // Call this on logout — prevents memory leaks and stale connections
  disconnect: (): void => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  isConnected: (): boolean => {
    if (IS_MOCK) return true;
    return socket?.connected ?? false;
  },
};

// ─── MOCK SOCKET ──────────────────────────────────────────────────────────────
// A minimal fake socket that satisfies the interface without doing anything.
// Allows ChatListScreen and ChatRoomScreen to render in mock mode.

function createMockSocket() {
  const listeners: Record<string, Function[]> = {};

  return {
    connected: true,
    id: 'mock-socket-id',
    on: (event: string, fn: Function) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
    },
    off: (event: string, fn: Function) => {
      listeners[event] = (listeners[event] ?? []).filter((f) => f !== fn);
    },
    emit: (_event: string, ..._args: any[]) => {
      // In mock mode, emitting does nothing — responses come from mock data
    },
    disconnect: () => {},

    // Helper used in tests: trigger a fake incoming event
    _trigger: (event: string, data: any) => {
      (listeners[event] ?? []).forEach((fn) => fn(data));
    },
  };
}