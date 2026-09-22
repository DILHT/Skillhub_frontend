// src/screens/home/ServiceDetailScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { HomeStackParamList, TabScreenNavigationProp } from '@/navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useServiceDetail } from '@/hooks/useServices';
import { useBookingStore } from '@/store/bookingStore';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/common/Avatar';
import { Button, SectionHeader } from '@/components/common';
import { RatingStars } from '@/components/service/RatingStars';
import { ServiceCardSkeleton } from '@/components/common/Skeleton';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SmartImage } from '@/components/common/SmartImage';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RouteProps = RouteProp<HomeStackParamList, 'ServiceDetail'>;

function formatPrice(price: number, currency: string, unit: string): string {
  if (unit === 'negotiable') return 'Negotiable';
  const formatted = new Intl.NumberFormat('en-MW').format(price);
  const unitLabel = unit === 'hour' ? '/hr' : unit === 'day' ? '/day' : '';
  return `${currency} ${formatted}${unitLabel}`;
}

export default function ServiceDetailScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<TabScreenNavigationProp<HomeStackParamList, 'ServiceDetail'>>();
  const route = useRoute<RouteProps>();
  const { serviceId } = route.params;

  const { data: service, isLoading, isError } = useServiceDetail(serviceId);
  const startBooking = useBookingStore((s) => s.startBooking);
  const role = useAuthStore((s) => s.role);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleBookNow = () => {
    if (!service) return;
    startBooking(service);
    navigation.navigate('BookingsTab', {
      screen: 'BookingFlow',
      params: { serviceId: service.id },
    });
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
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.textTertiary} />
          <Text style={styles.errorText}>Service not found</Text>
          <Button label="Go back" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── IMAGE GALLERY ──────────────────────────────────────────────────── */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {(service.images.length > 0 ? service.images : [undefined]).map(
              (uri, i) => (
                <SmartImage key={i} uri={uri} style={styles.image} fallbackIcon="image-outline" />
              )
            )}
          </ScrollView>

          {/* Back button — floating over the image */}
          <TouchableOpacity
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.white} />
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

        {/* ── CONTENT ────────────────────────────────────────────────────────── */}
        <View style={styles.content}>

          {/* Category + price */}
          <View style={styles.topMeta}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{service.category.name}</Text>
            </View>
            <Text style={styles.price}>
              {formatPrice(service.price, service.currency, service.priceUnit)}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{service.title}</Text>

          {/* Rating */}
          <RatingStars
            rating={service.rating}
            reviewCount={service.reviewCount}
            size={16}
          />

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.locationText}>{service.location}</Text>
            {service.distance !== null && (
              <Text style={styles.distanceText}>
                · {service.distance < 1
                  ? `${Math.round(service.distance * 1000)}m away`
                  : `${service.distance.toFixed(1)}km away`}
              </Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* ── PROVIDER SECTION ─────────────────────────────────────────────── */}
          <SectionHeader title="About the provider" />

          <TouchableOpacity
            style={styles.providerCard}
            onPress={() => navigation.navigate('ProviderProfile', { providerId: service.provider.id })}
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
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                )}
              </View>
              <RatingStars
                rating={service.provider.rating}
                reviewCount={service.provider.reviewCount}
                size={13}
                compact
              />
              <Text style={styles.responseTime}>{service.provider.responseTime}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* ── DESCRIPTION ──────────────────────────────────────────────────── */}
          <SectionHeader title="Description" />
          <Text style={styles.description}>{service.description}</Text>

          {/* ── TAGS ─────────────────────────────────────────────────────────── */}
          {service.tags.length > 0 && (
            <>
              <View style={styles.divider} />
              <SectionHeader title="Tags" />
              <View style={styles.tagsRow}>
                {service.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
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
        {role === 'client' ? (
          <Button
            label={service.isAvailable ? 'Book Now' : 'Unavailable'}
            onPress={handleBookNow}
            disabled={!service.isAvailable}
            style={styles.bookButton}
            size="lg"
          />
        ) : (
          <Button
            label="Edit Service"
            onPress={() =>
                  Alert.alert(
                    'Edit Service',
                    'Service management for providers is coming soon.',
                    [{ text: 'OK' }]
                  )
                }
            variant="outline"
            style={styles.bookButton}
            size="lg"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl },
  loadingContainer: { padding: SPACING.screenPadding },
  errorContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: SPACING.md, padding: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },

  // Image gallery
  imageContainer: { position: 'relative' },
  image: { width: SCREEN_WIDTH, height: 280, backgroundColor: COLORS.border },
  backButton: {
    position: 'absolute', top: 48, left: SPACING.md,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  dotsRow: {
    position: 'absolute', bottom: SPACING.sm,
    width: '100%', flexDirection: 'row',
    justifyContent: 'center', gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: COLORS.white, width: 16 },
  unavailableBadge: {
    position: 'absolute', top: SPACING.md, right: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full,
  },
  unavailableText: { color: COLORS.white, fontSize: TYPOGRAPHY.fontSize.xs },

  // Content
  content: { padding: SPACING.screenPadding, gap: SPACING.sm },
  topMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryChip: {
    backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.sm,
    paddingVertical: 3, borderRadius: SPACING.borderRadius.full,
  },
  categoryText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.primary, fontFamily: TYPOGRAPHY.fontFamily.medium },
  price: { fontSize: TYPOGRAPHY.fontSize.xl, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.primary },
  title: { fontSize: TYPOGRAPHY.fontSize.xxl, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary, lineHeight: 32 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.xs },
  locationText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  distanceText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary },
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.sm },

  // Provider card
  providerCard: {
    flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start',
    backgroundColor: COLORS.surface, borderRadius: SPACING.borderRadius.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.divider,
  },
  providerInfo: { flex: 1, gap: SPACING.xs },
  providerNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  providerName: { fontSize: TYPOGRAPHY.fontSize.md, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  responseTime: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textTertiary },

  // Description
  description: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary, lineHeight: 24 },

  // Tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  tag: {
    backgroundColor: COLORS.inputBackground, paddingHorizontal: SPACING.sm,
    paddingVertical: 4, borderRadius: SPACING.borderRadius.full,
  },
  tagText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.screenPadding, paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.divider,
  },
  bottomPriceCol: { gap: 2 },
  bottomPriceLabel: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary },
  bottomPrice: { fontSize: TYPOGRAPHY.fontSize.lg, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  bookButton: { flex: 1, marginLeft: SPACING.md },
});
