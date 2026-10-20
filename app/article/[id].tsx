import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useBookmarkStore } from '../../src/stores/useBookmarkStore';
import { useFeedStore } from '../../src/stores/useFeedStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { CURATED_ARTICLES } from '../../src/services/feedService';
import { Article } from '../../src/types';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const { isBookmarked, toggleBookmark } = useBookmarkStore();
  const { likedArticleIds, toggleLike } = useFeedStore();
  const { markArticleAsRead, incrementClap, articleClaps } = useSettingsStore();

  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSizeOffset, setFontSizeOffset] = useState(0); // -2, 0, +2
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);

  // Find article in curated or feed store
  const article: Article | undefined =
    useFeedStore.getState().articles.find((a) => a.id === id) ||
    CURATED_ARTICLES.find((a) => a.id === id) ||
    CURATED_ARTICLES[0];

  useEffect(() => {
    if (article) {
      markArticleAsRead(article.id);
    }
  }, [article?.id]);

  if (!article) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Story not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const bookmarked = isBookmarked(article.id);
  const liked = likedArticleIds.has(article.id);
  const localClaps = (articleClaps[article.id] || 0) + (liked ? 1 : 0);

  const handleShare = async () => {
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\nRead on PulseFeed:\n${article.url}`,
        url: article.url,
      });
    } catch (e) {
      // Ignored
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const totalScrollable = contentSize.height - layoutMeasurement.height;
    if (totalScrollable > 0) {
      const progress = Math.min(1, Math.max(0, contentOffset.y / totalScrollable));
      setReadingProgress(progress);
    }
  };

  const handleClap = async () => {
    toggleLike(article.id);
    await incrementClap(article.id);
  };

  const cycleFontSize = () => {
    setFontSizeOffset((prev) => (prev === 0 ? 2 : prev === 2 ? -2 : 0));
  };

  const formatPublishDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently published';
    }
  };

  const bodyFontSize = 17 + fontSizeOffset;
  const bodyLineHeight = Math.round(bodyFontSize * 1.65);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky Top Header Bar */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 6, borderBottomColor: colors.cardBorder }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.touchTarget}>
          <FontAwesome name="arrow-left" size={16} color={colors.text} />
        </Pressable>

        <Text style={[styles.headerSourceText, { color: colors.textMuted }]} numberOfLines={1}>
          {article.source.name}
        </Text>

        <View style={styles.headerActions}>
          <Pressable onPress={() => toggleBookmark(article)} hitSlop={10} style={styles.touchTarget}>
            <FontAwesome
              name={bookmarked ? 'bookmark' : 'bookmark-o'}
              size={18}
              color={bookmarked ? colors.tint : colors.text}
            />
          </Pressable>
          <Pressable onPress={handleShare} hitSlop={10} style={styles.touchTarget}>
            <FontAwesome name="share" size={16} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Reading Progress Indicator Bar */}
      <View style={[styles.progressBarTrack, { backgroundColor: colors.cardBorder }]}>
        <View
          style={[
            styles.progressBarFill,
            { backgroundColor: colors.primary, width: `${Math.round(readingProgress * 100)}%` },
          ]}
        />
      </View>

      {/* Article Content ScrollView */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        {/* Category Badge & Reading Time */}
        <View style={styles.metaTopRow}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.badge }]}>
            <Text style={[styles.categoryBadgeText, { color: colors.badgeText }]}>
              {article.category.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.readingTimeText, { color: colors.textMuted }]}>
            {article.readTimeMinutes} min read
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.articleTitle, { color: colors.text }]}>{article.title}</Text>

        {/* Subtitle / Excerpt */}
        <Text style={[styles.articleSubtitle, { color: colors.textMuted }]}>{article.summary}</Text>

        {/* Author Details Card */}
        <View style={[styles.authorCard, { borderColor: colors.cardBorder }]}>
          {article.author.avatarUrl ? (
            <Image source={{ uri: article.author.avatarUrl }} style={styles.authorAvatar} contentFit="cover" />
          ) : (
            <View style={[styles.authorAvatarFallback, { backgroundColor: colors.badge }]}>
              <FontAwesome name="user" size={16} color={colors.textMuted} />
            </View>
          )}

          <View style={styles.authorMeta}>
            <Text style={[styles.authorNameText, { color: colors.text }]}>{article.author.name}</Text>
            <Text style={[styles.authorRoleText, { color: colors.textMuted }]} numberOfLines={1}>
              {article.author.role || article.source.name} • {formatPublishDate(article.publishedAt)}
            </Text>
          </View>

          <Pressable
            onPress={() => setIsFollowingAuthor(!isFollowingAuthor)}
            style={({ pressed }) => [
              styles.followButton,
              {
                backgroundColor: isFollowingAuthor ? colors.card : colors.primaryLight,
                borderColor: isFollowingAuthor ? colors.cardBorder : colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Text style={[styles.followButtonText, { color: colors.primary }]}>
              {isFollowingAuthor ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        </View>

        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
            cachePolicy="disk"
          />
          <Text style={[styles.imageCaption, { color: colors.textSubtle }]}>
            Source: {article.source.domain}
          </Text>
        </View>

        {/* Formatted Article Body */}
        <View style={styles.bodyWrapper}>
          {article.content.split('\n\n').map((paragraph, index) => {
            // Check if paragraph is a list item or heading
            if (paragraph.startsWith('1.') || paragraph.startsWith('2.') || paragraph.startsWith('3.')) {
              return (
                <View
                  key={index}
                  style={[styles.quoteBlock, { borderColor: colors.primary, backgroundColor: colors.card }]}>
                  <Text style={[styles.quoteText, { color: colors.text, fontSize: bodyFontSize, lineHeight: bodyLineHeight }]}>
                    {paragraph}
                  </Text>
                </View>
              );
            }

            return (
              <Text
                key={index}
                style={[
                  styles.paragraph,
                  { color: colors.text, fontSize: bodyFontSize, lineHeight: bodyLineHeight },
                ]}>
                {paragraph}
              </Text>
            );
          })}
        </View>

        {/* Tags Row */}
        <View style={styles.tagsContainer}>
          {article.tags.map((tag, i) => (
            <View key={i} style={[styles.tagPill, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.tagPillText, { color: colors.textMuted }]}>#{tag}</Text>
            </View>
          ))}
        </View>

        {/* End of story divider */}
        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

        {/* Recommendation / Written By Footer */}
        <View style={styles.storyFooter}>
          <Text style={[styles.writtenByTitle, { color: colors.text }]}>Written by {article.author.name}</Text>
          <Text style={[styles.writtenByDesc, { color: colors.textMuted }]}>
            Published in {article.source.name}. Regular contributor covering modern software architecture and systems design.
          </Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar (Medium Style) */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: colors.card,
            borderTopColor: colors.cardBorder,
          },
        ]}>
        <Pressable onPress={handleClap} style={styles.bottomBarAction} hitSlop={8}>
          <FontAwesome
            name={liked ? 'heart' : 'heart-o'}
            size={18}
            color={liked ? colors.bookmark : colors.text}
          />
          <Text style={[styles.bottomBarCount, { color: liked ? colors.bookmark : colors.text }]}>
            {article.likesCount + localClaps}
          </Text>
        </Pressable>

        <View style={styles.bottomBarRightGroup}>
          <Pressable onPress={cycleFontSize} style={styles.bottomBarAction} hitSlop={8}>
            <Text style={[styles.fontScaleIndicator, { color: colors.text }]}>
              {fontSizeOffset === 2 ? 'A+' : fontSizeOffset === -2 ? 'A-' : 'A'}
            </Text>
          </Pressable>

          <Pressable onPress={() => toggleBookmark(article)} style={styles.bottomBarAction} hitSlop={8}>
            <FontAwesome
              name={bookmarked ? 'bookmark' : 'bookmark-o'}
              size={18}
              color={bookmarked ? colors.tint : colors.text}
            />
          </Pressable>

          <Pressable onPress={handleShare} style={styles.bottomBarAction} hitSlop={8}>
            <FontAwesome name="share" size={17} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  backButton: {
    minHeight: 44,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSourceText: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 180,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressBarTrack: {
    height: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  metaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  readingTimeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  articleTitle: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 33,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  articleSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  authorAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorMeta: {
    flex: 1,
    marginRight: 10,
  },
  authorNameText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  authorRoleText: {
    fontSize: 12,
  },
  followButton: {
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  imageCaption: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  bodyWrapper: {
    marginBottom: 24,
  },
  paragraph: {
    marginBottom: 20,
    fontWeight: '400',
  },
  quoteBlock: {
    borderLeftWidth: 3,
    padding: 16,
    borderRadius: 8,
    marginVertical: 14,
  },
  quoteText: {
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  storyFooter: {
    paddingBottom: 20,
  },
  writtenByTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  writtenByDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomBarAction: {
    minHeight: 44,
    minWidth: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarCount: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  bottomBarRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fontScaleIndicator: {
    fontSize: 15,
    fontWeight: '700',
  },
});
