import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article, BookmarkRecord } from '../types';
import { recommendationEngine } from '../services/recommendationEngine';

const STORAGE_KEY = '@pulsefeed_bookmarks_v1';

interface BookmarkStoreState {
  bookmarks: BookmarkRecord[];
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  toggleBookmark: (article: Article) => Promise<void>;
  toggleReadStatus: (articleId: string) => Promise<void>;
  isBookmarked: (articleId: string) => boolean;
  clearAllBookmarks: () => Promise<void>;
}

export const useBookmarkStore = create<BookmarkStoreState>((set, get) => ({
  bookmarks: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: BookmarkRecord[] = JSON.parse(stored);
        set({ bookmarks: parsed, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (e) {
      console.error('Failed to hydrate bookmarks:', e);
      set({ isHydrated: true });
    }
  },

  toggleBookmark: async (article: Article) => {
    const { bookmarks } = get();
    const existingIndex = bookmarks.findIndex((b) => b.article.id === article.id);

    let updated: BookmarkRecord[];
    if (existingIndex >= 0) {
      // Remove
      updated = bookmarks.filter((b) => b.article.id !== article.id);
    } else {
      // Add
      const newRecord: BookmarkRecord = {
        article,
        savedAt: Date.now(),
        isRead: false,
      };
      updated = [newRecord, ...bookmarks];
      // Feed high-intent bookmark signal to on-device recommendation engine
      recommendationEngine.recordBookmark(article.category);
    }

    set({ bookmarks: updated });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save bookmarks to AsyncStorage:', e);
    }
  },

  toggleReadStatus: async (articleId: string) => {
    const { bookmarks } = get();
    const updated = bookmarks.map((b) => {
      if (b.article.id === articleId) {
        return { ...b, isRead: !b.isRead };
      }
      return b;
    });

    set({ bookmarks: updated });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update bookmark read status:', e);
    }
  },

  isBookmarked: (articleId: string) => {
    return get().bookmarks.some((b) => b.article.id === articleId);
  },

  clearAllBookmarks: async () => {
    set({ bookmarks: [] });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear bookmarks:', e);
    }
  },
}));
