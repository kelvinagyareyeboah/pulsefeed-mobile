import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FeedService } from '../../src/services/feedService';
import { useFeedStore } from '../../src/stores/useFeedStore';
import { useBookmarkStore } from '../../src/stores/useBookmarkStore';

export default function ArticleDetailScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { articles, likedArticleIds, toggleLike } = useFeedStore();
  const { isBookmarked, toggleBookmark } = useBookmarkStore();

  // Find article from service or active stores
  const article =
    FeedService.getArticleById(id) ||
    articles.find((a) => a.id === id);

  if (!article) {
    return (
      <View style={[styles.notFoundContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <FontAwesome name="exclamation-circle" size={40} color={colors.textSubtle} />
        <Text style={[styles.notFoundTitle, { color: colors.text }]}>Article Not Found</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const bookmarked = isBookmarked(article.id);
  const liked = likedArticleIds.has(article.id);

  const handleOpenOriginal = async () => {
    try {
      await WebBrowser.openBrowserAsync(article.url, {
        toolbarColor: colors.card,
        controlsColor: colors.primary,
      });
    } catch (e) {
      console.error('Failed to open web browser:', e);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\nRead more on PulseFeed:\n${article.url}`,
      });
    } catch (e) {
      console.error('Error sharing article:', e);
    }
  };

  const formatPublishDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Floating Header Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.roundIconBtn, { opacity: pressed ? 0.7 : 1 }]}>
          <FontAwesome name="arrow-left" size={16} color="#FFFFFF" />
        </Pressable>

        <View style={styles.topBarRight}>
          <Pressable
            onPress={() => toggleBookmark(article)}
            style={({ pressed }) => [styles.roundIconBtn, { opacity: pressed ? 0.7 : 1 }]}>
            <FontAwesome
              name={bookmarked ? 'bookmark' : 'bookmark-o'}
              size={17}
              color={bookmarked ? '#38BDF8' : '#FFFFFF'}
            />
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [styles.roundIconBtn, { opacity: pressed ? 0.7 : 1 }]}>
            <FontAwesome name="share" size={15} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>

        <View style={styles.articleBody}>
          {/* Metadata Row */}
          <View style={styles.metaRow}>
            <View style={[styles.categoryTag, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.categoryTagText, { color: colors.primary }]}>
                {article.category.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.dotSep, { color: colors.textSubtle }]}>•</Text>
            <Text style={[styles.readTimeText, { color: colors.textMuted }]}>
              {article.readTimeMinutes} min read
            </Text>
            <Text style={[styles.dotSep, { color: colors.textSubtle }]}>•</Text>
            <Text style={[styles.dateText, { color: colors.textMuted }]}>
              {formatPublishDate(article.publishedAt)}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>

          {/* Author Capsule */}
          <View style={[styles.authorCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Image
              source={{ uri: article.author.avatarUrl }}
              style={styles.authorAvatar}
              contentFit="cover"
            />
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, { color: colors.text }]}>{article.author.name}</Text>
              <Text style={[styles.authorRole, { color: colors.textMuted }]}>
                {article.author.role || 'Contributor'} • {article.source.name}
              </Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {article.tags.map((tag) => (
              <View
                key={tag}
                style={[styles.tagPill, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.tagText, { color: colors.textMuted }]}>#{tag}</Text>
              </View>
            ))}
          </View>

          {/* Article Text Content */}
          <Text style={[styles.paragraph, { color: colors.text }]}>{article.content}</Text>

          {/* Read Original Source Banner */}
          <Pressable
            onPress={handleOpenOriginal}
            style={({ pressed }) => [
              styles.openOriginalBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <View style={styles.openOriginalLeft}>
              <FontAwesome name="globe" size={20} color={colors.primary} />
              <View>
                <Text style={[styles.openOriginalTitle, { color: colors.text }]}>
                  Read original on {article.source.domain}
                </Text>
                <Text style={[styles.openOriginalSub, { color: colors.textMuted }]}>
                  Opens publisher article in browser
                </Text>
              </View>
            </View>
            <FontAwesome name="external-link" size={15} color={colors.primary} />
          </Pressable>

          {/* Bottom Engagement Row */}
          <View style={[styles.bottomBar, { borderTopColor: colors.cardBorder }]}>
            <Pressable
              onPress={() => toggleLike(article.id)}
              style={({ pressed }) => [
                styles.likeBtn,
                { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.7 : 1 },
              ]}>
              <FontAwesome
                name={liked ? 'heart' : 'heart-o'}
                size={16}
                color={liked ? colors.bookmark : colors.textSubtle}
              />
              <Text
                style={[
                  styles.likeCountText,
                  { color: liked ? colors.bookmark : colors.text },
                ]}>
                {article.likesCount} {article.likesCount === 1 ? 'Like' : 'Likes'}
              </Text>
            </Pressable>

            <View style={styles.viewCountGroup}>
              <FontAwesome name="eye" size={14} color={colors.textSubtle} />
              <Text style={[styles.viewCountText, { color: colors.textMuted }]}>
                {article.viewsCount.toLocaleString()} reads
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  roundIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 10,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  heroContainer: {
    width: '100%',
    height: 290,
    backgroundColor: '#1E293B',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  articleBody: {
    padding: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dotSep: {
    marginHorizontal: 8,
    fontSize: 10,
  },
  readTimeText: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 16,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  authorRole: {
    fontSize: 12,
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 24,
  },
  openOriginalBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  openOriginalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  openOriginalTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  openOriginalSub: {
    fontSize: 11,
    marginTop: 2,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  likeCountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  viewCountGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewCountText: {
    fontSize: 12,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 20,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backBtnText: {
    color: '#090D16',
    fontWeight: '700',
  },
});
