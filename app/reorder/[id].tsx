import { BorderRadius, Colors, FontSize, Shadow, Spacing } from '@/constants/theme';
import { useCartStore } from '@/store/cart.store';
import { CartItem, Restaurant } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MOCK_ORDERS, MOCK_RESTAURANTS } from '@/constants/mockData';

export default function ReorderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { addItem, clearCart } = useCartStore();

  const order = MOCK_ORDERS.find((o) => o.id === id);

  // Quantidades editáveis (começa igual ao pedido original)
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () =>
      Object.fromEntries(
        (order?.items ?? []).map((ci) => [ci.item.id, ci.quantity]),
      ),
  );

  const changeQty = useCallback((itemId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] ?? 1) + delta),
    }));
  }, []);

  if (!order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>😕</Text>
          <Text style={styles.notFoundText}>Pedido não encontrado</Text>
        </View>
      </View>
    );
  }

  // Tenta encontrar o restaurante completo; senão constrói um mínimo a partir do pedido
  const restaurant: Restaurant =
    MOCK_RESTAURANTS.find((r) => r.id === order.restaurantId) ?? {
      id: order.restaurantId,
      name: order.restaurantName,
      slug: order.restaurantId,
      logo: order.restaurantLogo,
      coverImage: order.restaurantLogo,
      category: '',
      categoryIcon: '🍽️',
      rating: 0,
      reviewCount: 0,
      deliveryTime: 30,
      deliveryFee: order.deliveryFee,
      minOrder: 0,
      distance: 0,
      isOpen: true,
      tags: [],
    };

  const activeItems: CartItem[] = order.items.filter(
    (ci) => (quantities[ci.item.id] ?? 0) > 0,
  );

  const subtotal = activeItems.reduce(
    (sum, ci) => sum + ci.item.price * (quantities[ci.item.id] ?? ci.quantity),
    0,
  );
  const total = subtotal + order.deliveryFee;

  const handleConfirm = () => {
    if (activeItems.length === 0) {
      Alert.alert('Atenção', 'Selecione ao menos 1 item.');
      return;
    }

    clearCart();
    activeItems.forEach((ci) => {
      for (let i = 0; i < (quantities[ci.item.id] ?? ci.quantity); i++) {
        addItem(ci.item, restaurant);
      }
    });

    router.push('/checkout');
  };

  const renderItem = ({ item: ci }: { item: CartItem }) => {
    const qty = quantities[ci.item.id] ?? ci.quantity;

    return (
      <View style={[styles.itemRow, qty === 0 && styles.itemRowDisabled]}>
        <Image source={{ uri: ci.item.image }} style={styles.itemImage} resizeMode="cover" />
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, qty === 0 && styles.itemNameDisabled]} numberOfLines={1}>
            {ci.item.name}
          </Text>
          <Text style={styles.itemPrice}>R$ {ci.item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.qtyControl}>
          <Pressable
            style={[styles.qtyBtn, qty === 0 && styles.qtyBtnDisabled]}
            onPress={() => changeQty(ci.item.id, -1)}
            hitSlop={8}
          >
            <Text style={styles.qtyBtnText}>{qty === 1 ? '🗑️' : '−'}</Text>
          </Pressable>
          <Text style={[styles.qtyValue, qty === 0 && styles.qtyValueDisabled]}>{qty}</Text>
          <Pressable
            style={styles.qtyBtn}
            onPress={() => changeQty(ci.item.id, +1)}
            hitSlop={8}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Pedir novamente</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={order.items}
        keyExtractor={(ci) => ci.item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Banner do restaurante */}
            <View style={styles.restaurantCard}>
              <Image source={{ uri: restaurant.logo }} style={styles.restaurantLogo} />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <View style={styles.restaurantMeta}>
                  <Text style={styles.metaText}>🕐 {restaurant.deliveryTime} min</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText}>
                    {restaurant.deliveryFee === 0
                      ? '🟢 Frete grátis'
                      : `Frete R$ ${restaurant.deliveryFee.toFixed(2)}`}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Itens do pedido</Text>
            <Text style={styles.sectionSubtitle}>
              Ajuste as quantidades se quiser
            </Text>
          </>
        }
        ListFooterComponent={
          <>
            {/* Resumo */}
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>R$ {subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxa de entrega</Text>
                <Text style={[styles.summaryValue, order.deliveryFee === 0 && styles.free]}>
                  {order.deliveryFee === 0 ? 'Grátis' : `R$ ${order.deliveryFee.toFixed(2)}`}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
              </View>
            </View>

            <View style={{ height: 120 }} />
          </>
        }
      />

      {/* Botão fixo no rodapé */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <Pressable
          style={({ pressed }) => [
            styles.confirmBtn,
            activeItems.length === 0 && styles.confirmBtnDisabled,
            pressed && styles.confirmBtnPressed,
          ]}
          onPress={handleConfirm}
          disabled={activeItems.length === 0}
        >
          <View style={styles.confirmBtnInner}>
            <View style={styles.confirmQtyBadge}>
              <Text style={styles.confirmQtyText}>
                {activeItems.reduce((s, ci) => s + (quantities[ci.item.id] ?? 0), 0)}
              </Text>
            </View>
            <Text style={styles.confirmBtnText}>Confirmar pedido</Text>
            <Text style={styles.confirmBtnPrice}>R$ {total.toFixed(2)}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: Colors.text },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },

  listContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },

  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
    gap: Spacing.sm,
  },
  restaurantLogo: { width: 52, height: 52, borderRadius: BorderRadius.sm },
  restaurantInfo: { flex: 1 },
  restaurantName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  restaurantMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  metaText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  metaDot: { fontSize: FontSize.xs, color: Colors.textLight },

  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  sectionSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
    gap: Spacing.sm,
  },
  itemRowDisabled: { opacity: 0.45 },
  itemImage: { width: 64, height: 64, borderRadius: BorderRadius.sm },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  itemNameDisabled: { textDecorationLine: 'line-through', color: Colors.textLight },
  itemPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },

  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyBtnText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  qtyValue: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, minWidth: 20, textAlign: 'center' },
  qtyValueDisabled: { color: Colors.textLight },

  summary: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    ...Shadow.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },
  free: { color: Colors.success },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginBottom: 0,
    marginTop: 4,
  },
  totalLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: FontSize.md, fontWeight: '800', color: Colors.primary },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  confirmBtnDisabled: { backgroundColor: Colors.textLight },
  confirmBtnPressed: { opacity: 0.88 },
  confirmBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  confirmQtyBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  confirmQtyText: { color: '#fff', fontWeight: '800', fontSize: FontSize.sm },
  confirmBtnText: { flex: 1, color: '#fff', fontWeight: '700', fontSize: FontSize.md, textAlign: 'center' },
  confirmBtnPrice: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundEmoji: { fontSize: 48, marginBottom: 12 },
  notFoundText: { fontSize: FontSize.lg, color: Colors.textSecondary },
});
