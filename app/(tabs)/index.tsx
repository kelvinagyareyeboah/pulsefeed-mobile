import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  ViewToken,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useFeedStore } from '../../src/stores/useFeedStore';
import { useBookmarkStore } from '../../src/stores/useBookmarkStore';
import { FeedCard } from '../../src/components/FeedCard';
import { TopicPillBar } from '../../src/components/TopicPillBar';
import { TelemetryHud } from '../../src/components/TelemetryHud';
import { telemetryService } from '../../src/services/telemetryService';
import { prefetchService } from '../../src/services/prefetchService';
import { Article } from '../../src/types';

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const {
    articles,
    category,
    searchQuery,
    isLoading,
    isRefreshing,
    isLivePipeline,
    hasMore,
    setCategory,
    setSearchQuery,
    loadInitialFeed,
    refreshFeed,
    loadMore,
  } = useFeedStore();

  const { hydrate } = useBookmarkStore();
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    hydrate();
    loadInitialFeed();
  }, []);

  // FlashList Viewport Telemetry Tracker
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      const items = viewableItems
        .filter((token) => token.isViewable && token.item)
        .map((token) => {
          const art = token.item as Article;
          return {
            id: art.id,
            title: art.title,
            category: art.category,
          };
        });

      telemetryService.updateVisibleItems(items);
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // 50% of cell visible in viewport
    minimumViewTime: 100,
  }).current;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <View style={styles.brandRow}>
          <View style={styles.logoGroup}>
            <View style={[styles.logoIconBg, { backgroundColor: colors.primary }]}>
              <FontAwesome name="bolt" size={16} color="#090D16" />
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: colors.text }]}>PulseFeed</Text>
              <View style={styles.statusPillRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isLivePipeline ? '#10B981' : '#38BDF8' },
                  ]}
                />
                <Text
                  style={[
                    styles.statusPillText,
                    { color: isLivePipeline ? '#10B981' : '#38BDF8' },
                  ]}>
                  {isLivePipeline ? 'LIVE HN & DEV.TO' : 'EDGE SWR CACHED'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setIsSearchActive(!isSearchActive)}
              style={({ pressed }) => [
                styles.headerBtn,
                { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.7 : 1 },
              ]}>
              <FontAwesome
                name={isSearchActive ? 'close' : 'search'}
                size={14}
                color={colors.text}
              />
            </Pressable>
          </View>
        </View>

        {/* Collapsible Search Input */}
        {isSearchActive && (
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <FontAwesome name="search" size={13} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Filter stories, tags, or topics..."
              placeholderTextColor={colors.textSubtle}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <FontAwesome name="times-circle" size={14} color={colors.textSubtle} />
              </Pressable>
            )}
          </View>
        )}

        {/* Topic Pill Selector */}
        <TopicPillBar selectedCategory={category} onSelectCategory={setCategory} />
      </View>

      {/* 120 FPS High-Performance Feed List */}
      <View style={styles.listContainer}>
        <FlashList
          data={articles}
          renderItem={({ item }) => <FeedCard article={item} />}
          keyExtractor={(item) => item.id}
          onScroll={(e) => prefetchService.onScroll(e.nativeEvent.contentOffset.y, articles)}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshFeed}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <FontAwesome name="newspaper-o" size={42} color={colors.textSubtle} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No stories found</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  Try clearing your search filter or selecting another topic.
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            isLoading && articles.length > 0 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loaderText, { color: colors.textMuted }]}>
                  Streaming feed...
                </Text>
              </View>
            ) : null
          }
        />
      </View>

      {/* Live Viewport Telemetry HUD */}
      <TelemetryHud />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statusPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 80,
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
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  loaderText: {
    fontSize: 13,
  },
});
