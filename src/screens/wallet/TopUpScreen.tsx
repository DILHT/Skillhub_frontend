// PLACE AT: src/screens/wallet/TopUpScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { WalletStackParamList } from '@/navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Chip, Input, ScreenHeader } from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { walletService } from '@/service/walletService';
import { haptics } from '@/utils/haptics';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateWallet } from '@/hooks/useWallet';

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

const PAYMENT_METHODS = [
  { id: 'airtel', name: 'Airtel Money', icon: 'phone-portrait-outline' },
  { id: 'tnm', name: 'TNM Mpamba', icon: 'phone-portrait-outline' },
  { id: 'bank', name: 'Bank Transfer', icon: 'card-outline' },
];

export default function TopUpScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<WalletStackParamList, 'TopUp'>>();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('airtel');
  const isOnline = useIsOnline();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const numericAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;

  const handleTopUp = async () => {
      if (numericAmount < 1000) return;
      if (!isOnline) {
        setErrorMessage("You're offline. Please reconnect and try again.");
        return;
      }
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      try {
        const result = await walletService.topUp(numericAmount, selectedMethod);
        if (result.success) {
          haptics.success();
          // Bust the balance and ledger before navigating back, so the wallet
          // repaints with the new figure instead of the cached pre-top-up one.
          invalidateWallet(queryClient);
          setSuccessMessage(result.message);
          setTimeout(() => navigation.goBack(), 2000);
        }
      } catch (e: any) {
        haptics.error();
        setErrorMessage(e?.message ?? 'Top-up failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScreenHeader title="Top Up Wallet" onBack={() => navigation.goBack()} />

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
                <Chip
                  key={a}
                  label={new Intl.NumberFormat('en-MW').format(a)}
                  active={numericAmount === a}
                  onPress={() => setAmount(String(a))}
                />
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
            <Card gap={SPACING.sm}>
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
            </Card>
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
            label={numericAmount > 0 ? `Top Up MWK ${new Intl.NumberFormat('en-MW').format(numericAmount)}` : 'Top Up'}
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
  content: { padding: SPACING.screenPadding, gap: SPACING.lg, paddingBottom: SPACING.xxl },
  amountSection: { gap: SPACING.md },
  label: { fontSize: TYPOGRAPHY.fontSize.md, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  quickAmounts: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: SPACING.sm },
  methodSection: { gap: SPACING.sm },
  methodRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  methodRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  methodIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  methodName: { flex: 1, fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary },
  summaryValue: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary },
  minAmount: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.danger, textAlign: 'center' },
});
