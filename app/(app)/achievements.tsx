import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useAchievements } from '../../src/hooks/useAchievements';
import { dbService } from '../../src/services';
import type { Quest } from '../../src/types';
import { COLORS, RADIUS, SHADOW } from '../../src/theme';
import { ObjectCard } from '../../src/components/ObjectCard';
import type { NatureObject } from '../../src/types';

export default function AchievementsScreen() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeQuestId, setActiveQuestId] = useState<string>('quest-1');
  const [totalObjects, setTotalObjects] = useState(0);
  const [selectedObject, setSelectedObject] = useState<NatureObject | null>(null);

  const { achievements, isLoading } = useAchievements(user?.id, activeQuestId);

  useEffect(() => {
    dbService.getQuests().then(setQuests);
  }, []);

  useEffect(() => {
    dbService.getObjectsByQuest(activeQuestId).then((objs) => setTotalObjects(objs.length));
  }, [activeQuestId]);

  const progress = totalObjects > 0 ? achievements.length / totalObjects : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Достижения</Text>
        <Text style={styles.headerSub}>{user?.displayName}</Text>
      </View>

      {/* Quest tabs */}
      <View style={styles.tabs}>
        {quests.map((q) => (
          <TouchableOpacity
            key={q.id}
            style={[styles.tab, activeQuestId === q.id && styles.tabActive]}
            onPress={() => setActiveQuestId(q.id)}
          >
            <Text style={[styles.tabText, activeQuestId === q.id && styles.tabTextActive]}>
              {q.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress bar */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Прогресс квеста</Text>
          <Text style={styles.progressCount}>
            {achievements.length} / {totalObjects}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` as any }]} />
        </View>
        {achievements.length === totalObjects && totalObjects > 0 && (
          <Text style={styles.completedText}>🎉 Квест пройден!</Text>
        )}
      </View>

      {/* Achievements list */}
      {achievements.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🗺️</Text>
          <Text style={styles.emptyTitle}>Пока нет достижений</Text>
          <Text style={styles.emptySub}>
            Иди на карту и найди объекты квеста!
          </Text>
        </View>
      ) : (
        <FlatList
          data={achievements}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.achievementCard}
              onPress={() => item.object && setSelectedObject(item.object)}
            >
              {item.object?.photos?.[0] && (
                <Image
                  source={{ uri: item.object.photos[0].url }}
                  style={styles.achievementPhoto}
                />
              )}
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementCategory}>{item.object?.category}</Text>
                <Text style={styles.achievementTitle}>{item.object?.title}</Text>
                <Text style={styles.achievementDate}>
                  {new Date(item.achievedAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.checkmark}>✓</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Object detail modal */}
      <Modal
        visible={!!selectedObject}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedObject(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setSelectedObject(null)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            {selectedObject && (
              <ObjectCard object={selectedObject} isAchieved />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.primaryDark },
  headerSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  tabTextActive: { color: COLORS.white },
  progressCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
    ...SHADOW.sm,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 13, color: COLORS.textMuted },
  progressCount: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  completedText: { marginTop: 10, textAlign: 'center', fontSize: 14, color: COLORS.success, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  list: { padding: 16, gap: 10 },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  achievementPhoto: { width: 80, height: 80 },
  achievementInfo: { flex: 1, padding: 12 },
  achievementCategory: { fontSize: 10, color: COLORS.primary, fontWeight: '700', textTransform: 'uppercase' },
  achievementTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  achievementDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  checkmark: { fontSize: 20, color: COLORS.success, paddingRight: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '700' },
});
