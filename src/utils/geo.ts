/**
 * Haversine formula — returns distance in metres between two lat/lng points.
 */
export function distanceMetres(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6_371_000; // Earth radius in metres
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * Returns true when the user is close enough to mark an object.
 * Threshold = object radiusMeters + GPS accuracy (capped at 20m).
 */
export function isWithinRadius(
  userLat: number,
  userLng: number,
  objectLat: number,
  objectLng: number,
  objectRadiusMetres: number,
  gpsAccuracy: number = 10
): boolean {
  const distance = distanceMetres(userLat, userLng, objectLat, objectLng);
  const threshold = objectRadiusMetres + Math.min(gpsAccuracy, 20);
  return distance <= threshold;
}
