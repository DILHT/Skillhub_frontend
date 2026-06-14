// src/screens/wallet/TransactionHistoryScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
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
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState(0);

  const { data: transactions = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['wallet-transactions'],
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
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f, i) => (
          <TouchableOpacity
            key={f.label}
            style={[styles.filterChip, activeFilter === i && styles.filterChipActive]}
            onPress={() => setActiveFilter(i)}
          >
            <Text style={[
              styles.filterLabel,
              activeFilter === i && styles.filterLabelActive,
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
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
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={40} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.screenPadding, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  filterRow: {
    flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  filterChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  filterLabelActive: { color: COLORS.white, fontFamily: TYPOGRAPHY.fontFamily.medium },
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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
});
