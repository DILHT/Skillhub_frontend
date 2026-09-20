// PLACE AT: src/screens/wallet/TopUpScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/common";
import { useAppTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";
import { walletService } from "@/service/walletService";

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];

const PAYMENT_METHODS = [
  {
    id: "airtel",
    name: "Airtel Money",
    sub: "Mobile money",
    icon: "phone-portrait-outline",
    tint: "#E4002B",
  },
  {
    id: "tnm",
    name: "TNM Mpamba",
    sub: "Mobile money",
    icon: "phone-portrait-outline",
    tint: "#40a347",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    sub: "1-2 business days",
    icon: "card-outline",
    tint: "#2E6DF0",
  },
];

const fmt = (n: number) => new Intl.NumberFormat("en-MW").format(n);

export default function TopUpScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("airtel");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  const numericAmount = parseInt(amount.replace(/[^0-9]/g, ""), 10) || 0;
  const formattedAmount = amount ? fmt(numericAmount) : "";
  const amountInputWidth = Math.max(60, formattedAmount.length * 24 + 4);
  const isValid = numericAmount >= 1000;
  const activeMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethod)!;

  const handleTopUp = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const result = await walletService.topUp(numericAmount, selectedMethod);
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => navigation.goBack(), 2000);
      }
    } catch (e: any) {
      setErrorMessage(e?.message ?? "Top-up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.screenContent}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Top Up Wallet</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.amountHero}>
              <Text style={styles.amountHeroLabel}>Enter amount</Text>
              <View
                style={[
                  styles.amountInputRow,
                  inputFocused && styles.amountInputRowFocused,
                ]}
              >
                <Text
                  style={[
                    styles.currencyPrefix,
                    numericAmount > 0 && styles.currencyPrefixActive,
                  ]}
                >
                  MWK
                </Text>
                <TextInput
                  keyboardAppearance={isDark ? "dark" : "light"}
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="number-pad"
                  value={formattedAmount}
                  onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ""))}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  style={[styles.amountInput, { width: amountInputWidth }]}
                />
              </View>

              <View style={styles.quickAmounts}>
                {QUICK_AMOUNTS.map((a) => {
                  const active = numericAmount === a;
                  return (
                    <TouchableOpacity
                      key={a}
                      style={[
                        styles.quickChip,
                        active && styles.quickChipActive,
                      ]}
                      onPress={() => setAmount(String(numericAmount + a))}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        style={[
                          styles.quickChipLabel,
                          active && styles.quickChipLabelActive,
                        ]}
                      >
                        +{a >= 1000 ? `${a / 1000}K` : a}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {numericAmount > 0 && numericAmount < 1000 && (
                <View style={styles.inlineWarning}>
                  <Ionicons
                    name="information-circle"
                    size={14}
                    color={COLORS.danger}
                  />
                  <Text style={styles.minAmount}>
                    Minimum top-up is MWK 1,000
                  </Text>
                </View>
              )}
            </View>

            {/* PAYMENT METHOD */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Payment method</Text>
              <View style={styles.methodGroup}>
                {PAYMENT_METHODS.map((method, idx) => {
                  const active = selectedMethod === method.id;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.methodRow,
                        idx !== PAYMENT_METHODS.length - 1 &&
                          styles.methodRowDivider,
                        active && styles.methodRowActive,
                      ]}
                      onPress={() => setSelectedMethod(method.id)}
                      activeOpacity={0.7}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                    >
                      <View
                        style={[
                          styles.methodIcon,
                          {
                            backgroundColor: active
                              ? method.tint
                              : COLORS.surfaceSecondary,
                          },
                        ]}
                      >
                        <Ionicons
                          name={method.icon as any}
                          size={18}
                          color={active ? "#FFFFFF" : COLORS.textSecondary}
                        />
                      </View>
                      <View style={styles.methodTextGroup}>
                        <Text
                          style={[
                            styles.methodName,
                            active && { color: COLORS.primary },
                          ]}
                        >
                          {method.name}
                        </Text>
                        <Text style={styles.methodSub}>{method.sub}</Text>
                      </View>
                      <View
                        style={[
                          styles.radioOuter,
                          active && { borderColor: COLORS.primary },
                        ]}
                      >
                        {active && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* SUMMARY */}
            {numericAmount > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Summary</Text>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Amount</Text>
                    <Text style={styles.summaryValue}>
                      MWK {fmt(numericAmount)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Via</Text>
                    <Text style={styles.summaryValue}>{activeMethod.name}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Fee</Text>
                    <Text style={styles.summaryValue}>MWK 0</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryTotalLabel}>Total</Text>
                    <Text style={styles.summaryTotalValue}>
                      MWK {fmt(numericAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {successMessage !== "" && (
              <View style={styles.successNotice}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={COLORS.successText}
                />
                <Text style={styles.successNoticeText}>{successMessage}</Text>
              </View>
            )}

            {errorMessage !== "" && (
              <View style={styles.errorNotice}>
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={styles.errorNoticeText}>{errorMessage}</Text>
              </View>
            )}
          </ScrollView>

          {/* STICKY CTA */}
          <View style={styles.ctaBar}>
            <Button
              label={
                numericAmount > 0
                  ? `Top Up MWK ${fmt(numericAmount)}`
                  : "Enter an amount"
              }
              onPress={handleTopUp}
              isLoading={isLoading}
              disabled={!isValid}
              fullWidth
              size="md"
              style={{ borderRadius: SPACING.borderRadius.full }}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.surface },
    screenContent: { flex: 1, backgroundColor: COLORS.background },
    flex: { flex: 1 },

    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
      backgroundColor: COLORS.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS.divider,
    },
    backButton: {
      width: 30,
      height: 38,
      justifyContent: "center",
    },
    headerTitle: {
      marginRight: 30,
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.textPrimary,
    },

    content: {
      padding: SPACING.screenPadding,
      gap: SPACING.xl,
      paddingBottom: SPACING.xxxl,
    },

    // Amount hero
    amountHero: {
      gap: SPACING.md,
      paddingVertical: SPACING.lg,
    },
    amountHeroLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    amountInputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      borderBottomWidth: 1.5,
      borderBottomColor: COLORS.border,
      paddingBottom: SPACING.sm,
    },
    amountInputRowFocused: {
      borderBottomColor: COLORS.primary,
    },
    currencyPrefix: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textSecondary,
      marginBottom: 4,
    },
    currencyPrefixActive: {
      color: COLORS.textPrimary,
    },
    amountInput: {
      flex: 1,
      fontSize: 40,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.textPrimary,
      padding: 0,
    },

    quickAmounts: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.sm,
    },
    quickChip: {
      minHeight: 36,
      minWidth: 64,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: SPACING.md,
      borderRadius: SPACING.borderRadius.full,
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.surface,
    },
    quickChipActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    quickChipLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textSecondary,
    },
    quickChipLabelActive: {
      color: COLORS.white,
    },

    inlineWarning: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    minAmount: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.danger,
    },

    // Sections
    section: { gap: SPACING.sm },
    sectionLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    // Payment methods
    methodGroup: {
      padding: SPACING.sm,
      backgroundColor: COLORS.surface,
      borderRadius: SPACING.borderRadius.lg,
      borderWidth: 1,
      borderColor: COLORS.divider,
      overflow: "hidden",
    },
    methodRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
      minHeight: 64,
      paddingHorizontal: SPACING.md,
    },
    methodRowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS.divider,
    },
    methodRowActive: {
      backgroundColor: COLORS.primaryLight,
      borderRadius: SPACING.borderRadius.md,
    },
    methodIcon: {
      width: 40,
      height: 40,
      borderRadius: SPACING.borderRadius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    methodTextGroup: { flex: 1, gap: 2 },
    methodName: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
    },
    methodSub: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: COLORS.border,
      alignItems: "center",
      justifyContent: "center",
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: COLORS.primary,
    },

    // Summary
    summaryCard: {
      backgroundColor: COLORS.surface,
      borderRadius: SPACING.borderRadius.lg,
      padding: SPACING.lg,
      gap: SPACING.sm,
      borderWidth: 1,
      borderColor: COLORS.divider,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    summaryLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      color: COLORS.textSecondary,
    },
    summaryValue: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
      color: COLORS.textPrimary,
    },
    summaryDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: COLORS.divider,
      marginVertical: 2,
    },
    summaryTotalLabel: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      color: COLORS.textPrimary,
    },
    summaryTotalValue: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontFamily: TYPOGRAPHY.fontFamily.extraBold,
      color: COLORS.primary,
    },

    // Notices
    successNotice: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: COLORS.successBg,
      borderWidth: 1,
      borderColor: COLORS.successBorder,
      borderRadius: SPACING.borderRadius.md,
      padding: SPACING.md,
    },
    successNoticeText: {
      flex: 1,
      color: COLORS.successText,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },
    errorNotice: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: COLORS.errorBg,
      borderWidth: 1,
      borderColor: COLORS.errorBorder,
      borderRadius: SPACING.borderRadius.md,
      padding: SPACING.md,
    },
    errorNoticeText: {
      flex: 1,
      color: COLORS.danger,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontFamily: TYPOGRAPHY.fontFamily.medium,
    },

    // Sticky CTA
    ctaBar: {
      paddingHorizontal: SPACING.screenPadding,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
      backgroundColor: COLORS.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: COLORS.divider,
    },
  });
