export type TopicCategory =
  | 'all'
  | 'tech'
  | 'ai'
  | 'design'
  | 'finance'
  | 'startups';

export interface Author {
  name: string;
  avatarUrl: string;
  role?: string;
}

export interface ArticleSource {
  name: string;
  domain: string;
  favicon?: string;
  isLiveFeed?: boolean;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: TopicCategory;
  author: Author;
  source: ArticleSource;
  publishedAt: string;
  readTimeMinutes: number;
  imageUrl: string;
  url: string;
  tags: string[];
  viewsCount: number;
  likesCount: number;
  isTrending?: boolean;
  isHero?: boolean;
  edgeScore?: number;
  recommendationReason?: string;
}

export interface ImpressionRecord {
  articleId: string;
  articleTitle: string;
  category: TopicCategory;
  startTime: number;
  endTime?: number;
  dwellMs: number;
  isQualified: boolean; // true if visible >= 1000ms
}

export interface TelemetryMetrics {
  totalImpressionsCount: number;
  qualifiedImpressionsCount: number;
  currentActiveId: string | null;
  currentDwellMs: number;
  recentRecords: ImpressionRecord[];
}

export interface BookmarkRecord {
  article: Article;
  savedAt: number;
  isRead: boolean;
}

export interface BeaconPayload {
  batchId: string;
  clientTimestamp: number;
  eventsCount: number;
  events: ImpressionRecord[];
  devicePlatform: string;
}

export interface OutboxMetrics {
  queueLength: number;
  totalDispatchedBatches: number;
  totalDispatchedEvents: number;
  lastFlushTimestamp: number | null;
  isFlushing: boolean;
  failedAttempts: number;
  networkOnline: boolean;
  estimatedBytesSaved: number;
  recentBatches: BeaconPayload[];
}

export interface UserAffinityVector {
  tech: number;
  ai: number;
  design: number;
  finance: number;
  startups: number;
}

export interface PrefetchStats {
  totalPrefetchedCount: number;
  currentlyQueuedCount: number;
  lastPrefetchedUrl: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  isGuest?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
