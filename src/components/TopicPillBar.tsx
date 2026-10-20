import React from 'react';
import { View, ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { TopicCategory } from '../types';

export type FeedTab = 'for-you' | 'latest' | TopicCategory;

export interface TabOption {
  id: FeedTab;
  label: string;
}

export const FEED_TABS: TabOption[] = [
  { id: 'for-you', label: 'For You' },
  { id: 'latest', label: 'Latest' },
  { id: 'tech', label: 'Engineering' },
  { id: 'ai', label: 'Technology & AI' },
  { id: 'design', label: 'Design & UI' },
  { id: 'startups', label: 'Startups' },
  { id: 'finance', label: 'Markets' },
];

interface TopicPillBarProps {
  selectedTab: FeedTab;
  onSelectTab: (tab: FeedTab) => void;
}

export const TopicPillBar: React.FC<TopicPillBarProps> = ({
  selectedTab,
  onSelectTab,
}) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.barWrapper, { borderBottomColor: colors.cardBorder, backgroundColor: colors.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.container}>
        {FEED_TABS.map((tab) => {
          const isSelected = selectedTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onSelectTab(tab.id)}
              hitSlop={6}
              style={({ pressed }) => [
                styles.tabItem,
                { opacity: pressed ? 0.75 : 1 },
              ]}>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isSelected ? colors.text : colors.textMuted,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}>
                {tab.label}
              </Text>

              {/* Active Underline Indicator (Medium Style) */}
              {isSelected && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  barWrapper: {
    height: 44,
    maxHeight: 44,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  scrollView: {
    height: 44,
    maxHeight: 44,
    flexGrow: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  tabItem: {
    height: 44,
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 14,
    letterSpacing: -0.1,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 2.5,
    borderRadius: 2,
  },
});
