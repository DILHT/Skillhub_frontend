import { ViewStyle } from "react-native";

type ShadowSize = "sm" | "md" | "lg" | "xl";

type ShadowStyle = ViewStyle & {
  shadowColor: string;
};

const NEUTRAL_SHADOW = "#64748B";
const DARK_SHADOW = "#000000";

export const useShadows = (
  isDark: boolean,
): Record<ShadowSize, ShadowStyle> & {
  tinted: Record<ShadowSize, ShadowStyle>;
} => {
  const buildShadow = (
    color: string,
    height: number,
    opacity: number,
    radius: number,
    elevation: number,
  ): ShadowStyle => ({
    shadowColor: color,
    shadowOffset: {
      width: 0,
      height,
    },
    shadowOpacity: Math.min(opacity, 0.35),
    shadowRadius: radius,
    elevation,
  });

  const neutral: Record<ShadowSize, ShadowStyle> = {
    sm: buildShadow(isDark ? DARK_SHADOW : NEUTRAL_SHADOW, 1, 0.08, 2, 1),

    md: buildShadow(isDark ? DARK_SHADOW : NEUTRAL_SHADOW, 2, 0.1, 5, 3),

    lg: buildShadow(isDark ? DARK_SHADOW : NEUTRAL_SHADOW, 4, 0.12, 10, 5),

    xl: buildShadow(isDark ? DARK_SHADOW : NEUTRAL_SHADOW, 6, 0.14, 16, 8),
  };

  const tinted: Record<ShadowSize, ShadowStyle> = {
    sm: buildShadow(DARK_SHADOW, 1, 0.1, 2, 1),

    md: buildShadow(DARK_SHADOW, 2, 0.14, 5, 3),

    lg: buildShadow(DARK_SHADOW, 4, 0.18, 9, 5),

    xl: buildShadow(DARK_SHADOW, 6, 0.22, 14, 8),
  };

  return {
    ...neutral,
    tinted,
  };
};

export default useShadows;
