import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  LayoutChangeEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Category } from "../../types/service.types";
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
  const { colors: COLORS } = useAppTheme();
  const styles = makeStyles(COLORS);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && {
          backgroundColor: category.color,
          borderColor: category.color,
        },
      ]}
      onPress={onPress}
      onLayout={onLayout}
      activeOpacity={0.75}
    >
      {isSelected && (
        <Ionicons name={category.icon as any} size={15} color={COLORS.white} />
      )}

      <Text
        style={[styles.label, isSelected && styles.selectedLabel]}
        numberOfLines={1}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const makeStyles = (COLORS: AppColors) =>
  StyleSheet.create({
    container: {
      height: 38,
      paddingHorizontal: 15,

      borderRadius: 19,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 7,

      backgroundColor: COLORS.surface,

      borderWidth: 1,
      borderColor: COLORS.divider,

      marginRight: 8,
    },

    label: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textSecondary,
    },

    selectedLabel: {
      color: COLORS.white,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
    },
  });
