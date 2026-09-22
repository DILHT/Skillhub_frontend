// src/hooks/useProviderServices.ts

import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import {
  providerService,
  CreateServicePayload,
  UpdateServicePayload,
} from '../service/providerService';
import { invalidateServiceCatalogue } from './useServices';

// Namespaced so "my listings" and "a given provider's public listings" no
// longer share a prefix. React Query invalidates by prefix, so the old
// ['provider-services'] silently invalidated every viewed provider's list too.
export const PROVIDER_SERVICE_KEYS = {
  all:         ['provider-services'] as const,
  myServices:  ['provider-services', 'me'] as const,
  byProvider: (providerId: string) =>
    ['provider-services', 'byProvider', providerId] as const,
  categories:  ['skill-categories'] as const,
  skills: (categoryId: string) => ['skill-categories', categoryId, 'skills'] as const,
};

const KEYS = PROVIDER_SERVICE_KEYS;

// A provider's own listings ARE the public catalogue. Any create/update/toggle
// therefore has to refresh the client-facing caches as well as the owner's —
// otherwise a deactivated service stays visible and bookable in the home feed,
// search results and detail page for the life of the 24h persisted cache.
function invalidateServiceCaches(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: KEYS.myServices });
  invalidateServiceCatalogue(qc);
}

// List of the provider's own services
export function useMyServices() {
  return useQuery({
    queryKey: KEYS.myServices,
    queryFn:  providerService.getMyServices,
    staleTime: 2 * 60 * 1000,
  });
}

// Create a new service listing
export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServicePayload) => providerService.createService(payload),
    onSuccess: () => {
      invalidateServiceCaches(qc);
    },
  });
}

// Edit an existing service
export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateServicePayload }) =>
      providerService.updateService(id, payload),
    onSuccess: () => {
      invalidateServiceCaches(qc);
    },
  });
}

// Toggle isActive on/off — no body, server flips current value
export function useToggleServiceActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => providerService.toggleServiceActive(id),
    onSuccess: () => {
      invalidateServiceCaches(qc);
    },
  });
}

// Skill categories for the create/edit form's category picker
export function useSkillCategories() {
  return useQuery({
    queryKey: KEYS.categories,
    queryFn:  providerService.getSkillCategories,
    staleTime: 10 * 60 * 1000,
  });
}

// Skills under a specific category — disabled until categoryId is set
export function useSkillsByCategory(categoryId: string | null) {
  return useQuery({
    queryKey: KEYS.skills(categoryId ?? ''),
    queryFn:  () => providerService.getSkillsByCategory(categoryId!),
    enabled:  !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
}
