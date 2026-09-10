// src/screens/wallet/WalletScreen.tsx

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { walletService } from "@/service/walletService";
import { Transaction } from "@/types/wallet.types";
import { useAppTheme } from "@/context/ThemeContext";
import { SPACING } from "@/constants/spacing";
import {
  TRANSACTION_TYPE_ICONS,
  CREDIT_TRANSACTION_TYPES,
} from "@/constants/wallet";
import { makeWalletStyles } from "@/styles/wallet.styles";

function formatAmount(amount: number, currency: string): string {
  return `${currency} ${new Intl.NumberFormat("en-MW").format(amount)}`;
}

export default function WalletScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeWalletStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: walletService.getBalance,
    staleTime: 30 * 1000,
  });

  const {
    data: transactions = [],
    isError: isTransactionsError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: walletService.getTransactions,
    staleTime: 60 * 1000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchBalance(), refetchTransactions()]);
    setIsRefreshing(false);
  };

  if (isBalanceError || isTransactionsError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centerState}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.textSecondary}
          />
          <Text style={styles.errorStateTitle}>Couldn't load</Text>
          <Text style={styles.errorStateText}>
            Something went wrong. Please check your connection and try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() =>
              Promise.all([refetchBalance(), refetchTransactions()])
            }
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const recentTransactions = (transactions as Transaction[]).slice(0, 3);
  const currency = balance?.currency ?? "MWK";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* BALANCE CARD */}
        <View style={styles.section}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              {isBalanceLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                formatAmount(balance?.balance ?? 0, currency)
              )}
            </Text>
            {balance && balance.escrowBalance > 0 && (
              <Text style={styles.escrowText}>
                + {formatAmount(balance.escrowBalance, currency)} in escrow
              </Text>
            )}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.75}
                onPress={() => navigation.navigate("TopUp")}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={21}
                  color={COLORS.white}
                />
                <Text style={styles.actionLabel}>Top Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.75}
                onPress={() =>
                  Alert.alert(
                    "Withdraw Funds",
                    "Withdrawal to mobile money will be available once your account is verified. Please complete identity verification first.",
                    [{ text: "OK" }],
                  )
                }
              >
                <Ionicons
                  name="arrow-down-circle-outline"
                  size={21}
                  color={COLORS.white}
                />
                <Text style={styles.actionLabel}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* RECENT TRANSACTIONS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent transactions</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Transactions")}
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionList}>
            {recentTransactions.length === 0 ? (
              <View style={styles.emptyTxn}>
                <Ionicons
                  name="receipt-outline"
                  size={28}
                  color={COLORS.textTertiary}
                />
                <Text style={styles.emptyTxnText}>No transactions yet</Text>
              </View>
            ) : (
              recentTransactions.map((txn: Transaction, index: number) => {
                const isCredit = CREDIT_TRANSACTION_TYPES.includes(txn.type);
                return (
                  <View key={txn.id}>
                    <View style={styles.txnRow}>
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
                          name={
                            (TRANSACTION_TYPE_ICONS[txn.type] ??
                              "receipt-outline") as any
                          }
                          size={17}
                          color={
                            isCredit ? COLORS.successText : COLORS.errorText
                          }
                        />
                      </View>
                      <View style={styles.txnInfo}>
                        <Text style={styles.txnDescription} numberOfLines={1}>
                          {txn.description}
                        </Text>
                        <Text style={styles.txnDate}>
                          {txn.createdAt.slice(0, 10)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.txnAmount,
                          {
                            color: isCredit
                              ? COLORS.success
                              : COLORS.textPrimary,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {`${isCredit ? "+" : "-"} ${formatAmount(txn.amount, currency)}`}
                      </Text>
                    </View>
                    {index < recentTransactions.length - 1 && (
                      <View style={styles.txnDivider} />
                    )}
                  </View>
                );
              })
            )}
          </View>
        </View>
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}
