// src/screens/provider/ProviderServiceFormScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView,
  Switch, StyleSheet, StatusBar, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProviderStackParamList } from '@/navigation/AppNavigator';
import { CreateServicePayload, ServicePricingType, UpdateServicePayload } from '@/service/providerService';
import { useMyServices, useCreateService, useUpdateService, useSkillCategories, useSkillsByCategory } from '@/hooks/useProviderServices';
import {
  Button, Chip, Input, ScreenHeader, SectionHeader,
  LoadingState, ErrorState,
} from '@/components/common';
import { useIsOnline } from '@/hooks/useIsOnline';
import { haptics } from '@/utils/haptics';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors, getCardStyle } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

type RouteProps = RouteProp<ProviderStackParamList, 'ProviderServiceForm'>;

// ── Schema ────────────────────────────────────────────────────────────────────

const PRICING_TYPE_VALUES = ['fixed', 'hourly', 'negotiable', 'starting_from'] as const;

const PRICING_OPTIONS: { value: ServicePricingType; label: string }[] = [
  { value: 'fixed',        label: 'Fixed Price' },
  { value: 'hourly',       label: 'Hourly' },
  { value: 'negotiable',   label: 'Negotiable' },
  { value: 'starting_from', label: 'Starting From' },
];

const schema = z
  .object({
    categoryId:               z.string().min(1, 'Select a category'),
    skillId:                  z.string().min(1, 'Select a skill'),
    title:                    z.string().trim().min(3, 'At least 3 characters').max(100, 'Max 100 characters'),
    description:              z.string().trim().min(10, 'At least 10 characters').max(500, 'Max 500 characters'),
    pricingType:              z.enum(PRICING_TYPE_VALUES, { error: 'Select a pricing type' }),
    basePrice:                z.string().optional(),
    isRemoteAvailable:        z.boolean(),
    estimatedDurationMinutes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (['fixed', 'hourly', 'starting_from'].includes(data.pricingType)) {
      const val = parseFloat(data.basePrice ?? '');
      if (isNaN(val) || val <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid price greater than 0',
          path: ['basePrice'],
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProviderServiceFormScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<ProviderStackParamList, 'ProviderServiceForm'>>();
  const route = useRoute<RouteProps>();
  const { serviceId } = route.params;
  const isEditMode = !!serviceId;
  const isOnline = useIsOnline();
  const [apiError, setApiError] = useState<string | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: services = [], isLoading: servicesLoading } = useMyServices();
  const editService = isEditMode ? services.find((s) => s.id === serviceId) : undefined;

  const { data: categories = [], isLoading: categoriesLoading } = useSkillCategories();

  const {
    control, handleSubmit, watch, reset, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: '',
      skillId: '',
      title: '',
      description: '',
      pricingType: 'fixed',
      basePrice: '',
      isRemoteAvailable: false,
      estimatedDurationMinutes: '',
    },
  });

  const watchedCategoryId = watch('categoryId') || null;
  const watchedPricingType = watch('pricingType');
  const needsPrice = ['fixed', 'hourly', 'starting_from'].includes(watchedPricingType);

  const { data: skills = [], isLoading: skillsLoading } = useSkillsByCategory(watchedCategoryId);

  // ── Prefill for edit mode ─────────────────────────────────────────────────
  useEffect(() => {
    if (editService) {
      reset({
        categoryId:               editService.categoryId ?? '',
        skillId:                  editService.skillId,
        title:                    editService.title,
        description:              editService.description ?? '',
        pricingType:              editService.pricingType,
        basePrice:                editService.basePrice != null ? String(editService.basePrice) : '',
        isRemoteAvailable:        editService.isRemoteAvailable,
        estimatedDurationMinutes: editService.estimatedDurationMinutes != null
          ? String(editService.estimatedDurationMinutes)
          : '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editService?.id]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  const onSubmit = (values: FormValues) => {
    if (!isOnline) {
      Alert.alert('No Connection', "You're offline. Please reconnect and try again.");
      return;
    }
    setApiError(null);

    const basePrice = values.basePrice ? parseFloat(values.basePrice) : undefined;
    const estimatedDurationMinutes = values.estimatedDurationMinutes
      ? parseInt(values.estimatedDurationMinutes, 10)
      : undefined;

    if (isEditMode && serviceId) {
      const payload: UpdateServicePayload = {
        skillId: values.skillId,
        title:   values.title.trim(),
        description: values.description.trim(),
        pricingType: values.pricingType,
        basePrice: needsPrice ? basePrice ?? null : null,
        isRemoteAvailable: values.isRemoteAvailable,
        estimatedDurationMinutes: estimatedDurationMinutes ?? null,
      };
      updateMutation.mutate(
        { id: serviceId, payload },
        {
          onSuccess: () => { haptics.success(); navigation.goBack(); },
          onError:   () => { haptics.error(); setApiError('Failed to update service. Please try again.'); },
        }
      );
    } else {
      const payload: CreateServicePayload = {
        skillId: values.skillId,
        title:   values.title.trim(),
        description: values.description.trim(),
        pricingType: values.pricingType,
        basePrice: needsPrice ? basePrice : undefined,
        isRemoteAvailable: values.isRemoteAvailable,
        estimatedDurationMinutes,
      };
      createMutation.mutate(payload, {
        onSuccess: () => { haptics.success(); navigation.goBack(); },
        onError:   () => { haptics.error(); setApiError('Failed to create service. Please try again.'); },
      });
    }
  };

  const isBusy = createMutation.isPending || updateMutation.isPending;

  // Loading / error gates for edit mode
  if (isEditMode && servicesLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          title="Edit Service"
          onBack={() => navigation.goBack()}
        />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (isEditMode && !editService) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          title="Edit Service"
          onBack={() => navigation.goBack()}
        />
        <ErrorState title="Service not found" message="This service could not be loaded." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.background}
      />
      <ScreenHeader
        title={isEditMode ? 'Edit Service' : 'New Service'}
        onBack={() => navigation.goBack()}
      />

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

          {/* ── Category ─────────────────────────────────────────────── */}
          <View>
            <SectionHeader title="Service Category" variant="overline" />
            {categoriesLoading ? (
              <ActivityIndicator color={COLORS.primary} style={styles.loader} />
            ) : (
              <Controller
                control={control}
                name="categoryId"
                render={({ field, fieldState }) => (
                  <>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chipRow}
                    >
                      {categories.map((cat) => {
                        const active = field.value === cat.id;
                        return (
                          <Chip
                            key={cat.id}
                            label={cat.name}
                            active={active}
                            onPress={() => {
                              field.onChange(cat.id);
                              setValue('skillId', '');
                            }}
                          />
                        );
                      })}
                    </ScrollView>
                    {!!fieldState.error && (
                      <Text style={styles.fieldError}>{fieldState.error.message}</Text>
                    )}
                  </>
                )}
              />
            )}
          </View>

          {/* ── Skill ────────────────────────────────────────────────── */}
          {!!watchedCategoryId && (
            <View>
              <SectionHeader title="Skill" variant="overline" />
              {skillsLoading ? (
                <ActivityIndicator color={COLORS.primary} style={styles.loader} />
              ) : (
                <Controller
                  control={control}
                  name="skillId"
                  render={({ field, fieldState }) => (
                    <>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipRow}
                      >
                        {skills.map((sk) => {
                          const active = field.value === sk.id;
                          return (
                            <Chip
                              key={sk.id}
                              label={sk.name}
                              active={active}
                              onPress={() => field.onChange(sk.id)}
                            />
                          );
                        })}
                      </ScrollView>
                      {!!fieldState.error && (
                        <Text style={styles.fieldError}>{fieldState.error.message}</Text>
                      )}
                    </>
                  )}
                />
              )}
            </View>
          )}

          {/* ── Title ────────────────────────────────────────────────── */}
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <Input
                label="Title"
                isRequired
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                placeholder="e.g. Professional Plumbing Repair"
                returnKeyType="next"
              />
            )}
          />

          {/* ── Description ──────────────────────────────────────────── */}
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Input
                label="Description"
                isRequired
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                placeholder="Describe your service, experience, and what's included…"
                multiline
                numberOfLines={4}
                style={{ height: 100, textAlignVertical: 'top' }}
              />
            )}
          />

          {/* ── Pricing Type ─────────────────────────────────────────── */}
          <View>
            <SectionHeader title="Pricing Type" variant="overline" />
            <Controller
              control={control}
              name="pricingType"
              render={({ field, fieldState }) => (
                <>
                  <View style={styles.pricingGrid}>
                    {PRICING_OPTIONS.map((opt) => {
                      const active = field.value === opt.value;
                      return (
                        <Chip
                          key={opt.value}
                          label={opt.label}
                          active={active}
                          onPress={() => field.onChange(opt.value)}
                          variant="block"
                          size="md"
                          style={styles.pricingCell}
                        />
                      );
                    })}
                  </View>
                  {!!fieldState.error && (
                    <Text style={styles.fieldError}>{fieldState.error.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          {/* ── Base Price (conditional) ──────────────────────────────── */}
          {needsPrice && (
            <Controller
              control={control}
              name="basePrice"
              render={({ field, fieldState }) => (
                <Input
                  label="Price (MWK)"
                  isRequired
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  placeholder="e.g. 5000"
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              )}
            />
          )}

          {/* ── Remote Available ─────────────────────────────────────── */}
          <Controller
            control={control}
            name="isRemoteAvailable"
            render={({ field }) => (
              <View style={styles.switchRow}>
                <View style={styles.switchLabelGroup}>
                  <Text style={styles.switchLabel}>Available Remotely</Text>
                  <Text style={styles.switchHint}>Can you deliver this service online?</Text>
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

          {/* ── Duration (optional) ──────────────────────────────────── */}
          <Controller
            control={control}
            name="estimatedDurationMinutes"
            render={({ field, fieldState }) => (
              <Input
                label="Estimated Duration (minutes)"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                placeholder="e.g. 60  (optional)"
                keyboardType="numeric"
                returnKeyType="done"
                hint="Leave blank if duration varies"
              />
            )}
          />

          {/* ── API Error ────────────────────────────────────────────── */}
          {!!apiError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{apiError}</Text>
            </View>
          )}

          {/* ── Submit ───────────────────────────────────────────────── */}
          <Button
            label={isEditMode ? 'Save Changes' : 'Create Service'}
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

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (COLORS: AppColors, isDark: boolean) =>
  StyleSheet.create({
    safe:    { flex: 1, backgroundColor: COLORS.background },
    flex:    { flex: 1 },
    content: {
      padding: SPACING.screenPadding,
      gap: SPACING.md,
      paddingBottom: SPACING.xl,
    },

    loader: { marginVertical: SPACING.sm },
    fieldError: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.danger,
      marginTop: 4,
    },

    // Category / skill chip rows (content style for the horizontal ScrollView)
    chipRow: {
      gap: SPACING.sm,
      paddingBottom: 2,
      // contentContainer defaults to alignItems: 'stretch'.
      alignItems: 'center',
    },

    // Pricing type grid (2 per row) — the documented exception to Chip's
    // "always in a horizontal ScrollView" rule, hence variant="block".
    pricingGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
    pricingCell: {
      flex: 1,
      minWidth: '45%',
      justifyContent: 'center',
    },

    // Remote toggle row
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
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.textPrimary,
    },
    switchHint: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.textTertiary,
      marginTop: 2,
    },

    // API error box
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

    // Submit is the shared <Button size="lg" fullWidth /> — see the render above.
    // Do not add bespoke submit-button styles here.
  });
