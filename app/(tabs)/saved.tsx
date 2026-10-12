import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useBookmarkStore } from '../../src/stores/useBookmarkStore';
import { BookmarkRecord } from '../../src/types';

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const { bookmarks, toggleBookmark, toggleReadStatus, clearAllBookmarks } = useBookmarkStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredBookmarks = bookmarks.filter((b) => {
    if (filter === 'unread') return !b.isRead;
    if (filter === 'read') return b.isRead;
    return true;
  });

  const handleClearAll = () => {
    if (bookmarks.length === 0) return;
    Alert.alert(
      'Clear Saved Stories',
      'Are you sure you want to remove all saved articles from offline storage?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAllBookmarks },
      ]
    );
  };

  const renderBookmarkItem = ({ item }: { item: BookmarkRecord }) => {
    const art = item.article;

    return (
      <Pressable
        onPress={() => {
          router.push({
            pathname: '/article/[id]',
            params: { id: art.id },
          });
        }}
        style={({ pressed }) => [
          styles.itemCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <Image
          source={{ uri: art.imageUrl }}
          style={styles.itemImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />

        <View style={styles.itemInfo}>
          <View style={styles.itemTopRow}>
            <Text style={[styles.itemSource, { color: colors.primary }]}>{art.source.name}</Text>
            <Pressable
              onPress={() => toggleReadStatus(art.id)}
              hitSlop={8}
              style={[
                styles.readBadge,
                { backgroundColor: item.isRead ? 'rgba(16, 185, 129, 0.15)' : colors.badge },
              ]}>
              <Text
                style={[
                  styles.readBadgeText,
                  { color: item.isRead ? '#10B981' : colors.textMuted },
                ]}>
                {item.isRead ? 'READ' : 'UNREAD'}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
            {art.title}
          </Text>

          <View style={styles.itemBottomRow}>
            <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
              {art.readTimeMinutes} min read
            </Text>

            <Pressable
              onPress={() => toggleBookmark(art)}
              hitSlop={8}
              style={styles.removeBtn}>
              <FontAwesome name="trash-o" size={15} color={colors.textSubtle} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerTop}>
          <View>
            <View style={styles.offlineStatusRow}>
              <View style={styles.offlineDot} />
              <Text style={styles.offlineStatusText}>OFFLINE ARCHIVE</Text>
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Saved Articles</Text>
          </View>

          {bookmarks.length > 0 && (
            <Pressable onPress={handleClearAll} hitSlop={8} style={styles.clearBtn}>
              <Text style={[styles.clearText, { color: colors.textMuted }]}>Clear All</Text>
            </Pressable>
          )}
        </View>

        {/* Filter Pills (All, Unread, Read) */}
        <View style={styles.filterRow}>
          {(['all', 'unread', 'read'] as const).map((tab) => {
            const isSelected = filter === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setFilter(tab)}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                  },
                ]}>
                <Text
                  style={[
                    styles.filterTabText,
                    {
                      color: isSelected ? '#090D16' : colors.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}>
                  {tab === 'all' ? `All (${bookmarks.length})` : tab.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredBookmarks}
        keyExtractor={(item) => item.article.id}
        renderItem={renderBookmarkItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="bookmark-o" size={48} color={colors.textSubtle} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved stories</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Tap the bookmark icon on any feed card to save articles for instant offline reading.
            </Text>
            <Pressable
              onPress={() => router.navigate('/(tabs)')}
              style={[styles.exploreBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.exploreBtnText}>Go to Feed</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  offlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  offlineStatusText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearText: {
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  itemImage: {
    width: 105,
    height: '100%',
    minHeight: 100,
    backgroundColor: '#1E293B',
  },
  itemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemSource: {
    fontSize: 11,
    fontWeight: '700',
  },
  readBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  readBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 6,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemMeta: {
    fontSize: 11,
  },
  removeBtn: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  exploreBtnText: {
    color: '#090D16',
    fontWeight: '700',
    fontSize: 14,
  },
});
