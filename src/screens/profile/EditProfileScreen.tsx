// PLACE AT: src/screens/profile/EditProfileScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/service/authService';
import { Button, Input } from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';
import { SPACING } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/constants/typography';
import { showImageSourceChooser, PickedImage } from '@/utils/imagePicker';

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [avatar, setAvatar] = useState<PickedImage | null>(null);
const currentAvatar = avatar?.uri ?? user?.avatar ?? user?.profilePicture ?? null;

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      bio: user?.bio ?? '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) =>
      authService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
      }),
    onSuccess: (user) => {
      updateUser({
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        fullName: user.fullName ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        ...(avatar ? { avatar: avatar.uri, profilePicture: avatar.uri } : {}),
      });

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message ?? 'Failed to update profile. Please try again.');
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 30 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={() => showImageSourceChooser((img) => { if (img) setAvatar(img); })}
              activeOpacity={0.8}
            >
              {currentAvatar ? (
                <Image source={{ uri: currentAvatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color={COLORS.textTertiary} />
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={16} color={COLORS.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>
            <View style={styles.nameRow}>
              <Controller
                control={control} name="firstName"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <Input
                    ref={ref} label="First name" placeholder="John"
                    value={value} onChangeText={onChange} onBlur={onBlur}
                    error={errors.firstName?.message}
                    style={styles.halfInput} isRequired
                  />
                )}
              />
              <Controller
                control={control} name="lastName"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <Input
                    ref={ref} label="Last name" placeholder="Banda"
                    value={value} onChangeText={onChange} onBlur={onBlur}
                    error={errors.lastName?.message}
                    style={styles.halfInput} isRequired
                  />
                )}
              />
            </View>

            {/* Email is shown read-only — user cannot change email here */}
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>Email address</Text>
              <Text style={styles.readOnlyValue}>{user?.email ?? '—'}</Text>
              <Text style={styles.readOnlyHint}>Contact support to change your email</Text>
            </View>

            <Controller
              control={control} name="bio"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  ref={ref} label="Bio" placeholder="Tell people about yourself..."
                  value={value ?? ''} onChangeText={onChange} onBlur={onBlur}
                  error={errors.bio?.message}
                  multiline
                  hint="Max 500 characters"
                />
              )}
            />

            {updateMutation.isError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{(updateMutation.error as any)?.message ?? 'Update failed'}</Text>
              </View>
            )}

            <Button
              label="Save Changes"
              onPress={handleSubmit(onSubmit)}
              isLoading={updateMutation.isPending}
              disabled={!isDirty}
              fullWidth size="lg"
            />
          </View>
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  content: { padding: SPACING.screenPadding, paddingBottom: SPACING.xxl },
  form: { gap: SPACING.md },
  nameRow: { flexDirection: 'row', gap: SPACING.md },
  halfInput: { flex: 1 },
  readOnlyField: {
    backgroundColor: COLORS.inputBackground, borderRadius: SPACING.borderRadius.md,
    padding: SPACING.md, gap: 4,
  },
  readOnlyLabel: { fontSize: TYPOGRAPHY.fontSize.sm, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  readOnlyValue: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary },
  readOnlyHint: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textTertiary },
  errorBox: {
    backgroundColor: COLORS.errorBg, borderWidth: 1, borderColor: COLORS.errorBorder,
    borderRadius: SPACING.borderRadius.md, padding: SPACING.md,
  },
  errorText: { color: COLORS.danger, fontSize: TYPOGRAPHY.fontSize.sm, textAlign: 'center' },

  avatarSection: {
  alignItems: 'center',
  marginBottom: 24,
},
avatarWrapper: {
  width: 100,
  height: 100,
  borderRadius: 50,
  position: 'relative',
},
avatarImage: {
  width: 100,
  height: 100,
  borderRadius: 50,
},
avatarPlaceholder: {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: COLORS.inputBackground,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: COLORS.border,
},
avatarEditBadge: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: COLORS.primary,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: COLORS.surface,
},
avatarHint: {
  marginTop: 8,
  fontSize: 13,
  color: COLORS.textSecondary,
},
});
