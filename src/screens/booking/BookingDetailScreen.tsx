// PLACE AT: src/screens/booking/BookingDetailScreen.tsx

import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useBookingDetail, useCancelBooking } from "@/hooks/useBooking";
import { StatusBadge } from "@/components/booking/StatusBadge";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/common";
import { BookingStackParamList } from "@/navigation/AppNavigator";
import { useAppTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";
import { safeFormatDate } from "@/utils/dateHelpers";

type RouteProps = RouteProp<BookingStackParamList, "BookingDetail">;

function InfoRow({
  icon,
  label,
  value,
  COLORS,
  isLast,
}: {
  icon: string;
  label: string;
  value: string;
  COLORS: AppColors;
  isLast?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: SPACING.md,
        paddingVertical: SPACING.sm,
        borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.divider,
      }}
    >
      <Ionicons
        name={icon as any}
        size={15}
        color={COLORS.textTertiary}
        style={{ marginTop: 2 }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: TYPOGRAPHY.fontSize.xs,
            fontFamily: TYPOGRAPHY.fontFamily.medium,
            color: COLORS.textTertiary,
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: TYPOGRAPHY.fontSize.sm,
            fontFamily: TYPOGRAPHY.fontFamily.medium,
            color: COLORS.textPrimary,
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function BookingDetailScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { bookingId } = route.params;

  const { data: booking, isLoading } = useBookingDetail(bookingId);
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: () =>
            cancelBooking(bookingId, { onSuccess: () => navigation.goBack() }),
        },
      ],
    );
  };

  if (isLoading || !booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking details</Text>
          <View style={{ width: 30 }} />
        </View>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: COLORS.textSecondary }}>
            Loading booking...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const canCancel = booking.status === "pending";
  const formattedDate = safeFormatDate(
    booking.scheduledDate,
    "EEEE, d MMMM yyyy",
  );
  const formattedAmount = `${booking.currency} ${new Intl.NumberFormat("en-MW").format(booking.totalAmount)}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking details</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Status + reference */}
        <View style={styles.statusRow}>
          <StatusBadge status={booking.status} />
          <Text style={styles.refText}>
            #{booking.id.slice(0, 8).toUpperCase()}
          </Text>
        </View>

        {/* Service + Provider merged */}
        <View style={styles.card}>
          <Text style={styles.serviceTitle}>{booking.service.title}</Text>
          <Text style={styles.serviceDesc} numberOfLines={2}>
            {booking.service.description}
          </Text>

          <View style={styles.divider} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: SPACING.sm,
            }}
          >
            <Avatar
              uri={booking.provider.avatar}
              name={`${booking.provider.firstName} ${booking.provider.lastName}`}
              size="sm"
              showVerifiedBadge={booking.provider.isVerified}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.providerName}>
                {booking.provider.firstName} {booking.provider.lastName}
              </Text>
              <Text style={styles.providerLocation}>
                {booking.provider.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Schedule</Text>
          <InfoRow
            icon="calendar-outline"
            label="Date"
            value={formattedDate}
            COLORS={COLORS}
          />
          <InfoRow
            icon="time-outline"
            label="Time"
            value={booking.scheduledTime}
            COLORS={COLORS}
          />
          <InfoRow
            icon="hourglass-outline"
            label="Duration"
            value={`${booking.durationHours} hour${booking.durationHours !== 1 ? "s" : ""}`}
            COLORS={COLORS}
          />
          <InfoRow
            icon="location-outline"
            label="Address"
            value={booking.address}
            COLORS={COLORS}
            isLast
          />
        </View>

        {/* Payment + Notes merged when notes exist */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.paymentLabel}>Total</Text>
            <Text style={styles.paymentAmount}>{formattedAmount}</Text>
          </View>

          {booking.notes ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.cardTitle}>Notes</Text>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </>
          ) : null}
        </View>

        {canCancel && (
          <Button
            label="Cancel Booking"
            onPress={handleCancel}
            isLoading={isCancelling}
            variant="danger"
            fullWidth
            style={{ borderRadius: SPACING.borderRadius.full, marginTop: 20 }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.screenPadding,
      paddingVertical: SPACING.md,
    },

    backButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.divider,
    },

    headerTitle: {
      flex: 1,
      marginLeft: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.textPrimary,
    },
    content: {
      paddingHorizontal: SPACING.screenPadding,
      paddingBottom: SPACING.xxl,
      gap: SPACING.sm,
    },
    statusRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    refText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textTertiary,
      letterSpacing: 0.3,
    },
    card: {
      backgroundColor: COLORS.surface,
      borderRadius: SPACING.borderRadius.lg,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: COLORS.divider,
      marginBottom: SPACING.sm,
    },
    cardTitle: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textTertiary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: SPACING.xs,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: COLORS.divider,
      marginVertical: SPACING.md,
    },
    serviceTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
      marginBottom: 4,
    },
    serviceDesc: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      lineHeight: 19,
    },
    providerName: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
    },
    providerLocation: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.textSecondary,
      marginTop: 1,
    },
    paymentLabel: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    paymentAmount: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
    },
    notesText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      lineHeight: 20,
    },
  });
