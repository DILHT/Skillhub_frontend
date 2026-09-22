// src/screens/auth/KYCScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Button, Chip, SectionHeader } from '@/components/common';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { showImageSourceChooser } from '@/utils/imagePicker';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

type DocumentType = 'passport' | 'national_id' | 'drivers_license';

const DOCUMENT_TYPES: Array<{ value: DocumentType; label: string; icon: string }> = [
  { value: 'national_id', label: 'National ID', icon: 'card-outline' },
  { value: 'passport', label: 'Passport', icon: 'book-outline' },
  { value: 'drivers_license', label: "Driver's License", icon: 'car-outline' },
];

interface UploadSlot {
  key: string;
  label: string;
  description: string;
  required: boolean;
  uri: string | null;
}

function UploadCard({
  slot,
  onPress,
  uploadStyles,
}: {
  slot: UploadSlot;
  onPress: () => void;
  uploadStyles: ReturnType<typeof makeUploadStyles>;
}) {
  const { colors: COLORS } = useAppTheme();
  return (
    <TouchableOpacity style={uploadStyles.card} onPress={onPress} activeOpacity={0.8}>
      {slot.uri ? (
        <>
          <Image source={{ uri: slot.uri }} style={uploadStyles.preview} resizeMode="cover" />
          <View style={uploadStyles.uploadedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.successText} />
            <Text style={uploadStyles.uploadedText}>Uploaded</Text>
          </View>
        </>
      ) : (
        <View style={uploadStyles.placeholder}>
          <Ionicons name="cloud-upload-outline" size={32} color={COLORS.textTertiary} />
          <Text style={uploadStyles.placeholderLabel}>{slot.label}</Text>
          <Text style={uploadStyles.placeholderDesc}>{slot.description}</Text>
          {slot.required && (
            <View style={uploadStyles.requiredBadge}>
              <Text style={uploadStyles.requiredText}>Required</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function KYCScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const uploadStyles = makeUploadStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'KYC'>>();
  const [selectedDoc, setSelectedDoc] = useState<DocumentType>('national_id');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [slots, setSlots] = useState<UploadSlot[]>([
    { key: 'idFront', label: 'ID Front', description: 'Clear photo of the front of your ID', required: true, uri: null },
    { key: 'idBack', label: 'ID Back', description: 'Clear photo of the back of your ID', required: false, uri: null },
    { key: 'selfie', label: 'Selfie with ID', description: 'Hold your ID next to your face', required: true, uri: null },
  ]);

  const handleUpload = (key: string) => {
    showImageSourceChooser((img) => {
      if (img) {
        setSlots((prev) =>
          prev.map((s) => (s.key === key ? { ...s, uri: img.uri } : s))
        );
      }
    });
  };

  const canSubmit = slots
    .filter((s) => s.required)
    .every((s) => s.uri !== null);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      Alert.alert(
        'Submitted Successfully',
        'Your documents have been submitted for review. We will notify you within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Submission Failed', e?.message ?? 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Identity Verification" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* INFO BANNER */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Why we verify your identity</Text>
            <Text style={styles.infoText}>
              Verification helps keep SkillHub safe for everyone. Your documents are encrypted and never shared without your consent.
            </Text>
          </View>
        </View>

        {/* DOCUMENT TYPE */}
        <SectionHeader title="Select document type" />
        <View style={styles.docTypeRow}>
          {DOCUMENT_TYPES.map((doc) => (
            <Chip
              key={doc.value}
              label={doc.label}
              icon={doc.icon as keyof typeof Ionicons.glyphMap}
              active={selectedDoc === doc.value}
              size="md"
              onPress={() => setSelectedDoc(doc.value)}
            />
          ))}
        </View>

        {/* UPLOAD SLOTS */}
        <SectionHeader title="Upload documents" />
        <View style={styles.uploadGrid}>
          {slots.map((slot) => (
            <UploadCard
              key={slot.key}
              slot={slot}
              onPress={() => handleUpload(slot.key)}
              uploadStyles={uploadStyles}
            />
          ))}
        </View>

        {/* TIPS */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for a successful submission</Text>
          {[
            'Make sure the document is not expired',
            'All text must be clearly readable',
            'No glare or shadows on the document',
            'The full document must be visible in the photo',
          ].map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <Button
          label="Submit for Verification"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={!canSubmit}
          fullWidth
          size="lg"
          style={{ marginTop: SPACING.md }}
        />

        {!canSubmit && (
          <Text style={styles.requiredNote}>
            Please upload all required documents to continue
          </Text>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeUploadStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  card: {
    height: 140,
    borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: COLORS.inputBackground,
  },
  preview: { width: '100%', height: '100%' },
  uploadedBadge: {
    position: 'absolute', bottom: SPACING.sm, right: SPACING.sm,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.successBg, paddingHorizontal: SPACING.sm,
    paddingVertical: 3, borderRadius: SPACING.borderRadius.full,
  },
  uploadedText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.successText, fontFamily: TYPOGRAPHY.fontFamily.medium },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, padding: SPACING.md },
  placeholderLabel: { fontSize: TYPOGRAPHY.fontSize.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  placeholderDesc: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textTertiary, textAlign: 'center' },
  requiredBadge: {
    backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderRadius: SPACING.borderRadius.full, marginTop: 2,
  },
  requiredText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.primary },
});

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.screenPadding, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
  content: { padding: SPACING.screenPadding, gap: SPACING.lg },
  infoBanner: {
    flexDirection: 'row', gap: SPACING.md,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SPACING.borderRadius.lg,
    padding: SPACING.md, alignItems: 'flex-start',
  },
  infoTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.primary, marginBottom: 4 },
  infoText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, lineHeight: 20 },
  docTypeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  uploadGrid: { gap: SPACING.md },
  tipsCard: {
    backgroundColor: COLORS.surface, borderRadius: SPACING.borderRadius.lg,
    padding: SPACING.md, gap: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.divider,
  },
  tipsTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  tipText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, flex: 1, lineHeight: 20 },
  requiredNote: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary, textAlign: 'center', marginTop: SPACING.sm },
});
