import { ImpressionRecord, TelemetryMetrics, TopicCategory } from '../types';
import { telemetryOutboxService } from './telemetryOutboxService';
import { recommendationEngine } from './recommendationEngine';

type TelemetryListener = (metrics: TelemetryMetrics) => void;

class TelemetryService {
  private activeImpressions: Map<string, { startTime: number; title: string; category: TopicCategory }> = new Map();
  private records: ImpressionRecord[] = [];
  private qualifiedCount: number = 0;
  private listeners: Set<TelemetryListener> = new Set();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private currentPrimaryId: string | null = null;

  constructor() {
    this.startHeartbeat();
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    listener(this.getMetrics());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notifyListeners() {
    const metrics = this.getMetrics();
    this.listeners.forEach((listener) => listener(metrics));
  }

  public getMetrics(): TelemetryMetrics {
    let currentDwellMs = 0;
    if (this.currentPrimaryId && this.activeImpressions.has(this.currentPrimaryId)) {
      const active = this.activeImpressions.get(this.currentPrimaryId)!;
      currentDwellMs = Date.now() - active.startTime;
    }

    return {
      totalImpressionsCount: this.records.length,
      qualifiedImpressionsCount: this.qualifiedCount,
      currentActiveId: this.currentPrimaryId,
      currentDwellMs,
      recentRecords: [...this.records].slice(0, 10),
    };
  }

  /**
   * Called when FlashList onViewableItemsChanged fires
   * visibleItems: array of { id, title, category } currently >= 50% in viewport
   */
  public updateVisibleItems(
    visibleItems: { id: string; title: string; category: TopicCategory }[]
  ) {
    const now = Date.now();
    const newVisibleIds = new Set(visibleItems.map((item) => item.id));

    // Handle exited items
    this.activeImpressions.forEach((data, id) => {
      if (!newVisibleIds.has(id)) {
        const dwellMs = now - data.startTime;
        const isQualified = dwellMs >= 1000; // >= 1 second dwell counts as qualified impression

        if (isQualified) {
          this.qualifiedCount += 1;
          // Feed dwell signal to on-device recommendation engine
          recommendationEngine.recordDwell(data.category, dwellMs);
        }

        const record: ImpressionRecord = {
          articleId: id,
          articleTitle: data.title,
          category: data.category,
          startTime: data.startTime,
          endTime: now,
          dwellMs,
          isQualified,
        };

        this.records.unshift(record);
        if (this.records.length > 50) {
          this.records.pop();
        }

        // Forward to cellular-optimized outbox dispatcher
        telemetryOutboxService.enqueueEvent(record);

        this.activeImpressions.delete(id);
      }
    });

    // Handle new visible items
    visibleItems.forEach((item) => {
      if (!this.activeImpressions.has(item.id)) {
        this.activeImpressions.set(item.id, {
          startTime: now,
          title: item.title,
          category: item.category,
        });
      }
    });

    // Primary active item is the first fully visible one
    this.currentPrimaryId = visibleItems.length > 0 ? visibleItems[0].id : null;
    this.notifyListeners();
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) return;
    // Tick every 250ms to update live dwell time in HUD
    this.heartbeatInterval = setInterval(() => {
      if (this.currentPrimaryId && this.activeImpressions.has(this.currentPrimaryId)) {
        this.notifyListeners();
      }
    }, 250);
  }

  public clearTelemetry() {
    this.activeImpressions.clear();
    this.records = [];
    this.qualifiedCount = 0;
    this.currentPrimaryId = null;
    this.notifyListeners();
  }
}

export const telemetryService = new TelemetryService();
