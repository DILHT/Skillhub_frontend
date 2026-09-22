// src/screens/booking/BookingConfirmScreen.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { TabScreenNavigationProp } from '@/navigation/AppNavigator';
import { haptics } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { useBookingDetail } from '@/hooks/useBooking';
import { Button, Card } from '@/components/common';
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
  const navigation = useNavigation<TabScreenNavigationProp<BookingStackParamList, 'BookingConfirm'>>();
  const route = useRoute<RouteProps>();
  const { bookingId } = route.params;

  const { data: booking } = useBookingDetail(bookingId);

  const providerName =
    `${booking?.provider?.firstName ?? ''} ${booking?.provider?.lastName ?? ''}`.trim();

  const iconScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    haptics.success();
    Animated.sequence([
      Animated.spring(iconScale, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 14,
        speed: 10,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* SUCCESS ICON — springs in */}
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: iconScale }] }]}>
          <Ionicons name="checkmark" size={48} color={COLORS.white} />
        </Animated.View>

        {/* Everything below the icon fades up after the spring */}
        <Animated.View style={[styles.contentFade, { opacity: contentOpacity }]}>
          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your booking request has been sent to the provider. You will be notified when they accept.
          </Text>

          {booking && (
            <Card gap={SPACING.sm}>
              <Text style={styles.summaryTitle}>
                {booking.service?.title || 'Service'}
              </Text>

              {providerName ? (
                <View style={styles.summaryRow}>
                  <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.summaryText}>{providerName}</Text>
                </View>
              ) : null}

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
            </Card>
          )}

          <View style={styles.actions}>
            <Button
              label="View My Bookings"
              onPress={() => navigation.navigate('BookingsTab', { screen: 'BookingList' })}
              fullWidth size="lg"
            />
            <Button
              label="Back to Home"
              onPress={() => navigation.navigate('HomeTab', { screen: 'Home' })}
              variant="outline"
              fullWidth size="lg"
            />
          </View>
        </Animated.View>

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
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg, fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  summaryText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, flex: 1 },
  contentFade: { flex: 1, width: '100%', gap: SPACING.lg },
  actions: { gap: SPACING.md, marginTop: 'auto' },
});
