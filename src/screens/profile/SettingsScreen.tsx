// src/screens/profile/SettingsScreen.tsx

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Switch, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/AppNavigator';
import { useAuth } from '@/hooks/useAuth';
import { Card, ListRow, ScreenHeader, SectionHeader } from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { authService } from '@/service/authService';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

export default function SettingsScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'Settings'>>();
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

  // Every toggle renders the same switch — one factory keeps them identical.
  const toggle = (value: boolean, onValueChange: (v: boolean) => void) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: COLORS.border, true: COLORS.primary }}
      thumbColor={COLORS.white}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* NOTIFICATIONS */}
        <View style={styles.section}>
          <SectionHeader title="Notifications" variant="overline" />
          <Card padding="none" divided>
            <ListRow
              icon="notifications-outline"
              label="Push notifications"
              right={toggle(pushEnabled, setPushEnabled)}
            />
            <ListRow
              icon="mail-outline"
              label="Email notifications"
              right={toggle(emailEnabled, setEmailEnabled)}
            />
          </Card>
        </View>

        {/* APPEARANCE */}
        <View style={styles.section}>
          <SectionHeader title="Appearance" variant="overline" />
          <Card padding="none" divided>
            <ListRow
              icon="moon-outline"
              label="Dark mode"
              right={toggle(isDark, (value) => setMode(value ? 'dark' : 'light'))}
            />
            <ListRow
              icon="phone-portrait-outline"
              label="Follow system theme"
              right={toggle(mode === 'system', (value) =>
                setMode(value ? 'system' : isDark ? 'dark' : 'light')
              )}
            />
          </Card>
        </View>

        {/* ACCOUNT */}
        <View style={styles.section}>
          <SectionHeader title="Account" variant="overline" />
          <Card padding="none" divided>
            <ListRow
              icon="lock-closed-outline"
              label="Change password"
              onPress={handleforgetpassword}
            />
            <ListRow
              icon="shield-checkmark-outline"
              label="Two-factor authentication"
              value="Off"
              onPress={() => Alert.alert('Coming soon', 'Two-factor authentication will be available in the next update.')}
            />
            <ListRow
              icon="language-outline"
              label="Language"
              value="English"
              onPress={() => Alert.alert('Coming soon', 'Language selection will be available soon.')}
            />
          </Card>
        </View>

        {/* PRIVACY */}
        <View style={styles.section}>
          <SectionHeader title="Privacy & Legal" variant="overline" />
          <Card padding="none" divided>
            <ListRow
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => Alert.alert('Terms of Service', 'Please visit our website to read the full terms.')}
            />
            <ListRow
              icon="lock-open-outline"
              label="Privacy Policy"
              onPress={() => Alert.alert('Privacy Policy', 'Please visit our website to read our privacy policy.')}
            />
            <ListRow
              icon="download-outline"
              label="Export my data"
              onPress={() => Alert.alert('Data Export', 'Your data export request has been received. You will receive an email within 24 hours.')}
            />
          </Card>
        </View>

        {/* DANGER ZONE */}
        <View style={styles.section}>
          <SectionHeader title="Danger zone" variant="overline" />
          <Card padding="none" divided>
            <ListRow
              icon="log-out-outline"
              label="Sign out"
              tone="danger"
              onPress={logout}
            />
            <ListRow
              icon="trash-outline"
              label="Delete account"
              tone="danger"
              onPress={handleDeleteAccount}
            />
          </Card>
        </View>

        <Text style={styles.version}>SkillHub v1.0.0</Text>
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  // No `gap` here: each section owns its top margin, so a gap would stack
  // with it and double the space before every section header.
  content: { padding: SPACING.screenPadding },
  section: { marginTop: SPACING.lg },
  version: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.lg,
  },
});
