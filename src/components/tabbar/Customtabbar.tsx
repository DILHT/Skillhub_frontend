// src/navigation/CustomTabBar.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  LayoutChangeEvent,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/context/ThemeContext";
import { TYPOGRAPHY } from "@/constants/typography";

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

const TABS: TabConfig[] = [
  { name: "HomeTab", label: "Home", icon: "home-outline", iconFocused: "home" },
  {
    name: "BookingsTab",
    label: "Bookings",
    icon: "calendar-outline",
    iconFocused: "calendar",
  },
  {
    name: "ChatTab",
    label: "Chat",
    icon: "chatbubbles-outline",
    iconFocused: "chatbubbles",
  },
  {
    name: "WalletTab",
    label: "Wallet",
    icon: "wallet-outline",
    iconFocused: "wallet",
  },
  {
    name: "ProfileTab",
    label: "Profile",
    icon: "person-outline",
    iconFocused: "person",
  },
];

function TabButton({
  tab,
  focused,
  onPress,
  onLayout,
  color,
  activeColor,
}: {
  tab: TabConfig;
  focused: boolean;
  onPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
  color: string;
  activeColor: string;
}) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      speed: 18,
      bounciness: 9,
    }).start();
  }, [focused, scale]);

  const iconScale = scale.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });
  const iconTranslateY = scale.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });
  const labelOpacity = scale.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  });
  const labelTranslateY = scale.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 0],
  });

  return (
    <Pressable
      onLayout={onLayout}
      onPress={onPress}
      hitSlop={8}
      android_ripple={{ color: "transparent" }}
      style={styles.tabButton}
    >
      <Animated.View
        style={{
          transform: [{ scale: iconScale }, { translateY: iconTranslateY }],
        }}
      >
        <Ionicons
          name={focused ? tab.iconFocused : tab.icon}
          size={22}
          color={focused ? activeColor : color}
        />
      </Animated.View>
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            color: activeColor,
            opacity: labelOpacity,
            transform: [{ translateY: labelTranslateY }],
          },
        ]}
      >
        {tab.label}
      </Animated.Text>
    </Pressable>
  );
}

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors: COLORS } = useAppTheme();
  const insets = useSafeAreaInsets();

  const PILL_WIDTH = 36;
  const layouts = useRef<Record<number, { x: number; width: number }>>({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const hasPositioned = useRef(false);

  const animateIndicatorTo = (index: number) => {
    const layout = layouts.current[index];
    if (!layout) return;
    const targetX = layout.x + layout.width / 2 - PILL_WIDTH / 2;
    Animated.spring(indicatorX, {
      toValue: targetX,
      useNativeDriver: true,
      speed: 16,
      bounciness: 6,
    }).start();
  };

  useEffect(() => {
    animateIndicatorTo(state.index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index]);

  const handleLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    layouts.current[index] = { x, width };
    if (index === state.index && !hasPositioned.current) {
      hasPositioned.current = true;
      indicatorX.setValue(x + width / 2 - PILL_WIDTH / 2);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: COLORS.tabBar,
          borderTopColor: COLORS.tabBarBorder,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 6),
        },
      ]}
    >
      {/* <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            backgroundColor: COLORS.primary,
            width: PILL_WIDTH,
            transform: [{ translateX: indicatorX }],
          },
        ]}
      /> */}
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tab = TABS.find((t) => t.name === route.name) ?? TABS[index];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabButton
            key={route.key}
            tab={tab}
            focused={focused}
            onPress={onPress}
            onLayout={handleLayout(index)}
            color={COLORS.textTertiary}
            activeColor={COLORS.primary}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 4,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    letterSpacing: 0.1,
  },
  indicator: {
    position: "absolute",
    top: 2,
    height: 3,
    borderRadius: 999,
  },
});
