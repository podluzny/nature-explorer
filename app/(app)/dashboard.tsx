import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { dbService } from '../../src/services';
import { useAuth } from '../../src/context/AuthContext';
import type { Group, Quest, LeaderboardEntry } from '../../src/types';
import { COLORS, RADIUS, SHADOW } from '../../src/theme';
import { realtimeService } from '../../src/services';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const loadGroups = useCallback(async () => {
    if (!user) return;
    const gs = await dbService.getGroupsByTeacher(user.id);
    setGroups(gs);
  }, [user]);

  useEffect(() => {
    loadGroups();
    dbService.getQuests().then(setQuests);
  }, [loadGroups]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👥 Мои группы</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.createBtnText}>+ Создать</Text>
        </TouchableOpacity>
      </View>

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>Нет групп</Text>
          <Text style={styles.emptySub}>Создайте группу и поделитесь ссылкой с учениками</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(g) => g.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              quest={quests.find((q) => q.id === item.questId)}
              onPress={() => setSelectedGroup(item)}
            />
          )}
        />
      )}

      {/* Create group modal */}
      <CreateGroupModal
        visible={showCreate}
        quests={quests}
        teacherId={user?.id ?? ''}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);
          loadGroups();
        }}
      />

      {/* Group detail modal */}
      {selectedGroup && (
        <GroupDetailModal
          group={selectedGroup}
          quest={quests.find((q) => q.id === selectedGroup.questId)}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </SafeAreaView>
  );
}

function GroupCard({
  group,
  quest,
  onPress,
}: {
  group: Group;
  quest?: Quest;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.groupCard} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupQuest}>📋 {quest?.title ?? 'Квест не найден'}</Text>
        {group.activeUntil && (
          <Text style={styles.groupExpiry}>
            До {new Date(group.activeUntil).toLocaleDateString('ru-RU')}
          </Text>
        )}
      </View>
      <Text style={styles.groupArrow}>→</Text>
    </TouchableOpacity>
  );
}

function CreateGroupModal({
  visible,
  quests,
  teacherId,
  onClose,
  onCreated,
}: {
  visible: boolean;
  quests: Quest[];
  teacherId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [questId, setQuestId] = useState(quests[0]?.id ?? '');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !questId) return;
    setLoading(true);
    try {
      await dbService.createGroup({ name: name.trim(), questId, teacherId });
      setName('');
      onCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Создать группу</Text>

          <Text style={styles.fieldLabel}>Название группы</Text>
          <TextInput
            style={styles.input}
            placeholder="например: 5А класс"
            value={name}
            onChangeText={setName}
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.fieldLabel}>Квест</Text>
          <View style={styles.questSelector}>
            {quests.map((q) => (
              <TouchableOpacity
                key={q.id}
                style={[styles.questOption, questId === q.id && styles.questOptionActive]}
                onPress={() => setQuestId(q.id)}
              >
                <Text
                  style={[styles.questOptionText, questId === q.id && styles.questOptionTextActive]}
                >
                  {q.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, (!name.trim() || loading) && styles.confirmBtnDisabled]}
              onPress={handleCreate}
              disabled={!name.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>Создать</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function GroupDetailModal({
  group,
  quest,
  onClose,
}: {
  group: Group;
  quest?: Quest;
  onClose: () => void;
}) {
  const [members, setMembers] = useState<{ userId: string; user?: { displayName: string; avatarUrl?: string } }[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tab, setTab] = useState<'members' | 'leaderboard'>('leaderboard');
  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://app.com'}/join/${group.inviteCode}`;

  useEffect(() => {
    dbService.getGroupMembers(group.id).then(setMembers);
    const unsub = realtimeService.subscribeToLeaderboard(group.id, setLeaderboard);
    return unsub;
  }, [group.id]);

  const copyInvite = () => {
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
    }
    Alert.alert('Скопировано!', inviteUrl);
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
            <Text style={{ color: COLORS.textMuted }}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>{group.name}</Text>
          <Text style={styles.modalSubtitle}>📋 {quest?.title}</Text>

          {/* Invite link */}
          <TouchableOpacity style={styles.inviteBox} onPress={copyInvite}>
            <View>
              <Text style={styles.inviteLabel}>Ссылка-приглашение</Text>
              <Text style={styles.inviteCode}>{group.inviteCode}</Text>
            </View>
            <Text style={styles.copyIcon}>📋</Text>
          </TouchableOpacity>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, tab === 'leaderboard' && styles.tabActive]}
              onPress={() => setTab('leaderboard')}
            >
              <Text style={[styles.tabText, tab === 'leaderboard' && styles.tabTextActive]}>
                🏆 Рейтинг
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'members' && styles.tabActive]}
              onPress={() => setTab('members')}
            >
              <Text style={[styles.tabText, tab === 'members' && styles.tabTextActive]}>
                👥 Участники ({members.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {tab === 'leaderboard' ? (
              leaderboard.length === 0 ? (
                <Text style={styles.emptyText}>Пока нет достижений в группе</Text>
              ) : (
                leaderboard.map((entry, i) => (
                  <View key={entry.userId} style={styles.leaderRow}>
                    <Text style={styles.leaderRank}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                    </Text>
                    <Text style={styles.leaderName}>{entry.displayName}</Text>
                    <Text style={styles.leaderCount}>{entry.count} ✓</Text>
                  </View>
                ))
              )
            ) : (
              members.map((m) => (
                <View key={m.userId} style={styles.memberRow}>
                  <Text style={styles.memberName}>{m.user?.displayName ?? m.userId}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.primaryDark },
  createBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  createBtnText: { color: COLORS.white, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 6 },
  list: { padding: 16, gap: 10 },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    ...SHADOW.sm,
  },
  groupName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  groupQuest: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  groupExpiry: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
  groupArrow: { fontSize: 18, color: COLORS.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 16 },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 14,
    backgroundColor: COLORS.bg,
  },
  questSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  questOption: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  questOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  questOptionText: { fontSize: 13, color: COLORS.textMuted },
  questOptionTextActive: { color: COLORS.white, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.textMuted, fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { color: COLORS.white, fontWeight: '700' },
  inviteBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 14,
  },
  inviteLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  inviteCode: { fontSize: 18, fontWeight: '800', color: COLORS.primaryDark, letterSpacing: 2 },
  copyIcon: { fontSize: 20 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  tabTextActive: { color: COLORS.white },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  leaderRank: { fontSize: 20, width: 36, textAlign: 'center' },
  leaderName: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text },
  leaderCount: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  memberRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  memberName: { fontSize: 14, color: COLORS.text },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, padding: 20 },
});
