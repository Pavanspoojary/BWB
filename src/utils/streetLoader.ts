// src/utils/streetLoader.ts
import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { latLonToMeters } from "./geo";

export async function loadStreets(scene: THREE.Scene): Promise<void> {
  // URL to a Manhattan streets GeoJSON. Replace with the actual URL to your GeoJSON asset.
    const url = '/manhattan_streets.geojson';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn("Failed to fetch street GeoJSON:", response.status);
      return;
    }
    const geojson = await response.json();
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
    const geometries: THREE.BufferGeometry[] = [];
    for (const feature of geojson.features ?? []) {
      const coords = feature.geometry?.coordinates;
      if (!coords) continue;
      // Support LineString and MultiLineString geometries.
      const lines = Array.isArray(coords[0][0]) ? coords : [coords];
      for (const line of lines) {
        const points: number[] = [];
        for (const [lon, lat] of line) {
          const vec = latLonToMeters(lat, lon);
          points.push(vec.x, 0, vec.z);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
        geometries.push(geometry);
      }
    }
    if (geometries.length === 0) return;
    const merged = BufferGeometryUtils.mergeGeometries(geometries, false);
    const lineMesh = new THREE.LineSegments(merged, lineMaterial);
    scene.add(lineMesh);
  } catch (e) {
    console.error("Error loading streets:", e);
  }
}
