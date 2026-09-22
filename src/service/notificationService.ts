// src/service/notificationService.ts
import { apiClient } from './api';

const IS_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  status: string;      // 'read' | 'unread'
  data?: any;
  createdAt: string;
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', type: 'booking_accepted', title: 'Booking accepted', body: 'Grace Gondwe accepted your cleaning booking.', status: 'unread', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n2', type: 'payment', title: 'Wallet top-up successful', body: 'MWK 50,000 was added to your wallet.', status: 'unread', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'n3', type: 'booking_request', title: 'Booking reminder', body: 'Your plumbing appointment is tomorrow at 14:00.', status: 'read', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'n4', type: 'system', title: 'Welcome to SkillHub', body: 'Find trusted service providers near you.', status: 'read', createdAt: new Date(Date.now() - 604800000).toISOString() },
];

function mockDelay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

// Normalize backend UPPERCASE status/type to lowercase for the UI
function normalize(n: any): AppNotification {
  return {
    ...n,
    type: (n.type ?? '').toLowerCase(),
    status: (n.status ?? 'unread').toLowerCase(),
  };
}

export const notificationService = {
  // GET /notifications/me
  getNotifications: async (): Promise<AppNotification[]> => {
    if (IS_MOCK) {
      await mockDelay();
      return MOCK_NOTIFICATIONS;
    }
    const response = await apiClient.get('/notifications/me', {
      params: { limit: 50 },
    });
    const data = response.data as any;
    const list = data?.notifications ?? data ?? [];
    return Array.isArray(list) ? list.map(normalize) : [];
  },

  // GET /notifications/me/unread-count
  getUnreadCount: async (): Promise<number> => {
    if (IS_MOCK) {
      await mockDelay(200);
      return MOCK_NOTIFICATIONS.filter((n) => n.status === 'unread').length;
    }
    const response = await apiClient.get('/notifications/me/unread-count');
    const data = response.data as any;
    return data?.unreadCount ?? 0;
  },

  // PATCH /notifications/me/:id/read
  markAsRead: async (id: string): Promise<void> => {
    if (IS_MOCK) {
      await mockDelay(150);
      return;
    }
    await apiClient.patch(`/notifications/me/${id}/read`);
  },

  // PATCH /notifications/me/read-all
  markAllAsRead: async (): Promise<void> => {
    if (IS_MOCK) {
      await mockDelay(200);
      return;
    }
    await apiClient.patch('/notifications/me/read-all');
  },
};