// src/screens/booking/BookingScreen.tsx

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '@/store/bookingStore';
import { useCreateBooking } from '@/hooks/useBooking';
import { Button, Input } from '@/components/common';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

// ─────────────────────────────────────────────────────────────────────────────
// WHY THE ORIGINAL CRASHED
// ─────────────────────────────────────────────────────────────────────────────
// z.string().transform(Number) makes zod produce TWO different types:
//   Input type  = { durationHours: string }   ← what the form field sends
//   Output type = { durationHours: number }   ← what zod returns after transform
//
// react-hook-form registers the OUTPUT type as the form's type, so it expects
// durationHours to be a number internally. But <Input value={value} /> only
// accepts a string. TypeScript catches this mismatch and throws all three errors.
//
// FIX: Remove .transform() from the schema entirely.
//   durationHours stays a string from field → schema → onSubmit.
//   Convert to number with Number() only inside onSubmit, before the API call.
// ─────────────────────────────────────────────────────────────────────────────

const bookingSchema = z.object({
  scheduledDate: z
    .string()
    .min(1, 'Date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use format YYYY-MM-DD'),

  scheduledTime: z
    .string()
    .min(1, 'Time is required')
    .regex(/^\d{2}:\d{2}$/, 'Use format HH:MM e.g. 09:00'),

  // string all the way through — no .transform()
  durationHours: z
    .string()
    .min(1, 'Duration is required')
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 12,
      'Duration must be between 1 and 12 hours'
    ),

  address: z.string().min(5, 'Please enter the full service address'),
  notes: z.string().max(300, 'Keep notes under 300 characters').optional(),
});

// All fields are strings — consistent with what Input components accept
type BookingFormData = z.infer<typeof bookingSchema>;

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const draft = useBookingStore((s) => s.draft);
  const updateDraft = useBookingStore((s) => s.updateDraft);
  const { mutate: createBooking, isPending, error } = useCreateBooking();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      scheduledDate: draft.scheduledDate,
      scheduledTime: draft.scheduledTime,
      durationHours: String(draft.durationHours || 1), // string default ✓
      address: draft.address,
      notes: draft.notes,
    },
  });

  const watchedTime = watch('scheduledTime');

  const onSubmit = (data: BookingFormData) => {
    if (!draft.serviceId) return;

    // Convert string → number HERE, not in the schema
    const duration = Number(data.durationHours);

    updateDraft({
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      durationHours: duration,
      address: data.address,
      notes: data.notes ?? '',
    });

    createBooking({
      serviceId: draft.serviceId,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      durationHours: duration,
      address: data.address,
      notes: data.notes ?? '',
    });
  };

  if (!draft.service) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No service selected</Text>
          <Button label="Go back" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Service</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Service summary banner */}
          <View style={styles.serviceSummary}>
            <Text style={styles.summaryLabel}>Booking for</Text>
            <Text style={styles.summaryTitle}>{draft.service.title}</Text>
            <Text style={styles.summaryProvider}>
              {draft.service.provider.firstName} {draft.service.provider.lastName}
            </Text>
          </View>

          <View style={styles.form}>
            {/* DATE */}
            <Controller
              control={control}
              name="scheduledDate"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref}
                  label="Date"
                  placeholder="YYYY-MM-DD e.g. 2024-08-15"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.scheduledDate?.message}
                  leftIcon="calendar-outline"
                  isRequired
                  hint="Enter the date you want the service"
                />
              )}
            />

            {/* TIME + QUICK-SELECT */}
            <Controller
              control={control}
              name="scheduledTime"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <>
                  <Input
                    ref={ref}
                    label="Start time"
                    placeholder="HH:MM e.g. 09:00"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.scheduledTime?.message}
                    leftIcon="time-outline"
                    isRequired
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timeSlotsRow}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <TouchableOpacity
                        key={slot}
                        style={[styles.timeChip, watchedTime === slot && styles.timeChipActive]}
                        onPress={() => onChange(slot)}
                      >
                        <Text style={[styles.timeChipLabel, watchedTime === slot && styles.timeChipLabelActive]}>
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
            />

            {/* DURATION — string field, no type conflict */}
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

            {/* ADDRESS */}
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

            {/* NOTES */}
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref}
                  label="Notes for provider"
                  placeholder="Any special instructions? (optional)"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.notes?.message}
                  leftIcon="chatbubble-outline"
                  multiline
                />
              )}
            />

            {error && (
              <View style={styles.apiError}>
                <Text style={styles.apiErrorText}>
                  {(error as any)?.message ?? 'Booking failed. Please try again.'}
                </Text>
              </View>
            )}

            <Button
              label="Confirm Booking"
              onPress={handleSubmit(onSubmit)}
              isLoading={isPending}
              fullWidth
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.screenPadding, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  content: { padding: SPACING.screenPadding, gap: SPACING.lg },
  serviceSummary: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SPACING.borderRadius.lg,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  summaryLabel: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.primary },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  summaryProvider: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  form: { gap: SPACING.md },
  timeSlotsRow: { gap: SPACING.sm, paddingBottom: SPACING.xs },
  timeChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  timeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeChipLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  timeChipLabelActive: { color: COLORS.white },
  apiError: {
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: SPACING.borderRadius.md, padding: SPACING.md,
  },
  apiErrorText: { color: COLORS.danger, fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  errorText: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textPrimary },
});