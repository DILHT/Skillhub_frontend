// src/screens/chat/ChatListScreen.tsx

import React from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useConversations } from '@/hooks/useChat';
import { ConversationItem } from '@/components/chat/ConversationItem';
import { Skeleton } from '@/components/common/Skeleton';
import { Conversation } from '@/types/chat.types';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { useState } from 'react';

export default function ChatListScreen() {
  const navigation = useNavigation<any>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { conversations, isLoading, refetch } = useConversations();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {/* Unread count badge on header */}
        {conversations.some((c) => c.unreadCount > 0) && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={isLoading ? ([1, 2, 3, 4] as any[]) : conversations}
        keyExtractor={(item) =>
          isLoading ? String(item) : (item as Conversation).id
        }
        renderItem={({ item }) =>
          isLoading ? (
            <View style={styles.skeletonRow}>
              <Skeleton width={44} height={44} borderRadius={22} />
              <View style={styles.skeletonInfo}>
                <Skeleton width="50%" height={14} />
                <Skeleton width="80%" height={12} />
              </View>
            </View>
          ) : (
            <ConversationItem
              conversation={item as Conversation}
              onPress={() =>
                navigation.navigate('ChatRoom', {
                  conversationId: (item as Conversation).id,
                  recipientName: (item as Conversation).participantName,
                })
              }
            />
          )
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                Your conversations with providers will appear here
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.screenPadding,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  headerBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: SPACING.borderRadius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  headerBadgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  skeletonInfo: { flex: 1, gap: SPACING.xs },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
    gap: SPACING.md,
    padding: SPACING.screenPadding,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});