// // =============================================================================
// // FILE 2: src/services/serviceService.ts
// // =============================================================================
// //
// // All API calls related to services live here.
// // RULE: Pure network functions only. No React, no hooks, no store access.
 
// import { apiClient } from './api';
// import {
//   Service,
//   Category,
//   ServiceFilters,
//   PaginatedResponse,
//   HomeData,
// } from '../types/service.types';
 
// export const serviceService = {
 
//   // GET /home — pre-assembled home screen data
//   // The backend does the heavy lifting: one call returns everything the
//   // HomeScreen needs. This is the "Backend for Frontend" (BFF) pattern.
//   getHomeData: async (): Promise<HomeData> => {
//     const response = await apiClient.get<HomeData>('/home');
//     return response.data;
//   },
 
//   // GET /services — paginated list with filters
//   // ServiceFilters becomes query params: /services?categoryId=1&minRating=4
//   getServices: async (
//     filters: ServiceFilters = {}
//   ): Promise<PaginatedResponse<Service>> => {
//     const response = await apiClient.get<PaginatedResponse<Service>>(
//       '/services',
//       { params: filters }  // axios converts this object to query string params
//     );
//     return response.data;
//   },
 
//   // GET /services/:id — single service with full details
//   getServiceById: async (id: string): Promise<Service> => {
//     const response = await apiClient.get<Service>(`/services/${id}`);
//     return response.data;
//   },
 
//   // GET /services/search?q=plumber — search endpoint
//   searchServices: async (
//     query: string,
//     filters: Omit<ServiceFilters, 'search'> = {}
//   ): Promise<PaginatedResponse<Service>> => {
//     const response = await apiClient.get<PaginatedResponse<Service>>(
//       '/services/search',
//       { params: { q: query, ...filters } }
//     );
//     return response.data;
//   },
 
//   // GET /categories — all service categories
//   getCategories: async (): Promise<Category[]> => {
//     const response = await apiClient.get<Category[]>('/categories');
//     return response.data;
//   },
 
//   // POST /services/:id/view — track that a user viewed this service
//   // Used for "recently viewed" personalisation
//   recordView: async (serviceId: string): Promise<void> => {
//     await apiClient.post(`/services/${serviceId}/view`);
//   },
// };
// =============================================================================
// MOCK-AWARE SERVICE LAYER
// =============================================================================
// These files replace/update the services you wrote in Lesson 02 & 03.
// The pattern: check a flag → return mock OR call real API.
// =============================================================================
 
 
// ─────────────────────────────────────────────────────────────────────────────
// FILE 1: src/services/serviceService.ts  (UPDATED — replace Lesson 03 version)
// ─────────────────────────────────────────────────────────────────────────────
//
// WHAT CHANGED: added isMockMode() check at the top of each function.
// The rest of the code is identical to Lesson 03.
 
import { apiClient } from './api';
import {
  Service,
  ServiceFilters,
  PaginatedResponse,
  HomeData,
  Category,
} from '../types/service.types';
import {
  MOCK_HOME_DATA,
  MOCK_SERVICES,
  MOCK_CATEGORIES,
  mockPaginatedServices,
} from '../mock/mockData';
 
// Read the flag once at module load time.
// In .env:  EXPO_PUBLIC_USE_MOCK=true
// Expo exposes EXPO_PUBLIC_* vars to your JS bundle automatically.
const IS_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
 
// Simulate realistic network delay in mock mode so you can see
// loading skeletons during development (50–250ms random delay).
function mockDelay(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
 
export const serviceService = {
 
  getHomeData: async (): Promise<HomeData> => {
    if (IS_MOCK) {
      await mockDelay();
      return MOCK_HOME_DATA;
    }
    const response = await apiClient.get<HomeData>('/home');
    return response.data;
  },
 
  getServices: async (
    filters: ServiceFilters = {}
  ): Promise<PaginatedResponse<Service>> => {
    if (IS_MOCK) {
      await mockDelay(400);
      return mockPaginatedServices(filters.page ?? 1, filters.limit ?? 10, {
        categoryId: filters.categoryId,
        search: filters.search,
      });
    }
    const response = await apiClient.get<PaginatedResponse<Service>>(
      '/services',
      { params: filters }
    );
    return response.data;
  },
 
  getServiceById: async (id: string): Promise<Service> => {
    if (IS_MOCK) {
      await mockDelay(300);
      const service = MOCK_SERVICES.find((s) => s.id === id);
      if (!service) throw new Error(`Service ${id} not found`);
      return service;
    }
    const response = await apiClient.get<Service>(`/services/${id}`);
    return response.data;
  },
 
  searchServices: async (
    query: string,
    filters: Omit<ServiceFilters, 'search'> = {}
  ): Promise<PaginatedResponse<Service>> => {
    if (IS_MOCK) {
      await mockDelay(500);
      return mockPaginatedServices(1, 10, { search: query });
    }
    const response = await apiClient.get<PaginatedResponse<Service>>(
      '/services/search',
      { params: { q: query, ...filters } }
    );
    return response.data;
  },
 
  getCategories: async (): Promise<Category[]> => {
    if (IS_MOCK) {
      await mockDelay(200);
      return MOCK_CATEGORIES;
    }
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },
 
  recordView: async (serviceId: string): Promise<void> => {
    if (IS_MOCK) return; // No-op in mock mode
    await apiClient.post(`/services/${serviceId}/view`);
  },
};