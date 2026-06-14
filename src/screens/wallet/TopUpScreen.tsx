// PLACE AT: src/screens/wallet/TopUpScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { walletService } from '@/service/walletService';

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

const PAYMENT_METHODS = [
  { id: 'airtel', name: 'Airtel Money', icon: 'phone-portrait-outline' },
  { id: 'tnm', name: 'TNM Mpamba', icon: 'phone-portrait-outline' },
  { id: 'bank', name: 'Bank Transfer', icon: 'card-outline' },
];

export default function TopUpScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('airtel');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const numericAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;

  const handleTopUp = async () => {
      if (numericAmount < 1000) return;
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      try {
        const result = await walletService.topUp(numericAmount, selectedMethod);
        if (result.success) {
          setSuccessMessage(result.message);
          setTimeout(() => navigation.goBack(), 2000);
        }
      } catch (e: any) {
        setErrorMessage(e?.message ?? 'Top-up failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Top Up Wallet</Text>
          <View style={{ width: 30 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* AMOUNT INPUT */}
          <View style={styles.amountSection}>
            <Text style={styles.label}>Enter amount (MWK)</Text>
            <Input
              label=""
              placeholder="e.g. 10000"
              keyboardType="number-pad"
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
              leftIcon="cash-outline"
            />
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.quickChip, numericAmount === a && styles.quickChipActive]}
                  onPress={() => setAmount(String(a))}
                >
                  <Text style={[styles.quickChipLabel, numericAmount === a && styles.quickChipLabelActive]}>
                    {new Intl.NumberFormat('en-MW').format(a)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* PAYMENT METHOD */}
          <View style={styles.methodSection}>
            <Text style={styles.label}>Payment method</Text>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodRow, selectedMethod === method.id && styles.methodRowActive]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <View style={styles.methodIcon}>
                  <Ionicons name={method.icon as any} size={22} color={selectedMethod === method.id ? COLORS.primary : COLORS.textSecondary} />
                </View>
                <Text style={[styles.methodName, selectedMethod === method.id && { color: COLORS.primary }]}>
                  {method.name}
                </Text>
                {selectedMethod === method.id && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {numericAmount > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>MWK {new Intl.NumberFormat('en-MW').format(numericAmount)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fee</Text>
                <Text style={styles.summaryValue}>MWK 0</Text>
              </View>
              <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: COLORS.divider, paddingTop: SPACING.sm }]}>
                <Text style={[styles.summaryLabel, { fontFamily: TYPOGRAPHY.fontFamily.medium }]}>Total</Text>
                <Text style={[styles.summaryValue, { fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.primary }]}>
                  MWK {new Intl.NumberFormat('en-MW').format(numericAmount)}
                </Text>
              </View>
            </View>
          )}

          {successMessage !== '' && (
              <View style={{ backgroundColor: COLORS.successBg, borderWidth: 1, borderColor: COLORS.successBorder, borderRadius: SPACING.borderRadius.md, padding: SPACING.md }}>
                <Text style={{ color: COLORS.successText, fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center' }}>
                  ✓ {successMessage}
                </Text>
              </View>
            )}

            {errorMessage !== '' && (
              <View style={{ backgroundColor: COLORS.errorBg, borderWidth: 1, borderColor: COLORS.errorBorder, borderRadius: SPACING.borderRadius.md, padding: SPACING.md }}>
                <Text style={{ color: COLORS.danger, fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center' }}>
                  {errorMessage}
                </Text>
              </View>
            )}

          <Button
            label={`Top Up MWK ${numericAmount > 0 ? new Intl.NumberFormat('en-MW').format(numericAmount) : ''}`}
            onPress={handleTopUp}
            isLoading={isLoading}
            disabled={numericAmount < 1000}
            fullWidth size="lg"
          />

          {numericAmount > 0 && numericAmount < 1000 && (
            <Text style={styles.minAmount}>Minimum top-up amount is MWK 1,000</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.screenPadding, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider, backgroundColor: COLORS.surface,
  },
  headerTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  content: { padding: SPACING.screenPadding, gap: SPACING.lg, paddingBottom: SPACING.xxl },
  amountSection: { gap: SPACING.md },
  label: { fontSize: TYPOGRAPHY.fontSize.md, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  quickChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  quickChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  quickChipLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  quickChipLabelActive: { color: COLORS.white, fontFamily: TYPOGRAPHY.fontFamily.medium },
  methodSection: { gap: SPACING.sm },
  methodRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  methodRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  methodIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  methodName: { flex: 1, fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary },
  summaryCard: {
    backgroundColor: COLORS.surface, borderRadius: SPACING.borderRadius.lg,
    padding: SPACING.lg, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.divider,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary },
  summaryValue: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary },
  minAmount: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.danger, textAlign: 'center' },
});
