import React from "react";
import {
  Linking,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Booking } from "../../types/booking.types";
import { StatusBadge } from "./StatusBadge";
import { SmartImage } from "@/components/common/SmartImage";
import { useAppTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/theme";
import { SPACING } from "../../constants/spacing";
import { TYPOGRAPHY } from "../../constants/typography";
import { format, parseISO } from "date-fns";
import { useShadows } from "@/constants/shadows";
import { Conversation } from "@/types/chat.types";

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
}

function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${new Intl.NumberFormat("en-MW").format(amount)}`;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPress,
}) => {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const shadows = useShadows(isDark);
  const navigation = useNavigation<any>();

  const provider = booking.provider as typeof booking.provider & {
    id?: string | number;
    phone?: string;
    phoneNumber?: string;
  };

  const handleCall = () => {
    const phoneNumber = provider.phoneNumber ?? provider.phone;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleMessage = () => {
    if (provider.id != null) {
    }
  };

  const formattedDate = format(
    parseISO(booking.scheduledDate),
    "EEE, d MMM yyyy",
  );

  return (
    <View style={[styles.card, shadows.sm]}>
      {/* CARD CONTENT */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        <View style={styles.topRow}>
          <View style={styles.info}>
            {/* STATUS */}
            <View style={styles.statusRow}>
              <StatusBadge status={booking.status} />
            </View>

            {/* TITLE */}
            <Text style={styles.title} numberOfLines={2}>
              {booking.service.title}
            </Text>

            {/* PROVIDER */}
            <View style={styles.providerRow}>
              <Ionicons
                name="person-outline"
                size={12}
                color={COLORS.textSecondary}
              />

              <Text style={styles.provider} numberOfLines={1}>
                {booking.provider.firstName} {booking.provider.lastName}
              </Text>
            </View>

            {/* DETAILS */}
            <View style={styles.detailsCol}>
              <View style={styles.detailItem}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={COLORS.textSecondary}
                />

                <Text style={styles.detailValue} numberOfLines={1}>
                  {formattedDate}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={COLORS.textSecondary}
                />

                <Text style={styles.detailValue}>{booking.scheduledTime}</Text>
              </View>
            </View>
          </View>

          {/* IMAGE */}
          <View style={styles.imageContainer}>
            <SmartImage
              uri={booking.service.images?.[0]}
              style={styles.image}
              fallbackIcon="briefcase-outline"
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* DIVIDER */}
      <View style={styles.divider} />

      {/* BOTTOM */}
      <View style={styles.bottomRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>Total</Text>

          <Text style={styles.amount} numberOfLines={1}>
            {formatCurrency(booking.totalAmount, booking.currency)}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={handleCall}
          >
            <Ionicons
              name="call-outline"
              size={17}
              color={COLORS.textPrimary}
            />

            <Text style={styles.buttonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={handleMessage}
          >
            <Ionicons
              name="chatbox-ellipses-outline"
              size={17}
              color={COLORS.textPrimary}
            />

            <Text style={styles.buttonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: COLORS.surface,
      borderRadius: SPACING.borderRadius.lg,
      padding: SPACING.md,
      marginBottom: SPACING.md,

      borderWidth: 1,
      borderColor: COLORS.divider,
    },

    topRow: {
      flexDirection: "row",
      gap: SPACING.md,
    },

    info: {
      flex: 1,
      minWidth: 0,
    },

    statusRow: {
      alignItems: "flex-start",
      marginBottom: SPACING.sm,
    },

    title: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
      lineHeight: 20,
      marginBottom: 4,
    },

    providerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginBottom: SPACING.sm,
    },

    provider: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textSecondary,
    },

    detailsCol: {
      gap: 5,
    },

    detailItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    detailValue: {
      flexShrink: 1,
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textSecondary,
    },

    imageContainer: {
      width: 82,
      height: 82,
      position: "relative",
    },

    image: {
      width: "100%",
      height: "100%",
      borderRadius: SPACING.borderRadius.md,
      backgroundColor: COLORS.border,
    },

    imageArrow: {
      position: "absolute",
      right: 5,
      bottom: 5,

      width: 25,
      height: 25,
      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor: COLORS.primary,
    },

    divider: {
      height: 1,
      backgroundColor: COLORS.divider,
      marginVertical: SPACING.md,
    },

    bottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: SPACING.md,
    },

    priceContainer: {
      flexShrink: 1,
    },

    totalLabel: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textTertiary,
      marginBottom: 2,
    },

    amount: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.primary,
    },

    actions: {
      flexDirection: "row",
      gap: SPACING.sm,
    },

    actionButton: {
      height: 38,
      paddingHorizontal: SPACING.md,
      borderRadius: SPACING.borderRadius.full,

      backgroundColor: COLORS.primaryLight,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    buttonText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
    },
  });
