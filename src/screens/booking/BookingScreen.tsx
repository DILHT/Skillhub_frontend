// src/screens/booking/BookingScreen.tsx

import React, { useState } from 'react';
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BookingStackParamList } from '@/navigation/AppNavigator';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '@/store/bookingStore';
import { useCreateBooking } from '@/hooks/useBooking';
import { useIsOnline } from '@/hooks/useIsOnline';
import { Button, Input, ScreenHeader } from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { isValidFutureDate } from '@/utils/dateHelpers';

const bookingSchema = z.object({
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

type BookingFormData = z.infer<typeof bookingSchema>;

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatHHMM(d: Date): string {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function BookingScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<BookingStackParamList, 'BookingFlow'>>();
  const draft = useBookingStore((s) => s.draft);
  const updateDraft = useBookingStore((s) => s.updateDraft);
  const { mutate: createBooking, isPending, error: apiError } = useCreateBooking();
  const isOnline = useIsOnline();
  const [error, setError] = useState('');

  const [dateValue, setDateValue] = useState<Date | null>(() => {
    if (draft.scheduledDate) {
      const d = new Date(draft.scheduledDate);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  });

  const [timeValue, setTimeValue] = useState<Date | null>(() => {
    if (draft.scheduledTime) {
      const [h, m] = draft.scheduledTime.split(':').map(Number);
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

  const { control, handleSubmit, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      durationHours: String(draft.durationHours || 1),
      address: draft.address,
      notes: draft.notes,
    },
  });

  const onSubmit = (data: BookingFormData) => {
    setError('');
    if (!isOnline) {
      setError("You're offline. Please reconnect and try again.");
      return;
    }

    if (!dateValue) {
      setError('Please select a date.');
      return;
    }
    if (!timeValue) {
      setError('Please select a time.');
      return;
    }

    const scheduledDate = dateValue.toISOString().split('T')[0];
    const scheduledTime = formatHHMM(timeValue);

    if (!isValidFutureDate(scheduledDate)) {
      setError('Please select a future date.');
      return;
    }

    const serviceId = draft.serviceId || draft.service?.id;
    if (!serviceId) {
      setError('No service selected. Please go back and choose a service.');
      return;
    }

    const duration = Number(data.durationHours);

    updateDraft({
      scheduledDate,
      scheduledTime,
      durationHours: duration,
      address: data.address,
      notes: data.notes ?? '',
    });

    createBooking({
      serviceId,
      scheduledDate,
      scheduledTime,
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
        <ScreenHeader title="Book Service" onBack={() => navigation.goBack()} />

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

            {/* DATE PICKER */}
            <View>
              <Text style={styles.fieldLabel}>
                Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerField}
                onPress={() => { setShowDatePicker(true); setShowTimePicker(false); }}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
                <Text style={dateValue ? styles.pickerText : styles.pickerPlaceholder}>
                  {dateValue ? formatDisplayDate(dateValue) : 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* TIME PICKER */}
            <View>
              <Text style={styles.fieldLabel}>
                Start time <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerField}
                onPress={() => { setShowTimePicker(true); setShowDatePicker(false); }}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
                <Text style={timeValue ? styles.pickerText : styles.pickerPlaceholder}>
                  {timeValue ? formatHHMM(timeValue) : 'Select time'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* DURATION */}
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

            {error !== '' && (
              <View style={styles.errorBox}>
                <Text style={styles.validationErrorText}>{error}</Text>
              </View>
            )}

            {apiError && (
              <View style={styles.apiError}>
                <Text style={styles.apiErrorText}>
                  {(apiError as any)?.message ?? 'Booking failed. Please try again.'}
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

        {showDatePicker && (
          <DateTimePicker
            value={dateValue ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(event, selected) => {
              setShowDatePicker(false);
              if (event.type !== 'dismissed' && selected) setDateValue(selected);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={timeValue ?? new Date()}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selected) => {
              setShowTimePicker(false);
              if (event.type !== 'dismissed' && selected) setTimeValue(selected);
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
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
  fieldLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  required: { color: COLORS.danger },
  pickerField: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  pickerPlaceholder: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textTertiary,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  apiError: {
    backgroundColor: COLORS.errorBg, borderWidth: 1, borderColor: COLORS.errorBorder,
    borderRadius: SPACING.borderRadius.md, padding: SPACING.md,
  },
  apiErrorText: { color: COLORS.danger, fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center' },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: SPACING.borderRadius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  validationErrorText: {
    color: COLORS.errorText,
    fontSize: TYPOGRAPHY.fontSize.md,
    textAlign: 'center',
  },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  errorText: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textPrimary },
});
