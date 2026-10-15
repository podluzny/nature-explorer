/**
 * MapPicker — web-only component for admin to click a point on the map
 * and get back lat/lng coordinates.
 */
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { COLORS, RADIUS, SHADOW } from '../theme';

const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const MAP_STYLE = { width: '100%', height: '100%' };

interface MapPickerProps {
  initialLat: number;
  initialLng: number;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

export function MapPicker({ initialLat, initialLng, onConfirm, onClose }: MapPickerProps) {
  const [picked, setPicked] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    id: 'nature-explorer-map',
  });

  const handleClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setPicked({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, []);

  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Выберите точку на карте</Text>
          <Text style={styles.hint}>Кликните на карте чтобы установить координаты</Text>
        </View>

        <View style={styles.mapContainer}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={MAP_STYLE}
              center={picked}
              zoom={15}
              onClick={handleClick}
              options={{ streetViewControl: false, mapTypeControl: false }}
            >
              <Marker position={picked} />
            </GoogleMap>
          ) : (
            <View style={styles.loading}>
              <Text>Загрузка карты...</Text>
            </View>
          )}
        </View>

        <View style={styles.coordDisplay}>
          <Text style={styles.coordText}>
            📍 {picked.lat.toFixed(6)}, {picked.lng.toFixed(6)}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Отмена</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => onConfirm(picked.lat, picked.lng)}
          >
            <Text style={styles.confirmBtnText}>Подтвердить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 600,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOW.md,
  } as any,
  header: { padding: 16 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  hint: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  mapContainer: { height: 350 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coordDisplay: { padding: 12, backgroundColor: COLORS.bg },
  coordText: { fontSize: 13, fontWeight: '600', color: COLORS.primaryDark, textAlign: 'center' },
  actions: { flexDirection: 'row', padding: 12, gap: 8 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.textMuted },
  confirmBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: 12, alignItems: 'center' },
  confirmBtnText: { color: COLORS.white, fontWeight: '700' },
});
