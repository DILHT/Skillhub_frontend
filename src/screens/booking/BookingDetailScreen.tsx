// PLACE AT: src/screens/booking/BookingDetailScreen.tsx

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useBookingDetail, useCancelBooking } from '@/hooks/useBooking';
import { StatusBadge } from '@/components/booking/StatusBadge';
import { LoadingState } from '@/components/common/StateView';
import { Avatar } from '@/components/common/Avatar';
import { Button, Card, ScreenHeader, SectionHeader } from '@/components/common';
import { BookingStackParamList } from '@/navigation/AppNavigator';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { safeFormatDate } from '@/utils/dateHelpers';
import { haptics } from '@/utils/haptics';
import { useIsOnline } from '@/hooks/useIsOnline';

type RouteProps = RouteProp<BookingStackParamList, 'BookingDetail'>;

function InfoRow({ icon, label, value, COLORS }: { icon: string; label: string; value: string; COLORS: AppColors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginBottom: SPACING.sm }}>
      <Ionicons name={icon as any} size={18} color={COLORS.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textTertiary }}>{label}</Text>
        <Text style={{ fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary }}>{value}</Text>
      </View>
    </View>
  );
}

export default function BookingDetailScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<BookingStackParamList, 'BookingDetail'>>();
  const route = useRoute<RouteProps>();
  const { bookingId } = route.params;

  const { data: booking, isLoading } = useBookingDetail(bookingId);
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();
  const isOnline = useIsOnline();

  const handleCancel = () => {
    if (!isOnline) {
      Alert.alert('No Connection', "You're offline. Please reconnect and try again.");
      return;
    }
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'Keep Booking', style: 'cancel' },
      {
        text: 'Cancel Booking', style: 'destructive',
        onPress: () => {
          haptics.impact();
          cancelBooking(bookingId, { onSuccess: () => navigation.goBack() });
        },
      },
    ]);
  };

  if (isLoading || !booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader title="Booking Details" onBack={() => navigation.goBack()} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  const canCancel = booking.status === 'pending';
  const providerName =
    `${booking.provider?.firstName ?? ''} ${booking.provider?.lastName ?? ''}`.trim();
  const formattedDate = safeFormatDate(booking.scheduledDate, 'EEEE, d MMMM yyyy');
  const formattedAmount = `${booking.currency} ${new Intl.NumberFormat('en-MW').format(booking.totalAmount)}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title="Booking Details" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <StatusBadge status={booking.status} />
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary }}>
              #{booking.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </Card>

        <Card>
          <SectionHeader title="Service" variant="overline" />
          <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary }}>
            {booking.service?.title || 'Service unavailable'}
          </Text>
        </Card>

        <Card>
          <SectionHeader title="Provider" variant="overline" />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
            <Avatar
              uri={booking.provider?.avatar ?? null}
              name={providerName || 'Provider'}
              size="md"
              showVerifiedBadge={booking.provider?.isVerified ?? false}
            />
            <View>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.md, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary }}>
                {providerName || 'Provider details unavailable'}
              </Text>
              {booking.provider?.location ? (
                <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary }}>
                  {booking.provider.location}
                </Text>
              ) : null}
            </View>
          </View>
        </Card>

        <Card>
          <SectionHeader title="Schedule" variant="overline" />
          <InfoRow icon="calendar-outline" label="Date" value={formattedDate} COLORS={COLORS} />
          <InfoRow icon="time-outline" label="Time" value={booking.scheduledTime} COLORS={COLORS} />
          <InfoRow icon="hourglass-outline" label="Duration" value={`${booking.durationHours} hour${booking.durationHours !== 1 ? 's' : ''}`} COLORS={COLORS} />
          <InfoRow icon="location-outline" label="Address" value={booking.address} COLORS={COLORS} />
        </Card>

        <Card>
          <SectionHeader title="Payment" variant="overline" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: COLORS.textSecondary }}>Total</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.fontSize.lg }}>{formattedAmount}</Text>
          </View>
        </Card>

        {booking.notes ? (
          <Card>
            <SectionHeader title="Notes" variant="overline" />
            <Text style={{ color: COLORS.textSecondary, lineHeight: 22 }}>{booking.notes}</Text>
          </Card>
        ) : null}

        {canCancel && (
          <Button
            label="Cancel Booking"
            onPress={handleCancel}
            isLoading={isCancelling}
            variant="danger"
            fullWidth
            size="lg"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex:{flex:1},
  content: { padding: SPACING.screenPadding, gap: SPACING.md, paddingBottom: SPACING.xxl },
});
