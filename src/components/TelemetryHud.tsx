import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { telemetryService } from '../services/telemetryService';
import { telemetryOutboxService } from '../services/telemetryOutboxService';
import { prefetchService } from '../services/prefetchService';
import { recommendationEngine } from '../services/recommendationEngine';
import { TelemetryMetrics, OutboxMetrics, PrefetchStats, UserAffinityVector } from '../types';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type HudTab = 'telemetry' | 'outbox' | 'prefetch' | 'edge_ai';

export const TelemetryHud: React.FC = () => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const [activeTab, setActiveTab] = useState<HudTab>('telemetry');
  const [telemetry, setTelemetry] = useState<TelemetryMetrics>(telemetryService.getMetrics());
  const [outbox, setOutbox] = useState<OutboxMetrics>(telemetryOutboxService.getMetrics());
  const [prefetch, setPrefetch] = useState<PrefetchStats>(prefetchService.getStats());
  const [affinity, setAffinity] = useState<UserAffinityVector>(recommendationEngine.getAffinity());

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const unsub1 = telemetryService.subscribe(setTelemetry);
    const unsub2 = telemetryOutboxService.subscribe(setOutbox);
    const unsub3 = prefetchService.subscribe(setPrefetch);
    const unsub4 = recommendationEngine.subscribe(setAffinity);

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);

  if (isMinimized) {
    return (
      <Pressable
        onPress={() => setIsMinimized(false)}
        style={[styles.minimizedBadge, { backgroundColor: 'rgba(19, 26, 41, 0.94)' }]}>
        <FontAwesome name="tachometer" size={13} color="#38BDF8" />
        <Text style={styles.minimizedText}>
          HUD ({telemetry.qualifiedImpressionsCount}Q • {outbox.queueLength}Qd • {prefetch.totalPrefetchedCount}P)
        </Text>
      </Pressable>
    );
  }

  const dwellSeconds = (telemetry.currentDwellMs / 1000).toFixed(1);

  return (
    <>
      {/* Floating Bottom Capsule Bar */}
      <View style={[styles.hudContainer, { backgroundColor: 'rgba(19, 26, 41, 0.95)' }]}>
        <View style={styles.liveGroup}>
          <View
            style={[
              styles.pulseDot,
              { backgroundColor: outbox.networkOnline ? '#10B981' : '#EF4444' },
            ]}
          />
          <View>
            <Text style={styles.hudLabel}>FAANG SYSTEMS HUD</Text>
            <Text style={styles.activeText} numberOfLines={1}>
              {telemetry.currentActiveId
                ? `Dwell: ${dwellSeconds}s • ${outbox.networkOnline ? 'Online' : 'Offline Mode'}`
                : `Outbox: ${outbox.queueLength} queued • ${prefetch.totalPrefetchedCount} prefetched`}
            </Text>
          </View>
        </View>

        <View style={styles.statsGroup}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{telemetry.qualifiedImpressionsCount}</Text>
            <Text style={styles.statSub}>Qualified</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#38BDF8' }]}>{outbox.totalDispatchedBatches}</Text>
            <Text style={styles.statSub}>Batches</Text>
          </View>

          <Pressable
            onPress={() => setIsExpanded(true)}
            style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}>
            <FontAwesome name="sliders" size={14} color="#94A3B8" />
          </Pressable>

          <Pressable
            onPress={() => setIsMinimized(true)}
            style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}>
            <FontAwesome name="times" size={13} color="#94A3B8" />
          </Pressable>
        </View>
      </View>

      {/* Expanded Multi-Tab Systems Diagnostic Modal */}
      <Modal visible={isExpanded} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {/* Modal Top Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Mobile Systems Console</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Live telemetry, outbox queue, prefetcher, and edge AI
                </Text>
              </View>
              <Pressable onPress={() => setIsExpanded(false)} style={styles.modalCloseBtn}>
                <FontAwesome name="close" size={18} color={colors.text} />
              </Pressable>
            </View>

            {/* Navigation Tabs */}
            <View style={styles.tabBar}>
              {(['telemetry', 'outbox', 'prefetch', 'edge_ai'] as HudTab[]).map((tab) => {
                const isSelected = activeTab === tab;
                const tabTitles: Record<HudTab, string> = {
                  telemetry: 'Telemetry',
                  outbox: `Outbox (${outbox.queueLength})`,
                  prefetch: `Prefetch (${prefetch.totalPrefetchedCount})`,
                  edge_ai: 'Topic Affinity',
                };
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[
                      styles.tabBtn,
                      isSelected && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
                    ]}>
                    <Text
                      style={[
                        styles.tabBtnText,
                        { color: isSelected ? colors.primary : colors.textMuted },
                      ]}>
                      {tabTitles[tab]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Tab 1: Dwell Telemetry */}
            {activeTab === 'telemetry' && (
              <ScrollView style={styles.tabContent}>
                <View style={styles.kpiRow}>
                  <View style={[styles.kpiCard, { backgroundColor: colors.background }]}>
                    <Text style={styles.kpiVal}>{telemetry.qualifiedImpressionsCount}</Text>
                    <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Qualified (≥1s)</Text>
                  </View>
                  <View style={[styles.kpiCard, { backgroundColor: colors.background }]}>
                    <Text style={[styles.kpiVal, { color: '#F59E0B' }]}>{telemetry.totalImpressionsCount}</Text>
                    <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Total Impressions</Text>
                  </View>
                  <View style={[styles.kpiCard, { backgroundColor: colors.background }]}>
                    <Text style={[styles.kpiVal, { color: '#38BDF8' }]}>
                      {dwellSeconds}s
                    </Text>
                    <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Active Dwell</Text>
                  </View>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Viewport Events</Text>
                {telemetry.recentRecords.length === 0 ? (
                  <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                    Scroll feed to observe dwell triggers.
                  </Text>
                ) : (
                  telemetry.recentRecords.map((r, i) => (
                    <View
                      key={`${r.articleId}_${i}`}
                      style={[
                        styles.eventRow,
                        { backgroundColor: colors.background, borderLeftColor: r.isQualified ? '#10B981' : '#F59E0B' },
                      ]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
                          {r.articleTitle}
                        </Text>
                        <Text style={[styles.eventMeta, { color: colors.textMuted }]}>
                          #{r.category.toUpperCase()} • Dwell: {(r.dwellMs / 1000).toFixed(2)}s
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.eventStatus,
                          { color: r.isQualified ? '#10B981' : '#F59E0B' },
                        ]}>
                        {r.isQualified ? 'QUALIFIED' : 'BOUNCED'}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            {/* Tab 2: Beacon Outbox Worker */}
            {activeTab === 'outbox' && (
              <ScrollView style={styles.tabContent}>
                <View style={styles.kpiRow}>
                  <View style={[styles.kpiCard, { backgroundColor: colors.background }]}>
                    <Text style={styles.kpiVal}>{outbox.queueLength}</Text>
                    <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Queued Events</Text>
                  </View>
                  <View style={[styles.kpiCard, { backgroundColor: colors.background }]}>
                    <Text style={[styles.kpiVal, { color: '#10B981' }]}>{outbox.totalDispatchedBatches}</Text>
                    <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Batches Flushed</Text>
                  </View>
                  <View style={[styles.kpiCard, { backgroundColor: colors.background }]}>
                    <Text style={[styles.kpiVal, { color: '#A78BFA' }]}>
                      {(outbox.estimatedBytesSaved / 1024).toFixed(1)} KB
                    </Text>
                    <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Radio Overhead Saved</Text>
                  </View>
                </View>

                {/* Control Actions */}
                <View style={styles.outboxControlRow}>
                  <Pressable
                    onPress={() => telemetryOutboxService.setNetworkOnline(!outbox.networkOnline)}
                    style={[
                      styles.controlBtn,
                      {
                        backgroundColor: outbox.networkOnline ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        borderColor: outbox.networkOnline ? '#EF4444' : '#10B981',
                      },
                    ]}>
                    <FontAwesome
                      name={outbox.networkOnline ? 'wifi' : 'ban'}
                      size={12}
                      color={outbox.networkOnline ? '#EF4444' : '#10B981'}
                    />
                    <Text
                      style={[
                        styles.controlBtnText,
                        { color: outbox.networkOnline ? '#EF4444' : '#10B981' },
                      ]}>
                      {outbox.networkOnline ? 'Simulate Offline Radio' : 'Restore Radio Connection'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => telemetryOutboxService.flushQueue('manual_button')}
                    disabled={outbox.isFlushing || outbox.queueLength === 0}
                    style={[
                      styles.controlBtn,
                      {
                        backgroundColor: colors.primary,
                        opacity: outbox.isFlushing || outbox.queueLength === 0 ? 0.5 : 1,
                      },
                    ]}>
                    <Text style={[styles.controlBtnText, { color: '#090D16' }]}>
                      {outbox.isFlushing ? 'Flushing...' : 'Flush Queue Now'}
                    </Text>
                  </Pressable>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Dispatched Payloads</Text>
                {outbox.recentBatches.length === 0 ? (
                  <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                    Queue accumulates 6 items or flushes on 12s timer.
                  </Text>
                ) : (
                  outbox.recentBatches.map((b) => (
                    <View
                      key={b.batchId}
                      style={[styles.batchCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                      <View style={styles.batchTop}>
                        <Text style={[styles.batchId, { color: colors.primary }]}>{b.batchId}</Text>
                        <Text style={styles.batchCount}>{b.eventsCount} events</Text>
                      </View>
                      <Text style={[styles.batchPlatform, { color: colors.textMuted }]}>
                        Platform: {b.devicePlatform} • Dispatched via batched TLS beacon
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            {/* Tab 3: Predictive Prefetcher */}
            {activeTab === 'prefetch' && (
              <ScrollView style={styles.tabContent}>
                <View style={styles.kpiRow}>
                  <View style={[styles.kpiCard, { backgroundColor: colors.background }]}>
                    <Text style={[styles.kpiVal, { color: '#38BDF8' }]}>{prefetch.totalPrefetchedCount}</Text>
                    <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Images Pre-Decoded</Text>
                  </View>
                  <View style={[styles.kpiCard, { backgroundColor: colors.background }]}>
                    <Text style={styles.kpiVal}>{prefetch.currentlyQueuedCount}</Text>
                    <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>Active LRU Set Size</Text>
                  </View>
                </View>

                <View style={[styles.infoBanner, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                  <FontAwesome name="bolt" size={16} color="#38BDF8" />
                  <Text style={[styles.infoBannerText, { color: colors.textMuted }]}>
                    As you scroll down fast (velocity &gt; 0.8 px/ms), the engine inspects upcoming cells 4–8 items ahead and triggers asynchronous Image.prefetch() so cards render with zero latency.
                  </Text>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Last Prefetched URL</Text>
                <Text style={[styles.urlBox, { backgroundColor: colors.background, color: colors.primary }]} numberOfLines={2}>
                  {prefetch.lastPrefetchedUrl || 'No image prefetched yet. Scroll the feed down quickly.'}
                </Text>

                <Pressable
                  onPress={() => prefetchService.clearPrefetchCache()}
                  style={[styles.clearBtn, { borderColor: colors.cardBorder, marginTop: 20 }]}>
                  <Text style={styles.clearBtnText}>Purge Prefetch Cache</Text>
                </Pressable>
              </ScrollView>
            )}

            {/* Tab 4: Edge AI Recommendation Model */}
            {activeTab === 'edge_ai' && (
              <ScrollView style={styles.tabContent}>
                <View style={[styles.infoBanner, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                  <FontAwesome name="sliders" size={16} color="#A78BFA" />
                  <Text style={[styles.infoBannerText, { color: colors.textMuted }]}>
                    Calculates personalized weights based on your reading dwell time, likes, and bookmarks. Re-ranks the &apos;For You&apos; tab dynamically.
                  </Text>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>User Topic Affinity Weights</Text>
                <View style={[styles.vectorGrid, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                  {(Object.keys(affinity) as (keyof UserAffinityVector)[]).map((cat) => (
                    <View key={cat} style={styles.vectorRow}>
                      <Text style={[styles.vectorCat, { color: colors.text }]}>#{cat.toUpperCase()}</Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${Math.min(100, (affinity[cat] / 15) * 100)}%`,
                              backgroundColor: colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.vectorVal, { color: colors.primary }]}>{affinity[cat].toFixed(1)}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  onPress={() => recommendationEngine.resetAffinity()}
                  style={[styles.clearBtn, { borderColor: colors.cardBorder, marginTop: 20 }]}>
                  <Text style={styles.clearBtnText}>Reset Affinity Vector</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  hudContainer: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 8,
  },
  minimizedBadge: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    elevation: 8,
  },
  minimizedText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  liveGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hudLabel: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  activeText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  statNum: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
  },
  statSub: {
    color: '#94A3B8',
    fontSize: 8,
    textTransform: 'uppercase',
  },
  iconBtn: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    height: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  kpiVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  kpiLabel: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 6,
  },
  emptyHint: {
    fontSize: 12,
    marginVertical: 10,
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  eventMeta: {
    fontSize: 10,
    marginTop: 2,
  },
  eventStatus: {
    fontSize: 9,
    fontWeight: '800',
  },
  outboxControlRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  controlBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  batchCard: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  batchTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  batchId: {
    fontSize: 12,
    fontWeight: '700',
  },
  batchCount: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  batchPlatform: {
    fontSize: 11,
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  infoBannerText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  urlBox: {
    padding: 10,
    borderRadius: 8,
    fontSize: 11,
  },
  clearBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  vectorGrid: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  vectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vectorCat: {
    width: 80,
    fontSize: 11,
    fontWeight: '700',
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  vectorVal: {
    width: 32,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
  },
});
