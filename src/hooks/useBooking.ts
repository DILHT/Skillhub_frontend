// src/hooks/useBooking.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BookingStackParamList } from '../navigation/AppNavigator';
import { bookingService } from '../service/bookingService';
import { useBookingStore } from '../store/bookingStore';
import { CreateBookingRequest } from '../types/booking.types';

const BOOKING_KEYS = {
  all: ['bookings'] as const,
  detail: (id: string) => ['bookings', id] as const,
};

// Fetch all bookings for the logged-in user
export function useMyBookings() {
  return useQuery({
    queryKey: BOOKING_KEYS.all,
    queryFn: bookingService.getMyBookings,
    staleTime: 2 * 60 * 1000,
  });
}

// Fetch a single booking's full detail
export function useBookingDetail(id: string | undefined) {
  return useQuery({
    queryKey: BOOKING_KEYS.detail(id ?? ''),
    queryFn: () => bookingService.getBookingById(id!),
    enabled: !!id,
  });
}

// Create a new booking — called from BookingScreen
export function useCreateBooking() {
  const queryClient = useQueryClient();
  const navigation = useNavigation<NativeStackNavigationProp<BookingStackParamList>>();
  const { addBooking, clearDraft } = useBookingStore();

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingService.createBooking(data),

    onSuccess: (newBooking) => {
      // 1. Add to local store immediately (optimistic)
      addBooking(newBooking);

      // 2. Invalidate bookings list so it refetches from API
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });

      // 3. Clear the draft — booking is done
      clearDraft();

      // 4. Navigate to the confirmation screen
      navigation.navigate('BookingConfirm', { bookingId: newBooking.id });
    },
  });
}

// Cancel a booking — called from BookingListScreen or BookingDetail
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingService.cancelBooking(bookingId),
    onSuccess: () => {
      // Refetch the bookings list to show updated status
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
    },
  });
}