// src/constants/wallet.ts
// Shared wallet constants used by WalletScreen and TransactionHistoryScreen

export const TRANSACTION_TYPE_ICONS: Record<string, string> = {
  // deposit: 'arrow-down-circle-outline',
  // withdrawal: 'arrow-up-circle-outline',
  // service_payment: 'cart-outline',
  // service_refund: 'refresh-circle-outline',
  // platform_fee: 'receipt-outline',
  // bonus: 'gift-outline',
  // adjustment: 'construct-outline',
  deposit: 'arrow-down-circle-outline',
  withdrawal: 'arrow-up-circle-outline',
  booking_payment: 'cart-outline',
  refund: 'refresh-circle-outline',
  subscription: 'star-outline',
};

export const CREDIT_TRANSACTION_TYPES = ['deposit', 'refund'];
// [
//   'deposit',
//   'service_refund',
//   'bonus',
//   'adjustment',
// ];