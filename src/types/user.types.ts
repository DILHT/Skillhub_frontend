// src/types/user.types.ts
// Matches backend response shapes exactly

export type UserRole = 'client' | 'provider' | 'both' | 'admin';

export type KYCStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

// Minimal user object returned INSIDE the login/register token response
export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
  profilePicture?: string;
  role?: UserRole;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
}

// Full user profile from GET /auth/profile or GET /users/me
export interface User {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profilePicture?: string | null; // backend field name
  avatar?: string | null;         // alias — set from profilePicture in authStore
  bio?: string;
  role: UserRole;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  isVerified?: boolean;
  kycStatus?: KYCStatus;
  rating?: number | null;
  languagePreference?: string;
  preferredCurrency?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Login + verifyOTP response — what lives inside data {}
export interface AuthResponse {
  accessToken: string;   // backend uses "accessToken", not "token"
  refreshToken: string;
  user?: AuthUser;
}

// Register step 1 — no token, just a message
export interface RegisterResponse {
  message: string;
}

// Token refresh response
export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

// Helper: derive a display name from a User object
export function getUserDisplayName(user: User | null): string {
  if (!user) return '';
  if (user.fullName) return user.fullName;
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  return user.email ?? '';
}

// Helper: get first name for greeting ("Good morning, Dev 👋")
export function getUserFirstName(user: User | null): string {
  if (!user) return '';
  if (user.firstName) return user.firstName;
  if (user.fullName) return user.fullName.split(' ')[0];
  return '';
}