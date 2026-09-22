// src/hooks/useProviderBookings.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerService, ProviderBookingStatus } from '../service/providerService';

const KEYS = {
  // Broad key — invalidating this invalidates every filtered query too
  all:      ['provider-bookings'] as const,
  filtered: (status?: ProviderBookingStatus) =>
    ['provider-bookings', status ?? 'all'] as const,
};

// Incoming bookings list, with optional status filter
// status=undefined → fetch all statuses
export function useIncomingBookings(status?: ProviderBookingStatus) {
  return useQuery({
    queryKey: KEYS.filtered(status),
    queryFn:  () => providerService.getIncomingBookings({ status, limit: 50 }),
    staleTime: 60 * 1000,
  });
}

// pending → accepted
export function useAcceptBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: { quotedPrice?: number; providerNotes?: string };
    }) => providerService.acceptBooking(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

// pending → declined
export function useDeclineBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { reason?: string } }) =>
      providerService.declineBooking(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

// accepted → in_progress
export function useStartBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => providerService.startBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

// in_progress → completed
export function useCompleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: { providerNotes?: string };
    }) => providerService.completeBooking(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
