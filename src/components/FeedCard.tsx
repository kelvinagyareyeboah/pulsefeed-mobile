import React from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { Image } from 'expo-image';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Article } from '../types';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useBookmarkStore } from '../stores/useBookmarkStore';
import { useFeedStore } from '../stores/useFeedStore';
import { useSettingsStore, CardLayoutMode } from '../stores/useSettingsStore';

interface FeedCardProps {
  article: Article;
  layout?: CardLayoutMode;
}

export const FeedCard: React.FC<FeedCardProps> = ({ article, layout = 'compact' }) => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const { likedArticleIds, toggleLike } = useFeedStore();
  const { cardLayout } = useSettingsStore();

  const activeLayout = layout || cardLayout;
  const bookmarked = isBookmarked(article.id);
  const liked = likedArticleIds.has(article.id);

  const handlePressCard = () => {
    router.push({
      pathname: '/article/[id]',
      params: { id: article.id },
    } as any);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n${article.url}`,
        url: article.url,
      });
    } catch (e) {
      // Ignored
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (activeLayout === 'large') {
    return (
      <Pressable
        onPress={handlePressCard}
        style={({ pressed }) => [
          styles.largeCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            opacity: pressed ? 0.95 : 1,
          },
        ]}>
        {/* Large Featured Image */}
        <View style={styles.largeImageWrapper}>
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.largeImage}
            contentFit="cover"
            transition={300}
            cachePolicy="disk"
          />
          <View style={[styles.categoryTag, { backgroundColor: colors.badge }]}>
            <Text style={[styles.categoryTagText, { color: colors.badgeText }]}>
              {article.category.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.largeBody}>
          {/* Author / Source Meta */}
          <View style={styles.authorRow}>
            {article.author.avatarUrl ? (
              <Image source={{ uri: article.author.avatarUrl }} style={styles.authorAvatar} contentFit="cover" />
            ) : (
              <View style={[styles.authorAvatarFallback, { backgroundColor: colors.badge }]}>
                <FontAwesome name="user" size={12} color={colors.textMuted} />
              </View>
            )}
            <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
              {article.author.name}
            </Text>
            <Text style={[styles.dotSeparator, { color: colors.textSubtle }]}>•</Text>
            <Text style={[styles.sourceName, { color: colors.textMuted }]} numberOfLines={1}>
              {article.source.name}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.largeTitle, { color: colors.text }]} numberOfLines={3}>
            {article.title}
          </Text>

          {/* Excerpt */}
          <Text style={[styles.largeExcerpt, { color: colors.textMuted }]} numberOfLines={2}>
            {article.summary}
          </Text>

          {/* Bottom Actions Row */}
          <View style={styles.largeFooter}>
            <View style={styles.metaLeft}>
              <Text style={[styles.metaText, { color: colors.textSubtle }]}>
                {article.readTimeMinutes} min read
              </Text>
              <Text style={[styles.dotSeparator, { color: colors.textSubtle }]}>•</Text>
              <Text style={[styles.metaText, { color: colors.textSubtle }]}>
                {formatTimeAgo(article.publishedAt)}
              </Text>
            </View>

            <View style={styles.actionsRight}>
              <Pressable
                onPress={() => toggleLike(article.id)}
                hitSlop={10}
                style={styles.touchAction}>
                <FontAwesome
                  name={liked ? 'heart' : 'heart-o'}
                  size={16}
                  color={liked ? colors.bookmark : colors.textSubtle}
                />
                <Text style={[styles.actionCount, { color: liked ? colors.bookmark : colors.textSubtle }]}>
                  {article.likesCount + (liked ? 1 : 0)}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => toggleBookmark(article)}
                hitSlop={10}
                style={styles.touchAction}>
                <FontAwesome
                  name={bookmarked ? 'bookmark' : 'bookmark-o'}
                  size={16}
                  color={bookmarked ? colors.tint : colors.textSubtle}
                />
              </Pressable>

              <Pressable onPress={handleShare} hitSlop={10} style={styles.touchAction}>
                <FontAwesome name="share" size={15} color={colors.textSubtle} />
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // Compact layout (Medium signature story list item)
  return (
    <Pressable
      onPress={handlePressCard}
      style={({ pressed }) => [
        styles.compactCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          opacity: pressed ? 0.95 : 1,
        },
      ]}>
      <View style={styles.compactContent}>
        {/* Author / Source row */}
        <View style={styles.compactAuthorRow}>
          {article.author.avatarUrl ? (
            <Image source={{ uri: article.author.avatarUrl }} style={styles.compactAvatar} contentFit="cover" />
          ) : (
            <View style={[styles.compactAvatarFallback, { backgroundColor: colors.badge }]}>
              <FontAwesome name="user" size={10} color={colors.textMuted} />
            </View>
          )}
          <Text style={[styles.compactAuthorName, { color: colors.text }]} numberOfLines={1}>
            {article.author.name}
          </Text>
          <Text style={[styles.dotSeparator, { color: colors.textSubtle }]}>•</Text>
          <Text style={[styles.compactSourceName, { color: colors.textMuted }]} numberOfLines={1}>
            {article.source.name}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={2}>
          {article.title}
        </Text>

        {/* Excerpt */}
        <Text style={[styles.compactExcerpt, { color: colors.textMuted }]} numberOfLines={1}>
          {article.summary}
        </Text>

        {/* Meta / Actions Footer */}
        <View style={styles.compactFooter}>
          <View style={styles.compactMetaGroup}>
            <Text style={[styles.compactMetaText, { color: colors.textSubtle }]}>
              {article.readTimeMinutes} min read
            </Text>
            <Text style={[styles.dotSeparator, { color: colors.textSubtle }]}>•</Text>
            <Text style={[styles.compactMetaText, { color: colors.textSubtle }]}>
              {formatTimeAgo(article.publishedAt)}
            </Text>
          </View>

          <View style={styles.compactActionGroup}>
            <Pressable
              onPress={() => toggleLike(article.id)}
              hitSlop={8}
              style={styles.compactTouchAction}>
              <FontAwesome
                name={liked ? 'heart' : 'heart-o'}
                size={14}
                color={liked ? colors.bookmark : colors.textSubtle}
              />
            </Pressable>

            <Pressable
              onPress={() => toggleBookmark(article)}
              hitSlop={8}
              style={styles.compactTouchAction}>
              <FontAwesome
                name={bookmarked ? 'bookmark' : 'bookmark-o'}
                size={14}
                color={bookmarked ? colors.tint : colors.textSubtle}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Right Square Thumbnail */}
      <Image
        source={{ uri: article.imageUrl }}
        style={styles.compactThumbnail}
        contentFit="cover"
        transition={250}
        cachePolicy="disk"
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Large Card Styles
  largeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  largeImageWrapper: {
    width: '100%',
    height: 195,
    position: 'relative',
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  categoryTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  largeBody: {
    padding: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorAvatarFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 130,
  },
  sourceName: {
    fontSize: 13,
    maxWidth: 120,
  },
  dotSeparator: {
    marginHorizontal: 6,
    fontSize: 12,
  },
  largeTitle: {
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 25,
    marginBottom: 6,
  },
  largeExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  largeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  touchAction: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionCount: {
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '600',
  },

  // Compact Card Styles (Medium List)
  compactCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  compactContent: {
    flex: 1,
    marginRight: 14,
  },
  compactAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  compactAvatarFallback: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactAuthorName: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 110,
  },
  compactSourceName: {
    fontSize: 12,
    maxWidth: 100,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 4,
  },
  compactExcerpt: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  compactFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactMetaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactMetaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  compactActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactTouchAction: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactThumbnail: {
    width: 84,
    height: 84,
    borderRadius: 8,
  },
});
