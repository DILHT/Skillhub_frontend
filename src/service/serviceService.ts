// src/service/serviceService.ts
// Matches EXACT backend response shapes confirmed by code audit

import { apiClient } from './api';
import {
  Service, ServiceFilters, PaginatedResponse,
  HomeData, Category,
} from '../types/service.types';
import { mockPaginatedServices, MOCK_HOME_DATA, MOCK_CATEGORIES } from '../mock/mockData';

const IS_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

function mockDelay(ms = 400): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const CATEGORY_COLORS: Record<string, string> = {
  'home-services': '#1B7A4E',
  'tech-support': '#2563EB',
  'tutoring': '#7C3AED',
  'beauty': '#DB2777',
  'transport': '#D97706',
  'events': '#DC2626',
  'cleaning': '#0891B2',
  'plumbing': '#1B7A4E',
  'electrical-work': '#F59E0B',
};

function getCategoryColor(slug: string): string {
  return CATEGORY_COLORS[slug] ?? '#6B7280';
}

// Backend SkillCategoryDto: id, name, slug, description, iconUrl,
// parentId, sortOrder, isActive, createdAt, updatedAt
function transformCategory(raw: any): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    icon: raw.iconUrl ?? 'grid-outline',
    color: getCategoryColor(raw.slug),
    serviceCount: 0,
  };
}

// Backend pricingType values → frontend priceUnit values
const PRICING_MAP: Record<string, Service['priceUnit']> = {
  fixed: 'fixed',
  hourly: 'hour',
  negotiable: 'negotiable',
  starting_from: 'fixed',
};

// Backend ServiceDto: id, providerId, skillId, skillName, categoryId,
// categoryName, title, description, pricingType, basePrice, currency,
// priceUnit, images[], tags[], isActive, isFeatured, createdAt, updatedAt
export function transformService(raw: any): Service {
  return {
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    categoryId: raw.categoryId ?? '',
    category: {
      id: raw.categoryId ?? '',
      name: raw.categoryName ?? 'General',
      slug: (raw.categoryName ?? 'general').toLowerCase().replace(/\s+/g, '-'),
      icon: 'grid-outline',
      color: '#6B7280',
      serviceCount: 0,
    },
    provider: {
        id: raw.providerId ?? '',
        // Backend ServiceDto embeds provider name in these fields when joined
        // Falls back to extracting from skillName or using "SkillHub Provider"
        firstName: raw.providerName?.split(' ')[0] ?? raw.provider?.firstName ?? raw.provider?.user?.firstName ?? 'SkillHub',
        lastName: raw.providerName?.split(' ').slice(1).join(' ') ?? raw.provider?.lastName ?? raw.provider?.user?.lastName ?? 'Provider',
        avatar: raw.provider?.avatarUrl ?? raw.provider?.user?.avatarUrl ?? null,
        rating: raw.provider?.averageRating ?? raw.averageRating ?? 0,
        reviewCount: raw.provider?.totalReviews ?? raw.totalReviews ?? 0,
        isVerified: raw.provider?.badgeVerified ?? raw.provider?.isVerified ?? false,
        location: raw.provider?.location ?? '',
        responseTime: raw.provider?.responseTimeMinutes
          ? `Usually responds in ${raw.provider.responseTimeMinutes} min`
          : '',
      },
    price: raw.basePrice ?? raw.minPrice ?? 0,
    priceUnit: PRICING_MAP[raw.pricingType] ?? 'fixed',
    currency: raw.currency ?? 'MWK',
    images: Array.isArray(raw.images) ? raw.images : [],
    rating: 0,
    reviewCount: 0,
    isAvailable: raw.isActive ?? true,
    location: '',
    distance: null,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

export const serviceService = {

  getHomeData: async (): Promise<HomeData> => {
    if (IS_MOCK) { await mockDelay(600); return MOCK_HOME_DATA; }

    const [categoriesRes, servicesRes] = await Promise.all([
      apiClient.get('/skill-categories'),
      apiClient.get('/services', { params: { limit: 20 } }),
    ]);

    const categories: Category[] = Array.isArray(categoriesRes.data)
      ? categoriesRes.data.map(transformCategory)
      : [];

    // Backend services response: { services: [], total: number }
    const rawServices = (servicesRes.data as any)?.services ?? servicesRes.data ?? [];
    const services: Service[] = Array.isArray(rawServices)
      ? rawServices.map(transformService)
      : [];

    return {
      featuredServices: services.slice(0, 5),
      categories,
      nearbyServices: services,
      recentlyViewed: [],
    };
  },

  getServices: async (filters: ServiceFilters = {}): Promise<PaginatedResponse<Service>> => {
    if (IS_MOCK) {
      await mockDelay(400);
      return mockPaginatedServices(filters.page ?? 1, filters.limit ?? 10, {
        categoryId: filters.categoryId,
        search: filters.search,
      });
    }

    const params: Record<string, any> = {
      limit: filters.limit ?? 10,
      offset: ((filters.page ?? 1) - 1) * (filters.limit ?? 10),
    };
    if (filters.search) params.query = filters.search;  // backend param is "query"
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;

    const response = await apiClient.get('/services', { params });
    const rawData = response.data as any;
    const items = rawData?.services ?? rawData ?? [];
    const total = rawData?.total ?? (Array.isArray(items) ? items.length : 0);
    const limit = filters.limit ?? 10;
    const page = filters.page ?? 1;

    return {
      data: Array.isArray(items) ? items.map(transformService) : [],
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
    };
  },

  getServiceById: async (id: string): Promise<Service> => {
    if (IS_MOCK) {
      await mockDelay(300);
      const { MOCK_SERVICES } = await import('../mock/mockData');
      const s = MOCK_SERVICES.find((x) => x.id === id);
      if (!s) throw { message: 'Service not found', status: 404 };
      return s;
    }
    const response = await apiClient.get(`/services/${id}`);
    return transformService(response.data);
  },

  searchServices: async (
    query: string,
    filters: Omit<ServiceFilters, 'search'> = {}
  ): Promise<PaginatedResponse<Service>> => {
    return serviceService.getServices({ ...filters, search: query });
  },

  getCategories: async (): Promise<Category[]> => {
    if (IS_MOCK) { await mockDelay(200); return MOCK_CATEGORIES; }
    const response = await apiClient.get('/skill-categories');
    return Array.isArray(response.data) ? response.data.map(transformCategory) : [];
  },

  recordView: async (_serviceId: string): Promise<void> => {},
};