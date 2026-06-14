// src/components/booking/StatusBadge.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookingStatus } from '../../types/booking.types';
import { useAppTheme } from '@/context/ThemeContext';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';

interface StatusBadgeProps {
  status: BookingStatus;
}

type StatusConfig = { label: string; lightBg: string; lightText: string; darkBg: string; darkText: string };

const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  pending:     { label: 'Pending',     lightBg: '#FEF3C7', lightText: '#92400E', darkBg: '#1C1400', darkText: '#F59E0B' },
  accepted:    { label: 'Accepted',    lightBg: '#DBEAFE', lightText: '#1E40AF', darkBg: '#0C1A2E', darkText: '#3B82F6' },
  in_progress: { label: 'In Progress', lightBg: '#EDE9FE', lightText: '#5B21B6', darkBg: '#130D26', darkText: '#A78BFA' },
  completed:   { label: 'Completed',   lightBg: '#D1FAE5', lightText: '#065F46', darkBg: '#052E16', darkText: '#22C55E' },
  cancelled:   { label: 'Cancelled',   lightBg: '#F3F4F6', lightText: '#6B7280', darkBg: '#1F2937', darkText: '#9CA3AF' },
  rejected:    { label: 'Rejected',    lightBg: '#FEE2E2', lightText: '#991B1B', darkBg: '#1F0000', darkText: '#EF4444' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { isDark } = useAppTheme();
  const cfg = STATUS_CONFIG[status];
  const bg = isDark ? cfg.darkBg : cfg.lightBg;
  const text = isDark ? cfg.darkText : cfg.lightText;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{cfg.label}</Text>
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
