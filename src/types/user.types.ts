// src/types/user.types.ts
// PURPOSE: Define what a User looks like across the ENTIRE app.
// Backend, frontend, and database all agree on this shape.

export type UserRole = 'client' | 'provider';

export type KYCStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export interface User {
  id: string;
  email: string;
  phone: string;           // Primary contact in African markets
  firstName: string;
  lastName: string;
  avatar: string | null;   // URL to profile photo
  role: UserRole;
  kycStatus: KYCStatus;
  isVerified: boolean;
  rating: number | null;   // Only relevant for providers
  createdAt: string;       // ISO date string from backend
}

// This is what the login API returns
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}