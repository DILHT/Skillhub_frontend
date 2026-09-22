// src/components/booking/StatusBadge.tsx
// Booking-status wrapper around the shared <Badge>. Keeps the status map
// and the unknown-status fallback; the colours now come from theme tokens
// via Badge's tone scale instead of the inline hex this used to carry.

import React from 'react';
import { BookingStatus } from '../../types/booking.types';
import { Badge, BadgeTone } from '@/components/common/Badge';

interface StatusBadgeProps {
  // Widened to string: the backend can introduce statuses the UI has no case
  // for yet (NO_SHOW, EXPIRED, …), and an unknown value must not crash.
  status: BookingStatus | string;
}

type StatusConfig = { label: string; tone: BadgeTone };

const STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  pending:     { label: 'Pending',     tone: 'warning' },
  accepted:    { label: 'Accepted',    tone: 'info' },
  in_progress: { label: 'In Progress', tone: 'accent' },
  completed:   { label: 'Completed',   tone: 'success' },
  cancelled:   { label: 'Cancelled',   tone: 'neutral' },
  rejected:    { label: 'Rejected',    tone: 'danger' },
  declined:    { label: 'Declined',    tone: 'danger' },
  disputed:    { label: 'Disputed',    tone: 'warning' },
};

// Used for any status the backend sends that the map above has no case for.
// Renders the humanised raw value in neutral grey rather than crashing.
const FALLBACK_CONFIG: StatusConfig = { label: 'Unknown', tone: 'neutral' };

// Turns 'in_progress' / 'IN_PROGRESS' into 'In Progress' for unmapped values.
function humanizeStatus(status: string): string {
  const cleaned = status.replace(/[_-]+/g, ' ').trim();
  if (!cleaned) return FALLBACK_CONFIG.label;
  return cleaned
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const known = STATUS_CONFIG[status as BookingStatus] as StatusConfig | undefined;
  const cfg = known ?? {
    ...FALLBACK_CONFIG,
    label: humanizeStatus(String(status ?? '')),
  };

  return <Badge label={cfg.label} tone={cfg.tone} size="md" />;
};
