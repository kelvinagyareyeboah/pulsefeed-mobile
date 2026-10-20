import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TopicCategory } from '../types';

const SETTINGS_STORAGE_KEY = '@pulsefeed_settings_v1';
const HISTORY_STORAGE_KEY = '@pulsefeed_read_history_v1';
const CLAPS_STORAGE_KEY = '@pulsefeed_article_claps_v1';

export type CardLayoutMode = 'large' | 'compact';
export type ThemePreference = 'system' | 'light' | 'dark';

interface SettingsStoreState {
  theme: ThemePreference;
  cardLayout: CardLayoutMode;
  dataSaver: boolean;
  notifications: boolean;
  selectedTopics: TopicCategory[];
  readArticleIds: Set<string>;
  articleClaps: Record<string, number>;
  isOffline: boolean;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setCardLayout: (layout: CardLayoutMode) => Promise<void>;
  setDataSaver: (enabled: boolean) => Promise<void>;
  setNotifications: (enabled: boolean) => Promise<void>;
  setSelectedTopics: (topics: TopicCategory[]) => Promise<void>;
  markArticleAsRead: (articleId: string) => Promise<void>;
  incrementClap: (articleId: string) => Promise<number>;
  setIsOffline: (offline: boolean) => void;
  clearCache: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  theme: 'system',
  cardLayout: 'compact',
  dataSaver: false,
  notifications: true,
  selectedTopics: ['tech', 'ai', 'design'],
  readArticleIds: new Set<string>(),
  articleClaps: {},
  isOffline: false,
  isHydrated: false,

  hydrate: async () => {
    if (typeof window === 'undefined') {
      set({ isHydrated: true });
      return;
    }

    try {
      const [settingsRaw, historyRaw, clapsRaw] = await Promise.all([
        AsyncStorage.getItem(SETTINGS_STORAGE_KEY),
        AsyncStorage.getItem(HISTORY_STORAGE_KEY),
        AsyncStorage.getItem(CLAPS_STORAGE_KEY),
      ]);

      let theme: ThemePreference = 'system';
      let cardLayout: CardLayoutMode = 'compact';
      let dataSaver = false;
      let notifications = true;
      let selectedTopics: TopicCategory[] = ['tech', 'ai', 'design'];

      if (settingsRaw) {
        const parsed = JSON.parse(settingsRaw);
        if (parsed.theme) theme = parsed.theme;
        if (parsed.cardLayout) cardLayout = parsed.cardLayout;
        if (typeof parsed.dataSaver === 'boolean') dataSaver = parsed.dataSaver;
        if (typeof parsed.notifications === 'boolean') notifications = parsed.notifications;
        if (Array.isArray(parsed.selectedTopics)) selectedTopics = parsed.selectedTopics;
      }

      let readArticleIds = new Set<string>();
      if (historyRaw) {
        const parsedIds = JSON.parse(historyRaw);
        if (Array.isArray(parsedIds)) {
          readArticleIds = new Set(parsedIds);
        }
      }

      let articleClaps: Record<string, number> = {};
      if (clapsRaw) {
        articleClaps = JSON.parse(clapsRaw);
      }

      set({
        theme,
        cardLayout,
        dataSaver,
        notifications,
        selectedTopics,
        readArticleIds,
        articleClaps,
        isHydrated: true,
      });
    } catch (e) {
      console.warn('Failed to hydrate settings store:', e);
      set({ isHydrated: true });
    }
  },

  setTheme: async (theme) => {
    set({ theme });
    try {
      const current = get();
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          theme,
          cardLayout: current.cardLayout,
          dataSaver: current.dataSaver,
          notifications: current.notifications,
          selectedTopics: current.selectedTopics,
        })
      );
    } catch (e) {
      console.warn('Failed to save theme setting:', e);
    }
  },

  setCardLayout: async (cardLayout) => {
    set({ cardLayout });
    try {
      const current = get();
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          theme: current.theme,
          cardLayout,
          dataSaver: current.dataSaver,
          notifications: current.notifications,
          selectedTopics: current.selectedTopics,
        })
      );
    } catch (e) {
      console.warn('Failed to save card layout setting:', e);
    }
  },

  setDataSaver: async (dataSaver) => {
    set({ dataSaver });
    try {
      const current = get();
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          theme: current.theme,
          cardLayout: current.cardLayout,
          dataSaver,
          notifications: current.notifications,
          selectedTopics: current.selectedTopics,
        })
      );
    } catch (e) {
      console.warn('Failed to save data saver setting:', e);
    }
  },

  setNotifications: async (notifications) => {
    set({ notifications });
    try {
      const current = get();
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          theme: current.theme,
          cardLayout: current.cardLayout,
          dataSaver: current.dataSaver,
          notifications,
          selectedTopics: current.selectedTopics,
        })
      );
    } catch (e) {
      console.warn('Failed to save notifications setting:', e);
    }
  },

  setSelectedTopics: async (selectedTopics) => {
    set({ selectedTopics });
    try {
      const current = get();
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({
          theme: current.theme,
          cardLayout: current.cardLayout,
          dataSaver: current.dataSaver,
          notifications: current.notifications,
          selectedTopics,
        })
      );
    } catch (e) {
      console.warn('Failed to save topics setting:', e);
    }
  },

  markArticleAsRead: async (articleId) => {
    const { readArticleIds } = get();
    if (readArticleIds.has(articleId)) return;

    const nextSet = new Set(readArticleIds);
    nextSet.add(articleId);
    set({ readArticleIds: nextSet });

    try {
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(Array.from(nextSet)));
    } catch (e) {
      console.warn('Failed to save read history:', e);
    }
  },

  incrementClap: async (articleId) => {
    const { articleClaps } = get();
    const currentClaps = articleClaps[articleId] || 0;
    const nextClaps = currentClaps + 1;
    const updated = { ...articleClaps, [articleId]: nextClaps };
    set({ articleClaps: updated });

    try {
      await AsyncStorage.setItem(CLAPS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save claps:', e);
    }
    return nextClaps;
  },

  setIsOffline: (isOffline) => {
    set({ isOffline });
  },

  clearCache: async () => {
    try {
      // Clear SWR cache keys and telemetry outbox
      await AsyncStorage.removeItem('@pulsefeed_swr_feed_cache_v1');
      await AsyncStorage.removeItem('@pulsefeed_telemetry_outbox_v1');
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  },
}));
