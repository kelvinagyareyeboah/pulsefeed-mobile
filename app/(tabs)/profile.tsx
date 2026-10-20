import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useBookmarkStore } from '../../src/stores/useBookmarkStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const { user, logout } = useAuthStore();
  const { bookmarks } = useBookmarkStore();
  const { readArticleIds, selectedTopics, clearCache } = useSettingsStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of PulseFeed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Offline Cache',
      'This will remove cached feed articles and temporary data. Saved bookmarks will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            await clearCache();
            Alert.alert('Cache Cleared', 'Offline temporary data has been purged.');
          },
        },
      ]
    );
  };

  const displayName = user?.name || 'Guest Reader';
  const displayEmail = user?.email || 'Local Offline Account';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Profile</Text>
        <Pressable
          onPress={() => router.push('/modal' as any)}
          style={[styles.settingsButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <FontAwesome name="cog" size={16} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Image
            source={require('../../assets/images/avatar-default.jpg')}
            style={styles.avatarImage}
            contentFit="cover"
          />

          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
              {user?.isGuest && (
                <View style={[styles.guestBadge, { backgroundColor: colors.badge }]}>
                  <Text style={[styles.guestBadgeText, { color: colors.badgeText }]}>GUEST</Text>
                </View>
              )}
            </View>
            <Text style={[styles.userEmail, { color: colors.textMuted }]}>{displayEmail}</Text>
          </View>
        </View>

        {/* Reading Statistics (Medium Style) */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{readArticleIds.size}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Stories Read</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{bookmarks.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Saved</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{selectedTopics.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Topics</Text>
          </View>
        </View>

        {/* Followed Interests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Interests</Text>
            <Pressable
              onPress={() => router.push('/topic-picker' as any)}
              hitSlop={8}
              style={styles.editInterestsButton}>
              <Text style={[styles.editInterestsText, { color: colors.primary }]}>Customize</Text>
            </Pressable>
          </View>

          <View style={styles.topicPillsWrap}>
            {selectedTopics.map((topic, i) => (
              <View
                key={i}
                style={[styles.topicBadge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <FontAwesome name="check" size={10} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.topicBadgeText, { color: colors.text }]}>
                  {topic.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Account & App Menu */}
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Pressable
            onPress={() => router.push('/modal' as any)}
            style={({ pressed }) => [
              styles.menuItem,
              { borderBottomColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 },
            ]}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="sliders" size={16} color={colors.textMuted} style={styles.menuIcon} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Reading & Theme Settings</Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color={colors.textSubtle} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)/saved' as any)}
            style={({ pressed }) => [
              styles.menuItem,
              { borderBottomColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 },
            ]}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="bookmark-o" size={16} color={colors.textMuted} style={styles.menuIcon} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Offline Library</Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color={colors.textSubtle} />
          </Pressable>

          <Pressable
            onPress={handleClearCache}
            style={({ pressed }) => [
              styles.menuItem,
              { borderBottomColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 },
            ]}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="trash-o" size={16} color={colors.textMuted} style={styles.menuIcon} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Purge Offline Cache</Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color={colors.textSubtle} />
          </Pressable>

          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.menuItem,
              styles.menuItemLast,
              { opacity: pressed ? 0.8 : 1 },
            ]}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="sign-out" size={16} color={colors.bookmark} style={styles.menuIcon} />
              <Text style={[styles.menuItemText, { color: colors.bookmark, fontWeight: '700' }]}>
                Sign Out
              </Text>
            </View>
          </Pressable>
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
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  settingsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  guestBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  guestBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 13,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  section: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  editInterestsButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  editInterestsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  topicPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 38,
  },
  topicBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 52,
    borderBottomWidth: 1,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 24,
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
