import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { MOCK_USERS } from '../src/mocks/mockData';
import { COLORS, RADIUS, SHADOW } from '../src/theme';

const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS !== 'false';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const router = useRouter();

  const handleLogin = async (userId: string) => {
    await signIn(userId);
    // Redirect handled by index.tsx via auth state change
    router.replace('/');
  };

  const roleLabel = (role: string) => {
    if (role === 'admin') return '👑 Администратор';
    if (role === 'teacher') return '📚 Учитель';
    return '🎒 Ученик';
  };

  const roleColor = (role: string) => {
    if (role === 'admin') return '#7C3AED';
    if (role === 'teacher') return COLORS.primary;
    return COLORS.primaryLight;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🌿</Text>
        <Text style={styles.title}>Nature Explorer</Text>
        <Text style={styles.subtitle}>Исследуй природу вокруг тебя</Text>
      </View>

      <View style={styles.card}>
        {USE_MOCKS ? (
          <>
            <Text style={styles.devLabel}>🧪 Режим разработки — выбери пользователя</Text>
            {MOCK_USERS.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[styles.userBtn, { borderLeftColor: roleColor(user.role) }]}
                onPress={() => handleLogin(user.id)}
                disabled={isLoading}
              >
                <View>
                  <Text style={[styles.userBtnRole, { color: roleColor(user.role) }]}>
                    {roleLabel(user.role)}
                  </Text>
                  <Text style={styles.userBtnName}>{user.displayName}</Text>
                  <Text style={styles.userBtnEmail}>{user.email}</Text>
                </View>
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.arrow}>→</Text>
                )}
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => handleLogin('google')}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.googleBtnText}>Войти через Google</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.footer}>
        Образовательный проект для изучения природы родного края
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.bg,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 20,
    gap: 12,
    ...SHADOW.md,
  },
  devLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
    textAlign: 'center',
  },
  userBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg,
    borderLeftWidth: 4,
  },
  userBtnRole: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  userBtnName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  userBtnEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  googleBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
  },
  googleBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 24,
    lineHeight: 18,
  },
});
