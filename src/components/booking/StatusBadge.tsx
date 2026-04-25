// src/components/booking/StatusBadge.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookingStatus } from '../../types/booking.types';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

interface StatusBadgeProps {
  status: BookingStatus;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  pending:     { label: 'Pending',     bg: '#FEF3C7', text: '#92400E' },
  accepted:    { label: 'Accepted',    bg: '#DBEAFE', text: '#1E40AF' },
  in_progress: { label: 'In Progress', bg: '#EDE9FE', text: '#5B21B6' },
  completed:   { label: 'Completed',   bg: '#D1FAE5', text: '#065F46' },
  cancelled:   { label: 'Cancelled',   bg: '#F3F4F6', text: '#6B7280' },
  rejected:    { label: 'Rejected',    bg: '#FEE2E2', text: '#991B1B' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: SPACING.borderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
});