import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function ModalScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.logoIconBg, { backgroundColor: colors.primary }]}>
            <FontAwesome name="bolt" size={20} color="#090D16" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>PulseFeed Architecture</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Engineered for high-throughput mobile content delivery
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.cardGroup}>
          <View style={[styles.specCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardTop}>
              <FontAwesome name="tachometer" size={18} color="#38BDF8" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>120 FPS List Virtualization</Text>
            </View>
            <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
              Powered by @shopify/flash-list cell recycling with bounded heap allocations and zero cumulative layout shifts.
            </Text>
          </View>

          <View style={[styles.specCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardTop}>
              <FontAwesome name="eye" size={18} color="#10B981" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Viewport Dwell Telemetry</Text>
            </View>
            <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
              Calculates sub-second visibility (≥50% in viewport) and dwell duration with live HUD auditing.
            </Text>
          </View>

          <View style={[styles.specCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardTop}>
              <FontAwesome name="database" size={18} color="#A78BFA" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Offline-First Persistence</Text>
            </View>
            <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
              Optimistic bookmarking engine backed by AsyncStorage and Zustand with instant local re-readability.
            </Text>
          </View>

          <View style={[styles.specCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardTop}>
              <FontAwesome name="paper-plane" size={18} color="#F59E0B" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Batched Beacon Outbox Worker</Text>
            </View>
            <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
              Queues analytics events and flushes batched TLS payloads (threshold/heartbeat/suspend) with exponential backoff, saving radio power.
            </Text>
          </View>

          <View style={[styles.specCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardTop}>
              <FontAwesome name="microchip" size={18} color="#EC4899" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>On-Device Edge Re-Ranking</Text>
            </View>
            <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
              Client-side personalization vector (dwell: +0.75/s, like: +3.0, bookmark: +4.5) re-ranking the For You feed with explainable badges.
            </Text>
          </View>

          <View style={[styles.specCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cardTop}>
              <FontAwesome name="bolt" size={18} color="#38BDF8" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Velocity-Based Predictive Prefetch</Text>
            </View>
            <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
              Profiles scroll velocity (v = Δy/Δt) and pre-decodes images 4-8 cards ahead into an LRU cache before user deceleration.
            </Text>
          </View>
        </View>

        {/* Tech Stack Specs */}
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Technical Stack</Text>
        <View style={[styles.stackCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {[
            { label: 'Core Framework', val: 'Expo SDK 54 / React Native 0.81' },
            { label: 'Runtime & React', val: 'React 19.1 & TypeScript 5.9' },
            { label: 'Navigation', val: 'Expo Router v6 (File-based)' },
            { label: 'State Management', val: 'Zustand v5' },
            { label: 'Image Engine', val: 'expo-image (disk & memory caching)' },
            { label: 'Web Integration', val: 'expo-web-browser' },
          ].map((item, idx, arr) => (
            <View
              key={item.label}
              style={[
                styles.stackRow,
                idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
              ]}>
              <Text style={[styles.stackLabel, { color: colors.textMuted }]}>{item.label}</Text>
              <Text style={[styles.stackVal, { color: colors.primary }]}>{item.val}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.closeBtnText}>Done</Text>
        </Pressable>
      </ScrollView>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 16,
  },
  logoIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  cardGroup: {
    gap: 12,
    marginVertical: 16,
  },
  specCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 10,
  },
  stackCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  stackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  stackLabel: {
    fontSize: 13,
  },
  stackVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#090D16',
    fontWeight: '800',
    fontSize: 15,
  },
});
