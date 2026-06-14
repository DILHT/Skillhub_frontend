import React, { useState } from 'react';
import { Image, View, StyleSheet, StyleProp, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';

interface SmartImageProps {
  uri: string | null | undefined;
  style?: StyleProp<ImageStyle>;
  fallbackIcon?: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

export function SmartImage({
  uri,
  style,
  fallbackIcon = 'image-outline',
  resizeMode = 'cover',
}: SmartImageProps) {
  const { colors: COLORS } = useAppTheme();
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <View style={[styles.fallback, { backgroundColor: COLORS.inputBackground }, style as any]}>
        <Ionicons name={fallbackIcon as any} size={24} color={COLORS.textTertiary} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
