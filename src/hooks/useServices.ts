// =============================================================================
// FILE 3: src/hooks/useServices.ts
// =============================================================================
//
// THIS IS WHERE YOU LEARN useQuery IN DEPTH.
//
// useQuery takes a "query key" and a "query function".
//
// QUERY KEY — A unique identifier for this data in the cache.
//   ['home']            → the home data
//   ['services']        → all services, no filters
//   ['services', {categoryId: '1'}] → services filtered by category 1
//   ['service', '42']   → the service with id 42
//
// Why arrays? Because React Query can INVALIDATE by prefix.
//   queryClient.invalidateQueries({ queryKey: ['services'] })
//   This invalides ALL queries whose key starts with 'services' —
//   the list AND the individual service. One call cleans everything.
//
// QUERY FUNCTION — An async function that fetches the data.
//   If it throws, React Query marks the query as 'error'.
//   If it resolves, the result is cached under the query key.
 
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { serviceService } from '../service/serviceService';
import { ServiceFilters } from '../types/service.types';
 
// ── QUERY KEY CONSTANTS ───────────────────────────────────────────────────────
//
// NEVER write raw strings like ['services'] in your hook calls.
// Typos in query keys cause silent bugs that are very hard to find.
// Define them as constants here, import wherever needed.
 
export const SERVICE_QUERY_KEYS = {
  home: ['home'] as const,
  all: ['services'] as const,
  lists: () => [...SERVICE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: ServiceFilters) => [...SERVICE_QUERY_KEYS.lists(), filters] as const,
  details: () => [...SERVICE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SERVICE_QUERY_KEYS.details(), id] as const,
  categories: ['categories'] as const,
};
 
// ── HOOK 1: useHomeData ───────────────────────────────────────────────────────
//
// Fetches everything the HomeScreen needs in one call.
// Runs automatically when any component that calls this hook mounts.
 
export function useHomeData() {
  return useQuery({
    queryKey: SERVICE_QUERY_KEYS.home,
 
    queryFn: serviceService.getHomeData,
 
    // staleTime: How long (ms) before the data is considered "stale" and
    // eligible for a background refetch. 5 minutes is good for relatively
    // stable data like a service catalogue.
    staleTime: 5 * 60 * 1000,   // 5 minutes
 
    // gcTime (formerly cacheTime): How long to keep unused data in cache.
    // If user leaves HomeScreen and comes back within 10 mins, they see
    // cached data instantly while a background refetch runs.
    gcTime: 10 * 60 * 1000,     // 10 minutes
 
    // retry: How many times to retry on failure before showing error state.
    // 2 retries is good for unstable African mobile connections.
    retry: 2,
  });
  // Returns: { data, isLoading, isError, error, refetch, isFetching }
  // isLoading = true on the FIRST load (no cached data)
  // isFetching = true on BACKGROUND refetches too
  // Use isLoading for skeleton screens, isFetching for subtle refresh indicators
}
 
// ── HOOK 2: useServices ───────────────────────────────────────────────────────
//
// Fetches a filtered, paginated list of services.
// The filters object becomes part of the query key — so different filter
// combinations are cached separately.
 
export function useServices(filters: ServiceFilters = {}) {
  return useQuery({
    queryKey: SERVICE_QUERY_KEYS.list(filters),
    queryFn: () => serviceService.getServices(filters),
    staleTime: 3 * 60 * 1000,  // 3 minutes — listings change more often
 
    // placeholderData: While fetching new filter results, show the
    // previous filter's data instead of a loading spinner.
    // The user sees old results immediately, new ones replace them smoothly.
    // This is the 'keepPreviousData' pattern from React Query v4.
    placeholderData: (previousData) => previousData,
  });
}
 
// ── HOOK 3: useServiceDetail ─────────────────────────────────────────────────
//
// Fetches a single service's full details.
// enabled: false when id is undefined (don't fetch until we have an id)
 
export function useServiceDetail(id: string | undefined) {
  return useQuery({
    queryKey: SERVICE_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => serviceService.getServiceById(id!),
 
    // Don't run this query if id is not provided
    // This prevents a request to /services/undefined
    enabled: !!id,
 
    staleTime: 5 * 60 * 1000,
  });
}
 
// ── HOOK 4: useInfiniteServices ───────────────────────────────────────────────
//
// For "load more" / infinite scroll — used in SearchScreen and CategoryScreen.
// useInfiniteQuery manages multiple pages of data and merges them together.
//
// How it works:
//   1. Fetches page 1
//   2. User scrolls to bottom → call fetchNextPage()
//   3. Fetches page 2, merges with page 1 data
//   4. Repeat until hasNextPage = false
 
export function useInfiniteServices(filters: Omit<ServiceFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...SERVICE_QUERY_KEYS.lists(), 'infinite', filters],
 
    // pageParam: injected by React Query, starts at initialPageParam
    queryFn: ({ pageParam }) =>
      serviceService.getServices({ ...filters, page: pageParam as number, limit: 10 }),
 
    initialPageParam: 1,
 
    // getNextPageParam: tells React Query what the next page param is.
    // If hasNextPage is false, return undefined → React Query stops fetching.
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
 
    staleTime: 2 * 60 * 1000,
  });
  // Returns: { data.pages (array of pages), fetchNextPage, hasNextPage, isFetchingNextPage }
  // In your FlatList: data?.pages.flatMap(page => page.data) gives you all items
}