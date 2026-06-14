// src/components/booking/BookingCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../../types/booking.types';
import { StatusBadge } from './StatusBadge';
import { SmartImage } from '@/components/common/SmartImage';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { format, parseISO } from 'date-fns';

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
}

function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${new Intl.NumberFormat('en-MW').format(amount)}`;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);

  const formattedDate = format(parseISO(booking.scheduledDate), 'EEE, d MMM yyyy');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Service image + title row */}
      <View style={styles.topRow}>
        <SmartImage
          uri={booking.service.images?.[0]}
          style={styles.image}
          fallbackIcon="briefcase-outline"
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{booking.service.title}</Text>
          <Text style={styles.provider}>
            {booking.provider.firstName} {booking.provider.lastName}
          </Text>
          <StatusBadge status={booking.status} />
        </View>
      </View>

      {/* Date / time / amount row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{formattedDate}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{booking.scheduledTime}</Text>
        </View>
        <Text style={styles.amount}>
          {formatCurrency(booking.totalAmount, booking.currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.borderRadius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: SPACING.borderRadius.md,
    backgroundColor: COLORS.border,
  },
  info: {
    flex: 1,
    gap: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  provider: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  amount: {
    marginLeft: 'auto',
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.primary,
  },
});
