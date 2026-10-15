import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { dbService } from '../../src/services';
import { useAuth } from '../../src/context/AuthContext';
import { useAchievements } from '../../src/hooks/useAchievements';
import type { Quest } from '../../src/types';
import { COLORS, RADIUS, SHADOW } from '../../src/theme';

export default function QuestsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbService.getQuests().then((q) => {
      setQuests(q);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Квесты</Text>
        <Text style={styles.subtitle}>Выбери маршрут для исследования</Text>
      </View>

      <FlatList
        data={quests}
        keyExtractor={(q) => q.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <QuestCard quest={item} userId={user?.id} index={index} />
        )}
      />
    </SafeAreaView>
  );
}

function QuestCard({
  quest,
  userId,
  index,
}: {
  quest: Quest;
  userId?: string;
  index: number;
}) {
  const { achievements } = useAchievements(userId, quest.id);
  const total = quest.objectCount ?? 0;
  const done = achievements.length;
  const progress = total > 0 ? done / total : 0;
  const emojis = ['🌳', '🦆', '🦋', '🌸'];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardEmoji}>{emojis[index % emojis.length]}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{quest.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {quest.description}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={{ flex: 1 }}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {done} / {total} объектов
            </Text>
            {done === total && total > 0 && (
              <Text style={styles.completedBadge}>🎉 Пройден!</Text>
            )}
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` as any }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.primaryDark },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    ...SHADOW.sm,
  },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardEmoji: { fontSize: 32 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: 12, color: COLORS.textMuted },
  completedBadge: { fontSize: 12, color: COLORS.success },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
});
