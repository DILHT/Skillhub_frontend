// src/screens/booking/BookingListScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useMyBookings } from "@/hooks/useBooking";
import { BookingCard } from "@/components/booking/BookingCard";
import { Skeleton } from "@/components/common/Skeleton";
import { Ionicons } from "@expo/vector-icons";
import { Booking, BookingStatus } from "@/types/booking.types";
import { useAppTheme } from "@/context/ThemeContext";
import { SPACING } from "@/constants/spacing";
import { makeBookingListStyles } from "@/styles/bookingList.styles";

// Filter tabs shown at the top of the list
const FILTER_TABS: { label: string; statuses: BookingStatus[] | null }[] = [
  { label: "All", statuses: null },
  { label: "Active", statuses: ["pending", "accepted", "in_progress"] },
  { label: "Completed", statuses: ["completed"] },
  { label: "Cancelled", statuses: ["cancelled", "rejected"] },
];

export default function BookingListScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeBookingListStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: bookings = [], isLoading, isError, refetch } = useMyBookings();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Apply the selected filter tab
  const filtered: Booking[] = FILTER_TABS[activeFilter].statuses
    ? bookings.filter((b) =>
        FILTER_TABS[activeFilter].statuses!.includes(b.status),
      )
    : bookings;

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back-outline"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View />
      </View>

      {/* FILTER TABS */}

      <FlatList
        data={FILTER_TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsList}
        contentContainerStyle={styles.tabsRow}
        keyExtractor={(item) => item.label}
        renderItem={({ item: tab, index }) => {
          const isActive = activeFilter === index;

          return (
            <TouchableOpacity
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveFilter(index)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
      
      {/* LIST */}
      <FlatList
        data={isLoading ? ([1, 2, 3] as any[]) : filtered}
        keyExtractor={(item) =>
          isLoading ? String(item) : (item as Booking).id
        }
        renderItem={({ item }) =>
          isLoading ? (
            <View style={styles.skeletonCard}>
              <Skeleton height={80} borderRadius={SPACING.borderRadius.lg} />
            </View>
          ) : (
            <BookingCard
              booking={item as Booking}
              onPress={() =>
                navigation.navigate("BookingDetail", {
                  bookingId: (item as Booking).id,
                })
              }
            />
          )
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={COLORS.textTertiary}
              />
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptySubtitle}>
                Browse services and book your first appointment
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() =>
                  navigation.navigate("HomeTab", { screen: "Home" })
                }
              >
                <Text style={styles.browseButtonText}>Browse Services</Text>
              </TouchableOpacity>
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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
