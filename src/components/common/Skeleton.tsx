// =============================================================================
// FILE 2: src/components/common/Skeleton.tsx
// =============================================================================
//
// A "skeleton screen" shows the SHAPE of content while it loads.
// Much better UX than a spinner — users understand what's coming.
// Used as placeholders inside ServiceCard, HomeScreen sections.
//
// HOW ANIMATION WORKS:
//   We use Animated.Value to animate opacity between 0.4 and 1.0.
//   This creates the "shimmer" effect. The animation loops forever
//   until the real content replaces the skeleton.
 
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
 
interface SkeletonProps {
  width?: number | `${number}%` | 'auto';
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}
 
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = SPACING.borderRadius.sm,
  style,
}) => {
  // Animated.Value is like useState but for animations.
  // It can be interpolated to drive CSS-like properties.
  const opacity = useRef(new Animated.Value(0.4)).current;
 
  useEffect(() => {
    // Animated.loop() repeats the animation sequence forever
    const animation = Animated.loop(
      // Animated.sequence() runs animations one after another
      Animated.sequence([
        // Fade to full opacity
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true, // ALWAYS true for opacity/transform — uses GPU
        }),
        // Fade back to dim
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
 
    // Stop animation when component unmounts — prevents memory leaks
    return () => animation.stop();
  }, [opacity]);
 
  return (
    <Animated.View
      style={[
        skeletonStyles.base,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};
 
// A pre-composed ServiceCard skeleton — shows the exact card shape while loading
export const ServiceCardSkeleton: React.FC = () => (
  <View style={skeletonStyles.card}>
    <Skeleton height={160} borderRadius={SPACING.borderRadius.md} />
    <View style={skeletonStyles.cardBody}>
      <View style={skeletonStyles.row}>
        <Skeleton width={32} height={32} borderRadius={16} />
        <Skeleton width="60%" height={14} />
      </View>
      <Skeleton width="90%" height={16} />
      <Skeleton width="70%" height={14} />
      <View style={skeletonStyles.row}>
        <Skeleton width="30%" height={14} />
        <Skeleton width="25%" height={14} />
      </View>
    </View>
  </View>
);
 
const skeletonStyles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.border,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  cardBody: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
});