// PLACE AT: src/screens/profile/ProfileScreen.tsx

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/common/Avatar';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';

function MenuItem({
  icon, label, value, onPress, danger, COLORS, menuItemStyles,
}: {
  icon: string; label: string; value?: string;
  onPress: () => void; danger?: boolean;
  COLORS: AppColors;
  menuItemStyles: ReturnType<typeof makeMenuStyles>;
}) {
  return (
    <TouchableOpacity style={menuItemStyles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={[menuItemStyles.iconBox, danger && menuItemStyles.iconBoxDanger]}>
        <Ionicons name={icon as any} size={20} color={danger ? COLORS.danger : COLORS.primary} />
      </View>
      <View style={menuItemStyles.textCol}>
        <Text style={[menuItemStyles.label, danger && { color: COLORS.danger }]}>{label}</Text>
        {value && <Text style={menuItemStyles.value}>{value}</Text>}
      </View>
      {!danger && <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const menuItemStyles = makeMenuStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* USER CARD */}
        <View style={styles.userCard}>
          <Avatar
            uri={user?.profilePicture ?? user?.avatar}
            name={displayName}
            size="xl"
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userRole}>{role}</Text>
            {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
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

        {/* MENU SECTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionCard}>
            <MenuItem
              icon="person-outline" label="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
              COLORS={COLORS} menuItemStyles={menuItemStyles}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Identity Verification"
              value={user?.isVerified ? 'Verified ✓' : 'Not verified'}
              onPress={() => navigation.navigate('KYC')}
              COLORS={COLORS} menuItemStyles={menuItemStyles}
            />
            <View style={styles.divider} />

            <MenuItem
              icon="settings-outline"
              label="Settings"
              onPress={() => navigation.navigate('Settings')}
              COLORS={COLORS} menuItemStyles={menuItemStyles}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="notifications-outline" label="Notifications"
              onPress={() => Alert.alert('Notifications', 'Notification settings are managed in the Settings screen.')}
              COLORS={COLORS} menuItemStyles={menuItemStyles}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionCard}>
            <MenuItem icon="help-circle-outline" label="Help Center" onPress={() => Alert.alert('Help Center', 'For support, contact us at support@skillhub.mw')} COLORS={COLORS} menuItemStyles={menuItemStyles} />
            <View style={styles.divider} />
            <MenuItem icon="document-text-outline" label="Terms of Service" onPress={() => Alert.alert('Terms of Service', 'Please visit skillhub.mw/terms to read our full terms of service.')} COLORS={COLORS} menuItemStyles={menuItemStyles} />
            <View style={styles.divider} />
            <MenuItem icon="lock-closed-outline" label="Privacy Policy" onPress={() => Alert.alert('Privacy Policy', 'Please visit skillhub.mw/privacy to read our privacy policy.')} COLORS={COLORS} menuItemStyles={menuItemStyles} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <MenuItem
              icon="log-out-outline" label="Sign Out"
              onPress={logout} danger
              COLORS={COLORS} menuItemStyles={menuItemStyles}
            />
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeMenuStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.screenPadding,
    backgroundColor: COLORS.surface,
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBoxDanger: { backgroundColor: COLORS.errorBg },
  textCol: { flex: 1 },
  label: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textPrimary },
  value: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: 2 },
});

const makeStyles = (COLORS: AppColors, _isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: SPACING.screenPadding, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },
  headerTitle: { fontSize: TYPOGRAPHY.fontSize.xxl, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  userCard: {
    backgroundColor: COLORS.surface, padding: SPACING.lg,
    alignItems: 'center', gap: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  userInfo: { alignItems: 'center', gap: 4 },
  userName: { fontSize: TYPOGRAPHY.fontSize.xl, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  userRole: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.primary, fontFamily: TYPOGRAPHY.fontFamily.medium },
  userEmail: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
  editButton: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full, borderWidth: 1, borderColor: COLORS.primary,
  },
  editButtonText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.primary, fontFamily: TYPOGRAPHY.fontFamily.medium },
  verifyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.warningBg, padding: SPACING.md,
    marginHorizontal: SPACING.screenPadding, marginTop: SPACING.md,
    borderRadius: SPACING.borderRadius.lg, borderWidth: 1, borderColor: COLORS.warningBorder,
  },
  verifyText: { flex: 1, fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.warningText },
  section: { marginTop: SPACING.lg, paddingHorizontal: SPACING.screenPadding },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textTertiary,
    fontFamily: TYPOGRAPHY.fontFamily.medium, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: SPACING.sm,
  },
  sectionCard: {
    backgroundColor: COLORS.surface, borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1, borderColor: COLORS.divider, overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: COLORS.divider, marginLeft: SPACING.screenPadding + 36 + SPACING.md },
});
