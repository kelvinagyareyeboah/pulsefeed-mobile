import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface OfflineBannerProps {
  visible: boolean;
  onRetry?: () => void;
  message?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  visible,
  onRetry,
  message = 'Offline mode. Showing cached and saved stories.',
}) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.contentRow}>
        <FontAwesome name="rss" size={14} color={colors.primary} style={styles.icon} />
        <Text style={[styles.message, { color: colors.textMuted }]} numberOfLines={1}>
          {message}
        </Text>
      </View>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          hitSlop={12}
          style={({ pressed }) => [
            styles.retryButton,
            { backgroundColor: colors.primaryLight, opacity: pressed ? 0.7 : 1 },
          ]}>
          <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  icon: {
    marginRight: 8,
  },
  message: {
    fontSize: 13,
    fontWeight: '400',
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
