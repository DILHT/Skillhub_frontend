// src/screens/provider/ProviderAvailabilityScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView,
  Switch, StyleSheet, StatusBar, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProviderStackParamList } from '@/navigation/AppNavigator';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import {
  useProviderProfile,
  useSetAvailabilityNow,
  useCreateProfile,
  useUpdateProfile,
} from '@/hooks/useProviderProfile';
import {
  Button, Card, Input, ListRow, ScreenHeader,
  LoadingState, ErrorState,
} from '@/components/common';
import { useIsOnline } from '@/hooks/useIsOnline';
import { haptics } from '@/utils/haptics';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors, getCardStyle } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

// ── Schema ─────────────────────────────────────────────────────────────────────

const schema = z.object({
  headline:            z.string().max(120, 'Max 120 characters'),
  professionalSummary: z.string().max(500, 'Max 500 characters'),
  yearsOfExperience:   z.string(),
  acceptsRemote:       z.boolean(),
  maxTravelDistanceKm: z.string(),
  responseTimeMinutes: z.string(),
});

type FormValues = z.infer<typeof schema>;

// ── Component ──────────────────────────────────────────────────────────────────

export default function ProviderAvailabilityScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<ProviderStackParamList, 'ProviderAvailability'>>();
  const isOnline = useIsOnline();
  const [isEditing, setIsEditing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useProviderProfile();
  const hasProfile = data?.hasProfile ?? false;
  const profile    = data?.profile;

  const setAvailability  = useSetAvailabilityNow();
  const createMutation   = useCreateProfile();
  const updateMutation   = useUpdateProfile();
  const isBusy = createMutation.isPending || updateMutation.isPending;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      headline: '', professionalSummary: '', yearsOfExperience: '',
      acceptsRemote: false, maxTravelDistanceKm: '', responseTimeMinutes: '',
    },
  });

  // Prefill form when entering edit mode
  useEffect(() => {
    if (isEditing && profile) {
      reset({
        headline:            profile.headline ?? '',
        professionalSummary: profile.professionalSummary ?? '',
        yearsOfExperience:   profile.yearsOfExperience != null ? String(profile.yearsOfExperience) : '',
        acceptsRemote:       profile.acceptsRemote,
        maxTravelDistanceKm: profile.maxTravelDistanceKm != null ? String(profile.maxTravelDistanceKm) : '',
        responseTimeMinutes: profile.responseTimeMinutes != null ? String(profile.responseTimeMinutes) : '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const handleAvailabilityToggle = (value: boolean) => {
    if (!isOnline) {
      Alert.alert('No Connection', "You're offline. Please reconnect and try again.");
      return;
    }
    haptics.impact();
    setAvailability.mutate(value, {
      onSuccess: () => haptics.success(),
      onError:   () => haptics.error(),
    });
  };

  const buildPayload = (values: FormValues) => ({
    headline:            values.headline.trim() || undefined,
    professionalSummary: values.professionalSummary.trim() || undefined,
    yearsOfExperience:   values.yearsOfExperience ? parseInt(values.yearsOfExperience, 10) : undefined,
    acceptsRemote:       values.acceptsRemote,
    maxTravelDistanceKm: values.maxTravelDistanceKm ? parseFloat(values.maxTravelDistanceKm) : undefined,
  });

  const onSubmit = (values: FormValues) => {
    if (!isOnline) {
      Alert.alert('No Connection', "You're offline. Please reconnect and try again.");
      return;
    }
    setApiError(null);

    if (hasProfile) {
      const responseTimeMinutes = values.responseTimeMinutes
        ? parseInt(values.responseTimeMinutes, 10)
        : undefined;
      updateMutation.mutate(
        { ...buildPayload(values), responseTimeMinutes },
        {
          onSuccess: () => { haptics.success(); setIsEditing(false); },
          onError:   () => { haptics.error(); setApiError('Failed to update profile. Please try again.'); },
        }
      );
    } else {
      createMutation.mutate(buildPayload(values), {
        onSuccess: () => haptics.success(),
        onError:   () => { haptics.error(); setApiError('Failed to create profile. Please try again.'); },
      });
    }
  };

  // ── States ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Profile & Availability" onBack={() => navigation.goBack()} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Profile & Availability" onBack={() => navigation.goBack()} />
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── No Profile — show create form ─────────────────────────────────────────

  if (!hasProfile) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <ScreenHeader title="Create Provider Profile" onBack={() => navigation.goBack()} />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
              <Text style={styles.infoBannerText}>
                Create your provider profile to appear in search results and receive bookings.
                All fields are optional.
              </Text>
            </View>
            <ProfileFormFields
              control={control}
              errors={errors}
              showResponseTime={false}
              styles={styles}
              COLORS={COLORS}
            />
            {!!apiError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{apiError}</Text>
              </View>
            )}
            <Button
              label="Create Profile"
              onPress={handleSubmit(onSubmit)}
              isLoading={isBusy}
              fullWidth
              size="lg"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Has Profile ────────────────────────────────────────────────────────────

  const isAvailable = profile?.isAvailableNow ?? false;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
      <ScreenHeader title="Profile & Availability" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Availability toggle ──────────────────────────────────── */}
          <View style={[styles.availCard, isAvailable ? styles.availCardOn : styles.availCardOff]}>
            <View style={styles.availLeft}>
              <View style={[styles.availDot, isAvailable ? styles.availDotOn : styles.availDotOff]} />
              <View>
                <Text style={[styles.availTitle, { color: isAvailable ? COLORS.white : COLORS.textPrimary }]}>
                  {isAvailable ? 'Available for Bookings' : 'Currently Unavailable'}
                </Text>
                <Text style={[styles.availSubtitle, { color: isAvailable ? 'rgba(255,255,255,0.75)' : COLORS.textSecondary }]}>
                  {isAvailable ? 'Clients can see and book you now' : 'You are hidden from search results'}
                </Text>
              </View>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={handleAvailabilityToggle}
              trackColor={{ false: COLORS.border, true: 'rgba(255,255,255,0.4)' }}
              thumbColor={COLORS.white}
              disabled={setAvailability.isPending}
            />
          </View>

          {/* ── Stats ────────────────────────────────────────────────── */}
          <View style={styles.statsRow}>
            <StatCard
              icon="star-outline"
              label="Rating"
              value={
                (profile?.totalReviews ?? 0) > 0
                  ? `${(profile?.averageRating ?? 0).toFixed(1)}`
                  : '—'
              }
              COLORS={COLORS}
            />
            <StatCard
              icon="chatbubble-outline"
              label="Reviews"
              value={
                (profile?.totalReviews ?? 0) > 0
                  ? String(profile?.totalReviews)
                  : 'None'
              }
              COLORS={COLORS}
            />
            <StatCard
              icon="checkmark-circle-outline"
              label="Jobs Done"
              value={String(profile?.totalJobsCompleted ?? 0)}
              COLORS={COLORS}
            />
            <StatCard
              icon="shield-checkmark-outline"
              label="Badge"
              value={profile?.badgeVerified ? 'Verified' : 'Pending'}
              valueColor={profile?.badgeVerified ? COLORS.success : COLORS.textTertiary}
              COLORS={COLORS}
            />
          </View>

          {/* ── Profile view / edit ──────────────────────────────────── */}
          {!isEditing ? (
            <>
              {/* Stacked rows: the label is a caption above each value, which
                  is what the old ProfileRow did with its fixed-width label. */}
              <Card padding="none" divided>
                {!!profile?.headline && (
                  <ListRow label="Headline" value={profile.headline} stacked />
                )}
                {!!profile?.professionalSummary && (
                  <ListRow label="Summary" value={profile.professionalSummary} stacked />
                )}
                {profile?.yearsOfExperience != null && (
                  <ListRow
                    label="Experience"
                    value={`${profile.yearsOfExperience} year${profile.yearsOfExperience !== 1 ? 's' : ''}`}
                    stacked
                  />
                )}
                <ListRow
                  label="Remote"
                  value={profile?.acceptsRemote ? 'Available remotely' : 'In-person only'}
                  stacked
                />
                {profile?.maxTravelDistanceKm != null && (
                  <ListRow
                    label="Travel radius"
                    value={`${profile.maxTravelDistanceKm} km`}
                    stacked
                  />
                )}
                {profile?.responseTimeMinutes != null && (
                  <ListRow
                    label="Response time"
                    value={`${profile.responseTimeMinutes} min`}
                    stacked
                  />
                )}
                {/* Placeholder if no details set */}
                {!profile?.headline && !profile?.professionalSummary && (
                  <Text style={[styles.emptyHint, { color: COLORS.textTertiary }]}>
                    No profile details added yet. Tap Edit to complete your profile.
                  </Text>
                )}
              </Card>

              <Button
                label="Edit Profile"
                variant="outline"
                size="md"
                fullWidth
                onPress={() => setIsEditing(true)}
                leftIcon={<Ionicons name="create-outline" size={18} color={COLORS.primary} />}
              />
            </>
          ) : (
            /* Edit form */
            <>
              <ProfileFormFields
                control={control}
                errors={errors}
                showResponseTime
                styles={styles}
                COLORS={COLORS}
              />
              {!!apiError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorBoxText}>{apiError}</Text>
                </View>
              )}
              <View style={styles.editActions}>
                <Button
                  label="Cancel"
                  variant="outline"
                  size="md"
                  onPress={() => { setIsEditing(false); setApiError(null); }}
                  disabled={isBusy}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Save Changes"
                  variant="primary"
                  size="md"
                  onPress={handleSubmit(onSubmit)}
                  isLoading={isBusy}
                  style={{ flex: 1 }}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

// Card owns the surface, radius and padding — this used to layer its own
// padding and radius on top of a getCardStyle() spread.
function StatCard({
  icon, label, value, valueColor, COLORS,
}: {
  icon: string; label: string; value: string;
  valueColor?: string; COLORS: AppColors;
}) {
  return (
    <Card padding="sm" gap={2} style={statStyles.card}>
      <Ionicons name={icon as any} size={18} color={COLORS.textTertiary} />
      <Text style={[statStyles.value, { color: valueColor ?? COLORS.textPrimary }]}>{value}</Text>
      <Text style={[statStyles.label, { color: COLORS.textTertiary }]}>{label}</Text>
    </Card>
  );
}

const statStyles = StyleSheet.create({
  card:  { flex: 1, alignItems: 'center' },
  // Intent: the emphasised value of the tile.
  value: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold },
  label: { fontSize: TYPOGRAPHY.fontSize.xs },
});

function ProfileFormFields({
  control, errors, showResponseTime, styles, COLORS,
}: {
  control: any; errors: any; showResponseTime: boolean;
  styles: ReturnType<typeof makeStyles>; COLORS: AppColors;
}) {
  return (
    <>
      <Controller
        control={control}
        name="headline"
        render={({ field, fieldState }) => (
          <Input
            label="Headline"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder="e.g. Professional Electrician with 8 years experience"
          />
        )}
      />
      <Controller
        control={control}
        name="professionalSummary"
        render={({ field, fieldState }) => (
          <Input
            label="Professional Summary"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder="Describe your skills, background, and what sets you apart…"
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />
        )}
      />
      <Controller
        control={control}
        name="yearsOfExperience"
        render={({ field, fieldState }) => (
          <Input
            label="Years of Experience"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder="e.g. 5"
            keyboardType="numeric"
          />
        )}
      />
      <Controller
        control={control}
        name="acceptsRemote"
        render={({ field }) => (
          <View style={styles.switchRow}>
            <View style={styles.switchLabelGroup}>
              <Text style={styles.switchLabel}>Available Remotely</Text>
              <Text style={styles.switchHint}>
                Clients can book you for work you do without travelling to them.
              </Text>
            </View>
            <Switch
              value={field.value}
              onValueChange={field.onChange}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        )}
      />
      <Controller
        control={control}
        name="maxTravelDistanceKm"
        render={({ field, fieldState }) => (
          <Input
            label="Max Travel Distance (km)"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder="e.g. 30"
            keyboardType="numeric"
            hint="Leave blank if unlimited"
          />
        )}
      />
      {showResponseTime && (
        <Controller
          control={control}
          name="responseTimeMinutes"
          render={({ field, fieldState }) => (
            <Input
              label="Typical Response Time (minutes)"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              placeholder="e.g. 30"
              keyboardType="numeric"
              hint="How quickly you typically reply to bookings"
            />
          )}
        />
      )}
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const makeStyles = (COLORS: AppColors, isDark: boolean) =>
  StyleSheet.create({
    safe:    { flex: 1, backgroundColor: COLORS.background },
    flex:    { flex: 1 },
    content: { padding: SPACING.screenPadding, gap: SPACING.md, paddingBottom: SPACING.xl },

    // Info banner
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.sm,
      backgroundColor: COLORS.infoLight,
      borderRadius: SPACING.borderRadius.md,
      padding: SPACING.md,
    },
    infoBannerText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.info,
      lineHeight: 20,
    },

    // Availability card
    availCard: {
      borderRadius: SPACING.borderRadius.lg,
      padding: SPACING.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
    },
    availCardOn:  { backgroundColor: COLORS.success },
    availCardOff: {
      ...getCardStyle(isDark),
      borderRadius: SPACING.borderRadius.lg,
    },
    availLeft:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
    availDot:     { width: 10, height: 10, borderRadius: 5 },
    availDotOn:   { backgroundColor: 'rgba(255,255,255,0.9)' },
    availDotOff:  { backgroundColor: COLORS.textTertiary },
    availTitle:   { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold },
    availSubtitle:{ fontSize: TYPOGRAPHY.fontSize.xs },

    // Stats row
    statsRow: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },

    // Profile card
    card: {
      ...getCardStyle(isDark),
      borderRadius: SPACING.borderRadius.lg,
      padding: SPACING.cardPadding,
      gap: 2,
    },
    emptyHint: { fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center', paddingVertical: SPACING.sm },

    // Edit-mode action pair — the buttons themselves are <Button size="md">.
    editActions: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },

    // Remote toggle row (used by ProfileFormFields)
    switchRow: {
      ...getCardStyle(isDark),
      borderRadius: SPACING.borderRadius.lg,
      padding: SPACING.cardPadding,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.md,
    },
    switchLabelGroup: { flex: 1 },
    switchLabel: {
      // Intent: a form field label.
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.textPrimary,
    },
    switchHint: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.textTertiary,
      marginTop: 2,
    },
    errorBox: {
      backgroundColor: COLORS.errorBg,
      borderWidth: 1,
      borderColor: COLORS.errorBorder,
      borderRadius: SPACING.borderRadius.md,
      padding: SPACING.md,
    },
    errorBoxText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.errorText,
    },
  });
