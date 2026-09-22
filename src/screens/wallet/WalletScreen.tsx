// src/screens/wallet/WalletScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { WalletStackParamList } from '@/navigation/AppNavigator';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { walletService } from '@/service/walletService';
import { WALLET_QUERY_KEYS } from '@/hooks/useWallet';
import { Transaction } from '@/types/wallet.types';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { FLOATING_TAB_BAR_INSET } from '@/constants/layout';
import { TYPOGRAPHY } from '@/constants/typography';
import { TRANSACTION_TYPE_ICONS, CREDIT_TRANSACTION_TYPES } from '@/constants/wallet';
import { ErrorState, ScreenHeader, SectionHeader } from '@/components/common';

const BALANCE_HIDDEN_KEY = 'walletBalanceHidden';

function formatAmount(amount: number, currency: string): string {
  return `${currency} ${new Intl.NumberFormat('en-MW').format(amount)}`;
}

export default function WalletScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<WalletStackParamList, 'Wallet'>>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(BALANCE_HIDDEN_KEY)
      .then((v) => {
        if (v === 'true') setBalanceHidden(true);
      })
      // Falls back to the default (visible). A failed preference read must not
      // surface as an unhandled rejection.
      .catch(() => setBalanceHidden(false));
  }, []);

  const toggleBalanceVisibility = async () => {
    const next = !balanceHidden;
    setBalanceHidden(next);
    await AsyncStorage.setItem(BALANCE_HIDDEN_KEY, String(next));
  };

  const { data: balance, isLoading: isBalanceLoading, isError: isBalanceError, refetch: refetchBalance } = useQuery({
    queryKey: WALLET_QUERY_KEYS.balance,
    queryFn: walletService.getBalance,
    staleTime: 30 * 1000,
  });

  const { data: transactions = [], isError: isTransactionsError, refetch: refetchTransactions } = useQuery({
    queryKey: WALLET_QUERY_KEYS.transactions,
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
        <ErrorState onRetry={() => Promise.all([refetchBalance(), refetchTransactions()])} />
      </SafeAreaView>
    );
  }

  const recentTransactions = (transactions as Transaction[]).slice(0, 3);
  const currency = balance?.currency ?? 'MWK';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Wallet" large />

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
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#2563EB', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            {/* TOP ROW */}
            <View style={styles.cardTopRow}>
              <View style={styles.cardTopLeft}>
                <Text style={styles.balanceLabel}>Available balance</Text>
                <View style={styles.amountRow}>
                  {isBalanceLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.balanceAmount}>
                      {balanceHidden ? `${currency} ••••••` : formatAmount(balance?.balance ?? 0, currency)}
                    </Text>
                  )}
                  <TouchableOpacity onPress={toggleBalanceVisibility} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons
                      name={balanceHidden ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="rgba(255,255,255,0.8)"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.walletIconBox}>
                <Ionicons name="wallet-outline" size={22} color="#fff" />
              </View>
            </View>

            {/* BOTTOM ROW */}
            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.escrowLabel}>In escrow</Text>
                <Text style={styles.escrowAmount}>
                  {balanceHidden ? '••••••' : formatAmount(balance?.escrowBalance ?? 0, currency)}
                </Text>
              </View>
              <Text style={styles.cardFlourish}>{`•••• ${new Date().getFullYear()}`}</Text>
            </View>
          </LinearGradient>

          {/* ACTION BUTTONS */}
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
          <SectionHeader title="Recent transactions" action={{ label: "See all", onPress: () => navigation.navigate("Transactions") }} />

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
                        <Text style={styles.txnDate}>{txn.createdAt?.slice(0, 10) ?? ''}</Text>
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

        <View style={{ height: FLOATING_TAB_BAR_INSET }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  cardWrapper: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.lg,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    gap: SPACING.lg,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTopLeft: { gap: 6 },
  balanceLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: '#BFDBFE' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  balanceAmount: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: '#fff',
  },
  walletIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  escrowLabel: { fontSize: TYPOGRAPHY.fontSize.xs, color: '#BFDBFE', marginBottom: 2 },
  escrowAmount: { fontSize: TYPOGRAPHY.fontSize.md, fontFamily: TYPOGRAPHY.fontFamily.medium, color: '#fff' },
  cardFlourish: { fontSize: TYPOGRAPHY.fontSize.sm, color: '#BFDBFE', letterSpacing: 2 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionBtn: { alignItems: 'center', gap: SPACING.xs },
  actionIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  section: { padding: SPACING.screenPadding },
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
});
