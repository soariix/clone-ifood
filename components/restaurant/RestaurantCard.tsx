import { BorderRadius, Colors, FontSize, Shadow, Spacing } from '@/constants/theme';
import { Restaurant } from '@/types';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: Props) {
  const handlePress = () => router.push(`/restaurant/${restaurant.id}`);

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={handlePress}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: restaurant.coverImage }} style={styles.cover} resizeMode="cover" />
        {!restaurant.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Fechado</Text>
          </View>
        )}
        {restaurant.deliveryFee === 0 && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>Frete grátis</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <Image source={{ uri: restaurant.logo }} style={styles.logo} />
          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
            <Text style={styles.category}>{restaurant.categoryIcon} {restaurant.category}</Text>
          </View>
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaText}>⭐ {restaurant.rating.toFixed(1)} ({restaurant.reviewCount})</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>🕐 {restaurant.deliveryTime} min</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>
            {restaurant.deliveryFee === 0 ? '🟢 Grátis' : `R$ ${restaurant.deliveryFee.toFixed(2)}`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  imageWrapper: { position: 'relative' },
  cover: { width: '100%', height: 160 },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: { color: '#fff', fontWeight: '700', fontSize: FontSize.lg },
  freeBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  freeBadgeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '600' },
  info: { padding: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  logo: { width: 36, height: 36, borderRadius: BorderRadius.sm, marginRight: 8 },
  nameBlock: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  category: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  metaText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  dot: { color: Colors.textLight, fontSize: FontSize.xs },
});
