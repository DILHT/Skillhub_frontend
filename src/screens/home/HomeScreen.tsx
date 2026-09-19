// src/screens/home/HomeScreen.tsx

import  { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useHomeData, useServices } from "@/hooks/useServices";
import { useHomeControls } from "@/hooks/useHome";
import { useAuthStore } from "@/store/authStore";
import { ServiceCard } from "@/components/service/ServiceCard";
import { CategoryChip } from "@/components/service/CategoryChip";
import {
  ServiceCardSkeleton,
  Skeleton,
  HorizontalServiceCardSkeleton,
} from "@/components/common/Skeleton";
import { Button } from "@/components/common";
import { Category, Service } from "@/types/service.types";
import { useAppTheme } from "@/context/ThemeContext";
import { SPACING } from "@/constants/spacing";
import { useNotifications } from "@/hooks/useNotifications";
import { getTimeOfDay } from "@/helpers/home.helpers";
import { makeHomeStyles } from "@/styles/home.styles";

export default function HomeScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeHomeStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const { unreadCount } = useNotifications();

  const {
    data: homeData,
    isLoading: isHomeLoading,
    isError: isHomeError,
    refetch: refetchHome,
  } = useHomeData();

  const {
    selectedCategoryId,
    isRefreshing,
    categoriesScrollRef,
    handleCategoriesContentSizeChange,
    handleCategoriesLayout,
    handleCategoryLayout,
    handleCategoryPress,
    handleSelectAll,
    handleRefresh,
  } = useHomeControls(refetchHome);

  const { data: filteredData, isLoading: isFilterLoading } = useServices(
    selectedCategoryId ? { categoryId: selectedCategoryId } : {},
  );

  if (isHomeError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="wifi-outline" size={48} color={COLORS.textTertiary} />
          <Text style={styles.errorTitle}>Couldn't load services</Text>
          <Text style={styles.errorSubtitle}>
            Check your connection and try again
          </Text>
          <Button
            label="Try again"
            onPress={() => refetchHome()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  const mainListData: Service[] = selectedCategoryId
    ? (filteredData?.data ?? [])
    : (homeData?.nearbyServices ?? []);

  const mainListLoading = selectedCategoryId ? isFilterLoading : isHomeLoading;

  const displayName =
    user?.fullName ??
    (user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : null) ??
    user?.email ??
    "SkillHub User";

  const ListHeader = useCallback(
    () => (
      <View>
        {/* GREETING */}
        <View style={styles.header}>
          {/* FAKE SEARCH BAR — tapping navigates to SearchScreen */}
          <TouchableOpacity
            style={[styles.searchBar]}
            onPress={() => navigation.navigate("Search")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={COLORS.textSecondary}
            />
            <Text style={styles.searchPlaceholderHeading}>
              Search for services
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.notifButton]}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={COLORS.textPrimary}
            />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Good {getTimeOfDay()}, </Text>
          <Text style={styles.greetingName}>{displayName}</Text>
        </View>

        {/* CATEGORIES */}
        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View> */}

        <View style={styles.homeContent}>
          <ScrollView
            ref={categoriesScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
            onLayout={(e) => handleCategoriesLayout(e.nativeEvent.layout.width)}
            onContentSizeChange={(w) => handleCategoriesContentSizeChange(w)}
          >
            {/* All chip */}
            <TouchableOpacity
              style={[
                styles.allChip,
                !selectedCategoryId && styles.allChipActive,
              ]}
              onPress={handleSelectAll}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                handleCategoryLayout("all", x, width);
              }}
            >
              {!selectedCategoryId && (
                <Ionicons name="grid-outline" size={14} color={COLORS.white} />
              )}

              <Text
                style={[
                  styles.allChipLabel,
                  !selectedCategoryId && styles.allChipLabelActive,
                ]}
              >
                All services
              </Text>
            </TouchableOpacity>

            {isHomeLoading
              ? [1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    width={90}
                    height={32}
                    borderRadius={SPACING.borderRadius.full}
                    style={{
                      marginRight: SPACING.sm,
                    }}
                  />
                ))
              : homeData?.categories.map((cat: Category) => (
                  <CategoryChip
                    key={cat.id}
                    category={cat}
                    isSelected={selectedCategoryId === cat.id}
                    onLayout={(event) => {
                      const { x, width } = event.nativeEvent.layout;
                      handleCategoryLayout(cat.id, x, width);
                    }}
                    onPress={() => handleCategoryPress(cat.id)}
                  />
                ))}
          </ScrollView>

          {/* FEATURED (only when no category filter active) */}
          {!selectedCategoryId && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Search")}>
                  <Text style={styles.resultCount}>See all</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredScroll}
                snapToInterval={
                  Dimensions.get("window").width * 0.8 + SPACING.md
                }
                snapToAlignment="start"
                decelerationRate="fast"
              >
                {isHomeLoading
                  ? [1, 2].map((i) => (
                      <View
                        key={i}
                        style={{
                          width: SPACING.screenPadding * 10,
                          marginRight: SPACING.md,
                        }}
                      >
                        <HorizontalServiceCardSkeleton />
                      </View>
                    ))
                  : homeData?.featuredServices.map((service: Service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        variant="horizontal"
                      />
                    ))}
              </ScrollView>
            </>
          )}

          {/* NEARBY / FILTERED SECTION LABEL */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategoryId ? "Services" : "Nearby services"}
            </Text>
            {filteredData && (
              <Text style={styles.resultCount}>
                {selectedCategoryId
                  ? filteredData.total
                  : (homeData?.nearbyServices.length ?? 0)}{" "}
                results
              </Text>
            )}
          </View>
        </View>
      </View>
    ),
    [
      user,
      homeData,
      isHomeLoading,
      selectedCategoryId,
      filteredData,
      navigation,
      styles,
      COLORS,
    ],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <FlatList
        data={mainListLoading ? ([1, 2, 3] as any[]) : mainListData}
        keyExtractor={(item) =>
          mainListLoading ? String(item) : (item as Service).id
        }
        renderItem={({ item }) =>
          mainListLoading ? (
            <ServiceCardSkeleton />
          ) : (
            <ServiceCard service={item as Service} variant="vertical" />
          )
        }
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !mainListLoading ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={40}
                color={COLORS.textTertiary}
              />
              <Text style={styles.emptyTitle}>No services found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different category or location
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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
