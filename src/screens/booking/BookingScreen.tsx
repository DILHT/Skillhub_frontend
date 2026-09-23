// src/screens/booking/BookingScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useBookingStore } from "@/store/bookingStore";
import { useCreateBooking } from "@/hooks/useBooking";
import { Button, Input } from "@/components/common";
import { useAppTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";
import { isValidFutureDate } from "@/utils/dateHelpers";

const bookingSchema = z.object({
  durationHours: z
    .string()
    .min(1, "Duration is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 12,
      "Duration must be between 1 and 12 hours",
    ),
  address: z.string().min(5, "Please enter the full service address"),
  notes: z.string().max(300, "Keep notes under 300 characters").optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatHHMM(d: Date): string {
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function initials(first?: string, last?: string) {
  return `${(first?.[0] ?? "").toUpperCase()}${(last?.[0] ?? "").toUpperCase()}`;
}

export default function BookingScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const draft = useBookingStore((s) => s.draft);
  const updateDraft = useBookingStore((s) => s.updateDraft);
  const {
    mutate: createBooking,
    isPending,
    error: apiError,
  } = useCreateBooking();
  const [error, setError] = useState("");

  const [dateValue, setDateValue] = useState<Date | null>(() => {
    if (draft.scheduledDate) {
      const d = new Date(draft.scheduledDate);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  });

  const [timeValue, setTimeValue] = useState<Date | null>(() => {
    if (draft.scheduledTime) {
      const [h, m] = draft.scheduledTime.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
      }
    }
    return null;
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      durationHours: String(draft.durationHours || 1),
      address: draft.address,
      notes: draft.notes,
    },
  });

  const onSubmit = (data: BookingFormData) => {
    setError("");

    if (!dateValue) {
      setError("Please select a date.");
      return;
    }
    if (!timeValue) {
      setError("Please select a time.");
      return;
    }

    const scheduledDate = dateValue.toISOString().split("T")[0];
    const scheduledTime = formatHHMM(timeValue);

    if (!isValidFutureDate(scheduledDate)) {
      setError("Please select a future date.");
      return;
    }

    const serviceId = draft.serviceId || draft.service?.id;
    if (!serviceId) {
      setError("No service selected. Please go back and choose a service.");
      return;
    }

    const duration = Number(data.durationHours);

    updateDraft({
      scheduledDate,
      scheduledTime,
      durationHours: duration,
      address: data.address,
      notes: data.notes ?? "",
    });

    createBooking({
      serviceId,
      scheduledDate,
      scheduledTime,
      durationHours: duration,
      address: data.address,
      notes: data.notes ?? "",
    });
  };

  if (!draft.service) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconWrap}>
            <Ionicons
              name="calendar-outline"
              size={30}
              color={COLORS.textTertiary}
            />
          </View>
          <Text style={styles.errorText}>No service selected</Text>
          <Text style={styles.errorSubtext}>
            Choose a service first, then come back here to book it.
          </Text>
          <Button
            label="Go back"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  const combinedError = error || (apiError as any)?.message;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Service</Text>
        </View>

        <View style={styles.body}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* SERVICE SUMMARY CARD */}
            <View style={styles.serviceSummary}>
              <View style={styles.summaryAvatar}>
                <Text style={styles.summaryAvatarText}>
                  {initials(
                    draft.service.provider.firstName,
                    draft.service.provider.lastName,
                  )}
                </Text>
              </View>
              <View style={styles.summaryTextGroup}>
                <Text style={styles.summaryLabel}>Booking for</Text>
                <Text style={styles.summaryTitle} numberOfLines={1}>
                  {draft.service.title}
                </Text>
                <Text style={styles.summaryProvider} numberOfLines={1}>
                  {draft.service.provider.firstName}{" "}
                  {draft.service.provider.lastName}
                </Text>
              </View>
            </View>

            {/* SCHEDULE */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Schedule</Text>
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleField}>
                  <Text style={styles.fieldLabel}>
                    Date <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.pickerField}
                    onPress={() => {
                      setShowDatePicker(true);
                      setShowTimePicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={17}
                      color={dateValue ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      numberOfLines={1}
                      style={
                        dateValue ? styles.pickerText : styles.pickerPlaceholder
                      }
                    >
                      {dateValue ? formatDisplayDate(dateValue) : "Select date"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.scheduleField}>
                  <Text style={styles.fieldLabel}>
                    Start time <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.pickerField}
                    onPress={() => {
                      setShowTimePicker(true);
                      setShowDatePicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="time-outline"
                      size={17}
                      color={timeValue ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      numberOfLines={1}
                      style={
                        timeValue ? styles.pickerText : styles.pickerPlaceholder
                      }
                    >
                      {timeValue ? formatHHMM(timeValue) : "Select time"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Controller
                control={control}
                name="durationHours"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <Input
                    ref={ref}
                    label="Duration (hours)"
                    placeholder="e.g. 2"
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.durationHours?.message}
                    leftIcon="hourglass-outline"
                    isRequired
                  />
                )}
              />
            </View>

            {/* DETAILS */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Details</Text>
              <View style={styles.form}>
                <Controller
                  control={control}
                  name="address"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Input
                      ref={ref}
                      label="Service address"
                      placeholder="Where should the provider come?"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.address?.message}
                      leftIcon="location-outline"
                      isRequired
                      hint="Include area, street, and any landmarks"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="notes"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <Input
                      ref={ref}
                      label="Notes for provider"
                      placeholder="Any special instructions? (optional)"
                      value={value ?? ""}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.notes?.message}
                      leftIcon="chatbubble-outline"
                      multiline
                    />
                  )}
                />
              </View>
            </View>

            {combinedError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorBoxText}>{combinedError}</Text>
              </View>
            )}
          </ScrollView>

          {/* STICKY CTA */}
          <View style={styles.ctaBar}>
            <Button
              label="Confirm Booking"
              onPress={handleSubmit(onSubmit)}
              isLoading={isPending}
              fullWidth
              size="lg"
            />
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dateValue ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date()}
            onChange={(event, selected) => {
              setShowDatePicker(false);
              if (event.type !== "dismissed" && selected)
                setDateValue(selected);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={timeValue ?? new Date()}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selected) => {
              setShowTimePicker(false);
              if (event.type !== "dismissed" && selected)
                setTimeValue(selected);
            }}
          />
        )}
      </KeyboardAvoidingView>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.surface}
      />
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.surface },
    flex: { flex: 1 },
    body: { flex: 1, backgroundColor: COLORS.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.screenPadding,
      paddingVertical: SPACING.md,
      backgroundColor: COLORS.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS.divider,
    },
    backButton: {
      borderRadius: SPACING.borderRadius.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.surface,
    },
    headerTitle: {
      flex: 1,
      marginLeft: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.textPrimary,
    },

    content: {
      padding: SPACING.screenPadding,
      gap: SPACING.xl,
      paddingBottom: SPACING.xxxl,
    },

    // Service summary
    serviceSummary: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      backgroundColor: COLORS.primaryLight,
      borderRadius: SPACING.borderRadius.xl,
      padding: SPACING.md,
    },
    summaryAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    summaryAvatarText: {
      color: COLORS.white,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
    },
    summaryTextGroup: { flex: 1, gap: 1 },
    summaryLabel: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.primary,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    summaryTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
    },
    summaryProvider: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
    },

    // Sections
    section: { gap: SPACING.md },
    sectionLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    scheduleRow: { flexDirection: "row", gap: SPACING.sm },
    scheduleField: { flex: 1 },

    form: { gap: SPACING.md },
    fieldLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
      marginBottom: SPACING.xs,
    },
    required: { color: COLORS.danger },
    pickerField: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: COLORS.inputBackground,
      borderRadius: SPACING.borderRadius.md,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm + 2,
      minHeight: 48,
    },
    pickerText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    pickerPlaceholder: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textTertiary,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
    },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: COLORS.errorBg,
      borderWidth: 1,
      borderColor: COLORS.errorBorder,
      borderRadius: SPACING.borderRadius.md,
      padding: SPACING.md,
    },
    errorBoxText: {
      flex: 1,
      color: COLORS.danger,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    ctaBar: {
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
      backgroundColor: COLORS.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: COLORS.divider,
    },

    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.sm,
      padding: SPACING.xl,
    },
    errorIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.surfaceSecondary,
      marginBottom: SPACING.xs,
    },
    errorText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
    },
    errorSubtext: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      textAlign: "center",
      marginBottom: SPACING.sm,
    },
  });
