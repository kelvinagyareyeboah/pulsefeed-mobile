import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article, TopicCategory } from '../types';

const LIVE_CACHE_KEY = '@pulsefeed_live_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 mins SWR TTL

const CATEGORY_FALLBACK_IMAGES: Record<TopicCategory, string> = {
  ai: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
  tech: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
  design: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  startups: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
  finance: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
  all: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
};

export class LiveFeedService {
  private static cachedLiveArticles: Article[] = [];
  private static lastFetchTime: number = 0;

  /**
   * Stale-While-Revalidate Live Fetch
   */
  public static async getLiveOrCachedArticles(): Promise<{
    articles: Article[];
    isLive: boolean;
  }> {
    // Check in-memory cache
    const now = Date.now();
    if (this.cachedLiveArticles.length > 0 && now - this.lastFetchTime < CACHE_TTL_MS) {
      return { articles: this.cachedLiveArticles, isLive: true };
    }

    // Try fetching fresh from public live endpoints
    try {
      const liveArticles = await this.fetchFromLivePipelines();
      if (liveArticles.length > 0) {
        this.cachedLiveArticles = liveArticles;
        this.lastFetchTime = now;
        // Persist to disk for instant offline boot
        AsyncStorage.setItem(LIVE_CACHE_KEY, JSON.stringify({
          timestamp: now,
          articles: liveArticles,
        })).catch(() => {});
        return { articles: liveArticles, isLive: true };
      }
    } catch (e) {
      console.warn('Live ingestion pipeline failed, falling back to disk cache:', e);
    }

    // Try disk cache
    try {
      const stored = await AsyncStorage.getItem(LIVE_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.articles && parsed.articles.length > 0) {
          this.cachedLiveArticles = parsed.articles;
          return { articles: parsed.articles, isLive: false };
        }
      }
    } catch (e) {
      console.warn('Disk cache read error:', e);
    }

    return { articles: [], isLive: false };
  }

  /**
   * Fetches and normalizes stories from Hacker News and Dev.to in parallel
   */
  private static async fetchFromLivePipelines(): Promise<Article[]> {
    const results: Article[] = [];

    const [hnResponse, devtoResponse] = await Promise.allSettled([
      fetch('https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=10'),
      fetch('https://dev.to/api/articles?per_page=12&top=7'),
    ]);

    // 1. Process Dev.to Feed
    if (devtoResponse.status === 'fulfilled' && devtoResponse.value.ok) {
      try {
        const devtoData = await devtoResponse.value.json();
        if (Array.isArray(devtoData)) {
          devtoData.forEach((item: any) => {
            const category = this.detectCategory(item.title, item.tag_list || []);
            const article: Article = {
              id: `devto_${item.id}`,
              title: item.title,
              summary: item.description || `Read the full publication on Dev.to by ${item.user?.name}.`,
              content: item.description || item.title,
              category,
              author: {
                name: item.user?.name || 'Dev.to Contributor',
                avatarUrl:
                  item.user?.profile_image_90 ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                role: 'Tech Author',
              },
              source: {
                name: 'Dev Community',
                domain: 'dev.to',
                isLiveFeed: true,
              },
              publishedAt: item.published_at || new Date().toISOString(),
              readTimeMinutes: item.reading_time_minutes || 4,
              imageUrl:
                item.cover_image ||
                item.social_image ||
                CATEGORY_FALLBACK_IMAGES[category],
              url: item.url,
              tags: Array.isArray(item.tag_list) ? item.tag_list.slice(0, 4) : ['Engineering'],
              viewsCount: Math.floor(Math.random() * 2000) + 1200,
              likesCount: item.positive_reactions_count || Math.floor(Math.random() * 80) + 10,
              isTrending: (item.positive_reactions_count || 0) > 30,
            };
            results.push(article);
          });
        }
      } catch (err) {
        console.warn('Dev.to normalization error:', err);
      }
    }

    // 2. Process Hacker News Feed
    if (hnResponse.status === 'fulfilled' && hnResponse.value.ok) {
      try {
        const hnData = await hnResponse.value.json();
        if (hnData.hits && Array.isArray(hnData.hits)) {
          hnData.hits.forEach((item: any) => {
            if (!item.title) return;
            const category = this.detectCategory(item.title, []);
            const domain = item.url ? new URL(item.url).hostname : 'news.ycombinator.com';

            const article: Article = {
              id: `hn_${item.objectID}`,
              title: item.title,
              summary: `Trending on Hacker News with ${item.points || 0} points and ${item.num_comments || 0} comments.`,
              content: `Original story published via ${domain}. Click below to read directly from the publisher.`,
              category,
              author: {
                name: item.author || 'HN Contributor',
                avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                role: 'Hacker News Community',
              },
              source: {
                name: domain.replace('www.', ''),
                domain,
                isLiveFeed: true,
              },
              publishedAt: item.created_at || new Date().toISOString(),
              readTimeMinutes: Math.max(3, Math.min(10, Math.floor((item.points || 50) / 40) + 3)),
              imageUrl: CATEGORY_FALLBACK_IMAGES[category],
              url: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
              tags: ['Hacker News', category.toUpperCase(), 'Live Signal'],
              viewsCount: (item.points || 20) * 18,
              likesCount: item.points || 15,
              isTrending: (item.points || 0) > 80,
            };
            results.push(article);
          });
        }
      } catch (err) {
        console.warn('Hacker News normalization error:', err);
      }
    }

    return results;
  }

  private static detectCategory(title: string, tags: string[]): TopicCategory {
    const text = `${title} ${tags.join(' ')}`.toLowerCase();
    if (text.includes('ai') || text.includes('llm') || text.includes('gpt') || text.includes('model') || text.includes('neural')) {
      return 'ai';
    }
    if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('css') || text.includes('figma')) {
      return 'design';
    }
    if (text.includes('startup') || text.includes('venture') || text.includes('founder') || text.includes('saas') || text.includes('y combinator')) {
      return 'startups';
    }
    if (text.includes('finance') || text.includes('crypto') || text.includes('market') || text.includes('bitcoin') || text.includes('stock')) {
      return 'finance';
    }
    return 'tech';
  }
}
