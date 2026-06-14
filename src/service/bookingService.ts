// src/service/bookingService.ts
// Corrected endpoint paths to match backend audit:
//   GET /bookings/my          (not GET /bookings)
//   POST /bookings
//   PATCH /bookings/:id/cancel
//   GET /bookings/:id

import { apiClient } from './api';
import { Booking, CreateBookingRequest } from '../types/booking.types';
import { MOCK_BOOKINGS } from '../mock/mockData';

// Booking API IS built on backend — switch IS_MOCK to false
// Keep true until SMTP is fixed and we can test end to end
const IS_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';;

function mockDelay(ms = 700): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Maps the backend BookingDto to the shape the frontend screens expect.
// Backend sends scheduledAt (one ISO datetime) + UPPERCASE status.
// Frontend screens read scheduledDate, scheduledTime, and lowercase status.
function transformBooking(raw: any): Booking {
  const scheduledAt = raw.scheduledAt ?? '';
  const [datePart = '', timePartFull = ''] = scheduledAt.split('T');
  const scheduledTime = timePartFull.slice(0, 5); // 'HH:mm'

  return {
    ...raw,
    scheduledDate: datePart,
    scheduledTime,
    durationHours: raw.durationHours ?? 1,
    address: raw.address ?? '',
    // Normalize status to lowercase for the UI
    status: (raw.status ?? 'pending').toLowerCase(),
    paymentStatus: (raw.paymentStatus ?? 'pending').toLowerCase(),
    // Backend gives IDs only — screens that need embedded objects
    // should fetch separately; default to safe empty values
    totalAmount: raw.quotedPrice ?? raw.escrowAmount ?? 0,
    currency: raw.currency ?? 'MWK',
    notes: raw.clientNotes ?? raw.description ?? '',
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
    return (data?.bookings ?? data ?? []).map(transformBooking);
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