// =============================================================================
// FILE 1: src/types/service.types.ts
// =============================================================================
//
// Define every data shape the Home/Service feature needs.
// These types are shared between the service layer, hooks, and screens.
// If the backend adds a field, you add it HERE — one change, everywhere updated.
 
// A service category (e.g. "Home Services", "Tech Support", "Tutoring")
export interface Category {
  id: string;
  name: string;
  slug: string;       // URL-friendly name: "home-services"
  icon: string;       // Ionicon name: "home-outline"
  color: string;      // Hex color for category chip background
  serviceCount: number;
}
 
// A review left by a client
export interface Review {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string | null;
  rating: number;       // 1–5
  comment: string;
  createdAt: string;
}
 
// The provider info embedded inside a service listing
// (not the full Provider type — just what we need for the card)
export interface ServiceProvider {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  rating: number;
  reviewCount: number;
  isVerified: boolean;  // KYC verified
  location: string;     // City, e.g. "Lilongwe"
  responseTime: string; // e.g. "Usually responds in 1 hour"
}
 
// A single service listing — the core entity of the marketplace
export interface Service {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category: Category;
  provider: ServiceProvider;
  price: number;
  priceUnit: 'hour' | 'day' | 'fixed' | 'negotiable';
  currency: string;     // 'MWK', 'KES', 'ZAR', 'NGN' etc.
  images: string[];     // Array of image URLs
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  location: string;
  distance: number | null; // km from user's location
  tags: string[];
  createdAt: string;
}
 
// Parameters for the GET /services endpoint
// Every filter the API supports is defined here
export interface ServiceFilters {
  categoryId?: string;
  search?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  isAvailable?: boolean;
  sortBy?: 'rating' | 'price_asc' | 'price_desc' | 'newest' | 'distance';
  page?: number;
  limit?: number;
}
 
// Paginated response wrapper — reused for any list endpoint
// The <T> makes this generic: PaginatedResponse<Service>, PaginatedResponse<Booking> etc.
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
 
// What the HomeScreen needs from the API — a pre-assembled view
export interface HomeData {
  featuredServices: Service[];    // Top-rated / sponsored services
  categories: Category[];         // All service categories
  nearbyServices: Service[];      // Services sorted by distance
  recentlyViewed: Service[];      // Personalised for this user
}