import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FeedCard } from '../src/components/FeedCard';
import { EmptyState } from '../src/components/EmptyState';
import { FeedService } from '../src/services/feedService';
import { Article } from '../src/types';

const RECENT_SEARCHES_KEY = '@pulsefeed_recent_searches_v1';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load recent searches:', e);
    }
  };

  const saveRecentSearch = async (term: string) => {
    const clean = term.trim();
    if (!clean) return;

    const filtered = recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, 8);
    setRecentSearches(updated);

    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save recent search:', e);
    }
  };

  const removeRecentSearch = async (term: string) => {
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete search term:', e);
    }
  };

  const clearAllRecent = async () => {
    setRecentSearches([]);
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.warn('Failed to clear search terms:', e);
    }
  };

  const performSearch = async (text: string) => {
    const clean = text.trim();
    if (!clean) {
      setResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await FeedService.fetchArticles(1, 20, 'all', clean);
      setResults(res.articles);
    } catch (e) {
      console.warn('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      performSearch(text);
      if (text.trim().length >= 3) {
        saveRecentSearch(text);
      }
    }, 350);
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    performSearch(term);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header Bar */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8, borderBottomColor: colors.cardBorder }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <FontAwesome name="arrow-left" size={16} color={colors.text} />
        </Pressable>

        <View style={[styles.searchInputWrapper, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <FontAwesome name="search" size={14} color={colors.textSubtle} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search stories, authors, topics..."
            placeholderTextColor={colors.textSubtle}
            value={query}
            onChangeText={handleChangeText}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => {
              if (query.trim()) {
                performSearch(query);
                saveRecentSearch(query);
              }
            }}
          />
          {query ? (
            <Pressable onPress={() => handleChangeText('')} hitSlop={8} style={styles.clearBtn}>
              <FontAwesome name="times-circle" size={14} color={colors.textSubtle} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Content Area */}
      {isSearching ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.searchingText, { color: colors.textMuted }]}>Searching stories...</Text>
        </View>
      ) : hasSearched ? (
        results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <FeedCard article={item} layout="compact" />}
          />
        ) : (
          <EmptyState
            icon="search"
            title="No stories found"
            description={`We could not find any stories matching "${query}". Try searching for engineering, design, or architecture.`}
          />
        )
      ) : (
        /* Recent Searches & Suggested Topics */
        <View style={styles.recentSection}>
          {recentSearches.length > 0 ? (
            <View style={styles.recentHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Searches</Text>
              <Pressable onPress={clearAllRecent} hitSlop={8} style={styles.clearAllBtn}>
                <Text style={[styles.clearAllText, { color: colors.textMuted }]}>Clear all</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.chipsWrap}>
            {recentSearches.map((term, index) => (
              <View
                key={index}
                style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Pressable onPress={() => handleSelectRecent(term)} style={styles.chipPressArea}>
                  <Text style={[styles.chipText, { color: colors.text }]}>{term}</Text>
                </Pressable>
                <Pressable onPress={() => removeRecentSearch(term)} hitSlop={8} style={styles.chipRemove}>
                  <FontAwesome name="times" size={11} color={colors.textSubtle} />
                </Pressable>
              </View>
            ))}
          </View>

          {/* Popular Topics Section */}
          <View style={[styles.recentHeader, { marginTop: 24 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Topics</Text>
          </View>
          <View style={styles.chipsWrap}>
            {['React Native', 'FlashList', 'Local-First', 'UI Design', 'Startups', 'Architecture'].map(
              (tag, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleSelectRecent(tag)}
                  style={({ pressed }) => [
                    styles.tagChip,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>#{tag}</Text>
                </Pressable>
              )
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  clearBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  searchingText: {
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 32,
  },
  recentSection: {
    padding: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  clearAllBtn: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 44,
    paddingLeft: 14,
    paddingRight: 10,
  },
  chipPressArea: {
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 6,
  },
  chipRemove: {
    minHeight: 36,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
