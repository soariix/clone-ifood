import BottomSheet from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CartBottomSheet } from '@/components/cart/CartBottomSheet';
import { CategoryPill } from '@/components/home/CategoryPill';
import { PromoBanner } from '@/components/home/PromoBanner';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';

import { MOCK_CATEGORIES, MOCK_RESTAURANTS } from '@/constants/mockData';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cart.store';

export default function HomeScreen() {
  const { user } = useAuth();
  const cartBottomSheetRef = useRef<BottomSheet>(null);
  const itemCount = useCartStore((s) => s.itemCount());

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const filteredRestaurants = selectedCategory
    ? MOCK_RESTAURANTS.filter((r) =>
        r.category.toLowerCase().includes(selectedCategory.replace(/-/g, ' ')) ||
        r.tags.some((t) => t.toLowerCase().includes(selectedCategory)),
      )
    : MOCK_RESTAURANTS;

  const handleCategoryPress = useCallback((slug: string) => {
    setSelectedCategory((prev) => (prev === slug ? null : slug));
  }, []);

  const handleLoadMore = useCallback(() => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);
    setTimeout(() => setIsFetchingMore(false), 1000);
  }, [isFetchingMore]);

  const openCart = useCallback(() => {
    cartBottomSheetRef.current?.expand();
  }, []);

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] ?? 'Visitante'} 👋</Text>
          <Pressable style={styles.addressRow} onPress={() => {}}>
            <Text style={styles.addressText}>📍 Rua das Flores, 123</Text>
            <Text style={styles.addressChevron}>›</Text>
          </Pressable>
        </View>
        {itemCount > 0 && (
          <Pressable style={styles.cartBtn} onPress={openCart}>
            <Text style={styles.cartBtnText}>🛒 {itemCount}</Text>
          </Pressable>
        )}
      </View>

      <Pressable style={styles.searchBar} onPress={() => router.push('/(tabs)/search')}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Buscar restaurantes e pratos</Text>
      </Pressable>

      <PromoBanner />

      <Text style={styles.sectionTitle}>O que você quer pedir?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        {MOCK_CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat.id}
            category={cat}
            isSelected={selectedCategory === cat.slug}
            onPress={handleCategoryPress}
          />
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>
        {selectedCategory ? `Restaurantes · ${selectedCategory}` : 'Perto de você'}
      </Text>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RestaurantCard restaurant={item} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />
          ) : null
        }
      />

      {itemCount > 0 && (
        <Pressable style={styles.fab} onPress={openCart}>
          <Text style={styles.fabText}>
            🛒 Ver carrinho · {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          </Text>
        </Pressable>
      )}

      <CartBottomSheet ref={cartBottomSheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: Spacing.sm,
  },
  greeting: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  addressText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  addressChevron: { fontSize: 18, color: Colors.primary, marginLeft: 4 },
  cartBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  cartBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchIcon: { fontSize: 18 },
  searchPlaceholder: { color: Colors.textLight, fontSize: FontSize.sm },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  categoriesRow: { paddingBottom: Spacing.sm },
  loader: { paddingVertical: Spacing.md },
  fab: {
    position: 'absolute',
    bottom: 90,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
});
