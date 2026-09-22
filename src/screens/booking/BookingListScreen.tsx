// src/screens/booking/BookingListScreen.tsx

import React, { useState } from 'react';
import {
  View, FlatList, ScrollView,
  StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BookingStackParamList, TabScreenNavigationProp } from '@/navigation/AppNavigator';
import { useMyBookings } from '@/hooks/useBooking';
import { BookingCard } from '@/components/booking/BookingCard';
import { Skeleton } from '@/components/common/Skeleton';
import { Chip, ScreenHeader } from '@/components/common';
import { ErrorState, EmptyState } from '@/components/common/StateView';
import { Booking, BookingStatus } from '@/types/booking.types';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { FLOATING_TAB_BAR_INSET } from '@/constants/layout';
import { TYPOGRAPHY } from '@/constants/typography';

// Filter tabs shown at the top of the list
const FILTER_TABS: { label: string; statuses: BookingStatus[] | null }[] = [
  { label: 'All', statuses: null },
  { label: 'Active', statuses: ['pending', 'accepted', 'in_progress'] },
  { label: 'Completed', statuses: ['completed'] },
  // transformBooking normalises 'rejected' → 'declined'; 'rejected' stays here
  // so mock-mode fixtures, which bypass the transform, still match.
  { label: 'Cancelled', statuses: ['cancelled', 'declined', 'rejected'] },
];

export default function BookingListScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<TabScreenNavigationProp<BookingStackParamList, 'BookingList'>>();
  const [activeFilter, setActiveFilter] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: bookings = [], isLoading, isError, refetch } = useMyBookings();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Apply the selected filter tab
  const filtered: Booking[] = FILTER_TABS[activeFilter].statuses
    ? bookings.filter((b) => FILTER_TABS[activeFilter].statuses!.includes(b.status))
    : bookings;

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      {/* HEADER */}
      <ScreenHeader title="My Bookings" large />

      {/* FILTER TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsRow}
      >
        {FILTER_TABS.map((tab, index) => (
          <Chip
            key={tab.label}
            label={tab.label}
            active={activeFilter === index}
            onPress={() => setActiveFilter(index)}
          />
        ))}
      </ScrollView>

      {/* LIST */}
      <FlatList
        data={isLoading ? ([1, 2, 3] as any[]) : filtered}
        keyExtractor={(item) => isLoading ? String(item) : (item as Booking).id}
        renderItem={({ item }) =>
          isLoading ? (
            <View style={styles.skeletonCard}>
              <Skeleton height={80} borderRadius={SPACING.borderRadius.lg} />
            </View>
          ) : (
            <BookingCard
              booking={item as Booking}
              onPress={() =>
                navigation.navigate('BookingDetail', { bookingId: (item as Booking).id })
              }
            />
          )
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="calendar-outline"
              title="No bookings yet"
              message="Browse services and book your first appointment"
              actionLabel="Browse Services"
              onAction={() => navigation.navigate('HomeTab', { screen: 'Home' })}
            />
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
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  tabsScroll: { flexGrow: 0, flexShrink: 0, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  tabsRow: {
    alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.screenPadding, paddingBottom: SPACING.md,
  },
  listContent: { padding: SPACING.screenPadding, paddingBottom: FLOATING_TAB_BAR_INSET, flexGrow: 1 },
  skeletonCard: { marginBottom: SPACING.md },
});
