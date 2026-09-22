// src/components/navigation/FloatingTabBar.tsx
//
// Label treatment: label text is always in the layout (opacity 0 for inactive,
// 1 for active) so tab heights never shift when switching tabs.

import React, { useState, useEffect, useRef } from 'react';
import {
  View, TouchableOpacity, Animated,
  StyleSheet, LayoutChangeEvent, Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { haptics } from '@/utils/haptics';
import { FLOATING_TAB_BAR_HEIGHT } from '@/constants/layout';

// Horizontal inset of the pill within each tab slot
const PILL_H_INSET = SPACING.xs; // 4 px each side

export default function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);

  const activeIndex = state.index;
  const tabCount = state.routes.length;
  const tabWidth = barWidth > 0 ? barWidth / tabCount : 0;

  // Pill slide — initialised to 0; snapped to the correct position without
  // animation on first layout, then spring-animated on subsequent tab changes.
  const pillX = useRef(new Animated.Value(0)).current;
  const hasPillInit = useRef(false);

  // One scale + label-opacity animation per tab, created once on mount.
  const [anims] = useState(() =>
    state.routes.map((_, i) => ({
      scale: new Animated.Value(i === activeIndex ? 1.1 : 1.0),
      labelOpacity: new Animated.Value(i === activeIndex ? 1.0 : 0.0),
    }))
  );

  // Pill position: snap on first layout, spring on subsequent changes.
  useEffect(() => {
    if (tabWidth === 0) return;
    const target = activeIndex * tabWidth + PILL_H_INSET;
    if (!hasPillInit.current) {
      pillX.setValue(target);
      hasPillInit.current = true;
      return;
    }
    Animated.spring(pillX, {
      toValue: target,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    }).start();
  }, [activeIndex, tabWidth]);

  // Per-tab icon scale + label fade.
  useEffect(() => {
    anims.forEach(({ scale, labelOpacity }, i) => {
      const active = i === activeIndex;
      Animated.parallel([
        Animated.spring(scale, {
          toValue: active ? 1.1 : 1.0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 200,
        }),
        Animated.timing(labelOpacity, {
          toValue: active ? 1.0 : 0.0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [activeIndex]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      style={[styles.container, { bottom: insets.bottom + SPACING.md }]}
      onLayout={handleLayout}
    >
      {/* Animated pill behind the active tab */}
      {tabWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            {
              width: tabWidth - PILL_H_INSET * 2,
              transform: [{ translateX: pillX }],
            },
          ]}
        />
      )}

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = activeIndex === index;
        const color = isFocused ? COLORS.primary : COLORS.textTertiary;

        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : route.name.replace('Tab', '');

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            haptics.impact();
            navigation.navigate(route.name as never);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
          >
            <Animated.View
              style={[
                styles.tabInner,
                { transform: [{ scale: anims[index].scale }] },
              ]}
            >
              {options.tabBarIcon?.({ focused: isFocused, color, size: 22 })}
              <Animated.Text
                style={[
                  styles.label,
                  { color, opacity: anims[index].labelOpacity },
                ]}
                numberOfLines={1}
              >
                {label}
              </Animated.Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const makeStyles = (COLORS: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: SPACING.md,
      right: SPACING.md,
      height: FLOATING_TAB_BAR_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.surface,
      borderRadius: 28,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0 : 0.12,
          shadowRadius: 20,
        },
        android: { elevation: 8 },
      }),
      ...(isDark ? { borderWidth: 1, borderColor: COLORS.border } : {}),
    },
    pill: {
      position: 'absolute',
      top: SPACING.xs,
      bottom: SPACING.xs,
      borderRadius: 22,
      backgroundColor: COLORS.primaryLight,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'stretch',
    },
    tabInner: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      lineHeight: 14,
    },
  });
