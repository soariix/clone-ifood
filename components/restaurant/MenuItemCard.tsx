import { BorderRadius, Colors, FontSize, Shadow, Spacing } from '@/constants/theme';
import { MenuItem } from '@/types';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAdd }: Props) {
  return (
    <View style={[styles.card, !item.isAvailable && styles.unavailable]}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
        {item.calories && (
          <Text style={styles.calories}>🔥 {item.calories} kcal</Text>
        )}
        <Text style={styles.price}>R$ {item.price.toFixed(2)}</Text>
      </View>

      <View style={styles.right}>
        <Image source={{ uri: item.image }} style={styles.image} />
        {item.isAvailable && (
          <Pressable style={styles.addBtn} onPress={() => onAdd(item)}>
            <Text style={styles.addBtnText}>+</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  unavailable: { opacity: 0.5 },
  info: { flex: 1, marginRight: Spacing.sm },
  name: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  description: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  calories: { fontSize: FontSize.xs, color: Colors.textLight, marginBottom: 6 },
  price: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
  right: { alignItems: 'center', gap: 8 },
  image: { width: 96, height: 96, borderRadius: BorderRadius.sm },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 28 },
});
