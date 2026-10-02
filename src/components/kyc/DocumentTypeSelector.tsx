import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { DOCUMENT_TYPES, DocumentType } from "@/constants/kyc";
import { makeDocTypeStyles } from "@/styles/auth/kyc.styles";
import { useThemedStyles } from "./useThemedStyles";

interface Props {
  selected: DocumentType;
  onSelect: (doc: DocumentType) => void;
}

function DocumentTypeSelector({ selected, onSelect }: Props) {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemedStyles(makeDocTypeStyles);

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {DOCUMENT_TYPES.map((doc) => {
        const active = selected === doc.value;
        return (
          <TouchableOpacity
            key={doc.value}
            style={[styles.card, active && styles.cardActive]}
            onPress={() => onSelect(doc.value)}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={doc.label}
          >
            <Ionicons
              name={doc.icon as any}
              size={24}
              color={active ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[styles.label, active && styles.labelActive]}
              numberOfLines={1}
            >
              {doc.label}
            </Text>
            {active && (
              <View style={styles.check}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.primary}
                />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default memo(DocumentTypeSelector);
