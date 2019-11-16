// @flow

import proj4 from 'proj4'

/**
 * Determines the UTM zone containing the given latitude and longitude (in degrees)
 */
export function getUTMZone(lat: number, lon: number): number {
  if (lon < -180 || lon >= 180) {
    throw new Error(`longitude must be >= -180 and < 180`)
  }
  if (lat > 84 || lat < -80) {
    throw new Error('polar regions (south of 80°S and north of 84°N) are not supported')
  }

  if (lat >= 56 && lat <= 64 && lon >= 3 && lon <= 12) return 32 // SW Norway
  if (lat > 72 && lon >= 0 && lon <= 42) { // Svalbard
    if (lon < 9) return 31
    if (lon < 21) return 33
    if (lon < 33) return 35
    return 37
  }
  return Math.max(1, Math.min(31 + Math.floor(lon / 6), 60))
}

/**
 * Throws an error if the given number is an invalid UTM zone.
 * Otherwise returns the number
 */
export function assertValidUTMZone(utmZone: number): number {
  if (utmZone < 1 || utmZone > 60) {
    throw new Error(`utmZone must be between 1 and 60`)
  }
  return utmZone
}

/**
 * Gets the longitude (in degrees) of the central meridian of the given UTM zone.
 */
export function getCentralMeridian(utmZone: number): number {
  return -183 + assertValidUTMZone(utmZone) * 6
}

/**
 * Gets the angle from true north to UTM grid north at the given point.
 * You must provide either lat/lon (in degrees) or utmZone/easting/northing
 * (in meters).
 */
export function getUTMGridConvergence({
  lat,
  lon,
  utmZone,
  easting,
  northing,
}: {
  lat?: number,
  lon?: number,
  utmZone?: number,
  easting?: number,
  northing?: number,
}): number {
  if (lat != null && Number.isFinite(lat) && lon != null && Number.isFinite(lon)) {
    return Math.atan(
      Math.tan(lon - getCentralMeridian(getUTMZone(lat, lon))) *
      Math.sin(lat)
    )
  }
  if (utmZone != null && Number.isFinite(utmZone) && Number.isFinite(easting) && Number.isFinite(northing)) {
    const [lon, lat] = proj4(`+proj=utm +zone=${utmZone} +ellps=WGS84 +datum=WGS84 +units=m`).inverse([easting, northing])
    return getUTMGridConvergence({lat, lon})
  }
  throw new Error(`you must provide either lat/lon or utmZone/easting/northing`)
}
