import * as THREE from "three";
import { latLonToMeters } from "../../utils/geo.ts";

export class DistrictManager {
  /**
   * Build a district and attach it to the provided CityBuilder instance.
   * Supports districts: "nyc", "monaco", "neon", "oldtown", "waterfront".
   */
  static buildDistrict(
    district: "nyc" | "monaco" | "neon" | "oldtown" | "waterfront" | string,
    city: any
  ) {
    // Clear any existing district.
    if (typeof city.clearDistrict === "function") {
      city.clearDistrict();
    }

    let group: THREE.Group | null = null;
    switch (district) {
      case "nyc":
        // Use detailed NYC construction from CityBuilder if available
        if (city && typeof city.buildNewYorkCity === "function") {
          city.buildNewYorkCity();
          group = null;
        } else {
          group = this.buildNYC();
        }
        break;
      case "monaco":
        if (city && typeof city.buildMonacoCircuit === "function") {
          city.buildMonacoCircuit();
          group = null;
        } else {
          group = this.buildMonaco();
        }
        break;
      case "neon":
        group = this.buildNeon(city);
        break;
      case "oldtown":
        group = this.buildOldTown(city);
        break;
      case "waterfront":
        group = this.buildWaterfront(city);
        break;
      default:
        group = new THREE.Group();
    }

    // Attach to city scene and tracking structures if a group was created.
    if (group && city.engine && city.engine.scene) {
      city.engine.scene.add(group);
    }
    if (group && Array.isArray(city.buildings)) {
      city.buildings.push(group);
    }
    city.currentDistrict = district;
    if (typeof city.spawnDistrictSecrets === "function") {
      city.spawnDistrictSecrets(district);
    }

    // Play audio feedback if available.
    if (city.doodleAudio && typeof city.doodleAudio.scribble === "function") {
      city.doodleAudio.scribble();
    }
  }

  // Material resolver: uses doodle shader materials if present, falls back to basic colors for tests
  private static getMaterials(city?: any) {
    if (city && city.defaultMats) {
      return city.defaultMats;
    }
    return {
      blue: new THREE.MeshBasicMaterial({ color: 0x1a30c0 }),
      blueFill: new THREE.MeshBasicMaterial({ color: 0x2244dd }),
      red: new THREE.MeshBasicMaterial({ color: 0xd02030 }),
      black: new THREE.MeshBasicMaterial({ color: 0x111118 }),
      orange: new THREE.MeshBasicMaterial({ color: 0xe06010 }),
      green: new THREE.MeshBasicMaterial({ color: 0x059669 }),
      cyan: new THREE.MeshBasicMaterial({ color: 0x00b4d8 }),
    };
  }

  // Fallback NYC placeholder for standalone unit tests
  public static buildNYC(): THREE.Group {
    const group = new THREE.Group();
    const sw = latLonToMeters(40.6997, -74.0176);
    const ne = latLonToMeters(40.8000, -73.9500);
    const width = Math.abs(ne.x - sw.x);
    const depth = Math.abs(ne.z - sw.z);
    const height = 200;
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const box = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    box.position.set(width / 2, height / 2, depth / 2);
    group.add(box);
    return group;
  }

  public static buildMonaco(): THREE.Group {
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(3, 8, 4), material);
    cone.position.set(0, 4, 0);
    group.add(cone);
    return group;
  }

  // Neon City: Cyberpunk skyscraper grid, elevated monorail, holograms & data towers
  public static buildNeon(city?: any): THREE.Group {
    const group = new THREE.Group();
    const mats = this.getMaterials(city);

    // 1. Cyber Grid Plaza ground markings
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240, 32, 32), mats.black);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.02;
    ground.userData.noCollision = true;
    group.add(ground);

    // Glowing grid lines along axes
    for (let pos = -100; pos <= 100; pos += 25) {
      const lineX = new THREE.Mesh(new THREE.BoxGeometry(200, 0.04, 0.3), mats.cyan);
      lineX.position.set(0, 0.04, pos);
      lineX.userData.noCollision = true;
      const lineZ = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 200), mats.cyan);
      lineZ.position.set(pos, 0.04, 0);
      lineZ.userData.noCollision = true;
      group.add(lineX, lineZ);
    }

    // 2. The Nexus Mega-Spire (Central Cyber Skyscraper)
    const spireGroup = new THREE.Group();
    spireGroup.position.set(0, 0, 0);

    const base = new THREE.Mesh(new THREE.BoxGeometry(26, 22, 26), mats.blue);
    base.position.y = 11;
    const mid = new THREE.Mesh(new THREE.BoxGeometry(18, 32, 18), mats.cyan);
    mid.position.y = 38;
    const top = new THREE.Mesh(new THREE.BoxGeometry(12, 24, 12), mats.blue);
    top.position.y = 66;
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.6, 24), mats.orange);
    antenna.position.set(0, 90, 0);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), mats.red);
    beacon.position.set(0, 102, 0);
    spireGroup.add(base, mid, top, antenna, beacon);

    // Hologram Ribbons wrapping spire
    for (let h = 18; h <= 70; h += 16) {
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(21, 1.2, 21), mats.orange);
      ribbon.position.set(0, h, 0);
      spireGroup.add(ribbon);
    }
    group.add(spireGroup);

    // 3. Flanking Cyber Skyscrapers (West & East High-Rises)
    const towerWest = new THREE.Group();
    towerWest.position.set(-48, 0, 15);
    const wBody = new THREE.Mesh(new THREE.BoxGeometry(16, 52, 16), mats.blue);
    wBody.position.y = 26;
    const wCrown = new THREE.Mesh(new THREE.ConeGeometry(10, 16, 4), mats.cyan);
    wCrown.position.set(0, 60, 0);
    wCrown.rotation.y = Math.PI / 4;
    towerWest.add(wBody, wCrown);
    group.add(towerWest);

    const towerEast = new THREE.Group();
    towerEast.position.set(48, 0, -20);
    const eBody = new THREE.Mesh(new THREE.BoxGeometry(18, 48, 14), mats.blue);
    eBody.position.y = 24;
    const eHolo = new THREE.Mesh(new THREE.BoxGeometry(18.6, 12, 0.4), mats.red);
    eHolo.position.set(0, 36, 7.3);
    towerEast.add(eBody, eHolo);
    group.add(towerEast);

    // 4. Elevated Monorail Viaduct & Streamlined High-Speed Train
    const railZ = -45;
    for (let rx = -70; rx <= 70; rx += 35) {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(2.4, 14, 2.4), mats.black);
      pylon.position.set(rx, 7, railZ);
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(7, 1.2, 3), mats.blue);
      bracket.position.set(rx, 14.2, railZ);
      group.add(pylon, bracket);
    }
    const track = new THREE.Mesh(new THREE.BoxGeometry(160, 0.8, 3.2), mats.cyan);
    track.position.set(0, 15, railZ);
    const monorailTrain = new THREE.Mesh(new THREE.BoxGeometry(28, 3.4, 3.8), mats.orange);
    monorailTrain.position.set(8, 17.2, railZ);
    group.add(track, monorailTrain);

    // 5. Hackers Cyber-Cafe & Server Terminals
    const cafe = new THREE.Group();
    cafe.position.set(-18, 0, -22);
    const cBldg = new THREE.Mesh(new THREE.BoxGeometry(12, 7, 12), mats.black);
    cBldg.position.y = 3.5;
    const cSign = new THREE.Mesh(new THREE.BoxGeometry(8, 1.5, 0.2), mats.cyan);
    cSign.position.set(0, 6.5, 6.15);
    cafe.add(cBldg, cSign);
    group.add(cafe);

    return group;
  }

  // Old Town: Historic clock tower, cobblestone plaza, stone fountain & merchant houses
  public static buildOldTown(city?: any): THREE.Group {
    const group = new THREE.Group();
    const mats = this.getMaterials(city);

    // 1. Cobblestone Plaza Ground
    const plaza = new THREE.Mesh(new THREE.PlaneGeometry(220, 220, 16, 16), mats.black);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.02;
    plaza.userData.noCollision = true;
    group.add(plaza);

    // 2. Grand Medieval Clock Tower
    const tower = new THREE.Group();
    tower.position.set(0, 0, -32);

    const tBase = new THREE.Mesh(new THREE.BoxGeometry(14, 16, 14), mats.blue);
    tBase.position.y = 8;
    const tShaft = new THREE.Mesh(new THREE.BoxGeometry(10, 30, 10), mats.orange);
    tShaft.position.y = 31;
    const tBelfry = new THREE.Mesh(new THREE.BoxGeometry(11.5, 10, 11.5), mats.black);
    tBelfry.position.y = 51;
    const tSpire = new THREE.Mesh(new THREE.ConeGeometry(7, 18, 4), mats.green);
    tSpire.position.set(0, 65, 0);
    tSpire.rotation.y = Math.PI / 4;

    // Clock faces on 4 sides
    const clockOffsets = [
      [0, 51, 5.85, 0],
      [0, 51, -5.85, Math.PI],
      [5.85, 51, 0, Math.PI / 2],
      [-5.85, 51, 0, -Math.PI / 2],
    ];
    clockOffsets.forEach(([cx, cy, cz, rot]) => {
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.3, 16), mats.black);
      dial.position.set(cx, cy, cz);
      dial.rotation.x = Math.PI / 2;
      dial.rotation.z = rot;
      const rim = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.25, 8, 16), mats.orange);
      rim.position.set(cx, cy, cz);
      tower.add(dial, rim);
    });

    tower.add(tBase, tShaft, tBelfry, tSpire);
    group.add(tower);

    // 3. Central Tiered Stone Fountain
    const fountain = new THREE.Group();
    fountain.position.set(0, 0, 16);
    const fBasin = new THREE.Mesh(new THREE.CylinderGeometry(7, 7.5, 1.2, 16), mats.blue);
    fBasin.position.y = 0.6;
    const fWater = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 6.6, 0.2, 16), mats.cyan);
    fWater.position.y = 1.1;
    const fPedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 4.5, 8), mats.black);
    fPedestal.position.y = 2.8;
    const fTopBowl = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 2.5, 0.9, 12), mats.orange);
    fTopBowl.position.y = 4.8;
    fountain.add(fBasin, fWater, fPedestal, fTopBowl);
    group.add(fountain);

    // 4. Old Town Merchant Gable Houses (Row of 3 timbered homes)
    const houseConfigs = [
      { x: -38, z: -10, color: mats.red, roofColor: mats.orange, w: 12, h: 18, d: 16 },
      { x: -38, z: 12, color: mats.blue, roofColor: mats.black, w: 12, h: 22, d: 14 },
      { x: -38, z: 32, color: mats.orange, roofColor: mats.green, w: 12, h: 16, d: 14 },
    ];
    houseConfigs.forEach((cfg) => {
      const house = new THREE.Group();
      house.position.set(cfg.x, 0, cfg.z);
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d), cfg.color);
      bldg.position.y = cfg.h / 2;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(cfg.w * 0.75, 8, 4), cfg.roofColor);
      roof.position.set(0, cfg.h + 4, 0);
      roof.rotation.y = Math.PI / 4;
      house.add(bldg, roof);
      group.add(house);
    });

    // 5. Historic Stone Bridge / Aqueduct at East Promenade
    const bridge = new THREE.Group();
    bridge.position.set(38, 0, 5);
    const bSpan = new THREE.Mesh(new THREE.BoxGeometry(10, 2.2, 50), mats.blue);
    bSpan.position.y = 5;
    const bPillar1 = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 5), mats.black);
    bPillar1.position.set(0, 2.5, -15);
    const bPillar2 = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 5), mats.black);
    bPillar2.position.set(0, 2.5, 15);
    bridge.add(bSpan, bPillar1, bPillar2);
    group.add(bridge);

    return group;
  }

  // Waterfront: Wooden boardwalk, coastal lighthouse, fishing docks & ferris wheel
  public static buildWaterfront(city?: any): THREE.Group {
    const group = new THREE.Group();
    const mats = this.getMaterials(city);

    // 1. Ocean Water Plane (blue doodle water ripples)
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(240, 240, 24, 24), mats.cyan);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = 0.01;
    ocean.userData.noCollision = true;
    group.add(ocean);

    // Wave ripple stripes
    for (let wz = -90; wz <= 90; wz += 18) {
      const wave = new THREE.Mesh(new THREE.BoxGeometry(200, 0.08, 0.8), mats.blue);
      wave.position.set(0, 0.06, wz);
      wave.userData.noCollision = true;
      group.add(wave);
    }

    // 2. Elevated Wooden Boardwalk
    const boardwalk = new THREE.Group();
    boardwalk.position.set(0, 0, 40);
    const bPlank = new THREE.Mesh(new THREE.BoxGeometry(160, 1.2, 28), mats.orange);
    bPlank.position.y = 1.4;
    boardwalk.add(bPlank);

    // Timber Pilings underneath boardwalk
    for (let px = -70; px <= 70; px += 20) {
      for (let pz = -10; pz <= 10; pz += 10) {
        const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.8), mats.black);
        pile.position.set(px, 0.7, pz);
        boardwalk.add(pile);
      }
    }
    group.add(boardwalk);

    // 3. Iconic Coastal Lighthouse
    const lh = new THREE.Group();
    lh.position.set(50, 0, -35);

    const lhBase = new THREE.Mesh(new THREE.CylinderGeometry(9, 11, 8, 12), mats.black);
    lhBase.position.y = 4;
    const lhTower = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 8, 38, 12), mats.blue);
    lhTower.position.y = 27;

    // Spiral red warning rings
    for (let r = 12; r <= 42; r += 10) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(4.8 + (46 - r) * 0.08, 4.8 + (46 - r) * 0.08, 3.2, 12), mats.red);
      ring.position.y = r;
      lh.add(ring);
    }

    // Lantern room & Dome cap
    const lhLantern = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 6, 12), mats.black);
    lhLantern.position.y = 49;
    const lhDome = new THREE.Mesh(new THREE.SphereGeometry(4.6, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.green);
    lhDome.position.y = 52;

    // Sweeping Lighthouse Beam
    const beam = new THREE.Mesh(new THREE.ConeGeometry(12, 50, 8), mats.orange);
    beam.position.set(0, 49, 25);
    beam.rotation.x = Math.PI / 2;
    beam.userData.noCollision = true;

    lh.add(lhBase, lhTower, lhLantern, lhDome, beam);
    group.add(lh);

    // 4. Giant Seaside Ferris Wheel
    const fw = new THREE.Group();
    fw.position.set(-45, 0, -25);

    // A-Frame Support Legs
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 42), mats.black);
    leg1.position.set(-8, 20, 0);
    leg1.rotation.z = 0.22;
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 42), mats.black);
    leg2.position.set(8, 20, 0);
    leg2.rotation.z = -0.22;
    fw.add(leg1, leg2);

    // Outer and Inner Rings
    const outerWheel = new THREE.Mesh(new THREE.TorusGeometry(22, 0.7, 8, 24), mats.cyan);
    outerWheel.position.y = 38;
    const innerHub = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 1.2, 12), mats.red);
    innerHub.position.y = 38;
    innerHub.rotation.x = Math.PI / 2;
    fw.add(outerWheel, innerHub);

    // 8 Passenger Gondolas
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const gx = Math.cos(angle) * 22;
      const gy = 38 + Math.sin(angle) * 22;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 22), mats.blue);
      spoke.position.set(gx / 2, 38 + (gy - 38) / 2, 0);
      spoke.rotation.z = angle - Math.PI / 2;
      const gondola = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.2, 3.2), mats.orange);
      gondola.position.set(gx, gy, 0);
      fw.add(spoke, gondola);
    }
    group.add(fw);

    // 5. Fishing Pier & Moored Boats
    const pier = new THREE.Group();
    pier.position.set(-20, 0, 10);
    const pPlank = new THREE.Mesh(new THREE.BoxGeometry(8, 1.0, 36), mats.orange);
    pPlank.position.y = 1.2;
    pier.add(pPlank);

    // Moored Boat 1
    const boat1 = new THREE.Group();
    boat1.position.set(-8, 0.6, 5);
    const hull1 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.6, 9), mats.blue);
    const cabin1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.0, 4), mats.orange);
    cabin1.position.set(0, 1.6, -1);
    boat1.add(hull1, cabin1);
    pier.add(boat1);
    group.add(pier);

    return group;
  }
}
