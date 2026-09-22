// src/screens/provider/ProviderServicesScreen.tsx

import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Switch, RefreshControl, StyleSheet, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ProviderServiceDto } from '@/service/providerService';
import {
  useMyServices,
  useToggleServiceActive,
  PROVIDER_SERVICE_KEYS,
} from '@/hooks/useProviderServices';
import {
  Badge, Card, ScreenHeader,
  LoadingState, ErrorState, EmptyState,
} from '@/components/common';
import { useIsOnline } from '@/hooks/useIsOnline';
import { haptics } from '@/utils/haptics';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { FLOATING_TAB_BAR_INSET } from '@/constants/layout';
import { TYPOGRAPHY } from '@/constants/typography';
import { ProviderStackParamList } from '@/navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<ProviderStackParamList, 'ProviderServices'>;

function formatPrice(s: ProviderServiceDto): string {
  const c = s.currency ?? 'MWK';
  if (s.pricingType === 'negotiable') return 'Negotiable';
  if (s.basePrice == null) return s.pricingType.replace('_', ' ');
  const n = s.basePrice.toLocaleString();
  if (s.pricingType === 'fixed')         return `${c} ${n}`;
  if (s.pricingType === 'hourly')        return `${c} ${n}/hr`;
  if (s.pricingType === 'starting_from') return `from ${c} ${n}`;
  return `${c} ${n}`;
}

export default function ProviderServicesScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NavProp>();
  const isOnline = useIsOnline();
  const qc = useQueryClient();

  const { data: services = [], isLoading, isError, refetch, isFetching } = useMyServices();
  const toggleActive = useToggleServiceActive();

  const handleToggle = (id: string, currentActive: boolean) => {
    if (!isOnline) {
      Alert.alert('No Connection', "You're offline. Please reconnect and try again.");
      return;
    }
    haptics.impact();
    qc.setQueryData<ProviderServiceDto[]>(PROVIDER_SERVICE_KEYS.myServices, (old) =>
      old?.map((s) => (s.id === id ? { ...s, isActive: !currentActive } : s)) ?? []
    );
    toggleActive.mutate(id, {
      onSuccess: () => haptics.success(),
      onError: () => {
        haptics.error();
        qc.setQueryData<ProviderServiceDto[]>(PROVIDER_SERVICE_KEYS.myServices, (old) =>
          old?.map((s) => (s.id === id ? { ...s, isActive: currentActive } : s)) ?? []
        );
      },
    });
  };

  const toForm = (serviceId?: string) =>
    navigation.navigate('ProviderServiceForm', { serviceId });

  const renderService = ({ item }: { item: ProviderServiceDto }) => (
    <Card gap={SPACING.xs} onPress={() => toForm(item.id)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        {/* Native size — a transform would shrink the drawing but not the
            layout box, leaving the switch visually off-centre in its slot. */}
        <Switch
          value={item.isActive}
          onValueChange={() => handleToggle(item.id, item.isActive)}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={COLORS.white}
        />
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.cardPrice}>{formatPrice(item)}</Text>
        <Badge
          label={item.isActive ? 'Active' : 'Inactive'}
          tone={item.isActive ? 'success' : 'neutral'}
        />
      </View>
      {!!item.categoryName && (
        <Text style={styles.cardCategory}>{item.categoryName}</Text>
      )}
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="My Services" onBack={() => navigation.goBack()} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="My Services" onBack={() => navigation.goBack()} />
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.background}
      />
      <ScreenHeader title="My Services" onBack={() => navigation.goBack()} />

      {services.length === 0 ? (
        <EmptyState
          icon="briefcase-outline"
          title="No services listed"
          message="You haven't listed any services yet."
          actionLabel="Create your first service"
          onAction={() => toForm()}
        />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={renderService}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      )}

      {services.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => toForm()}>
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    list: {
      padding: SPACING.screenPadding,
      gap: SPACING.md,
      paddingBottom: FLOATING_TAB_BAR_INSET,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: SPACING.sm,
    },
    cardTitle: {
      // Intent: a card title.
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.textPrimary,
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    cardPrice: {
      // Intent: an emphasised value.
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: COLORS.primary,
    },
    cardCategory: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.textTertiary,
    },
    fab: {
      position: 'absolute',
      right: SPACING.screenPadding,
      bottom: SPACING.xl,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 8,
    },
  });
