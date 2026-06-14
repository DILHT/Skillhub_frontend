// =============================================================================
// FILE 3: src/components/service/RatingStars.tsx
// =============================================================================
//
// Renders 1-5 stars. The "partial star" logic handles ratings like 4.3.
// Used in ServiceCard, ProviderProfile, ReviewItem.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { TYPOGRAPHY } from '../../constants/typography';

interface RatingStarsProps {
  rating: number;           // e.g. 4.3
  reviewCount?: number;     // e.g. 127 — shown as "(127)"
  size?: number;            // Star size in pixels, default 14
  showCount?: boolean;
  compact?: boolean;        // If true: just shows "4.3 ★" inline
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewCount,
  size = 14,
  showCount = true,
  compact = false,
}) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const ratingStyles = makeStyles(COLORS, isDark);

  if (compact) {
    return (
      <View style={ratingStyles.compact}>
        <Ionicons name="star" size={size} color={COLORS.warning} />
        <Text style={[ratingStyles.compactText, { fontSize: size }]}>
          {rating.toFixed(1)}
          {showCount && reviewCount !== undefined ? ` (${reviewCount})` : ''}
        </Text>
      </View>
    );
  }

  // Full star display: 5 icons, each either full, half, or empty
  return (
    <View style={ratingStyles.row}>
      <View style={ratingStyles.stars}>
        {[1, 2, 3, 4, 5].map((star) => {
          // Determine which icon to show for this star position
          let iconName: 'star' | 'star-half' | 'star-outline';
          if (rating >= star) {
            iconName = 'star';            // Full star
          } else if (rating >= star - 0.5) {
            iconName = 'star-half';       // Half star
          } else {
            iconName = 'star-outline';    // Empty star
          }
          return (
            <Ionicons key={star} name={iconName} size={size} color={COLORS.warning} />
          );
        })}
      </View>
      {showCount && reviewCount !== undefined && (
        <Text style={ratingStyles.count}>({reviewCount})</Text>
      )}
    </View>
  );
};

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  count: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  compactText: {
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
});
