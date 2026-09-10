// src/screens/home/ServiceDetailScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useServiceDetail } from "@/hooks/useServices";
import { useBookingStore } from "@/store/bookingStore";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/common";
import { RatingStars } from "@/components/service/RatingStars";
import { ServiceCardSkeleton } from "@/components/common/Skeleton";
import { HomeStackParamList } from "@/navigation/AppNavigator";
import { useAppTheme } from "@/context/ThemeContext";
import { SmartImage } from "@/components/common/SmartImage";
import { makeServiceDetailsStyles } from "@/styles/serviceDetails.style";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type RouteProps = RouteProp<HomeStackParamList, "ServiceDetail">;

function formatPrice(price: number, currency: string, unit: string): string {
  if (unit === "negotiable") return "Negotiable";
  const formatted = new Intl.NumberFormat("en-MW").format(price);
  const unitLabel = unit === "hour" ? "/hr" : unit === "day" ? "/day" : "";
  return `${currency} ${formatted}${unitLabel}`;
}

export default function ServiceDetailScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeServiceDetailsStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { serviceId } = route.params;

  const { data: service, isLoading, isError } = useServiceDetail(serviceId);
  const startBooking = useBookingStore((s) => s.startBooking);
  const role = useAuthStore((s) => s.role);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleBookNow = () => {
    if (!service) return;
    startBooking(service);
    navigation.navigate("BookingFlow", { serviceId: service.id });
  };

  // ── LOADING ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  // ── ERROR ────────────────────────────────────────────────────────────────────
  if (isError || !service) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.textTertiary}
          />
          <Text style={styles.errorText}>Service not found</Text>
          <Button
            label="Go back"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <StatusBar barStyle="light-content" />

      {/* ── IMAGE GALLERY ──────────────────────────────────────────────────── */}
      <View style={styles.imageContainer}>
        <View style={styles.imageOverlay} />
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
            );
            setActiveImageIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {(service.images.length > 0 ? service.images : [undefined]).map(
            (uri, i) => (
              <SmartImage
                key={i}
                uri={uri}
                style={styles.image}
                fallbackIcon="image-outline"
              />
            ),
          )}
        </ScrollView>

        {/* Back button — floating over the image */}
        <TouchableOpacity
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Image dots indicator */}
        {service.images.length > 1 && (
          <View style={styles.dotsRow}>
            {service.images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeImageIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}

        {/* Availability badge */}
        {!service.isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Currently Unavailable</Text>
          </View>
        )}
      </View>

      <View style={styles.bottom}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── CONTENT ────────────────────────────────────────────────────────── */}
          <View style={styles.content}>
            {/* Category + price */}
            <View style={styles.topMeta}>
              <View style={styles.categoryChip}>
                <Text style={styles.categoryText}>{service.category.name}</Text>
              </View>
              {/* <Text style={styles.price}>
                {formatPrice(
                  service.price,
                  service.currency,
                  service.priceUnit,
                )}
              </Text> */}
            </View>

            {/* Title */}
            <Text style={styles.title}>{service.title}</Text>

            {/* Rating */}
            <View style={styles.metaRow}>
              {/* Location */}
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.locationText}>{service.location}</Text>
                {service.distance !== null && (
                  <Text style={styles.distanceText}>
                    •{" "}
                    {service.distance < 1
                      ? `${Math.round(service.distance * 1000)}m away`
                      : `${service.distance.toFixed(1)}km away`}
                  </Text>
                )}
              </View>
              <View style={styles.rating}>
                <RatingStars
                  rating={service.rating}
                  reviewCount={service.reviewCount}
                  compact
                  size={13}
                />
                <Text style={styles.ratingText}>Rating</Text>
              </View>
            </View>

            {/* <View style={styles.divider} /> */}

            {/* ── PROVIDER SECTION ─────────────────────────────────────────────── */}
            {/* <Text style={styles.sectionLabel}>About the provider</Text> */}

            <View style={styles.providerCard}>
              <TouchableOpacity
                style={styles.providerLeft}
                onPress={() =>
                  navigation.navigate("ProviderProfile", {
                    providerId: service.provider.id,
                  })
                }
                activeOpacity={0.7}
              >
                <Avatar
                  uri={service.provider.avatar}
                  name={`${service.provider.firstName} ${service.provider.lastName}`}
                  size="lg"
                  showVerifiedBadge={service.provider.isVerified}
                />
                <View style={styles.providerInfo}>
                  <View style={styles.providerNameRow}>
                    <Text style={styles.providerName}>
                      {service.provider.firstName} {service.provider.lastName}
                    </Text>
                    {service.provider.isVerified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={COLORS.primary}
                      />
                    )}
                  </View>
                  <RatingStars
                    rating={service.provider.rating}
                    reviewCount={service.provider.reviewCount}
                    size={13}
                    compact
                  />
                  <Text style={styles.responseTime}>
                    {service.provider.responseTime}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.providerRight}>
                <TouchableOpacity
                  style={styles.providerIcon}
                  onPress={() =>
                    Alert.alert(
                      "Call Provider",
                      "Phone calling is coming soon.",
                      [{ text: "OK" }],
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={18} color={COLORS.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.providerIcon}
                  onPress={() =>
                    Alert.alert(
                      "Message Provider",
                      "Messaging is coming soon.",
                      [{ text: "OK" }],
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={18}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* <View style={styles.divider} /> */}

            {/* ── DESCRIPTION ──────────────────────────────────────────────────── */}
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>{service.description}</Text>

            {/* ── TAGS ─────────────────────────────────────────────────────────── */}
            {service.tags.length > 0 && (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionLabel}>Tags</Text>
                <View style={styles.tagsRow}>
                  {service.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Bottom padding so content clears the sticky button */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        {/* ── STICKY BOTTOM BAR ────────────────────────────────────────────────── */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomPriceCol}>
            <Text style={styles.bottomPriceLabel}>Price</Text>
            <Text style={styles.bottomPrice}>
              {formatPrice(service.price, service.currency, service.priceUnit)}
            </Text>
          </View>

          {/* Only clients can book — providers see their own services */}
          {role === "client" ? (
            <Button
              label={service.isAvailable ? "Book Now" : "Unavailable"}
              onPress={handleBookNow}
              disabled={!service.isAvailable}
              style={styles.bookButton}
              size="md"
            />
          ) : (
            <Button
              label="Edit Service"
              onPress={() =>
                Alert.alert(
                  "Edit Service",
                  "Service management for providers is coming soon.",
                  [{ text: "OK" }],
                )
              }
              variant="outline"
              style={styles.bookButton}
              size="lg"
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
