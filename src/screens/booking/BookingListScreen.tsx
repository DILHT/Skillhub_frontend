// src/screens/booking/BookingListScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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
import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";

// Filter tabs shown at the top of the list
const FILTER_TABS: { label: string; statuses: BookingStatus[] | null }[] = [
  { label: "All", statuses: null },
  { label: "Active", statuses: ["pending", "accepted", "in_progress"] },
  { label: "Completed", statuses: ["completed"] },
  { label: "Cancelled", statuses: ["cancelled", "rejected"] },
];

export default function BookingListScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
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
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>

      {/* FILTER TABS */}
      <View style={styles.tabsRow}>
        {FILTER_TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.tab, activeFilter === index && styles.tabActive]}
            onPress={() => setActiveFilter(index)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeFilter === index && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: {
      padding: SPACING.screenPadding,
      paddingBottom: SPACING.md,
    },
    headerTitle: {
      fontSize: 36,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.textPrimary,
    },
    tabsRow: {
      flexDirection: "row",
      // backgroundColor: COLORS.surface,
      paddingHorizontal: SPACING.screenPadding,
      paddingBottom: SPACING.md,
      gap: SPACING.sm,
      // borderBottomWidth: 1,
      // borderBottomColor: COLORS.divider,
    },
    tab: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: SPACING.borderRadius.full,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    tabLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    tabLabelActive: { color: COLORS.white },
    listContent: { padding: SPACING.screenPadding, flexGrow: 1 },
    skeletonCard: { marginBottom: SPACING.md },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: SPACING.xxxl,
      gap: SPACING.md,
    },
    emptyTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
    },
    emptySubtitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      textAlign: "center",
    },
    browseButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.sm,
      borderRadius: SPACING.borderRadius.full,
      marginTop: SPACING.sm,
    },
    browseButtonText: {
      color: COLORS.white,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 12,
    },
    errorStateTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: COLORS.textPrimary,
    },
    errorStateText: {
      fontSize: 14,
      color: COLORS.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    retryButton: {
      marginTop: 8,
      backgroundColor: COLORS.primary,
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 999,
    },
    retryButtonText: {
      color: COLORS.white,
      fontSize: 15,
      fontWeight: "600",
    },
  });
