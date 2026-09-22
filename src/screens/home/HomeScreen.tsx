// src/screens/home/HomeScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useHomeData, useServices } from '@/hooks/useServices';
import { useAuthStore } from '@/store/authStore';
import { ServiceCard } from '@/components/service/ServiceCard';
import { Chip, ErrorState, SectionHeader, toIoniconName } from '@/components/common';
import { ServiceCardSkeleton, Skeleton } from '@/components/common/Skeleton';
import { Category, Service } from '@/types/service.types';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { FLOATING_TAB_BAR_INSET } from '@/constants/layout';
import { TYPOGRAPHY } from '@/constants/typography';
import { useNotifications } from '@/hooks/useNotifications';

export default function HomeScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, 'Home'>>();
  const user = useAuthStore((state) => state.user);
  const { unreadCount } = useNotifications();


  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: homeData,
    isLoading: isHomeLoading,
    isError: isHomeError,
    refetch: refetchHome,
  } = useHomeData();

  const {
    data: filteredData,
    isLoading: isFilterLoading,
  } = useServices(
    selectedCategoryId ? { categoryId: selectedCategoryId } : {}
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetchHome();
    setIsRefreshing(false);
  }, [refetchHome]);

  if (isHomeError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState
          title="Couldn't load services"
          message="Check your connection and try again"
          onRetry={refetchHome}
        />
      </SafeAreaView>
    );
  }

  const mainListData: Service[] = selectedCategoryId
    ? (filteredData?.data ?? [])
    : (homeData?.nearbyServices ?? []);

  const mainListLoading = selectedCategoryId ? isFilterLoading : isHomeLoading;

  const ListHeader = useCallback(
    () => (
      <View>
        {/* GREETING */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {(() => {
                const h = new Date().getHours();
                return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
              })()}, {user?.firstName ?? 'there'} 👋
            </Text>
            <Text style={styles.subGreeting}>
              What service do you need today?
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* FAKE SEARCH BAR — tapping navigates to SearchScreen */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={COLORS.textTertiary}
          />
          <Text style={styles.searchPlaceholder}>
            Search for plumbers, tutors, cleaners...
          </Text>
        </TouchableOpacity>

        {/* CATEGORIES */}
        <SectionHeader title="Categories" style={styles.sectionHeader} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          <Chip
            label="All"
            active={!selectedCategoryId}
            onPress={() => setSelectedCategoryId(null)}
            size="md"
          />

          {isHomeLoading
            ? [1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  width={90}
                  height={44}
                  borderRadius={SPACING.borderRadius.full}
                  style={{ marginRight: SPACING.sm }}
                />
              ))
            : homeData?.categories.map((cat: Category) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  // transformCategory puts the backend's iconUrl in this field,
                  // so it is not guaranteed to be a glyph name.
                  icon={toIoniconName(cat.icon)}
                  color={cat.color}
                  active={selectedCategoryId === cat.id}
                  size="md"
                  onPress={() =>
                    setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)
                  }
                />
              ))}
        </ScrollView>

        {/* FEATURED (only when no category filter active) */}
        {!selectedCategoryId && (
          <>
            <SectionHeader
              title="Featured"
              style={styles.sectionHeader}
              action={{ label: "See all", onPress: () => navigation.navigate("Search") }}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {isHomeLoading
                ? [1, 2].map((i) => (
                    <View
                      key={i}
                      style={{
                        width: SPACING.screenPadding * 10,
                        marginRight: SPACING.md,
                      }}
                    >
                      <ServiceCardSkeleton />
                    </View>
                  ))
                : homeData?.featuredServices.map((service: Service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      variant="horizontal"
                    />
                  ))}
            </ScrollView>
          </>
        )}

        {/* NEARBY / FILTERED SECTION LABEL */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategoryId ? 'Services' : 'Nearby services'}
          </Text>
          {filteredData && (
            <Text style={styles.resultCount}>
              {selectedCategoryId
                ? filteredData.total
                : homeData?.nearbyServices.length ?? 0}{' '}
              results
            </Text>
          )}
        </View>
      </View>
    ),
    [
      user,
      homeData,
      isHomeLoading,
      selectedCategoryId,
      filteredData,
      navigation,
      styles,
      COLORS,
    ]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      <FlatList
        data={mainListLoading ? ([1, 2, 3] as any[]) : mainListData}
        keyExtractor={(item) =>
          mainListLoading ? String(item) : (item as Service).id
        }
        renderItem={({ item }) =>
          mainListLoading ? (
            <ServiceCardSkeleton />
          ) : (
            <ServiceCard service={item as Service} variant="vertical" />
          )
        }
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !mainListLoading ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={40}
                color={COLORS.textTertiary}
              />
              <Text style={styles.emptyTitle}>No services found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different category or location
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.screenPadding,
    paddingTop: 0,
    paddingBottom: FLOATING_TAB_BAR_INSET,
    flexGrow: 1,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  subGreeting: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  // ── Search bar ───────────────────────────────────────────────────────────────
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.borderRadius.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  searchPlaceholder: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    flex: 1,
  },

  // ── Categories ───────────────────────────────────────────────────────────────
  categoriesScroll: {
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
    // contentContainer defaults to alignItems: 'stretch', which makes every
    // chip grow to the tallest one in the row.
    alignItems: 'center',
  },

  // ── Section headers ──────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  resultCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  featuredScroll: {
    paddingBottom: SPACING.lg,
  },

  // ── Error state ──────────────────────────────────────────────────────────────

  // ── Empty state ──────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  notifBadge: {
  position: 'absolute',
  top: 2,
  right: 2,
  minWidth: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: COLORS.danger,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 4,
},
notifBadgeText: {
  color: COLORS.white,
  fontSize: 10,
  fontWeight: '600',
},
});
