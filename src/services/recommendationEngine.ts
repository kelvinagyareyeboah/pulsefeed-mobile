import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article, TopicCategory, UserAffinityVector } from '../types';

const AFFINITY_STORAGE_KEY = '@pulsefeed_user_affinity_v1';

type RecommendationListener = (vector: UserAffinityVector) => void;

class RecommendationEngine {
  private affinity: UserAffinityVector = {
    tech: 2.0,
    ai: 2.0,
    design: 1.0,
    finance: 1.0,
    startups: 1.0,
  };
  private listeners: Set<RecommendationListener> = new Set();
  private isHydrated = false;

  constructor() {
    this.hydrate();
  }

  private async hydrate() {
    try {
      const stored = await AsyncStorage.getItem(AFFINITY_STORAGE_KEY);
      if (stored) {
        this.affinity = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load user affinity vector:', e);
    } finally {
      this.isHydrated = true;
      this.notify();
    }
  }

  private async persist() {
    try {
      await AsyncStorage.setItem(AFFINITY_STORAGE_KEY, JSON.stringify(this.affinity));
    } catch (e) {
      console.warn('Failed to persist user affinity vector:', e);
    }
  }

  public subscribe(listener: RecommendationListener): () => void {
    this.listeners.add(listener);
    listener(this.getAffinity());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const current = this.getAffinity();
    this.listeners.forEach((l) => l(current));
  }

  public getAffinity(): UserAffinityVector {
    return { ...this.affinity };
  }

  public recordDwell(category: TopicCategory, dwellMs: number) {
    if (category === 'all') return;
    // Dwell >= 1000ms adds affinity. Max boost capped at 3.0 per session
    const boost = Math.min(3.0, (dwellMs / 1000) * 0.75);
    this.affinity[category] = Number((this.affinity[category] + boost).toFixed(2));
    this.persist();
    this.notify();
  }

  public recordLike(category: TopicCategory) {
    if (category === 'all') return;
    this.affinity[category] = Number((this.affinity[category] + 3.0).toFixed(2));
    this.persist();
    this.notify();
  }

  public recordBookmark(category: TopicCategory) {
    if (category === 'all') return;
    this.affinity[category] = Number((this.affinity[category] + 4.5).toFixed(2));
    this.persist();
    this.notify();
  }

  /**
   * On-device Edge Re-Ranking Model
   * Score = 0.40 * Affinity + 0.35 * Recency + 0.25 * Popularity
   */
  public reRankArticles(articles: Article[]): Article[] {
    const totalAffinity =
      Object.values(this.affinity).reduce((sum, val) => sum + val, 0) || 1;

    // Find highest affinity category for explainability
    let highestCat: TopicCategory = 'ai';
    let highestWeight = 0;
    (Object.keys(this.affinity) as (keyof UserAffinityVector)[]).forEach((cat) => {
      if (this.affinity[cat] > highestWeight) {
        highestWeight = this.affinity[cat];
        highestCat = cat;
      }
    });

    const scored = articles.map((article) => {
      const artCat = article.category as keyof UserAffinityVector;
      const catWeight = this.affinity[artCat] || 1.0;
      const normalizedAffinity = Math.min(1.0, catWeight / (totalAffinity * 0.4));

      // Recency decay (articles < 2 hours get ~1.0, decays linearly over 48h)
      const hoursAgo = Math.max(0, (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60));
      const recencyScore = Math.max(0.1, 1 - Math.min(1, hoursAgo / 36));

      // Popularity score
      const popScore = Math.min(1.0, (article.likesCount * 3 + article.viewsCount * 0.05) / 2000);

      const finalScore = Number(
        (0.40 * normalizedAffinity + 0.35 * recencyScore + 0.25 * popScore).toFixed(3)
      );

      const matchPercent = Math.min(99, Math.max(68, Math.round(finalScore * 100)));

      let recommendationReason = `${matchPercent}% Match`;
      if (article.category === highestCat && highestWeight > 3) {
        recommendationReason = `${matchPercent}% Match • Category: #${highestCat.toUpperCase()}`;
      } else if (article.isTrending) {
        recommendationReason = `${matchPercent}% Match • Trending`;
      }

      return {
        ...article,
        edgeScore: finalScore,
        recommendationReason,
      };
    });

    // Sort descending by edgeScore
    return scored.sort((a, b) => (b.edgeScore || 0) - (a.edgeScore || 0));
  }

  public resetAffinity() {
    this.affinity = {
      tech: 2.0,
      ai: 2.0,
      design: 1.0,
      finance: 1.0,
      startups: 1.0,
    };
    this.persist();
    this.notify();
  }
}

export const recommendationEngine = new RecommendationEngine();
