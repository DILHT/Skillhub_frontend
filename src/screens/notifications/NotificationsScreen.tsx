// src/screens/notifications/NotificationsScreen.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "@/hooks/useNotifications";
import { useAppTheme } from "@/context/ThemeContext";
import { safeFormatTime } from "@/utils/dateHelpers";
import { groupNotificationsByDate } from "@/utils/notificationGrouping";
import { makeNotificationsStyles } from "@/styles/notifications.styles";
import useShadows from "@/constants/shadows";

const TYPE_ICONS: Record<string, string> = {
  booking_request: "calendar-outline",
  booking_accepted: "checkmark-circle-outline",
  booking_rejected: "close-circle-outline",
  payment: "wallet-outline",
  message: "chatbubble-outline",
  system: "information-circle-outline",
};

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeNotificationsStyles(COLORS);
  const shadows = useShadows(isDark);
  const shadowStyle = isDark ? shadows.tinted.sm : shadows.sm;

  const {
    notifications,
    isLoading,
    isError,
    refetch,
    isRefetching,
    markAsRead,
    markAllAsRead,
    unreadCount,
  } = useNotifications();

  const sections = useMemo(
    () => groupNotificationsByDate(notifications ?? []),
    [notifications]
  );

  const renderItem = ({ item }: { item: any }) => {
    const isUnread = item.status === "unread";
    const icon = TYPE_ICONS[item.type] ?? "notifications-outline";

    return (
      <TouchableOpacity
        style={[styles.item, isUnread && styles.itemUnread, shadowStyle]}
        onPress={() => isUnread && markAsRead(item.id)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${isUnread ? "Unread: " : ""}${item.title}. ${item.body}`}
        accessibilityHint={
          isUnread ? "Marks this notification as read" : undefined
        }
      >
        <View style={[styles.iconCircle, isUnread && styles.unreadIcon]}>
          <Ionicons name={icon as any} size={16} color={COLORS.primary} />
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemContentTop}>
            <Text
              style={[styles.itemTitle, isUnread && styles.itemTitleUnread]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.itemTime}>
              {safeFormatTime(item.createdAt, "h:mm a", "")}
            </Text>
          </View>
          <Text style={styles.itemBody} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
        {isUnread && <View style={styles.unreadDot} accessibilityLabel="Unread" />}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={() => markAllAsRead()}
            accessibilityRole="button"
            accessibilityLabel={`Mark all ${unreadCount} notifications as read`}
          >
            <Ionicons name="checkmark-done" size={16} color={COLORS.primary} />
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 30 }} />
        )}
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Ionicons
              name="cloud-offline-outline"
              size={48}
              color={COLORS.textTertiary}
            />
            <Text style={styles.emptyText}>Couldn't load notifications</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.center}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={COLORS.textTertiary}
            />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.notificationsStyles}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={COLORS.primary}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
