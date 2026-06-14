// src/screens/home/CategoryScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteServices } from '@/hooks/useServices';
import { ServiceCard } from '@/components/service/ServiceCard';
import { ServiceCardSkeleton } from '@/components/common/Skeleton';
import { HomeStackParamList } from '@/navigation/AppNavigator';
import { Service } from '@/types/service.types';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { useAppTheme } from '@/context/ThemeContext';

type RouteProps = RouteProp<HomeStackParamList, 'Category'>;

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Rating', value: 'rating' },
  { label: 'Price Low', value: 'price_asc' },
  { label: 'Price High', value: 'price_desc' },
] as const;

type SortValue = typeof SORT_OPTIONS[number]['value'];

export default function CategoryScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { categoryId, categoryName } = route.params;
  const [sortBy, setSortBy] = useState<SortValue>('newest');

  const { data, isLoading, isError, refetch, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteServices({ categoryId, sortBy });

  const results: Service[] = data?.pages.flatMap((p) => p.data) ?? [];

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.errorStateTitle}>Couldn't load</Text>
          <Text style={styles.errorStateText}>
            Something went wrong. Please check your connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{categoryName}</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.sortChip, sortBy === opt.value && styles.sortChipActive]}
            onPress={() => setSortBy(opt.value)}
          >
            <Text style={[styles.sortLabel, sortBy === opt.value && styles.sortLabelActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!isLoading && data && (
        <Text style={styles.resultCount}>{data.pages[0]?.total ?? 0} services</Text>
      )}

      <FlatList
        data={isLoading ? ([1, 2, 3] as any[]) : results}
        keyExtractor={(item) => isLoading ? String(item) : (item as Service).id}
        renderItem={({ item }) =>
          isLoading ? <ServiceCardSkeleton /> : <ServiceCard service={item as Service} />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: SPACING.lg }} />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={COLORS.textTertiary} />
              <Text style={styles.emptyTitle}>No services in this category yet</Text>
            </View>
          ) : null
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
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
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg, fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary, flex: 1, textAlign: 'center',
  },
  sortRow: {
    flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap',
    paddingHorizontal: SPACING.screenPadding, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  sortChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  sortChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sortLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  sortLabelActive: { color: COLORS.white, fontFamily: TYPOGRAPHY.fontFamily.medium },
  resultCount: {
    fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary,
    paddingHorizontal: SPACING.screenPadding, paddingTop: SPACING.sm,
  },
  listContent: { padding: SPACING.screenPadding, flexGrow: 1 },
  empty: { alignItems: 'center', paddingTop: SPACING.xxxl, gap: SPACING.sm },
  emptyTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
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
