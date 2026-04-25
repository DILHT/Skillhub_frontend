// src/service/bookingService.ts

import { apiClient } from './api';
import { Booking, CreateBookingRequest } from '../types/booking.types';
import { PaginatedResponse } from '../types/service.types';
import { MOCK_BOOKINGS } from '../mock/mockData';

const IS_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

function mockDelay(ms = 700): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const bookingService = {

  // GET /bookings — all bookings for current user
  getMyBookings: async (): Promise<Booking[]> => {
    if (IS_MOCK) {
      await mockDelay();
      return MOCK_BOOKINGS;
    }
    const response = await apiClient.get<Booking[]>('/bookings');
    return response.data;
  },

  // GET /bookings/:id — single booking detail
  getBookingById: async (id: string): Promise<Booking> => {
    if (IS_MOCK) {
      await mockDelay(300);
      const booking = MOCK_BOOKINGS.find((b) => b.id === id);
      if (!booking) throw { message: 'Booking not found', status: 404 };
      return booking;
    }
    const response = await apiClient.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  // POST /bookings — create a new booking
  createBooking: async (data: CreateBookingRequest): Promise<Booking> => {
    if (IS_MOCK) {
      await mockDelay(1000);
      // Build a fake booking from the request data
      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        serviceId: data.serviceId,
        service: MOCK_BOOKINGS[0].service, // reuse mock service shape
        clientId: 'user-dev-001',
        client: {
          id: 'user-dev-001',
          firstName: 'Dev',
          lastName: 'User',
          avatar: null,
          phone: '+265991234567',
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
    const response = await apiClient.post<Booking>('/bookings', data);
    return response.data;
  },

  // PATCH /bookings/:id/cancel — client cancels a pending booking
  cancelBooking: async (id: string): Promise<Booking> => {
    if (IS_MOCK) {
      await mockDelay(600);
      const booking = MOCK_BOOKINGS.find((b) => b.id === id);
      if (!booking) throw { message: 'Booking not found', status: 404 };
      return { ...booking, status: 'cancelled' };
    }
    const response = await apiClient.patch<Booking>(`/bookings/${id}/cancel`);
    return response.data;
  },
};