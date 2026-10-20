import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { TopicCategory } from '../src/types';
import { useSettingsStore } from '../src/stores/useSettingsStore';
import { recommendationEngine } from '../src/services/recommendationEngine';

interface TopicOption {
  id: TopicCategory;
  title: string;
  image: any;
}

const TOPIC_OPTIONS: TopicOption[] = [
  {
    id: 'tech',
    title: 'Engineering',
    image: require('../assets/images/topic-tech.jpg'),
  },
  {
    id: 'ai',
    title: 'Technology & AI',
    image: require('../assets/images/topic-ai.jpg'),
  },
  {
    id: 'design',
    title: 'Design & UI',
    image: require('../assets/images/topic-design.jpg'),
  },
  {
    id: 'startups',
    title: 'Startups & VC',
    image: require('../assets/images/topic-startups.jpg'),
  },
  {
    id: 'finance',
    title: 'Markets & Economy',
    image: require('../assets/images/topic-finance.jpg'),
  },
];

export default function TopicPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { setSelectedTopics } = useSettingsStore();

  const [selected, setSelected] = useState<Set<TopicCategory>>(
    new Set(['tech', 'ai', 'design'])
  );

  const toggleTopic = (id: TopicCategory) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const isEligible = selected.size >= 3;

  const handleContinue = async () => {
    if (!isEligible) return;
    const topicsArray = Array.from(selected);
    await setSelectedTopics(topicsArray);

    // Seed recommendation affinity vector
    topicsArray.forEach((cat) => {
      recommendationEngine.recordLike(cat);
    });

    router.replace('/(tabs)' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.text }]}>What are your interests?</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Select 3 or more topics to personalize your reading feed.
        </Text>
      </View>

      {/* Grid of Topics */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {TOPIC_OPTIONS.map((topic) => {
            const isSelected = selected.has(topic.id);
            return (
              <Pressable
                key={topic.id}
                onPress={() => toggleTopic(topic.id)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}>
                <Image
                  source={topic.image}
                  style={styles.cardImage}
                  contentFit="cover"
                  transition={250}
                />
                <View style={styles.cardOverlay} />

                {/* Selected Checkmark Badge */}
                <View
                  style={[
                    styles.checkBadge,
                    {
                      backgroundColor: isSelected ? colors.primary : 'rgba(0,0,0,0.5)',
                      borderColor: isSelected ? colors.primary : '#FFFFFF',
                    },
                  ]}>
                  {isSelected && <FontAwesome name="check" size={12} color="#090D16" />}
                </View>

                {/* Topic Title */}
                <View style={styles.cardTextWrapper}>
                  <Text style={styles.cardTitle}>{topic.title}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) + 8, backgroundColor: colors.background, borderTopColor: colors.cardBorder }]}>
        <View style={styles.counterRow}>
          <Text style={[styles.counterText, { color: isEligible ? colors.primary : colors.textMuted }]}>
            {selected.size} of 3 selected
          </Text>
        </View>

        <Pressable
          onPress={handleContinue}
          disabled={!isEligible}
          style={({ pressed }) => [
            styles.continueButton,
            {
              backgroundColor: isEligible ? colors.primary : colors.cardBorder,
              opacity: pressed && isEligible ? 0.88 : 1,
            },
          ]}>
          <Text
            style={[
              styles.continueButtonText,
              { color: isEligible ? '#090D16' : colors.textSubtle },
            ]}>
            Continue
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  counterRow: {
    alignItems: 'center',
  },
  counterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  continueButton: {
    minHeight: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
