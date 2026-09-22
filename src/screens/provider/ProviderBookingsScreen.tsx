// src/screens/provider/ProviderBookingsScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ScrollView,
  RefreshControl, StyleSheet, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderBookingDto, ProviderBookingStatus } from '@/service/providerService';
import { useIncomingBookings } from '@/hooks/useProviderBookings';
import { StatusBadge } from '@/components/booking/StatusBadge';
import {
  Card, Chip, ScreenHeader,
  LoadingState, ErrorState, EmptyState,
} from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { FLOATING_TAB_BAR_INSET } from '@/constants/layout';
import { TYPOGRAPHY } from '@/constants/typography';
import { BookingStatus } from '@/types/booking.types';
import { ProviderStackParamList } from '@/navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<ProviderStackParamList, 'ProviderBookings'>;

type FilterOption = { label: string; value: ProviderBookingStatus | undefined };

const FILTERS: FilterOption[] = [
  { label: 'All',         value: undefined },
  { label: 'Pending',     value: 'pending' },
  { label: 'Accepted',    value: 'accepted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed',   value: 'completed' },
];

export default function ProviderBookingsScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NavProp>();
  const [activeFilter, setActiveFilter] = useState<ProviderBookingStatus | undefined>();

  const { data, isLoading, isError, refetch, isFetching } = useIncomingBookings(activeFilter);
  const bookings = data?.bookings ?? [];

  // Count pending from the unfiltered list so the badge is always visible on the All tab
  const pendingCount = !activeFilter
    ? bookings.filter((b) => b.status === 'pending').length
    : 0;

  const renderCard = ({ item }: { item: ProviderBookingDto }) => (
    <Card
      gap={SPACING.xs}
      onPress={() => navigation.navigate('ProviderBookingDetail', { bookingId: item.id })}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <StatusBadge status={item.status as BookingStatus} />
      </View>
      <Text style={styles.cardMeta}>
        {item.scheduledDate}{'  ·  '}{item.scheduledTime}
        {item.isRemote ? '  ·  Remote' : ''}
      </Text>
      {item.quotedPrice != null && (
        <Text style={styles.cardPrice}>
          {item.currency} {item.quotedPrice.toLocaleString()}
        </Text>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.background}
      />

      <ScreenHeader
        title="Incoming Bookings"
        large
        rightElement={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProviderAvailability')}
              hitSlop={{ top: 13, bottom: 13, left: 13, right: 13 }}
              accessibilityRole="button"
              accessibilityLabel="Provider profile"
            >
              <Ionicons name="person-circle-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProviderServices')}
              hitSlop={{ top: 13, bottom: 13, left: 13, right: 13 }}
              accessibilityRole="button"
              accessibilityLabel="My services"
            >
              <Ionicons name="briefcase-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersRow}
      >
        {FILTERS.map((f) => {
          const active = f.value === activeFilter;
          const showBadge = f.value === 'pending' && !activeFilter && pendingCount > 0;
          return (
            <Chip
              key={f.label}
              label={f.label}
              active={active}
              onPress={() => setActiveFilter(f.value)}
              count={showBadge ? pendingCount : undefined}
            />
          );
        })}
      </ScrollView>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No bookings"
          message={
            activeFilter
              ? `No ${activeFilter.replace('_', ' ')} bookings yet`
              : 'No incoming bookings yet'
          }
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    // A horizontal ScrollView inside a flex column claims the remaining
    // vertical space unless told not to. flexGrow: 0 makes it size to its
    // content; without it the row filled the screen and stretched the chips.
    filtersScroll: {
      flexGrow: 0,
      flexShrink: 0,
    },
    filtersRow: {
      paddingHorizontal: SPACING.screenPadding,
      paddingVertical: SPACING.sm,
      gap: SPACING.sm,
      // contentContainer defaults to alignItems: 'stretch'.
      alignItems: 'center',
    },
    list: {
      padding: SPACING.screenPadding,
      gap: SPACING.md,
      paddingBottom: FLOATING_TAB_BAR_INSET,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: SPACING.sm,
    },
    cardTitle: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.textPrimary,
    },
    cardMeta: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
    },
    cardPrice: {
      // Intent: an emphasised value, not secondary metadata.
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.primary,
    },
  });
