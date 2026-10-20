import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSettingsStore, ThemePreference, CardLayoutMode } from '../src/stores/useSettingsStore';

export default function SettingsModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const {
    theme,
    cardLayout,
    dataSaver,
    notifications,
    setTheme,
    setCardLayout,
    setDataSaver,
    setNotifications,
    clearCache,
  } = useSettingsStore();

  const handleClearCache = () => {
    Alert.alert(
      'Clear Offline Cache',
      'This will remove cached feed articles and temporary data. Your saved library bookmarks will remain intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            await clearCache();
            Alert.alert('Purged', 'Offline cache has been successfully cleared.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
          <FontAwesome name="times" size={16} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        {/* Appearance Group */}
        <View style={styles.group}>
          <Text style={[styles.groupHeading, { color: colors.textMuted }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {/* Theme Selector */}
            <View style={[styles.row, { borderBottomColor: colors.cardBorder }]}>
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Theme</Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted }]}>
                  Choose your reading ambiance
                </Text>
              </View>

              <View style={[styles.segmentedControl, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                {(['system', 'light', 'dark'] as ThemePreference[]).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTheme(t)}
                    style={[
                      styles.segmentItem,
                      theme === t && { backgroundColor: colors.primary },
                    ]}>
                    <Text
                      style={[
                        styles.segmentText,
                        { color: theme === t ? '#090D16' : colors.textMuted },
                      ]}>
                      {t.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Feed Card Layout Mode */}
            <View style={styles.row}>
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Feed Card Layout</Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted }]}>
                  {cardLayout === 'compact' ? 'Compact story list' : 'Large editorial cards'}
                </Text>
              </View>

              <View style={[styles.segmentedControl, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                {(['compact', 'large'] as CardLayoutMode[]).map((layout) => (
                  <Pressable
                    key={layout}
                    onPress={() => setCardLayout(layout)}
                    style={[
                      styles.segmentItem,
                      cardLayout === layout && { backgroundColor: colors.primary },
                    ]}>
                    <Text
                      style={[
                        styles.segmentText,
                        { color: cardLayout === layout ? '#090D16' : colors.textMuted },
                      ]}>
                      {layout.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Data & Performance Group */}
        <View style={styles.group}>
          <Text style={[styles.groupHeading, { color: colors.textMuted }]}>DATA & PERFORMANCE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {/* Data Saver */}
            <View style={[styles.row, { borderBottomColor: colors.cardBorder }]}>
              <View style={styles.toggleTextCol}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Data Saver</Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted }]}>
                  Reduces network usage by disabling predictive image prefetching
                </Text>
              </View>
              <Switch
                value={dataSaver}
                onValueChange={setDataSaver}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Notifications */}
            <View style={styles.row}>
              <View style={styles.toggleTextCol}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Daily Digest Notifications</Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted }]}>
                  Receive curated morning updates for your followed topics
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Storage Group */}
        <View style={styles.group}>
          <Text style={[styles.groupHeading, { color: colors.textMuted }]}>STORAGE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Pressable
              onPress={handleClearCache}
              style={({ pressed }) => [
                styles.actionRow,
                { opacity: pressed ? 0.8 : 1 },
              ]}>
              <View>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Clear Cache</Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted }]}>
                  Free up local storage without removing bookmarked stories
                </Text>
              </View>
              <FontAwesome name="trash-o" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* About PulseFeed Group */}
        <View style={styles.group}>
          <Text style={[styles.groupHeading, { color: colors.textMuted }]}>ABOUT</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.row, { borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Version</Text>
              <Text style={[styles.rowValue, { color: colors.textMuted }]}>1.0.0 (Build 54)</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Architecture</Text>
              <Text style={[styles.rowValue, { color: colors.textMuted }]}>FlashList v2 • React Native</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Content Sources</Text>
              <Text style={[styles.rowValue, { color: colors.textMuted }]}>Hacker News • Dev.to</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  closeBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 24,
  },
  group: {
    gap: 8,
  },
  groupHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 16,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  segmentItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
