// src/components/common/Card.tsx
// The single elevation model for the app. Wraps getCardStyle(), which
// already handles the dark-border vs light-shadow split correctly — this
// just makes it the path of least resistance instead of something 16
// screens hand-rolled.

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors, getCardStyle } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { PressableCard } from './PressableCard';

export type CardPadding = 'none' | 'sm' | 'md';

export interface CardProps {
  children: React.ReactNode;
  /** none = rows supply their own padding (use with `divided`). Default md. */
  padding?: CardPadding;
  gap?: number;
  /** Adds the press-scale animation from PressableCard. */
  onPress?: () => void;
  /** Draws hairline dividers between children — for stacks of ListRow. */
  divided?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  gap,
  onPress,
  divided = false,
  style,
}) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);

  const containerStyle: ViewStyle[] = [
    styles.card,
    styles[`padding_${padding}`],
    gap !== undefined ? { gap } : null,
    ...(Array.isArray(style) ? style : [style]),
  ].filter(Boolean) as ViewStyle[];

  const content = divided ? withDividers(children, styles.divider) : children;

  if (onPress) {
    return (
      <PressableCard onPress={onPress} style={containerStyle}>
        {content}
      </PressableCard>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

// Inserts a divider between each rendered child. Uses the child's own key
// where it has one so the list stays stable across re-renders.
function withDividers(children: React.ReactNode, dividerStyle: ViewStyle) {
  const items = React.Children.toArray(children).filter(Boolean);
  return items.map((child, index) => (
    <React.Fragment key={(child as React.ReactElement)?.key ?? index}>
      {child}
      {index < items.length - 1 && <View style={dividerStyle} />}
    </React.Fragment>
  ));
}

const makeStyles = (COLORS: AppColors, isDark: boolean) =>
  StyleSheet.create({
    card: {
      ...getCardStyle(isDark),
      borderRadius: SPACING.borderRadius.lg,
    },
    padding_none: { padding: 0 },
    padding_sm: { padding: SPACING.sm },
    padding_md: { padding: SPACING.cardPadding },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: COLORS.divider,
    },
  });
