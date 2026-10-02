import { useMemo } from "react";
import { useAppTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/theme";

export function useThemedStyles<T>(factory: (c: AppColors, isDark: boolean) => T): T {
  const { colors, isDark } = useAppTheme();
  return useMemo(() => factory(colors, isDark), [factory, colors, isDark]);
}