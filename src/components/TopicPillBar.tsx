import React from 'react';
import { ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { TopicCategory } from '../types';
import { TOPIC_CATEGORIES } from '../services/feedService';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface TopicPillBarProps {
  selectedCategory: TopicCategory;
  onSelectCategory: (cat: TopicCategory) => void;
}

export const TopicPillBar: React.FC<TopicPillBarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {TOPIC_CATEGORIES.map((topic) => {
        const isSelected = selectedCategory === topic.id;
        return (
          <Pressable
            key={topic.id}
            onPress={() => onSelectCategory(topic.id)}
            style={({ pressed }) => [
              styles.pill,
              {
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderColor: isSelected ? colors.primary : colors.cardBorder,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <FontAwesome
              name={topic.icon as any}
              size={12}
              color={isSelected ? '#090D16' : colors.textMuted}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? '#090D16' : colors.text,
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}>
              {topic.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
  },
});
