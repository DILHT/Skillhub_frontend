// src/screens/notifications/NotificationsScreen.tsx
import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/hooks/useNotifications';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
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
  const navigation = useNavigation<any>();
  const { colors: COLORS } = useAppTheme();
  const styles = makeStyles(COLORS);

  const {
    notifications, isLoading, isError, refetch, isRefetching,
    markAsRead, markAllAsRead, unreadCount,
  } = useNotifications();

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={() => markAllAsRead()}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 30 }} />
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textTertiary} />
          <Text style={styles.emptyText}>Couldn't load notifications</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={48} color={COLORS.textTertiary} />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
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
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: COLORS.divider,
      backgroundColor: COLORS.surface,
    },
    headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
    markAll: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
    emptyText: { fontSize: 15, color: COLORS.textSecondary },
    retryButton: { marginTop: 8, backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999 },
    retryText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
    item: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
      paddingHorizontal: 20, paddingVertical: 14,
      backgroundColor: COLORS.surface,
    },
    itemUnread: { backgroundColor: COLORS.primaryLight },
    iconCircle: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: COLORS.background,
      alignItems: 'center', justifyContent: 'center',
    },
    itemContent: { flex: 1, gap: 2 },
    itemTitle: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
    itemBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 19 },
    itemTime: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 6 },
  });