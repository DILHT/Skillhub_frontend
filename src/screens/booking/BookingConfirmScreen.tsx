// src/screens/booking/BookingConfirmScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBookingDetail } from '@/hooks/useBooking';
import { Button } from '@/components/common';
import { StatusBadge } from '@/components/booking/StatusBadge';
import { BookingStackParamList } from '@/navigation/AppNavigator';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { safeFormatDate } from '@/utils/dateHelpers';

type RouteProps = RouteProp<BookingStackParamList, 'BookingConfirm'>;

export default function BookingConfirmScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { bookingId } = route.params;

  const { data: booking, isLoading } = useBookingDetail(bookingId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* SUCCESS ICON */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={48} color={COLORS.white} />
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your booking request has been sent to the provider. You will be notified when they accept.
        </Text>

        {/* BOOKING SUMMARY */}
        {booking && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{booking.service.title}</Text>

            <View style={styles.summaryRow}>
              <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.summaryText}>
                {booking.provider.firstName} {booking.provider.lastName}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.summaryText}>
                {safeFormatDate(booking.scheduledDate, 'EEEE, d MMMM yyyy')} at {booking.scheduledTime}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.summaryText}>{booking.address}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Ionicons name="wallet-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.summaryText}>
                {booking.currency} {new Intl.NumberFormat('en-MW').format(booking.totalAmount)} — held in escrow
              </Text>
            </View>

            <StatusBadge status={booking.status} />
          </View>
        )}

        {/* ACTIONS */}
        <View style={styles.actions}>
          <Button
            label="View My Bookings"
            onPress={() => {
              navigation.navigate('BookingsTab', { screen: 'BookingList' });
            }}
            fullWidth size="lg"
          />
          <Button
            label="Back to Home"
            onPress={() => navigation.navigate('HomeTab', { screen: 'Home' })}
            variant="outline"
            fullWidth size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1, alignItems: 'center', padding: SPACING.screenPadding,
    paddingTop: SPACING.xxxl, gap: SPACING.lg,
  },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl, fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary, textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  summaryCard: {
    width: '100%', backgroundColor: COLORS.surface,
    borderRadius: SPACING.borderRadius.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.divider, gap: SPACING.md,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg, fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  summaryText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, flex: 1 },
  actions: { width: '100%', gap: SPACING.md, marginTop: 'auto' },
});
