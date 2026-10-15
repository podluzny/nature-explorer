/**
 * MapView — web implementation using @react-google-maps/api.
 * For native (iOS/Android) this would use react-native-maps.
 * Expo Router picks this file for web automatically.
 */
import { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Circle,
} from '@react-google-maps/api';
import type { NatureObject } from '../types';
import { COLORS } from '../theme';

const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

interface MapViewProps {
  center: { lat: number; lng: number };
  objects: NatureObject[];
  userLocation: { lat: number; lng: number } | null;
  achievedObjectIds: string[];
  onObjectPress: (obj: NatureObject) => void;
}

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
};

export function MapView({
  center,
  objects,
  userLocation,
  achievedObjectIds,
  onObjectPress,
}: MapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    id: 'nature-explorer-map',
  });

  const onLoad = useCallback(() => {}, []);

  if (loadError) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>⚠️ Ошибка загрузки карты</Text>
        <Text style={styles.errorSub}>
          {GOOGLE_MAPS_KEY
            ? 'Проверьте ключ Google Maps API'
            : 'Добавьте EXPO_PUBLIC_GOOGLE_MAPS_API_KEY в .env.local'}
        </Text>
      </View>
    );
  }

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Загрузка карты...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={16}
        onLoad={onLoad}
        options={MAP_OPTIONS}
      >
        {/* User location */}
        {userLocation && (
          <>
            <Marker
              position={userLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              }}
              title="Вы здесь"
              zIndex={100}
            />
            <Circle
              center={userLocation}
              radius={20}
              options={{
                fillColor: '#4285F4',
                fillOpacity: 0.1,
                strokeColor: '#4285F4',
                strokeOpacity: 0.3,
                strokeWeight: 1,
              }}
            />
          </>
        )}

        {/* Nature objects */}
        {objects.map((obj) => {
          const achieved = achievedObjectIds.includes(obj.id);
          return (
            <Marker
              key={obj.id}
              position={{ lat: obj.lat, lng: obj.lng }}
              title={obj.title}
              onClick={() => onObjectPress(obj)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 14,
                fillColor: achieved ? COLORS.success : COLORS.primary,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
              label={{
                text: achieved ? '✓' : '🌿',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
              zIndex={achieved ? 10 : 20}
            />
          );
        })}
      </GoogleMap>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as any,
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
  },
  loadingText: { color: COLORS.primary, fontSize: 14 },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff3e0',
    padding: 24,
  },
  errorText: { fontSize: 16, fontWeight: '600', color: '#e65100', marginBottom: 8 },
  errorSub: { fontSize: 13, color: '#bf360c', textAlign: 'center' },
});
