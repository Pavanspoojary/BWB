// src/utils/geo.ts
import * as THREE from "three";

/**
 * Geographic conversion utilities for the NYC map.
 *
 * The conversion uses a simple equirectangular projection centred on the
 * southwestern corner of Manhattan (SW lat/lon). This is sufficient for the
 * small geographic extents of Manhattan where distortion is minimal.
 */

// Southwest corner of Manhattan (approx.) – used as the origin (0,0) in scene space.
const ORIGIN_LAT = 40.6997; // degrees North
const ORIGIN_LON = -74.0176; // degrees West (negative)

// Approximate meters per degree at this latitude.
const METERS_PER_DEG_LAT = 111_320; // metres per degree latitude
// Adjust for longitude using cosine of latitude.
const METERS_PER_DEG_LON = METERS_PER_DEG_LAT * Math.cos((ORIGIN_LAT * Math.PI) / 180);

/**
 * Convert a latitude/longitude pair to a THREE.Vector3 offset (X,Z) in metres.
 * Y is always zero – ground level.
 *
 * @param lat Latitude in decimal degrees (positive north).
 * @param lon Longitude in decimal degrees (negative west).
 * @returns THREE.Vector3 where X is east‑west offset, Z is north‑south offset.
 */
export function latLonToMeters(lat: number, lon: number): THREE.Vector3 {
  const dLat = lat - ORIGIN_LAT;
  const dLon = lon - ORIGIN_LON;
  const x = dLon * METERS_PER_DEG_LON; // east-west
  const z = dLat * METERS_PER_DEG_LAT; // north-south
  return new THREE.Vector3(x, 0, z);
}

/**
 * Optional inverse conversion – useful for debugging.
 */
export function metersToLatLon(x: number, z: number): { lat: number; lon: number } {
  const lat = z / METERS_PER_DEG_LAT + ORIGIN_LAT;
  const lon = x / METERS_PER_DEG_LON + ORIGIN_LON;
  return { lat, lon };
}
