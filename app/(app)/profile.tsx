import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../src/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    const confirm =
      Platform.OS === 'web'
        ? window.confirm('Выйти из аккаунта?')
        : await new Promise<boolean>((resolve) => {
            Alert.alert('Выход', 'Выйти из аккаунта?', [
              { text: 'Отмена', onPress: () => resolve(false) },
              { text: 'Выйти', onPress: () => resolve(true) },
            ]);
          });
    if (confirm) {
      await signOut();
      router.replace('/login');
    }
  };

  const roleLabel = () => {
    if (user?.role === 'admin') return '👑 Администратор';
    if (user?.role === 'teacher') return '📚 Учитель';
    return '🎒 Ученик';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Профиль</Text>
      </View>

      <View style={styles.profileCard}>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        )}
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleLabel()}</Text>
        </View>
      </View>

      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() => router.push('/admin')}
        >
          <Text style={styles.adminBtnText}>⚙️ Открыть панель администратора</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Выйти из аккаунта</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.primaryDark },
  profileCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: 24,
    alignItems: 'center',
    ...SHADOW.md,
    marginBottom: 16,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: { fontSize: 36 },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  roleBadge: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 10,
  },
  roleText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  adminBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  adminBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  signOutBtn: {
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
  },
  signOutText: { color: COLORS.danger, fontWeight: '600' },
});
