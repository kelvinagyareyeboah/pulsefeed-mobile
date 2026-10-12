import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImpressionRecord, BeaconPayload, OutboxMetrics } from '../types';

const STORAGE_QUEUE_KEY = '@pulsefeed_outbox_queue_v1';
const BATCH_THRESHOLD = 6;
const HEARTBEAT_FLUSH_INTERVAL_MS = 12000;

type OutboxListener = (metrics: OutboxMetrics) => void;

class TelemetryOutboxService {
  private queue: ImpressionRecord[] = [];
  private isFlushing = false;
  private totalDispatchedBatches = 0;
  private totalDispatchedEvents = 0;
  private lastFlushTimestamp: number | null = null;
  private failedAttempts = 0;
  private networkOnline = true; // can be toggled in HUD for chaos testing
  private recentBatches: BeaconPayload[] = [];
  private listeners: Set<OutboxListener> = new Set();
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isHydrated = false;

  constructor() {
    this.hydrateQueue();
    this.startHeartbeat();
    this.registerAppStateListener();
  }

  private async hydrateQueue() {
    try {
      const persisted = await AsyncStorage.getItem(STORAGE_QUEUE_KEY);
      if (persisted) {
        const parsed: ImpressionRecord[] = JSON.parse(persisted);
        this.queue = [...parsed, ...this.queue];
      }
    } catch (e) {
      console.warn('Failed to hydrate telemetry outbox queue:', e);
    } finally {
      this.isHydrated = true;
      this.notify();
    }
  }

  private async persistQueue() {
    try {
      await AsyncStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.warn('Failed to persist telemetry outbox queue:', e);
    }
  }

  public subscribe(listener: OutboxListener): () => void {
    this.listeners.add(listener);
    listener(this.getMetrics());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify() {
    const metrics = this.getMetrics();
    this.listeners.forEach((l) => l(metrics));
  }

  public getMetrics(): OutboxMetrics {
    // Each individual HTTP request has ~850 bytes of TCP/TLS/HTTP header overhead.
    // Batching N events into 1 request saves roughly (N - 1) * 750 bytes of radio power & headers.
    const overheadSaved = Math.max(0, (this.totalDispatchedEvents - this.totalDispatchedBatches) * 750);

    return {
      queueLength: this.queue.length,
      totalDispatchedBatches: this.totalDispatchedBatches,
      totalDispatchedEvents: this.totalDispatchedEvents,
      lastFlushTimestamp: this.lastFlushTimestamp,
      isFlushing: this.isFlushing,
      failedAttempts: this.failedAttempts,
      networkOnline: this.networkOnline,
      estimatedBytesSaved: overheadSaved,
      recentBatches: [...this.recentBatches],
    };
  }

  public enqueueEvent(record: ImpressionRecord) {
    this.queue.push(record);
    this.persistQueue();
    this.notify();

    if (this.queue.length >= BATCH_THRESHOLD) {
      this.flushQueue('threshold_reached');
    }
  }

  public enqueueMultiple(records: ImpressionRecord[]) {
    this.queue.push(...records);
    this.persistQueue();
    this.notify();

    if (this.queue.length >= BATCH_THRESHOLD) {
      this.flushQueue('threshold_reached');
    }
  }

  public async flushQueue(reason: string = 'manual'): Promise<boolean> {
    if (this.isFlushing || this.queue.length === 0) return false;

    if (!this.networkOnline) {
      this.failedAttempts += 1;
      this.notify();
      return false;
    }

    this.isFlushing = true;
    this.notify();

    // Pull events to batch (up to 20 per batch)
    const batchSize = Math.min(this.queue.length, 20);
    const eventsToDispatch = this.queue.slice(0, batchSize);

    const payload: BeaconPayload = {
      batchId: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      clientTimestamp: Date.now(),
      eventsCount: eventsToDispatch.length,
      events: eventsToDispatch,
      devicePlatform: Platform.OS,
    };

    try {
      // Simulate real-world edge telemetry ingestion network roundtrip (250ms with jitter)
      const jitter = Math.floor(Math.random() * 80);
      await new Promise((resolve) => setTimeout(resolve, 200 + jitter));

      // Successfully processed by edge analytics pipeline
      this.queue.splice(0, batchSize);
      await this.persistQueue();

      this.totalDispatchedBatches += 1;
      this.totalDispatchedEvents += eventsToDispatch.length;
      this.lastFlushTimestamp = Date.now();
      this.failedAttempts = 0;

      this.recentBatches.unshift(payload);
      if (this.recentBatches.length > 10) {
        this.recentBatches.pop();
      }

      this.isFlushing = false;
      this.notify();

      // If more remains in queue, flush next chunk with small backoff
      if (this.queue.length >= BATCH_THRESHOLD) {
        setTimeout(() => this.flushQueue('drain_remaining'), 500);
      }

      return true;
    } catch (err) {
      this.failedAttempts += 1;
      this.isFlushing = false;
      this.notify();
      return false;
    }
  }

  private startHeartbeat() {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flushQueue('heartbeat_interval');
      }
    }, HEARTBEAT_FLUSH_INTERVAL_MS);
  }

  private registerAppStateListener() {
    AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        // App is suspending: flush immediately before sleep
        this.flushQueue('app_suspending');
      }
    });
  }

  public setNetworkOnline(online: boolean) {
    this.networkOnline = online;
    this.notify();
    if (online && this.queue.length > 0) {
      this.flushQueue('reconnected');
    }
  }

  public clearQueue() {
    this.queue = [];
    this.persistQueue();
    this.notify();
  }
}

export const telemetryOutboxService = new TelemetryOutboxService();
