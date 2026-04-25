// src/mock/mockData.ts
// Updated Lesson 05 — adds MOCK_CONVERSATIONS and MOCK_MESSAGES

import {
  Service, Category, HomeData,
  PaginatedResponse, ServiceProvider,
} from '../types/service.types';
import { User, AuthResponse } from '../types/user.types';
import { Booking } from '../types/booking.types';
import { Conversation, Message } from '../types/chat.types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Home Services', slug: 'home-services', icon: 'home-outline', color: '#1B7A4E', serviceCount: 142 },
  { id: 'cat-2', name: 'Tech Support', slug: 'tech-support', icon: 'laptop-outline', color: '#2563EB', serviceCount: 87 },
  { id: 'cat-3', name: 'Tutoring', slug: 'tutoring', icon: 'school-outline', color: '#7C3AED', serviceCount: 63 },
  { id: 'cat-4', name: 'Beauty', slug: 'beauty', icon: 'color-palette-outline', color: '#DB2777', serviceCount: 54 },
  { id: 'cat-5', name: 'Transport', slug: 'transport', icon: 'car-outline', color: '#D97706', serviceCount: 38 },
  { id: 'cat-6', name: 'Events', slug: 'events', icon: 'musical-notes-outline', color: '#DC2626', serviceCount: 29 },
];

const MOCK_PROVIDERS: ServiceProvider[] = [
  { id: 'prov-1', firstName: 'Chisomo', lastName: 'Phiri', avatar: 'https://i.pravatar.cc/150?img=11', rating: 4.9, reviewCount: 134, isVerified: true, location: 'Lilongwe', responseTime: 'Usually responds in 30 min' },
  { id: 'prov-2', firstName: 'Tadala', lastName: 'Banda', avatar: 'https://i.pravatar.cc/150?img=5', rating: 4.7, reviewCount: 89, isVerified: true, location: 'Blantyre', responseTime: 'Usually responds in 1 hour' },
  { id: 'prov-3', firstName: 'Madalitso', lastName: 'Chirwa', avatar: null, rating: 4.5, reviewCount: 47, isVerified: false, location: 'Lilongwe', responseTime: 'Usually responds in 2 hours' },
  { id: 'prov-4', firstName: 'Grace', lastName: 'Gondwe', avatar: 'https://i.pravatar.cc/150?img=23', rating: 4.8, reviewCount: 201, isVerified: true, location: 'Mzuzu', responseTime: 'Usually responds in 45 min' },
  { id: 'prov-5', firstName: 'Peter', lastName: 'Mwale', avatar: 'https://i.pravatar.cc/150?img=33', rating: 4.3, reviewCount: 22, isVerified: false, location: 'Blantyre', responseTime: 'Usually responds in 3 hours' },
  { id: 'prov-6', firstName: 'Kondwani', lastName: 'Tembo', avatar: 'https://i.pravatar.cc/150?img=52', rating: 4.6, reviewCount: 78, isVerified: true, location: 'Lilongwe', responseTime: 'Usually responds in 1 hour' },
];

export const MOCK_SERVICES: Service[] = [
  { id: 'svc-1', title: 'Professional plumbing & pipe fitting', description: 'Expert plumbing services including pipe installation, leak repairs, bathroom fitting, and water system maintenance. 10+ years experience. All materials provided.', categoryId: 'cat-1', category: MOCK_CATEGORIES[0], provider: MOCK_PROVIDERS[0], price: 15000, priceUnit: 'day', currency: 'MWK', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], rating: 4.9, reviewCount: 134, isAvailable: true, location: 'Lilongwe', distance: 2.4, tags: ['plumbing', 'repairs'], createdAt: '2024-01-15T08:00:00Z' },
  { id: 'svc-2', title: 'Laptop & phone repair specialist', description: 'Screen replacements, battery changes, software troubleshooting, virus removal, and data recovery. Fast turnaround.', categoryId: 'cat-2', category: MOCK_CATEGORIES[1], provider: MOCK_PROVIDERS[1], price: 5000, priceUnit: 'fixed', currency: 'MWK', images: ['https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800'], rating: 4.7, reviewCount: 89, isAvailable: true, location: 'Blantyre', distance: 0.8, tags: ['laptop', 'phone', 'repair'], createdAt: '2024-02-01T10:00:00Z' },
  { id: 'svc-3', title: 'MSCE & MANEB exam tutoring', description: 'Specialised tutoring for Mathematics, Physics, and Chemistry. MSCE past paper practice and exam technique coaching.', categoryId: 'cat-3', category: MOCK_CATEGORIES[2], provider: MOCK_PROVIDERS[2], price: 8000, priceUnit: 'hour', currency: 'MWK', images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'], rating: 4.5, reviewCount: 47, isAvailable: true, location: 'Lilongwe', distance: 1.2, tags: ['tutoring', 'maths', 'msce'], createdAt: '2024-02-10T09:00:00Z' },
  { id: 'svc-4', title: 'Home deep cleaning service', description: 'Full home deep cleaning including kitchen degreasing, bathroom sanitisation, carpet cleaning, and window washing.', categoryId: 'cat-1', category: MOCK_CATEGORIES[0], provider: MOCK_PROVIDERS[3], price: 25000, priceUnit: 'fixed', currency: 'MWK', images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'], rating: 4.8, reviewCount: 201, isAvailable: true, location: 'Mzuzu', distance: 5.1, tags: ['cleaning', 'home'], createdAt: '2024-01-20T07:00:00Z' },
  { id: 'svc-5', title: 'Natural hair braiding & styling', description: 'Box braids, cornrows, twists, and natural styling. Mobile service — I come to you.', categoryId: 'cat-4', category: MOCK_CATEGORIES[3], provider: MOCK_PROVIDERS[4], price: 12000, priceUnit: 'fixed', currency: 'MWK', images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'], rating: 4.3, reviewCount: 22, isAvailable: false, location: 'Blantyre', distance: 3.7, tags: ['hair', 'beauty'], createdAt: '2024-03-01T11:00:00Z' },
  { id: 'svc-6', title: 'Electrical wiring & installations', description: 'Licensed electrician: wiring, socket installations, DB board setup, solar connections. All work certified.', categoryId: 'cat-1', category: MOCK_CATEGORIES[0], provider: MOCK_PROVIDERS[5], price: 0, priceUnit: 'negotiable', currency: 'MWK', images: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800'], rating: 4.6, reviewCount: 78, isAvailable: true, location: 'Lilongwe', distance: 0.5, tags: ['electrical', 'wiring'], createdAt: '2024-02-20T08:30:00Z' },
  { id: 'svc-7', title: 'Web & mobile app development', description: 'React Native, React, and Node.js development. 20+ apps built for Malawian businesses. Free consultation.', categoryId: 'cat-2', category: MOCK_CATEGORIES[1], provider: MOCK_PROVIDERS[0], price: 50000, priceUnit: 'fixed', currency: 'MWK', images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'], rating: 4.9, reviewCount: 31, isAvailable: true, location: 'Lilongwe', distance: 2.4, tags: ['coding', 'web', 'mobile'], createdAt: '2024-03-10T09:00:00Z' },
  { id: 'svc-8', title: 'Event photography & videography', description: 'Professional photography for weddings, graduations, and corporate events. Drone footage available.', categoryId: 'cat-6', category: MOCK_CATEGORIES[5], provider: MOCK_PROVIDERS[3], price: 80000, priceUnit: 'day', currency: 'MWK', images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'], rating: 4.8, reviewCount: 56, isAvailable: true, location: 'Mzuzu', distance: 8.2, tags: ['photography', 'events'], createdAt: '2024-01-05T10:00:00Z' },
];

export const MOCK_HOME_DATA: HomeData = {
  featuredServices: [MOCK_SERVICES[0], MOCK_SERVICES[3], MOCK_SERVICES[6]],
  categories: MOCK_CATEGORIES,
  nearbyServices: [...MOCK_SERVICES].sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99)),
  recentlyViewed: [MOCK_SERVICES[1], MOCK_SERVICES[4]],
};

export function mockPaginatedServices(
  page: number = 1,
  limit: number = 10,
  filter?: { categoryId?: string; search?: string }
): PaginatedResponse<Service> {
  let filtered = [...MOCK_SERVICES];
  if (filter?.categoryId) filtered = filtered.filter((s) => s.categoryId === filter.categoryId);
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    filtered = filtered.filter(
      (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some((t) => t.includes(q))
    );
  }
  const start = (page - 1) * limit;
  return { data: filtered.slice(start, start + limit), total: filtered.length, page, limit, hasNextPage: start + limit < filtered.length };
}

export const MOCK_CLIENT_USER: User = {
  id: 'user-dev-001', email: 'dev@skillhub.mw', phone: '+265991234567',
  firstName: 'Dev', lastName: 'User', avatar: null, role: 'client',
  kycStatus: 'verified', isVerified: true, rating: null, createdAt: '2024-01-01T00:00:00Z',
};

export const MOCK_PROVIDER_USER: User = {
  id: 'user-dev-002', email: 'provider@skillhub.mw', phone: '+265991234568',
  firstName: 'Chisomo', lastName: 'Phiri', avatar: 'https://i.pravatar.cc/150?img=11',
  role: 'provider', kycStatus: 'verified', isVerified: true, rating: 4.9, createdAt: '2024-01-01T00:00:00Z',
};

export const MOCK_AUTH_RESPONSE: AuthResponse = {
  user: MOCK_CLIENT_USER,
  token: 'mock-jwt-token-dev-only',
  refreshToken: 'mock-refresh-token-dev-only',
};

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk-1', serviceId: 'svc-1', service: MOCK_SERVICES[0],
    clientId: 'user-dev-001',
    client: { id: 'user-dev-001', firstName: 'Dev', lastName: 'User', avatar: null, phone: '+265991234567' },
    providerId: 'prov-1', provider: MOCK_PROVIDERS[0],
    status: 'accepted', paymentStatus: 'held',
    scheduledDate: '2024-07-20', scheduledTime: '09:00', durationHours: 4,
    totalAmount: 60000, currency: 'MWK',
    notes: 'Main bathroom pipe is leaking badly.',
    address: 'Area 47, Sector 4, Lilongwe',
    createdAt: '2024-07-15T10:00:00Z', updatedAt: '2024-07-16T08:00:00Z',
  },
  {
    id: 'bk-2', serviceId: 'svc-3', service: MOCK_SERVICES[2],
    clientId: 'user-dev-001',
    client: { id: 'user-dev-001', firstName: 'Dev', lastName: 'User', avatar: null, phone: '+265991234567' },
    providerId: 'prov-3', provider: MOCK_PROVIDERS[2],
    status: 'pending', paymentStatus: 'held',
    scheduledDate: '2024-07-22', scheduledTime: '14:00', durationHours: 2,
    totalAmount: 16000, currency: 'MWK',
    notes: 'Focus on MSCE Mathematics — probability and statistics.',
    address: 'Crossroads, Lilongwe',
    createdAt: '2024-07-17T09:00:00Z', updatedAt: '2024-07-17T09:00:00Z',
  },
  {
    id: 'bk-3', serviceId: 'svc-4', service: MOCK_SERVICES[3],
    clientId: 'user-dev-001',
    client: { id: 'user-dev-001', firstName: 'Dev', lastName: 'User', avatar: null, phone: '+265991234567' },
    providerId: 'prov-4', provider: MOCK_PROVIDERS[3],
    status: 'completed', paymentStatus: 'released',
    scheduledDate: '2024-07-10', scheduledTime: '08:00', durationHours: 6,
    totalAmount: 25000, currency: 'MWK',
    notes: 'Full house deep clean.',
    address: 'Namiwawa, Blantyre',
    createdAt: '2024-07-05T11:00:00Z', updatedAt: '2024-07-10T16:00:00Z',
  },
];

// ─── CHAT — Lesson 05 ─────────────────────────────────────────────────────────

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1', participantId: 'prov-1',
    participantName: 'Chisomo Phiri',
    participantAvatar: 'https://i.pravatar.cc/150?img=11',
    participantRole: 'provider',
    lastMessage: 'I will be there at 9am sharp.',
    lastMessageAt: '2024-07-19T18:30:00Z',
    unreadCount: 2, isOnline: true,
  },
  {
    id: 'conv-2', participantId: 'prov-3',
    participantName: 'Madalitso Chirwa',
    participantAvatar: null,
    participantRole: 'provider',
    lastMessage: 'Please bring your past papers to the session.',
    lastMessageAt: '2024-07-17T14:00:00Z',
    unreadCount: 0, isOnline: false,
  },
  {
    id: 'conv-3', participantId: 'prov-4',
    participantName: 'Grace Gondwe',
    participantAvatar: 'https://i.pravatar.cc/150?img=23',
    participantRole: 'provider',
    lastMessage: 'Thank you for the booking! See you on the 10th.',
    lastMessageAt: '2024-07-05T12:00:00Z',
    unreadCount: 0, isOnline: false,
  },
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'msg-1', conversationId: 'conv-1', senderId: 'user-dev-001', receiverId: 'prov-1', content: 'Hi Chisomo, I booked you for the 20th. My bathroom pipe is leaking quite badly.', type: 'text', status: 'read', createdAt: '2024-07-19T18:00:00Z' },
  { id: 'msg-2', conversationId: 'conv-1', senderId: 'prov-1', receiverId: 'user-dev-001', content: 'Hello! I saw the booking. No problem, I have dealt with similar issues before.', type: 'text', status: 'read', createdAt: '2024-07-19T18:10:00Z' },
  { id: 'msg-3', conversationId: 'conv-1', senderId: 'user-dev-001', receiverId: 'prov-1', content: 'Great. Do you need me to get any materials in advance?', type: 'text', status: 'read', createdAt: '2024-07-19T18:20:00Z' },
  { id: 'msg-4', conversationId: 'conv-1', senderId: 'prov-1', receiverId: 'user-dev-001', content: 'No, I bring everything. I will be there at 9am sharp.', type: 'text', status: 'delivered', createdAt: '2024-07-19T18:30:00Z' },
  { id: 'msg-5', conversationId: 'conv-2', senderId: 'user-dev-001', receiverId: 'prov-3', content: 'Hi, I need help with MSCE Maths. Specifically probability.', type: 'text', status: 'read', createdAt: '2024-07-17T13:30:00Z' },
  { id: 'msg-6', conversationId: 'conv-2', senderId: 'prov-3', receiverId: 'user-dev-001', content: 'Sure! That is one of my strongest areas. Please bring your past papers to the session.', type: 'text', status: 'read', createdAt: '2024-07-17T14:00:00Z' },
];