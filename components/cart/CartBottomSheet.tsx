import { BorderRadius, Colors, FontSize, Shadow, Spacing } from '@/constants/theme';
import { useCartStore } from '@/store/cart.store';
import { CartItem } from '@/types';
import BottomSheet, {
    BottomSheetFlatList,
    BottomSheetFooter,
    BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { forwardRef, useCallback, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  onChange?: (index: number) => void;
}

export const CartBottomSheet = forwardRef<BottomSheet, Props>(({ onChange }, ref) => {
  const { items, restaurant, total, subtotal, updateQuantity, removeItem, closeCart } = useCartStore();

  const snapPoints = useMemo(() => ['50%', '90%'], []);

  const handleCheckout = useCallback(() => {
    closeCart();
    router.push('/checkout');
  }, [closeCart]);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={24}>
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Subtotal</Text>
            <Text style={styles.footerValue}>R$ {subtotal().toFixed(2)}</Text>
          </View>
          {restaurant && (
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Entrega</Text>
              <Text style={[styles.footerValue, restaurant.deliveryFee === 0 && styles.free]}>
                {restaurant.deliveryFee === 0 ? 'Grátis' : `R$ ${restaurant.deliveryFee.toFixed(2)}`}
              </Text>
            </View>
          )}
          <View style={[styles.footerRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ {total().toFixed(2)}</Text>
          </View>

          <Pressable style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>Confirmar pedido</Text>
          </Pressable>
        </View>
      </BottomSheetFooter>
    ),
    [subtotal, total, restaurant, handleCheckout],
  );

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.item.image }} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.item.name}</Text>
          <Text style={styles.itemPrice}>R$ {(item.item.price * item.quantity).toFixed(2)}</Text>
        </View>
        <View style={styles.qtyRow}>
          <Pressable
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.item.id, item.quantity - 1)}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{item.quantity}</Text>
          <Pressable
            style={[styles.qtyBtn, styles.qtyBtnAdd]}
            onPress={() => updateQuantity(item.item.id, item.quantity + 1)}
          >
            <Text style={[styles.qtyBtnText, styles.qtyBtnAddText]}>+</Text>
          </Pressable>
        </View>
      </View>
    ),
    [updateQuantity],
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={closeCart}
      onChange={onChange}
      footerComponent={renderFooter}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {restaurant?.name ?? 'Carrinho'}
        </Text>
        <Pressable onPress={closeCart} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      <BottomSheetFlatList
        data={items}
        keyExtractor={(ci) => ci.item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
          </View>
        }
      />
    </BottomSheet>
  );
});

CartBottomSheet.displayName = 'CartBottomSheet';

const styles = StyleSheet.create({
  sheetBg: { borderRadius: BorderRadius.xl },
  handle: { backgroundColor: Colors.border, width: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  closeBtn: { padding: Spacing.xs },
  closeBtnText: { fontSize: FontSize.md, color: Colors.textSecondary },
  list: { paddingBottom: 240 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  itemImage: { width: 56, height: 56, borderRadius: BorderRadius.sm },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  itemPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnAdd: { backgroundColor: Colors.primary },
  qtyBtnText: { color: Colors.primary, fontSize: 18, fontWeight: '500', lineHeight: 22 },
  qtyBtnAddText: { color: '#fff' },
  qty: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, minWidth: 20, textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.md },
  footer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    ...Shadow.lg,
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  footerLabel: { color: Colors.textSecondary, fontSize: FontSize.sm },
  footerValue: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  free: { color: Colors.success },
  totalRow: { marginTop: 6, marginBottom: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 10 },
  totalLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 4,
    alignItems: 'center',
  },
  checkoutBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});
