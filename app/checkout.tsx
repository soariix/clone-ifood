import { BorderRadius, Colors, FontSize, Shadow, Spacing } from '@/constants/theme';
import { useCartStore } from '@/store/cart.store';
import { Address } from '@/types';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr1',
    label: 'Casa',
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Jardim América',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
  },
  {
    id: 'addr2',
    label: 'Trabalho',
    street: 'Av. Paulista',
    number: '1578',
    complement: 'Sala 1001',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-200',
  },
];

export default function CheckoutScreen() {
  const { items, restaurant, total, subtotal, clearCart } = useCartStore();
  const [selectedAddress, setSelectedAddress] = useState<string>(MOCK_ADDRESSES[0].id);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedAddress || loading) return;
    setLoading(true);
    // Simulação de chamada à API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    clearCart();
    setLoading(false);
    Alert.alert('Pedido confirmado! 🎉', 'Seu pedido foi enviado ao restaurante.', [
      { text: 'Ver pedidos', onPress: () => router.replace('/(tabs)/orders') },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(ci) => ci.item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Endereço */}
            <Text style={styles.sectionTitle}>📍 Endereço de entrega</Text>
            {MOCK_ADDRESSES.map((addr) => (
              <Pressable
                key={addr.id}
                style={[styles.addressCard, selectedAddress === addr.id && styles.addressCardSelected]}
                onPress={() => setSelectedAddress(addr.id)}
              >
                <View style={styles.addressCheck}>
                  {selectedAddress === addr.id && <View style={styles.addressCheckInner} />}
                </View>
                <View>
                  <Text style={styles.addressLabel}>{addr.label}</Text>
                  <Text style={styles.addressDetail}>
                    {addr.street}, {addr.number}
                    {addr.complement ? ` - ${addr.complement}` : ''}
                  </Text>
                  <Text style={styles.addressDetail}>
                    {addr.neighborhood}, {addr.city} - {addr.state}
                  </Text>
                </View>
              </Pressable>
            ))}

            <Text style={styles.sectionTitle}>🛒 Resumo do pedido</Text>
            {restaurant && (
              <Text style={styles.restaurantLabel}>📍 {restaurant.name}</Text>
            )}
          </>
        }
        renderItem={({ item: ci }) => (
          <View style={styles.orderItem}>
            <Text style={styles.orderQty}>{ci.quantity}x</Text>
            <Text style={styles.orderName} numberOfLines={1}>{ci.item.name}</Text>
            <Text style={styles.orderPrice}>R$ {(ci.item.price * ci.quantity).toFixed(2)}</Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>R$ {subtotal().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Entrega</Text>
              <Text style={[styles.summaryValue, restaurant?.deliveryFee === 0 && styles.free]}>
                {restaurant?.deliveryFee === 0 ? 'Grátis' : `R$ ${restaurant?.deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>R$ {total().toFixed(2)}</Text>
            </View>

            <Pressable
              style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirmar pedido</Text>
              )}
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: Spacing.md, paddingBottom: 40 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 12,
    ...Shadow.sm,
  },
  addressCardSelected: { borderColor: Colors.primary },
  addressCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  addressCheckInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  addressLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  addressDetail: { fontSize: FontSize.xs, color: Colors.textSecondary },
  restaurantLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  orderQty: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary, width: 28 },
  orderName: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  orderPrice: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    ...Shadow.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: Colors.textSecondary, fontSize: FontSize.sm },
  summaryValue: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  free: { color: Colors.success },
  totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight, marginBottom: Spacing.md },
  totalLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
});
