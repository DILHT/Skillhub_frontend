// src/components/common/StateView.tsx
// Reusable loading / error / empty states — replaces the copy-pasted
// versions scattered across every data screen.

import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';

export function LoadingState() {
  const { colors: COLORS } = useAppTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const { colors: COLORS } = useAppTheme();
  const s = makeStyles(COLORS);
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textTertiary} />
      <Text style={s.title}>{title ?? "Couldn't load"}</Text>
      <Text style={s.message}>
        {message ?? 'Something went wrong. Please check your connection and try again.'}
      </Text>
      {onRetry && (
        <TouchableOpacity style={s.retryBtn} onPress={onRetry}>
          <Text style={s.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors: COLORS } = useAppTheme();
  const s = makeStyles(COLORS);
  return (
    <View style={styles.center}>
      <Ionicons name={(icon ?? 'document-outline') as any} size={48} color={COLORS.textTertiary} />
      <Text style={s.title}>{title}</Text>
      {message && <Text style={s.message}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={s.retryBtn} onPress={onAction}>
          <Text style={s.retryText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
});

const makeStyles = (COLORS: AppColors) =>
  StyleSheet.create({
    title: { fontSize: 17, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },
    message: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
    retryBtn: {
      marginTop: 8, backgroundColor: COLORS.primary,
      paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999,
    },
    retryText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  });