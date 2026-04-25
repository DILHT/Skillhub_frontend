// src/store/bookingStore.ts
//
// WHY A BOOKING STORE?
// The booking flow spans THREE screens: ServiceDetail → BookingScreen → ConfirmScreen.
// Each screen needs to read and write the same draft data.
// Without a store, you'd have to pass data through navigation params across
// 3 screens — messy and fragile.
// With Zustand, every screen reads/writes the same draft object directly.

import { create } from 'zustand';
import { Booking, BookingDraft } from '../types/booking.types';
import { Service } from '../types/service.types';

interface BookingState {
  // The in-progress booking being built across multiple screens
  draft: BookingDraft;

  // The user's confirmed bookings (loaded from API)
  bookings: Booking[];

  // Actions
  startBooking: (service: Service) => void;        // Called when user taps "Book Now"
  updateDraft: (updates: Partial<BookingDraft>) => void; // Called as user fills form
  clearDraft: () => void;                           // Called after booking confirmed
  setBookings: (bookings: Booking[]) => void;       // Called when bookings load from API
  addBooking: (booking: Booking) => void;           // Called after successful booking creation
}

const EMPTY_DRAFT: BookingDraft = {
  serviceId: '',
  service: null,
  scheduledDate: '',
  scheduledTime: '',
  durationHours: 1,
  notes: '',
  address: '',
};

export const useBookingStore = create<BookingState>((set) => ({
  draft: EMPTY_DRAFT,
  bookings: [],

  // Initialise a new draft from a service — called when user taps "Book Now"
  startBooking: (service: Service) =>
    set({
      draft: {
        ...EMPTY_DRAFT,
        serviceId: service.id,
        service,
      },
    }),

  // Partial update — each screen updates only its own fields
  updateDraft: (updates) =>
    set((state) => ({
      draft: { ...state.draft, ...updates },
    })),

  // Reset after booking is confirmed or user cancels
  clearDraft: () => set({ draft: EMPTY_DRAFT }),

  // Replace full bookings list (from API fetch)
  setBookings: (bookings) => set({ bookings }),

  // Prepend new booking to list (optimistic update after creation)
  addBooking: (booking) =>
    set((state) => ({ bookings: [booking, ...state.bookings] })),
}));