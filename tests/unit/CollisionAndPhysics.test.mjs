import * as assert from 'assert';
import * as THREE from 'three';
import { CameraController } from '../../src/components/doodle/CameraController.ts';
import { DistrictManager } from '../../src/components/doodle/DistrictManager.ts';

// 1. Verify CameraController Collision Prevention
const camera = new THREE.PerspectiveCamera();
const domElement = { addEventListener() {} };
const ctrl = new CameraController(camera, domElement);

// Create a solid wall obstacle from X: [10, 16], Y: [0, 20], Z: [-10, 10]
const wallBox = new THREE.Box3(new THREE.Vector3(10, 0, -10), new THREE.Vector3(16, 20, 10));
ctrl.getColliders = () => [wallBox];

// Test: Starting at X: 5, player walking towards wall cannot penetrate it
ctrl.setMode('walk');
ctrl.teleportTo(5, 0, 0);
assert.strictEqual(ctrl.walkPos.x, 5, 'Player starts at X: 5');

// Advance player rightwards (towards wall at X: 10)
ctrl.moveRight = true;
for (let i = 0; i < 60; i++) {
  ctrl.update(0.016);
}

// Player's right edge (walkPos.x + radius) must not exceed wallBox.min.x (10)
assert.ok(
  ctrl.walkPos.x + 0.65 <= 10.05,
  `Player must be stopped by wall. walkPos.x=${ctrl.walkPos.x}`
);

// Test: Sprinting at 36 m/s does not tunnel through wall (sub-stepping test)
ctrl.isSprinting = true;
for (let i = 0; i < 120; i++) {
  ctrl.update(0.016);
}
assert.ok(
  ctrl.walkPos.x + 0.65 <= 10.05,
  `Player must NOT tunnel through wall while sprinting. walkPos.x=${ctrl.walkPos.x}`
);

// Test: Diagonal movement allows smooth sliding along wall without penetrating
ctrl.moveForward = true;
for (let i = 0; i < 60; i++) {
  ctrl.update(0.016);
}
assert.ok(
  ctrl.walkPos.x + 0.65 <= 10.05,
  `Wall sliding must not penetrate wall in X. walkPos.x=${ctrl.walkPos.x}`
);

// Test: Spawning inside an obstacle automatically de-penetrates player
ctrl.teleportTo(13, 0, 0); // Directly in the geometric center of the wall
const inside = (
  ctrl.walkPos.x >= 10 && ctrl.walkPos.x <= 16 &&
  ctrl.walkPos.z >= -10 && ctrl.walkPos.z <= 10
);
assert.ok(!inside, 'Player must be pushed outside wall after teleporting inside');

// 2. Verify Full Metropolis Collider Extraction Across All 15 Districts
const scene = new THREE.Scene();
const mockCity = {
  engine: { scene },
  buildings: [],
  colliders: [],
  clearDistrict() {},
  spawnAllSecrets() {},
  updateColliders() {
    this.colliders = [];
    const scan = (obj) => {
      if (obj.userData && obj.userData.noCollision) return;
      if (obj instanceof THREE.Mesh) {
        const geo = obj.geometry;
        if (geo instanceof THREE.PlaneGeometry || geo instanceof THREE.RingGeometry) return;
        const box = new THREE.Box3().setFromObject(obj);
        const sizeX = box.max.x - box.min.x;
        const sizeY = box.max.y - box.min.y;
        const sizeZ = box.max.z - box.min.z;
        if (sizeY >= 0.7 && sizeX >= 0.3 && sizeZ >= 0.3 && sizeX <= 280 && sizeZ <= 280) {
          this.colliders.push(box);
        }
        return;
      }
      for (const child of obj.children) scan(child);
    };
    for (const b of this.buildings) scan(b);
  },
};

DistrictManager.buildAllDistricts(mockCity);
assert.ok(mockCity.buildings.length > 0, 'Metropolis root must be added');
assert.ok(mockCity.colliders.length >= 500, `Expected >= 500 colliders across 15 districts, got ${mockCity.colliders.length}`);

console.log(`✔ All Collision & Physics tests passed successfully! (${mockCity.colliders.length} metropolis colliders verified)`);
