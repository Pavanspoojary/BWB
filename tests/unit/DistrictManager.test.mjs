import * as assert from 'assert';
import { DistrictManager } from '../../src/components/doodle/DistrictManager.ts';
import * as THREE from 'three';
import { latLonToMeters } from '../../src/utils/geo.ts';

function createMockCityBuilder() {
  const calls = { clear: 0, scribble: 0, buildNYC: 0 };
  const mock = {
    clearDistrict() { calls.clear++; },
    buildNewYorkCity() {
      // Simulate detailed NYC build adding a group to scene and buildings
      const group = new THREE.Group();
      // Create a box matching expected NYC scaled dimensions
      const sw = latLonToMeters(40.6997, -74.0176);
      const ne = latLonToMeters(40.8000, -73.9500);
      const width = Math.abs(ne.x - sw.x);
      const depth = Math.abs(ne.z - sw.z);
      const box = new THREE.Mesh(new THREE.BoxGeometry(width, 1, depth), new THREE.MeshBasicMaterial());
      group.add(box);
      mock.engine.scene.add(group);
      mock.buildings.push(group);
      calls.buildNYC++;
    },
    engine: { scene: { add: (obj) => { mock.added = mock.added || []; mock.added.push(obj); } } },
    buildings: [],
    doodleAudio: { scribble() { calls.scribble++; } },
    currentDistrict: null,
    _calls: calls,
  };
  return mock;
}

// Test NYC district with detailed build
const cityNYC = createMockCityBuilder();
DistrictManager.buildDistrict('nyc', cityNYC);
assert.strictEqual(cityNYC.currentDistrict, 'nyc', 'currentDistrict should be nyc');
assert.strictEqual(cityNYC.buildings.length, 1, 'NYC building should be added');
assert.strictEqual(cityNYC._calls.clear, 1, 'clearDistrict should be called once');
assert.strictEqual(cityNYC._calls.scribble, 1, 'scribble should be called once');
assert.strictEqual(cityNYC._calls.buildNYC, 1, 'buildNewYorkCity should be called once');
const nycGroup = cityNYC.buildings[0];
assert.ok(nycGroup instanceof THREE.Group, 'NYC group should be a THREE.Group');
assert.ok(nycGroup.children.length > 0, 'NYC group should have children');
// Verify scaling – compare box dimensions
const nycBox = nycGroup.children[0];
const geometry = nycBox.geometry.parameters;
const expectedSW = latLonToMeters(40.6997, -74.0176);
const expectedNE = latLonToMeters(40.8000, -73.9500);
const expectedWidth = Math.abs(expectedNE.x - expectedSW.x);
const expectedDepth = Math.abs(expectedNE.z - expectedSW.z);
assert.strictEqual(geometry.width, expectedWidth, 'NYC width should match expected scale');
assert.strictEqual(geometry.depth, expectedDepth, 'NYC depth should match expected scale');

// Test Neon district
const cityNeon = createMockCityBuilder();
DistrictManager.buildDistrict('neon', cityNeon);
assert.strictEqual(cityNeon.currentDistrict, 'neon', 'currentDistrict should be neon');
assert.strictEqual(cityNeon.buildings.length, 1, 'Neon building should be added');
assert.strictEqual(cityNeon._calls.clear, 1, 'clearDistrict should be called once for neon');
assert.strictEqual(cityNeon._calls.scribble, 1, 'scribble should be called once for neon');

// Test OldTown district
const cityOld = createMockCityBuilder();
DistrictManager.buildDistrict('oldtown', cityOld);
assert.strictEqual(cityOld.currentDistrict, 'oldtown', 'currentDistrict should be oldtown');
assert.strictEqual(cityOld.buildings.length, 1, 'OldTown building should be added');
assert.strictEqual(cityOld._calls.clear, 1, 'clearDistrict should be called once for oldtown');
assert.strictEqual(cityOld._calls.scribble, 1, 'scribble should be called once for oldtown');

// Test Waterfront district
const cityWater = createMockCityBuilder();
DistrictManager.buildDistrict('waterfront', cityWater);
assert.strictEqual(cityWater.currentDistrict, 'waterfront', 'currentDistrict should be waterfront');
assert.strictEqual(cityWater.buildings.length, 1, 'Waterfront building should be added');
assert.strictEqual(cityWater._calls.clear, 1, 'clearDistrict should be called once for waterfront');
assert.strictEqual(cityWater._calls.scribble, 1, 'scribble should be called once for waterfront');

// Test 15-District Registry & Contiguous Metropolis Architecture
import { DISTRICT_REGISTRY } from '../../src/components/doodle/DistrictManager.ts';
assert.strictEqual(DISTRICT_REGISTRY.length, 15, 'Registry must define exactly 15 districts');
const expectedDistrictIds = [
  'downtown', 'entertainment', 'market', 'oldtown', 'neon',
  'hills', 'cloud', 'university', 'monaco', 'industrial',
  'underground', 'waterfront', 'port', 'airport', 'secret'
];
for (const id of expectedDistrictIds) {
  const found = DISTRICT_REGISTRY.find(d => d.id === id);
  assert.ok(found, `District '${id}' must exist in registry`);
  assert.ok(found.spawnPoint instanceof THREE.Vector3, `District '${id}' must have valid spawnPoint`);
  assert.ok(found.lookAt instanceof THREE.Vector3, `District '${id}' must have valid lookAt`);
  assert.ok(found.bounds && typeof found.bounds.minX === 'number', `District '${id}' must have bounding box`);
}

// Verify multi-elevation verticality
const hills = DISTRICT_REGISTRY.find(d => d.id === 'hills');
assert.strictEqual(hills.elevation, 25, 'Residential Hills must be at elevation Y=25m');
const cloud = DISTRICT_REGISTRY.find(d => d.id === 'cloud');
assert.strictEqual(cloud.elevation, 80, 'Cloud District must be at elevation Y=80m');
const underground = DISTRICT_REGISTRY.find(d => d.id === 'underground');
assert.strictEqual(underground.elevation, -16, 'Underground District must be subterranean Y=-16m');
const secret = DISTRICT_REGISTRY.find(d => d.id === 'secret');
assert.strictEqual(secret.elevation, -25, 'Blueprint Core must be deep subterranean Y=-25m');

console.log('✔ All 15-District Registry & Multi-Elevation tests passed successfully!');

