// src/screens/wallet/WalletScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { walletService } from '@/service/walletService';
import { Transaction } from '@/types/wallet.types';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { TRANSACTION_TYPE_ICONS, CREDIT_TRANSACTION_TYPES } from '@/constants/wallet';

function formatAmount(amount: number, currency: string): string {
  return `${currency} ${new Intl.NumberFormat('en-MW').format(amount)}`;
}

export default function WalletScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: balance, isLoading: isBalanceLoading, isError: isBalanceError, refetch: refetchBalance } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: walletService.getBalance,
    staleTime: 30 * 1000,
  });

  const { data: transactions = [], isError: isTransactionsError, refetch: refetchTransactions } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: walletService.getTransactions,
    staleTime: 60 * 1000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchBalance(), refetchTransactions()]);
    setIsRefreshing(false);
  };

  if (isBalanceError || isTransactionsError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.errorStateTitle}>Couldn't load</Text>
          <Text style={styles.errorStateText}>
            Something went wrong. Please check your connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => Promise.all([refetchBalance(), refetchTransactions()])}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const recentTransactions = (transactions as Transaction[]).slice(0, 3);
  const currency = balance?.currency ?? 'MWK';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* BALANCE CARD */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {isBalanceLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              formatAmount(balance?.balance ?? 0, currency)
            )}
          </Text>
          {balance && balance.escrowBalance > 0 && (
            <Text style={styles.escrowText}>
              + {formatAmount(balance.escrowBalance, currency)} in escrow
            </Text>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('TopUp')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="add" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Top Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  Alert.alert(
                    'Withdraw Funds',
                    'Withdrawal to mobile money will be available once your account is verified. Please complete identity verification first.',
                    [{ text: 'OK' }]
                  )
                }
              >
              <View style={styles.actionIcon}>
                <Ionicons name="arrow-up-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Withdraw</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('Transactions')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="list-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RECENT TRANSACTIONS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionList}>
            {recentTransactions.length === 0 ? (
              <View style={styles.emptyTxn}>
                <Text style={styles.emptyTxnText}>No transactions yet</Text>
              </View>
            ) : (
              recentTransactions.map((txn: Transaction, index: number) => {
                const isCredit = CREDIT_TRANSACTION_TYPES.includes(txn.type);
                return (
                  <View key={txn.id}>
                    <View style={styles.txnRow}>
                      <View style={[
                        styles.txnIcon,
                        { backgroundColor: isCredit ? COLORS.successBg : COLORS.errorBg },
                      ]}>
                        <Ionicons
                          name={(TRANSACTION_TYPE_ICONS[txn.type] ?? 'receipt-outline') as any}
                          size={20}
                          color={isCredit ? COLORS.successText : COLORS.errorText}
                        />
                      </View>
                      <View style={styles.txnInfo}>
                        <Text style={styles.txnDescription} numberOfLines={1}>
                          {txn.description}
                        </Text>
                        <Text style={styles.txnDate}>{txn.createdAt.slice(0, 10)}</Text>
                      </View>
                      <Text style={[
                        styles.txnAmount,
                        { color: isCredit ? COLORS.success : COLORS.textPrimary },
                      ]}>
                        {isCredit ? '+' : '-'} {formatAmount(txn.amount, currency)}
                      </Text>
                    </View>
                    {index < recentTransactions.length - 1 && (
                      <View style={styles.txnDivider} />
                    )}
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: SPACING.screenPadding, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  balanceLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: 'rgba(255,255,255,0.75)' },
  balanceAmount: {
    fontSize: 36,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.white,
  },
  escrowText: { fontSize: TYPOGRAPHY.fontSize.sm, color: 'rgba(255,255,255,0.65)' },
  actionRow: { flexDirection: 'row', gap: SPACING.xl, marginTop: SPACING.md },
  actionBtn: { alignItems: 'center', gap: SPACING.xs },
  actionIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.white },
  section: { padding: SPACING.screenPadding },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  transactionList: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1, borderColor: COLORS.divider,
  },
  emptyTxn: { padding: SPACING.xl, alignItems: 'center' },
  emptyTxnText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.fontSize.sm },
  txnRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.md, padding: SPACING.md,
  },
  txnIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  txnInfo: { flex: 1 },
  txnDescription: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary },
  txnDate: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textTertiary, marginTop: 2 },
  txnAmount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  txnDivider: {
    height: 1, backgroundColor: COLORS.divider,
    marginLeft: SPACING.md + 40 + SPACING.md,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  errorStateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  errorStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
