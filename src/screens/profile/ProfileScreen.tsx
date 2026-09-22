// PLACE AT: src/screens/profile/ProfileScreen.tsx

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import {
  Avatar, Button, Card, ListRow, ScreenHeader, SectionHeader,
} from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors, getCardStyle } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { haptics } from '@/utils/haptics';

export default function ProfileScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'Profile'>>();
  const user = useAuthStore((s) => s.user);
  const activeMode = useAuthStore((s) => s.activeMode);
  const setActiveMode = useAuthStore((s) => s.setActiveMode);
  const { logout } = useAuth();

  const displayName = user?.fullName
    ?? (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null)
    ?? user?.email
    ?? 'SkillHub User';

  const role = user?.role === 'provider' ? 'Service Provider'
    : user?.role === 'both' ? 'Client & Provider'
    : 'Client';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Profile" large />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* USER CARD — avatar, identity and Edit on one row, so Edit reads as
            an action on the identity block rather than a third stacked item. */}
        <View style={styles.userCard}>
          <Avatar
            uri={user?.profilePicture ?? user?.avatar}
            name={displayName}
            size="xl"
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.userRole}>{role}</Text>
            {user?.email && (
              <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
            )}
          </View>
          <Button
            label="Edit"
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate('EditProfile')}
            leftIcon={<Ionicons name="pencil-outline" size={16} color={COLORS.primary} />}
          />
        </View>

        {/* VERIFICATION STATUS */}
        {!user?.isVerified && (
          <TouchableOpacity style={styles.verifyBanner}
          onPress={() => Alert.alert(
            'Verify Your Email',
            'We will send a verification link to your email address.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Send', onPress: () => {/* triggers when email backend ready */} },
            ]
          )}
          >
            <Ionicons name="alert-circle-outline" size={20} color={COLORS.warningText} />
            <Text style={styles.verifyText}>Verify your email to unlock all features</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.warningText} />
          </TouchableOpacity>
        )}

        {/* MODE SWITCH — only for role 'both' */}
        {user?.role === 'both' && (
          <View style={styles.modeSwitchCard}>
            <View style={styles.modeSwitchInfo}>
              <View style={styles.modeSwitchIconBox}>
                <Ionicons name="swap-horizontal" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.modeSwitchLabel}>Current mode</Text>
                <Text style={styles.modeSwitchMode}>
                  {activeMode === 'client' ? 'Client Mode' : 'Provider Mode'}
                </Text>
              </View>
            </View>
            <Button
              label={`Switch to ${activeMode === 'client' ? 'Provider' : 'Client'} Mode`}
              variant="primary"
              size="sm"
              fullWidth
              onPress={() => {
                haptics.impact();
                setActiveMode(activeMode === 'client' ? 'provider' : 'client');
              }}
            />
          </View>
        )}

        {/* MENU SECTIONS */}
        <View style={styles.section}>
          <SectionHeader title="Account" />
          <Card padding="none" divided>
            <ListRow
              icon="person-outline"
              label="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
            />
            <ListRow
              icon="shield-checkmark-outline"
              label="Identity Verification"
              value={user?.isVerified ? 'Verified ✓' : 'Not verified'}
              onPress={() => navigation.navigate('KYC')}
            />
            <ListRow
              icon="settings-outline"
              label="Settings"
              onPress={() => navigation.navigate('Settings')}
            />
            <ListRow
              icon="notifications-outline"
              label="Notifications"
              onPress={() => Alert.alert('Notifications', 'Notification settings are managed in the Settings screen.')}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Support" />
          <Card padding="none" divided>
            <ListRow
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => Alert.alert('Help Center', 'For support, contact us at support@skillhub.mw')}
            />
            <ListRow
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => Alert.alert('Terms of Service', 'Please visit skillhub.mw/terms to read our full terms of service.')}
            />
            <ListRow
              icon="lock-closed-outline"
              label="Privacy Policy"
              onPress={() => Alert.alert('Privacy Policy', 'Please visit skillhub.mw/privacy to read our privacy policy.')}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Card padding="none">
            <ListRow
              icon="log-out-outline"
              label="Sign Out"
              tone="danger"
              onPress={logout}
            />
          </Card>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors, isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  userCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  userInfo: { flex: 1, gap: 2 },
  userName: {
    // Intent: the primary identity on the screen.
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  userRole: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  userEmail: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  verifyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.warningBg, padding: SPACING.md,
    marginHorizontal: SPACING.screenPadding, marginTop: SPACING.md,
    borderRadius: SPACING.borderRadius.lg, borderWidth: 1, borderColor: COLORS.warningBorder,
  },
  verifyText: { flex: 1, fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.warningText },
  section: { marginTop: SPACING.lg, paddingHorizontal: SPACING.screenPadding },

  // Mode switch card (role === 'both' only)
  modeSwitchCard: {
    ...getCardStyle(isDark),
    marginHorizontal: SPACING.screenPadding,
    marginTop: SPACING.md,
    borderRadius: SPACING.borderRadius.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  modeSwitchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  modeSwitchIconBox: {
    width: 36,
    height: 36,
    borderRadius: SPACING.borderRadius.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSwitchLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modeSwitchMode: {
    // Intent: an emphasised value.
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
});
