import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useBookmarkStore } from '../../src/stores/useBookmarkStore';
import { EmptyState } from '../../src/components/EmptyState';
import { Article, BookmarkRecord } from '../../src/types';

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const { bookmarks, toggleBookmark, toggleReadStatus } = useBookmarkStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredBookmarks = bookmarks.filter((item) => {
    if (filter === 'unread') return !item.isRead;
    return true;
  });

  const handleOpenArticle = (article: Article) => {
    router.push({
      pathname: '/article/[id]',
      params: { id: article.id },
    } as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.title, { color: colors.text }]}>Library</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {bookmarks.length} {bookmarks.length === 1 ? 'story' : 'stories'} saved for offline reading
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: colors.cardBorder }]}>
        <Pressable
          onPress={() => setFilter('all')}
          style={[styles.tabItem, filter === 'all' && { borderBottomColor: colors.primary }]}>
          <Text style={[styles.tabText, { color: filter === 'all' ? colors.text : colors.textMuted }]}>
            All ({bookmarks.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilter('unread')}
          style={[styles.tabItem, filter === 'unread' && { borderBottomColor: colors.primary }]}>
          <Text style={[styles.tabText, { color: filter === 'unread' ? colors.text : colors.textMuted }]}>
            Unread ({bookmarks.filter((b) => !b.isRead).length})
          </Text>
        </Pressable>
      </View>

      {/* Content List */}
      {filteredBookmarks.length === 0 ? (
        <EmptyState
          imageSource={require('../../assets/images/empty-library.jpg')}
          title={filter === 'unread' ? 'No unread stories' : 'Your library is empty'}
          description={
            filter === 'unread'
              ? 'You have read all stories in your reading list. Stories you bookmark will appear here.'
              : 'Save long-form stories to read them anywhere, completely offline without an internet connection.'
          }
          actionLabel="Explore Stories"
          onAction={() => router.push('/(tabs)' as any)}
        />
      ) : (
        <FlatList
          data={filteredBookmarks}
          keyExtractor={(item) => item.article.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const { article, isRead } = item;
            return (
              <Pressable
                onPress={() => handleOpenArticle(article)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    opacity: pressed ? 0.95 : 1,
                  },
                ]}>
                <View style={styles.cardContent}>
                  {/* Author / Source Meta */}
                  <View style={styles.authorRow}>
                    <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
                      {article.author.name}
                    </Text>
                    <Text style={[styles.dot, { color: colors.textSubtle }]}>•</Text>
                    <Text style={[styles.sourceName, { color: colors.textMuted }]} numberOfLines={1}>
                      {article.source.name}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                    {article.title}
                  </Text>

                  {/* Offline Badge & Read Time */}
                  <View style={styles.cardFooter}>
                    <View style={[styles.offlineBadge, { backgroundColor: colors.badge }]}>
                      <FontAwesome name="check" size={10} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={[styles.offlineText, { color: colors.badgeText }]}>Available offline</Text>
                    </View>

                    <Text style={[styles.readTimeText, { color: colors.textSubtle }]}>
                      {article.readTimeMinutes} min read
                    </Text>
                  </View>
                </View>

                {/* Right Actions & Thumbnail */}
                <View style={styles.cardRightCol}>
                  <Image
                    source={{ uri: article.imageUrl }}
                    style={styles.thumbnail}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="disk"
                  />

                  <View style={styles.actionButtonsRow}>
                    {/* Mark as read/unread */}
                    <Pressable
                      onPress={() => toggleReadStatus(article.id)}
                      hitSlop={8}
                      style={styles.touchAction}>
                      <FontAwesome
                        name={isRead ? 'check-circle' : 'circle-o'}
                        size={15}
                        color={isRead ? colors.primary : colors.textSubtle}
                      />
                    </Pressable>

                    {/* Remove Bookmark */}
                    <Pressable
                      onPress={() => toggleBookmark(article)}
                      hitSlop={8}
                      style={styles.touchAction}>
                      <FontAwesome name="bookmark" size={15} color={colors.tint} />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
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
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minHeight: 44,
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 8,
  },
  card: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginRight: 14,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 110,
  },
  sourceName: {
    fontSize: 12,
    maxWidth: 100,
  },
  dot: {
    marginHorizontal: 5,
    fontSize: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  offlineText: {
    fontSize: 10,
    fontWeight: '600',
  },
  readTimeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardRightCol: {
    alignItems: 'center',
    gap: 8,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  touchAction: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
