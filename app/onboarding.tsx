import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export const ONBOARDING_COMPLETED_KEY = '@pulsefeed_onboarding_completed';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image: any;
}

const SLIDES: Slide[] = [
  {
    id: 'slide_1',
    title: 'Read what matters.',
    subtitle: 'High-signal perspectives on engineering, design, and the ideas shaping modern software.',
    image: require('../assets/images/onboarding-1.jpg'),
  },
  {
    id: 'slide_2',
    title: 'Curated for your mind.',
    subtitle: 'Your library and home feed naturally adapt as you explore, bookmark, and discover stories.',
    image: require('../assets/images/onboarding-2.jpg'),
  },
  {
    id: 'slide_3',
    title: 'Read anywhere, anytime.',
    subtitle: 'Save stories with one tap for distraction-free reading, completely offline.',
    image: require('../assets/images/onboarding-3.jpg'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    } catch (e) {
      console.warn('Failed to save onboarding state:', e);
    }
    router.replace('/topic-picker' as any);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      completeOnboarding();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header / Skip Button */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 8 }]}>
        <View style={styles.brandTitleRow}>
          <Text style={[styles.brandTitle, { color: colors.text }]}>PulseFeed</Text>
        </View>
        <Pressable
          onPress={completeOnboarding}
          hitSlop={12}
          style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
        </Pressable>
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slideContainer, { width }]}>
            <View style={styles.imageCardWrapper}>
              <Image
                source={item.image}
                style={styles.slideImage}
                contentFit="cover"
                transition={300}
              />
            </View>
            <View style={styles.slideTextContainer}>
              <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.slideSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Footer: Pagination Dots & Action Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) + 12 }]}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: isActive ? colors.primary : colors.cardBorder,
                    width: isActive ? 24 : 8,
                  },
                ]}
              />
            );
          })}
        </View>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.continueButton,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.88 : 1,
            },
          ]}>
          <Text style={styles.continueButtonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  skipButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  slideContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCardWrapper: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideTextContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  slideSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  footer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  continueButton: {
    minHeight: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#090D16',
    fontSize: 16,
    fontWeight: '700',
  },
});
