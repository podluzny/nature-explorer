import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { dbService } from '../../src/services';
import type { NatureObject, Quest } from '../../src/types';
import { COLORS, RADIUS, SHADOW } from '../../src/theme';
import { MapPicker } from '../../src/components/MapPicker';

export default function AdminObjectsScreen() {
  const [objects, setObjects] = useState<NatureObject[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [filterQuestId, setFilterQuestId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editObject, setEditObject] = useState<NatureObject | null>(null);

  const load = useCallback(async () => {
    const [qs, allObjects] = await Promise.all([
      dbService.getQuests(),
      ...(filterQuestId ? [dbService.getObjectsByQuest(filterQuestId)] : [Promise.resolve([] as NatureObject[])]),
    ]);
    setQuests(qs);
    if (!filterQuestId && qs[0]) {
      setFilterQuestId(qs[0].id);
    }
  }, [filterQuestId]);

  const loadObjects = useCallback(async () => {
    if (!filterQuestId) return;
    const objs = await dbService.getObjectsByQuest(filterQuestId);
    setObjects(objs);
  }, [filterQuestId]);

  useEffect(() => { load(); }, []);
  useEffect(() => { loadObjects(); }, [loadObjects]);

  const handleDelete = async (id: string) => {
    const ok = Platform.OS === 'web'
      ? window.confirm('Удалить объект?')
      : await new Promise<boolean>((res) =>
          Alert.alert('Удалить', 'Удалить объект?', [
            { text: 'Отмена', onPress: () => res(false) },
            { text: 'Удалить', style: 'destructive', onPress: () => res(true) },
          ])
        );
    if (ok) {
      await dbService.deleteObject(id);
      loadObjects();
    }
  };

  return (
    <View style={styles.container}>
      {/* Quest filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questFilter}>
        {quests.map((q) => (
          <TouchableOpacity
            key={q.id}
            style={[styles.questTab, filterQuestId === q.id && styles.questTabActive]}
            onPress={() => setFilterQuestId(q.id)}
          >
            <Text style={[styles.questTabText, filterQuestId === q.id && styles.questTabTextActive]}>
              {q.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => { setEditObject(null); setShowModal(true); }}
      >
        <Text style={styles.addBtnText}>+ Добавить объект</Text>
      </TouchableOpacity>

      <FlatList
        data={objects}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardCategory}>{item.category}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardCoords}>
                📍 {item.lat.toFixed(4)}, {item.lng.toFixed(4)} • r={item.radiusMeters}m
              </Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => { setEditObject(item); setShowModal(true); }}>
                <Text style={{ fontSize: 18 }}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={{ fontSize: 18 }}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <ObjectModal
        visible={showModal}
        object={editObject}
        questId={filterQuestId}
        quests={quests}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); loadObjects(); }}
      />
    </View>
  );
}

function ObjectModal({
  visible,
  object,
  questId,
  quests,
  onClose,
  onSaved,
}: {
  visible: boolean;
  object: NatureObject | null;
  questId: string;
  quests: Quest[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [richDesc, setRichDesc] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [lat, setLat] = useState('55.7307');
  const [lng, setLng] = useState('37.5997');
  const [radius, setRadius] = useState('15');
  const [selectedQuestId, setSelectedQuestId] = useState(questId);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (object) {
      setTitle(object.title);
      setCategory(object.category);
      setShortDesc(object.shortDescription);
      setRichDesc(object.richDescription);
      setVideoUrl(object.videoUrl ?? '');
      setLat(object.lat.toString());
      setLng(object.lng.toString());
      setRadius(object.radiusMeters.toString());
      setSelectedQuestId(object.questId);
    } else {
      setTitle(''); setCategory(''); setShortDesc(''); setRichDesc('');
      setVideoUrl(''); setLat('55.7307'); setLng('37.5997'); setRadius('15');
      setSelectedQuestId(questId);
    }
  }, [object, questId, visible]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const data = {
        title,
        category,
        shortDescription: shortDesc,
        richDescription: richDesc,
        videoUrl: videoUrl || undefined,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radiusMeters: parseFloat(radius) || 15,
        questId: selectedQuestId,
      };
      if (object) {
        await dbService.updateObject(object.id, data);
      } else {
        await dbService.createObject(data);
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>
              {object ? 'Редактировать объект' : 'Новый объект природы'}
            </Text>

            <Text style={styles.label}>Квест *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {quests.map((q) => (
                <TouchableOpacity
                  key={q.id}
                  style={[styles.questOpt, selectedQuestId === q.id && styles.questOptActive]}
                  onPress={() => setSelectedQuestId(q.id)}
                >
                  <Text style={[styles.questOptText, selectedQuestId === q.id && styles.questOptTextActive]}>
                    {q.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Название *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor={COLORS.textLight} placeholder="Название объекта" />

            <Text style={styles.label}>Категория</Text>
            <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Дерево / Птица / Растение" placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Краткое описание</Text>
            <TextInput style={[styles.input, styles.textarea]} value={shortDesc} onChangeText={setShortDesc} multiline numberOfLines={2} placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Расширенное описание (HTML)</Text>
            <TextInput style={[styles.input, styles.textareaLg]} value={richDesc} onChangeText={setRichDesc} multiline placeholderTextColor={COLORS.textLight} placeholder="<p>Описание...</p>" />

            <Text style={styles.label}>Ссылка на видео</Text>
            <TextInput style={styles.input} value={videoUrl} onChangeText={setVideoUrl} placeholder="https://youtube.com/..." placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Координаты</Text>
            <View style={styles.coordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={lat}
                onChangeText={setLat}
                placeholder="Широта"
                placeholderTextColor={COLORS.textLight}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={lng}
                onChangeText={setLng}
                placeholder="Долгота"
                placeholderTextColor={COLORS.textLight}
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity style={styles.mapPickBtn} onPress={() => setShowMapPicker(true)}>
              <Text style={styles.mapPickBtnText}>🗺️ Выбрать на карте</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Радиус обнаружения (метры)</Text>
            <TextInput style={styles.input} value={radius} onChangeText={setRadius} keyboardType="number-pad" placeholderTextColor={COLORS.textLight} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!title.trim() || loading}
              >
                {loading ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.saveBtnText}>Сохранить</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Map picker for coordinates */}
      {showMapPicker && (
        <MapPicker
          initialLat={parseFloat(lat)}
          initialLng={parseFloat(lng)}
          onConfirm={(newLat, newLng) => {
            setLat(newLat.toFixed(6));
            setLng(newLng.toFixed(6));
            setShowMapPicker(false);
          }}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  questFilter: { padding: 12, paddingBottom: 0 },
  questTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
    marginRight: 8,
  },
  questTabActive: { backgroundColor: COLORS.primary },
  questTabText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  questTabTextActive: { color: COLORS.white },
  addBtn: {
    margin: 12,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: 12,
    alignItems: 'center',
  },
  addBtnText: { color: COLORS.white, fontWeight: '700' },
  list: { paddingHorizontal: 12, gap: 8, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 12,
    ...SHADOW.sm,
  },
  cardCategory: { fontSize: 10, color: COLORS.primary, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  cardCoords: { fontSize: 11, color: COLORS.textMuted, marginTop: 3 },
  cardActions: { gap: 8, justifyContent: 'center', paddingLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 11,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    backgroundColor: COLORS.bg,
  },
  textarea: { height: 60, textAlignVertical: 'top' },
  textareaLg: { height: 100, textAlignVertical: 'top' },
  coordRow: { flexDirection: 'row', gap: 8 },
  mapPickBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  mapPickBtnText: { color: COLORS.primary, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
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
  questOpt: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
    marginRight: 8,
  },
  questOptActive: { backgroundColor: COLORS.primary },
  questOptText: { fontSize: 12, color: COLORS.textMuted },
  questOptTextActive: { color: COLORS.white, fontWeight: '600' },
});
