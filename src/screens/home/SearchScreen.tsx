// src/screens/home/SearchScreen.tsx

import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteServices } from "@/hooks/useServices";
import { useDebounce } from "@/hooks/useDebounce";
import { ServiceCard } from "@/components/service/ServiceCard";
import { ServiceCardSkeleton } from "@/components/common/Skeleton";
import { Service } from "@/types/service.types";
import { useAppTheme } from "@/context/ThemeContext";
import { SPACING } from "@/constants/spacing";
import { makeSearchStyles } from "@/styles/search.styles";
import useShadows from "@/constants/shadows";

export default function SearchScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeSearchStyles(COLORS, isDark);
  const shadows = useShadows(isDark);

  const shadowStyle = isDark ? shadows.tinted.sm : shadows.sm;
  const navigation = useNavigation<any>();
  const inputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState("");

  // Only fires API call 400ms after user stops typing
  const debouncedSearch = useDebounce(searchText, 400);

  const {
    data,
    isLoading,
    isError,
    refetch,
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

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.textSecondary}
          />
          <Text style={styles.errorStateTitle}>Couldn't load</Text>
          <Text style={styles.errorStateText}>
            Something went wrong. Please check your connection and try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          style={[styles.backBtn]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>

        <View style={[styles.inputWrapper]}>
          <Ionicons
            name="search-outline"
            size={18}
            color={COLORS.textSecondary}
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search services..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.textSecondary}
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
        ListHeaderComponent={() => (
          <Text style={styles.searchResults}>
            {debouncedSearch
              ? `Search results for ${debouncedSearch}`
              : "Showing all services"}
          </Text>
        )}
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
              <Text style={styles.emptySubtitle}>Try different keywords</Text>
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
