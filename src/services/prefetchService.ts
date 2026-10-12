import { Image } from 'expo-image';
import { Article, PrefetchStats } from '../types';

type PrefetchListener = (stats: PrefetchStats) => void;

class PrefetchService {
  private prefetchedUrls: Set<string> = new Set();
  private maxCachedUrls = 80;
  private totalPrefetched = 0;
  private lastPrefetchedUrl: string | null = null;
  private listeners: Set<PrefetchListener> = new Set();

  private lastScrollY = 0;
  private lastScrollTime = 0;

  public subscribe(listener: PrefetchListener): () => void {
    this.listeners.add(listener);
    listener(this.getStats());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const stats = this.getStats();
    this.listeners.forEach((l) => l(stats));
  }

  public getStats(): PrefetchStats {
    return {
      totalPrefetchedCount: this.totalPrefetched,
      currentlyQueuedCount: this.prefetchedUrls.size,
      lastPrefetchedUrl: this.lastPrefetchedUrl,
    };
  }

  /**
   * Called during FlashList onScroll to profile scroll velocity and pre-decode upcoming cells
   */
  public onScroll(
    currentY: number,
    articles: Article[],
    visibleItemCount: number = 3
  ) {
    const now = Date.now();
    if (this.lastScrollTime === 0) {
      this.lastScrollY = currentY;
      this.lastScrollTime = now;
      return;
    }

    const deltaY = currentY - this.lastScrollY;
    const deltaTime = Math.max(1, now - this.lastScrollTime);
    const velocity = deltaY / deltaTime; // px per millisecond

    this.lastScrollY = currentY;
    this.lastScrollTime = now;

    // Trigger lookahead if user is actively scrolling downward (velocity > 0.8 px/ms)
    if (velocity > 0.8 && articles.length > 0) {
      // Estimate current top index (average card height ~ 360px)
      const estimatedTopIndex = Math.max(0, Math.floor(currentY / 360));
      // Lookahead window: 4 to 8 items ahead of current viewport
      const lookaheadStart = estimatedTopIndex + visibleItemCount;
      const lookaheadEnd = Math.min(articles.length, lookaheadStart + 5);

      for (let i = lookaheadStart; i < lookaheadEnd; i++) {
        const art = articles[i];
        if (art && art.imageUrl && !this.prefetchedUrls.has(art.imageUrl)) {
          this.prefetchImage(art.imageUrl);
        }
      }
    }
  }

  public async prefetchImage(url: string) {
    if (!url || this.prefetchedUrls.has(url)) return;

    try {
      this.prefetchedUrls.add(url);
      if (this.prefetchedUrls.size > this.maxCachedUrls) {
        // Evict oldest entries to prevent unbounded RAM growth
        const first = this.prefetchedUrls.values().next().value;
        if (first) this.prefetchedUrls.delete(first);
      }

      this.lastPrefetchedUrl = url;
      this.totalPrefetched += 1;
      this.notify();

      // Trigger expo-image low-priority background disk & RAM decode
      await Image.prefetch(url);
    } catch (e) {
      // Silently handle transient prefetch network errors
    }
  }

  public clearPrefetchCache() {
    this.prefetchedUrls.clear();
    this.totalPrefetched = 0;
    this.lastPrefetchedUrl = null;
    this.notify();
  }
}

export const prefetchService = new PrefetchService();
