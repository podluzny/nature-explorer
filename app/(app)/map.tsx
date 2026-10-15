import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../../src/context/AuthContext';
import { dbService } from '../../src/services';
import { useAchievements } from '../../src/hooks/useAchievements';
import { isWithinRadius } from '../../src/utils/geo';
import type { NatureObject, Quest } from '../../src/types';
import { COLORS, RADIUS, SHADOW } from '../../src/theme';
import { ObjectCard } from '../../src/components/ObjectCard';
import { MapView } from '../../src/components/MapView';

const IS_DEV = process.env.EXPO_PUBLIC_USE_MOCKS !== 'false';

// Default centre for demo (Gorky Park, Moscow)
const DEFAULT_CENTER = { lat: 55.7307, lng: 37.5997 };

export default function MapScreen() {
  const { user } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [objects, setObjects] = useState<NatureObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<NatureObject | null>(null);
  const [activeQuestId, setActiveQuestId] = useState<string>('quest-1');
  const [nearbyObject, setNearbyObject] = useState<NatureObject | null>(null);
  const [markLoading, setMarkLoading] = useState(false);
  const [simMode, setSimMode] = useState(false);

  const { achievements, markAchievement, hasAchievement, reload } = useAchievements(
    user?.id,
    activeQuestId
  );

  // Load objects for active quest
  useEffect(() => {
    dbService.getObjectsByQuest(activeQuestId).then(setObjects);
  }, [activeQuestId]);

  // Request location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Геолокация не разрешена. Включите в настройках браузера.');
        setLocation({ ...DEFAULT_CENTER, accuracy: 10 });
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          accuracy: loc.coords.accuracy ?? 10,
        });
      } catch {
        setLocationError('Не удалось определить местоположение. Используется центр карты.');
        setLocation({ ...DEFAULT_CENTER, accuracy: 10 });
      }
    })();
  }, []);

  // Check proximity whenever location or objects change
  useEffect(() => {
    if (!location) return;
    const nearby = objects.find(
      (obj) =>
        !hasAchievement(obj.id) &&
        isWithinRadius(location.lat, location.lng, obj.lat, obj.lng, obj.radiusMeters, location.accuracy)
    );
    setNearbyObject(nearby ?? null);
  }, [location, objects, achievements]);

  const handleMark = useCallback(async () => {
    if (!nearbyObject || !user) return;
    setMarkLoading(true);
    try {
      await markAchievement(nearbyObject.id);
      setNearbyObject(null);
    } finally {
      setMarkLoading(false);
    }
  }, [nearbyObject, user, markAchievement]);

  // Dev: simulate position at a specific object
  const simulateAt = useCallback((obj: NatureObject) => {
    setLocation({ lat: obj.lat, lng: obj.lng, accuracy: 5 });
    setSimMode(true);
  }, []);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        center={location ?? DEFAULT_CENTER}
        objects={objects}
        userLocation={location}
        achievedObjectIds={achievements.map((a) => a.objectId)}
        onObjectPress={(obj) => setSelectedObject(obj)}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.questLabel}>🌿 {activeQuestId === 'quest-1' ? 'Деревья парка' : 'Птицы у реки'}</Text>
        <Text style={styles.progressLabel}>
          {achievements.length}/{objects.length}
        </Text>
      </View>

      {/* Location error banner */}
      {locationError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>📍 {locationError}</Text>
        </View>
      )}

      {/* Sim mode banner */}
      {simMode && (
        <View style={styles.simBanner}>
          <Text style={styles.simText}>🧪 Симуляция позиции активна</Text>
          <TouchableOpacity
            onPress={() => {
              setSimMode(false);
              setLocation(null);
            }}
          >
            <Text style={styles.simClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Nearby object — Mark button */}
      {nearbyObject && (
        <View style={styles.nearbyBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nearbyTitle}>Вы рядом с объектом!</Text>
            <Text style={styles.nearbyName}>{nearbyObject.title}</Text>
          </View>
          <TouchableOpacity
            style={styles.markBtn}
            onPress={handleMark}
            disabled={markLoading}
          >
            {markLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.markBtnText}>Отметить ✓</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Dev simulator buttons */}
      {IS_DEV && (
        <View style={styles.devPanel}>
          <Text style={styles.devLabel}>🧪 Симулировать позицию:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {objects.map((obj) => (
              <TouchableOpacity
                key={obj.id}
                style={[
                  styles.devBtn,
                  hasAchievement(obj.id) && styles.devBtnDone,
                ]}
                onPress={() => simulateAt(obj)}
              >
                <Text style={styles.devBtnText}>
                  {hasAchievement(obj.id) ? '✓ ' : ''}{obj.title.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
              <ObjectCard
                object={selectedObject}
                isAchieved={hasAchievement(selectedObject.id)}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topBar: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...SHADOW.md,
  },
  questLabel: { fontSize: 13, fontWeight: '600', color: COLORS.primaryDark },
  progressLabel: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  errorBanner: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.md,
    padding: 10,
  },
  errorText: { fontSize: 12, color: '#92400E' },
  simBanner: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: '#EDE9FE',
    borderRadius: RADIUS.md,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  simText: { flex: 1, fontSize: 12, color: '#5B21B6' },
  simClose: { fontSize: 14, color: '#5B21B6', paddingLeft: 8 },
  nearbyBanner: {
    position: 'absolute',
    bottom: 140,
    left: 16,
    right: 16,
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...SHADOW.md,
  },
  nearbyTitle: { fontSize: 11, color: COLORS.primaryLight, fontWeight: '600', textTransform: 'uppercase' },
  nearbyName: { fontSize: 16, color: COLORS.white, fontWeight: '700', marginTop: 2 },
  markBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  markBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  devPanel: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  devLabel: { color: '#ccc', fontSize: 10 },
  devBtn: {
    backgroundColor: '#444',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  devBtnDone: { backgroundColor: COLORS.primary },
  devBtnText: { color: '#fff', fontSize: 11 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
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
