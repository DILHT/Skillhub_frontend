// src/screens/home/ProviderProfileScreen.tsx

import React from 'react';
import {
  View, Text, ScrollView,
  StyleSheet, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/service/api';
import { PROVIDER_SERVICE_KEYS } from '@/hooks/useProviderServices';
import { Avatar } from '@/components/common/Avatar';
import { ScreenHeader, SectionHeader } from '@/components/common';
import { RatingStars } from '@/components/service/RatingStars';
import { ServiceCard } from '@/components/service/ServiceCard';
import { Skeleton, ServiceCardSkeleton } from '@/components/common/Skeleton';
import { HomeStackParamList } from '@/navigation/AppNavigator';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { transformService } from '@/service/serviceService';

type RouteProps = RouteProp<HomeStackParamList, 'ProviderProfile'>;

function useProviderProfile(providerId: string) {
  return useQuery({
    queryKey: ['provider', providerId],
    queryFn: async () => {
      const response = await apiClient.get(`/providers/${providerId}`);
      return response.data;
    },
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000,
  });
}

function useProviderServices(providerId: string) {
  return useQuery({
    // Namespaced under 'byProvider' so the owner's own listings
    // (PROVIDER_SERVICE_KEYS.myServices) no longer share this prefix.
    queryKey: PROVIDER_SERVICE_KEYS.byProvider(providerId),
    queryFn: async () => {
      const response = await apiClient.get(`/services/provider/${providerId}`);
      return response.data;
    },
    enabled: !!providerId,
  });
}

export default function ProviderProfileScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, 'ProviderProfile'>>();
  const route = useRoute<RouteProps>();
  const { providerId } = route.params;

  const { data: provider, isLoading: providerLoading } = useProviderProfile(providerId);
  const { data: servicesData, isLoading: servicesLoading } = useProviderServices(providerId);

  const rawServices = servicesData?.services ?? servicesData ?? [];
  const services = Array.isArray(rawServices) ? rawServices : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Provider Profile" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {providerLoading ? (
          <View style={styles.loadingCard}>
            <Skeleton width={72} height={72} borderRadius={36} />
            <Skeleton width={160} height={18} />
            <Skeleton width={100} height={14} />
          </View>
        ) : provider ? (
          <>
            {/* PROFILE CARD */}
            <View style={styles.profileCard}>
              <Avatar
                uri={provider.user?.avatarUrl ?? provider.avatarUrl ?? null}
                name={`${provider.user?.firstName ?? ''} ${provider.user?.lastName ?? ''}`}
                size="xl"
                showVerifiedBadge={provider.badgeVerified}
              />
              <Text style={styles.name}>
                {provider.user?.firstName ?? ''} {provider.user?.lastName ?? ''}
              </Text>
              {provider.headline && (
                <Text style={styles.headline}>{provider.headline}</Text>
              )}

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <RatingStars rating={provider.averageRating ?? 0} compact size={14} />
                  <Text style={styles.statLabel}>{provider.totalReviews ?? 0} reviews</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{provider.totalJobsCompleted ?? 0}</Text>
                  <Text style={styles.statLabel}>jobs done</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {provider.responseTimeMinutes
                      ? `${provider.responseTimeMinutes}m`
                      : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>response</Text>
                </View>
              </View>

              {provider.isAvailableNow && (
                <View style={styles.availableBadge}>
                  <View style={styles.availableDot} />
                  <Text style={styles.availableText}>Available now</Text>
                </View>
              )}
            </View>

            {/* ABOUT */}
            {provider.professionalSummary && (
              <View style={styles.section}>
                <SectionHeader title="About" />
                <Text style={styles.bio}>{provider.professionalSummary}</Text>
              </View>
            )}

            {/* SERVICES */}
            <View style={styles.section}>
              <SectionHeader title="Services offered" />
              {servicesLoading ? (
                <><ServiceCardSkeleton /><ServiceCardSkeleton /></>
              ) : services.length > 0 ? (
                services.map((s: any) => (
                  <ServiceCard key={s.id} service={transformService(s)} />
                ))
              ) : (
                <Text style={styles.emptyText}>No services listed yet</Text>
              )}
            </View>
          </>
        ) : (
          <View style={styles.errorState}>
            <Ionicons name="person-outline" size={40} color={COLORS.textTertiary} />
            <Text style={styles.errorText}>Provider not found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.screenPadding, gap: SPACING.lg, paddingBottom: SPACING.xxl },
  profileCard: {
    backgroundColor: COLORS.surface, borderRadius: SPACING.borderRadius.lg,
    padding: SPACING.lg, alignItems: 'center', gap: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.divider,
  },
  name: { fontSize: TYPOGRAPHY.fontSize.xl, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  headline: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary, textAlign: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.sm },
  statItem: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: TYPOGRAPHY.fontSize.lg, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  statLabel: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.divider },
  availableBadge: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.successBg, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderRadius: SPACING.borderRadius.full,
  },
  availableDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  availableText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.successText, fontFamily: TYPOGRAPHY.fontFamily.medium },
  section: { gap: SPACING.md },
  bio: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary, lineHeight: 24 },
  emptyText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  errorState: { alignItems: 'center', paddingTop: SPACING.xxxl, gap: SPACING.md },
  errorText: { fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.textPrimary },
  loadingCard: {
    backgroundColor: COLORS.surface, borderRadius: SPACING.borderRadius.lg,
    padding: SPACING.lg, alignItems: 'center', gap: SPACING.md,
  },
  avatarSkeleton: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.border },
  textSkeleton: { width: 160, height: 18, borderRadius: 4, backgroundColor: COLORS.border },
  textSkeletonShort: { width: 100, height: 14, borderRadius: 4, backgroundColor: COLORS.border },
});
