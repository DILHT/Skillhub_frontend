// src/screens/profile/SettingsScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { authService } from '@/service/authService';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

function SettingRow({
  icon, label, value, onPress, danger, COLORS, rowStyles,
}: {
  icon: string; label: string; value?: string;
  onPress: () => void; danger?: boolean;
  COLORS: AppColors;
  rowStyles: ReturnType<typeof makeRowStyles>;
}) {
  return (
    <TouchableOpacity style={rowStyles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[rowStyles.iconBox, danger && rowStyles.danger]}>
        <Ionicons name={icon as any} size={18} color={danger ? COLORS.danger : COLORS.primary} />
      </View>
      <Text style={[rowStyles.label, danger && { color: COLORS.danger }]}>{label}</Text>
      {value ? <Text style={rowStyles.value}>{value}</Text> : null}
      {!danger && <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />}
    </TouchableOpacity>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  const { colors: COLORS } = useAppTheme();
  return (
    <View style={{
      borderRadius: SPACING.borderRadius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: COLORS.border,
    }}>
      {children}
    </View>
  );
}

function Divider({ COLORS }: { COLORS: AppColors }) {
  return (
    <View style={{ height: 1, backgroundColor: COLORS.divider, marginLeft: SPACING.screenPadding + 34 + SPACING.md }} />
  );
}

export default function SettingsScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const rowStyles = makeRowStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Request Sent', 'Your account deletion request has been submitted. You will receive a confirmation email.');
          },
        },
      ]
    );
  };

  const handleforgetpassword = () => {
      Alert.alert(
    'Change Password',
    'We will send a password reset link to your registered email address.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send Link',
        onPress: async () => {
          try {
            await authService.forgotPassword(user?.email ?? '');
            Alert.alert('Email Sent', 'Check your email for the password reset link.');
          } catch {
            Alert.alert('Error', 'Could not send reset email. Please try again.');
          }
        },
      },
    ]
  );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* NOTIFICATIONS */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <SectionCard>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[rowStyles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.toggleLabel}>Push notifications</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
          <Divider COLORS={COLORS} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[rowStyles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.toggleLabel}>Email notifications</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </SectionCard>

        {/* APPEARANCE */}
        <Text style={styles.sectionLabel}>Appearance</Text>
        <SectionCard>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[rowStyles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="moon-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.toggleLabel}>Dark mode</Text>
            </View>
            <Switch
                value={isDark}
                onValueChange={(value) => setMode(value ? 'dark' : 'light')}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
              </View>
              <Divider COLORS={COLORS} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[rowStyles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="phone-portrait-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.toggleLabel}>Follow system theme</Text>
            </View>
            <Switch
              value={mode === 'system'}
              onValueChange={(value) => setMode(value ? 'system' : isDark ? 'dark' : 'light')}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

        </SectionCard>

        {/* ACCOUNT */}
        <Text style={styles.sectionLabel}>Account</Text>
        <SectionCard>
          <SettingRow
            icon="lock-closed-outline"
            label="Change password"
            onPress={handleforgetpassword}
            COLORS={COLORS} rowStyles={rowStyles}
          />
          <Divider COLORS={COLORS} />
          <SettingRow
            icon="shield-checkmark-outline"
            label="Two-factor authentication"
            value="Off"
            onPress={() => Alert.alert('Coming soon', 'Two-factor authentication will be available in the next update.')}
            COLORS={COLORS} rowStyles={rowStyles}
          />
          <Divider COLORS={COLORS} />
          <SettingRow
            icon="language-outline"
            label="Language"
            value="English"
            onPress={() => Alert.alert('Coming soon', 'Language selection will be available soon.')}
            COLORS={COLORS} rowStyles={rowStyles}
          />
        </SectionCard>

        {/* PRIVACY */}
        <Text style={styles.sectionLabel}>Privacy & Legal</Text>
        <SectionCard>
          <SettingRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => Alert.alert('Terms of Service', 'Please visit our website to read the full terms.')}
            COLORS={COLORS} rowStyles={rowStyles}
          />
          <Divider COLORS={COLORS} />
          <SettingRow
            icon="lock-open-outline"
            label="Privacy Policy"
            onPress={() => Alert.alert('Privacy Policy', 'Please visit our website to read our privacy policy.')}
            COLORS={COLORS} rowStyles={rowStyles}
          />
          <Divider COLORS={COLORS} />
          <SettingRow
            icon="download-outline"
            label="Export my data"
            onPress={() => Alert.alert('Data Export', 'Your data export request has been received. You will receive an email within 24 hours.')}
            COLORS={COLORS} rowStyles={rowStyles}
          />
        </SectionCard>

        {/* DANGER ZONE */}
        <Text style={styles.sectionLabel}>Danger zone</Text>
        <SectionCard>
          <SettingRow
            icon="log-out-outline"
            label="Sign out"
            onPress={logout}
            danger
            COLORS={COLORS} rowStyles={rowStyles}
          />
          <Divider COLORS={COLORS} />
          <SettingRow
            icon="trash-outline"
            label="Delete account"
            onPress={handleDeleteAccount}
            danger
            COLORS={COLORS} rowStyles={rowStyles}
          />
        </SectionCard>

        <Text style={styles.version}>SkillHub v1.0.0</Text>
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeRowStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.screenPadding,
    backgroundColor: COLORS.surface,
  },
  iconBox: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  danger: { backgroundColor: COLORS.errorBg },
  label: { flex: 1, fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary },
  value: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
});

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.screenPadding, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.textPrimary,
  },
  content: { padding: SPACING.screenPadding, gap: SPACING.sm },
  sectionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.screenPadding,
    backgroundColor: COLORS.surface,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  toggleLabel: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary },
  version: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.lg,
  },
});
