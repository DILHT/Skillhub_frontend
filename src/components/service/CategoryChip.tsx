// =============================================================================
// FILE 4: src/components/service/CategoryChip.tsx
// =============================================================================
//
// A tappable pill for filtering by category.
// Shown in a horizontal ScrollView above the service list.

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  LayoutChangeEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../../types/service.types";
import { SPACING } from "../../constants/spacing";
import { TYPOGRAPHY } from "../../constants/typography";
import { useAppTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/theme";

interface CategoryChipProps {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  isSelected,
  onPress,
  onLayout,
}) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const chipStyles = makeStyles(COLORS, isDark);

  return (
    <TouchableOpacity
      style={[
        chipStyles.container,
        isSelected && chipStyles.selectedContainer,
        // When selected, use the category's own color as background
        isSelected && { borderColor: category.color },
      ]}
      onPress={onPress}
      onLayout={onLayout}
      activeOpacity={0.7}
    >
      <Ionicons
        name={category.icon as any}
        size={16}
        color={isSelected ? category.color : COLORS.textSecondary}
      />
      <Text style={[chipStyles.label, isSelected && { color: category.color }]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: "center",
      gap: SPACING.xs,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: SPACING.borderRadius.full,
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.surface,
    },
    selectedContainer: {
      backgroundColor: COLORS.primaryLight,
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textSecondary,
    },
  });
