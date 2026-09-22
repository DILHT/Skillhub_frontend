// src/screens/wallet/TransactionHistoryScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { WalletStackParamList } from '@/navigation/AppNavigator';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { walletService } from '@/service/walletService';
import { WALLET_QUERY_KEYS } from '@/hooks/useWallet';
import { Chip, ScreenHeader, LoadingState, ErrorState, EmptyState } from '@/components/common';
import { Transaction } from '@/types/wallet.types';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

const TYPE_ICONS: Record<string, string> = {
  deposit: 'arrow-down-circle-outline',
  withdrawal: 'arrow-up-circle-outline',
  service_payment: 'cart-outline',
  service_refund: 'refresh-circle-outline',
  platform_fee: 'receipt-outline',
  bonus: 'gift-outline',
};

const CREDIT_TYPES = ['deposit', 'service_refund', 'bonus'];

const FILTERS = [
  { label: 'All', types: null as string[] | null },
  { label: 'Top-ups', types: ['deposit'] },
  { label: 'Payments', types: ['service_payment'] },
  { label: 'Refunds', types: ['service_refund'] },
];

export default function TransactionHistoryScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<WalletStackParamList, 'Transactions'>>();
  const [activeFilter, setActiveFilter] = useState(0);

  const { data: transactions = [], isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: WALLET_QUERY_KEYS.transactions,
    queryFn: walletService.getTransactions,
    staleTime: 60 * 1000,
  });

  const filtered = FILTERS[activeFilter].types
    ? (transactions as Transaction[]).filter((t) =>
        FILTERS[activeFilter].types!.includes(t.type)
      )
    : (transactions as Transaction[]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader title="Transaction History" onBack={() => navigation.goBack()} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader title="Transaction History" onBack={() => navigation.goBack()} />
        <ErrorState title="Couldn't load transactions" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Transaction History" onBack={() => navigation.goBack()} />

      <View style={styles.filterRow}>
        {FILTERS.map((f, i) => (
          <Chip
            key={f.label}
            label={f.label}
            active={activeFilter === i}
            onPress={() => setActiveFilter(i)}
          />
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        renderItem={({ item }) => {
          const isCredit = CREDIT_TYPES.includes(item.type);
          return (
            <View style={styles.txnRow}>
              <View style={[
                styles.txnIcon,
                { backgroundColor: isCredit ? COLORS.successBg : COLORS.errorBg },
              ]}>
                <Ionicons
                  name={(TYPE_ICONS[item.type] ?? 'receipt-outline') as any}
                  size={20}
                  color={isCredit ? COLORS.successText : COLORS.errorText}
                />
              </View>
              <View style={styles.txnInfo}>
                <Text style={styles.txnDesc} numberOfLines={1}>
                  {item.description}
                </Text>
                <Text style={styles.txnDate}>{item.createdAt.slice(0, 10)}</Text>
              </View>
              <Text style={[
                styles.txnAmount,
                { color: isCredit ? COLORS.success : COLORS.textPrimary },
              ]}>
                {isCredit ? '+' : '-'} MWK {new Intl.NumberFormat('en-MW').format(item.amount)}
              </Text>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState icon="receipt-outline" title="No transactions found" />
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  filterRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  listContent: { flexGrow: 1 },
  txnRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, paddingHorizontal: SPACING.screenPadding,
    backgroundColor: COLORS.surface,
  },
  txnIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  txnInfo: { flex: 1 },
  txnDesc: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary },
  txnDate: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textTertiary, marginTop: 2 },
  txnAmount: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  divider: { height: 1, backgroundColor: COLORS.divider },
  empty: { alignItems: 'center', paddingTop: SPACING.xxxl, gap: SPACING.md },
  emptyText: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textSecondary },
});
