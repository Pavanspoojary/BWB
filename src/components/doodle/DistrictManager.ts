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
    cafe.add(cBldg, cSign);
    group.add(cafe);

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

    // Brownstone row
    for (let z = -40; z <= -10; z += 12) {
      const bs = new THREE.Mesh(new THREE.BoxGeometry(10, 14, 10), mats.orange);
      bs.position.set(-35, 7, z);
      parent.add(bs);
    }
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

    // 2. STARLIGHT THEATER
    const theater = new THREE.Group();
    theater.position.set(-36, 0, 24);
    const tBody = new THREE.Mesh(new THREE.BoxGeometry(22, 22, 26), mats.blue);
    tBody.position.y = 11;
    const tCanopy = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 8), mats.orange);
    tCanopy.position.set(0, 6, 16);
    const tSign = new THREE.Mesh(new THREE.BoxGeometry(16, 5, 0.4), mats.red);
    tSign.position.set(0, 10, 13.5);
    theater.add(tBody, tCanopy, tSign);
    group.add(theater);

    // 3. PIXEL PALACE Arcade
    const arcade = new THREE.Group();
    arcade.position.set(36, 0, 24);
    const aBody = new THREE.Mesh(new THREE.BoxGeometry(20, 18, 22), mats.black);
    aBody.position.y = 9;
    const aScreen = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 0.4), mats.cyan);
    aScreen.position.set(0, 10, 11.2);
    arcade.add(aBody, aScreen);
    group.add(arcade);

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

    // Central Covered Bazaar Hall
    const hall = new THREE.Group();
    hall.position.set(0, 0, 0);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(16, 8, 4), mats.orange);
    roof.position.y = 12;
    roof.rotation.y = Math.PI / 4;
    // Pillars
    for (let px of [-10, 10]) {
      for (let pz of [-10, 10]) {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 10, 1.4), mats.blue);
        pillar.position.set(px, 5, pz);
        hall.add(pillar);
      }
    }
    hall.add(roof);
    group.add(hall);

    // Market stalls lining the street
    const stallColors = [mats.red, mats.orange, mats.green, mats.cyan, mats.blue];
    for (let i = 0; i < 6; i++) {
      const zPos = -26 + i * 10;
      // West stall
      const s1 = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 5), mats.black);
      s1.position.set(-20, 2, zPos);
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 6), stallColors[i % stallColors.length]);
      c1.position.set(-20, 4.4, zPos);
      group.add(s1, c1);

      // East stall
      const s2 = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 5), mats.black);
      s2.position.set(20, 2, zPos);
      const c2 = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 6), stallColors[(i + 2) % stallColors.length]);
      c2.position.set(20, 4.4, zPos);
      group.add(s2, c2);
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

    // Summit Astronomical Observatory
    const obs = new THREE.Group();
    obs.position.set(0, 25, -55);
    const obsBase = new THREE.Mesh(new THREE.CylinderGeometry(10, 11, 12, 16), mats.black);
    obsBase.position.y = 6;
    const obsDome = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.cyan);
    obsDome.position.y = 12;
    const telescope = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 16, 8), mats.red);
    telescope.position.set(0, 16, 4);
    telescope.rotation.x = Math.PI / 3;
    obs.add(obsBase, obsDome, telescope);
    group.add(obs);

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

    // Grand Domed Library
    const lib = new THREE.Group();
    lib.position.set(0, 0, -30);
    const lBody = new THREE.Mesh(new THREE.BoxGeometry(34, 18, 22), mats.blue);
    lBody.position.y = 9;
    const lDome = new THREE.Mesh(new THREE.SphereGeometry(12, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.orange);
    lDome.position.y = 18;
    // Portico pillars
    for (let px = -12; px <= 12; px += 6) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 16, 8), mats.black);
      p.position.set(px, 8, 12);
      lib.add(p);
    }
    lib.add(lBody, lDome);
    group.add(lib);

    // Science Lecture Hall & Observatory
    const sci = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 28), mats.blue);
    sci.position.set(-36, 7, 10);
    group.add(sci);

    // Arts & Design Studios
    const arts = new THREE.Mesh(new THREE.BoxGeometry(24, 16, 26), mats.orange);
    arts.position.set(36, 8, 10);
    group.add(arts);

    // Outdoor abstract sculpture in quad center
    const sculp = new THREE.Mesh(new THREE.TorusKnotGeometry(3, 0.8, 32, 8), mats.red);
    sculp.position.set(0, 5, 12);
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
    group.add(trackLoop);

    // Start/Finish Pit Straight Gantry
    const gantry = new THREE.Group();
    gantry.position.set(0, 0, 38);
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 10, 1.2), mats.red);
    p1.position.set(-8, 5, 0);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 10, 1.2), mats.red);
    p2.position.set(8, 5, 0);
    const span = new THREE.Mesh(new THREE.BoxGeometry(18, 2.4, 2), mats.blue);
    span.position.set(0, 9.5, 0);
    gantry.add(p1, p2, span);
    group.add(gantry);

    // Multi-tier Grandstands
    const stand = new THREE.Group();
    stand.position.set(0, 0, 52);
    for (let i = 0; i < 4; i++) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(36, 1.2, 2.5), mats.orange);
      bench.position.set(0, 1 + i * 1.6, -i * 2.2);
      stand.add(bench);
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

  // 10. Industrial District
  public static buildIndustrial(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mats.black);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.02;
    ground.userData.noCollision = true;
    group.add(ground);

    // Three Industrial Brick Smokestacks
    for (let i = 0; i < 3; i++) {
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(2, 3.2, 38, 12), mats.orange);
      stack.position.set(-30 + i * 12, 19, -25);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.4, 6, 12), mats.red);
      ring.position.set(-30 + i * 12, 36, -25);
      group.add(stack, ring);
    }

    // Heavy Assembly Plant with Sawtooth Roof
    const factory = new THREE.Group();
    factory.position.set(25, 0, -10);
    const fBody = new THREE.Mesh(new THREE.BoxGeometry(32, 18, 38), mats.blue);
    fBody.position.y = 9;
    factory.add(fBody);
    group.add(factory);

    // Giant Gantry Container Crane
    const crane = new THREE.Group();
    crane.position.set(-10, 0, 25);
    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(2, 28, 2), mats.red);
    leg1.position.set(-14, 14, 0);
    const leg2 = new THREE.Mesh(new THREE.BoxGeometry(2, 28, 2), mats.red);
    leg2.position.set(14, 14, 0);
    const girder = new THREE.Mesh(new THREE.BoxGeometry(34, 3, 3), mats.orange);
    girder.position.set(0, 28, 0);
    crane.add(leg1, leg2, girder);
    group.add(crane);

    // Steel Storage Silos
    for (let sx of [20, 36]) {
      const silo = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 20, 16), mats.cyan);
      silo.position.set(sx, 10, 30);
      const sDome = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mats.black);
      sDome.position.set(sx, 20, 30);
      group.add(silo, sDome);
    }

    return group;
  }

  // 11. Underground City (Subterranean Hub & Vaulted Tunnels)
  public static buildUnderground(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // Subterranean Floor at Y: 0 (which sits at -16m in world)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 100), mats.black);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.02;
    floor.userData.noCollision = true;
    group.add(floor);

    // Vaulted Ceiling & Columns
    for (let x = -40; x <= 40; x += 20) {
      for (let z = -30; z <= 30; z += 20) {
        const col = new THREE.Mesh(new THREE.BoxGeometry(2.4, 14, 2.4), mats.blue);
        col.position.set(x, 7, z);
        const arch = new THREE.Mesh(new THREE.BoxGeometry(20, 1.4, 2.4), mats.orange);
        arch.position.set(x, 14, z);
        group.add(col, arch);
      }
    }

    // Subway Platforms & Train Tracks
    const platform = new THREE.Mesh(new THREE.BoxGeometry(70, 1.2, 14), mats.blue);
    platform.position.set(0, 0.6, 0);
    const trackRails = new THREE.Mesh(new THREE.BoxGeometry(80, 0.2, 6), mats.cyan);
    trackRails.position.set(0, 0.1, -15);
    trackRails.userData.noCollision = true;
    group.add(platform, trackRails);

    // Subway Train Car
    const train = new THREE.Mesh(new THREE.BoxGeometry(34, 5.5, 4.5), mats.red);
    train.position.set(6, 3.2, -15);
    group.add(train);

    // Secret Research Laboratory Bunker
    const lab = new THREE.Group();
    lab.position.set(-35, 0, 25);
    const labBldg = new THREE.Mesh(new THREE.BoxGeometry(16, 9, 18), mats.black);
    labBldg.position.y = 4.5;
    const labSign = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 0.4), mats.cyan);
    labSign.position.set(0, 7, 9.2);
    lab.add(labBldg, labSign);
    group.add(lab);

    return group;
  }

  // 13. Port District (Container Terminal & Cargo Quay)
  public static buildPort(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // Concrete Quay Ground
    const quay = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mats.black);
    quay.rotation.x = -Math.PI / 2;
    quay.position.y = 0.02;
    quay.userData.noCollision = true;
    group.add(quay);

    // Docked Cargo Ship
    const ship = new THREE.Group();
    ship.position.set(35, 0, 0);
    const sHull = new THREE.Mesh(new THREE.BoxGeometry(18, 8, 70), mats.blue);
    sHull.position.y = 4;
    const sBridge = new THREE.Mesh(new THREE.BoxGeometry(14, 14, 16), mats.orange);
    sBridge.position.set(0, 15, -20);
    ship.add(sHull, sBridge);
    group.add(ship);

    // Stacks of Shipping Containers
    const containerColors = [mats.red, mats.orange, mats.green, mats.cyan, mats.blue];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const cont = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 16), containerColors[(r + c) % containerColors.length]);
        cont.position.set(-35 + c * 9, 2 + (r % 2) * 4.2, -30 + r * 18);
        group.add(cont);
      }
    }

    // Ship-to-Shore Rail Crane
    const crane = new THREE.Group();
    crane.position.set(16, 0, 0);
    const cBoom = new THREE.Mesh(new THREE.BoxGeometry(45, 3.5, 4), mats.red);
    cBoom.position.set(0, 32, 0);
    const cPylon = new THREE.Mesh(new THREE.BoxGeometry(4, 32, 4), mats.black);
    cPylon.position.set(0, 16, 0);
    crane.add(cBoom, cPylon);
    group.add(crane);

    return group;
  }

  // 14. Airport District (Terminal, Control Tower & Runway)
  public static buildAirport(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // Tarmac & Runway Ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 120), mats.black);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.02;
    ground.userData.noCollision = true;
    group.add(ground);

    // Runway Strip with White Dashes
    const runway = new THREE.Mesh(new THREE.BoxGeometry(130, 0.04, 22), mats.blue);
    runway.position.set(0, 0.03, 30);
    runway.userData.noCollision = true;
    group.add(runway);

    for (let x = -55; x <= 55; x += 12) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(6, 0.06, 1.2), mats.cyan);
      dash.position.set(x, 0.05, 30);
      dash.userData.noCollision = true;
      group.add(dash);
    }

    // Terminal Hall Building
    const terminal = new THREE.Group();
    terminal.position.set(0, 0, -25);
    const tHall = new THREE.Mesh(new THREE.BoxGeometry(70, 14, 28), mats.blue);
    tHall.position.y = 7;
    const tRoof = new THREE.Mesh(new THREE.CylinderGeometry(36, 36, 70, 16, 1, false, 0, Math.PI), mats.cyan);
    tRoof.position.set(0, 14, 0);
    tRoof.rotation.z = Math.PI / 2;
    terminal.add(tHall, tRoof);
    group.add(terminal);

    // Air Traffic Control Tower
    const tower = new THREE.Group();
    tower.position.set(48, 0, -25);
    const tShaft = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.5, 42, 12), mats.black);
    tShaft.position.y = 21;
    const tCab = new THREE.Mesh(new THREE.CylinderGeometry(7, 5, 8, 12), mats.orange);
    tCab.position.y = 44;
    const tRadar = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), mats.red);
    tRadar.position.y = 50;
    tower.add(tShaft, tCab, tRadar);
    group.add(tower);

    // Parked Passenger Jet Airplane
    const plane = new THREE.Group();
    plane.position.set(-25, 3.5, -5);
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 28, 12), mats.cyan);
    fuselage.rotation.z = Math.PI / 2;
    const wings = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 26), mats.blue);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 0.6), mats.red);
    tail.position.set(-12, 3, 0);
    plane.add(fuselage, wings, tail);
    group.add(plane);

    return group;
  }

  // 15. Secret / Endgame District ("The Blueprint Core")
  public static buildSecretDistrict(city?: any, offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(offset);
    const mats = this.getMaterials(city);

    // The Drafting Floor (Dark Blueprint Grid)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), mats.black);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.02;
    floor.userData.noCollision = true;
    group.add(floor);

    // Colossal Golden Fountain Pen Monument (Centerpiece)
    const pen = new THREE.Group();
    pen.position.set(0, 0, 0);
    const nib = new THREE.Mesh(new THREE.ConeGeometry(3, 10, 4), mats.orange);
    nib.position.y = 5;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 30, 12), mats.blue);
    barrel.position.y = 25;
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.8, 18, 1.4), mats.red);
    clip.position.set(0, 26, 3.2);
    pen.add(nib, barrel, clip);
    group.add(pen);

    // Impossible Floating Wireframe Cubes & Monoliths
    const cubeOffsets = [
      [-24, 12, -24],
      [24, 18, -24],
      [-24, 22, 24],
      [24, 14, 24],
    ];
    cubeOffsets.forEach(([cx, cy, cz]) => {
      const cube = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), mats.cyan);
      cube.position.set(cx, cy, cz);
      cube.rotation.set(0.3, 0.4, 0.2);
      group.add(cube);
    });

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
