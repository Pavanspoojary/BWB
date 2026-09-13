import * as THREE from "three";
import { latLonToMeters } from "../../utils/geo.ts";
import { VertexCityBuilder } from "./VertexCityBuilder.ts";

export interface DistrictInfo {
  id: string;
  name: string;
  subtitle: string;
  spawnPoint: THREE.Vector3;
  lookAt: THREE.Vector3;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  elevation: number;
}

export const DISTRICT_REGISTRY: DistrictInfo[] = [
  {
    id: "downtown",
    name: "COURTYARD ARENA",
    subtitle: "Multi-Level Construction Frame, Crane & Skybridge",
    spawnPoint: new THREE.Vector3(0, 0, 24),
    lookAt: new THREE.Vector3(0, 8, -6),
    bounds: { minX: -60, maxX: 60, minZ: -50, maxZ: 50 },
    elevation: 0,
  },
  {
    id: "entertainment",
    name: "ENTERTAINMENT DISTRICT",
    subtitle: "Doodle Dome, Theaters & Pixel Palace",
    spawnPoint: new THREE.Vector3(70, 0, 30),
    lookAt: new THREE.Vector3(70, 0, 0),
    bounds: { minX: 10, maxX: 130, minZ: -40, maxZ: 80 },
    elevation: 0,
  },
  {
    id: "market",
    name: "MARKET DISTRICT",
    subtitle: "Bustling Street Bazaar & Food Stalls",
    spawnPoint: new THREE.Vector3(0, 0, -35),
    lookAt: new THREE.Vector3(0, 0, -60),
    bounds: { minX: -30, maxX: 30, minZ: -80, maxZ: -20 },
    elevation: 0,
  },
  {
    id: "oldtown",
    name: "OLD TOWN",
    subtitle: "Historic Clock Tower & Cobblestone Plaza",
    spawnPoint: new THREE.Vector3(-70, 0, -110),
    lookAt: new THREE.Vector3(-70, 0, -135),
    bounds: { minX: -130, maxX: -10, minZ: -170, maxZ: -80 },
    elevation: 0,
  },
  {
    id: "neon",
    name: "NEON CITY",
    subtitle: "Nexus Mega-Spire & Elevated Monorail",
    spawnPoint: new THREE.Vector3(70, 0, -110),
    lookAt: new THREE.Vector3(70, 0, -135),
    bounds: { minX: 10, maxX: 130, minZ: -170, maxZ: -80 },
    elevation: 0,
  },
  {
    id: "hills",
    name: "RESIDENTIAL HILLS",
    subtitle: "Winding Switchbacks & Hilltop Observatory",
    spawnPoint: new THREE.Vector3(0, 25, -210),
    lookAt: new THREE.Vector3(0, 25, -240),
    bounds: { minX: -70, maxX: 70, minZ: -280, maxZ: -170 },
    elevation: 25,
  },
  {
    id: "cloud",
    name: "CLOUD DISTRICT",
    subtitle: "Sky Spires, Skybridges & Stratosphere",
    spawnPoint: new THREE.Vector3(0, 80, -320),
    lookAt: new THREE.Vector3(0, 80, -350),
    bounds: { minX: -80, maxX: 80, minZ: -400, maxZ: -280 },
    elevation: 80,
  },
  {
    id: "university",
    name: "UNIVERSITY / CREATIVE",
    subtitle: "Domed Library, Arts Academy & Quad",
    spawnPoint: new THREE.Vector3(-170, 0, 40),
    lookAt: new THREE.Vector3(-170, 0, 70),
    bounds: { minX: -230, maxX: -110, minZ: 0, maxZ: 120 },
    elevation: 0,
  },
  {
    id: "monaco",
    name: "DOODLE GRAND PRIX",
    subtitle: "Coastal Street Circuit & Harbor Paddock",
    spawnPoint: new THREE.Vector3(170, 0, 40),
    lookAt: new THREE.Vector3(170, 0, 70),
    bounds: { minX: 110, maxX: 230, minZ: 0, maxZ: 120 },
    elevation: 0,
  },
  {
    id: "industrial",
    name: "INDUSTRIAL DISTRICT",
    subtitle: "Smokestacks, Gantry Cranes & Rail Depot",
    spawnPoint: new THREE.Vector3(-170, 0, 170),
    lookAt: new THREE.Vector3(-170, 0, 200),
    bounds: { minX: -230, maxX: -110, minZ: 130, maxZ: 250 },
    elevation: 0,
  },
  {
    id: "underground",
    name: "UNDERGROUND CITY",
    subtitle: "Subterranean Subway Hub & Secret Labs",
    spawnPoint: new THREE.Vector3(0, -16, 75),
    lookAt: new THREE.Vector3(0, -16, 100),
    bounds: { minX: -60, maxX: 60, minZ: 40, maxZ: 140 },
    elevation: -16,
  },
  {
    id: "waterfront",
    name: "WATERFRONT & PIER",
    subtitle: "Ocean Boardwalk, Ferris Wheel & Lighthouse",
    spawnPoint: new THREE.Vector3(-65, 0, 270),
    lookAt: new THREE.Vector3(-65, 0, 300),
    bounds: { minX: -120, maxX: -10, minZ: 240, maxZ: 350 },
    elevation: 0,
  },
  {
    id: "port",
    name: "PORT DISTRICT",
    subtitle: "Container Cargo Ships & Quay Cranes",
    spawnPoint: new THREE.Vector3(85, 0, 270),
    lookAt: new THREE.Vector3(85, 0, 300),
    bounds: { minX: 20, maxX: 150, minZ: 240, maxZ: 350 },
    elevation: 0,
  },
  {
    id: "airport",
    name: "AIRPORT DISTRICT",
    subtitle: "Terminal Hall, Control Tower & Runway",
    spawnPoint: new THREE.Vector3(0, 0, 380),
    lookAt: new THREE.Vector3(0, 0, 420),
    bounds: { minX: -100, maxX: 100, minZ: 360, maxZ: 480 },
    elevation: 0,
  },
  {
    id: "secret",
    name: "THE BLUEPRINT CORE",
    subtitle: "The Master Drafting Room & Pen Monument",
    spawnPoint: new THREE.Vector3(0, -25, -320),
    lookAt: new THREE.Vector3(0, -25, -340),
    bounds: { minX: -50, maxX: 50, minZ: -370, maxZ: -270 },
    elevation: -25,
  },
];

export class DistrictManager {
  /**
   * Build a district and attach it to the provided CityBuilder instance.
   * Supports all 15 districts for backwards compatibility and isolated tests.
   */
  static buildDistrict(
    district: "nyc" | "downtown" | "monaco" | "neon" | "oldtown" | "waterfront" | string,
    city: any
  ) {
    // Clear any existing district.
    if (typeof city.clearDistrict === "function") {
      city.clearDistrict();
    }

    let group: THREE.Group | null = null;
    switch (district) {
      case "nyc":
      case "downtown":
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
      case "entertainment":
        group = this.buildEntertainment(city);
        break;
      case "market":
        group = this.buildMarket(city);
        break;
      case "hills":
        group = this.buildResidentialHills(city);
        break;
      case "cloud":
        group = this.buildCloudDistrict(city);
        break;
      case "university":
        group = this.buildUniversity(city);
        break;
      case "industrial":
        group = this.buildIndustrial(city);
        break;
      case "underground":
        group = this.buildUnderground(city);
        break;
      case "port":
        group = this.buildPort(city);
        break;
      case "airport":
        group = this.buildAirport(city);
        break;
      case "secret":
        group = this.buildSecretDistrict(city);
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

  /**
   * Master Method: Builds the entire unified Doodle Metropolis with all 15 districts
   * situated concurrently in one continuous coordinate space.
   */
  static buildAllDistricts(city: any) {
    if (typeof city.clearDistrict === "function") {
      city.clearDistrict();
    }

    const metropolisGroup = new THREE.Group();
    metropolisGroup.name = "DoodleMetropolis_Root";

    // Build Vertex City according to the 52-section top-down map specification
    metropolisGroup.add(VertexCityBuilder.buildVertexCity(city));

    // Attach master group to scene
    if (city.engine && city.engine.scene) {
      city.engine.scene.add(metropolisGroup);
    }
    if (Array.isArray(city.buildings)) {
      city.buildings.push(metropolisGroup);
    }

    city.currentDistrict = "downtown";

    // NOTE: secret collectibles removed for the blank-slate rebuild.
    // They come back piece by piece with the world that hides them.

    // Recompute and cache all solid physical colliders across Doodle Metropolis
    if (typeof city.updateColliders === "function") {
      city.updateColliders();
    }

    if (city.doodleAudio && typeof city.doodleAudio.scribble === "function") {
      city.doodleAudio.scribble();
    }
  }

  /**
   * The city starts here: a blank sheet of notebook paper.
   * We build it piece by piece, one structure at a time.
   * (Step 1 — empty ground. Roads, walls and plots come next.)
   */
  public static buildCompactCourtyardArena(city?: any): THREE.Group {
    const arena = new THREE.Group();
    arena.name = "CompactCourtyardArena";
    const mats = this.getMaterials(city);

    // Step 1: blank paper. Everything else gets built piece by piece.
    arena.add(this.buildPaperGround(mats));

    return arena;
  }

  // --- SUB-BUILDER MODULES ---

  /** Ground Paper — clean blank sheet (lines come later, piece by piece) */
  private static buildPaperGround(mats: any): THREE.Group {
    const group = new THREE.Group();
    group.name = "PaperGround";

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), mats.black);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.02;
    floor.userData.noCollision = true;
    group.add(floor);

    return group;
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
  public static buildNeon(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
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

    // Glowing window grid on front face of base
    for (let wy = 4; wy <= 18; wy += 7) {
      for (let wx = -8; wx <= 8; wx += 5) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(2, 1.8, 0.3), mats.cyan);
        win.position.set(wx, wy, 13.1);
        win.userData.noCollision = true;
        spireGroup.add(win);
      }
    }
    const sEntrance = new THREE.Mesh(new THREE.BoxGeometry(6, 8, 0.5), mats.black);
    sEntrance.position.set(0, 4, 13.1);
    sEntrance.userData.noCollision = true;
    spireGroup.add(sEntrance);
    const sHolo = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 0.4), mats.red);
    sHolo.position.set(0, 42, 9.2);
    spireGroup.add(sHolo);
    const sDish = new THREE.Mesh(new THREE.TorusGeometry(2, 0.3, 6, 8), mats.orange);
    sDish.position.set(0, 78, 0);
    spireGroup.add(sDish);

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
    for (let wy of [12, 24, 36]) {
      for (let wx of [-4, 4]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2, 0.3), mats.cyan);
        win.position.set(wx, wy, 8.1);
        win.userData.noCollision = true;
        towerWest.add(win);
      }
    }
    const wEntrance = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 0.4), mats.black);
    wEntrance.position.set(0, 3, 8.1);
    wEntrance.userData.noCollision = true;
    towerWest.add(wEntrance);
    const wAcUnit = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), mats.black);
    wAcUnit.position.set(5, 53, 0);
    towerWest.add(wAcUnit);
    group.add(towerWest);

    const towerEast = new THREE.Group();
    towerEast.position.set(48, 0, -20);
    const eBody = new THREE.Mesh(new THREE.BoxGeometry(18, 48, 14), mats.blue);
    eBody.position.y = 24;
    const eHolo = new THREE.Mesh(new THREE.BoxGeometry(18.6, 12, 0.4), mats.red);
    eHolo.position.set(0, 36, 7.3);
    towerEast.add(eBody, eHolo);
    for (let wy of [10, 20, 30, 40]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2, 0.3), mats.cyan);
      win.position.set(9.1, wy, -3);
      win.userData.noCollision = true;
      towerEast.add(win);
    }
    const eDockDoor = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 0.4), mats.black);
    eDockDoor.position.set(0, 2.5, -7.1);
    eDockDoor.userData.noCollision = true;
    towerEast.add(eDockDoor);
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
    for (let wx = -4; wx <= 16; wx += 5) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 0.1), mats.cyan);
      win.position.set(wx, 17.5, railZ + 2);
      win.userData.noCollision = true;
      group.add(win);
    }

    // 5. Hackers Cyber-Cafe & Server Terminals
    const cafe = new THREE.Group();
    cafe.position.set(-18, 0, -22);
    const cBldg = new THREE.Mesh(new THREE.BoxGeometry(12, 7, 12), mats.black);
    cBldg.position.y = 3.5;
    const cSign = new THREE.Mesh(new THREE.BoxGeometry(8, 1.5, 0.2), mats.cyan);
    cSign.position.set(0, 6.5, 6.15);
    // Cyber Ramen Giant Holographic Chopsticks
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1.4, 1.8, 12), mats.red);
    bowl.position.set(0, 9.2, 0);
    const chopstick = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5, 6), mats.orange);
    chopstick.position.set(0.6, 11, 0);
    chopstick.rotation.z = Math.PI / 4;
    cafe.add(cBldg, cSign, bowl, chopstick);
    for (let wx of [-3, 3]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 0.3), mats.cyan);
      win.position.set(wx, 4, 6.15);
      win.userData.noCollision = true;
      cafe.add(win);
    }
    const cDoor = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.3), mats.black);
    cDoor.position.set(0, 1.5, 6.15);
    cDoor.userData.noCollision = true;
    cafe.add(cDoor);
    group.add(cafe);

    // 6. Suspended Skybridge Corridors Linking Spires
    const skybridgeW = new THREE.Mesh(new THREE.BoxGeometry(34, 3, 3.5), mats.cyan);
    skybridgeW.position.set(-24, 38, 7);
    const skybridgeE = new THREE.Mesh(new THREE.BoxGeometry(34, 3, 3.5), mats.cyan);
    skybridgeE.position.set(24, 38, -10);
    group.add(skybridgeW, skybridgeE);

    // 7. Hover-Drone Delivery Pads
    const dronePad = new THREE.Group();
    dronePad.position.set(28, 0, 18);
    const dPlatform = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 1.2, 16), mats.black);
    dPlatform.position.y = 0.6;
    const dRing = new THREE.Mesh(new THREE.TorusGeometry(5, 0.3, 6, 16), mats.cyan);
    dRing.position.y = 1.25;
    dRing.rotation.x = Math.PI / 2;
    dronePad.add(dPlatform, dRing);
    group.add(dronePad);

    return group;
  }

  // Old Town: Historic clock tower, cobblestone plaza, stone fountain & merchant houses
  public static buildOldTown(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // 1. Cobblestone Plaza Ground
    const plaza = new THREE.Mesh(new THREE.PlaneGeometry(220, 220, 16, 16), mats.black);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.02;
    plaza.userData.noCollision = true;
    group.add(plaza);

    // 2. Grand Medieval Clock Tower
    const tower = new THREE.Group();
    tower.position.set(0, 0, -15);

    const tBase = new THREE.Mesh(new THREE.BoxGeometry(14, 16, 14), mats.blue);
    tBase.position.y = 8;
    const tShaft = new THREE.Mesh(new THREE.BoxGeometry(10, 30, 10), mats.orange);
    tShaft.position.y = 31;
    const tBelfry = new THREE.Mesh(new THREE.BoxGeometry(11.5, 10, 11.5), mats.black);
    tBelfry.position.y = 51;
    const tSpire = new THREE.Mesh(new THREE.ConeGeometry(7, 18, 4), mats.green);
    tSpire.position.set(0, 65, 0);
    tSpire.rotation.y = Math.PI / 4;

    const tArch = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 0.4), mats.black);
    tArch.position.set(0, 3, 7.1);
    tArch.userData.noCollision = true;
    tower.add(tArch);
    for (let wy of [22, 28, 34, 40]) {
      const slit = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 0.3), mats.cyan);
      slit.position.set(0, wy, 5.1);
      slit.userData.noCollision = true;
      tower.add(slit);
    }
    const belfryFaces = [
      [0, 5.85, 0],
      [0, -5.85, 0],
      [5.85, 0, Math.PI / 2],
      [-5.85, 0, Math.PI / 2]
    ];
    belfryFaces.forEach(([bx, bz, rot]) => {
      const open = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 0.3), mats.black);
      open.position.set(bx, 51, bz);
      open.rotation.y = rot;
      open.userData.noCollision = true;
      tower.add(open);
    });
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6), mats.black);
    flagPole.position.set(0, 74, 0);
    const flagBox = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 0.1), mats.red);
    flagBox.position.set(1, 76, 0);
    flagBox.userData.noCollision = true;
    tower.add(flagPole, flagBox);

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
    
    const spoutPos = [[7, 0], [-7, 0], [0, 7], [0, -7]];
    spoutPos.forEach(([px, pz]) => {
      const spout = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.6), mats.orange);
      spout.position.set(px, 1.5, pz);
      if (px !== 0) spout.rotation.y = Math.PI / 2;
      fountain.add(spout);
    });

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
      // Wrought-Iron Tavern Sign
      const signArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 2.5), mats.black);
      signArm.position.set(cfg.w / 2 + 1.2, cfg.h * 0.6, 0);
      const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 1.8), mats.orange);
      signBoard.position.set(cfg.w / 2 + 1.2, cfg.h * 0.6 - 0.8, 0);
      
      for (let wx of [-3, 3]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.3), mats.cyan);
        win.position.set(wx, cfg.h * 0.5, cfg.d / 2 + 0.15);
        win.userData.noCollision = true;
        house.add(win);
      }
      const hDoor = new THREE.Mesh(new THREE.BoxGeometry(2, 3.5, 0.3), mats.black);
      hDoor.position.set(0, 1.75, cfg.d / 2 + 0.15);
      hDoor.userData.noCollision = true;
      const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 1.5), mats.black);
      chimney.position.set(cfg.w / 2 - 2, cfg.h + 6, 0);
      
      house.add(bldg, roof, signArm, signBoard, hDoor, chimney);
      for (let wx of [-3, 3]) {
        const fBox = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.6), mats.green);
        fBox.position.set(wx, cfg.h * 0.5 - 1.5, cfg.d / 2 + 0.3);
        fBox.userData.noCollision = true;
        house.add(fBox);
      }
      
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
    
    for (let rx of [-4.8, 4.8]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 50), mats.orange);
      rail.position.set(rx, 6.3, 0);
      bridge.add(rail);
    }
    for (let rz of [-15, 0, 15]) {
      const bArch = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 0.3), mats.black);
      bArch.position.set(5.15, 2, rz);
      bArch.userData.noCollision = true;
      bridge.add(bArch);
    }

    bridge.add(bSpan, bPillar1, bPillar2);
    group.add(bridge);

    // 6. Old Town Wishing Well (Stone Well with Wooden Roof)
    const well = new THREE.Group();
    well.position.set(16, 0, -10);
    const wStone = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 1.6, 12), mats.black);
    wStone.position.y = 0.8;
    const wPost1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 0.3), mats.orange);
    wPost1.position.set(-2, 2.2, 0);
    const wPost2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 0.3), mats.orange);
    wPost2.position.set(2, 2.2, 0);
    const wRoof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.8, 4), mats.red);
    wRoof.position.set(0, 4.2, 0);
    wRoof.rotation.y = Math.PI / 4;
    well.add(wStone, wPost1, wPost2, wRoof);
    group.add(well);

    // 7. Gothic City Gatehouse & Crenellations
    const gate = new THREE.Group();
    gate.position.set(-5, 0, -60);
    const gWallL = new THREE.Mesh(new THREE.BoxGeometry(10, 16, 6), mats.blue);
    gWallL.position.set(-10, 8, 0);
    const gWallR = new THREE.Mesh(new THREE.BoxGeometry(10, 16, 6), mats.blue);
    gWallR.position.set(10, 8, 0);
    const gArch = new THREE.Mesh(new THREE.BoxGeometry(12, 4, 6), mats.orange);
    gArch.position.set(0, 14, 0);
    
    for (let mx = -14; mx <= 14; mx += 7) {
      const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2, 1.2), mats.blue);
      merlon.position.set(mx, 17, 0);
      gate.add(merlon);
    }
    for (let tx of [-6, 6]) {
      const sconce = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2), mats.orange);
      sconce.position.set(tx, 10, 3.2);
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.5), mats.red);
      flame.position.set(tx, 12, 3.2);
      flame.userData.noCollision = true;
      gate.add(sconce, flame);
    }

    gate.add(gWallL, gWallR, gArch);
    group.add(gate);

    return group;
  }

  // Waterfront: Wooden boardwalk, coastal lighthouse, fishing docks & ferris wheel
  public static buildWaterfront(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
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

    for (let bx of [-40, -10, 10, 40]) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 1.2), mats.orange);
      bench.position.set(bx, 2.2, 40);
      group.add(bench);
    }
    const railFront = new THREE.Mesh(new THREE.BoxGeometry(160, 0.8, 0.2), mats.orange);
    railFront.position.set(0, 2.5, 54);
    const railBack = new THREE.Mesh(new THREE.BoxGeometry(160, 0.8, 0.2), mats.orange);
    railBack.position.set(0, 2.5, 26);
    group.add(railFront, railBack);

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
    
    const lhDoor = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 0.5), mats.black);
    lhDoor.position.set(0, 2.5, 11.1);
    lhDoor.userData.noCollision = true;
    for (let py of [20, 30]) {
      const port = new THREE.Mesh(new THREE.SphereGeometry(0.6), mats.cyan);
      port.position.set(0, py, 7.5);
      port.userData.noCollision = true;
      lh.add(port);
    }
    const lRod = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4), mats.orange);
    lRod.position.set(0, 54, 0);
    lh.add(lhDoor, lRod);
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
    
    const tkBooth = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 2), mats.red);
    tkBooth.position.set(0, 1.5, 6);
    const fwArch = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 0.5), mats.orange);
    fwArch.position.set(0, 2, 5);
    fwArch.userData.noCollision = true;
    fw.add(tkBooth, fwArch);
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

    // 6. Saltwater Taffy & Ice Cream Wooden Shack
    const taffyShack = new THREE.Group();
    taffyShack.position.set(16, 0, 36);
    const tsBldg = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 8), mats.orange);
    tsBldg.position.y = 3;
    const tsRoof = new THREE.Mesh(new THREE.ConeGeometry(7, 3.5, 4), mats.red);
    tsRoof.position.y = 7.5;
    tsRoof.rotation.y = Math.PI / 4;
    const tsSign = new THREE.Mesh(new THREE.BoxGeometry(8, 1.4, 0.3), mats.cyan);
    tsSign.position.set(0, 5.2, 4.15);
    taffyShack.add(tsBldg, tsRoof, tsSign);

    const tsSvcWin = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.3), mats.cyan);
    tsSvcWin.position.set(0, 4, 4.15);
    tsSvcWin.userData.noCollision = true;
    const tsSideWin = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.3), mats.cyan);
    tsSideWin.position.set(5.1, 4, 0);
    tsSideWin.userData.noCollision = true;
    const icCone = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.2, 2), mats.orange);
    icCone.position.set(6, 1, 0);
    icCone.userData.noCollision = true;
    const icScoop = new THREE.Mesh(new THREE.SphereGeometry(0.8), mats.red);
    icScoop.position.set(6, 2.5, 0);
    icScoop.userData.noCollision = true;
    taffyShack.add(tsSvcWin, tsSideWin, icCone, icScoop);
    group.add(taffyShack);

    // 7. Dock Bollards & Life Preservers on Boardwalk Railing
    for (let bz = 28; bz <= 52; bz += 8) {
      const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8), mats.black);
      bollard.position.set(-30, 0.6, bz);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.2, 6, 12), mats.red);
      ring.position.set(-30, 1.8, bz);
      ring.userData.noCollision = true;
      group.add(bollard, ring);
    }

    return group;
  }

  // 1. Downtown Builder (Detailed Manhattan Skyscraper Cluster)
  private static populateDowntownDetailed(city: any, parent: THREE.Group) {
    const mats = this.getMaterials(city);

    // Central Avenue ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mats.black);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.02;
    ground.userData.noCollision = true;
    parent.add(ground);

    // Empire State replica tower
    const esb = new THREE.Group();
    esb.position.set(0, 0, 0);
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(22, 35, 22), mats.blue);
    b1.position.y = 17.5;
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(16, 35, 16), mats.blue);
    b2.position.y = 52.5;
    const b3 = new THREE.Mesh(new THREE.BoxGeometry(10, 25, 10), mats.blue);
    b3.position.y = 82.5;
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.2, 28), mats.red);
    spire.position.y = 109;
    esb.add(b1, b2, b3, spire);

    const esbDoor = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 0.4), mats.black);
    esbDoor.position.set(0, 2.5, 11.1);
    esbDoor.userData.noCollision = true;
    esb.add(esbDoor);

    [8, 14, 20, 26].forEach(y => {
      [-6, -2, 2, 6].forEach(x => {
        const wf = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.3), mats.cyan); wf.position.set(x, y, 11.1); wf.userData.noCollision = true;
        const wb = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.3), mats.cyan); wb.position.set(x, y, -11.1); wb.userData.noCollision = true;
        const wl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2, 3), mats.cyan); wl.position.set(-11.1, y, x); wl.userData.noCollision = true;
        const wr = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2, 3), mats.cyan); wr.position.set(11.1, y, x); wr.userData.noCollision = true;
        esb.add(wf, wb, wl, wr);
      });
    });

    const ledge1 = new THREE.Mesh(new THREE.BoxGeometry(22.2, 0.5, 0.4), mats.orange); ledge1.position.set(0, 35, 11.1);
    const terrace1 = new THREE.Mesh(new THREE.BoxGeometry(22.5, 0.4, 22.5), mats.blue); terrace1.position.set(0, 35, 0);
    const ledge2 = new THREE.Mesh(new THREE.BoxGeometry(16.2, 0.5, 0.4), mats.orange); ledge2.position.set(0, 70, 8.1);
    const terrace2 = new THREE.Mesh(new THREE.BoxGeometry(16.5, 0.4, 16.5), mats.blue); terrace2.position.set(0, 70, 0);
    esb.add(ledge1, terrace1, ledge2, terrace2);

    [-4.8, 4.8].forEach(x => {
      [-4.8, 4.8].forEach(z => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2, 0.2), mats.orange);
        post.position.set(x, 96, z);
        esb.add(post);
      });
    });
    parent.add(esb);

    // Chrysler Art Deco Tower
    const chrysler = new THREE.Group();
    chrysler.position.set(32, 0, -25);
    const cBody = new THREE.Mesh(new THREE.BoxGeometry(16, 65, 16), mats.blue);
    cBody.position.y = 32.5;
    const cCrown = new THREE.Mesh(new THREE.ConeGeometry(9, 24, 8), mats.cyan);
    cCrown.position.y = 77;
    const cNeedle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 18), mats.orange);
    cNeedle.position.y = 96;
    chrysler.add(cBody, cCrown, cNeedle);

    [-8, 8].forEach(x => {
      [-8, 8].forEach(z => {
        const gargoyle = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 0.6), mats.orange);
        gargoyle.position.set(x, 55, z);
        chrysler.add(gargoyle);
      });
    });
    const cCanopy = new THREE.Mesh(new THREE.BoxGeometry(12, 1, 4), mats.orange);
    cCanopy.position.set(0, 3, 8.1);
    chrysler.add(cCanopy);
    
    [15, 30, 45].forEach(y => {
      [-4, 0, 4].forEach(x => {
        const cw = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.3), mats.cyan);
        cw.position.set(x, y, 8.1);
        cw.userData.noCollision = true;
        chrysler.add(cw);
      });
    });
    parent.add(chrysler);

    // Flatiron Wedge Tower
    const flatiron = new THREE.Group();
    flatiron.position.set(-30, 0, 25);
    const fBody = new THREE.Mesh(new THREE.CylinderGeometry(1, 10, 48, 3), mats.blue);
    fBody.position.y = 24;
    flatiron.add(fBody);

    const fAwning = new THREE.Mesh(new THREE.BoxGeometry(5, 0.6, 3), mats.red);
    fAwning.position.set(0, 2, 6);
    const fCornice = new THREE.Mesh(new THREE.TorusGeometry(3, 0.3, 6, 8), mats.orange);
    fCornice.position.set(0, 48, 0);
    fCornice.rotation.x = Math.PI / 2;
    flatiron.add(fAwning, fCornice);
    parent.add(flatiron);

    // Times Square Canyon Digital Billboards
    const tsGroup = new THREE.Group();
    tsGroup.position.set(0, 0, 32);
    const tsBldg = new THREE.Mesh(new THREE.BoxGeometry(20, 30, 14), mats.black);
    tsBldg.position.y = 15;
    const ledScreen1 = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 0.4), mats.red);
    ledScreen1.position.set(0, 20, 7.2);
    const ledScreen2 = new THREE.Mesh(new THREE.BoxGeometry(16, 8, 0.4), mats.cyan);
    ledScreen2.position.set(0, 9, 7.2);
    tsGroup.add(tsBldg, ledScreen1, ledScreen2);

    [-9.5, 9.5].forEach(x => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1, 28, 0.5), mats.orange);
      pillar.position.set(x, 14, 7.2);
      tsGroup.add(pillar);
    });
    const ticker = new THREE.Mesh(new THREE.BoxGeometry(16, 1.5, 0.4), mats.green);
    ticker.position.set(0, 4, 7.2);
    tsGroup.add(ticker);
    parent.add(tsGroup);

    // Brownstone row with rooftop water towers and fire escapes
    for (let z = -40; z <= -10; z += 12) {
      const bs = new THREE.Mesh(new THREE.BoxGeometry(10, 14, 10), mats.orange);
      bs.position.set(-35, 7, z);
      const wtLegs = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3, 2.4), mats.black);
      wtLegs.position.set(-35, 15.5, z);
      const wtTank = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 3, 12), mats.orange);
      wtTank.position.set(-35, 18.5, z);
      
      const bsDoor = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.3), mats.black);
      bsDoor.position.set(-35, 1.5, z + 5.15);
      bsDoor.userData.noCollision = true;
      
      const bsWin1 = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.3), mats.cyan);
      bsWin1.position.set(-37, 8, z + 5.15);
      bsWin1.userData.noCollision = true;
      const bsWin2 = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.3), mats.cyan);
      bsWin2.position.set(-33, 8, z + 5.15);
      bsWin2.userData.noCollision = true;
      
      const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.3, 10, 1), mats.orange);
      ladder.position.set(-30.1, 7, z);

      parent.add(bs, wtLegs, wtTank, bsDoor, bsWin1, bsWin2, ladder);
    }

    // Grand Central Terminal (Historic Beaux-Arts Station Hall)
    const gct = new THREE.Group();
    gct.position.set(30, 0, 20);
    const gctBase = new THREE.Mesh(new THREE.BoxGeometry(24, 18, 30), mats.blue);
    gctBase.position.y = 9;
    const gctClockArch = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 3, 16), mats.orange);
    gctClockArch.rotation.x = Math.PI / 2;
    gctClockArch.position.set(0, 19, -14);
    for (let colX of [-8, -4, 4, 8]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 16, 8), mats.black);
      col.position.set(colX, 8, -14.5);
      gct.add(col);
    }
    
    [-6, 0, 6].forEach(x => {
      const door = new THREE.Mesh(new THREE.BoxGeometry(4, 8, 0.5), mats.black);
      door.position.set(x, 4, -14.5);
      door.userData.noCollision = true;
      gct.add(door);
    });
    const rClock = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.3, 12), mats.orange);
    rClock.rotation.x = Math.PI / 2;
    rClock.position.set(0, 18.5, -15.5);
    const rClockBg = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 8), mats.red);
    rClockBg.position.set(0, 18.5, -15.2);
    gct.add(rClock, rClockBg);
    
    gct.add(gctBase, gctClockArch);
    parent.add(gct);

    // Wall Street Charging Bull Bronze Sculpture
    const bull = new THREE.Group();
    bull.position.set(-15, 0, -15);
    const bullBody = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 5), mats.orange);
    bullBody.position.y = 1.6;
    const bullHead = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.2, 4), mats.orange);
    bullHead.position.set(0, 1.6, 2.6);
    bullHead.rotation.x = Math.PI / 3;
    const bullPlinth = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.6, 6.5), mats.black);
    bullPlinth.position.y = 0.3;
    bull.add(bullBody, bullHead, bullPlinth);
    parent.add(bull);

    // NYC Yellow Cabs with Rooftop Fare Lights
    const cab1 = new THREE.Group();
    cab1.position.set(-8, 0, 12);
    const c1Body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 6.5), mats.orange);
    c1Body.position.y = 0.9;
    const c1Cab = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 3.6), mats.black);
    c1Cab.position.set(0, 2.1, -0.4);
    const c1Light = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 1.4), mats.red);
    c1Light.position.set(0, 2.8, -0.4);
    
    [-1.2, 1.2].forEach(x => {
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), mats.orange);
      hl.position.set(x, 0.9, 3.1);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.1), mats.red);
      tl.position.set(x, 0.9, -3.3);
      cab1.add(hl, tl);
    });
    
    cab1.add(c1Body, c1Cab, c1Light);
    parent.add(cab1);

    // NYC Hot Dog Cart with Striped Umbrella
    const hotdogCart = new THREE.Group();
    hotdogCart.position.set(-12, 0, 28);
    const hdBox = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 3.2), mats.black);
    hdBox.position.y = 1.0;
    const hdPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.5), mats.black);
    hdPole.position.set(0, 2.8, 0);
    const hdUmbrella = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.2, 8), mats.red);
    hdUmbrella.position.set(0, 4.5, 0);
    hotdogCart.add(hdBox, hdPole, hdUmbrella);
    parent.add(hotdogCart);

    // Steaming Manhole Cover with Doodle Steam Puffs
    const manhole = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.1, 12), mats.black);
    manhole.position.set(-4, 0.04, -8);
    manhole.userData.noCollision = true;
    for (let p = 0; p < 3; p++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.5 + p * 0.25, 6, 6), mats.cyan);
      puff.position.set(-4 + (p - 1) * 0.3, 0.8 + p * 0.9, -8);
      puff.scale.set(1, 0.6, 1);
      puff.userData.noCollision = true;
      parent.add(puff);
    }
    parent.add(manhole);
  }

  // 2. Entertainment District
  public static buildEntertainment(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // Ground Plaza
    const plaza = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mats.black);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.02;
    plaza.userData.noCollision = true;
    group.add(plaza);

    // 1. DOODLE DOME Arena
    const dome = new THREE.Group();
    dome.position.set(0, 0, -20);
    const dBase = new THREE.Mesh(new THREE.CylinderGeometry(28, 30, 12, 24), mats.blue);
    dBase.position.y = 6;
    const dRoof = new THREE.Mesh(new THREE.SphereGeometry(28, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), mats.cyan);
    dRoof.position.y = 12;
    const dMarquee = new THREE.Mesh(new THREE.BoxGeometry(20, 4, 0.5), mats.red);
    dMarquee.position.set(0, 10, 29.5);
    
    [[0,30], [30,0], [0,-30], [-30,0]].forEach(([gx, gz], i) => {
      const gate = new THREE.Mesh(new THREE.BoxGeometry(6, 8, 1), mats.black);
      gate.position.set(gx, 4, gz);
      gate.rotation.y = i * Math.PI / 2;
      gate.userData.noCollision = true;
      dome.add(gate);
    });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spot = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 6), mats.orange);
      spot.position.set(Math.sin(angle) * 28, 12, Math.cos(angle) * 28);
      spot.rotation.x = -Math.PI / 2; 
      spot.lookAt(new THREE.Vector3(spot.position.x, spot.position.y + 10, spot.position.z));
      dome.add(spot);
    }
    
    dome.add(dBase, dRoof, dMarquee);
    group.add(dome);

    // 2. STARLIGHT THEATER with Flashing Marquee & Red Carpet
    const theater = new THREE.Group();
    theater.position.set(-36, 0, 24);
    const tBody = new THREE.Mesh(new THREE.BoxGeometry(22, 22, 26), mats.blue);
    tBody.position.y = 11;
    const tCanopy = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 8), mats.orange);
    tCanopy.position.set(0, 6, 16);
    const tSign = new THREE.Mesh(new THREE.BoxGeometry(16, 5, 0.4), mats.red);
    tSign.position.set(0, 10, 13.5);
    
    [8, 14, 20].forEach(y => {
      [6, 18].forEach(z => {
        const win = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 0.3), mats.cyan);
        win.position.set(-11.1, y, z);
        win.userData.noCollision = true;
        win.rotation.y = Math.PI / 2;
        theater.add(win);
      });
    });
    const tBooth = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 2), mats.black);
    tBooth.position.set(0, 1.5, 26.1);
    theater.add(tBooth);
    [-6, 6].forEach(x => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4), mats.orange);
      pole.position.set(x, 24, 0); // "rooftop STARLIGHT sign support poles at x=±6, y=24" 
      theater.add(pole);
    });
    
    // Red Carpet with Brass Stanchions
    const carpet = new THREE.Mesh(new THREE.BoxGeometry(5, 0.08, 16), mats.red);
    carpet.position.set(0, 0.05, 18);
    carpet.userData.noCollision = true;
    for (let stz = 12; stz <= 24; stz += 4) {
      const sL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8), mats.orange);
      sL.position.set(-2.8, 0.6, stz);
      const sR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8), mats.orange);
      sR.position.set(2.8, 0.6, stz);
      theater.add(sL, sR);
    }
    theater.add(tBody, tCanopy, tSign, carpet);
    group.add(theater);

    // 3. PIXEL PALACE Arcade & Retro Cabinets
    const arcade = new THREE.Group();
    arcade.position.set(36, 0, 24);
    const aBody = new THREE.Mesh(new THREE.BoxGeometry(20, 18, 22), mats.black);
    aBody.position.y = 9;
    const aScreen = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 0.4), mats.cyan);
    aScreen.position.set(0, 10, 11.2);
    
    const nbTop = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 0.4), mats.orange); nbTop.position.set(0, 14.2, 11.3);
    const nbBot = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 0.4), mats.orange); nbBot.position.set(0, 5.8, 11.3);
    const nbL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 0.4), mats.orange); nbL.position.set(-7.2, 10, 11.3);
    const nbR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8, 0.4), mats.orange); nbR.position.set(7.2, 10, 11.3);
    arcade.add(nbTop, nbBot, nbL, nbR);
    
    [-10.1, 10.1].forEach(x => {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 8), mats.black);
      vent.position.set(x, 14, 0);
      arcade.add(vent);
    });
    
    const aDoor = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 0.3), mats.black);
    aDoor.position.set(0, 3, 11.1);
    aDoor.userData.noCollision = true;
    arcade.add(aDoor);
    
    // Giant Popcorn Bucket Monument
    const pop = new THREE.Group();
    pop.position.set(-8, 0, 14);
    const pBucket = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.2, 3, 12), mats.red);
    pBucket.position.y = 1.5;
    const pCorn = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 8), mats.orange);
    pCorn.position.y = 3.2;
    pop.add(pBucket, pCorn);
    arcade.add(aBody, aScreen, pop);
    group.add(arcade);

    // 4. Walk of Fame Gold Stars along Sidewalk
    for (let starX = -20; starX <= 20; starX += 8) {
      const star = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 1.6), mats.orange);
      star.position.set(starX, 0.04, 8);
      star.rotation.y = Math.PI / 4;
      star.userData.noCollision = true;
      group.add(star);
    }

    // 5. Open-Air Music Amphitheater Stage & Spotlights
    const ampStage = new THREE.Group();
    ampStage.position.set(0, 0, 42);
    const sDeck = new THREE.Mesh(new THREE.CylinderGeometry(14, 15, 1.6, 16), mats.black);
    sDeck.position.y = 0.8;
    const sBackdrop = new THREE.Mesh(new THREE.BoxGeometry(22, 10, 1.4), mats.blue);
    sBackdrop.position.set(0, 5.8, -5);
    const sTruss = new THREE.Mesh(new THREE.BoxGeometry(24, 1.2, 1.2), mats.orange);
    sTruss.position.set(0, 11, -5);
    
    [-8, 8].forEach(x => {
      const speaker = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 1.5), mats.black);
      speaker.position.set(x, 1.6, 0);
      ampStage.add(speaker);
    });
    
    [-8, -3, 3, 8].forEach(x => {
      const light = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 6), mats.cyan);
      light.position.set(x, 9.5, -5);
      light.rotation.x = Math.PI;
      ampStage.add(light);
    });
    
    ampStage.add(sDeck, sBackdrop, sTruss);
    group.add(ampStage);

    return group;
  }

  // 3. Market District
  public static buildMarket(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // Cobblestone ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), mats.black);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.02;
    ground.userData.noCollision = true;
    group.add(ground);

    // Central Covered Grand Bazaar Hall with Pagoda Eaves
    const hall = new THREE.Group();
    hall.position.set(0, 0, 0);
    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(18, 6, 4), mats.orange);
    roof1.position.y = 11;
    roof1.rotation.y = Math.PI / 4;
    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(12, 5, 4), mats.red);
    roof2.position.y = 16;
    roof2.rotation.y = Math.PI / 4;
    // Pillars
    for (let px of [-10, 10]) {
      for (let pz of [-10, 10]) {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 10, 1.4), mats.blue);
        pillar.position.set(px, 5, pz);
        hall.add(pillar);
        
        const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.6), mats.orange);
        lantern.position.set(px, 8, pz);
        lantern.userData.noCollision = true;
        hall.add(lantern);
      }
    }
    const hFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.8, 4), mats.red);
    hFinial.position.set(0, 20, 0);
    hall.add(hFinial);

    for (let px of [-10, 10]) {
      const curtain = new THREE.Mesh(new THREE.BoxGeometry(0.2, 6, 8), mats.red);
      curtain.position.set(px, 5, 0);
      curtain.userData.noCollision = true;
      hall.add(curtain);
    }
    for (let pz of [-10, 10]) {
      const curtain = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 0.2), mats.red);
      curtain.position.set(0, 5, pz);
      curtain.userData.noCollision = true;
      hall.add(curtain);
    }

    hall.add(roof1, roof2);
    group.add(hall);

    // Ramen Noodle Bar Counter with Stools & Noren Curtain
    const ramenBar = new THREE.Group();
    ramenBar.position.set(0, 0, -28);
    const rCounter = new THREE.Mesh(new THREE.BoxGeometry(14, 2.2, 3), mats.orange);
    rCounter.position.y = 1.1;
    const rSign = new THREE.Mesh(new THREE.BoxGeometry(12, 1.5, 0.3), mats.red);
    rSign.position.set(0, 4.2, 1.4);
    for (let stX = -5; stX <= 5; stX += 2.5) {
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 8), mats.black);
      stool.position.set(stX, 0.6, 2.4);
      ramenBar.add(stool);
    }
    for (let sx = -5; sx <= 5; sx += 2.5) {
      const noren = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.1), mats.red);
      noren.position.set(sx, 3.5, 1.6);
      noren.userData.noCollision = true;
      ramenBar.add(noren);
    }
    for (let sx of [-4, 0, 4]) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.4), mats.cyan);
      puff.position.set(sx, 3, 0);
      puff.userData.noCollision = true;
      ramenBar.add(puff);
    }
    const rMenu = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 0.3), mats.black);
    rMenu.position.set(0, 4, -1.7);
    ramenBar.add(rMenu);

    ramenBar.add(rCounter, rSign);
    group.add(ramenBar);

    // Market stalls lining the street with crate stacks & paper lanterns
    const stallColors = [mats.red, mats.orange, mats.green, mats.cyan, mats.blue];
    for (let i = 0; i < 6; i++) {
      const zPos = -24 + i * 9;
      // West stall
      const s1 = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 5), mats.black);
      s1.position.set(-20, 2, zPos);
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 6), stallColors[i % stallColors.length]);
      c1.position.set(-20, 4.4, zPos);
      // Wooden fruit crate stacks
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 1.8), mats.orange);
      crate.position.set(-15.5, 0.7, zPos);
      
      for (let px of [-23, -17]) {
        for (let pz of [zPos - 2.5, zPos + 2.5]) {
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4), mats.black);
          pole.position.set(px, 2, pz);
          group.add(pole);
        }
      }

      group.add(s1, c1, crate);

      // East stall
      const s2 = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 5), mats.black);
      s2.position.set(20, 2, zPos);
      const c2 = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 6), stallColors[(i + 2) % stallColors.length]);
      c2.position.set(20, 4.4, zPos);
      // Paper hanging lanterns
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 6), mats.red);
      lantern.position.set(16, 3.8, zPos);
      lantern.userData.noCollision = true;
      
      for (let px of [17, 23]) {
        for (let pz of [zPos - 2.5, zPos + 2.5]) {
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4), mats.black);
          pole.position.set(px, 2, pz);
          group.add(pole);
        }
      }

      group.add(s2, c2, lantern);
    }

    return group;
  }

  // 6. Residential Hills (Terraced winding hillside villas)
  public static buildResidentialHills(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // Tiered Hillside Platforms (climbing from Y: 0 to Y: 25)
    const tiers = [
      { y: 6, w: 130, d: 35, z: 35 },
      { y: 14, w: 120, d: 35, z: 5 },
      { y: 22, w: 110, d: 35, z: -25 },
      { y: 25, w: 90, d: 30, z: -55 },
    ];
    tiers.forEach((t) => {
      const plat = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.y, t.d), mats.green);
      plat.position.set(0, t.y / 2, t.z);
      group.add(plat);
    });

    // Hillside Houses & Villas
    const houseConfigs = [
      { x: -35, y: 6, z: 35, color: mats.orange },
      { x: 35, y: 6, z: 35, color: mats.blue },
      { x: -30, y: 14, z: 5, color: mats.red },
      { x: 30, y: 14, z: 5, color: mats.orange },
      { x: -25, y: 22, z: -25, color: mats.blue },
      { x: 25, y: 22, z: -25, color: mats.red },
    ];
    houseConfigs.forEach((h) => {
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(14, 10, 12), h.color);
      bldg.position.set(h.x, h.y + 5, h.z);
      const rf = new THREE.Mesh(new THREE.ConeGeometry(9, 5, 4), mats.black);
      rf.position.set(h.x, h.y + 12.5, h.z);
      rf.rotation.y = Math.PI / 4;

      const winL = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.3), mats.cyan);
      winL.position.set(h.x - 3, h.y + 4, h.z + 6.1);
      winL.userData.noCollision = true;
      const winR = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.3), mats.cyan);
      winR.position.set(h.x + 3, h.y + 4, h.z + 6.1);
      winR.userData.noCollision = true;
      const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.3), mats.black);
      door.position.set(h.x, h.y + 1.5, h.z + 6.1);
      door.userData.noCollision = true;
      const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3, 1.2), mats.black);
      chimney.position.set(h.x + 5, h.y + 13, h.z);
      const mailbox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.3), mats.red);
      mailbox.position.set(h.x + 8, h.y + 0.5, h.z + 6);
      mailbox.userData.noCollision = true;

      group.add(bldg, rf, winL, winR, door, chimney, mailbox);
    });

    // Summit Astronomical Observatory with Revolving Dome & Radio Mast
    const obs = new THREE.Group();
    obs.position.set(0, 25, -55);
    const obsBase = new THREE.Mesh(new THREE.CylinderGeometry(10, 11, 12, 16), mats.black);
    obsBase.position.y = 6;
    const obsDome = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.cyan);
    obsDome.position.y = 12;
    const telescope = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 16, 8), mats.red);
    telescope.position.set(0, 16, 4);
    telescope.rotation.x = Math.PI / 3;
    const radioMast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 22), mats.orange);
    radioMast.position.set(12, 11, 0);

    const obsDoor = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 0.4), mats.black);
    obsDoor.position.set(0, 2.5, 11.1);
    obsDoor.userData.noCollision = true;
    const obsSlit = new THREE.Mesh(new THREE.BoxGeometry(2, 8, 0.3), mats.cyan);
    obsSlit.position.set(0, 8, 11.1);
    obsSlit.userData.noCollision = true;
    const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 20), mats.black);
    shutter.position.set(0, 13, 0);
    shutter.userData.noCollision = true;

    obs.add(obsBase, obsDome, telescope, radioMast, obsDoor, obsSlit, shutter);
    group.add(obs);

    // Hillside Luxury Villa with Swimming Pool & Diving Board
    const villa = new THREE.Group();
    villa.position.set(-42, 6, 20);
    const vMain = new THREE.Mesh(new THREE.BoxGeometry(18, 9, 14), mats.blue);
    vMain.position.y = 4.5;
    const pool = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 14), mats.cyan);
    pool.position.set(14, 0.2, 0);
    const board = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 1.2), mats.orange);
    board.position.set(11, 0.8, 0);

    [-5, 0, 5].forEach(wx => {
      const vWin = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2, 0.3), mats.cyan);
      vWin.position.set(wx, 5, 7.1);
      vWin.userData.noCollision = true;
      villa.add(vWin);
    });
    const vDoor = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 0.3), mats.black);
    vDoor.position.set(0, 2, 7.1);
    vDoor.userData.noCollision = true;
    const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 0.3), mats.orange);
    ladder.position.set(19, 0.6, 5);
    const lounge = new THREE.Mesh(new THREE.BoxGeometry(3, 0.4, 1.2), mats.orange);
    lounge.position.set(16, 0.4, -5);
    lounge.userData.noCollision = true;
    const palmTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 4), mats.orange);
    palmTrunk.position.set(20, 2, -3);
    palmTrunk.userData.noCollision = true;
    const palmCanopy = new THREE.Mesh(new THREE.SphereGeometry(2), mats.green);
    palmCanopy.position.set(20, 4.5, -3);
    palmCanopy.userData.noCollision = true;

    villa.add(vMain, pool, board, vDoor, ladder, lounge, palmTrunk, palmCanopy);
    group.add(villa);

    // Winding Picket Fences & Stone Retaining Walls along Switchback
    for (let fz = -45; fz <= 25; fz += 14) {
      const fenceL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.6, 10), mats.orange);
      fenceL.position.set(-18, 12, fz);
      const fenceR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.6, 10), mats.orange);
      fenceR.position.set(18, 12, fz);
      group.add(fenceL, fenceR);
    }

    return group;
  }

  // 7. Cloud District (Stratospheric Spires & Skybridges)
  public static buildCloudDistrict(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // Floating sky platform ground at Y: 80
    const skyPlat = new THREE.Mesh(new THREE.BoxGeometry(140, 2.5, 120), mats.blue);
    skyPlat.position.set(0, 0, 0);
    group.add(skyPlat);

    // Support pylon columns plunging downward
    for (let px of [-45, 45]) {
      for (let pz of [-35, 35]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 80, 8), mats.black);
        col.position.set(px, -40, pz);
        group.add(col);
      }
    }

    // 1. APEX SKY SPIRE (Towering upwards to Y: +60, world Y: 140m)
    const spire = new THREE.Group();
    spire.position.set(0, 1.25, 0);
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(24, 30, 24), mats.cyan);
    s1.position.y = 15;
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(16, 30, 16), mats.blue);
    s2.position.y = 45;
    const sAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.8, 25), mats.red);
    sAntenna.position.y = 72.5;

    for (let wy = 5; wy <= 25; wy += 5) {
      for (let wx = -8; wx <= 8; wx += 8) {
        const w = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 0.3), mats.cyan);
        w.position.set(wx, wy, 12.1);
        w.userData.noCollision = true;
        spire.add(w);
      }
    }
    for (let wy = 35; wy <= 55; wy += 7) {
      for (let wx of [-4, 4]) {
        const w = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 0.3), mats.cyan);
        w.position.set(wx, wy, 8.1);
        w.userData.noCollision = true;
        spire.add(w);
      }
    }
    const lobby = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 0.5), mats.black);
    lobby.position.set(0, 3, 12.1);
    lobby.userData.noCollision = true;
    spire.add(lobby);

    const rN = new THREE.Mesh(new THREE.BoxGeometry(16, 1, 0.2), mats.orange);
    rN.position.set(0, 60, -8);
    const rS = new THREE.Mesh(new THREE.BoxGeometry(16, 1, 0.2), mats.orange);
    rS.position.set(0, 60, 8);
    const rE = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 16), mats.orange);
    rE.position.set(8, 60, 0);
    const rW = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 16), mats.orange);
    rW.position.set(-8, 60, 0);
    spire.add(rN, rS, rE, rW);

    spire.add(s1, s2, sAntenna);
    group.add(spire);

    // 2. West & East Flanking Sky Towers
    const towerW = new THREE.Mesh(new THREE.BoxGeometry(18, 45, 18), mats.blue);
    towerW.position.set(-45, 23.75, 0);
    const towerE = new THREE.Mesh(new THREE.BoxGeometry(18, 45, 18), mats.blue);
    towerE.position.set(45, 23.75, 0);
    
    [towerW, towerE].forEach(t => {
      [9.1, -9.1].forEach(wz => {
        [10, 20, 30, 40].forEach(wy => {
          [-5, 5].forEach(wx => {
            const w = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 0.3), mats.cyan);
            w.position.set(t.position.x + wx, wy, t.position.z + wz);
            w.userData.noCollision = true;
            group.add(w);
          });
        });
      });
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 8), mats.orange);
      ant.position.set(t.position.x, 46.5, t.position.z);
      group.add(ant);
    });

    group.add(towerW, towerE);

    // Skybridges linking towers
    const bridgeW = new THREE.Mesh(new THREE.BoxGeometry(32, 2.4, 4), mats.orange);
    bridgeW.position.set(-24, 25, 0);
    const bridgeE = new THREE.Mesh(new THREE.BoxGeometry(32, 2.4, 4), mats.orange);
    bridgeE.position.set(24, 25, 0);
    group.add(bridgeW, bridgeE);

    // 3. Cantilever Glass-Bottom Skywalk over Abyss
    const skywalk = new THREE.Group();
    skywalk.position.set(0, 1.4, -60);
    const swGlass = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, 26), mats.cyan);
    swGlass.position.set(0, 0.3, -10);
    const swRailL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.2, 26), mats.red);
    swRailL.position.set(-7, 1.4, -10);
    const swRailR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.2, 26), mats.red);
    swRailR.position.set(7, 1.4, -10);
    skywalk.add(swGlass, swRailL, swRailR);
    group.add(skywalk);

    // 4. Grand Airship Mooring Mast & Paper Zeppelin ("H.M.S. DOODLE")
    const airship = new THREE.Group();
    airship.position.set(50, 42, 45);
    const gasbag = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 44, 16), mats.orange);
    gasbag.rotation.z = Math.PI / 2;
    const nose = new THREE.Mesh(new THREE.ConeGeometry(8, 12, 16), mats.red);
    nose.position.set(28, 0, 0);
    nose.rotation.z = -Math.PI / 2;
    const gondola = new THREE.Mesh(new THREE.BoxGeometry(14, 3, 5), mats.black);
    gondola.position.set(0, -9.5, 0);
    const fins = new THREE.Mesh(new THREE.BoxGeometry(12, 18, 0.4), mats.blue);
    fins.position.set(-18, 0, 0);

    [-4, 0, 4].forEach(px => {
      const port = new THREE.Mesh(new THREE.SphereGeometry(0.5), mats.cyan);
      port.position.set(px, -9.5, 2.5);
      port.userData.noCollision = true;
      airship.add(port);
      const port2 = new THREE.Mesh(new THREE.SphereGeometry(0.5), mats.cyan);
      port2.position.set(px, -9.5, -2.5);
      port2.userData.noCollision = true;
      airship.add(port2);
    });

    const prop1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6, 0.5), mats.orange);
    prop1.position.set(-24, 0, 0);
    prop1.rotation.x = Math.PI / 4;
    prop1.userData.noCollision = true;
    const prop2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6, 0.5), mats.orange);
    prop2.position.set(-24, 0, 0);
    prop2.rotation.x = -Math.PI / 4;
    prop2.userData.noCollision = true;

    airship.add(gasbag, nose, gondola, fins, prop1, prop2);
    group.add(airship);

    // Helipad on East Tower Roof
    const helipad = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 0.4, 16), mats.black);
    helipad.position.set(45, 46.5, 0);
    const hMark = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 1), mats.orange);
    hMark.position.set(45, 46.8, 0);
    group.add(helipad, hMark);

    // Clouds drifting below platform
    for (let cx of [-60, -20, 30, 60]) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(18, 12, 8), mats.cyan);
      cloud.scale.set(1.6, 0.4, 1.2);
      cloud.position.set(cx, -15, (cx % 30) * 1.5);
      cloud.userData.noCollision = true;
      group.add(cloud);
    }

    return group;
  }

  // 8. University / Creative District
  public static buildUniversity(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // Campus Quad ground
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mats.green);
    quad.rotation.x = -Math.PI / 2;
    quad.position.y = 0.02;
    quad.userData.noCollision = true;
    group.add(quad);

    // Grand Domed Library with Classical Corinthian Portico
    const lib = new THREE.Group();
    lib.position.set(0, 0, -30);
    const lBody = new THREE.Mesh(new THREE.BoxGeometry(34, 18, 22), mats.blue);
    lBody.position.y = 9;
    const lDome = new THREE.Mesh(new THREE.SphereGeometry(12, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.orange);
    lDome.position.y = 18;
    // Portico pillars
    for (let px of [-12, -6, 0, 6, 12]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 16, 8), mats.black);
      p.position.set(px, 8, 12);
      lib.add(p);
    }
    [-12, -4, 4, 12].forEach(wx => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(3, 8, 0.3), mats.cyan);
      w.position.set(wx, 9, 11.15);
      w.userData.noCollision = true;
      lib.add(w);
    });
    const lDoor = new THREE.Mesh(new THREE.BoxGeometry(6, 8, 0.4), mats.black);
    lDoor.position.set(0, 4, 11.15);
    lDoor.userData.noCollision = true;
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(20, 1.5, 0.5), mats.orange);
    lintel.position.set(0, 16, 11.2);
    const urnL = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.7, 2, 8), mats.orange);
    urnL.position.set(-8, 1, 13);
    const urnR = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.7, 2, 8), mats.orange);
    urnR.position.set(8, 1, 13);
    lib.add(lDoor, lintel, urnL, urnR);

    lib.add(lBody, lDome);
    group.add(lib);

    // Campus Bell & Carillon Clock Tower
    const bellTower = new THREE.Group();
    bellTower.position.set(-45, 0, -30);
    const btShaft = new THREE.Mesh(new THREE.BoxGeometry(8, 38, 8), mats.orange);
    btShaft.position.y = 19;
    const btSpire = new THREE.Mesh(new THREE.ConeGeometry(5.5, 14, 4), mats.red);
    btSpire.position.y = 45;
    btSpire.rotation.y = Math.PI / 4;
    [10, 20, 30].forEach(wy => {
      const slit = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 0.3), mats.cyan);
      slit.position.set(0, wy, 4.1);
      slit.userData.noCollision = true;
      bellTower.add(slit);
    });
    const btDoor = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4, 0.3), mats.black);
    btDoor.position.set(0, 2, 4.1);
    btDoor.userData.noCollision = true;
    const bell = new THREE.Mesh(new THREE.SphereGeometry(1.5), mats.orange);
    bell.position.set(0, 40, 0);
    bellTower.add(btDoor, bell);

    bellTower.add(btShaft, btSpire);
    group.add(bellTower);

    // Science Lecture Hall & Observatory
    const sci = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 28), mats.blue);
    sci.position.set(-36, 7, 10);
    
    [-43, -36, -29].forEach(wx => {
      const sWin = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 0.3), mats.cyan);
      sWin.position.set(wx, 15, 24.1);
      sWin.userData.noCollision = true;
      group.add(sWin);
    });
    const sDoor = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 0.4), mats.black);
    sDoor.position.set(-36, 9.5, 24.1);
    sDoor.userData.noCollision = true;
    const dish = new THREE.Mesh(new THREE.ConeGeometry(2, 1.5, 8), mats.cyan);
    dish.position.set(-36, 22, 10);
    group.add(sci, sDoor, dish);

    // Arts & Design Studios
    const arts = new THREE.Mesh(new THREE.BoxGeometry(24, 16, 26), mats.orange);
    arts.position.set(36, 8, 10);
    
    [-9, -3, 3, 9].forEach(dx => {
      const aWin = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.3), mats.cyan);
      aWin.position.set(36 + dx, 18, 23.1);
      aWin.userData.noCollision = true;
      group.add(aWin);
    });
    const aDoor = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 0.4), mats.black);
    aDoor.position.set(36, 10.5, 23.1);
    aDoor.userData.noCollision = true;
    
    const easel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 2), mats.orange);
    easel.position.set(42, 1.5, 24);
    easel.userData.noCollision = true;
    const canvas = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 0.2), mats.red);
    canvas.position.set(42, 3, 24.2);
    canvas.userData.noCollision = true;
    
    group.add(arts, aDoor, easel, canvas);

    // Student Quad Stone Benches & "Founding Architect" Bronze Monument
    for (let bx = -14; bx <= 14; bx += 14) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.8, 1.6), mats.black);
      bench.position.set(bx, 0.4, 4);
      group.add(bench);
    }
    const monument = new THREE.Group();
    monument.position.set(0, 0, 18);
    const mPlinth = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 3), mats.black);
    mPlinth.position.y = 1;
    const mStatue = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 4, 8), mats.orange);
    mStatue.position.y = 4;
    monument.add(mPlinth, mStatue);
    group.add(monument);

    // Outdoor abstract sculpture in quad center
    const sculp = new THREE.Mesh(new THREE.TorusKnotGeometry(3, 0.8, 32, 8), mats.red);
    sculp.position.set(0, 5, 2);
    group.add(sculp);

    return group;
  }

  // 9. Monaco Grand Prix Coastal Circuit
  public static buildMonacoCircuitDetailed(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // Circuit Ground & Harbor Water
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mats.black);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.02;
    ground.userData.noCollision = true;
    group.add(ground);

    // Racing Asphalt Loop with Red/White Kerbs
    const trackLoop = new THREE.Mesh(new THREE.TorusGeometry(38, 5, 8, 28), mats.black);
    trackLoop.rotation.x = Math.PI / 2;
    trackLoop.position.set(0, 0.04, 0);
    trackLoop.userData.noCollision = true;
    // Alternating Red & White Rumble Kerbs
    for (let k = 0; k < 20; k++) {
      const angle = (k / 20) * Math.PI * 2;
      const kX = Math.cos(angle) * 42.5;
      const kZ = Math.sin(angle) * 42.5;
      const kerb = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 1.4), k % 2 === 0 ? mats.red : mats.cyan);
      kerb.position.set(kX, 0.06, kZ);
      kerb.rotation.y = -angle;
      kerb.userData.noCollision = true;
      group.add(kerb);
    }
    group.add(trackLoop);

    // Start/Finish Pit Straight Gantry with 5-Light Array
    const gantry = new THREE.Group();
    gantry.position.set(0, 0, 38);
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 10, 1.2), mats.red);
    p1.position.set(-8, 5, 0);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 10, 1.2), mats.red);
    p2.position.set(8, 5, 0);
    const span = new THREE.Mesh(new THREE.BoxGeometry(18, 2.4, 2), mats.blue);
    span.position.set(0, 9.5, 0);
    for (let lightX = -5; lightX <= 5; lightX += 2.5) {
      const startLight = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), mats.red);
      startLight.position.set(lightX, 9.5, 1.1);
      gantry.add(startLight);
    }
    gantry.add(p1, p2, span);
    group.add(gantry);

    // Multi-tier Grandstands with Team Pit Boxes
    const stand = new THREE.Group();
    stand.position.set(0, 0, 52);
    for (let i = 0; i < 4; i++) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(36, 1.2, 2.5), mats.orange);
      bench.position.set(0, 1 + i * 1.6, -i * 2.2);
      stand.add(bench);
    }
    // Pit Lane Tire Stacks
    for (let tireX of [-12, 0, 12]) {
      const tireStack = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.4, 12), mats.black);
      tireStack.position.set(tireX, 1.2, -4);
      stand.add(tireStack);
    }
    const commBox = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 4), mats.black);
    commBox.position.set(0, 8, -10);
    stand.add(commBox);
    for (let fX of [-14, 0, 14]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 6), mats.black);
      pole.position.set(fX, 3, 0);
      const flag = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 0.1), mats.red);
      flag.position.set(fX + 0.75, 5.5, 0);
      flag.userData.noCollision = true;
      stand.add(pole, flag);
    }
    group.add(stand);

    // Harbor Wall & Superyacht
    const yacht = new THREE.Group();
    yacht.position.set(-25, 0.6, -20);
    const hull = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 24), mats.blue);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 14), mats.orange);
    cabin.position.y = 3.5;
    for (let side of [-3.8, 3.8]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 24), mats.orange);
      rail.position.set(side, 2, 0);
      yacht.add(rail);
    }
    for (let wz of [-3, 0, 3]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 0.3), mats.cyan);
      win.position.set(0, 4.5, wz);
      win.userData.noCollision = true;
      yacht.add(win);
    }
    const rMast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3), mats.black);
    rMast.position.set(0, 6, 0);
    const rDish = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mats.cyan);
    rDish.position.set(0, 7.5, 0);
    rDish.userData.noCollision = true;
    const mFlag = new THREE.Mesh(new THREE.BoxGeometry(1, 0.7, 0.1), mats.red);
    mFlag.position.set(0, 3, 12.5);
    mFlag.userData.noCollision = true;
    yacht.add(hull, cabin, rMast, rDish, mFlag);
    group.add(yacht);

    return group;
  }

  // 10. Industrial District (Blast Furnaces, Freight Rail, Silos & Pipelines)
  public static buildIndustrial(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), mats.black);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.02;
    ground.userData.noCollision = true;
    group.add(ground);

    // Three Industrial Brick Smokestacks with exhaust warning collars
    for (let i = 0; i < 3; i++) {
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(2, 3.4, 42, 12), mats.orange);
      stack.position.set(-35 + i * 14, 21, -30);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.45, 6, 12), mats.red);
      ring.position.set(-35 + i * 14, 39, -30);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 1.2, 12), mats.black);
      rim.position.set(-35 + i * 14, 42, -30);
      group.add(stack, ring, rim);
    }

    // Heavy Assembly Plant with Sawtooth Roof & High-Bay Freight Doors
    const factory = new THREE.Group();
    factory.position.set(28, 0, -12);
    const fBody = new THREE.Mesh(new THREE.BoxGeometry(36, 18, 42), mats.blue);
    fBody.position.y = 9;
    factory.add(fBody);

    for (let wx of [-10, 0, 10]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 0.4), mats.cyan);
      win.position.set(wx, 12, 21.2);
      win.userData.noCollision = true;
      factory.add(win);
    }
    const loadPlat = new THREE.Mesh(new THREE.BoxGeometry(36, 1.5, 3), mats.black);
    loadPlat.position.set(0, 0.75, 22.5);
    factory.add(loadPlat);

    // Sawtooth roof ridge peaks
    for (let rz = -16; rz <= 16; rz += 8) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(36.2, 3.5, 4.5), mats.orange);
      tooth.position.set(0, 19.5, rz);
      tooth.rotation.x = 0.35;
      factory.add(tooth);
    }
    // High-bay roll-up freight bay doors
    for (let bx = -10; bx <= 10; bx += 10) {
      const door = new THREE.Mesh(new THREE.BoxGeometry(7, 9, 0.4), mats.black);
      door.position.set(bx, 4.5, 21.2);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(7, 1, 0.1), mats.orange);
      stripe.position.set(bx, 8.5, 21.3);
      stripe.userData.noCollision = true;
      factory.add(door, stripe);
    }
    // Industrial Facility Signboard
    const facSign = new THREE.Mesh(new THREE.BoxGeometry(22, 3, 0.5), mats.cyan);
    facSign.position.set(0, 16, 21.3);
    factory.add(facSign);
    group.add(factory);

    // Blast Furnace Complex with Skip-Hoist Incline & Dust Catcher
    const blastFurnace = new THREE.Group();
    blastFurnace.position.set(-25, 0, 10);
    const furnaceHearth = new THREE.Mesh(new THREE.CylinderGeometry(6, 7.5, 26, 16), mats.black);
    furnaceHearth.position.y = 13;
    const furnaceTop = new THREE.Mesh(new THREE.ConeGeometry(6, 10, 16), mats.orange);
    furnaceTop.position.y = 31;
    // Skip car incline ramp
    const skipIncline = new THREE.Mesh(new THREE.BoxGeometry(2, 36, 2), mats.red);
    skipIncline.position.set(9, 18, 0);
    skipIncline.rotation.z = -0.52;
    // Dust catcher cyclone cylinder
    const dustCatcher = new THREE.Mesh(new THREE.CylinderGeometry(3, 1.8, 16, 12), mats.blue);
    dustCatcher.position.set(-10, 18, 6);
    blastFurnace.add(furnaceHearth, furnaceTop, skipIncline, dustCatcher);
    
    for (let ly of [6, 10, 14, 18, 22]) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 1.5), mats.orange);
      rung.position.set(7.5, ly, 0);
      blastFurnace.add(rung);
    }
    const bfSign = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.3), mats.red);
    bfSign.position.set(0, 4, 7.6);
    blastFurnace.add(bfSign);
    group.add(blastFurnace);

    // Overhead Industrial Pipeline Conduits & Junction Trestles
    const pipeY = 12;
    const mainPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 54, 12), mats.cyan);
    mainPipe.rotation.z = Math.PI / 2;
    mainPipe.position.set(0, pipeY, 15);
    group.add(mainPipe);
    // Pipeline support pylons
    for (let px = -22; px <= 22; px += 22) {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(1.4, pipeY, 1.4), mats.black);
      pylon.position.set(px, pipeY / 2, 15);
      group.add(pylon);
    }
    // High-pressure circular pipe valves
    for (let px = -12; px <= 12; px += 12) {
      const valve = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.25, 8, 12), mats.red);
      valve.position.set(px, pipeY, 15);
      group.add(valve);
    }

    // Heavy Freight Rail Siding with Diesel Switcher Locomotive & Boxcars
    const railLine = new THREE.Group();
    railLine.position.set(-5, 0, 42);
    const tracks = new THREE.Mesh(new THREE.BoxGeometry(100, 0.2, 5), mats.black);
    tracks.position.y = 0.1;
    tracks.userData.noCollision = true;
    railLine.add(tracks);

    // Diesel Switcher Locomotive
    const loco = new THREE.Group();
    loco.position.set(-20, 0, 0);
    const locoChassis = new THREE.Mesh(new THREE.BoxGeometry(16, 2, 4), mats.black);
    locoChassis.position.y = 1;
    const locoHood = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 3.6), mats.orange);
    locoHood.position.set(-2.5, 4.25, 0);
    const locoCab = new THREE.Mesh(new THREE.BoxGeometry(5, 6, 3.8), mats.red);
    locoCab.position.set(5, 5, 0);
    const locoExhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.5, 8), mats.black);
    locoExhaust.position.set(-5, 7.5, 0);
    
    const hLight = new THREE.Mesh(new THREE.SphereGeometry(0.4), mats.orange);
    hLight.position.set(-8.5, 5, 0);
    hLight.userData.noCollision = true;
    loco.add(hLight);
    
    for (let wz of [-1.5, 1.5]) {
      const cw = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 0.1), mats.cyan);
      cw.position.set(5, 6, wz);
      cw.userData.noCollision = true;
      loco.add(cw);
    }
    loco.add(locoChassis, locoHood, locoCab, locoExhaust);
    railLine.add(loco);

    // Freight Boxcars
    for (let ci = 0; ci < 2; ci++) {
      const boxcar = new THREE.Group();
      boxcar.position.set(6 + ci * 18, 0, 0);
      const bChassis = new THREE.Mesh(new THREE.BoxGeometry(15, 1.8, 3.8), mats.black);
      bChassis.position.y = 0.9;
      const bBody = new THREE.Mesh(new THREE.BoxGeometry(14.6, 5.2, 3.6), ci === 0 ? mats.blue : mats.cyan);
      bBody.position.y = 4.4;
      boxcar.add(bChassis, bBody);
      railLine.add(boxcar);
    }
    group.add(railLine);

    // Steel Storage Silo Battery with Access Catwalks
    for (let sx of [18, 32, 46]) {
      const silo = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 22, 16), mats.cyan);
      silo.position.set(sx, 11, 28);
      const sDome = new THREE.Mesh(new THREE.SphereGeometry(4.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mats.black);
      sDome.position.set(sx, 22, 28);
      const catwalk = new THREE.Mesh(new THREE.TorusGeometry(4.9, 0.3, 6, 16), mats.orange);
      catwalk.rotation.x = Math.PI / 2;
      catwalk.position.set(sx, 16, 28);
      group.add(silo, sDome, catwalk);
    }

    // Chemical Spherical Pressure Tanks
    for (let tx of [18, 32]) {
      const sphereTank = new THREE.Group();
      sphereTank.position.set(tx, 0, -38);
      const tankBall = new THREE.Mesh(new THREE.SphereGeometry(5.5, 16, 16), mats.orange);
      tankBall.position.y = 8;
      // Stilt legs
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 8, 8), mats.black);
        leg.position.set(Math.cos(angle) * 4, 4, Math.sin(angle) * 4);
        sphereTank.add(leg);
      }
      sphereTank.add(tankBall);
      group.add(sphereTank);
    }

    // High-Voltage Electrical Substation & Transformer Tower
    const substation = new THREE.Group();
    substation.position.set(-48, 0, -5);
    const subPylon = new THREE.Mesh(new THREE.BoxGeometry(3, 24, 3), mats.black);
    subPylon.position.y = 12;
    const subArm = new THREE.Mesh(new THREE.BoxGeometry(14, 1.2, 1.2), mats.red);
    subArm.position.set(0, 20, 0);
    // Ceramic insulator discs
    for (let ix of [-5, 0, 5]) {
      const insul = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 2, 8), mats.cyan);
      insul.position.set(ix, 18, 0);
      substation.add(insul);
    }
    substation.add(subPylon, subArm);
    group.add(substation);

    return group;
  }

  // 11. Underground City (Subterranean Hub & Vaulted Tunnels)
  public static buildUnderground(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // Subterranean Bedrock Floor at Y: 0 (sits at -16m in world)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(130, 110), mats.black);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.02;
    floor.userData.noCollision = true;
    group.add(floor);

    // Vaulted Ceiling Arches & Structural Ribs
    for (let x = -48; x <= 48; x += 16) {
      for (let z = -36; z <= 36; z += 18) {
        const col = new THREE.Mesh(new THREE.BoxGeometry(2.4, 14, 2.4), mats.blue);
        col.position.set(x, 7, z);
        const arch = new THREE.Mesh(new THREE.BoxGeometry(16, 1.4, 2.4), mats.orange);
        arch.position.set(x, 14, z);
        const bracket = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 2.8), mats.black);
        bracket.position.set(x, 1.5, z);
        group.add(col, arch, bracket);
      }
    }

    // Central Passenger Subway Platform
    const platform = new THREE.Group();
    platform.position.set(0, 0, 0);
    const platFloor = new THREE.Mesh(new THREE.BoxGeometry(84, 1.2, 16), mats.blue);
    platFloor.position.y = 0.6;
    platform.add(platFloor);

    // Tactile warning safety edge stripes (North & South platform edges)
    const warnEdgeNorth = new THREE.Mesh(new THREE.BoxGeometry(84, 0.08, 0.8), mats.orange);
    warnEdgeNorth.position.set(0, 1.24, 7.6);
    warnEdgeNorth.userData.noCollision = true;
    const warnEdgeSouth = new THREE.Mesh(new THREE.BoxGeometry(84, 0.08, 0.8), mats.orange);
    warnEdgeSouth.position.set(0, 1.24, -7.6);
    warnEdgeSouth.userData.noCollision = true;
    platform.add(warnEdgeNorth, warnEdgeSouth);

    // Suspended Station Destination Signage ("UPTOWN EXPRESS // SECTOR B")
    for (let sx of [-24, 0, 24]) {
      const signGroup = new THREE.Group();
      signGroup.position.set(sx, 7, 0);
      const signBoard = new THREE.Mesh(new THREE.BoxGeometry(8, 2.2, 0.4), mats.cyan);
      const hangerL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5, 6), mats.black);
      hangerL.position.set(-3, 2.5, 0);
      const hangerR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5, 6), mats.black);
      hangerR.position.set(3, 2.5, 0);
      signGroup.add(signBoard, hangerL, hangerR);
      platform.add(signGroup);
    }

    // Turnstiles & Automated Fare Gates
    for (let tz of [-3, 0, 3]) {
      const turnstile = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 2.4), mats.black);
      turnstile.position.set(36, 1.1 + 0.6, tz);
      const gateArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 2.0), mats.red);
      gateArm.position.set(36, 2.0 + 0.6, tz);
      platform.add(turnstile, gateArm);
    }
    // Platform Wooden Passenger Benches
    for (let bx of [-18, 6, 18]) {
      const pBench = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 1.8), mats.orange);
      pBench.position.set(bx, 1.2, 0);
      platform.add(pBench);
    }
    group.add(platform);

    // North Track Bed (with third rail & rails)
    const northTrack = new THREE.Group();
    northTrack.position.set(0, 0, 16);
    const bed = new THREE.Mesh(new THREE.BoxGeometry(90, 0.2, 8), mats.black);
    bed.position.y = 0.1;
    bed.userData.noCollision = true;
    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(90, 0.25, 0.3), mats.cyan);
    rail1.position.set(0, 0.2, 1.5);
    rail1.userData.noCollision = true;
    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(90, 0.25, 0.3), mats.cyan);
    rail2.position.set(0, 0.2, -1.5);
    rail2.userData.noCollision = true;
    // Electrified Third Rail with safety cover
    const thirdRail = new THREE.Mesh(new THREE.BoxGeometry(90, 0.4, 0.5), mats.red);
    thirdRail.position.set(0, 0.3, -3.2);
    thirdRail.userData.noCollision = true;
    northTrack.add(bed, rail1, rail2, thirdRail);
    group.add(northTrack);

    // Metro Subway Train (2-Car Train on North Track)
    const subwayTrain = new THREE.Group();
    subwayTrain.position.set(0, 0, 16);
    for (let ci = 0; ci < 2; ci++) {
      const car = new THREE.Group();
      car.position.set(-16 + ci * 28, 0, 0);
      const cBody = new THREE.Mesh(new THREE.BoxGeometry(25, 5.5, 4.4), mats.red);
      cBody.position.y = 3.2;
      const cRoof = new THREE.Mesh(new THREE.BoxGeometry(24.5, 0.8, 4.2), mats.orange);
      cRoof.position.y = 6.2;
      // Train side windows
      for (let wx = -9; wx <= 9; wx += 4.5) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.8, 4.5), mats.cyan);
        win.position.set(wx, 3.6, 0);
        car.add(win);
      }
      car.add(cBody, cRoof);
      subwayTrain.add(car);
    }
    group.add(subwayTrain);

    // Wall Catwalk System with Safety Railings & Electrical Conduits
    const catwalk = new THREE.Group();
    catwalk.position.set(0, 6, -34);
    const cwFloor = new THREE.Mesh(new THREE.BoxGeometry(86, 0.4, 3.5), mats.black);
    const cwRailing = new THREE.Mesh(new THREE.BoxGeometry(86, 1.6, 0.2), mats.orange);
    cwRailing.position.set(0, 0.9, 1.6);
    catwalk.add(cwFloor, cwRailing);
    group.add(catwalk);

    // The Crystal Geode Cavern Breach (Ancient Mineral Chasm)
    const geodeCavern = new THREE.Group();
    geodeCavern.position.set(-42, 0, 28);
    // Fractured bedrock rim
    const rockArch = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 6), mats.black);
    rockArch.position.y = 6;
    geodeCavern.add(rockArch);
    // Glowing Crystal Clusters
    const crystalColors = [mats.cyan, mats.orange, mats.red];
    for (let ci = 0; ci < 7; ci++) {
      const crystal = new THREE.Mesh(
        new THREE.ConeGeometry(0.8 + (ci % 3) * 0.4, 4.5 + (ci % 2) * 2, 6),
        crystalColors[ci % crystalColors.length]
      );
      crystal.position.set(-6 + (ci * 2.2), 3 + (ci % 3), 1 + (ci % 2));
      crystal.rotation.set(0.2, ci * 0.8, -0.3 + (ci % 3) * 0.3);
      geodeCavern.add(crystal);
    }
    group.add(geodeCavern);

    // Secret Underground Research Lab Bunker
    const lab = new THREE.Group();
    lab.position.set(38, 0, 24);
    const labBldg = new THREE.Mesh(new THREE.BoxGeometry(18, 10, 18), mats.black);
    labBldg.position.y = 5;
    const labSign = new THREE.Mesh(new THREE.BoxGeometry(12, 2.2, 0.4), mats.cyan);
    labSign.position.set(0, 7.5, 9.2);
    // Decontamination airlock port
    const airlock = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 4, 12), mats.orange);
    airlock.rotation.z = Math.PI / 2;
    airlock.position.set(0, 2.5, 9.5);
    lab.add(labBldg, labSign, airlock);
    group.add(lab);

    return group;
  }

  // 13. Port District (Container Terminal & Cargo Quay)
  public static buildPort(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // Concrete Quay Ground & Wharf Edge
    const quay = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), mats.black);
    quay.rotation.x = -Math.PI / 2;
    quay.position.y = 0.02;
    quay.userData.noCollision = true;
    group.add(quay);

    // Ocean Water Basin next to Quay
    const water = new THREE.Mesh(new THREE.PlaneGeometry(60, 130), mats.blue);
    water.rotation.x = -Math.PI / 2;
    water.position.set(50, 0.01, 0);
    water.userData.noCollision = true;
    group.add(water);

    // Heavy Wooden Fender Piles & Cast-Iron Mooring Bollards along Pier Edge
    for (let bz = -55; bz <= 55; bz += 12) {
      const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.2, 10), mats.black);
      bollard.position.set(20, 0.6, bz);
      const bollardCap = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), mats.orange);
      bollardCap.position.set(20, 1.2, bz);
      // Lifebuoy rings mounted on wooden stanchions
      if (bz % 24 === 0) {
        const stanchion = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 0.2), mats.black);
        stanchion.position.set(19.2, 1.1, bz);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.18, 8, 12), mats.red);
        ring.position.set(19.2, 1.6, bz);
        group.add(stanchion, ring);
      }
      group.add(bollard, bollardCap);
    }

    // Detailed Cargo Container Ship ("DOODLE MARU")
    const ship = new THREE.Group();
    ship.position.set(42, 0, 0);

    // Lower & Upper Ship Hull
    const sHull = new THREE.Mesh(new THREE.BoxGeometry(20, 9, 82), mats.blue);
    sHull.position.y = 4.5;
    // Raked Clipper Bow Wedge
    const bow = new THREE.Mesh(new THREE.ConeGeometry(10, 18, 4), mats.blue);
    bow.rotation.x = Math.PI / 2;
    bow.rotation.y = Math.PI / 4;
    bow.position.set(0, 4.5, -45);
    // Superstructure Navigational Bridge
    const sBridge = new THREE.Mesh(new THREE.BoxGeometry(16, 16, 18), mats.orange);
    sBridge.position.set(0, 17, 24);
    // Bridge Wings
    const bWing = new THREE.Mesh(new THREE.BoxGeometry(24, 1.8, 3.5), mats.black);
    bWing.position.set(0, 22, 24);
    // Smokestack Funnel with Red/Cyan Bands
    const funnel = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 10, 12), mats.red);
    funnel.position.set(0, 27, 28);
    // Radar Antenna Mast
    const radarMast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 14, 8), mats.black);
    radarMast.position.set(0, 31, 22);
    const radarScanner = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.6, 0.6), mats.cyan);
    radarScanner.position.set(0, 36, 22);

    // Ship's Cargo Hold Stacks (On-deck Containers)
    const shipContColors = [mats.red, mats.orange, mats.green, mats.cyan];
    for (let cz = -28; cz <= 8; cz += 13) {
      for (let cx of [-5, 5]) {
        for (let ch = 0; ch < 2; ch++) {
          const cBox = new THREE.Mesh(new THREE.BoxGeometry(7, 3.8, 12), shipContColors[(Math.abs(cz + cx) + ch) % shipContColors.length]);
          cBox.position.set(cx, 10.5 + ch * 4, cz);
          ship.add(cBox);
        }
      }
    }
    ship.add(sHull, bow, sBridge, bWing, funnel, radarMast, radarScanner);
    group.add(ship);

    // Ship-to-Shore (STS) Rail Gantry Container Crane
    const stsCrane = new THREE.Group();
    stsCrane.position.set(16, 0, -10);
    // Portal legs straddling the rail track
    const legW1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 36, 2.5), mats.red);
    legW1.position.set(-6, 18, -12);
    const legW2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 36, 2.5), mats.red);
    legW2.position.set(-6, 18, 12);
    const legE1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 36, 2.5), mats.red);
    legE1.position.set(6, 18, -12);
    const legE2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 36, 2.5), mats.red);
    legE2.position.set(6, 18, 12);
    // Main Outreach Boom extending over the ship
    const boom = new THREE.Mesh(new THREE.BoxGeometry(48, 4, 5), mats.orange);
    boom.position.set(12, 36, 0);
    // Backreach Machinery House
    const machHouse = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 7), mats.black);
    machHouse.position.set(-10, 39, 0);
    // Suspended Container Spreader Hoist Frame
    const spreader = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 16), mats.cyan);
    spreader.position.set(18, 22, 0);
    
    const opCab = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 3), mats.orange);
    opCab.position.set(0, 37, 0);
    const wLight = new THREE.Mesh(new THREE.SphereGeometry(0.5), mats.red);
    wLight.position.set(-10, 40, 0);
    wLight.userData.noCollision = true;
    stsCrane.add(opCab, wLight);

    // Hoist Wire Rope Cables
    for (let sx of [-3, 3]) {
      for (let sz of [-6, 6]) {
        const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 14, 4), mats.black);
        cable.position.set(18 + sx, 29, sz);
        stsCrane.add(cable);
      }
    }
    stsCrane.add(legW1, legW2, legE1, legE2, boom, machHouse, spreader);
    group.add(stsCrane);

    // Organized Container Yard (3-Tier Colorful Blocks)
    const contPalette = [mats.red, mats.orange, mats.green, mats.cyan, mats.blue];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const stackHeight = 1 + ((row + col) % 3);
        for (let h = 0; h < stackHeight; h++) {
          const container = new THREE.Mesh(new THREE.BoxGeometry(8.5, 4.0, 17), contPalette[(row * 3 + col + h) % contPalette.length]);
          container.position.set(-28 - col * 10.5, 2.0 + h * 4.2, -35 + row * 22);
          group.add(container);
        }
      }
    }

    // Harbor Tugboat Moored Nearby
    const tug = new THREE.Group();
    tug.position.set(28, 0, 44);
    const tugHull = new THREE.Mesh(new THREE.BoxGeometry(8, 3.6, 18), mats.black);
    tugHull.position.y = 1.8;
    const tugCab = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.8, 7), mats.orange);
    tugCab.position.set(0, 4.8, 1);
    const tugStack = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 3.5, 8), mats.red);
    tugStack.position.set(0, 7.2, 2.5);
    // Heavy rubber bow push fender
    const bowFender = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 7.6, 10), mats.black);
    bowFender.rotation.z = Math.PI / 2;
    bowFender.position.set(0, 2.4, -9.2);
    tug.add(tugHull, tugCab, tugStack, bowFender);
    group.add(tug);

    // Historic Harbor Breakwater Lighthouse
    const lighthouse = new THREE.Group();
    lighthouse.position.set(-45, 0, 45);
    const lhBase = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 7.0, 8, 12), mats.black);
    lhBase.position.y = 4;
    const lhTower = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 5.2, 28, 12), mats.blue);
    lhTower.position.y = 22;
    const lhLantern = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 5, 12), mats.orange);
    lhLantern.position.y = 38.5;
    const lhDome = new THREE.Mesh(new THREE.SphereGeometry(3.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mats.red);
    lhDome.position.y = 41;
    const lhBeacon = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), mats.cyan);
    lhBeacon.position.set(0, 38.5, 0);
    
    const lEnt = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4, 0.4), mats.black);
    lEnt.position.set(0, 2, 7.1);
    lEnt.userData.noCollision = true;
    for (let wy of [15, 25]) {
      const slit = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.3), mats.cyan);
      // z front: radius is between 5.2 and 3.2. Let's just use 4.5
      slit.position.set(0, wy, 4.5);
      slit.userData.noCollision = true;
      lighthouse.add(slit);
    }
    lighthouse.add(lhBase, lhTower, lhLantern, lhDome, lhBeacon, lEnt);
    group.add(lighthouse);

    return group;
  }

  // 14. Airport District (Terminal, Control Tower & Runway)
  public static buildAirport(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // Tarmac & Runway Ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 130), mats.black);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.02;
    ground.userData.noCollision = true;
    group.add(ground);

    // Main Asphalt Runway Strip (36L/18R)
    const runway = new THREE.Mesh(new THREE.BoxGeometry(150, 0.04, 24), mats.blue);
    runway.position.set(0, 0.03, 34);
    runway.userData.noCollision = true;
    group.add(runway);

    // Runway Centerline Dashed Stripes
    for (let x = -65; x <= 65; x += 14) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.06, 1.4), mats.cyan);
      dash.position.set(x, 0.05, 34);
      dash.userData.noCollision = true;
      group.add(dash);
    }

    // Runway Threshold Piano Keys (West & East Thresholds)
    for (let end of [-70, 70]) {
      for (let zOffset = -9; zOffset <= 9; zOffset += 2.2) {
        const key = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.06, 1.1), mats.cyan);
        key.position.set(end + (end < 0 ? 3 : -3), 0.05, 34 + zOffset);
        key.userData.noCollision = true;
        group.add(key);
      }
    }

    // Yellow Taxiway Link & Holding Position Line
    const taxiway = new THREE.Mesh(new THREE.BoxGeometry(18, 0.04, 32), mats.blue);
    taxiway.position.set(-15, 0.03, 6);
    taxiway.userData.noCollision = true;
    const holdLine = new THREE.Mesh(new THREE.BoxGeometry(18, 0.06, 0.8), mats.orange);
    holdLine.position.set(-15, 0.05, 20);
    holdLine.userData.noCollision = true;
    group.add(taxiway, holdLine);

    // Modern Passenger Terminal Concourse
    const terminal = new THREE.Group();
    terminal.position.set(0, 0, -28);

    const tHall = new THREE.Mesh(new THREE.BoxGeometry(84, 15, 32), mats.blue);
    tHall.position.y = 7.5;
    // Aerodynamic Curving Barrel Roof Vault
    const tRoof = new THREE.Mesh(new THREE.CylinderGeometry(44, 44, 84, 24, 1, false, 0, Math.PI), mats.cyan);
    tRoof.position.set(0, 15, 0);
    tRoof.rotation.z = Math.PI / 2;
    // Elevated Curbside Departures Drop-off Viaduct
    const dropOff = new THREE.Mesh(new THREE.BoxGeometry(84, 3.5, 8), mats.black);
    dropOff.position.set(0, 4.5, -20);
    // Terminal Signage
    const tSign = new THREE.Mesh(new THREE.BoxGeometry(26, 3, 0.5), mats.orange);
    tSign.position.set(0, 18, -16.2);
    
    for (let dx of [-20, 0, 20]) {
      const gDoor = new THREE.Mesh(new THREE.BoxGeometry(5, 8, 0.4), mats.cyan);
      gDoor.position.set(dx, 4, -16.2);
      gDoor.userData.noCollision = true;
      terminal.add(gDoor);
    }
    for (let bx of [-25, 0, 25]) {
      const db = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 0.3), mats.orange);
      db.position.set(bx, 12, -16.2);
      db.userData.noCollision = true;
      terminal.add(db);
    }
    for (let cx of [-20, 20]) {
      const car = new THREE.Mesh(new THREE.TorusGeometry(3, 0.4, 6, 12), mats.black);
      car.position.set(cx, 2, -8);
      car.rotation.x = Math.PI / 2;
      car.userData.noCollision = true;
      terminal.add(car);
    }

    terminal.add(tHall, tRoof, dropOff, tSign);

    // Articulated Glass Passenger Jet Boarding Bridge
    const jetBridge = new THREE.Group();
    jetBridge.position.set(-25, 0, 16);
    const jbRotunda = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 8, 12), mats.orange);
    jbRotunda.position.y = 7;
    const jbCorridor = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 18), mats.cyan);
    jbCorridor.position.set(0, 7, 9);
    const jbCab = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.4, 4.8), mats.black);
    jbCab.position.set(0, 7, 18);
    jetBridge.add(jbRotunda, jbCorridor, jbCab);
    terminal.add(jetBridge);
    group.add(terminal);

    // Air Traffic Control (ATC) Tower Complex
    const tower = new THREE.Group();
    tower.position.set(55, 0, -25);
    const tBase = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 16), mats.black);
    tBase.position.y = 3;
    const tShaft = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.5, 46, 12), mats.blue);
    tShaft.position.y = 26;
    // 360-degree canted-glass controller cab
    const tCab = new THREE.Mesh(new THREE.CylinderGeometry(8.0, 5.5, 9, 12), mats.orange);
    tCab.position.y = 51;
    // Rotating Surveillance Radar Array
    const tRadarMast = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 4, 8), mats.black);
    tRadarMast.position.y = 57.5;
    const tRadarDish = new THREE.Mesh(new THREE.SphereGeometry(2.6, 8, 8), mats.red);
    tRadarDish.position.y = 60;
    
    const atcEnt = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 0.4), mats.black);
    atcEnt.position.set(0, 2.5, 8.1);
    atcEnt.userData.noCollision = true;
    tower.add(atcEnt);
    for (let i = 0; i < 4; i++) {
      const tw = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.3), mats.cyan);
      tw.position.set(Math.cos(i * Math.PI / 2) * 7.5, 51, Math.sin(i * Math.PI / 2) * 7.5);
      tw.rotation.y = -i * Math.PI / 2;
      tw.userData.noCollision = true;
      tower.add(tw);
    }
    
    tower.add(tBase, tShaft, tCab, tRadarMast, tRadarDish);
    group.add(tower);

    // Commercial Twin-Engine Passenger Jet Aircraft
    const plane = new THREE.Group();
    plane.position.set(-25, 4.2, 3);
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 34, 16), mats.cyan);
    fuselage.rotation.z = Math.PI / 2;
    // Swept-back aerodynamic wings with winglets
    const wings = new THREE.Mesh(new THREE.BoxGeometry(7, 0.6, 32), mats.blue);
    // Vertical stabilizer tail fin
    const tailFin = new THREE.Mesh(new THREE.BoxGeometry(5.5, 7.5, 0.6), mats.red);
    tailFin.position.set(-14, 4.2, 0);
    // Horizontal tail stabilizers
    const tailHoriz = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 10), mats.blue);
    tailHoriz.position.set(-14, 1.2, 0);
    // Two Turbofan Engine Nacelles under wings
    for (let ez of [-7.5, 7.5]) {
      const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 6, 12), mats.orange);
      nacelle.rotation.z = Math.PI / 2;
      nacelle.position.set(0.5, -1.8, ez);
      const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 8), mats.black);
      spinner.rotation.z = -Math.PI / 2;
      spinner.position.set(3.6, -1.8, ez);
      plane.add(nacelle, spinner);
    }
    // Landing Gear with rubber tires
    const noseGear = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 3.2, 8), mats.black);
    noseGear.position.set(12, -2.4, 0);
    plane.add(fuselage, wings, tailFin, tailHoriz, noseGear);
    group.add(plane);

    // Airport Baggage Tug & Luggage Cart Train
    const gse = new THREE.Group();
    gse.position.set(-5, 0, -6);
    const tug = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.2, 2.2), mats.orange);
    tug.position.y = 1.1;
    gse.add(tug);
    for (let bi = 0; bi < 3; bi++) {
      const cart = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.4, 1.8), mats.black);
      cart.position.set(4.5 + bi * 4.2, 0.7, 0);
      const luggage = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 1.4), bi === 0 ? mats.red : (bi === 1 ? mats.cyan : mats.orange));
      luggage.position.set(4.5 + bi * 4.2, 1.7, 0);
      gse.add(cart, luggage);
    }
    group.add(gse);

    // Illuminated Windsock on Safety Mast
    const windsock = new THREE.Group();
    windsock.position.set(65, 0, 45);
    const wsPole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 9, 8), mats.black);
    wsPole.position.y = 4.5;
    const wsCone = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4.5, 10), mats.orange);
    wsCone.rotation.z = Math.PI / 2;
    wsCone.position.set(2.2, 8.5, 0);
    const sLight = new THREE.Mesh(new THREE.SphereGeometry(0.3), mats.red);
    sLight.position.set(0, 9.5, 0);
    sLight.userData.noCollision = true;
    windsock.add(wsPole, wsCone, sLight);
    group.add(windsock);

    return group;
  }

  // 15. Secret / Endgame District ("The Blueprint Core")
  public static buildSecretDistrict(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // The Drafting Floor (Dark Blueprint Grid Matrix)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(110, 110), mats.black);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.02;
    floor.userData.noCollision = true;
    group.add(floor);

    // Glowing coordinate axes on floor
    for (let pos = -45; pos <= 45; pos += 15) {
      const lineX = new THREE.Mesh(new THREE.BoxGeometry(90, 0.04, 0.2), mats.cyan);
      lineX.position.set(0, 0.03, pos);
      lineX.userData.noCollision = true;
      const lineZ = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 90), mats.cyan);
      lineZ.position.set(pos, 0.03, 0);
      lineZ.userData.noCollision = true;
      group.add(lineX, lineZ);
    }

    // Colossal Golden Fountain Pen Monument (The Centerpiece of Creation)
    const pen = new THREE.Group();
    pen.position.set(0, 0, 0);
    const nib = new THREE.Mesh(new THREE.ConeGeometry(3.5, 11, 4), mats.orange);
    nib.position.y = 5.5;
    const nibSplit = new THREE.Mesh(new THREE.BoxGeometry(0.15, 8, 3.6), mats.black);
    nibSplit.position.y = 5;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 34, 16), mats.blue);
    barrel.position.y = 28;
    const goldRing = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.4, 8, 16), mats.orange);
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = 11;
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.9, 20, 1.6), mats.red);
    clip.position.set(0, 29, 3.6);
    pen.add(nib, nibSplit, barrel, goldRing, clip);
    group.add(pen);

    // Architect's Giant Light-Table Drafting Monolith
    const draftingTable = new THREE.Group();
    draftingTable.position.set(-28, 0, -20);
    const dtBase = new THREE.Mesh(new THREE.BoxGeometry(18, 4, 12), mats.black);
    dtBase.position.y = 2;
    const dtBoard = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 16), mats.cyan);
    dtBoard.position.set(0, 5.5, 0);
    dtBoard.rotation.x = 0.35; // Tilted drafting surface
    // Parallel straightedge ruler
    const straightedge = new THREE.Mesh(new THREE.BoxGeometry(24, 0.4, 1.2), mats.orange);
    straightedge.position.set(0, 6.2, 0);
    straightedge.rotation.x = 0.35;
    draftingTable.add(dtBase, dtBoard, straightedge);
    group.add(draftingTable);

    // Colossal Drafting Tools (Set Square & Protractor Sculptures)
    const compassGroup = new THREE.Group();
    compassGroup.position.set(28, 0, -20);
    // Articulated brass compass legs
    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 22, 1.2), mats.orange);
    leg1.position.set(-3.5, 11, 0);
    leg1.rotation.z = 0.3;
    const leg2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 22, 1.2), mats.orange);
    leg2.position.set(3.5, 11, 0);
    leg2.rotation.z = -0.3;
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 1.6, 12), mats.black);
    hinge.rotation.x = Math.PI / 2;
    hinge.position.set(0, 21, 0);
    compassGroup.add(leg1, leg2, hinge);
    group.add(compassGroup);

    // Giant 45-Degree Drafting Triangle Set Square
    const triangle = new THREE.Mesh(new THREE.ConeGeometry(9, 14, 3), mats.cyan);
    triangle.position.set(28, 7, 20);
    triangle.rotation.y = Math.PI / 6;
    group.add(triangle);

    // Architect's Master Blueprint Folio Lectern
    const lectern = new THREE.Group();
    lectern.position.set(-28, 0, 20);
    const lPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 7, 10), mats.black);
    lPillar.position.y = 3.5;
    const lBook = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, 8), mats.orange);
    lBook.position.set(0, 7.5, 0);
    lBook.rotation.x = 0.4;
    lectern.add(lPillar, lBook);
    group.add(lectern);

    // Sacred Platonic Solids Suspended Around The Spire
    const polyhedraOffsets: [number, number, number, string][] = [
      [-22, 16, -22, "icosa"],
      [22, 20, -22, "octa"],
      [-22, 22, 22, "dodeca"],
      [22, 18, 22, "tetra"],
    ];
    polyhedraOffsets.forEach(([cx, cy, cz]) => {
      const poly = new THREE.Mesh(new THREE.IcosahedronGeometry(5, 0), mats.cyan);
      poly.position.set(cx, cy, cz);
      poly.rotation.set(0.4, 0.6, 0.2);
      group.add(poly);
    });

    // Ink Wells & Crystalline Ink Basin
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(8, 7, 2, 16), mats.black);
    basin.position.y = 1;
    const inkPool = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.2, 0.4, 16), mats.blue);
    inkPool.position.set(0, 2, 0);
    inkPool.userData.noCollision = true;
    group.add(basin, inkPool);

    return group;
  }

  // 16. Transit Arteries: Detailed Procedural Road Network, Curbs, Sidewalks, Signals & Furniture
  private static buildConnectingArteries(city: any): THREE.Group {
    const arteries = new THREE.Group();
    arteries.name = "Transit_Arteries";
    const mats = this.getMaterials(city);

    // -------------------------------------------------------------
    // A. ARTERIAL CARRIAGEWAYS & CURBED SIDEWALKS
    // -------------------------------------------------------------

    // 1a. Central Grand Boulevard North: Z: -160 (North Parkway) to Z: -90 (Market North Gate)
    this.addRoadwayWithSidewalks(arteries, {
      x: 0,
      zStart: -160,
      zEnd: -90,
      roadWidth: 14,
      sidewalkWidth: 3.5,
      isEastWest: false,
      mats,
      avenueName: "GRAND BLVD NORTH",
    });

    // 1b. Central Grand Boulevard South: Z: -10 (Market South Gate) to Z: 370 (Airport Forecourt)
    this.addRoadwayWithSidewalks(arteries, {
      x: 0,
      zStart: -10,
      zEnd: 370,
      roadWidth: 14,
      sidewalkWidth: 3.5,
      isEastWest: false,
      mats,
      avenueName: "GRAND BLVD SOUTH",
    });

    // 1c. Pedestrianized Market Plaza Concourse: Z: -90 to Z: -10
    this.addPedestrianMarketConcourse(arteries, mats);

    // 2. North Parkway (East-West along Z: -160 from X: -130 to X: 130)
    this.addRoadwayWithSidewalks(arteries, {
      z: -160,
      xStart: -130,
      xEnd: 130,
      roadWidth: 12,
      sidewalkWidth: 3.0,
      isEastWest: true,
      mats,
      avenueName: "NORTH PARKWAY",
    });

    // 3. 42nd St / Midtown Promenade (East-West along Z: -20 from X: -120 to X: 120)
    this.addRoadwayWithSidewalks(arteries, {
      z: -20,
      xStart: -120,
      xEnd: 120,
      roadWidth: 10,
      sidewalkWidth: 3.0,
      isEastWest: true,
      mats,
      avenueName: "42ND ST PROMENADE",
    });

    // 4. Central Expressway (East-West along Z: 90 from X: -230 to X: 230)
    this.addExpresswayWithMedian(arteries, {
      z: 90,
      xStart: -230,
      xEnd: 230,
      roadWidth: 18,
      medianWidth: 1.6,
      sidewalkWidth: 3.5,
      mats,
      name: "CENTRAL EXPRESSWAY",
    });

    // 5. Harbor Beltway (East-West along Z: 230 from X: -120 to X: 120)
    this.addRoadwayWithSidewalks(arteries, {
      z: 230,
      xStart: -120,
      xEnd: 120,
      roadWidth: 12,
      sidewalkWidth: 3.0,
      isEastWest: true,
      mats,
      avenueName: "HARBOR BELTWAY",
    });

    // 6. Airport Terminal Departure Forecourt Loop (at Z: 370)
    this.addAirportForecourtLoop(arteries, mats);

    // -------------------------------------------------------------
    // B. MAJOR INTERSECTIONS (Crosswalks, Stop Bars, Gantries)
    // -------------------------------------------------------------
    const intersections = [
      { x: 0, z: -160, aveW: 14, crossW: 12, nameAve: "GRAND BLVD", nameCross: "NORTH PKWY" },
      { x: 0, z: -20, aveW: 14, crossW: 10, nameAve: "GRAND BLVD", nameCross: "42ND ST" },
      { x: 0, z: 90, aveW: 14, crossW: 18, nameAve: "GRAND BLVD", nameCross: "CENTRAL EXPRWY" },
      { x: 0, z: 230, aveW: 14, crossW: 12, nameAve: "GRAND BLVD", nameCross: "HARBOR BELTWAY" },
    ];
    intersections.forEach((inter) => {
      this.addDetailedIntersection(arteries, inter, mats);
    });

    // -------------------------------------------------------------
    // C. STREET FURNITURE (Lampposts, Trees with Grates, Hydrants, Bus Stops)
    // -------------------------------------------------------------
    this.populateStreetFurniture(arteries, mats);

    // -------------------------------------------------------------
    // D. TRANSIT CONNECTIONS (Subway Kiosks, Switchback, Skyway Elevator)
    // -------------------------------------------------------------
    const subwayLocations = [
      { x: -22, z: 20, rotY: Math.PI / 2, name: "Downtown Subway Entrance" },
      { x: 22, z: -110, rotY: -Math.PI / 2, name: "Neon City Subway Entrance" },
      { x: -18, z: -50, rotY: Math.PI / 2, name: "Central Market Subway Entrance" },
      { x: -22, z: 260, rotY: Math.PI / 2, name: "Waterfront Boardwalk Subway" },
    ];
    subwayLocations.forEach((loc) => {
      this.addSubwayEntrance(arteries, loc, mats);
    });

    // Hillside Serpentine Switchback Ramp
    arteries.add(this.buildHillsideSwitchback(mats));

    // Express Skyway Elevator Tower
    arteries.add(this.buildSkywayElevator(mats));

    return arteries;
  }

  private static addRoadwayWithSidewalks(
    parent: THREE.Group,
    opt: {
      x?: number;
      z?: number;
      xStart?: number;
      xEnd?: number;
      zStart?: number;
      zEnd?: number;
      roadWidth: number;
      sidewalkWidth: number;
      isEastWest: boolean;
      mats: any;
      avenueName?: string;
    }
  ) {
    const { roadWidth, sidewalkWidth, isEastWest, mats } = opt;

    if (!isEastWest) {
      const x = opt.x ?? 0;
      const zStart = opt.zStart ?? 0;
      const zEnd = opt.zEnd ?? 0;
      const length = Math.abs(zEnd - zStart);
      const zCenter = (zStart + zEnd) / 2;
      const minZ = Math.min(zStart, zEnd);
      const maxZ = Math.max(zStart, zEnd);

      // Asphalt Roadbed
      const roadbed = new THREE.Mesh(new THREE.BoxGeometry(roadWidth, 0.08, length), mats.black);
      roadbed.position.set(x, 0.04, zCenter);
      roadbed.userData.noCollision = true;
      parent.add(roadbed);

      // Solid Cyan Shoulder Lines
      const leftShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.085, length), mats.cyan);
      leftShoulder.position.set(x - roadWidth / 2 + 0.35, 0.045, zCenter);
      leftShoulder.userData.noCollision = true;
      const rightShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.085, length), mats.cyan);
      rightShoulder.position.set(x + roadWidth / 2 - 0.35, 0.045, zCenter);
      rightShoulder.userData.noCollision = true;
      parent.add(leftShoulder, rightShoulder);

      // Dual Dashed Yellow Centerlines
      for (let cz = minZ + 3; cz <= maxZ - 3; cz += 10) {
        const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 5), mats.orange);
        stripe1.position.set(x - 0.22, 0.048, cz);
        stripe1.userData.noCollision = true;
        const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 5), mats.orange);
        stripe2.position.set(x + 0.22, 0.048, cz);
        stripe2.userData.noCollision = true;
        parent.add(stripe1, stripe2);
      }

      // Raised Curbed Sidewalks
      const swWest = new THREE.Mesh(new THREE.BoxGeometry(sidewalkWidth, 0.16, length), mats.blue);
      swWest.position.set(x - roadWidth / 2 - sidewalkWidth / 2, 0.08, zCenter);
      swWest.userData.noCollision = true;
      const curbWest = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, length), mats.black);
      curbWest.position.set(x - roadWidth / 2, 0.1, zCenter);
      curbWest.userData.noCollision = true;

      const swEast = new THREE.Mesh(new THREE.BoxGeometry(sidewalkWidth, 0.16, length), mats.blue);
      swEast.position.set(x + roadWidth / 2 + sidewalkWidth / 2, 0.08, zCenter);
      swEast.userData.noCollision = true;
      const curbEast = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, length), mats.black);
      curbEast.position.set(x + roadWidth / 2, 0.1, zCenter);
      curbEast.userData.noCollision = true;

      parent.add(swWest, curbWest, swEast, curbEast);
    } else {
      const z = opt.z ?? 0;
      const xStart = opt.xStart ?? 0;
      const xEnd = opt.xEnd ?? 0;
      const length = Math.abs(xEnd - xStart);
      const xCenter = (xStart + xEnd) / 2;
      const minX = Math.min(xStart, xEnd);
      const maxX = Math.max(xStart, xEnd);

      // Asphalt Roadbed
      const roadbed = new THREE.Mesh(new THREE.BoxGeometry(length, 0.08, roadWidth), mats.black);
      roadbed.position.set(xCenter, 0.04, z);
      roadbed.userData.noCollision = true;
      parent.add(roadbed);

      // Solid Cyan Shoulder Lines
      const northShoulder = new THREE.Mesh(new THREE.BoxGeometry(length, 0.085, 0.2), mats.cyan);
      northShoulder.position.set(xCenter, 0.045, z - roadWidth / 2 + 0.35);
      northShoulder.userData.noCollision = true;
      const southShoulder = new THREE.Mesh(new THREE.BoxGeometry(length, 0.085, 0.2), mats.cyan);
      southShoulder.position.set(xCenter, 0.045, z + roadWidth / 2 - 0.35);
      southShoulder.userData.noCollision = true;
      parent.add(northShoulder, southShoulder);

      // Dual Dashed Yellow Centerlines
      for (let cx = minX + 3; cx <= maxX - 3; cx += 10) {
        const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(5, 0.09, 0.22), mats.orange);
        stripe1.position.set(cx, 0.048, z - 0.22);
        stripe1.userData.noCollision = true;
        const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(5, 0.09, 0.22), mats.orange);
        stripe2.position.set(cx, 0.048, z + 0.22);
        stripe2.userData.noCollision = true;
        parent.add(stripe1, stripe2);
      }

      // Raised Curbed Sidewalks
      const swNorth = new THREE.Mesh(new THREE.BoxGeometry(length, 0.16, sidewalkWidth), mats.blue);
      swNorth.position.set(xCenter, 0.08, z - roadWidth / 2 - sidewalkWidth / 2);
      swNorth.userData.noCollision = true;
      const curbNorth = new THREE.Mesh(new THREE.BoxGeometry(length, 0.2, 0.3), mats.black);
      curbNorth.position.set(xCenter, 0.1, z - roadWidth / 2);
      curbNorth.userData.noCollision = true;

      const swSouth = new THREE.Mesh(new THREE.BoxGeometry(length, 0.16, sidewalkWidth), mats.blue);
      swSouth.position.set(xCenter, 0.08, z + roadWidth / 2 + sidewalkWidth / 2);
      swSouth.userData.noCollision = true;
      const curbSouth = new THREE.Mesh(new THREE.BoxGeometry(length, 0.2, 0.3), mats.black);
      curbSouth.position.set(xCenter, 0.1, z + roadWidth / 2);
      curbSouth.userData.noCollision = true;

      parent.add(swNorth, curbNorth, swSouth, curbSouth);
    }
  }

  private static addExpresswayWithMedian(
    parent: THREE.Group,
    opt: {
      z: number;
      xStart: number;
      xEnd: number;
      roadWidth: number;
      medianWidth: number;
      sidewalkWidth: number;
      mats: any;
      name?: string;
    }
  ) {
    const { z, xStart, xEnd, roadWidth, medianWidth, sidewalkWidth, mats } = opt;
    const length = Math.abs(xEnd - xStart);
    const xCenter = (xStart + xEnd) / 2;
    const minX = Math.min(xStart, xEnd);
    const maxX = Math.max(xStart, xEnd);

    // Dual Express Asphalt Carriageways
    const carriageway = new THREE.Mesh(new THREE.BoxGeometry(length, 0.08, roadWidth), mats.black);
    carriageway.position.set(xCenter, 0.04, z);
    carriageway.userData.noCollision = true;
    parent.add(carriageway);

    // Raised Center Concrete Median
    const median = new THREE.Mesh(new THREE.BoxGeometry(length, 0.45, medianWidth), mats.black);
    median.position.set(xCenter, 0.225, z);
    median.userData.noCollision = true;
    parent.add(median);

    // Median Amber Reflectors spaced every 12m
    for (let rx = minX + 6; rx <= maxX - 6; rx += 12) {
      const refNorth = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.1), mats.orange);
      refNorth.position.set(rx, 0.48, z - medianWidth / 2 + 0.08);
      refNorth.userData.noCollision = true;
      const refSouth = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.1), mats.orange);
      refSouth.position.set(rx, 0.48, z + medianWidth / 2 - 0.08);
      refSouth.userData.noCollision = true;
      parent.add(refNorth, refSouth);
    }

    // Lane Divider Striping
    const laneOffsetZ = (roadWidth / 2 - medianWidth / 2) / 2;
    for (let cx = minX + 3; cx <= maxX - 3; cx += 10) {
      const stripeN = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.09, 0.2), mats.cyan);
      stripeN.position.set(cx, 0.048, z - medianWidth / 2 - laneOffsetZ);
      stripeN.userData.noCollision = true;
      const stripeS = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.09, 0.2), mats.cyan);
      stripeS.position.set(cx, 0.048, z + medianWidth / 2 + laneOffsetZ);
      stripeS.userData.noCollision = true;
      parent.add(stripeN, stripeS);
    }

    // Solid Shoulder Lines
    const northShoulder = new THREE.Mesh(new THREE.BoxGeometry(length, 0.085, 0.22), mats.cyan);
    northShoulder.position.set(xCenter, 0.045, z - roadWidth / 2 + 0.35);
    northShoulder.userData.noCollision = true;
    const southShoulder = new THREE.Mesh(new THREE.BoxGeometry(length, 0.085, 0.22), mats.cyan);
    southShoulder.position.set(xCenter, 0.045, z + roadWidth / 2 - 0.35);
    southShoulder.userData.noCollision = true;
    parent.add(northShoulder, southShoulder);

    // Raised Sidewalks with Curbs
    const swNorth = new THREE.Mesh(new THREE.BoxGeometry(length, 0.16, sidewalkWidth), mats.blue);
    swNorth.position.set(xCenter, 0.08, z - roadWidth / 2 - sidewalkWidth / 2);
    swNorth.userData.noCollision = true;
    const curbNorth = new THREE.Mesh(new THREE.BoxGeometry(length, 0.2, 0.3), mats.black);
    curbNorth.position.set(xCenter, 0.1, z - roadWidth / 2);
    curbNorth.userData.noCollision = true;

    const swSouth = new THREE.Mesh(new THREE.BoxGeometry(length, 0.16, sidewalkWidth), mats.blue);
    swSouth.position.set(xCenter, 0.08, z + roadWidth / 2 + sidewalkWidth / 2);
    swSouth.userData.noCollision = true;
    const curbSouth = new THREE.Mesh(new THREE.BoxGeometry(length, 0.2, 0.3), mats.black);
    curbSouth.position.set(xCenter, 0.1, z + roadWidth / 2);
    curbSouth.userData.noCollision = true;

    parent.add(swNorth, curbNorth, swSouth, curbSouth);
  }

  private static addPedestrianMarketConcourse(parent: THREE.Group, mats: any) {
    // Cobblestone pedestrian mall along X: 0 from Z: -90 to Z: -10
    const concourse = new THREE.Mesh(new THREE.BoxGeometry(22, 0.06, 80), mats.black);
    concourse.position.set(0, 0.03, -50);
    concourse.userData.noCollision = true;
    parent.add(concourse);

    // Cyan mosaic promenade runner
    const runner = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.07, 76), mats.cyan);
    runner.position.set(0, 0.035, -50);
    runner.userData.noCollision = true;
    parent.add(runner);

    // Stone Bollard Rows at North (Z: -90) and South (Z: -10) portals
    for (const bz of [-90, -10]) {
      for (let bx = -9; bx <= 9; bx += 3) {
        const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 1.0, 8), mats.black);
        bollard.position.set(bx, 0.5, bz);
        bollard.userData.noCollision = true;
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.3, 4), mats.orange);
        cap.position.set(bx, 1.15, bz);
        cap.rotation.y = Math.PI / 4;
        cap.userData.noCollision = true;
        parent.add(bollard, cap);
      }

      // Grand Entrance Archway ("DOODLE BAZAAR")
      const arch = new THREE.Group();
      arch.position.set(0, 0, bz);
      const colL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.0, 1.4), mats.blue);
      colL.position.set(-8, 3.0, 0);
      const colR = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.0, 1.4), mats.blue);
      colR.position.set(8, 3.0, 0);
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(18.5, 1.2, 1.6), mats.orange);
      lintel.position.set(0, 6.2, 0);
      const signBoard = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.9, 0.3), mats.red);
      signBoard.position.set(0, 6.2, 0.9);
      arch.add(colL, colR, lintel, signBoard);
      parent.add(arch);
    }
  }

  private static addAirportForecourtLoop(parent: THREE.Group, mats: any) {
    const loop = new THREE.Group();
    loop.position.set(0, 0, 370);

    // Terminal Forecourt Turning Plaza
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 0.08, 24), mats.black);
    plaza.position.y = 0.04;
    plaza.userData.noCollision = true;
    loop.add(plaza);

    // Central Island with Blueprint Flagpole
    const island = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 0.25, 20), mats.blue);
    island.position.y = 0.125;
    island.userData.noCollision = true;
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 15, 8), mats.black);
    flagPole.position.y = 7.5;
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 4.0), mats.orange);
    flag.position.set(0, 13.5, 2.0);
    loop.add(island, flagPole, flag);

    parent.add(loop);
  }

  private static addDetailedIntersection(
    parent: THREE.Group,
    opt: {
      x: number;
      z: number;
      aveW: number;
      crossW: number;
      nameAve: string;
      nameCross: string;
    },
    mats: any
  ) {
    const { x, z, aveW, crossW } = opt;
    const interGroup = new THREE.Group();
    interGroup.position.set(x, 0, z);

    // 1. Intersection Central Square Asphalt
    const box = new THREE.Mesh(new THREE.BoxGeometry(aveW, 0.082, crossW), mats.black);
    box.position.y = 0.041;
    box.userData.noCollision = true;
    interGroup.add(box);

    // 2. Stop Bars on All 4 Approaches
    const stopN = new THREE.Mesh(new THREE.BoxGeometry(aveW * 0.45, 0.085, 0.7), mats.cyan);
    stopN.position.set(-aveW * 0.24, 0.045, -crossW / 2 - 1.0);
    stopN.userData.noCollision = true;
    const stopS = new THREE.Mesh(new THREE.BoxGeometry(aveW * 0.45, 0.085, 0.7), mats.cyan);
    stopS.position.set(aveW * 0.24, 0.045, crossW / 2 + 1.0);
    stopS.userData.noCollision = true;
    const stopW = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.085, crossW * 0.45), mats.cyan);
    stopW.position.set(-aveW / 2 - 1.0, 0.045, crossW * 0.24);
    stopW.userData.noCollision = true;
    const stopE = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.085, crossW * 0.45), mats.cyan);
    stopE.position.set(aveW / 2 + 1.0, 0.045, -crossW * 0.24);
    stopE.userData.noCollision = true;
    interGroup.add(stopN, stopS, stopW, stopE);

    // 3. Bold Zebra Crosswalks on All 4 Approaches
    const numStripesAve = Math.floor(aveW / 1.5);
    for (let i = 0; i < numStripesAve; i++) {
      const sx = -aveW / 2 + 1.0 + i * (aveW - 2) / (numStripesAve - 1);
      const stripeN = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.085, 3.2), mats.cyan);
      stripeN.position.set(sx, 0.045, -crossW / 2 - 3.0);
      stripeN.userData.noCollision = true;
      const stripeS = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.085, 3.2), mats.cyan);
      stripeS.position.set(sx, 0.045, crossW / 2 + 3.0);
      stripeS.userData.noCollision = true;
      interGroup.add(stripeN, stripeS);
    }
    const numStripesCross = Math.floor(crossW / 1.5);
    for (let i = 0; i < numStripesCross; i++) {
      const sz = -crossW / 2 + 1.0 + i * (crossW - 2) / (numStripesCross - 1);
      const stripeW = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.085, 0.65), mats.cyan);
      stripeW.position.set(-aveW / 2 - 3.0, 0.045, sz);
      stripeW.userData.noCollision = true;
      const stripeE = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.085, 0.65), mats.cyan);
      stripeE.position.set(aveW / 2 + 3.0, 0.045, sz);
      stripeE.userData.noCollision = true;
      interGroup.add(stripeW, stripeE);
    }

    // 4. Overhead Cantilever Traffic Signal Gantry at NE corner
    const gantry = new THREE.Group();
    gantry.position.set(aveW / 2 + 1.8, 0, crossW / 2 + 1.8);
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.45, 8.0, 0.45), mats.black);
    col.position.y = 4.0;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(aveW * 0.7, 0.4, 0.4), mats.black);
    arm.position.set(-aveW * 0.35, 7.8, 0);
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 0.25), mats.black);
    strut.position.set(-1.2, 6.6, 0);
    strut.rotation.z = Math.PI / 4;

    // Signal Heads suspended from arm
    for (const hOffset of [-aveW * 0.2, -aveW * 0.5]) {
      const head = new THREE.Group();
      head.position.set(hOffset, 7.0, 0);
      const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.2, 0.45), mats.black);
      const lightRed = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), mats.red);
      lightRed.position.set(0, 0.65, 0.25);
      const lightAmber = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), mats.orange);
      lightAmber.position.set(0, 0, 0.25);
      const lightGreen = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), mats.green);
      lightGreen.position.set(0, -0.65, 0.25);
      head.add(headBox, lightRed, lightAmber, lightGreen);
      gantry.add(head);
    }

    // Street Name Sign Blades on Mast
    const signAve = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.65, 0.1), mats.green);
    signAve.position.set(0, 5.2, 0.3);
    const signCross = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.65, 3.6), mats.green);
    signCross.position.set(-0.3, 5.8, 0);
    gantry.add(col, arm, strut, signAve, signCross);
    interGroup.add(gantry);

    // 5. Corner Pedestrian Signal Post at SW corner
    const pedPost = new THREE.Group();
    pedPost.position.set(-aveW / 2 - 1.8, 0, -crossW / 2 - 1.8);
    const pPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.6, 8), mats.black);
    pPole.position.y = 1.8;
    const pBox = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.7, 0.35), mats.black);
    pBox.position.set(0, 2.5, 0);
    const pWalk = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.05), mats.cyan);
    pWalk.position.set(0, 2.5, 0.18);
    pedPost.add(pPole, pBox, pWalk);
    interGroup.add(pedPost);

    parent.add(interGroup);
  }

  private static populateStreetFurniture(parent: THREE.Group, mats: any) {
    // 1. Street Lamps along Grand Boulevard (every ~25m)
    const lampZs = [
      -150, -125, -100,
      10, 35, 60, 115, 140, 165, 190, 215, 245, 270, 295, 320, 345,
    ];
    lampZs.forEach((lz) => {
      parent.add(this.buildStreetLamp(-9.5, lz, Math.PI / 2, mats));
      parent.add(this.buildStreetLamp(9.5, lz, -Math.PI / 2, mats));
    });

    // Lamps along Central Expressway (every ~35m across X: -210 to 210)
    for (let lx = -210; lx <= 210; lx += 35) {
      if (Math.abs(lx) < 15) continue;
      parent.add(this.buildStreetLamp(lx, 79.5, 0, mats));
      parent.add(this.buildStreetLamp(lx, 100.5, Math.PI, mats));
    }

    // 2. Street Trees in Square Cast-Iron Grates
    const treeZs = [
      -138, -112,
      22, 48, 72, 128, 152, 178, 202, 258, 282, 308, 332,
    ];
    treeZs.forEach((tz) => {
      parent.add(this.buildStreetTree(-9.5, tz, mats));
      parent.add(this.buildStreetTree(9.5, tz, mats));
    });

    // 3. Red Fire Hydrants near Intersections
    const hydrantLocs = [
      [-9.5, -152], [9.5, -152],
      [-9.5, -12], [9.5, -12],
      [-9.5, 98], [9.5, 98],
      [-9.5, 238], [9.5, 238],
    ];
    hydrantLocs.forEach(([hx, hz]) => {
      parent.add(this.buildFireHydrant(hx, hz, mats));
    });

    // 4. Transit Bus Stop Shelters
    const busStops = [
      { x: -10.5, z: 15, rotY: Math.PI / 2, name: "34th St / Downtown" },
      { x: 10.5, z: 15, rotY: -Math.PI / 2, name: "Doodle Dome / Entertainment" },
      { x: -10.5, z: 105, rotY: Math.PI / 2, name: "Central Expressway Station" },
      { x: -10.5, z: 255, rotY: Math.PI / 2, name: "Waterfront Pier" },
    ];
    busStops.forEach((bs) => {
      parent.add(this.buildBusShelter(bs.x, bs.z, bs.rotY, mats));
    });
  }

  private static buildStreetLamp(x: number, z: number, rotY: number, mats: any): THREE.Group {
    const lamp = new THREE.Group();
    lamp.position.set(x, 0, z);
    lamp.rotation.y = rotY;

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 0.5, 8), mats.black);
    plinth.position.y = 0.25;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 6.2, 8), mats.black);
    pole.position.y = 3.4;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 0.16), mats.black);
    arm.position.set(0.7, 6.4, 0);
    const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.24, 0.6, 8), mats.black);
    fixture.position.set(1.4, 6.2, 0);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), mats.cyan);
    globe.position.set(1.4, 5.8, 0);
    globe.userData.noCollision = true;

    lamp.add(plinth, pole, arm, fixture, globe);
    return lamp;
  }

  private static buildStreetTree(x: number, z: number, mats: any): THREE.Group {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    const grate = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.04, 1.8), mats.black);
    grate.position.y = 0.16;
    grate.userData.noCollision = true;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 4.2, 8), mats.black);
    trunk.position.y = 2.1;
    const crown1 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.2, 6), mats.green);
    crown1.position.y = 4.6;
    const crown2 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.6, 6), mats.green);
    crown2.position.y = 6.2;
    crown2.rotation.y = Math.PI / 6;

    tree.add(grate, trunk, crown1, crown2);
    return tree;
  }

  private static buildFireHydrant(x: number, z: number, mats: any): THREE.Group {
    const hydrant = new THREE.Group();
    hydrant.position.set(x, 0, z);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.35, 8), mats.red);
    base.position.y = 0.175;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.8, 8), mats.red);
    body.position.y = 0.7;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), mats.red);
    dome.position.y = 1.1;
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 6), mats.orange);
    nut.position.y = 1.35;
    const nozzle1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8), mats.black);
    nozzle1.rotation.z = Math.PI / 2;
    nozzle1.position.set(0.3, 0.75, 0);
    const nozzle2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8), mats.black);
    nozzle2.rotation.z = -Math.PI / 2;
    nozzle2.position.set(-0.3, 0.75, 0);

    hydrant.add(base, body, dome, nut, nozzle1, nozzle2);
    return hydrant;
  }

  private static buildBusShelter(x: number, z: number, rotY: number, mats: any): THREE.Group {
    const shelter = new THREE.Group();
    shelter.position.set(x, 0, z);
    shelter.rotation.y = rotY;

    for (const px of [-1.8, 1.8]) {
      for (const pz of [-0.9, 0.9]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.8, 0.12), mats.black);
        post.position.set(px, 1.4, pz);
        shelter.add(post);
      }
    }
    const glassRear = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 0.06), mats.cyan);
    glassRear.position.set(0, 1.5, -0.9);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.25, 2.4), mats.blue);
    roof.position.set(0, 2.9, 0);
    const bench = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.45, 0.6), mats.orange);
    bench.position.set(0, 0.45, -0.45);
    const totem = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 0.15), mats.black);
    totem.position.set(2.2, 1.1, 0);
    const display = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.2, 0.04), mats.orange);
    display.position.set(2.2, 1.4, 0.09);

    shelter.add(glassRear, roof, bench, totem, display);
    return shelter;
  }

  private static addSubwayEntrance(
    parent: THREE.Group,
    loc: { x: number; z: number; rotY: number; name: string },
    mats: any
  ) {
    const entrance = new THREE.Group();
    entrance.position.set(loc.x, 0, loc.z);
    entrance.rotation.y = loc.rotY;

    const kiosk = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.4, 7.5), mats.black);
    kiosk.position.y = 1.2;
    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 8.0, 12, 1, false, 0, Math.PI), mats.green);
    canopy.rotation.z = Math.PI / 2;
    canopy.position.set(0, 2.6, 0);
    const stairs = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 5.5), mats.cyan);
    stairs.position.set(0, 0.1, 0.6);
    stairs.userData.noCollision = true;

    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.6, 8), mats.black);
    postL.position.set(-2.4, 1.3, -3.5);
    const globeL = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), mats.cyan);
    globeL.position.set(-2.4, 2.7, -3.5);
    globeL.userData.noCollision = true;

    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.6, 8), mats.black);
    postR.position.set(2.4, 1.3, -3.5);
    const globeR = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), mats.cyan);
    globeR.position.set(2.4, 2.7, -3.5);
    globeR.userData.noCollision = true;

    const sign = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.6, 0.2), mats.blue);
    sign.position.set(0, 3.2, -3.6);

    entrance.add(kiosk, canopy, stairs, postL, globeL, postR, globeR, sign);
    parent.add(entrance);
  }

  private static buildHillsideSwitchback(mats: any): THREE.Group {
    const switchback = new THREE.Group();
    switchback.name = "Hillside_Switchback_Road";

    const seg1 = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 26), mats.blue);
    seg1.position.set(9, 4, -171);
    seg1.rotation.x = -Math.atan2(8, 22);
    seg1.rotation.y = Math.atan2(18, 22);

    const turn1 = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 1.2, 16), mats.black);
    turn1.position.set(18, 8, -182);

    const seg2 = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 42), mats.blue);
    seg2.position.set(0, 12.5, -190);
    seg2.rotation.x = -Math.atan2(9, 36);
    seg2.rotation.y = -Math.atan2(36, 16);

    const turn2 = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 1.2, 16), mats.black);
    turn2.position.set(-18, 17, -198);

    const seg3 = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 26), mats.blue);
    seg3.position.set(-9, 21, -204);
    seg3.rotation.x = -Math.atan2(8, 22);
    seg3.rotation.y = -Math.atan2(18, 22);

    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 26), mats.orange);
    rail1.position.set(14, 4.8, -171);
    rail1.rotation.x = seg1.rotation.x;
    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 42), mats.orange);
    rail2.position.set(0, 13.3, -195);
    rail2.rotation.x = seg2.rotation.x;
    const rail3 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 26), mats.orange);
    rail3.position.set(-14, 21.8, -204);
    rail3.rotation.x = seg3.rotation.x;

    switchback.add(seg1, turn1, seg2, turn2, seg3, rail1, rail2, rail3);
    return switchback;
  }

  private static buildSkywayElevator(mats: any): THREE.Group {
    const elevatorTower = new THREE.Group();
    elevatorTower.position.set(0, 0, -280);

    const shaft = new THREE.Mesh(new THREE.BoxGeometry(7, 82, 7), mats.black);
    shaft.position.y = 41;
    for (const px of [-3.5, 3.5]) {
      for (const pz of [-3.5, 3.5]) {
        const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.8, 82, 0.8), mats.blue);
        pylon.position.set(px, 41, pz);
        elevatorTower.add(pylon);
      }
    }
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(6.6, 8.5, 6.6), mats.orange);
    cabin.position.y = 52;
    const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(6.8, 4.5, 6.8), mats.cyan);
    cabGlass.position.y = 52;
    cabGlass.userData.noCollision = true;

    const machineRoom = new THREE.Mesh(new THREE.BoxGeometry(9, 4, 9), mats.red);
    machineRoom.position.y = 84;

    const skybridge = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 45), mats.blue);
    skybridge.position.set(0, 80, -25);

    elevatorTower.add(shaft, cabin, cabGlass, machineRoom, skybridge);
    return elevatorTower;
  }
}
