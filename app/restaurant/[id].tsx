import BottomSheet from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
    Animated,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartBottomSheet } from '@/components/cart/CartBottomSheet';
import { MenuItemCard } from '@/components/restaurant/MenuItemCard';

import { MOCK_MENU_SECTIONS, MOCK_RESTAURANTS } from '@/constants/mockData';
import { BorderRadius, Colors, FontSize, Shadow, Spacing } from '@/constants/theme';
import { useCartStore } from '@/store/cart.store';
import { MenuItem } from '@/types';

const HEADER_MAX_HEIGHT = 260;
const HEADER_MIN_HEIGHT = 72;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const cartBottomSheetRef = useRef<BottomSheet>(null);

  const restaurant = MOCK_RESTAURANTS.find((r) => r.id === id) ?? MOCK_RESTAURANTS[0];
  const menuSections = MOCK_MENU_SECTIONS;

  const { addItem, itemCount, openCart } = useCartStore();
  const count = useCartStore((s) => s.itemCount());

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerImageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleAddItem = useCallback(
    (item: MenuItem) => {
      addItem(item, restaurant);
    },
    [addItem, restaurant],
  );

  const handleOpenCart = useCallback(() => {
    cartBottomSheetRef.current?.expand();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header animado */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Image
          source={{ uri: restaurant.coverImage }}
          style={[StyleSheet.absoluteFillObject, { opacity: headerImageOpacity }]}
          resizeMode="cover"
        />
        <View style={[styles.headerOverlay]} />

        {/* Barra de navegação */}
        <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>‹</Text>
          </Pressable>
          <Animated.Text style={[styles.navTitle, { opacity: titleOpacity }]} numberOfLines={1}>
            {restaurant.name}
          </Animated.Text>
          <View style={styles.backBtn} />
        </View>
      </Animated.View>

      {/* Conteúdo com SectionList */}
      <Animated.SectionList
        sections={menuSections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MenuItemCard item={item} onAdd={handleAddItem} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT, paddingBottom: 120 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        stickySectionHeadersEnabled
        ListHeaderComponent={
          <View style={styles.restaurantInfo}>
            <View style={styles.logoRow}>
              <Image source={{ uri: restaurant.logo }} style={styles.logo} />
              <View>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantCategory}>
                  {restaurant.categoryIcon} {restaurant.category}
                </Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaItem}>⭐ {restaurant.rating.toFixed(1)} ({restaurant.reviewCount})</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaItem}>🕐 {restaurant.deliveryTime} min</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaItem}>
                {restaurant.deliveryFee === 0
                  ? '🟢 Frete grátis'
                  : `R$ ${restaurant.deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <Text style={styles.minOrder}>Pedido mínimo: R$ {restaurant.minOrder.toFixed(2)}</Text>
          </View>
        }
      />

      {/* FAB do carrinho */}
      {count > 0 && (
        <Pressable style={styles.cartFab} onPress={handleOpenCart}>
          <Text style={styles.cartFabText}>
            🛒 Ver carrinho · {count} {count === 1 ? 'item' : 'itens'}
          </Text>
        </Pressable>
      )}

      <CartBottomSheet ref={cartBottomSheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 24, color: Colors.text, lineHeight: 32 },
  navTitle: { flex: 1, textAlign: 'center', color: '#fff', fontWeight: '700', fontSize: FontSize.md, marginHorizontal: 8 },
  restaurantInfo: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  logo: { width: 56, height: 56, borderRadius: BorderRadius.sm },
  restaurantName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  restaurantCategory: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  metaItem: { fontSize: FontSize.sm, color: Colors.textSecondary },
  metaDot: { color: Colors.textLight },
  minOrder: { fontSize: FontSize.xs, color: Colors.textLight },
  sectionHeader: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  cartFab: {
    position: 'absolute',
    bottom: 32,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    ...Shadow.lg,
  },
  cartFabText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
});
