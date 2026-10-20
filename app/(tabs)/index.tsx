import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  RefreshControl,
  ViewToken,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useFeedStore } from '../../src/stores/useFeedStore';
import { useBookmarkStore } from '../../src/stores/useBookmarkStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { FeedCard } from '../../src/components/FeedCard';
import { TopicPillBar, FeedTab } from '../../src/components/TopicPillBar';
import { SkeletonCard } from '../../src/components/SkeletonCard';
import { OfflineBanner } from '../../src/components/OfflineBanner';
import { EmptyState } from '../../src/components/EmptyState';
import { telemetryService } from '../../src/services/telemetryService';
import { prefetchService } from '../../src/services/prefetchService';
import { Article, TopicCategory } from '../../src/types';

export default function FeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const {
    articles,
    category,
    isLoading,
    isRefreshing,
    setCategory,
    loadInitialFeed,
    refreshFeed,
    loadMore,
  } = useFeedStore();

  const { hydrate: hydrateBookmarks } = useBookmarkStore();
  const { cardLayout, setCardLayout, dataSaver, isOffline, setIsOffline } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<FeedTab>('for-you');

  const handleSelectTab = (tab: FeedTab) => {
    setActiveTab(tab);
    if (tab === 'for-you' || tab === 'latest') {
      setCategory('all');
    } else {
      setCategory(tab as TopicCategory);
    }
  };

  useEffect(() => {
    hydrateBookmarks();
    loadInitialFeed();
  }, []);

  // FlashList Viewport Telemetry Tracker (Runs silently under the hood)
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
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;

  // Predictive Image Lookahead Prefetcher (Disabled if Data Saver is ON)
  const handleScroll = (event: any) => {
    if (dataSaver) return; // Respect Data Saver mode
    const currentY = event.nativeEvent.contentOffset.y;
    prefetchService.onScroll(currentY, articles, 3);
  };

  const toggleCardLayout = () => {
    setCardLayout(cardLayout === 'compact' ? 'large' : 'compact');
  };

  // Sort articles based on For You vs Latest tab
  const displayedArticles = [...articles].sort((a, b) => {
    if (activeTab === 'latest') {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
    // 'for-you' utilizes the client ranking score
    return (b.edgeScore || 0) - (a.edgeScore || 0);
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Editorial Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.brandTitleRow}>
          <Text style={[styles.brandTitle, { color: colors.text }]}>PulseFeed</Text>
        </View>

        <View style={styles.headerRightActions}>
          {/* Card Layout Mode Toggle (Large vs Compact) */}
          <Pressable
            onPress={toggleCardLayout}
            hitSlop={10}
            style={[styles.headerIconButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <FontAwesome
              name={cardLayout === 'compact' ? 'th-large' : 'bars'}
              size={14}
              color={colors.text}
            />
          </Pressable>

          {/* Search Button */}
          <Pressable
            onPress={() => router.push('/search' as any)}
            hitSlop={10}
            style={[styles.headerIconButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <FontAwesome name="search" size={14} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Unified Horizontal Tabs Bar (Medium Style) */}
      <TopicPillBar selectedTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Offline Banner */}
      <OfflineBanner
        visible={isOffline}
        onRetry={() => {
          setIsOffline(false);
          refreshFeed();
        }}
      />

      {/* Content Feed with FlashList v2 */}
      {isLoading && articles.length === 0 ? (
        <View style={styles.skeletonContainer}>
          <SkeletonCard layout={cardLayout} />
          <SkeletonCard layout={cardLayout} />
          <SkeletonCard layout={cardLayout} />
        </View>
      ) : displayedArticles.length === 0 ? (
        <EmptyState
          icon="newspaper-o"
          title="No stories found"
          description="We couldn't find any stories in this section. Pull down to refresh the feed."
          actionLabel="Refresh Feed"
          onAction={refreshFeed}
        />
      ) : (
        <View style={styles.feedWrapper}>
          <FlashList
            data={displayedArticles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <FeedCard article={item} layout={cardLayout} />}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onScroll={handleScroll}
            scrollEventThrottle={32}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refreshFeed}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedWrapper: {
    flex: 1,
  },
  skeletonContainer: {
    paddingTop: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
});
