// src/service/providerService.ts
// All field names verified against backend .d.ts DTOs before writing.

import { apiClient } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProviderBookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type ServicePricingType = 'fixed' | 'hourly' | 'negotiable' | 'starting_from';

export interface ProviderServiceDto {
  id: string;
  providerId: string;
  skillId: string;
  skillName?: string;
  categoryId?: string;
  categoryName?: string;
  title: string;
  description?: string | null;
  pricingType: ServicePricingType;
  basePrice?: number | null;
  currency: string;
  priceUnit?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  estimatedDurationMinutes?: number | null;
  isRemoteAvailable: boolean;
  requiresMaterials: boolean;
  images: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProviderBookingDto {
  id: string;
  clientId: string;
  providerId: string;
  serviceId: string;
  skillId: string;
  title: string;
  description?: string | null;
  status: ProviderBookingStatus;
  pricingType: ServicePricingType;
  quotedPrice?: number | null;
  currency: string;
  // Original ISO datetime from backend
  scheduledAt: string;
  // Derived by transformProviderBooking — safe to display directly
  scheduledDate: string;
  scheduledTime: string;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  address?: string | null;
  isRemote: boolean;
  clientNotes?: string | null;
  providerNotes?: string | null;
  paymentStatus: string;
  escrowAmount?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderProfileData {
  id: string;
  userId: string;
  headline: string | null;
  professionalSummary: string | null;
  yearsOfExperience: number | null;
  isCertified: boolean;
  badgeVerified: boolean;
  averageRating: number;
  totalReviews: number;
  totalJobsCompleted: number;
  responseRate: number;
  responseTimeMinutes: number | null;
  maxTravelDistanceKm: number | null;
  isAvailableNow: boolean;
  acceptsRemote: boolean;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
}

// Special shape returned by GET /providers/me/profile
export interface ProviderProfileResponse {
  hasProfile: boolean;
  message?: string;
  profile?: ProviderProfileData;
}

export interface SkillCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  parentId?: string | null;
  isActive: boolean;
}

export interface SkillItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  isActive: boolean;
  requiresCertification: boolean;
}

// What the create-service form sends — covers the required + common optional fields
export interface CreateServicePayload {
  skillId: string;          // required — UUID from skill picker
  title: string;
  description?: string;
  pricingType: ServicePricingType;  // 'fixed' | 'hourly' | 'negotiable' | 'starting_from'
  basePrice?: number;
  currency?: string;
  priceUnit?: string;
  minPrice?: number;
  maxPrice?: number;
  estimatedDurationMinutes?: number;
  isRemoteAvailable?: boolean;
  requiresMaterials?: boolean;
  tags?: string[];
}

export interface UpdateServicePayload {
  skillId?: string;
  title?: string;
  description?: string | null;
  pricingType?: ServicePricingType;
  basePrice?: number | null;
  currency?: string;
  isRemoteAvailable?: boolean;
  requiresMaterials?: boolean;
  estimatedDurationMinutes?: number | null;
  isActive?: boolean;
  tags?: string[];
}

export interface CreateProfilePayload {
  headline?: string;
  professionalSummary?: string;
  yearsOfExperience?: number;
  acceptsRemote?: boolean;
  maxTravelDistanceKm?: number;
}

export interface UpdateProfilePayload {
  headline?: string;
  professionalSummary?: string;
  yearsOfExperience?: number;
  acceptsRemote?: boolean;
  maxTravelDistanceKm?: number;
  responseTimeMinutes?: number;
}

// ── State machine ─────────────────────────────────────────────────────────────

// Valid provider actions per booking status — UI enforces this
export const PROVIDER_ACTIONS: Record<ProviderBookingStatus, readonly string[]> = {
  pending:     ['accept', 'decline'],
  accepted:    ['start'],
  in_progress: ['complete'],
  declined:    [],
  completed:   [],
  cancelled:   [],
  disputed:    [],
};

// Safe accessor — the backend can send a status this map has no case for
// (NO_SHOW, EXPIRED, …). Unknown statuses simply offer no actions.
export function getProviderActions(
  status: ProviderBookingStatus | string
): readonly string[] {
  return PROVIDER_ACTIONS[status as ProviderBookingStatus] ?? [];
}

export function canProviderAct(status: ProviderBookingStatus | string): boolean {
  return getProviderActions(status).length > 0;
}

// ── Transform ─────────────────────────────────────────────────────────────────

// Reuses the same scheduledAt→date/time split used by bookingService
function transformProviderBooking(raw: any): ProviderBookingDto {
  const scheduledAt: string = raw.scheduledAt ?? '';
  const tIndex = scheduledAt.indexOf('T');
  const scheduledDate = tIndex > -1 ? scheduledAt.slice(0, tIndex) : scheduledAt;
  const scheduledTime = tIndex > -1 ? scheduledAt.slice(tIndex + 1, tIndex + 6) : '';

  return {
    ...raw,
    scheduledDate,
    scheduledTime,
    status: ((raw.status as string) ?? 'pending').toLowerCase() as ProviderBookingStatus,
    paymentStatus: ((raw.paymentStatus as string) ?? 'unpaid').toLowerCase(),
    isRemote: raw.isRemote ?? false,
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export const providerService = {

  // GET /services/my/services — returns a plain array (not paginated)
  getMyServices: async (): Promise<ProviderServiceDto[]> => {
    const response = await apiClient.get('/services/my/services');
    const data = response.data as any;
    return Array.isArray(data) ? data : (data?.services ?? []);
  },

  // POST /services — provider is auto-attached from JWT
  createService: async (payload: CreateServicePayload): Promise<ProviderServiceDto> => {
    const response = await apiClient.post('/services', payload);
    return response.data;
  },

  // PUT /services/:id — all fields optional; ownership enforced server-side
  updateService: async (id: string, payload: UpdateServicePayload): Promise<ProviderServiceDto> => {
    const response = await apiClient.put(`/services/${id}`, payload);
    return response.data;
  },

  // PATCH /services/:id/toggle-active — no body; flips isActive
  toggleServiceActive: async (id: string): Promise<ProviderServiceDto> => {
    const response = await apiClient.patch(`/services/${id}/toggle-active`);
    return response.data;
  },

  // GET /bookings/provider/incoming — paginated, optional ?status= filter
  getIncomingBookings: async (params?: {
    status?: ProviderBookingStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ bookings: ProviderBookingDto[]; total: number }> => {
    const query: Record<string, any> = { limit: params?.limit ?? 50 };
    if (params?.status) query.status = params.status;
    if (params?.offset !== undefined) query.offset = params.offset;

    const response = await apiClient.get('/bookings/provider/incoming', { params: query });
    const data = response.data as any;
    const rawList = data?.bookings ?? data ?? [];

    return {
      bookings: Array.isArray(rawList) ? rawList.map(transformProviderBooking) : [],
      total: data?.total ?? rawList.length,
    };
  },

  // PATCH /bookings/:id/accept  body: AcceptBookingRequest
  acceptBooking: async (
    id: string,
    data?: { quotedPrice?: number; providerNotes?: string }
  ): Promise<ProviderBookingDto> => {
    const response = await apiClient.patch(`/bookings/${id}/accept`, data ?? {});
    return transformProviderBooking(response.data);
  },

  // PATCH /bookings/:id/decline  body: DeclineBookingRequest
  declineBooking: async (
    id: string,
    data?: { reason?: string }
  ): Promise<ProviderBookingDto> => {
    const response = await apiClient.patch(`/bookings/${id}/decline`, data ?? {});
    return transformProviderBooking(response.data);
  },

  // PATCH /bookings/:id/start  (no body; accepted → in_progress)
  startBooking: async (id: string): Promise<ProviderBookingDto> => {
    const response = await apiClient.patch(`/bookings/${id}/start`);
    return transformProviderBooking(response.data);
  },

  // PATCH /bookings/:id/complete  body: CompleteBookingRequest
  completeBooking: async (
    id: string,
    data?: { providerNotes?: string }
  ): Promise<ProviderBookingDto> => {
    const response = await apiClient.patch(`/bookings/${id}/complete`, data ?? {});
    return transformProviderBooking(response.data);
  },

  // POST /providers/profile — create the provider profile for the first time
  createProfile: async (payload: CreateProfilePayload): Promise<ProviderProfileData> => {
    const response = await apiClient.post('/providers/profile', payload);
    return response.data;
  },

  // PUT /providers/me/profile — update an existing provider profile
  updateProfile: async (payload: UpdateProfilePayload): Promise<ProviderProfileData> => {
    const response = await apiClient.put('/providers/me/profile', payload);
    return response.data;
  },

  // GET /providers/me/profile — returns { hasProfile, message?, profile? }
  // Falls back gracefully if the backend returns a bare ProviderProfileDto
  getMyProviderProfile: async (): Promise<ProviderProfileResponse> => {
    const response = await apiClient.get('/providers/me/profile');
    const data = response.data as any;

    if (typeof data?.hasProfile === 'boolean') {
      return data as ProviderProfileResponse;
    }
    // Bare profile shape (if backend changes)
    if (data?.id) {
      return { hasProfile: true, profile: data as ProviderProfileData };
    }
    return { hasProfile: false };
  },

  // PUT /providers/me/availability-now  body: { isAvailableNow: boolean }
  setAvailabilityNow: async (isAvailableNow: boolean): Promise<ProviderProfileData> => {
    const response = await apiClient.put('/providers/me/availability-now', { isAvailableNow });
    return response.data;
  },

  // GET /skill-categories  → SkillCategoryDto[] (flat, has parentId)
  getSkillCategories: async (): Promise<SkillCategoryItem[]> => {
    const response = await apiClient.get('/skill-categories');
    const data = response.data as any;
    return Array.isArray(data) ? data : (data?.categories ?? []);
  },

  // GET /skill-categories/:id/skills  → SkillDto[]
  getSkillsByCategory: async (categoryId: string): Promise<SkillItem[]> => {
    const response = await apiClient.get(`/skill-categories/${categoryId}/skills`);
    const data = response.data as any;
    return Array.isArray(data) ? data : (data?.skills ?? []);
  },
};
