import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useFeedStore } from '../../src/stores/useFeedStore';
import { TopicCategory, Article } from '../../src/types';
import { CURATED_ARTICLES } from '../../src/services/feedService';

interface ExploreTopicCard {
  id: TopicCategory;
  title: string;
  image: any;
  articleCount: string;
}

const EXPLORE_TOPICS: ExploreTopicCard[] = [
  {
    id: 'tech',
    title: 'Engineering',
    image: require('../../assets/images/topic-tech.jpg'),
    articleCount: '1.4k stories',
  },
  {
    id: 'ai',
    title: 'Technology & AI',
    image: require('../../assets/images/topic-ai.jpg'),
    articleCount: '2.8k stories',
  },
  {
    id: 'design',
    title: 'Design & UI',
    image: require('../../assets/images/topic-design.jpg'),
    articleCount: '920 stories',
  },
  {
    id: 'startups',
    title: 'Startups & VC',
    image: require('../../assets/images/topic-startups.jpg'),
    articleCount: '1.1k stories',
  },
  {
    id: 'finance',
    title: 'Markets & Economy',
    image: require('../../assets/images/topic-finance.jpg'),
    articleCount: '780 stories',
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { setCategory } = useFeedStore();

  const handleSelectTopic = (id: TopicCategory) => {
    setCategory(id);
    router.push('/(tabs)' as any);
  };

  const handleOpenArticle = (art: Article) => {
    router.push({
      pathname: '/article/[id]',
      params: { id: art.id },
    } as any);
  };

  const trendingArticles = CURATED_ARTICLES.slice(0, 4);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Bar */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Explore</Text>
        <Pressable
          onPress={() => router.push('/search' as any)}
          style={[styles.searchBarShortcut, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <FontAwesome name="search" size={13} color={colors.textSubtle} style={styles.searchIcon} />
          <Text style={[styles.searchPlaceholder, { color: colors.textSubtle }]}>
            Search stories and topics...
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        {/* Section: Topics Grid with Imagery */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Browse Topics</Text>
          <Text style={[styles.sectionSubheading, { color: colors.textMuted }]}>
            Curated coverage across software, design, and markets
          </Text>
        </View>

        <View style={styles.topicsGrid}>
          {EXPLORE_TOPICS.map((topic) => (
            <Pressable
              key={topic.id}
              onPress={() => handleSelectTopic(topic.id)}
              style={({ pressed }) => [
                styles.topicCard,
                {
                  borderColor: colors.cardBorder,
                  opacity: pressed ? 0.92 : 1,
                },
              ]}>
              <Image source={topic.image} style={styles.topicImage} contentFit="cover" transition={250} />
              <View style={styles.topicOverlay} />
              <View style={styles.topicContent}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicCount}>{topic.articleCount}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Section: Trending on PulseFeed (Medium Style Numbered List) */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <View style={styles.trendingHeaderRow}>
            <FontAwesome name="line-chart" size={14} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Trending on PulseFeed</Text>
          </View>
          <Text style={[styles.sectionSubheading, { color: colors.textMuted }]}>
            Most read stories across the network today
          </Text>
        </View>

        <View style={styles.trendingList}>
          {trendingArticles.map((article, index) => {
            const rank = `0${index + 1}`;
            return (
              <Pressable
                key={article.id}
                onPress={() => handleOpenArticle(article)}
                style={({ pressed }) => [
                  styles.trendingItem,
                  { borderBottomColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 },
                ]}>
                {/* Number Ranking */}
                <Text style={[styles.rankNumber, { color: colors.cardBorder }]}>{rank}</Text>

                {/* Content */}
                <View style={styles.trendingDetails}>
                  <View style={styles.authorRow}>
                    {article.author.avatarUrl ? (
                      <Image source={{ uri: article.author.avatarUrl }} style={styles.miniAvatar} contentFit="cover" />
                    ) : (
                      <View style={[styles.miniAvatarFallback, { backgroundColor: colors.badge }]}>
                        <FontAwesome name="user" size={9} color={colors.textMuted} />
                      </View>
                    )}
                    <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
                      {article.author.name}
                    </Text>
                    <Text style={[styles.dot, { color: colors.textSubtle }]}>•</Text>
                    <Text style={[styles.sourceText, { color: colors.textMuted }]} numberOfLines={1}>
                      {article.source.name}
                    </Text>
                  </View>

                  <Text style={[styles.trendingTitle, { color: colors.text }]} numberOfLines={2}>
                    {article.title}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text style={[styles.metaText, { color: colors.textSubtle }]}>
                      {article.readTimeMinutes} min read
                    </Text>
                    <Text style={[styles.dot, { color: colors.textSubtle }]}>•</Text>
                    <Text style={[styles.metaText, { color: colors.textSubtle }]}>
                      {article.category.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  searchBarShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    fontSize: 14,
    fontWeight: '400',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionSubheading: {
    fontSize: 13,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  topicImage: {
    width: '100%',
    height: '100%',
  },
  topicOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  topicContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  topicTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  topicCount: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '500',
  },
  trendingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingList: {
    gap: 16,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  rankNumber: {
    fontSize: 28,
    fontWeight: '800',
    width: 44,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  trendingDetails: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  miniAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
  },
  miniAvatarFallback: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 110,
  },
  sourceText: {
    fontSize: 12,
    maxWidth: 100,
  },
  dot: {
    marginHorizontal: 5,
    fontSize: 10,
  },
  trendingTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
