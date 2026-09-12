// src/districts/DistrictConfig.ts

/**
 * Defines the shape of a district configuration.
 * Each district has a unique name, optional bounding box for culling,
 * entry points (spawn positions) and a list of assets to load.
 */
export interface DistrictConfig {
  /** Unique identifier, used in UI and routing */
  name: string;
  /** Human‑readable label shown in the notebook / map */
  label: string;
  /** Bounding box in world units (minX, minY, minZ, maxX, maxY, maxZ) */
  bounds?: [number, number, number, number, number, number];
  /** Spawn points for the player when entering this district */
  spawnPoints: Array<{ x: number; y: number; z: number }>;
  /** JSON file path (relative to src/districts) that contains the geometry builder */
  builderModule: string;
}

/**
 * Utility to load all district configs.
 * The configs are stored as separate JSON files in `src/districts/configs/`.
 */
export async function loadDistrictConfigs(): Promise<Record<string, DistrictConfig>> {
  const context = import.meta.glob('./configs/*.json', { eager: true }) as Record<string, any>;
  const configs: Record<string, DistrictConfig> = {};
  for (const path in context) {
    const cfg = context[path] as DistrictConfig;
    configs[cfg.name] = cfg;
  }
  return configs;
}
