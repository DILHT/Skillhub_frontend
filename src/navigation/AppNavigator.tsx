// src/navigation/AppNavigator.tsx
// Fixed:
// - Settings removed from ProfileStackParamList (no screen registered)
// - ProviderProfileScreen wired from profile/ folder
// - ServiceCard now navigates to ProviderProfile

import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabNavigationProp,
} from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import type {
  CompositeNavigationProp,
  NavigatorScreenParams,
  ParamListBase,
} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import FloatingTabBar from '@/components/navigation/FloatingTabBar';

import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/home/SearchScreen';
import ServiceDetailScreen from '../screens/home/ServiceDetailScreen';
import CategoryScreen from '../screens/home/CategoryScreen';
import ProviderProfileScreen from '../screens/profile/ProviderProfileScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import BookingConfirmScreen from '../screens/booking/BookingConfirmScreen';
import BookingListScreen from '../screens/booking/BookingListScreen';
import BookingDetailScreen from '../screens/booking/BookingDetailScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import TopUpScreen from '../screens/wallet/TopUpScreen';
import TransactionHistoryScreen from '../screens/wallet/TransactionHistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import KYCScreen from '../screens/auth/KYCScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProviderBookingsScreen from '../screens/provider/ProviderBookingsScreen';
import ProviderBookingDetailScreen from '../screens/provider/ProviderBookingDetailScreen';
import ProviderServicesScreen from '../screens/provider/ProviderServicesScreen';
import ProviderServiceFormScreen from '../screens/provider/ProviderServiceFormScreen';
import ProviderAvailabilityScreen from '../screens/provider/ProviderAvailabilityScreen';
import { useAuthStore } from '../store/authStore';
export type HomeStackParamList = {
  Home: undefined;
  Search: undefined;
  ServiceDetail: { serviceId: string };
  Category: { categoryId: string; categoryName: string };
  ProviderProfile: { providerId: string };
  Notifications: undefined;
};

export type BookingStackParamList = {
  BookingList: undefined;
  BookingFlow: { serviceId: string };
  BookingConfirm: { bookingId: string };
  BookingDetail: { bookingId: string };
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { conversationId: string; recipientName: string };
};

export type WalletStackParamList = {
  Wallet: undefined;
  TopUp: undefined;
  Transactions: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  KYC: undefined;
};

export type ProviderStackParamList = {
  ProviderBookings: undefined;
  ProviderBookingDetail: { bookingId: string };
  ProviderServices: undefined;
  ProviderServiceForm: { serviceId: string | undefined };
  ProviderAvailability: undefined;
};

// The tab navigator's own param list. Screens that jump across tabs
// (ServiceDetail → BookingsTab/BookingFlow, BookingConfirm → HomeTab/Home)
// compose their stack's navigation prop with this one, so the target tab AND
// the nested screen/params are both checked.
export type AppTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  BookingsTab: NavigatorScreenParams<BookingStackParamList>;
  ChatTab: NavigatorScreenParams<ChatStackParamList>;
  WalletTab: NavigatorScreenParams<WalletStackParamList>;
  ProviderTab: NavigatorScreenParams<ProviderStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Convenience alias for a screen inside `Stack` that can also reach other tabs.
export type TabScreenNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList & string,
> = CompositeNavigationProp<
  NativeStackNavigationProp<ParamList, RouteName>,
  BottomTabNavigationProp<AppTabParamList>
>;

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
function HomeStackNavigator() {
  const { colors: COLORS, isDark } = useAppTheme();
  const stackOpts = {
    headerShown: false,
    animation: 'slide_from_right' as const,
    contentStyle: { backgroundColor: COLORS.background },
  };
  return (
    <HomeStack.Navigator screenOptions={stackOpts}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Search" component={SearchScreen} />
      <HomeStack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <HomeStack.Screen name="Category" component={CategoryScreen} />
      <HomeStack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    </HomeStack.Navigator>
  );
}

const BookingStack = createNativeStackNavigator<BookingStackParamList>();
function BookingStackNavigator() {
  const { colors: COLORS, isDark } = useAppTheme();
  const stackOpts = {
    headerShown: false,
    animation: 'slide_from_right' as const,
    contentStyle: { backgroundColor: COLORS.background },
  };
  return (
    <BookingStack.Navigator screenOptions={stackOpts}>
      <BookingStack.Screen name="BookingList" component={BookingListScreen} />
      <BookingStack.Screen name="BookingFlow" component={BookingScreen} />
      <BookingStack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
      <BookingStack.Screen name="BookingDetail" component={BookingDetailScreen} />
    </BookingStack.Navigator>
  );
}

const ChatStack = createNativeStackNavigator<ChatStackParamList>();
function ChatStackNavigator() {
  const { colors: COLORS, isDark } = useAppTheme();
  const stackOpts = {
    headerShown: false,
    animation: 'slide_from_right' as const,
    contentStyle: { backgroundColor: COLORS.background },
  };
  return (
    <ChatStack.Navigator screenOptions={stackOpts}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </ChatStack.Navigator>
  );
}

const WalletStack = createNativeStackNavigator<WalletStackParamList>();
function WalletStackNavigator() {
  const { colors: COLORS, isDark } = useAppTheme();
  const stackOpts = {
    headerShown: false,
    animation: 'slide_from_right' as const,
    contentStyle: { backgroundColor: COLORS.background },
  };
  return (
    <WalletStack.Navigator screenOptions={stackOpts}>
      <WalletStack.Screen name="Wallet" component={WalletScreen} />
      <WalletStack.Screen name="TopUp" component={TopUpScreen} />
      <WalletStack.Screen name="Transactions" component={TransactionHistoryScreen} />
    </WalletStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackNavigator() {
  const { colors: COLORS, isDark } = useAppTheme();
  const stackOpts = {
    headerShown: false,
    animation: 'slide_from_right' as const,
    contentStyle: { backgroundColor: COLORS.background },
  };
  return (
    <ProfileStack.Navigator screenOptions={stackOpts}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="KYC" component={KYCScreen} />
    </ProfileStack.Navigator>
  );
}

const ProviderStack = createNativeStackNavigator<ProviderStackParamList>();
function ProviderStackNavigator() {
  const { colors: COLORS } = useAppTheme();
  const stackOpts = {
    headerShown: false,
    animation: 'slide_from_right' as const,
    contentStyle: { backgroundColor: COLORS.background },
  };
  return (
    <ProviderStack.Navigator screenOptions={stackOpts}>
      <ProviderStack.Screen name="ProviderBookings" component={ProviderBookingsScreen} />
      <ProviderStack.Screen name="ProviderBookingDetail" component={ProviderBookingDetailScreen} />
      <ProviderStack.Screen name="ProviderServices" component={ProviderServicesScreen} />
      <ProviderStack.Screen name="ProviderServiceForm" component={ProviderServiceFormScreen} />
      <ProviderStack.Screen name="ProviderAvailability" component={ProviderAvailabilityScreen} />
    </ProviderStack.Navigator>
  );
}

const TABS = [
  { name: 'HomeTab',     component: HomeStackNavigator,     label: 'Home',     icon: 'home-outline' as const,       iconFocused: 'home' as const },
  { name: 'BookingsTab', component: BookingStackNavigator,  label: 'Bookings', icon: 'calendar-outline' as const,   iconFocused: 'calendar' as const },
  { name: 'ChatTab',     component: ChatStackNavigator,     label: 'Chat',     icon: 'chatbubbles-outline' as const, iconFocused: 'chatbubbles' as const },
  { name: 'WalletTab',   component: WalletStackNavigator,   label: 'Wallet',   icon: 'wallet-outline' as const,     iconFocused: 'wallet' as const },
  { name: 'ProviderTab', component: ProviderStackNavigator, label: 'Provider', icon: 'briefcase-outline' as const,  iconFocused: 'briefcase' as const },
  { name: 'ProfileTab',  component: ProfileStackNavigator,  label: 'Profile',  icon: 'person-outline' as const,     iconFocused: 'person' as const },
] as const;

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const role = useAuthStore((s) => s.role);
  const isProvider = role === 'provider' || role === 'both';

  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={({ route }) => {
        const tab = TABS.find((t) => t.name === route.name);
        return {
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? (tab?.iconFocused ?? 'home') : (tab?.icon ?? 'home-outline')}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: tab?.label ?? route.name,
        };
      }}
    >
      <Tab.Screen name="HomeTab"     component={HomeStackNavigator} />
      <Tab.Screen name="BookingsTab" component={BookingStackNavigator} />
      <Tab.Screen name="ChatTab"     component={ChatStackNavigator} />
      <Tab.Screen name="WalletTab"   component={WalletStackNavigator} />
      {isProvider ? <Tab.Screen name="ProviderTab" component={ProviderStackNavigator} /> : null}
      <Tab.Screen name="ProfileTab"  component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
