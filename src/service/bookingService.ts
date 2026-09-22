// src/service/bookingService.ts
// Corrected endpoint paths to match backend audit:
//   GET /bookings/my          (not GET /bookings)
//   POST /bookings
//   PATCH /bookings/:id/cancel
//   GET /bookings/:id

import { apiClient } from './api';
import {
  Booking,
  BookingStatus,
  CreateBookingRequest,
  PaymentStatus,
} from '../types/booking.types';
import { Service, ServiceProvider } from '../types/service.types';
import { MOCK_BOOKINGS } from '../mock/mockData';

// Booking API IS built on backend — switch IS_MOCK to false
// Keep true until SMTP is fixed and we can test end to end
const IS_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';;

function mockDelay(ms = 700): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The backend has two names for "the provider turned this down": the legacy
// client-side 'rejected' and the backend canonical 'declined'. Collapse both
// onto 'declined' so filters and badges only ever have to match one value.
function normalizeStatus(raw: unknown): BookingStatus {
  const value = String(raw ?? 'pending').toLowerCase();
  if (value === 'rejected') return 'declined';
  return value as BookingStatus;
}

function normalizePaymentStatus(raw: unknown): PaymentStatus {
  const value = String(raw ?? 'unpaid').toLowerCase();
  // 'pending' is what the backend sends for "no money moved yet"; the UI
  // union calls that 'unpaid'.
  if (value === 'pending') return 'unpaid';
  return value as PaymentStatus;
}

// The backend BookingDto carries IDs only (serviceId, providerId, clientId)
// plus a denormalized `title`. Screens still want nested objects, so build
// safe placeholders here rather than letting every read site guess.
function buildServiceStub(raw: any): Service {
  return {
    id: raw.serviceId ?? '',
    title: raw.title ?? '',
    description: raw.description ?? '',
    categoryId: raw.categoryId ?? '',
    category: {
      id: raw.categoryId ?? '',
      name: raw.categoryName ?? '',
      slug: '',
      icon: 'grid-outline',
      color: '#6B7280',
      serviceCount: 0,
    },
    provider: buildProviderStub(raw),
    price: raw.quotedPrice ?? raw.escrowAmount ?? 0,
    priceUnit: 'fixed',
    currency: raw.currency ?? 'MWK',
    images: [],
    rating: 0,
    reviewCount: 0,
    isAvailable: true,
    location: raw.address ?? '',
    distance: null,
    tags: [],
    createdAt: raw.createdAt ?? '',
  };
}

function buildProviderStub(raw: any): ServiceProvider {
  return {
    id: raw.providerId ?? '',
    firstName: '',
    lastName: '',
    avatar: null,
    rating: 0,
    reviewCount: 0,
    isVerified: false,
    location: '',
    responseTime: '',
  };
}

// Maps the backend BookingDto to the shape the frontend screens expect.
// Backend sends scheduledAt (one ISO datetime) + UPPERCASE status.
// Frontend screens read scheduledDate, scheduledTime, and lowercase status.
function transformBooking(raw: any): Booking {
  const scheduledAt = raw.scheduledAt ?? '';
  const [datePart = '', timePartFull = ''] = String(scheduledAt).split('T');
  const scheduledTime = timePartFull.slice(0, 5); // 'HH:mm'

  return {
    ...raw,
    scheduledDate: datePart,
    scheduledTime,
    durationHours: raw.durationHours ?? 1,
    address: raw.address ?? '',
    status: normalizeStatus(raw.status),
    paymentStatus: normalizePaymentStatus(raw.paymentStatus),
    totalAmount: raw.quotedPrice ?? raw.escrowAmount ?? 0,
    currency: raw.currency ?? 'MWK',
    notes: raw.clientNotes ?? raw.description ?? '',
    // Backend gives IDs only — synthesise nested objects so screens never
    // dereference undefined. Real values arrive only if the DTO embeds them.
    service: raw.service ?? buildServiceStub(raw),
    provider: raw.provider ?? buildProviderStub(raw),
    client: raw.client ?? {
      id: raw.clientId ?? '',
      firstName: '',
      lastName: '',
      avatar: null,
    },
  };
}

export const bookingService = {

  // GET /bookings/my — client's own bookings
  getMyBookings: async (): Promise<Booking[]> => {
    if (IS_MOCK) {
      await mockDelay();
      return MOCK_BOOKINGS;
    }
    const response = await apiClient.get('/bookings/my');
    const data = response.data as any;
    // Backend returns PaginatedBookingsDto: { bookings: [], total }
    const rawList = data?.bookings ?? data ?? [];
    return Array.isArray(rawList) ? rawList.map(transformBooking) : [];
  },

  // GET /bookings/:id
  getBookingById: async (id: string): Promise<Booking> => {
    if (IS_MOCK) {
      await mockDelay(300);
      const booking = MOCK_BOOKINGS.find((b) => b.id === id);
      if (!booking) throw new Error('Booking not found');
      return booking;
    }
    const response = await apiClient.get(`/bookings/${id}`);
    return transformBooking(response.data);
  },

  // POST /bookings
  // Backend fields: serviceId, scheduledAt (ISO datetime), notes?
  createBooking: async (data: CreateBookingRequest): Promise<Booking> => {
    if (IS_MOCK) {
      await mockDelay(1000);
      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        serviceId: data.serviceId,
        service: MOCK_BOOKINGS[0].service,
        clientId: 'user-001',
        client: {
          id: 'user-001', firstName: 'You', lastName: '',
          avatar: null, phone: '',
        },
        providerId: MOCK_BOOKINGS[0].providerId,
        provider: MOCK_BOOKINGS[0].provider,
        status: 'pending',
        paymentStatus: 'held',
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        durationHours: data.durationHours,
        totalAmount: MOCK_BOOKINGS[0].totalAmount,
        currency: 'MWK',
        notes: data.notes,
        address: data.address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newBooking;
    }
    // Backend expects scheduledAt as a combined ISO datetime
    const scheduledAt = `${data.scheduledDate}T${data.scheduledTime}:00.000Z`;
    const response = await apiClient.post('/bookings', {
      serviceId: data.serviceId,
      scheduledAt,
       clientNotes: data.notes,   // backend field is clientNotes, not notes
    address: data.address,
    isRemote: false,
    });
    return transformBooking(response.data);
  },

  // PATCH /bookings/:id/cancel
  cancelBooking: async (id: string): Promise<Booking> => {
    if (IS_MOCK) {
      await mockDelay(600);
      const booking = MOCK_BOOKINGS.find((b) => b.id === id);
      if (!booking) throw new Error('Booking not found');
      return { ...booking, status: 'cancelled' };
    }
    const response = await apiClient.patch(`/bookings/${id}/cancel`, {
      reason: 'Cancelled by client',
        });
        
      return transformBooking(response.data);
      },
};