// src/screens/onboarding/OnboardingScreen.tsx
import React, { useRef, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Dimensions, NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@/context/ThemeContext';
import { AppColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'search-outline',
    title: 'Find Trusted Providers',
    body: 'Discover skilled service providers near you — from cleaning to plumbing, tutoring to repairs.',
  },
  {
    icon: 'calendar-outline',
    title: 'Book with Confidence',
    body: 'Schedule services easily and track your bookings from request to completion.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Secure Payments',
    body: 'Pay safely through your in-app wallet with escrow protection on every booking.',
  },
];

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const { colors: COLORS } = useAppTheme();
  const styles = makeStyles(COLORS);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    onDone();
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={finish} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon as any} size={64} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={next}>
          <Text style={styles.buttonText}>
            {index === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (COLORS: AppColors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    skipRow: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
    skip: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '500' },
    slide: { width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 20 },
    iconCircle: {
      width: 140, height: 140, borderRadius: 70,
      backgroundColor: COLORS.primaryLight,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 12,
    },
    title: { fontSize: 24, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },
    body: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24 },
    footer: { paddingHorizontal: 24, paddingBottom: 24, gap: 24 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
    dotActive: { width: 24, backgroundColor: COLORS.primary },
    button: {
      backgroundColor: COLORS.primary,
      paddingVertical: 16, borderRadius: 999, alignItems: 'center',
    },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  });