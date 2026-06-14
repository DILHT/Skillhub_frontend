// PLACE AT: src/screens/booking/BookingDetailScreen.tsx

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBookingDetail, useCancelBooking } from '@/hooks/useBooking';
import { StatusBadge } from '@/components/booking/StatusBadge';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common';
import { BookingStackParamList } from '@/navigation/AppNavigator';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { safeFormatDate } from '@/utils/dateHelpers';

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
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { bookingId } = route.params;

  const { data: booking, isLoading } = useBookingDetail(bookingId);
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'Keep Booking', style: 'cancel' },
      {
        text: 'Cancel Booking', style: 'destructive',
        onPress: () => cancelBooking(bookingId, { onSuccess: () => navigation.goBack() }),
      },
    ]);
  };

  if (isLoading || !booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 30 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: COLORS.textSecondary }}>Loading booking...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canCancel = booking.status === 'pending';
  const formattedDate = safeFormatDate(booking.scheduledDate, 'EEEE, d MMMM yyyy');
  const formattedAmount = `${booking.currency} ${new Intl.NumberFormat('en-MW').format(booking.totalAmount)}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <StatusBadge status={booking.status} />
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary }}>
              #{booking.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service</Text>
          <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary }}>
            {booking.service.title}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Provider</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
            <Avatar
              uri={booking.provider.avatar}
              name={`${booking.provider.firstName} ${booking.provider.lastName}`}
              size="md"
              showVerifiedBadge={booking.provider.isVerified}
            />
            <View>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.md, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary }}>
                {booking.provider.firstName} {booking.provider.lastName}
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary }}>
                {booking.provider.location}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Schedule</Text>
          <InfoRow icon="calendar-outline" label="Date" value={formattedDate} COLORS={COLORS} />
          <InfoRow icon="time-outline" label="Time" value={booking.scheduledTime} COLORS={COLORS} />
          <InfoRow icon="hourglass-outline" label="Duration" value={`${booking.durationHours} hour${booking.durationHours !== 1 ? 's' : ''}`} COLORS={COLORS} />
          <InfoRow icon="location-outline" label="Address" value={booking.address} COLORS={COLORS} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: COLORS.textSecondary }}>Total</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.fontSize.lg }}>{formattedAmount}</Text>
          </View>
        </View>

        {booking.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={{ color: COLORS.textSecondary, lineHeight: 22 }}>{booking.notes}</Text>
          </View>
        ) : null}

        {canCancel && (
          <Button label="Cancel Booking" onPress={handleCancel} isLoading={isCancelling} variant="danger" fullWidth />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex:{flex:1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap:SPACING.sectionGap,
    padding: SPACING.screenPadding,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider, backgroundColor: COLORS.surface,
  },
  headerTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  content: { padding: SPACING.screenPadding, gap: SPACING.md, paddingBottom: SPACING.xxl },
  card: {
    backgroundColor: COLORS.surface, borderRadius: SPACING.borderRadius.lg,
    padding: SPACING.lg, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.divider,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textTertiary,
    fontFamily: TYPOGRAPHY.fontFamily.medium, textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
});
