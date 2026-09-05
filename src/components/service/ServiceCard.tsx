// =============================================================================
// FILE 5: src/components/service/ServiceCard.tsx  ← THE MOST IMPORTANT FILE
// =============================================================================
//
// THE MOST REUSED COMPONENT IN THE ENTIRE APP.
// Appears in: HomeScreen, SearchScreen, CategoryScreen, ProviderProfile.
//
// TWO VARIANTS:
//   • 'vertical'   — full card with image (default, used in vertical scroll lists)
//   • 'horizontal' — compact card (used in horizontal "featured" carousels)
//
// PERFORMANCE: Wrapped in React.memo() because it lives inside FlatList.
//
// WHAT TO STUDY HERE:
//   1. How component variants work (same component, two layouts)
//   2. Image loading with progressive blur placeholder
//   3. Price formatting for multiple African currencies
//   4. How navigation works FROM a reusable component

import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Service } from "../../types/service.types";
import { SmartImage } from "@/components/common/SmartImage";
import { Avatar } from "../common/Avatar";
import { RatingStars } from "./RatingStars";
import { useAppTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/theme";
import { SPACING } from "../../constants/spacing";
import { TYPOGRAPHY } from "../../constants/typography";
import { useShadows } from "@/constants/shadows";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type CardVariant = "vertical" | "horizontal";

interface ServiceCardProps {
  service: Service;
  variant?: CardVariant;
  onPress?: () => void; // Optional override — default navigates to ServiceDetail
}

// ── PRICE FORMATTER ───────────────────────────────────────────────────────────
//
// Formats price for display: 5000 MWK → "MWK 5,000"
// Handles 'negotiable' case: returns "Negotiable"
// This logic belongs in formatters.ts, but included here for clarity

function formatPrice(
  price: number,
  currency: string,
  unit: Service["priceUnit"],
): string {
  if (unit === "negotiable") return "Negotiable";

  const formatted = new Intl.NumberFormat("en-MW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  const unitLabel = unit === "hour" ? "/hr" : unit === "day" ? "/day" : "";
  return `${currency} ${formatted}${unitLabel}`;
}

// ── THE COMPONENT ─────────────────────────────────────────────────────────────
//
// React.memo() is a Higher-Order Component (HOC) that wraps your component.
// It does a shallow comparison of props before re-rendering.
// If props haven't changed, the previous render result is reused.

export const ServiceCard = memo<ServiceCardProps>(
  ({ service, variant = "vertical", onPress }) => {
    const navigation = useNavigation<any>();

    const handlePress = () => {
      if (onPress) {
        onPress();
      } else {
        // Navigate to ServiceDetail, passing the service id as a route param
        navigation.navigate("ServiceDetail", { serviceId: service.id });
      }
    };

    if (variant === "horizontal") {
      return <HorizontalCard service={service} onPress={handlePress} />;
    }

    return <VerticalCard service={service} onPress={handlePress} />;
  },
);

ServiceCard.displayName = "ServiceCard";

// ── VERTICAL CARD (full-width, image on top) ─────────────────────────────────

const VerticalCard: React.FC<{ service: Service; onPress: () => void }> = ({
  service,
  onPress,
}) => {
  const { colors: COLORS, isDark, cardStyle } = useAppTheme();
  const cardStyles = makeStyles(COLORS, isDark);
  const shadows = useShadows(isDark);
  const shadowStyle = isDark ? shadows.tinted.sm : shadows.lg;

  return (
    <TouchableOpacity
      style={[cardStyles.verticalContainer, shadowStyle]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* IMAGE SECTION */}
      <View style={cardStyles.imageWrapper}>
        <SmartImage
          uri={service.images[0]}
          style={cardStyles.verticalImage}
          fallbackIcon="image-outline"
        />

        {/* Availability badge — absolute positioned on top of the image */}
        {!service.isAvailable && (
          <View style={cardStyles.unavailableBadge}>
            <Text style={cardStyles.unavailableText}>Unavailable</Text>
          </View>
        )}

        {/* Distance badge — bottom-left of image */}
        {service.distance !== null && (
          <View style={cardStyles.distanceBadge}>
            <Ionicons name="location-outline" size={11} color={COLORS.white} />
            <Text style={cardStyles.distanceText}>
              {service.distance < 1
                ? `${Math.round(service.distance * 1000)}m`
                : `${service.distance.toFixed(1)}km`}
            </Text>
          </View>
        )}
      </View>

      {/* CONTENT SECTION */}
      <View style={cardStyles.verticalContent}>
        {/* Provider row */}
        <View style={cardStyles.providerRow}>
          <Avatar
            uri={service.provider.avatar}
            name={`${service.provider.firstName} ${service.provider.lastName}`}
            size="xs"
            showVerifiedBadge={service.provider.isVerified}
          />
          <Text style={cardStyles.providerName} numberOfLines={1}>
            {service.provider.firstName} {service.provider.lastName}
          </Text>
          <Text style={cardStyles.location} numberOfLines={1}>
            {service.provider.location}
          </Text>
        </View>

        {/* Service title */}
        <Text style={cardStyles.title} numberOfLines={2}>
          {service.title}
        </Text>

        {/* Rating + price row */}
        <View style={cardStyles.metaRow}>
          <RatingStars
            rating={service.rating}
            reviewCount={service.reviewCount}
            compact
            size={12}
          />
          <Text style={cardStyles.location}> • </Text>
          <View style={cardStyles.pricePill}>
            <Text style={cardStyles.price}>
              {formatPrice(service.price, service.currency, service.priceUnit)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── HORIZONTAL CARD (fixed-width, for carousels) ─────────────────────────────

const HorizontalCard: React.FC<{ service: Service; onPress: () => void }> = ({
  service,
  onPress,
}) => {
  const { colors: COLORS, isDark, cardStyle } = useAppTheme();
  const cardStyles = makeStyles(COLORS, isDark);
  const shadows = useShadows(isDark);
  const shadowStyle = isDark ? shadows.tinted.sm : shadows.lg;

  return (
    <TouchableOpacity
      style={[cardStyles.horizontalContainer, shadowStyle]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <SmartImage
        uri={service.images[0]}
        style={cardStyles.horizontalImage}
        fallbackIcon="image-outline"
      />
      <View style={cardStyles.horizontalContent}>
        <Text style={cardStyles.title} numberOfLines={1}>
          {service.title}
        </Text>
        <View style={cardStyles.providerRow}>
          <RatingStars
            rating={service.rating}
            reviewCount={service.reviewCount}
            compact
            size={11}
          />
          <Text style={cardStyles.horizontalPrice} numberOfLines={1}>
            • {formatPrice(service.price, service.currency, service.priceUnit)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── STYLES ────────────────────────────────────────────────────────────────────

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    // VERTICAL CARD
    verticalContainer: {
      borderRadius: SPACING.borderRadius.md,
      overflow: "hidden",
      marginVertical: SPACING.sm,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.divider,
      paddingHorizontal: SPACING.sm,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
    },
    imageWrapper: {
      position: "relative",
    },
    verticalImage: {
      width: "100%",
      height: 180,
      backgroundColor: COLORS.border,
      borderRadius: SPACING.borderRadius.md,
    },
    verticalContent: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xs,
      gap: SPACING.xs,
    },
    providerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
    },
    providerName: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textSecondary,
      flex: 1,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
      lineHeight: 22,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: SPACING.xs,
    },
    location: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textTertiary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    pricePill: {},
    price: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.primary,
    },

    // BADGES (absolute positioned over image)
    unavailableBadge: {
      position: "absolute",
      top: SPACING.sm,
      right: SPACING.sm,
      backgroundColor: "rgba(0,0,0,0.6)",
      paddingHorizontal: SPACING.sm,
      paddingVertical: 3,
      borderRadius: SPACING.borderRadius.full,
    },
    unavailableText: {
      color: COLORS.white,
      fontSize: TYPOGRAPHY.fontSize.xs,
    },
    distanceBadge: {
      position: "absolute",
      bottom: SPACING.sm,
      left: SPACING.sm,
      backgroundColor: "rgba(0,0,0,0.55)",
      paddingHorizontal: SPACING.sm,
      paddingVertical: 3,
      borderRadius: SPACING.borderRadius.full,
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    distanceText: {
      color: COLORS.white,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    // HORIZONTAL CARD
    horizontalContainer: {
      width: SCREEN_WIDTH * 0.6,
      borderRadius: SPACING.borderRadius.md,
      overflow: "hidden",
      marginRight: SPACING.md,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.divider,
      paddingHorizontal: SPACING.sm,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
    },
    horizontalImage: {
      width: "100%",
      height: 140,
      backgroundColor: COLORS.border,
      borderRadius: SPACING.borderRadius.sm,
    },
    horizontalContent: {
      paddingTop: SPACING.sm,
      paddingHorizontal: 1,
      gap: SPACING.sm,
    },
    horizontalPrice: {
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.primary,
    },
  });
