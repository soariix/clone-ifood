import { MOCK_ORDERS } from '@/constants/mockData';
import { BorderRadius, Colors, FontSize, Shadow, Spacing } from '@/constants/theme';
import { Order, OrderStatus } from '@/types';
import { router } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const STATUS_LABEL: Record<OrderStatus, { label: string; color: string; emoji: string }> = {
  pending: { label: 'Aguardando', color: Colors.warning, emoji: '⏳' },
  confirmed: { label: 'Confirmado', color: Colors.info, emoji: '✅' },
  preparing: { label: 'Preparando', color: Colors.secondary, emoji: '👨‍🍳' },
  on_the_way: { label: 'A caminho', color: Colors.primary, emoji: '🛵' },
  delivered: { label: 'Entregue', color: Colors.success, emoji: '🎉' },
  cancelled: { label: 'Cancelado', color: Colors.error, emoji: '❌' },
};

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_LABEL[order.status];
  const date = new Date(order.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const itemsSummary = order.items
    .map((ci) => `${ci.quantity}x ${ci.item.name}`)
    .join(', ');

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/order/${order.id}`)}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: order.restaurantLogo }} style={styles.logo} />
        <View style={styles.cardInfo}>
          <Text style={styles.restaurantName}>{order.restaurantName}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: status.color }]}>
          <Text style={styles.statusEmoji}>{status.emoji}</Text>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <Text style={styles.items} numberOfLines={2}>{itemsSummary}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.total}>R$ {order.total.toFixed(2)}</Text>
        {order.status === 'delivered' && (
          <Pressable style={styles.reorderBtn} onPress={() => router.push(`/reorder/${order.id}`)}>
            <Text style={styles.reorderText}>Pedir novamente</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Pedidos</Text>
      </View>

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>Nenhum pedido ainda</Text>
            <Text style={styles.emptySubtitle}>Seus pedidos aparecerão aqui</Text>
            <Pressable style={styles.orderNowBtn} onPress={() => router.push('/(tabs)')}>
              <Text style={styles.orderNowText}>Pedir agora</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  list: { padding: Spacing.md, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  logo: { width: 44, height: 44, borderRadius: BorderRadius.sm, marginRight: Spacing.sm },
  cardInfo: { flex: 1 },
  restaurantName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  date: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  statusEmoji: { fontSize: 12 },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  items: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 10, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  total: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  reorderBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  reorderText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 24 },
  orderNowBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
  },
  orderNowText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
});
