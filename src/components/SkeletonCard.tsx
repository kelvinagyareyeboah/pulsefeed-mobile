import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { CardLayoutMode } from '../stores/useSettingsStore';

interface SkeletonCardProps {
  layout?: CardLayoutMode;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ layout = 'compact' }) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  if (layout === 'large') {
    return (
      <View style={[styles.largeCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[styles.largeImagePlaceholder, { backgroundColor: colors.badge }]} />
        <View style={styles.largeBody}>
          <View style={styles.authorRow}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.badge }]} />
            <View style={[styles.authorNamePlaceholder, { backgroundColor: colors.badge }]} />
          </View>
          <View style={[styles.titlePlaceholder, { backgroundColor: colors.badge }]} />
          <View style={[styles.titlePlaceholderShort, { backgroundColor: colors.badge }]} />
          <View style={[styles.metaPlaceholder, { backgroundColor: colors.badge }]} />
        </View>
      </View>
    );
  }

  // Compact layout (Medium story list style)
  return (
    <View style={[styles.compactCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.compactLeft}>
        <View style={styles.authorRow}>
          <View style={[styles.avatarPlaceholderSmall, { backgroundColor: colors.badge }]} />
          <View style={[styles.authorNamePlaceholder, { backgroundColor: colors.badge }]} />
        </View>
        <View style={[styles.titlePlaceholder, { backgroundColor: colors.badge }]} />
        <View style={[styles.titlePlaceholderMedium, { backgroundColor: colors.badge }]} />
        <View style={[styles.metaPlaceholder, { backgroundColor: colors.badge }]} />
      </View>
      <View style={[styles.compactImagePlaceholder, { backgroundColor: colors.badge }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  largeCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  largeImagePlaceholder: {
    width: '100%',
    height: 190,
  },
  largeBody: {
    padding: 16,
    gap: 10,
  },
  compactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  compactLeft: {
    flex: 1,
    marginRight: 16,
    gap: 8,
  },
  compactImagePlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarPlaceholderSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  authorNamePlaceholder: {
    width: 110,
    height: 12,
    borderRadius: 4,
  },
  titlePlaceholder: {
    width: '100%',
    height: 16,
    borderRadius: 4,
  },
  titlePlaceholderShort: {
    width: '65%',
    height: 16,
    borderRadius: 4,
  },
  titlePlaceholderMedium: {
    width: '80%',
    height: 14,
    borderRadius: 4,
  },
  metaPlaceholder: {
    width: '40%',
    height: 10,
    borderRadius: 3,
    marginTop: 4,
  },
});
