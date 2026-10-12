import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Article } from '../types';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useBookmarkStore } from '../stores/useBookmarkStore';
import { useFeedStore } from '../stores/useFeedStore';

interface FeedCardProps {
  article: Article;
}

export const FeedCard: React.FC<FeedCardProps> = ({ article }) => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const { likedArticleIds, toggleLike } = useFeedStore();

  const bookmarked = isBookmarked(article.id);
  const liked = likedArticleIds.has(article.id);

  const handlePressCard = () => {
    router.push({
      pathname: '/article/[id]',
      params: { id: article.id },
    });
  };

  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const isHero = article.isHero;

  return (
    <Pressable
      onPress={handlePressCard}
      style={({ pressed }) => [
        styles.cardContainer,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          opacity: pressed ? 0.96 : 1,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        },
      ]}>
      {/* Media Image */}
      <View style={[styles.imageWrapper, isHero && styles.heroImageWrapper]}>
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={350}
          cachePolicy="disk"
        />
        {/* Category Pill Tag Overlay */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{article.category.toUpperCase()}</Text>
        </View>

        {article.isTrending && (
          <View style={styles.trendingBadge}>
            <FontAwesome name="fire" size={12} color="#FFA116" />
            <Text style={styles.trendingText}>TRENDING</Text>
          </View>
        )}
      </View>

      {/* Content Meta */}
      <View style={styles.contentBody}>
        {/* Source and Read Time */}
        <View style={styles.sourceRow}>
          {article.source.isLiveFeed && (
            <View style={styles.liveIndicatorPill}>
              <View style={styles.liveDotSmall} />
              <Text style={styles.liveIndicatorText}>LIVE</Text>
            </View>
          )}
          <Text style={[styles.sourceName, { color: colors.primary }]} numberOfLines={1}>
            {article.source.name}
          </Text>
          <Text style={[styles.dotSeparator, { color: colors.textSubtle }]}>•</Text>
          <Text style={[styles.timeAgo, { color: colors.textMuted }]}>{formatTimeAgo(article.publishedAt)}</Text>
          <Text style={[styles.dotSeparator, { color: colors.textSubtle }]}>•</Text>
          <Text style={[styles.readTime, { color: colors.textMuted }]}>{article.readTimeMinutes}m</Text>
        </View>

        {/* Explainable Edge AI Recommendation Match */}
        {article.recommendationReason && (
          <View style={[styles.recommendationBadge, { backgroundColor: colors.primaryLight }]}>
            <FontAwesome name="bullseye" size={10} color={colors.primary} />
            <Text style={[styles.recommendationText, { color: colors.primary }]}>
              {article.recommendationReason}
            </Text>
          </View>
        )}

        {/* Title */}
        <Text
          style={[styles.title, { color: colors.text }, isHero && styles.heroTitle]}
          numberOfLines={isHero ? 3 : 2}>
          {article.title}
        </Text>

        {/* Summary */}
        <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={2}>
          {article.summary}
        </Text>

        {/* Footer: Author & Micro-Interactions */}
        <View style={styles.cardFooter}>
          <View style={styles.authorGroup}>
            <Image
              source={{ uri: article.author.avatarUrl }}
              style={styles.authorAvatar}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <Text style={[styles.authorName, { color: colors.text }]}>{article.author.name}</Text>
          </View>

          <View style={styles.actionsGroup}>
            {/* Like Button */}
            <Pressable
              onPress={() => toggleLike(article.id)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.actionBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <FontAwesome
                name={liked ? 'heart' : 'heart-o'}
                size={16}
                color={liked ? colors.bookmark : colors.textSubtle}
              />
              <Text
                style={[
                  styles.actionCount,
                  { color: liked ? colors.bookmark : colors.textMuted },
                ]}>
                {article.likesCount}
              </Text>
            </Pressable>

            {/* Bookmark Button */}
            <Pressable
              onPress={() => toggleBookmark(article)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.actionBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <FontAwesome
                name={bookmarked ? 'bookmark' : 'bookmark-o'}
                size={17}
                color={bookmarked ? colors.primary : colors.textSubtle}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrapper: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: '#1A2233',
  },
  heroImageWrapper: {
    height: 230,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  categoryText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 161, 22, 0.3)',
  },
  trendingText: {
    color: '#FFA116',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  contentBody: {
    padding: 16,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceName: {
    fontSize: 12,
    fontWeight: '700',
  },
  dotSeparator: {
    marginHorizontal: 6,
    fontSize: 10,
  },
  timeAgo: {
    fontSize: 12,
  },
  readTime: {
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 20,
    lineHeight: 27,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#334155',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  liveDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EF4444',
  },
  liveIndicatorText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
