import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { TOPIC_CATEGORIES, FeedService } from '../../src/services/feedService';
import { useFeedStore } from '../../src/stores/useFeedStore';
import { TopicCategory } from '../../src/types';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { setCategory, setSearchQuery } = useFeedStore();
  const [filterText, setFilterText] = useState('');

  const trendingTopics = FeedService.getTrendingTopics();

  const handleSelectTopic = (cat: TopicCategory, tag?: string) => {
    setCategory(cat);
    if (tag) {
      setSearchQuery(tag);
    }
    router.navigate('/(tabs)');
  };

  const categories = TOPIC_CATEGORIES.filter((c) => c.id !== 'all');

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerSubtitle, { color: colors.primary }]}>DISCOVER</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Explore & Trending</Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <FontAwesome name="search" size={14} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search channels, tags, or topics..."
            placeholderTextColor={colors.textSubtle}
            value={filterText}
            onChangeText={setFilterText}
            onSubmitEditing={() => {
              if (filterText.trim()) {
                setSearchQuery(filterText.trim());
                router.navigate('/(tabs)');
              }
            }}
          />
        </View>

        {/* Trending Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <FontAwesome name="fire" size={16} color="#FFA116" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Topics</Text>
          </View>
        </View>

        <View style={styles.trendingGrid}>
          {trendingTopics.map((item, index) => (
            <Pressable
              key={item.tag}
              onPress={() => handleSelectTopic(item.category, item.tag)}
              style={({ pressed }) => [
                styles.trendingCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <View style={styles.trendingRankBox}>
                <Text style={styles.trendingRank}>#{index + 1}</Text>
              </View>
              <View style={styles.trendingInfo}>
                <Text style={[styles.trendingTag, { color: colors.text }]}>#{item.tag}</Text>
                <Text style={[styles.trendingCount, { color: colors.textMuted }]}>
                  {item.count.toLocaleString()} readers
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={12} color={colors.textSubtle} />
            </Pressable>
          ))}
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <FontAwesome name="th-large" size={15} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Channels</Text>
          </View>
        </View>

        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => handleSelectTopic(cat.id)}
              style={({ pressed }) => [
                styles.categoryCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <View style={[styles.catIconWrap, { backgroundColor: colors.primaryLight }]}>
                <FontAwesome name={cat.icon as any} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.catTitle, { color: colors.text }]}>{cat.label}</Text>
              <Text style={[styles.catSubtitle, { color: colors.textMuted }]}>
                Curated feeds & signals
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Curated Publishers */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <FontAwesome name="bookmark" size={15} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Curated Sources</Text>
          </View>
        </View>

        <View style={[styles.sourceListCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {[
            { name: 'Mobile Systems Engineering', domain: 'mobilesystems.dev', focus: 'React Native & iOS/Android' },
            { name: 'Distributed Weekly', domain: 'distributedweekly.com', focus: 'Databases & Local-First' },
            { name: 'Edge AI Journal', domain: 'edgeai.internal', focus: 'Quantized LLMs & Neural Silicon' },
            { name: 'Aesthetic Interfaces', domain: 'aestheticui.org', focus: 'Spatial UI & Design Systems' },
          ].map((src, i, arr) => (
            <View
              key={src.domain}
              style={[
                styles.sourceItem,
                i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
              ]}>
              <View>
                <Text style={[styles.sourceItemName, { color: colors.text }]}>{src.name}</Text>
                <Text style={[styles.sourceItemFocus, { color: colors.textMuted }]}>{src.focus}</Text>
              </View>
              <Text style={[styles.sourceDomain, { color: colors.primary }]}>{src.domain}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  trendingGrid: {
    gap: 8,
    marginBottom: 20,
  },
  trendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  trendingRankBox: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  trendingRank: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFA116',
  },
  trendingInfo: {
    flex: 1,
  },
  trendingTag: {
    fontSize: 15,
    fontWeight: '700',
  },
  trendingCount: {
    fontSize: 12,
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  categoryCard: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  catTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  catSubtitle: {
    fontSize: 11,
  },
  sourceListCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  sourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sourceItemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  sourceItemFocus: {
    fontSize: 11,
    marginTop: 2,
  },
  sourceDomain: {
    fontSize: 11,
    fontWeight: '600',
  },
});
