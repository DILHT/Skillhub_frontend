// src/hooks/useWallet.ts
//
// Key factory for the wallet domain.
//
// The wallet screens still call useQuery directly rather than going through
// hooks here (see the architecture review — extracting those is a separate
// piece of work). This module exists now so the keys have ONE definition:
// they were previously written as literals in WalletScreen and
// TransactionHistoryScreen, and TopUpScreen needed a third copy to invalidate
// them. Grow the actual hooks into this file when the wallet layer is done.

import { QueryClient } from '@tanstack/react-query';

export const WALLET_QUERY_KEYS = {
  all: ['wallet'] as const,
  balance: ['wallet-balance'] as const,
  transactions: ['wallet-transactions'] as const,
};

// Anything that moves money has to bust both: the balance and the ledger are
// separate cache entries with 30s / 60s staleTime, so without this a user
// returns from a successful top-up to their previous balance.
export function invalidateWallet(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.balance });
  qc.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.transactions });
}
