import React, { useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/common";
import { useAppTheme } from "@/context/ThemeContext";
import { SPACING } from "@/constants/spacing";
import { KYC_TIPS } from "@/constants/kyc";
import { makeKycStyles } from "@/styles/auth/kyc.styles";
import { useKycForm } from "@/hooks/useKycForm";
import { useThemedStyles } from "@/components/kyc/useThemedStyles";
import KycProgress from "@/components/kyc/KycProgress";
import DocumentTypeSelector from "@/components/kyc/DocumentTypeSelector";
import UploadCard from "@/components/kyc/UploadCard";

export default function KYCScreen() {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemedStyles(makeKycStyles);
  const navigation = useNavigation<any>();

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const {
    selectedDoc,
    slots,
    requiredTotal,
    requiredDone,
    canSubmit,
    isSubmitting,
    handleSelectDoc,
    handleUpload,
    handleRemove,
    handleSubmit,
  } = useKycForm(handleBack);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">
          Identity Verification
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoBanner}>
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color={COLORS.primary}
          />
          <View style={styles.infoCopy}>
            <Text style={styles.infoTitle}>Why we verify your identity</Text>
            <Text style={styles.infoText}>
              Verification keeps SkillHub safe for everyone. Your documents are
              encrypted and never shared without your consent.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Choose a document</Text>
          <DocumentTypeSelector
            selected={selectedDoc}
            onSelect={handleSelectDoc}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Upload photos</Text>
          <KycProgress done={requiredDone} total={requiredTotal} />
          <View style={styles.uploadGrid}>
            {slots.map((slot) => (
              <UploadCard
                key={slot.key}
                slot={slot}
                onUpload={handleUpload}
                onRemove={handleRemove}
              />
            ))}
          </View>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for a successful submission</Text>
          {KYC_TIPS.map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: SPACING.md }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Submit for Verification"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={!canSubmit}
          fullWidth
          size="md"
          style={styles.submitButton}
        />
        {!canSubmit && (
          <Text style={styles.requiredNote}>
            Upload all required photos to continue
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
