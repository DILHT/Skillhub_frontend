// =============================================================================
// FILE 4: src/components/service/CategoryChip.tsx
// =============================================================================
//
// A tappable pill for filtering by category.
// Shown in a horizontal ScrollView above the service list.
 
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../../types/service.types';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { COLORS } from '../../constants/colors';
 
interface CategoryChipProps {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
}
 
export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        chipStyles.container,
        isSelected && chipStyles.selectedContainer,
        // When selected, use the category's own color as background
        isSelected && { backgroundColor: category.color + '20' }, // 20 = 12% opacity hex
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={category.icon as any}
        size={16}
        color={isSelected ? category.color : COLORS.textSecondary}
      />
      <Text
        style={[
          chipStyles.label,
          isSelected && { color: category.color },
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};
 
const chipStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.borderRadius.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  selectedContainer: {
    borderColor: 'transparent',
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textSecondary,
  },
});