import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/theme';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (!user || user.role !== 'admin') return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primaryDark },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: '⚙️ Администрирование' }} />
      <Stack.Screen name="quests" options={{ title: 'Управление квестами' }} />
      <Stack.Screen name="objects" options={{ title: 'Объекты природы' }} />
      <Stack.Screen name="users" options={{ title: 'Пользователи' }} />
    </Stack>
  );
}
