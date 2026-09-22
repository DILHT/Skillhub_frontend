// src/hooks/useProviderProfile.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  providerService,
  ProviderProfileResponse,
  CreateProfilePayload,
  UpdateProfilePayload,
} from '../service/providerService';

const KEYS = {
  me: ['provider-profile', 'me'] as const,
};

// Reads the provider profile.
// data.hasProfile === false means the user has not created a provider profile yet.
// data.profile is populated only when hasProfile === true.
export function useProviderProfile() {
  return useQuery({
    queryKey: KEYS.me,
    queryFn:  providerService.getMyProviderProfile,
    staleTime: 5 * 60 * 1000,
  });
}

// Create the provider profile for the first time (POST /providers/profile)
export function useCreateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProfilePayload) => providerService.createProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.me });
    },
  });
}

// Update an existing provider profile (PUT /providers/me/profile)
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => providerService.updateProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.me });
    },
  });
}

// Toggle "Available now" — optimistically patches the cached ProviderProfileResponse
export function useSetAvailabilityNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isAvailableNow: boolean) => providerService.setAvailabilityNow(isAvailableNow),
    onMutate: async (isAvailableNow) => {
      await qc.cancelQueries({ queryKey: KEYS.me });
      const previous = qc.getQueryData<ProviderProfileResponse>(KEYS.me);
      if (previous?.profile) {
        qc.setQueryData<ProviderProfileResponse>(KEYS.me, {
          ...previous,
          profile: { ...previous.profile, isAvailableNow },
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      // Roll back optimistic update on failure
      if (ctx?.previous) qc.setQueryData(KEYS.me, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: KEYS.me });
    },
  });
}
