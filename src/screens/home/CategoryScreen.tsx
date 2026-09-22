// src/screens/home/CategoryScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  Text, FlatList, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ErrorState, EmptyState } from '@/components/common/StateView';
import { Chip, ScreenHeader } from '@/components/common';
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
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, 'Category'>>();
  const route = useRoute<RouteProps>();
  const { categoryId, categoryName } = route.params;
  const [sortBy, setSortBy] = useState<SortValue>('newest');

  const { data, isLoading, isError, refetch, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteServices({ categoryId, sortBy });

  const results: Service[] = data?.pages.flatMap((p) => p.data) ?? [];

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title={categoryName} onBack={() => navigation.goBack()} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortScroll}
        contentContainerStyle={styles.sortRow}
      >
        {SORT_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={sortBy === opt.value}
            onPress={() => setSortBy(opt.value)}
          />
        ))}
      </ScrollView>

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
            <EmptyState icon="search-outline" title="No services in this category yet" />
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
  sortScroll: {
    flexGrow: 0, flexShrink: 0,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  sortRow: {
    alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.screenPadding, paddingVertical: SPACING.md,
  },
  resultCount: {
    fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary,
    paddingHorizontal: SPACING.screenPadding, paddingTop: SPACING.sm, paddingBottom: SPACING.xs,
  },
  listContent: { padding: SPACING.screenPadding, flexGrow: 1 },
});
