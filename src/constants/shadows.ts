import { ViewStyle } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

type ShadowSize = "sm" | "md" | "lg" | "xl";
type ShadowStyle = ViewStyle & { shadowColor: string };

const NEUTRAL_SHADOW = "#E5E7EB"; // dark slate — actually functions as a shadow color

export const useShadows = (isDark: boolean): Record<ShadowSize, ShadowStyle> & {
  tinted: Record<ShadowSize, ShadowStyle>;
} => {

  const baseOpacity = isDark ? 1.4 : 1;

  const buildShadow = (
    color: string,
    height: number,
    opacity: number,
    radius: number,
    elevation: number,
  ): ShadowStyle => ({
    shadowColor: color,
    shadowOffset: { width: 0, height },
    shadowOpacity: Math.min(opacity * baseOpacity, 0.6),
    shadowRadius: radius,
    elevation,
  });

  const neutral: Record<ShadowSize, ShadowStyle> = {
    sm: buildShadow(NEUTRAL_SHADOW, 1, 0.06, 2, 1),
    md: buildShadow(NEUTRAL_SHADOW, 3, 0.1, 6, 4),
    lg: buildShadow(NEUTRAL_SHADOW, 8, 0.14, 16, 8),
    xl: buildShadow(NEUTRAL_SHADOW, 16, 0.18, 28, 14),
  };

  // Colored glow, not a heavier neutral shadow — smaller offsets/radii than
  // neutral on purpose, since a tinted shadow reads "bigger" at the same
  // numbers due to contrast. Use on CTAs/active cards only, not everywhere.
  const tinted: Record<ShadowSize, ShadowStyle> = {
    sm: buildShadow("#000000", 1, 0.08, 2, 1),
    md: buildShadow("#000000", 2, 0.12, 5, 3),
    lg: buildShadow("#000000", 5, 0.16, 10, 6),
    xl: buildShadow("#000000", 8, 0.2, 16, 10),
  };

  return { ...neutral, tinted };
};

export default useShadows;
