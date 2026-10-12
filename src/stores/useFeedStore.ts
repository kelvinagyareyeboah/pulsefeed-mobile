import { create } from 'zustand';
import { Article, TopicCategory } from '../types';
import { FeedService } from '../services/feedService';
import { recommendationEngine } from '../services/recommendationEngine';

interface FeedStoreState {
  articles: Article[];
  category: TopicCategory;
  searchQuery: string;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isLivePipeline: boolean;
  likedArticleIds: Set<string>;

  setCategory: (category: TopicCategory) => void;
  setSearchQuery: (query: string) => void;
  loadInitialFeed: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  loadMore: () => Promise<void>;
  toggleLike: (articleId: string) => void;
}

export const useFeedStore = create<FeedStoreState>((set, get) => ({
  articles: [],
  category: 'all',
  searchQuery: '',
  page: 1,
  hasMore: true,
  isLoading: false,
  isRefreshing: false,
  isLivePipeline: false,
  likedArticleIds: new Set<string>(),

  setCategory: (category) => {
    set({ category, page: 1, articles: [], hasMore: true });
    get().loadInitialFeed();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, page: 1, articles: [], hasMore: true });
    get().loadInitialFeed();
  },

  loadInitialFeed: async () => {
    const { category, searchQuery } = get();
    set({ isLoading: true });

    try {
      const response = await FeedService.fetchArticles(1, 8, category, searchQuery);
      set({
        articles: response.articles,
        hasMore: response.hasMore,
        isLivePipeline: response.isLive,
        page: 1,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to load feed:', err);
      set({ isLoading: false });
    }
  },

  refreshFeed: async () => {
    const { category, searchQuery } = get();
    set({ isRefreshing: true });

    try {
      const response = await FeedService.fetchArticles(1, 8, category, searchQuery);
      set({
        articles: response.articles,
        hasMore: response.hasMore,
        isLivePipeline: response.isLive,
        page: 1,
        isRefreshing: false,
      });
    } catch (err) {
      console.error('Failed to refresh feed:', err);
      set({ isRefreshing: false });
    }
  },

  loadMore: async () => {
    const { articles, page, hasMore, isLoading, category, searchQuery } = get();
    if (!hasMore || isLoading) return;

    set({ isLoading: true });
    try {
      const nextPage = page + 1;
      const response = await FeedService.fetchArticles(nextPage, 8, category, searchQuery);
      set({
        articles: [...articles, ...response.articles],
        hasMore: response.hasMore,
        isLivePipeline: response.isLive,
        page: nextPage,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to load more feed items:', err);
      set({ isLoading: false });
    }
  },

  toggleLike: (articleId) => {
    const { articles, likedArticleIds } = get();
    const targetArticle = articles.find((a) => a.id === articleId);

    const nextLiked = new Set(likedArticleIds);
    const isLiked = nextLiked.has(articleId);

    if (isLiked) {
      nextLiked.delete(articleId);
    } else {
      nextLiked.add(articleId);
      // Boost on-device recommendation affinity on like!
      if (targetArticle) {
        recommendationEngine.recordLike(targetArticle.category);
      }
    }

    const updatedArticles = articles.map((art) => {
      if (art.id === articleId) {
        return {
          ...art,
          likesCount: isLiked ? Math.max(0, art.likesCount - 1) : art.likesCount + 1,
        };
      }
      return art;
    });

    set({
      likedArticleIds: nextLiked,
      articles: updatedArticles,
    });
  },
}));
