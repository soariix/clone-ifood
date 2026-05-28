import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { Category } from '@/types';
import { Pressable, StyleSheet, Text } from 'react-native';

interface Props {
  category: Category;
  isSelected: boolean;
  onPress: (slug: string) => void;
}

export function CategoryPill({ category, isSelected, onPress }: Props) {
  return (
    <Pressable
      style={[styles.pill, isSelected && styles.pillSelected]}
      onPress={() => onPress(category.slug)}
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    marginRight: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  icon: { fontSize: 18 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  labelSelected: { color: Colors.textOnPrimary },
});
