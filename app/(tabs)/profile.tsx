import { BorderRadius, Colors, FontSize, Shadow, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function ProfileMenuItem({ icon, label, onPress, danger }: MenuItem) {
  return (
    <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && styles.danger]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sair', 'Deseja mesmo sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Usuário'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        <View style={styles.card}>
          <ProfileMenuItem icon="👤" label="Dados pessoais" onPress={() => {}} />
          <ProfileMenuItem icon="📍" label="Meus endereços" onPress={() => {}} />
          <ProfileMenuItem icon="💳" label="Formas de pagamento" onPress={() => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        <View style={styles.card}>
          <ProfileMenuItem icon="🔔" label="Notificações" onPress={() => {}} />
          <ProfileMenuItem icon="🔒" label="Privacidade" onPress={() => {}} />
          <ProfileMenuItem icon="❓" label="Ajuda e suporte" onPress={() => {}} />
          <ProfileMenuItem icon="⭐" label="Avaliar o app" onPress={() => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.card}>
          <ProfileMenuItem icon="🚪" label="Sair" onPress={handleSignOut} danger />
        </View>
      </View>

      <Text style={styles.version}>iFood Clone v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 100 },
  avatarSection: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  initials: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff' },
  name: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary },
  section: { marginTop: Spacing.md, paddingHorizontal: Spacing.md },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, ...Shadow.sm, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  pressed: { backgroundColor: Colors.surfaceSecondary },
  menuIcon: { fontSize: 20, width: 28 },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  danger: { color: Colors.error },
  chevron: { fontSize: 20, color: Colors.textLight },
  version: { textAlign: 'center', color: Colors.textLight, fontSize: FontSize.xs, marginTop: Spacing.xl },
});
