// src/screens/home/SearchScreen.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteServices } from '@/hooks/useServices';
import { useDebounce } from '@/hooks/useDebounce';
import { ServiceCard } from '@/components/service/ServiceCard';
import { ServiceCardSkeleton } from '@/components/common/Skeleton';
import { Service } from '@/types/service.types';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const inputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState('');

  // Only fires API call 400ms after user stops typing
  const debouncedSearch = useDebounce(searchText, 400);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteServices(debouncedSearch ? { search: debouncedSearch } : {});

  // Auto-open keyboard when this screen mounts
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  // Flatten all pages into one array for FlatList
  const results: Service[] = data?.pages.flatMap((page) => page.data) ?? [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Ionicons name="search-outline" size={18} color={COLORS.textTertiary} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search services..."
            placeholderTextColor={COLORS.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* RESULTS */}
      <FlatList
        data={isLoading ? ([1, 2, 3] as any[]) : results}
        keyExtractor={(item) =>
          isLoading ? String(item) : (item as Service).id
        }
        renderItem={({ item }) =>
          isLoading ? (
            <ServiceCardSkeleton />
          ) : (
            <ServiceCard service={item as Service} />
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={{ marginVertical: SPACING.lg }}
            />
          ) : null
        }
        ListEmptyComponent={
          !isLoading && debouncedSearch ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                No results for "{debouncedSearch}"
              </Text>
              <Text style={styles.emptySubtitle}>
                Try different keywords
              </Text>
            </View>
          ) : !debouncedSearch ? (
            <View style={styles.promptState}>
              <Ionicons name="search" size={40} color={COLORS.textTertiary} />
              <Text style={styles.promptText}>
                Search for any service across Malawi
              </Text>
            </View>
          ) : null
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.screenPadding,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
  backBtn: {
    padding: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SPACING.borderRadius.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },

  // ── Results ──────────────────────────────────────────────────────────────────
  listContent: {
    padding: SPACING.screenPadding,
    flexGrow: 1,
  },

  // ── Empty / prompt states ────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  promptState: {
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
    gap: SPACING.md,
  },
  promptText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});