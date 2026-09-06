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
  onPress?: () => void;
}

function formatPrice(
  price: number,
  currency: string,
  unit: Service["priceUnit"],
): string {
  if (unit === "negotiable") {
    return "Negotiable";
  }

  const formatted = new Intl.NumberFormat("en-MW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  const unitLabel = unit === "hour" ? "/hr" : unit === "day" ? "/day" : "";

  return `${currency} ${formatted}${unitLabel}`;
}

export const ServiceCard = memo<ServiceCardProps>(
  ({ service, variant = "vertical", onPress }) => {
    const navigation = useNavigation<any>();

    const handlePress = () => {
      if (onPress) {
        onPress();
      } else {
        navigation.navigate("ServiceDetail", {
          serviceId: service.id,
        });
      }
    };

    if (variant === "horizontal") {
      return <HorizontalCard service={service} onPress={handlePress} />;
    }

    return <VerticalCard service={service} onPress={handlePress} />;
  },
);

ServiceCard.displayName = "ServiceCard";

// ============================================================
// VERTICAL CARD
// ============================================================

const VerticalCard: React.FC<{
  service: Service;
  onPress: () => void;
}> = ({ service, onPress }) => {
  const { colors: COLORS, isDark } = useAppTheme();

  const styles = makeStyles(COLORS, isDark);

  const shadows = useShadows(isDark);

  const shadowStyle = isDark ? shadows.tinted.sm : shadows.sm;

  return (
    <TouchableOpacity
      style={[styles.verticalContainer, shadowStyle]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* IMAGE */}

      <View style={styles.imageWrapper}>
        <SmartImage
          uri={service.images[0]}
          style={styles.verticalImage}
          fallbackIcon="image-outline"
        />

        {/* Availability */}

        {!service.isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}

        {/* Distance */}

        {service.distance !== null && (
          <View style={styles.distanceBadge}>
            <Ionicons name="location-outline" size={12} color={COLORS.white} />

            <Text style={styles.distanceText}>
              {service.distance < 1
                ? `${Math.round(service.distance * 1000)}m`
                : `${service.distance.toFixed(1)}km`}
            </Text>
          </View>
        )}
      </View>

      {/* CONTENT */}

      <View style={styles.verticalContent}>
        {/* Provider */}

        <View style={styles.providerRow}>
          <Avatar
            uri={service.provider.avatar}
            name={`${service.provider.firstName} ${service.provider.lastName}`}
            size="xs"
            showVerifiedBadge={service.provider.isVerified}
          />

          <Text style={styles.providerName} numberOfLines={1}>
            {service.provider.firstName} {service.provider.lastName}
          </Text>

          <View style={styles.locationContainer}>
            <Ionicons
              name="location-outline"
              size={12}
              color={COLORS.textTertiary}
            />

            <Text style={styles.location} numberOfLines={1}>
              {service.provider.location}
            </Text>
          </View>
        </View>

        {/* Title */}

        <Text style={styles.title} numberOfLines={2}>
          {service.title}
        </Text>

        {/* Meta */}

        <View style={styles.metaRow}>
          <RatingStars
            rating={service.rating}
            reviewCount={service.reviewCount}
            compact
            size={12}
          />

          <View style={styles.metaDivider} />

          <Text style={styles.price}>
            {formatPrice(service.price, service.currency, service.priceUnit)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================
// HORIZONTAL CARD
// ============================================================

const HorizontalCard: React.FC<{
  service: Service;
  onPress: () => void;
}> = ({ service, onPress }) => {
  const { colors: COLORS, isDark } = useAppTheme();

  const styles = makeStyles(COLORS, isDark);

  const shadows = useShadows(isDark);

  const shadowStyle = isDark ? shadows.tinted.sm : shadows.sm;

  return (
    <TouchableOpacity
      style={[styles.horizontalContainer, shadowStyle]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View style={styles.horizontalImageWrapper}>
        <SmartImage
          uri={service.images[0]}
          style={styles.horizontalImage}
          fallbackIcon="image-outline"
        />

        {!service.isAvailable && (
          <View style={styles.horizontalUnavailableBadge}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
      </View>

      <View style={styles.horizontalContent}>
        <Text style={styles.horizontalTitle} numberOfLines={2}>
          {service.title}
        </Text>

        <View style={styles.horizontalRating}>
          <RatingStars
            rating={service.rating}
            reviewCount={service.reviewCount}
            compact
            size={11}
          />
        </View>

        <Text style={styles.horizontalPrice} numberOfLines={1}>
          {formatPrice(service.price, service.currency, service.priceUnit)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================
// STYLES
// ============================================================

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    // ========================================================
    // VERTICAL
    // ========================================================

    verticalContainer: {
      borderRadius: 20,

      overflow: "hidden",

      marginVertical: 7,

      backgroundColor: COLORS.surface,

      borderWidth: 1,
      borderColor: COLORS.divider,

      padding: 8,
      paddingBottom: 12,
    },

    imageWrapper: {
      position: "relative",
    },

    verticalImage: {
      width: "100%",
      height: 190,

      backgroundColor: COLORS.border,

      borderRadius: 15,
    },

    verticalContent: {
      paddingTop: 12,
      paddingHorizontal: 4,

      gap: 5,
    },

    providerRow: {
      flexDirection: "row",
      alignItems: "center",

      gap: 6,

      minWidth: 0,
    },

    providerName: {
      flex: 1,

      fontSize: TYPOGRAPHY.fontSize.xs,

      fontFamily: TYPOGRAPHY.fontFamily.medium,

      color: COLORS.textSecondary,
    },

    locationContainer: {
      flexDirection: "row",
      alignItems: "center",

      gap: 2,

      maxWidth: "42%",
    },

    location: {
      fontSize: TYPOGRAPHY.fontSize.xs,

      color: COLORS.textTertiary,

      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    title: {
      fontSize: TYPOGRAPHY.fontSize.md,

      fontFamily: TYPOGRAPHY.fontFamily.bold,

      color: COLORS.textPrimary,

      lineHeight: 21,

      marginTop: 2,
    },

    metaRow: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: 5,

      minHeight: 22,
    },

    metaDivider: {
      width: 3,
      height: 3,

      borderRadius: 2,

      backgroundColor: COLORS.textTertiary,

      marginHorizontal: 7,
    },

    price: {
      fontSize: TYPOGRAPHY.fontSize.md,

      fontFamily: TYPOGRAPHY.fontFamily.bold,

      color: COLORS.primary,

      flexShrink: 1,
    },

    // ========================================================
    // BADGES
    // ========================================================

    unavailableBadge: {
      position: "absolute",

      top: 10,
      right: 10,

      backgroundColor: "rgba(0, 0, 0, 0.62)",

      paddingHorizontal: 9,
      paddingVertical: 5,

      borderRadius: 999,

      borderWidth: 1,

      borderColor: "rgba(255,255,255,0.15)",
    },

    unavailableText: {
      color: COLORS.white,

      fontSize: TYPOGRAPHY.fontSize.xs,

      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    distanceBadge: {
      position: "absolute",

      bottom: 10,
      left: 10,

      backgroundColor: "rgba(0, 0, 0, 0.62)",

      paddingHorizontal: 9,
      paddingVertical: 5,

      borderRadius: 999,

      flexDirection: "row",
      alignItems: "center",

      gap: 3,
    },

    distanceText: {
      color: COLORS.white,

      fontSize: TYPOGRAPHY.fontSize.xs,

      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    // ========================================================
    // HORIZONTAL
    // ========================================================

    horizontalContainer: {
      width: SCREEN_WIDTH * 0.8,

      borderRadius: 20,

      overflow: "hidden",

      marginRight: SPACING.md,

      backgroundColor: COLORS.surface,

      borderWidth: 1,
      borderColor: COLORS.divider,

      padding: 8,
      paddingBottom: 12,
    },

    horizontalImageWrapper: {
      position: "relative",
    },

    horizontalImage: {
      width: "100%",
      height: 150,

      backgroundColor: COLORS.border,

      borderRadius: 15,
    },

    horizontalUnavailableBadge: {
      position: "absolute",

      top: 9,
      right: 9,

      backgroundColor: "rgba(0, 0, 0, 0.62)",

      paddingHorizontal: 8,
      paddingVertical: 4,

      borderRadius: 999,
    },

    horizontalContent: {
      paddingTop: 11,
      paddingHorizontal: 3,

      gap: 6,
    },

    horizontalTitle: {
      fontSize: TYPOGRAPHY.fontSize.md,

      fontFamily: TYPOGRAPHY.fontFamily.bold,

      color: COLORS.textPrimary,

      lineHeight: 20,
    },

    horizontalRating: {
      minHeight: 18,

      justifyContent: "center",
    },

    horizontalPrice: {
      paddingTop: 3,

      fontFamily: TYPOGRAPHY.fontFamily.bold,

      fontSize: TYPOGRAPHY.fontSize.md,

      color: COLORS.primary,
    },
  });
