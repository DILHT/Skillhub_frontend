// =============================================================================
// FILE 1: src/components/common/Avatar.tsx
// =============================================================================
//
// Displays a user photo, or falls back to initials if no photo exists.
// Used in ServiceCard (provider photo), ChatList, ProfileScreen.
// This is a classic reusable component — built once, used everywhere.

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { SmartImage } from '@/components/common/SmartImage';
import { AppColors } from '@/constants/theme';
import { TYPOGRAPHY } from '../../constants/typography';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;       // Image URL from backend
  name?: string;             // Full name — used to generate initials
  size?: AvatarSize;
  style?: ViewStyle;
  showVerifiedBadge?: boolean; // Show green checkmark for KYC-verified providers
}

// Extract initials from a name: "John Banda" → "JB", "Alice" → "A"
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)              // Maximum 2 initials
    .join('');
}

// Map size prop to pixel dimensions.
// Exported so bespoke avatar treatments (EditProfileScreen's camera-badge
// picker) can size their circle from the same scale instead of guessing.
export const AVATAR_SIZES: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 52,
  xl: 72,
};

const FONT_SIZES: Record<AvatarSize, number> = {
  xs: 9,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 26,
};

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = '',
  size = 'md',
  style,
  showVerifiedBadge = false,
}) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const avatarStyles = makeStyles(COLORS, isDark);

  const dimension = AVATAR_SIZES[size];
  const fontSize = FONT_SIZES[size];
  const initials = getInitials(name);

  // Badge should be about 28% of avatar size, minimum 12px
  const badgeSize = Math.max(12, Math.round(dimension * 0.28));

  return (
    <View style={[avatarStyles.container, style]}>
      {uri ? (
        // If we have a URL, show the image
        <SmartImage
          uri={uri}
          style={[
            avatarStyles.image,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
          fallbackIcon="person-outline"
        />
      ) : (
        // Fallback: coloured circle with initials
        // The colour is deterministic based on the name, so "John Banda"
        // always gets the same colour across the app
        <View
          style={[
            avatarStyles.initialsContainer,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: getAvatarColor(name),
            },
          ]}
        >
          <Text style={[avatarStyles.initials, { fontSize }]}>{initials}</Text>
        </View>
      )}

      {/* Verified badge — only shown for KYC-verified providers */}
      {showVerifiedBadge && (
        <View
          style={[
            avatarStyles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
};

// Generate a consistent background color from a name string.
// Same name always produces the same colour — important for UX consistency.
function getAvatarColor(name: string): string {
  const colors = [
    '#1B7A4E', '#2563EB', '#7C3AED', '#DC2626',
    '#D97706', '#0891B2', '#BE185D', '#059669',
  ];
  // Hash the name string to pick a color
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  container: {
    position: 'relative',  // Required for the absolute-positioned badge
  },
  image: {
    backgroundColor: COLORS.border, // Shown while image loads
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  badge: {
    position: 'absolute',
    backgroundColor: COLORS.success, // Green = verified
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
});
