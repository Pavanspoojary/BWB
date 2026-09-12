import * as THREE from "three";
import { latLonToMeters } from "../../utils/geo.ts";

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
    name: "DOWNTOWN",
    subtitle: "Skyscraper Canyon & Manhattan Grid",
    spawnPoint: new THREE.Vector3(-70, 0, 20),
    lookAt: new THREE.Vector3(-70, 0, 0),
    bounds: { minX: -130, maxX: -10, minZ: -60, maxZ: 60 },
    elevation: 0,
  },
  {
    id: "entertainment",
    name: "ENTERTAINMENT DISTRICT",
    subtitle: "Doodle Dome, Theaters & Pixel Palace",
    spawnPoint: new THREE.Vector3(70, 0, 20),
    lookAt: new THREE.Vector3(70, 0, 0),
    bounds: { minX: 10, maxX: 130, minZ: -60, maxZ: 60 },
    elevation: 0,
  },
  {
    id: "market",
    name: "MARKET DISTRICT",
    subtitle: "Bustling Street Bazaar & Food Stalls",
    spawnPoint: new THREE.Vector3(0, 0, -40),
    lookAt: new THREE.Vector3(0, 0, -60),
    bounds: { minX: -40, maxX: 40, minZ: -80, maxZ: -20 },
    elevation: 0,
  },
  {
    id: "oldtown",
    name: "OLD TOWN",
    subtitle: "Historic Clock Tower & Cobblestone Plaza",
    spawnPoint: new THREE.Vector3(-70, 0, -110),
    lookAt: new THREE.Vector3(-70, 0, -130),
    bounds: { minX: -130, maxX: -10, minZ: -180, maxZ: -80 },
    elevation: 0,
  },
  {
    id: "neon",
    name: "NEON CITY",
    subtitle: "Nexus Mega-Spire & Elevated Monorail",
    spawnPoint: new THREE.Vector3(70, 0, -110),
    lookAt: new THREE.Vector3(70, 0, -130),
    bounds: { minX: 10, maxX: 130, minZ: -180, maxZ: -80 },
    elevation: 0,
  },
  {
    id: "hills",
    name: "RESIDENTIAL HILLS",
    subtitle: "Winding Switchbacks & Hilltop Observatory",
    spawnPoint: new THREE.Vector3(0, 25, -210),
    lookAt: new THREE.Vector3(0, 25, -240),
    bounds: { minX: -70, maxX: 70, minZ: -280, maxZ: -180 },
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
    spawnPoint: new THREE.Vector3(-170, 0, 50),
    lookAt: new THREE.Vector3(-170, 0, 80),
    bounds: { minX: -230, maxX: -110, minZ: 10, maxZ: 130 },
    elevation: 0,
  },
  {
    id: "monaco",
    name: "DOODLE GRAND PRIX",
    subtitle: "Coastal Street Circuit & Harbor Paddock",
    spawnPoint: new THREE.Vector3(170, 0, 50),
    lookAt: new THREE.Vector3(170, 0, 80),
    bounds: { minX: 110, maxX: 230, minZ: 10, maxZ: 130 },
    elevation: 0,
  },
  {
    id: "industrial",
    name: "INDUSTRIAL DISTRICT",
    subtitle: "Smokestacks, Gantry Cranes & Rail Depot",
    spawnPoint: new THREE.Vector3(-170, 0, 180),
    lookAt: new THREE.Vector3(-170, 0, 210),
    bounds: { minX: -230, maxX: -110, minZ: 140, maxZ: 260 },
    elevation: 0,
  },
  {
    id: "underground",
    name: "UNDERGROUND CITY",
    subtitle: "Subterranean Subway Hub & Secret Labs",
    spawnPoint: new THREE.Vector3(0, -16, 70),
    lookAt: new THREE.Vector3(0, -16, 100),
    bounds: { minX: -60, maxX: 60, minZ: 40, maxZ: 140 },
    elevation: -16,
  },
  {
    id: "waterfront",
    name: "WATERFRONT & PIER",
    subtitle: "Ocean Boardwalk, Ferris Wheel & Lighthouse",
    spawnPoint: new THREE.Vector3(-60, 0, 270),
    lookAt: new THREE.Vector3(-60, 0, 310),
    bounds: { minX: -120, maxX: 0, minZ: 240, maxZ: 360 },
    elevation: 0,
  },
  {
    id: "port",
    name: "PORT DISTRICT",
    subtitle: "Container Cargo Ships & Quay Cranes",
    spawnPoint: new THREE.Vector3(90, 0, 270),
    lookAt: new THREE.Vector3(90, 0, 310),
    bounds: { minX: 30, maxX: 150, minZ: 240, maxZ: 360 },
    elevation: 0,
  },
  {
    id: "airport",
    name: "AIRPORT DISTRICT",
    subtitle: "Terminal Hall, Control Tower & Runway",
    spawnPoint: new THREE.Vector3(-60, 0, 390),
    lookAt: new THREE.Vector3(-60, 0, 430),
    bounds: { minX: -130, maxX: 10, minZ: 360, maxZ: 480 },
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

    // 1. Downtown (NYC-style skyscrapers at offset X: -70, Z: 0)
    const downtownGroup = new THREE.Group();
    downtownGroup.position.set(-70, 0, 0);
    this.populateDowntownDetailed(city, downtownGroup);
    metropolisGroup.add(downtownGroup);

    // 2. Entertainment District (X: 70, Z: 0)
    metropolisGroup.add(this.buildEntertainment(city, new THREE.Vector3(70, 0, 0)));

    // 3. Market District (X: 0, Z: -50)
    metropolisGroup.add(this.buildMarket(city, new THREE.Vector3(0, 0, -50)));

    // 4. Old Town (X: -70, Z: -130)
    metropolisGroup.add(this.buildOldTown(city, new THREE.Vector3(-70, 0, -130)));

    // 5. Neon City (X: 70, Z: -130)
    metropolisGroup.add(this.buildNeon(city, new THREE.Vector3(70, 0, -130)));

    // 6. Residential Hills (X: 0, Y: 25, Z: -230)
    metropolisGroup.add(this.buildResidentialHills(city, new THREE.Vector3(0, 0, -230)));

    // 7. Cloud District (X: 0, Y: 80, Z: -340)
    metropolisGroup.add(this.buildCloudDistrict(city, new THREE.Vector3(0, 80, -340)));

    // 8. University / Creative District (X: -170, Z: 70)
    metropolisGroup.add(this.buildUniversity(city, new THREE.Vector3(-170, 0, 70)));

    // 9. Monaco GP District (X: 170, Z: 70)
    metropolisGroup.add(this.buildMonacoCircuitDetailed(city, new THREE.Vector3(170, 0, 70)));

    // 10. Industrial District (X: -170, Z: 200)
    metropolisGroup.add(this.buildIndustrial(city, new THREE.Vector3(-170, 0, 200)));

    // 11. Underground City (X: 0, Y: -16, Z: 90)
    metropolisGroup.add(this.buildUnderground(city, new THREE.Vector3(0, -16, 90)));

    // 12. Waterfront & Pier (X: -60, Z: 300)
    metropolisGroup.add(this.buildWaterfront(city, new THREE.Vector3(-60, 0, 300)));

    // 13. Port District (X: 90, Z: 300)
    metropolisGroup.add(this.buildPort(city, new THREE.Vector3(90, 0, 300)));

    // 14. Airport District (X: -60, Z: 420)
    metropolisGroup.add(this.buildAirport(city, new THREE.Vector3(-60, 0, 420)));

    // 15. Secret / Endgame Core (X: 0, Y: -25, Z: -340)
    metropolisGroup.add(this.buildSecretDistrict(city, new THREE.Vector3(0, -25, -340)));

    // 16. Transit Arteries (Highways, Intersections, Subway Portals, Skyway Tower)
    metropolisGroup.add(this.buildConnectingArteries(city));

    // Attach master group to scene
    if (city.engine && city.engine.scene) {
      city.engine.scene.add(metropolisGroup);
    }
    if (Array.isArray(city.buildings)) {
      city.buildings.push(metropolisGroup);
    }

    city.currentDistrict = "downtown";

    // Spawn secrets across all 15 districts
    if (typeof city.spawnAllSecrets === "function") {
      city.spawnAllSecrets();
    }

    // Recompute and cache all solid physical colliders across Doodle Metropolis
    if (typeof city.updateColliders === "function") {
      city.updateColliders();
    }

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
    // Cyber Ramen Giant Holographic Chopsticks
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1.4, 1.8, 12), mats.red);
    bowl.position.set(0, 9.2, 0);
    const chopstick = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5, 6), mats.orange);
    chopstick.position.set(0.6, 11, 0);
    chopstick.rotation.z = Math.PI / 4;
    cafe.add(cBldg, cSign, bowl, chopstick);
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
      // Wrought-Iron Tavern Sign
      const signArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 2.5), mats.black);
      signArm.position.set(cfg.w / 2 + 1.2, cfg.h * 0.6, 0);
      const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 1.8), mats.orange);
      signBoard.position.set(cfg.w / 2 + 1.2, cfg.h * 0.6 - 0.8, 0);
      house.add(bldg, roof, signArm, signBoard);
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
    parent.add(chrysler);

    // Flatiron Wedge Tower
    const flatiron = new THREE.Group();
    flatiron.position.set(-30, 0, 25);
    const fBody = new THREE.Mesh(new THREE.CylinderGeometry(1, 10, 48, 3), mats.blue);
    fBody.position.y = 24;
    flatiron.add(fBody);
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
    parent.add(tsGroup);

    // Brownstone row with rooftop water towers and fire escapes
    for (let z = -40; z <= -10; z += 12) {
      const bs = new THREE.Mesh(new THREE.BoxGeometry(10, 14, 10), mats.orange);
      bs.position.set(-35, 7, z);
      const wtLegs = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3, 2.4), mats.black);
      wtLegs.position.set(-35, 15.5, z);
      const wtTank = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 3, 12), mats.orange);
      wtTank.position.set(-35, 18.5, z);
      parent.add(bs, wtLegs, wtTank);
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
      }
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
      group.add(bldg, rf);
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
    obs.add(obsBase, obsDome, telescope, radioMast);
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
    villa.add(vMain, pool, board);
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
    spire.add(s1, s2, sAntenna);
    group.add(spire);

    // 2. West & East Flanking Sky Towers
    const towerW = new THREE.Mesh(new THREE.BoxGeometry(18, 45, 18), mats.blue);
    towerW.position.set(-45, 23.75, 0);
    const towerE = new THREE.Mesh(new THREE.BoxGeometry(18, 45, 18), mats.blue);
    towerE.position.set(45, 23.75, 0);
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
    airship.add(gasbag, nose, gondola, fins);
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
    bellTower.add(btShaft, btSpire);
    group.add(bellTower);

    // Science Lecture Hall & Observatory
    const sci = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 28), mats.blue);
    sci.position.set(-36, 7, 10);
    group.add(sci);

    // Arts & Design Studios
    const arts = new THREE.Mesh(new THREE.BoxGeometry(24, 16, 26), mats.orange);
    arts.position.set(36, 8, 10);
    group.add(arts);

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
    group.add(stand);

    // Harbor Wall & Superyacht
    const yacht = new THREE.Group();
    yacht.position.set(-25, 0.6, -20);
    const hull = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 24), mats.blue);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 14), mats.orange);
    cabin.position.y = 3.5;
    yacht.add(hull, cabin);
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
      factory.add(door);
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
    lighthouse.add(lhBase, lhTower, lhLantern, lhDome, lhBeacon);
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
    windsock.add(wsPole, wsCone);
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

  // 16. Transit Arteries: Central Grand Boulevard, Expressways & Skyway Tower
  private static buildConnectingArteries(city: any): THREE.Group {
    const arteries = new THREE.Group();
    arteries.name = "Transit_Arteries";
    const mats = this.getMaterials(city);

    // 1. Central North-South Grand Boulevard (spanning Z: -180 to Z: 360 along X: 0)
    const grandAve = new THREE.Mesh(new THREE.BoxGeometry(14, 0.06, 540), mats.blue);
    grandAve.position.set(0, 0.03, 90);
    grandAve.userData.noCollision = true;
    arteries.add(grandAve);

    // Yellow center lines along Grand Boulevard
    for (let z = -170; z <= 350; z += 12) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 6), mats.orange);
      stripe.position.set(0, 0.05, z);
      stripe.userData.noCollision = true;
      arteries.add(stripe);
    }

    // 2. East-West Central Expressway (spanning X: -220 to X: 220 along Z: 0)
    const expressWay = new THREE.Mesh(new THREE.BoxGeometry(440, 0.06, 14), mats.blue);
    expressWay.position.set(0, 0.03, 0);
    expressWay.userData.noCollision = true;
    arteries.add(expressWay);

    // 3. North Cross Expressway (spanning X: -120 to X: 120 along Z: -130)
    const northAve = new THREE.Mesh(new THREE.BoxGeometry(240, 0.06, 12), mats.blue);
    northAve.position.set(0, 0.03, -130);
    northAve.userData.noCollision = true;
    arteries.add(northAve);

    // 4. Express Skyway Elevator Shaft (Climbing from Residential Hills Y: 25 to Cloud District Y: 80)
    const elevatorTower = new THREE.Group();
    elevatorTower.position.set(0, 0, -280);

    const shaft = new THREE.Mesh(new THREE.BoxGeometry(6, 80, 6), mats.black);
    shaft.position.y = 40;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(6.4, 8, 6.4), mats.orange);
    cabin.position.y = 52;
    elevatorTower.add(shaft, cabin);
    arteries.add(elevatorTower);

    // 5. Hillside Switchback Ramp (climbing from Z: -180, Y: 0 to Z: -220, Y: 25)
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, 50), mats.blue);
    ramp.position.set(0, 12.5, -200);
    ramp.rotation.x = -Math.atan2(25, 50);
    arteries.add(ramp);

    // 6. Subway Entrance Portals in Downtown, Neon, Market, and Waterfront
    const subwayLocations = [
      { x: -50, z: -10, name: "Downtown Subway Entrance" },
      { x: 50, z: -110, name: "Neon City Subway Entrance" },
      { x: 0, z: -35, name: "Central Market Subway Entrance" },
      { x: -40, z: 260, name: "Waterfront Boardwalk Subway" },
    ];
    subwayLocations.forEach((loc) => {
      const entrance = new THREE.Group();
      entrance.position.set(loc.x, 0, loc.z);
      const kiosk = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 8), mats.black);
      kiosk.position.y = 2;
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 9), mats.green);
      canopy.position.y = 4.4;
      const stairs = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 6), mats.cyan);
      stairs.position.set(0, 0.1, 0);
      stairs.userData.noCollision = true;
      entrance.add(kiosk, canopy, stairs);
      arteries.add(entrance);
    });

    return arteries;
  }
}
