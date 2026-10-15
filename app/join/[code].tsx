import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { dbService } from '../../src/services';
import { useAuth } from '../../src/context/AuthContext';
import type { Group, Quest } from '../../src/types';
import { COLORS, RADIUS, SHADOW } from '../../src/theme';

export default function JoinScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [status, setStatus] = useState<'loading' | 'found' | 'notfound' | 'joined' | 'error'>('loading');
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    if (!code) return;
    dbService.getGroupByInviteCode(code).then(async (g) => {
      if (!g) {
        setStatus('notfound');
        return;
      }
      setGroup(g);
      const q = await dbService.getQuestById(g.questId);
      setQuest(q);

      if (user) {
        const members = await dbService.getGroupMembers(g.id);
        setAlreadyMember(members.some((m) => m.userId === user.id));
      }
      setStatus('found');
    });
  }, [code, user]);

  const handleJoin = async () => {
    if (!group || !user) return;
    try {
      await dbService.joinGroup(group.id, user.id);
      setStatus('joined');
      setTimeout(() => router.replace('/(app)/map'), 2000);
    } catch {
      setStatus('error');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.title}>Нужна авторизация</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/login')}>
          <Text style={styles.btnText}>Войти</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.subtitle}>Загрузка группы...</Text>
      </View>
    );
  }

  if (status === 'notfound') {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>❌</Text>
        <Text style={styles.title}>Группа не найдена</Text>
        <Text style={styles.subtitle}>Проверьте ссылку-приглашение</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(app)/map')}>
          <Text style={styles.btnText}>На карту</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'joined') {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Вы вступили в группу!</Text>
        <Text style={styles.subtitle}>{group?.name}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👥</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Приглашение в группу</Text>
        <Text style={styles.groupName}>{group?.name}</Text>
        <Text style={styles.questName}>📋 {quest?.title}</Text>
        <Text style={styles.questDesc}>{quest?.description}</Text>
      </View>

      {alreadyMember ? (
        <View style={styles.alreadyBox}>
          <Text style={styles.alreadyText}>✓ Вы уже участник этой группы</Text>
          <TouchableOpacity onPress={() => router.replace('/(app)/map')}>
            <Text style={styles.goMapText}>На карту →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
          <Text style={styles.joinBtnText}>Вступить в группу</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 6, textAlign: 'center' },
  card: {
    width: '100%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: 20,
    ...SHADOW.md,
    marginTop: 16,
    marginBottom: 20,
  },
  cardLabel: { fontSize: 11, color: COLORS.primary, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  groupName: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  questName: { fontSize: 14, fontWeight: '600', color: COLORS.primaryDark, marginBottom: 6 },
  questDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  joinBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: 16,
    alignItems: 'center',
  },
  joinBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  alreadyBox: { alignItems: 'center', gap: 8 },
  alreadyText: { fontSize: 15, color: COLORS.success, fontWeight: '600' },
  goMapText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  btn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  btnText: { color: COLORS.white, fontWeight: '700' },
});
