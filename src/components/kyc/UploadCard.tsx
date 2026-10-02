import React, { memo, useCallback } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { UploadSlot } from "@/constants/kyc";
import { makeUploadStyles } from "@/styles/auth/kyc.styles";
import { useThemedStyles } from "./useThemedStyles";

interface Props {
  slot: UploadSlot;
  onUpload: (key: string) => void;
  onRemove: (key: string) => void;
}

function UploadCard({ slot, onUpload, onRemove }: Props) {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemedStyles(makeUploadStyles);

  const handleUpload = useCallback(
    () => onUpload(slot.key),
    [onUpload, slot.key],
  );
  const handleRemove = useCallback(
    () => onRemove(slot.key),
    [onRemove, slot.key],
  );

  if (slot.uri) {
    return (
      <View style={[styles.card, styles.cardFilled]}>
        <Image
          source={{ uri: slot.uri }}
          style={styles.thumb}
          resizeMode="cover"
        />
        <View style={styles.copy}>
          <Text style={styles.label}>{slot.label}</Text>
          <View style={styles.statusRow}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={COLORS.successText}
            />
            <Text style={styles.statusText}>Uploaded</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleUpload}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Replace ${slot.label}`}
            >
              <Text style={styles.actionText}>Replace</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRemove}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${slot.label}`}
            >
              <Text style={styles.actionTextMuted}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, styles.cardEmpty]}
      onPress={handleUpload}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Upload ${slot.label}${slot.required ? ", required" : ", optional"}`}
    >
      <View style={styles.uploadIcon}>
        <Ionicons
          name="cloud-upload-outline"
          size={22}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.label}>{slot.label}</Text>
          <View style={[styles.badge, !slot.required && styles.badgeOptional]}>
            <Text
              style={[
                styles.badgeText,
                !slot.required && styles.badgeTextOptional,
              ]}
            >
              {slot.required ? "Required" : "Optional"}
            </Text>
          </View>
        </View>
        <Text style={styles.desc}>{slot.description}</Text>
      </View>
      <View style={styles.addIcon}>
        <Ionicons name="add" size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
}

export default memo(UploadCard);
