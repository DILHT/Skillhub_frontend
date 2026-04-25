// src/navigation/AppNavigator.tsx
// Updated Lesson 05 — real ChatListScreen and ChatRoomScreen wired in

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { SPACING } from '../constants/spacing';

import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/home/SearchScreen';
import ServiceDetailScreen from '../screens/home/ServiceDetailScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import BookingConfirmScreen from '../screens/booking/BookingConfirmScreen';
import BookingListScreen from '../screens/booking/BookingListScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';

function PlaceholderScreen({ route }: any) {
  const names: Record<string, string> = { Wallet: 'Wallet', Profile: 'Profile' };
  return (
    <View style={ph.container}>
      <Ionicons name="construct-outline" size={40} color={COLORS.textTertiary} />
      <Text style={ph.title}>{names[route.name] ?? route.name}</Text>
      <Text style={ph.subtitle}>Coming in a future lesson</Text>
    </View>
  );
}
const ph = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, gap: SPACING.sm },
  title: { fontSize: TYPOGRAPHY.fontSize.xl, fontFamily: TYPOGRAPHY.fontFamily.medium, color: COLORS.textPrimary },
  subtitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
});

export type HomeStackParamList = {
  Home: undefined;
  Search: undefined;
  ServiceDetail: { serviceId: string };
  Category: { categoryId: string; categoryName: string };
  ProviderProfile: { providerId: string };
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
};

const stackOpts = {
  headerShown: false,
  animation: 'slide_from_right' as const,
  contentStyle: { backgroundColor: COLORS.background },
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackOpts}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Search" component={SearchScreen} />
      <HomeStack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
    </HomeStack.Navigator>
  );
}

const BookingStack = createNativeStackNavigator<BookingStackParamList>();
function BookingStackNavigator() {
  return (
    <BookingStack.Navigator screenOptions={stackOpts}>
      <BookingStack.Screen name="BookingList" component={BookingListScreen} />
      <BookingStack.Screen name="BookingFlow" component={BookingScreen} />
      <BookingStack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
    </BookingStack.Navigator>
  );
}

const ChatStack = createNativeStackNavigator<ChatStackParamList>();
function ChatStackNavigator() {
  return (
    <ChatStack.Navigator screenOptions={stackOpts}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </ChatStack.Navigator>
  );
}

const WalletStack = createNativeStackNavigator<WalletStackParamList>();
function WalletStackNavigator() {
  return (
    <WalletStack.Navigator screenOptions={stackOpts}>
      <WalletStack.Screen name="Wallet" component={PlaceholderScreen} />
    </WalletStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={stackOpts}>
      <ProfileStack.Screen name="Profile" component={PlaceholderScreen} />
    </ProfileStack.Navigator>
  );
}

const TABS = [
  { name: 'HomeTab', component: HomeStackNavigator, label: 'Home', icon: 'home-outline' as const, iconFocused: 'home' as const },
  { name: 'BookingsTab', component: BookingStackNavigator, label: 'Bookings', icon: 'calendar-outline' as const, iconFocused: 'calendar' as const },
  { name: 'ChatTab', component: ChatStackNavigator, label: 'Chat', icon: 'chatbubbles-outline' as const, iconFocused: 'chatbubbles' as const },
  { name: 'WalletTab', component: WalletStackNavigator, label: 'Wallet', icon: 'wallet-outline' as const, iconFocused: 'wallet' as const },
  { name: 'ProfileTab', component: ProfileStackNavigator, label: 'Profile', icon: 'person-outline' as const, iconFocused: 'person' as const },
] as const;

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find((t) => t.name === route.name);
        return {
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? (tab?.iconFocused ?? 'home') : (tab?.icon ?? 'home-outline')} size={size} color={color} />
          ),
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textTertiary,
          tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.divider, borderTopWidth: 1, height: 60, paddingBottom: 6, paddingTop: 4 },
          tabBarLabelStyle: { fontSize: TYPOGRAPHY.fontSize.xs, fontFamily: TYPOGRAPHY.fontFamily.medium },
          tabBarLabel: tab?.label ?? route.name,
        };
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}