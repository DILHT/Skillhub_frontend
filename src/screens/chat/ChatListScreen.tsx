// src/screens/chat/ChatListScreen.tsx

import React from 'react';
import {
  View, FlatList, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ChatStackParamList } from '@/navigation/AppNavigator';
import { useConversations } from '@/hooks/useChat';
import { ConversationItem } from '@/components/chat/ConversationItem';
import { Skeleton } from '@/components/common/Skeleton';
import { Badge, ScreenHeader, ErrorState, EmptyState } from '@/components/common';
import { Conversation } from '@/types/chat.types';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { FLOATING_TAB_BAR_INSET } from '@/constants/layout';
import { TYPOGRAPHY } from '@/constants/typography';
import { useState } from 'react';

export default function ChatListScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<ChatStackParamList, 'ChatList'>>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { conversations, isLoading, isError, refetch } = useConversations();

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      {/* HEADER */}
      <ScreenHeader
        title="Messages"
        large
        rightElement={
          totalUnread > 0 ? (
            <Badge label={String(totalUnread)} tone="danger" size="sm" />
          ) : undefined
        }
      />

      {isError ? (
        <ErrorState
          title="Couldn't load messages"
          onRetry={refetch}
        />
      ) : (
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
            <EmptyState
              icon="chatbubbles-outline"
              title="No messages yet"
              message="Your conversations with providers will appear here"
            />
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
        contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR_INSET }}
        showsVerticalScrollIndicator={false}
      />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
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
});
