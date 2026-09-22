// src/screens/notifications/NotificationsScreen.tsx
import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/hooks/useNotifications';
import {
  ScreenHeader, LoadingState, ErrorState, EmptyState,
} from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { FLOATING_TAB_BAR_INSET } from '@/constants/layout';
import { TYPOGRAPHY } from '@/constants/typography';
import { safeFormatDate } from '@/utils/dateHelpers';

const TYPE_ICONS: Record<string, string> = {
  booking_request: 'calendar-outline',
  booking_accepted: 'checkmark-circle-outline',
  booking_rejected: 'close-circle-outline',
  payment: 'wallet-outline',
  message: 'chatbubble-outline',
  system: 'information-circle-outline',
};

export default function NotificationsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, 'Notifications'>>();
  const { colors: COLORS } = useAppTheme();
  const styles = makeStyles(COLORS);

  const {
    notifications, isLoading, isError, refetch, isRefetching,
    markAsRead, markAllAsRead, unreadCount,
  } = useNotifications();

  // Deliberately NOT a <ListRow>: this row stacks three lines of content,
  // tints its whole background when unread, and top-aligns its icon —
  // none of which ListRow expresses.
  const renderItem = ({ item }: { item: any }) => {
    const isUnread = item.status === 'unread';
    const icon = TYPE_ICONS[item.type] ?? 'notifications-outline';

    return (
      <TouchableOpacity
        style={[styles.item, isUnread && styles.itemUnread]}
        onPress={() => isUnread && markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.iconCircle}>
          <Ionicons name={icon as any} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemBody}>{item.body}</Text>
          <Text style={styles.itemTime}>
            {safeFormatDate(item.createdAt, 'd MMM, h:mm a', '')}
          </Text>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightElement={
          unreadCount > 0 ? (
            <TouchableOpacity
              onPress={() => markAllAsRead()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
            >
              <Text style={styles.markAll}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState
          title="Couldn't load notifications"
          onRetry={refetch}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="No notifications yet"
          message="Booking updates and wallet activity will show up here."
        />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: FLOATING_TAB_BAR_INSET }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    markAll: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.primary,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    item: {
      flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
      paddingHorizontal: SPACING.screenPadding, paddingVertical: SPACING.md,
      backgroundColor: COLORS.surface,
    },
    itemUnread: { backgroundColor: COLORS.primaryLight },
    iconCircle: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: COLORS.surface,
      alignItems: 'center', justifyContent: 'center',
    },
    itemContent: { flex: 1, gap: 2 },
    itemTitle: {
      // Intent: the row's heading.
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.textPrimary,
    },
    itemBody: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, lineHeight: 19 },
    itemTime: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textTertiary, marginTop: 2 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 6 },
  });
