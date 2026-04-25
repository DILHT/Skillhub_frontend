// src/types/booking.types.ts

import { Service, ServiceProvider } from './service.types';
import { User } from './user.types';

// Every state a booking can be in — this is a state machine
// pending → accepted → in_progress → completed
//        ↘ rejected
//        ↘ cancelled (by client or provider)
export type BookingStatus =
  | 'pending'       // Client submitted, waiting for provider to accept
  | 'accepted'      // Provider accepted, waiting for service date
  | 'in_progress'   // Service is currently happening
  | 'completed'     // Service done, payment released from escrow
  | 'cancelled'     // Cancelled by client before acceptance
  | 'rejected';     // Provider declined the booking

export type PaymentStatus = 'unpaid' | 'held' | 'released' | 'refunded';

// A single time slot offered by a provider
export interface TimeSlot {
  id: string;
  date: string;       // ISO date: '2024-06-15'
  startTime: string;  // '09:00'
  endTime: string;    // '11:00'
  isAvailable: boolean;
}

// The full booking entity — what comes back from the API
export interface Booking {
  id: string;
  serviceId: string;
  service: Service;
  clientId: string;
  client: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar' | 'phone'>;
  providerId: string;
  provider: ServiceProvider;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  scheduledDate: string;    // ISO date string
  scheduledTime: string;    // 'HH:mm'
  durationHours: number;
  totalAmount: number;
  currency: string;
  notes: string;            // Client's instructions to provider
  address: string;          // Where service will be delivered
  createdAt: string;
  updatedAt: string;
}

// What the client sends to CREATE a booking
export interface CreateBookingRequest {
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  durationHours: number;
  notes: string;
  address: string;
}

// Multi-step booking form state — held in bookingStore during the flow
export interface BookingDraft {
  serviceId: string;
  service: Service | null;
  scheduledDate: string;
  scheduledTime: string;
  durationHours: number;
  notes: string;
  address: string;
}