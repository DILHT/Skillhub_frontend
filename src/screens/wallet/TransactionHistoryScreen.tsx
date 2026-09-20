// src/screens/wallet/TransactionHistoryScreen.tsx

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { walletService } from "@/service/walletService";
import { Transaction } from "@/types/wallet.types";
import { useAppTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";
import { useShadows } from "@/constants/shadows";

const TYPE_ICONS: Record<string, string> = {
  deposit: "arrow-down-circle-outline",
  withdrawal: "arrow-up-circle-outline",
  service_payment: "cart-outline",
  service_refund: "refresh-circle-outline",
  platform_fee: "receipt-outline",
  bonus: "gift-outline",
};

const CREDIT_TYPES = ["deposit", "service_refund", "bonus"];

const FILTERS = [
  { label: "All", icon: "apps-outline", types: null as string[] | null },
  { label: "Top-ups", icon: "arrow-down-circle-outline", types: ["deposit"] },
  { label: "Payments", icon: "cart-outline", types: ["service_payment"] },
  {
    label: "Refunds",
    icon: "refresh-circle-outline",
    types: ["service_refund"],
  },
];

const fmt = (n: number) => new Intl.NumberFormat("en-MW").format(n);

function dayLabel(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const startOf = (dt: Date) =>
    new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const diffDays = Math.round(
    (startOf(now).getTime() - startOf(d).getTime()) / 86400000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-MW", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function groupByDay(items: Transaction[]) {
  const map = new Map<string, Transaction[]>();
  for (const item of items) {
    const key = dayLabel(item.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

export default function TransactionHistoryScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState(0);
  const shadows = useShadows(isDark);
  const shadowStyle = isDark ? shadows.tinted.sm : shadows.sm;

  const {
    data: transactions = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: walletService.getTransactions,
    staleTime: 60 * 1000,
  });

  const filtered = FILTERS[activeFilter].types
    ? (transactions as Transaction[]).filter((t) =>
        FILTERS[activeFilter].types!.includes(t.type),
      )
    : (transactions as Transaction[]);

  const sections = useMemo(() => groupByDay(filtered), [filtered]);

  const header = (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>
      <View style={styles.filterRow} accessibilityRole="tablist">
        {FILTERS.map((f, i) => {
          const isActive = activeFilter === i;
          return (
            <TouchableOpacity
              key={f.label}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(i)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.filterLabel,
                  isActive && styles.filterLabelActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {header}
        <View style={styles.body}>
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading transactions…</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {header}
      <View style={styles.body}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          renderItem={({ item, index, section }) => {
            const isCredit = CREDIT_TYPES.includes(item.type);
            const isLast = index === section.data.length - 1;
            return (
              <View style={[styles.txnRow, !isLast && styles.txnRowDivider, shadowStyle]}>
                <View
                  style={[
                    styles.txnIcon,
                    {
                      backgroundColor: isCredit
                        ? COLORS.successBg
                        : COLORS.errorBg,
                    },
                  ]}
                >
                  <Ionicons
                    name={(TYPE_ICONS[item.type] ?? "receipt-outline") as any}
                    size={19}
                    color={isCredit ? COLORS.successText : COLORS.errorText}
                  />
                </View>
                <View style={styles.txnInfo}>
                  <Text style={styles.txnDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={styles.txnTime}>
                    {new Date(item.createdAt).toLocaleTimeString("en-MW", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.txnAmount,
                    { color: isCredit ? COLORS.success : COLORS.textPrimary },
                  ]}
                >
                  {isCredit ? "+" : "−"} MWK {fmt(item.amount)}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Ionicons
                  name="receipt-outline"
                  size={32}
                  color={COLORS.textTertiary}
                />
              </View>
              <Text style={styles.emptyTitle}>No transactions found</Text>
              <Text style={styles.emptySubtitle}>
                {FILTERS[activeFilter].label === "All"
                  ? "Your transactions will show up here once you top up or make a payment."
                  : `You have no ${FILTERS[activeFilter].label.toLowerCase()} yet.`}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.surface },
    body: { flex: 1, backgroundColor: COLORS.background },
    header: {
      paddingTop: SPACING.sm,
      backgroundColor: COLORS.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS.divider,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      paddingHorizontal: SPACING.screenPadding,
      paddingBottom: SPACING.sm,
    },
    backButton: {
      width: 30,
      height: 38,
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.textPrimary,
    },
    filterRow: {
      flexDirection: "row",
      gap: SPACING.sm,
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.xs,
      paddingBottom: SPACING.md,
    },
    filterChip: {
      height: 36,

      paddingHorizontal: SPACING.md,

      borderRadius: 18,

      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 6,
    },
    filterChipActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    filterLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textSecondary,
    },
    filterLabelActive: {
      color: COLORS.white,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
    },
    listContent: {
      flexGrow: 1,
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.lg,
      paddingBottom: SPACING.xxxl,
      gap: SPACING.md,
    },
    sectionHeader: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textSecondary,
      letterSpacing: 0.5,
    },
    txnRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: COLORS.surface,
      paddingHorizontal: SPACING.md,
      borderRadius: SPACING.borderRadius.lg,
    },
    txnRowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS.divider,
    },
    txnIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
    },
    txnInfo: { flex: 1, gap: 2 },
    txnDesc: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textPrimary,
    },
    txnTime: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
      marginTop: 1,
    },
    txnAmount: {
      maxWidth: "35%",
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
    },
    empty: {
      alignItems: "center",
      paddingTop: SPACING.xxxl,
      paddingHorizontal: SPACING.xl,
      gap: SPACING.sm,
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.surfaceSecondary,
      marginBottom: 4,
    },
    emptyTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
    },
    emptySubtitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 12,
    },
    loadingText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
    },
  });
