// PLACE AT: src/screens/profile/ProfileScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/common/Avatar";
import { useAppTheme } from "@/context/ThemeContext";
import { AppColors } from "@/constants/theme";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";
import {
  makeMenuStyles,
  makeProfileStyles,
} from "@/styles/profile/profile.styles";
import { useShadows } from "@/constants/shadows";

function MenuItem({
  icon,
  label,
  value,
  onPress,
  danger,
  COLORS,
  menuItemStyles,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  COLORS: AppColors;
  menuItemStyles: ReturnType<typeof makeMenuStyles>;
}) {
  return (
    <TouchableOpacity
      style={menuItemStyles.item}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[menuItemStyles.iconBox, danger && menuItemStyles.iconBoxDanger]}
      >
        <Ionicons
          name={icon as any}
          size={16}
          color={danger ? COLORS.danger : COLORS.primary}
        />
      </View>
      <View style={menuItemStyles.textCol}>
        <Text
          style={[menuItemStyles.label, danger && { color: COLORS.danger }]}
        >
          {label}
        </Text>
        {value && <Text style={menuItemStyles.value}>{value}</Text>}
      </View>
      {!danger && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={COLORS.textTertiary}
        />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { colors: COLORS, isDark } = useAppTheme();
  const styles = makeProfileStyles(COLORS, isDark);
  const menuItemStyles = makeMenuStyles(COLORS, isDark);
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const [userCardBottom, setUserCardBottom] = useState<number | null>(null);
  const [isUserCardHidden, setIsUserCardHidden] = useState(false);

  const displayName =
    user?.fullName ??
    (user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : null) ??
    user?.email ??
    "SkillHub User";

  const role =
    user?.role === "provider"
      ? "Service Provider"
      : user?.role === "both"
        ? "Client & Provider"
        : "Client";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
        {isUserCardHidden && (
          <Avatar
            uri={user?.profilePicture ?? user?.avatar}
            name={displayName}
            size="md"
          />
        )}
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(event) => {
          if (userCardBottom !== null) {
            setIsUserCardHidden(
              event.nativeEvent.contentOffset.y >= userCardBottom - 40,
            );
          }
        }}
      >
        {/* USER CARD */}
        <View
          style={styles.userCard}
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            setUserCardBottom(y + height);
          }}
        >
          <Avatar
            uri={user?.profilePicture ?? user?.avatar}
            name={displayName}
            size="xxl"
          />
          <View style={styles.userInfo}>
            <Text style={styles.userRole}>
              {role}{" "}
              {/* {user?.email && <Text style={styles.userEmail}>{user.email}</Text>} */}
            </Text>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          {/* <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity> */}
        </View>

        {/* VERIFICATION STATUS */}
        {!user?.isVerified && (
          <TouchableOpacity
            style={styles.verifyBanner}
            onPress={() =>
              Alert.alert(
                "Verify Your Email",
                "We will send a verification link to your email address.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Send",
                    onPress: () => {
                      /* triggers when email backend ready */
                    },
                  },
                ],
              )
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={COLORS.warningText}
            />
            <Text style={styles.verifyText}>
              Verify your email to unlock all features
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.warningText}
            />
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <MenuItem
              icon="person-outline"
              label="Edit Profile"
              onPress={() => navigation.navigate("EditProfile")}
              COLORS={COLORS}
              menuItemStyles={menuItemStyles}
            />
          </View>
        </View>

        {/* MENU SECTIONS */}
        <View style={styles.section}>
          {/* <Text style={styles.sectionTitle}>Account</Text> */}
          <View style={styles.sectionCard}>
            <MenuItem
              icon="shield-checkmark-outline"
              label="Identity Verification"
              value={user?.isVerified ? "Verified ✓" : "Not verified"}
              onPress={() => navigation.navigate("KYC")}
              COLORS={COLORS}
              menuItemStyles={menuItemStyles}
            />

            <MenuItem
              icon="settings-outline"
              label="Settings"
              onPress={() => navigation.navigate("Settings")}
              COLORS={COLORS}
              menuItemStyles={menuItemStyles}
            />

            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              onPress={() =>
                Alert.alert(
                  "Notifications",
                  "Notification settings are managed in the Settings screen.",
                )
              }
              COLORS={COLORS}
              menuItemStyles={menuItemStyles}
            />
          </View>
        </View>

        <View style={styles.section}>
          {/* <Text style={styles.sectionTitle}>Support</Text> */}
          <View style={styles.sectionCard}>
            <MenuItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() =>
                Alert.alert(
                  "Help Center",
                  "For support, contact us at support@skillhub.mw",
                )
              }
              COLORS={COLORS}
              menuItemStyles={menuItemStyles}
            />
            <MenuItem
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() =>
                Alert.alert(
                  "Terms of Service",
                  "Please visit skillhub.mw/terms to read our full terms of service.",
                )
              }
              COLORS={COLORS}
              menuItemStyles={menuItemStyles}
            />
            <MenuItem
              icon="lock-closed-outline"
              label="Privacy Policy"
              onPress={() =>
                Alert.alert(
                  "Privacy Policy",
                  "Please visit skillhub.mw/privacy to read our privacy policy.",
                )
              }
              COLORS={COLORS}
              menuItemStyles={menuItemStyles}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <MenuItem
              icon="log-out-outline"
              label="Sign Out"
              onPress={logout}
              danger
              COLORS={COLORS}
              menuItemStyles={menuItemStyles}
            />
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}
