// src/types/wallet.types.ts

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'service_payment'
  | 'service_refund'
  | 'platform_fee'
  | 'bonus'
  | 'adjustment';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export interface WalletBalance {
  id: string;
  userId: string;
  balance: number;
  escrowBalance: number;
  currency: string;
  isFrozen: boolean;
  totalEarned: number;
  totalSpent: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  bookingId?: string;
  gateway?: string;
  gatewayTransactionId?: string;
  createdAt: string;
}