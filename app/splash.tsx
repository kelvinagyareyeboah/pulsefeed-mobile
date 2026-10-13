import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/useAuthStore';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, hydrate } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    hydrate();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login' as any);
      }
    }, 1600);

    return () => clearTimeout(timer);
  }, [isHydrated, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        {/* Solid Branded Logo Box */}
        <View style={styles.logoBox}>
          <FontAwesome name="bolt" size={36} color="#38BDF8" />
        </View>

        {/* Brand Title & Tagline */}
        <Text style={styles.brandTitle}>PULSEFEED</Text>
        <Text style={styles.tagline}>High-Velocity Mobile Reader</Text>

        {/* Minimalist Solid Pill Indicator */}
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>READY</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: '#121826',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  tagline: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 28,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#121826',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
