import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { dbService } from '../../src/services';
import { useAuth } from '../../src/context/AuthContext';
import type { Quest } from '../../src/types';
import { COLORS, RADIUS, SHADOW } from '../../src/theme';

export default function AdminQuestsScreen() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editQuest, setEditQuest] = useState<Quest | null>(null);

  const load = useCallback(() => dbService.getQuests().then(setQuests), []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    const ok = Platform.OS === 'web'
      ? window.confirm('Удалить квест?')
      : await new Promise<boolean>((res) =>
          Alert.alert('Удалить', 'Удалить квест?', [
            { text: 'Отмена', onPress: () => res(false) },
            { text: 'Удалить', style: 'destructive', onPress: () => res(true) },
          ])
        );
    if (ok) {
      await dbService.deleteQuest(id);
      load();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => { setEditQuest(null); setShowModal(true); }}
      >
        <Text style={styles.addBtnText}>+ Новый квест</Text>
      </TouchableOpacity>

      <FlatList
        data={quests}
        keyExtractor={(q) => q.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.description}</Text>
              <Text style={styles.cardCount}>{item.objectCount} объектов</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => { setEditQuest(item); setShowModal(true); }}
              >
                <Text style={styles.editBtnText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <QuestModal
        visible={showModal}
        quest={editQuest}
        userId={user?.id ?? ''}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); load(); }}
      />
    </View>
  );
}

function QuestModal({
  visible,
  quest,
  userId,
  onClose,
  onSaved,
}: {
  visible: boolean;
  quest: Quest | null;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(quest?.title ?? '');
    setDescription(quest?.description ?? '');
  }, [quest]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      if (quest) {
        await dbService.updateQuest(quest.id, { title, description });
      } else {
        await dbService.createQuest({ title, description, createdBy: userId });
      }
      onSaved();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{quest ? 'Редактировать квест' : 'Новый квест'}</Text>

          <Text style={styles.label}>Название *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Название квеста"
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.label}>Описание</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Краткое описание"
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!title.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Сохранить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  addBtn: {
    margin: 16,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: 14,
    alignItems: 'center',
  },
  addBtnText: { color: COLORS.white, fontWeight: '700' },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 14,
    ...SHADOW.sm,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  cardCount: { fontSize: 11, color: COLORS.primary, marginTop: 4 },
  cardActions: { gap: 6, justifyContent: 'center' },
  editBtn: { padding: 6 },
  editBtnText: { fontSize: 16 },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    backgroundColor: COLORS.bg,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.textMuted },
  saveBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: 12, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: COLORS.white, fontWeight: '700' },
});
