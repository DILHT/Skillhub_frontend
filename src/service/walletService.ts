// src/service/walletService.ts
// Wired to real backend wallet endpoints (confirmed built in backend audit)
// IS_MOCK controlled by env — set to false since wallet API exists

import { apiClient } from './api';
import { WalletBalance, Transaction } from '../types/wallet.types';

const IS_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

function mockDelay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_BALANCE: WalletBalance = {
  id: 'wallet-001', userId: 'user-001',
  balance: 45000, escrowBalance: 16000,
  currency: 'MWK', isFrozen: false,
  totalEarned: 0, totalSpent: 65000,
  updatedAt: new Date().toISOString(),
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', walletId: 'wallet-001', type: 'service_payment', status: 'completed', amount: 25000, fee: 0, netAmount: 25000, currency: 'MWK', balanceBefore: 70000, balanceAfter: 45000, description: 'Home deep cleaning — Grace Gondwe', createdAt: '2024-07-10T08:00:00Z' },
  { id: 't2', walletId: 'wallet-001', type: 'deposit', status: 'completed', amount: 100000, fee: 0, netAmount: 100000, currency: 'MWK', balanceBefore: 0, balanceAfter: 100000, description: 'Airtel Money top-up', createdAt: '2024-07-08T10:00:00Z' },
  { id: 't3', walletId: 'wallet-001', type: 'service_refund', status: 'completed', amount: 5000, fee: 0, netAmount: 5000, currency: 'MWK', balanceBefore: 65000, balanceAfter: 70000, description: 'Cancelled tutoring session', createdAt: '2024-07-05T14:00:00Z' },
  { id: 't4', walletId: 'wallet-001', type: 'service_payment', status: 'completed', amount: 15000, fee: 0, netAmount: 15000, currency: 'MWK', balanceBefore: 80000, balanceAfter: 65000, description: 'Plumbing repairs — Chisomo Phiri', createdAt: '2024-07-02T09:00:00Z' },
  { id: 't5', walletId: 'wallet-001', type: 'deposit', status: 'completed', amount: 50000, fee: 0, netAmount: 50000, currency: 'MWK', balanceBefore: 30000, balanceAfter: 80000, description: 'TNM Mpamba top-up', createdAt: '2024-06-28T11:00:00Z' },
];

export const walletService = {

  // GET /wallets/me — auto-creates wallet if none exists
  getBalance: async (): Promise<WalletBalance> => {
    if (IS_MOCK) {
      await mockDelay();
      return MOCK_BALANCE;
    }
    const response = await apiClient.get('/wallets/me');
    const data = response.data as any;
    // Map backend WalletDto fields to our WalletBalance type
    return {
      id: data.id,
      userId: data.userId,
      balance: data.balance ?? 0,
      escrowBalance: data.escrowBalance ?? 0,
      currency: data.currency ?? 'MWK',
      isFrozen: data.isFrozen ?? false,
      totalEarned: data.totalEarned ?? 0,
      totalSpent: data.totalSpent ?? 0,
      updatedAt: data.updatedAt,
    };
  },

  // GET /wallets/me/transactions
  getTransactions: async (): Promise<Transaction[]> => {
    if (IS_MOCK) {
      await mockDelay(400);
      return MOCK_TRANSACTIONS;
    }
    const response = await apiClient.get('/wallets/me/transactions', {
      params: { limit: 50 },
    });
    const data = response.data as any;
    const rawItems = data?.items ?? data?.transactions ?? data ?? [];
      return rawItems.map((t: any) => ({
        ...t,
        // Normalize UPPERCASE backend type to lowercase for the UI
        type: (t.type ?? '').toLowerCase(),
        status: (t.status ?? '').toLowerCase(),
        fee: t.fee ?? 0,
        netAmount: t.netAmount ?? t.amount ?? 0,
        balanceBefore: t.balanceBefore ?? 0,
        balanceAfter: t.balanceAfter ?? 0,
      }));
  },

  // POST /wallets/me/deposit
  topUp: async (
    amount: number,
    method: string
  ): Promise<{ success: boolean; message: string }> => {
    if (IS_MOCK) {
      await mockDelay(1500);
      return {
        success: true,
        message: `MWK ${amount.toLocaleString()} added to your wallet`,
      };
    }
    const response = await apiClient.post('/wallets/me/deposit', {
      amount,
      currency: 'MWK',
      gateway: 'PAYCHANGU',  // backend expects a gateway enum, not paymentMethod
      notes: `Top-up via ${method}`,
    });
    return {
      success: true,
      message: response.data?.message ?? 'Deposit request submitted',
    };
  },
};