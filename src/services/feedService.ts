import { Article, TopicCategory } from '../types';

export const TOPIC_CATEGORIES: { id: TopicCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'For You', icon: 'bolt' },
  { id: 'ai', label: 'Artificial Intelligence', icon: 'microchip' },
  { id: 'tech', label: 'Engineering', icon: 'code' },
  { id: 'design', label: 'Design & UI', icon: 'paint-brush' },
  { id: 'startups', label: 'Startups & VC', icon: 'rocket' },
  { id: 'finance', label: 'Markets & Crypto', icon: 'line-chart' },
];

export const CURATED_ARTICLES: Article[] = [
  {
    id: 'art_1',
    title: 'Designing for 120 FPS: The Architecture Behind Ultra-Fluid Mobile Feeds',
    summary:
      'How modern mobile engines leverage cell recycling, asynchronous image decoding, and off-thread layout calculations to guarantee zero frame drops.',
    content: `When building high-throughput mobile feeds, frame drops are the ultimate killer of user retention. A standard 60 Hz display gives you 16.6 milliseconds to calculate layouts, decode image buffers, and render elements. On modern 120 Hz ProMotion displays, that budget collapses to a brutal 8.3 milliseconds.

To achieve continuous fluidity without stuttering, engineers must abandon monolithic view hierarchies. In this deep dive, we explore how cell recycling architectures like FlashList recycle native host views without destroying and recreating backing view trees.

Key pillars of fluid feeds:
1. View recycling and bounded heap allocation.
2. Aspect ratio pre-reservation to eliminate cumulative layout shifts (CLS).
3. Asynchronous off-main-thread image decoding and GPU memory pooling.
4. Intelligent viewport virtualization and predictive prefetching.

By separating the scroll telemetry loop from layout measurement, you can guarantee a buttery-smooth 120 FPS experience across budget and flagship devices alike.`,
    category: 'tech',
    author: {
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Staff Mobile Architect',
    },
    source: {
      name: 'Mobile Systems Engineering',
      domain: 'mobilesystems.dev',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(), // 24 mins ago
    readTimeMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    url: 'https://github.com/shopify/flash-list',
    tags: ['React Native', 'Mobile Perf', 'Architecture', 'FlashList'],
    viewsCount: 4820,
    likesCount: 394,
    isTrending: true,
    isHero: true,
  },
  {
    id: 'art_2',
    title: 'The Shift to Local First: Why Modern Apps are Ditching Cloud-Only State',
    summary:
      'Users expect instant responsiveness regardless of network latency or elevator dead-zones. The rise of local SQLite, CRDTs, and outbox synchronization.',
    content: `For a decade, the standard mobile application pattern was simple: user taps a button, client sends a REST request to the cloud, user stares at a spinner, and if the network drops, an error toast appears.

In 2026, this paradigm is obsolete. Users demand software that feels as instantaneous as local native desktop applications, whether they are on high-speed fiber or stuck in an underground subway tunnel.

Local-first software treats the device's embedded database (such as SQLite or MMKV) as the primary source of truth. Writes complete in sub-millisecond time directly to disk, optimistic UI renders instantaneously, and a resilient background outbox engine drains mutations with exponential backoff.`,
    category: 'tech',
    author: {
      name: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      role: 'Distributed Systems Lead',
    },
    source: {
      name: 'Distributed Weekly',
      domain: 'distributedweekly.com',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 58).toISOString(), // 58 mins ago
    readTimeMinutes: 4,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    url: 'https://localfirstweb.dev',
    tags: ['Offline-First', 'SQLite', 'Databases', 'Sync'],
    viewsCount: 3120,
    likesCount: 288,
    isTrending: true,
  },
  {
    id: 'art_3',
    title: 'Small Language Models (SLMs) on the Edge: Intelligence Without the Cloud',
    summary:
      'With neural engines advancing at breakneck speeds, on-device SLMs are delivering zero-latency text classification, semantic search, and summary feeds.',
    content: `While trillion-parameter models dominate headlines, the real mobile revolution is happening at the sub-3-billion parameter tier. Running quantized 4-bit models directly on device silicon delivers several game-changing advantages:

1. Zero API latency and offline capability.
2. Complete privacy: user data never leaves the handset.
3. Zero recurring cloud inference bills.

Mobile feeds equipped with on-device SLMs can instantly rank incoming articles, extract key takeaways, and compute embedding vectors on the fly without making a single external network request.`,
    category: 'ai',
    author: {
      name: 'David Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Edge AI Researcher',
    },
    source: {
      name: 'Edge AI Journal',
      domain: 'edgeai.internal',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hrs ago
    readTimeMinutes: 6,
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    url: 'https://huggingface.co',
    tags: ['AI', 'Edge Computing', 'SLM', 'Machine Learning'],
    viewsCount: 6510,
    likesCount: 520,
    isTrending: true,
  },
  {
    id: 'art_4',
    title: 'Spatial UI and the Death of Flat Design: The Tactile Glassmorphism Playbook',
    summary:
      'How subtle depth hierarchies, real-time blur shaders, and dynamic ambient lighting are redefining premium mobile aesthetics.',
    content: `Flat design has reached its saturation point. Clean, sterile 2D cards all look identical across every modern app. The vanguard of interface design is embracing tactile spatial hierarchies: interfaces that feel tangible, refractive, and responsive to user touch.

By using multi-layered specular highlights, sub-pixel borders, and physics-based spring curves, buttons don't just register clicks — they react with inertia and tactile weight.

Key design elements:
- Frosted glassmorphism with high contrast legibility.
- Contextual ambient glow matching content color spectrums.
- Haptic micro-feedback synchronized with state transitions.`,
    category: 'design',
    author: {
      name: 'Maya Lin',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      role: 'Principal Designer',
    },
    source: {
      name: 'Aesthetic Interfaces',
      domain: 'aestheticui.org',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hrs ago
    readTimeMinutes: 3,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    url: 'https://dribbble.com',
    tags: ['UI/UX', 'Spatial Design', 'Design Systems', 'Mobile'],
    viewsCount: 2840,
    likesCount: 310,
  },
  {
    id: 'art_5',
    title: 'The Post-ZIRP Startup Survival Guide: Unit Economics Over Vanity Growth',
    summary:
      'The era of blitzscaling unprofitable customer acquisition is over. How founders are reaching $10M ARR with teams of under ten engineers.',
    content: `The rules of technology venture capital have fundamentally shifted. In the zero-interest rate era, growth at any cost was rewarded. Today, capital efficiency, net dollar retention, and gross margins are the only metrics that matter.

Companies leveraging automated CI/CD pipelines, autonomous agent workflows, and serverless edge databases are achieving extraordinary revenue-per-employee ratios previously thought impossible.

Case studies from three seed-stage startups demonstrating how lean engineering teams scale to millions in ARR without large enterprise sales forces.`,
    category: 'startups',
    author: {
      name: 'Marcus Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Venture Partner',
    },
    source: {
      name: 'Founder Dispatch',
      domain: 'founderdispatch.io',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(), // 7 hrs ago
    readTimeMinutes: 7,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    url: 'https://ycombinator.com',
    tags: ['Venture Capital', 'Startups', 'Bootstrapping', 'Growth'],
    viewsCount: 4210,
    likesCount: 295,
  },
  {
    id: 'art_6',
    title: 'Algorithmic Liquidity & Autonomous Market Makers in Modern DeFi',
    summary:
      'Examining concentrated liquidity curves, just-in-time liquidity injection, and the mathematics governing on-chain trading protocols.',
    content: `Decentralized exchange mechanics have evolved dramatically beyond constant-product automated market makers (x * y = k). Modern protocols utilize concentrated liquidity ranges, allowing capital providers to allocate funds within precise price intervals.

This structural evolution yields up to 4000x capital efficiency compared to legacy models, but introduces complex impermanent loss risk surfaces.

We break down the mathematical formulations behind concentrated liquidity tick spaces and how automated arbitrage bots maintain market parity across decentralized and centralized order books.`,
    category: 'finance',
    author: {
      name: 'Julian Thorne',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      role: 'Quantitative Strategist',
    },
    source: {
      name: 'DeFi Quantitative Research',
      domain: 'quantdefi.tech',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hrs ago
    readTimeMinutes: 8,
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    url: 'https://uniswap.org',
    tags: ['Crypto', 'DeFi', 'Quantitative', 'Finance'],
    viewsCount: 1980,
    likesCount: 142,
  },
  {
    id: 'art_7',
    title: 'Autonomous Coding Agents: The Next Evolution in Pair Programming',
    summary:
      'From simple autocomplete to goal-driven agentic loops: how multi-modal assistants are reasoning, compiling, and testing code autonomously.',
    content: `Software development is undergoing its most profound transformation since the invention of high-level programming languages. The transition from inline code completion to autonomous agentic loops marks a paradigm shift in how software is authored.

Modern coding agents do not simply generate code snippets — they analyze entire ASTs, run automated test suites, parse compiler error traces, and iteratively converge on verified solutions.

This article reviews the architecture of stateful agents, sandbox isolation environments, and the emerging role of human-in-the-loop review.`,
    category: 'ai',
    author: {
      name: 'Sofia Valenti',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'AI Systems Architect',
    },
    source: {
      name: 'Deep Tech Review',
      domain: 'deeptechreview.ai',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    readTimeMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    url: 'https://deepmind.google',
    tags: ['AI', 'Agentic Coding', 'LLM', 'DevTools'],
    viewsCount: 5490,
    likesCount: 618,
    isTrending: true,
  },
  {
    id: 'art_8',
    title: 'The React Native New Architecture in Practice: TurboModules and Fabric',
    summary:
      'A practical evaluation of Bridgeless mode, C++ JSI direct calls, and synchronous layout calculations in modern production apps.',
    content: `React Native's New Architecture eliminates the asynchronous JSON serialization bridge that historically created performance bottlenecks in high-frequency events.

With JSI (JavaScript Interface), JavaScript can directly hold C++ host references, allowing direct, zero-overhead calls between JS and native modules. Fabric provides synchronous thread-safe layout rendering, eliminating white flashes during rapid navigation.

Here are benchmarks and migration strategies for adopting the New Architecture in large existing codebases.`,
    category: 'tech',
    author: {
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Staff Mobile Architect',
    },
    source: {
      name: 'Mobile Systems Engineering',
      domain: 'mobilesystems.dev',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    readTimeMinutes: 6,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    url: 'https://reactnative.dev',
    tags: ['React Native', 'Fabric', 'TurboModules', 'Architecture'],
    viewsCount: 3870,
    likesCount: 345,
  },
];

import { LiveFeedService } from './liveFeedService';
import { recommendationEngine } from './recommendationEngine';

export class FeedService {
  private static cachedCombinedArticles: Article[] = [];
  private static isLivePipelineConnected: boolean = false;

  public static async fetchArticles(
    page: number = 1,
    pageSize: number = 6,
    category: TopicCategory = 'all',
    searchQuery: string = ''
  ): Promise<{ articles: Article[]; hasMore: boolean; totalCount: number; isLive: boolean }> {
    // If first page or cache empty, ingest from LiveFeedService
    if (page === 1 || this.cachedCombinedArticles.length === 0) {
      try {
        const { articles: liveArticles, isLive } = await LiveFeedService.getLiveOrCachedArticles();
        this.isLivePipelineConnected = isLive;

        // Merge live feed items with curated high-fidelity articles
        const liveIds = new Set(liveArticles.map((a) => a.id));
        const deduplicatedCurated = CURATED_ARTICLES.filter((a) => !liveIds.has(a.id));
        this.cachedCombinedArticles = [...liveArticles, ...deduplicatedCurated];
      } catch (e) {
        this.cachedCombinedArticles = CURATED_ARTICLES;
      }
    }

    let workingSet = [...this.cachedCombinedArticles];

    // Category filtering
    if (category !== 'all') {
      workingSet = workingSet.filter((a) => a.category === category);
    } else if (!searchQuery.trim()) {
      // "For You" Feed: Apply On-Device Edge Re-Ranking Model!
      workingSet = recommendationEngine.reRankArticles(workingSet);
    }

    // Search query filtering
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      workingSet = workingSet.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    const startIndex = (page - 1) * pageSize;
    const paged = workingSet.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < workingSet.length;

    return {
      articles: paged,
      hasMore,
      totalCount: workingSet.length,
      isLive: this.isLivePipelineConnected,
    };
  }

  public static getArticleById(id: string): Article | undefined {
    return (
      this.cachedCombinedArticles.find((a) => a.id === id) ||
      CURATED_ARTICLES.find((a) => a.id === id)
    );
  }

  public static getTrendingTopics(): { tag: string; count: number; category: TopicCategory }[] {
    return [
      { tag: 'FlashList', count: 1240, category: 'tech' },
      { tag: 'Edge AI', count: 2890, category: 'ai' },
      { tag: 'Spatial Design', count: 940, category: 'design' },
      { tag: 'Offline-First', count: 1820, category: 'tech' },
      { tag: 'Agentic Coding', count: 3410, category: 'ai' },
      { tag: 'DeFi Quant', count: 810, category: 'finance' },
    ];
  }
}

