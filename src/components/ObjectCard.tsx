import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import type { NatureObject } from '../types';
import { COLORS, RADIUS, SHADOW } from '../theme';

interface ObjectCardProps {
  object: NatureObject;
  isAchieved?: boolean;
}

export function ObjectCard({ object, isAchieved }: ObjectCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  const photos = object.photos ?? [];

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
      {/* Photo slider */}
      {photos.length > 0 && (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: photos[photoIndex]?.url }}
            style={styles.photo}
            resizeMode="cover"
          />
          {photos.length > 1 && (
            <View style={styles.photoDots}>
              {photos.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setPhotoIndex(i)}>
                  <View style={[styles.dot, i === photoIndex && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {isAchieved && (
            <View style={styles.achievedBadge}>
              <Text style={styles.achievedBadgeText}>✓ Найдено</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{object.category}</Text>
          </View>
        </View>
        <Text style={styles.title}>{object.title}</Text>
        <Text style={styles.shortDesc}>{object.shortDescription}</Text>

        {/* Rich description (web: renders HTML, native: plain text) */}
        {object.richDescription ? (
          <View style={styles.richSection}>
            <RichText html={object.richDescription} />
          </View>
        ) : null}

        {/* Video link */}
        {object.videoUrl && (
          <TouchableOpacity
            style={styles.videoBtn}
            onPress={() => Linking.openURL(object.videoUrl!)}
          >
            <Text style={styles.videoBtnText}>▶ Смотреть видео</Text>
          </TouchableOpacity>
        )}

        {/* External links */}
        {object.externalLinks && object.externalLinks.length > 0 && (
          <View style={styles.linksSection}>
            <Text style={styles.linksSectionTitle}>Источники</Text>
            {object.externalLinks.map((link, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => Linking.openURL(link.url)}
              >
                <Text style={styles.externalLink}>🔗 {link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
  );
}

/** Renders HTML on web via dangerouslySetInnerHTML, plain text on native */
function RichText({ html }: { html: string }) {
  if (Platform.OS === 'web') {
    return (
      <div
        style={{ fontSize: 14, color: COLORS.text, lineHeight: '1.6' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    ) as any;
  }
  // Native: strip HTML tags for plain text fallback
  const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return <Text style={{ fontSize: 14, color: COLORS.text, lineHeight: 22 }}>{plain}</Text>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  photoContainer: { position: 'relative' },
  photo: {
    width: '100%',
    height: 240,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  } as any,
  photoDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: COLORS.white,
    transform: [{ scale: 1.2 }],
  },
  achievedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  achievedBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  content: { padding: 20 },
  header: { flexDirection: 'row', marginBottom: 8 },
  categoryBadge: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 28,
  },
  shortDesc: { fontSize: 15, color: COLORS.textMuted, lineHeight: 22, marginBottom: 16 },
  richSection: { marginBottom: 16 },
  videoBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  videoBtnText: { color: COLORS.white, fontWeight: '600' },
  linksSection: { marginTop: 8 },
  linksSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  externalLink: { fontSize: 14, color: COLORS.primary, marginBottom: 6 },
});
