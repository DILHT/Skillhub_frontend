// src/screens/provider/ProviderBookingDetailScreen.tsx

import React from 'react';
import {
  View, Text, ScrollView,
  StyleSheet, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProviderStackParamList } from '@/navigation/AppNavigator';
import { useIncomingBookings, useAcceptBooking, useDeclineBooking, useStartBooking, useCompleteBooking } from '@/hooks/useProviderBookings';
import { getProviderActions } from '@/service/providerService';
import { StatusBadge } from '@/components/booking/StatusBadge';
import {
  Button, Card, ListRow, ScreenHeader, SectionHeader,
  LoadingState, ErrorState,
} from '@/components/common';
import { useIsOnline } from '@/hooks/useIsOnline';
import { haptics } from '@/utils/haptics';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { BookingStatus } from '@/types/booking.types';

type RouteProps = RouteProp<ProviderStackParamList, 'ProviderBookingDetail'>;

export default function ProviderBookingDetailScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<ProviderStackParamList, 'ProviderBookingDetail'>>();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProps>();
  const { bookingId } = route.params;
  const isOnline = useIsOnline();

  // Fetch from the same cache as the list; no separate detail endpoint confirmed
  const { data, isLoading, isError, refetch } = useIncomingBookings();
  const booking = data?.bookings.find((b) => b.id === bookingId);

  const acceptMutation  = useAcceptBooking();
  const declineMutation = useDeclineBooking();
  const startMutation   = useStartBooking();
  const completeMutation = useCompleteBooking();

  const isMutating =
    acceptMutation.isPending  ||
    declineMutation.isPending ||
    startMutation.isPending   ||
    completeMutation.isPending;

  const guardOffline = (): boolean => {
    if (!isOnline) {
      Alert.alert('No Connection', "You're offline. Please reconnect and try again.");
      return true;
    }
    return false;
  };

  const handleAccept = () => {
    if (guardOffline()) return;
    Alert.alert('Accept Booking', 'Accept this booking and notify the client?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: () => {
          haptics.impact();
          acceptMutation.mutate(
            { id: bookingId },
            {
              onSuccess: () => { haptics.success(); navigation.goBack(); },
              onError:   () => haptics.error(),
            }
          );
        },
      },
    ]);
  };

  const handleDecline = () => {
    if (guardOffline()) return;
    Alert.alert('Decline Booking', 'Decline this booking? The client will be notified.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          haptics.impact();
          declineMutation.mutate(
            { id: bookingId },
            {
              onSuccess: () => { haptics.success(); navigation.goBack(); },
              onError:   () => haptics.error(),
            }
          );
        },
      },
    ]);
  };

  const handleStart = () => {
    if (guardOffline()) return;
    Alert.alert('Start Service', 'Mark this booking as in progress?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: () => {
          haptics.impact();
          startMutation.mutate(bookingId, {
            onSuccess: () => haptics.success(),
            onError:   () => haptics.error(),
          });
        },
      },
    ]);
  };

  const handleComplete = () => {
    if (guardOffline()) return;
    Alert.alert('Complete Service', 'Mark this booking as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: () => {
          haptics.impact();
          completeMutation.mutate(
            { id: bookingId },
            {
              onSuccess: () => { haptics.success(); navigation.goBack(); },
              onError:   () => haptics.error(),
            }
          );
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Booking Details" onBack={() => navigation.goBack()} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (isError || !booking) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Booking Details" onBack={() => navigation.goBack()} />
        <ErrorState
          title={!booking ? 'Booking not found' : undefined}
          message={!booking ? 'This booking could not be loaded.' : undefined}
          onRetry={isError ? refetch : undefined}
        />
      </SafeAreaView>
    );
  }

  const actions = getProviderActions(booking.status);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.background}
      />
      <ScreenHeader title="Booking Details" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status + title */}
        <View style={styles.titleRow}>
          <Text style={styles.bookingTitle} numberOfLines={3}>{booking.title}</Text>
          <StatusBadge status={booking.status as BookingStatus} />
        </View>

        {/* Core details */}
        <Card padding="none" divided>
          <ListRow label="Scheduled" value={`${booking.scheduledDate}  ·  ${booking.scheduledTime}`} />
          <ListRow
            label="Location"
            value={booking.isRemote ? 'Remote' : (booking.address ?? '—')}
          />
          {booking.quotedPrice != null && (
            <ListRow
              label="Quoted Price"
              value={`${booking.currency} ${booking.quotedPrice.toLocaleString()}`}
            />
          )}
          {booking.escrowAmount != null && (
            <ListRow
              label="Escrow"
              value={`${booking.currency} ${booking.escrowAmount.toLocaleString()}`}
            />
          )}
          <ListRow label="Payment" value={booking.paymentStatus.replace('_', ' ')} />
          <ListRow label="Pricing" value={booking.pricingType.replace('_', ' ')} />
        </Card>

        {/* Client notes */}
        {!!booking.clientNotes && (
          <Card gap={SPACING.xs}>
            <SectionHeader title="Client Notes" variant="overline" />
            <Text style={styles.notesText}>{booking.clientNotes}</Text>
          </Card>
        )}

        {/* Provider notes */}
        {!!booking.providerNotes && (
          <Card gap={SPACING.xs}>
            <SectionHeader title="Your Notes" variant="overline" />
            <Text style={styles.notesText}>{booking.providerNotes}</Text>
          </Card>
        )}

        {/* Timestamps */}
        <Card padding="none" divided>
          <ListRow
            label="Created"
            value={new Date(booking.createdAt).toLocaleDateString()}
          />
          {!!booking.startedAt && (
            <ListRow
              label="Started"
              value={new Date(booking.startedAt).toLocaleDateString()}
            />
          )}
          {!!booking.completedAt && (
            <ListRow
              label="Completed"
              value={new Date(booking.completedAt).toLocaleDateString()}
            />
          )}
          {!!booking.cancelledAt && (
            <ListRow
              label="Cancelled"
              value={new Date(booking.cancelledAt).toLocaleDateString()}
            />
          )}
        </Card>

        {/* Cancellation reason */}
        {!!booking.cancellationReason && (
          <Card gap={SPACING.xs}>
            <SectionHeader title="Cancellation Reason" variant="overline" />
            <Text style={styles.notesText}>{booking.cancellationReason}</Text>
          </Card>
        )}
      </ScrollView>

      {/* Action bar */}
      {actions.length > 0 && (
        <View style={[styles.actionsBar, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
          {isMutating ? (
            <ActivityIndicator color={COLORS.primary} style={styles.spinner} />
          ) : (
            <>
              {/* size="md", not "lg": these are flex:1 inside an action bar,
                  where lg's horizontal padding left too little label room. */}
              {actions.includes('decline') && (
                <Button
                  label="Decline"
                  variant="outline"
                  size="md"
                  onPress={handleDecline}
                  style={{ flex: 1 }}
                />
              )}
              {actions.includes('accept') && (
                <Button
                  label="Accept"
                  variant="success"
                  size="md"
                  onPress={handleAccept}
                  style={{ flex: 1 }}
                />
              )}
              {actions.includes('start') && (
                <Button
                  label="Start Service"
                  variant="primary"
                  size="md"
                  onPress={handleStart}
                  style={{ flex: 1 }}
                />
              )}
              {actions.includes('complete') && (
                <Button
                  label="Mark Complete"
                  variant="primary"
                  size="md"
                  onPress={handleComplete}
                  style={{ flex: 1 }}
                />
              )}
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safe:    { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.screenPadding, gap: SPACING.md, paddingBottom: SPACING.xl },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: SPACING.sm,
    },
    bookingTitle: {
      // Intent: a content heading. Only the `large` tab-root header goes to 700.
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.textPrimary,
    },
    notesText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textPrimary,
      lineHeight: 20,
    },
    actionsBar: {
      flexDirection: 'row',
      // 16, not 8: 8dp is the accessibility floor for adjacent targets,
      // not the recommended separation between two primary actions.
      gap: SPACING.md,
      padding: SPACING.screenPadding,
      paddingBottom: SPACING.lg,
      backgroundColor: COLORS.surface,
      borderTopWidth: 1,
      borderTopColor: COLORS.divider,
    },
    spinner: { flex: 1 },
  });
