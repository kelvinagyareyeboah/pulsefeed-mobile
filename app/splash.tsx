import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../src/stores/useAuthStore';
import { useSettingsStore } from '../src/stores/useSettingsStore';
import Colors from '../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ONBOARDING_COMPLETED_KEY } from './onboarding';

export default function SplashScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const { isAuthenticated, isHydrated, hydrate } = useAuthStore();
  const { hydrate: hydrateSettings } = useSettingsStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    hydrate();
    hydrateSettings();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    let isMounted = true;
    const checkStateAndNavigate = async () => {
      try {
        const onboardingDone = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);

        setTimeout(() => {
          if (!isMounted) return;
          if (!onboardingDone) {
            router.replace('/onboarding' as any);
          } else if (isAuthenticated) {
            router.replace('/(tabs)');
          } else {
            router.replace('/(auth)/login' as any);
          }
        }, 1200);
      } catch (e) {
        if (isMounted) router.replace('/(tabs)');
      }
    };

    checkStateAndNavigate();
    return () => {
      isMounted = false;
    };
  }, [isHydrated, isAuthenticated]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        {/* Solid Editorial Logo Box */}
        <View style={[styles.logoBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <FontAwesome name="bookmark" size={32} color={colors.primary} />
        </View>

        <Text style={[styles.brandTitle, { color: colors.text }]}>PulseFeed</Text>
        <Text style={[styles.tagline, { color: colors.textMuted }]}>
          High-signal stories for curious minds
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: colors.textSubtle }]}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 260,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
