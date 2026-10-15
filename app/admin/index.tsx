import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../src/theme';

const MENU = [
  { icon: '📋', label: 'Квесты', sub: 'Управление квестами', route: '/admin/quests' },
  { icon: '🌿', label: 'Объекты природы', sub: 'Точки на карте', route: '/admin/objects' },
  { icon: '👥', label: 'Пользователи', sub: 'Роли и аккаунты', route: '/admin/users' },
];

export default function AdminIndex() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeEmoji}>👑</Text>
        <View>
          <Text style={styles.welcomeTitle}>Панель администратора</Text>
          <Text style={styles.welcomeSub}>{user?.displayName}</Text>
        </View>
      </View>

      {MENU.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.menuCard}
          onPress={() => router.push(item.route as any)}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuSub}>{item.sub}</Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.appBtn}
        onPress={() => router.replace('/(app)/map')}
      >
        <Text style={styles.appBtnText}>🗺️ Открыть приложение</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutBtn} onPress={() => {
        signOut();
        router.replace('/login');
      }}>
        <Text style={styles.signOutText}>Выйти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, gap: 12 },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 4,
  },
  welcomeEmoji: { fontSize: 32 },
  welcomeTitle: { fontSize: 17, fontWeight: '700', color: COLORS.white },
  welcomeSub: { fontSize: 13, color: COLORS.primaryLight },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    ...SHADOW.sm,
  },
  menuIcon: { fontSize: 28 },
  menuLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  menuSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  menuArrow: { fontSize: 18, color: COLORS.textMuted },
  appBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  appBtnText: { color: COLORS.white, fontWeight: '700' },
  signOutBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
  },
  signOutText: { color: COLORS.textMuted },
});
