import * as THREE from "three";
import { DoodleEngine, INK_COLORS } from "./DoodleEngine";
import { doodleAudio } from "./DoodleAudio";
import { DistrictManager, DISTRICT_REGISTRY } from "./DistrictManager";
export type BuildingType =
  | "skyscraper"
  | "indie-loft"
  | "tech-cafe"
  | "data-center"
  | "crane-tower"
  | "highway-billboard"
  | "street-kiosk"
  | "tree"
  | "streetlight";

export interface AdSpace {
  id: string;
  title: string;
  category: "Rooftop Billboard" | "Wall Banner" | "Highway Billboard" | "Street Kiosk" | "Scaffolding Ad";
  viewsMonthly: number;
  priceMonthly: number;
  sponsorName: string;
  sponsorTagline: string;
  accentColor: string;
  isAvailable: boolean;
  mesh: THREE.Mesh;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  parentGroup: THREE.Group;
}

interface TrafficVehicle {
  group: THREE.Group;
  speed: number;
  axis: "x" | "z";
  direction: number;
  min: number;
  max: number;
  wheels: THREE.Mesh[];
}

export interface DoodleSecret {
  id: string;
  district: string;
  name: string;
  position: THREE.Vector3;
  mesh?: THREE.Group;
  collected: boolean;
}

export class CityBuilder {
  public engine: DoodleEngine;
  public adSpaces: Map<string, AdSpace> = new Map();
  public buildings: THREE.Group[] = [];
  public selectedAdSpace: AdSpace | null = null;
  public buildTool: BuildingType | "select" | "demolish" = "select";
  public currentDistrict: string = "downtown";
  public secrets: DoodleSecret[] = [];
  public collectedSecrets: Set<string> = new Set();
  public cameraController?: any;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private groundPlane: THREE.Mesh;
  private trafficCars: TrafficVehicle[] = [];
  private f1Cars: {
    group: THREE.Group;
    speed: number;
    progress: number;
    wheels: THREE.Mesh[];
    frontWheels: THREE.Mesh[];
    rearLight: THREE.Mesh;
    spark: THREE.Mesh;
    name: string;
  }[] = [];
  private f1TrackCurve: THREE.CatmullRomCurve3 | null = null;
  private yachts: THREE.Group[] = [];
  private yachtRadars: THREE.Mesh[] = [];
  private tenderBoat: { group: THREE.Group; progress: number; speed: number; wake: THREE.Mesh } | null = null;
  private pedestrians: {
    group: THREE.Group;
    axis: "x" | "z";
    dir: number;
    min: number;
    max: number;
    speed: number;
    legs: THREE.Mesh[];
  }[] = [];
  private clouds: THREE.Group[] = [];
  private paperAirplane: THREE.Group | null = null;
  private subwayTrain: THREE.Group | null = null;
  private steamPuffs: { mesh: THREE.Mesh; basePos: THREE.Vector3; timeOffset: number }[] = [];
  private airplaneAngle = 0;
  private trainProgress = -55;

  private defaultMats: {
    blue: THREE.ShaderMaterial;
    blueFill: THREE.ShaderMaterial;
    red: THREE.ShaderMaterial;
    black: THREE.ShaderMaterial;
    orange: THREE.ShaderMaterial;
    green: THREE.ShaderMaterial;
    cyan: THREE.ShaderMaterial;
  };

  // Pre-configured NYC sponsor billboards
  private initialAdConfigs = [
    {
      title: "One Times Square - Towering LED Spectacular",
      category: "Rooftop Billboard" as const,
      viewsMonthly: 280000,
      priceMonthly: 2400,
      sponsorName: "STRIPE",
      sponsorTagline: "Financial infrastructure for the internet",
      accentColor: "#6366f1",
      isAvailable: false,
    },
    {
      title: "Empire State Building - 34th St Billboard",
      category: "Rooftop Billboard" as const,
      viewsMonthly: 195000,
      priceMonthly: 1600,
      sponsorName: "VERCEL",
      sponsorTagline: "Develop. Preview. Ship. Fast.",
      accentColor: "#1a30c0",
      isAvailable: false,
    },
    {
      title: "Chrysler Spire - 42nd St Mega-Banner",
      category: "Rooftop Billboard" as const,
      viewsMonthly: 220000,
      priceMonthly: 1850,
      sponsorName: "RAYCAST",
      sponsorTagline: "Supercharged productivity shortcuts for Mac",
      accentColor: "#ef4444",
      isAvailable: false,
    },
    {
      title: "Flatiron Prow - Broadway & 5th Ave",
      category: "Wall Banner" as const,
      viewsMonthly: 140000,
      priceMonthly: 1200,
      sponsorName: "SUPABASE",
      sponsorTagline: "The Open Source Firebase Alternative",
      accentColor: "#10b981",
      isAvailable: false,
    },
    {
      title: "Times Square Broadway - Digital Canyon Wall",
      category: "Rooftop Billboard" as const,
      viewsMonthly: 110000,
      priceMonthly: 950,
      sponsorName: "TURSO",
      sponsorTagline: "SQLite distributed database for developers",
      accentColor: "#06b6d4",
      isAvailable: false,
    },
    {
      title: "High Line Elevated Rail - Overpass Billboard",
      category: "Highway Billboard" as const,
      viewsMonthly: 165000,
      priceMonthly: 1350,
      sponsorName: "GITHUB",
      sponsorTagline: "Where the world builds software",
      accentColor: "#1a30c0",
      isAvailable: false,
    },
    {
      title: "West Village Brownstone - Fire Escape Banner",
      category: "Wall Banner" as const,
      viewsMonthly: 65000,
      priceMonthly: 450,
      sponsorName: "YOUR BRAND HERE",
      sponsorTagline: "Prime pedestrian visibility in Soho",
      accentColor: "#d02030",
      isAvailable: true,
    },
    {
      title: "Subway 42nd St Station - Entrance Kiosk",
      category: "Street Kiosk" as const,
      viewsMonthly: 48000,
      priceMonthly: 320,
      sponsorName: "POSTHOG",
      sponsorTagline: "Open-source product analytics suite",
      accentColor: "#ea580c",
      isAvailable: false,
    },
    {
      title: "Madison Square Plaza - Newsstand Kiosk",
      category: "Street Kiosk" as const,
      viewsMonthly: 35000,
      priceMonthly: 280,
      sponsorName: "BUILT WHILE BROKE",
      sponsorTagline: "Radical zero-dollar architecture hacks",
      accentColor: "#d02030",
      isAvailable: true,
    },
  ];

  // Pre-configured Monaco Grand Prix F1 sponsor billboards
  private monacoAdConfigs = [
    {
      title: "Start/Finish Pit Straight Gantry",
      category: "Highway Billboard" as const,
      viewsMonthly: 340000,
      priceMonthly: 3200,
      sponsorName: "TAG HEUER",
      sponsorTagline: "Official Timekeeper of the Monaco Grand Prix",
      accentColor: "#dc2626",
      isAvailable: false,
    },
    {
      title: "Fairmont Hairpin Grandstand Apex Wall",
      category: "Wall Banner" as const,
      viewsMonthly: 290000,
      priceMonthly: 2600,
      sponsorName: "PIRELLI",
      sponsorTagline: "P Zero F1 Slick Racing Compounds",
      accentColor: "#f59e0b",
      isAvailable: false,
    },
    {
      title: "The Monaco Tunnel Entrance Overpass",
      category: "Highway Billboard" as const,
      viewsMonthly: 310000,
      priceMonthly: 2800,
      sponsorName: "RED BULL",
      sponsorTagline: "Gives You Wings · Oracle Racing",
      accentColor: "#1d4ed8",
      isAvailable: false,
    },
    {
      title: "M/Y Doodle - Harbor Superyacht VIP Deck",
      category: "Rooftop Billboard" as const,
      viewsMonthly: 240000,
      priceMonthly: 2100,
      sponsorName: "FERRARI",
      sponsorTagline: "Scuderia Ferrari HP · Passion & Speed",
      accentColor: "#b91c1c",
      isAvailable: false,
    },
    {
      title: "Swimming Pool Chicane Pedestrian Bridge",
      category: "Highway Billboard" as const,
      viewsMonthly: 215000,
      priceMonthly: 1950,
      sponsorName: "MERCEDES-AMG",
      sponsorTagline: "Petronas F1 Team · Performance Engineering",
      accentColor: "#0d9488",
      isAvailable: false,
    },
    {
      title: "Monte Carlo Casino Square Plaza",
      category: "Wall Banner" as const,
      viewsMonthly: 275000,
      priceMonthly: 2500,
      sponsorName: "MCLAREN",
      sponsorTagline: "Papaya Orange · Speed & Innovation",
      accentColor: "#ea580c",
      isAvailable: false,
    },
    {
      title: "Portier Corner - Harbor Wall Barrier",
      category: "Street Kiosk" as const,
      viewsMonthly: 130000,
      priceMonthly: 1100,
      sponsorName: "RAYCAST",
      sponsorTagline: "Supercharged Developer Shortcuts",
      accentColor: "#ef4444",
      isAvailable: true,
    },
    {
      title: "Nouvelle Chicane Braking Zone",
      category: "Street Kiosk" as const,
      viewsMonthly: 145000,
      priceMonthly: 1250,
      sponsorName: "SUPABASE",
      sponsorTagline: "Postgres Database for High Speed Apps",
      accentColor: "#10b981",
      isAvailable: true,
    },
  ];

  constructor(engine: DoodleEngine) {
    this.engine = engine;

    this.defaultMats = {
      blue: engine.createDoodleMaterial({ ink: INK_COLORS.BLUE, fill: false }),
      blueFill: engine.createDoodleMaterial({ ink: INK_COLORS.BLUE, fill: true }),
      red: engine.createDoodleMaterial({ ink: INK_COLORS.RED, fill: false }),
      black: engine.createDoodleMaterial({ ink: INK_COLORS.BLACK, fill: false }),
      orange: engine.createDoodleMaterial({ ink: INK_COLORS.ORANGE, fill: false }),
      green: engine.createDoodleMaterial({ ink: INK_COLORS.GREEN, fill: false, shadeScale: 0.85, shadeBias: 0.15 }),
      cyan: engine.createDoodleMaterial({ ink: INK_COLORS.CYAN, fill: false }),
    };

    // Ground Plane with Notebook Grid - Hand-drawn blueprint aesthetic across Doodle Metropolis
    const groundGeo = new THREE.PlaneGeometry(1200, 1200, 64, 64);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = engine.createDoodleMaterial({ ink: INK_COLORS.BLACK, fill: false, shadeBias: 0.18 });
    this.groundPlane = new THREE.Mesh(groundGeo, groundMat);
    this.groundPlane.position.y = 0;
    this.engine.scene.add(this.groundPlane);

    // Build the complete, unified Doodle Metropolis containing all 15 connected districts
    DistrictManager.buildAllDistricts(this);
  }

  // Returns bounding boxes for solid structures to prevent walking through walls
  public getColliders(): THREE.Box3[] {
    const boxes: THREE.Box3[] = [];
    for (const b of this.buildings) {
      if (b.userData && b.userData.noCollision) continue;
      const box = new THREE.Box3().setFromObject(b);
      const sizeX = box.max.x - box.min.x;
      const sizeY = box.max.y - box.min.y;
      const sizeZ = box.max.z - box.min.z;
      // Filter out flat planes, particles, or oversized district boundaries
      if (sizeY > 1.2 && sizeX < 250 && sizeZ < 250 && sizeX > 0.4 && sizeZ > 0.4) {
        boxes.push(box);
      }
    }
    return boxes;
  }

  // Master method: Builds the authentic, fully detailed New York City at blueprint scale
  public buildNewYorkCity() {
    this.createManhattanStreetGrid();
    this.createEmpireStateBuilding(40, 18);
    this.createChryslerBuilding(96, -20);
    this.createFlatironBuilding(12, 56);
    this.createTimesSquareCanyon(-16, -20);
    this.createCornerBodegaAndPizza(12, 18);
    this.createBrownstoneRow(-44, 56);
    this.createBrownstoneRow(-44, 94);
    this.createHighLineElevatedTrain(-88, 56);
    this.createCentralPark(-2, -150);
    this.createOneWorldTradeCenter(12, 208);
    this.createSubwayEntrances();
    this.createNYCYellowCabs();
    this.createNYPDPoliceCruiser(-16, -32);
    this.createNYCPedestrians();
    this.createStreetFurniture();
    this.createAtmosphere();
    this.spawnDistrictSecrets("nyc");
  }

  // 1. Authentic Manhattan Grid: 9th, 8th, Broadway, 6th, 5th, Madison & Park Avenues with Cross Streets
  private createManhattanStreetGrid() {
    const gridGroup = new THREE.Group();
    const streetMat = this.defaultMats.blue;
    const dashMat = this.defaultMats.blue;
    const curbMat = this.defaultMats.black;

    // Avenues (North-South, Z axis from West to East)
    const avenues = [
      { x: -72, width: 8.5, name: "9th Avenue" },
      { x: -44, width: 8.5, name: "8th Avenue" },
      { x: -16, width: 9.5, name: "Broadway / 7th Ave" },
      { x: 12, width: 8.5, name: "6th Avenue (Americas)" },
      { x: 40, width: 9.5, name: "5th Avenue" },
      { x: 68, width: 8.5, name: "Madison Avenue" },
      { x: 96, width: 9.0, name: "Park Avenue" },
    ];

    // Cross Streets (East-West, X axis from North to South)
    const streets = [
      { z: -90, width: 8.5, name: "59th Street (Central Park South)" },
      { z: -56, width: 7.5, name: "50th Street" },
      { z: -20, width: 8.5, name: "42nd Street" },
      { z: 18, width: 8.5, name: "34th Street" },
      { z: 56, width: 7.5, name: "23rd Street" },
      { z: 94, width: 7.5, name: "14th Street" },
      { z: 132, width: 7.5, name: "Houston Street" },
      { z: 170, width: 7.5, name: "Canal Street" },
      { z: 208, width: 8.5, name: "Wall Street" },
    ];

    // Perimeter boundary line
    const border = new THREE.Mesh(new THREE.BoxGeometry(200, 0.08, 330), streetMat);
    border.position.set(12, 0.01, 59);
    gridGroup.add(border);

    // Render Avenues with Yellow Center Dashes
    avenues.forEach((ave) => {
      const road = new THREE.Mesh(new THREE.BoxGeometry(ave.width, 0.04, 320), streetMat);
      road.position.set(ave.x, 0.02, 59);
      gridGroup.add(road);

      // Yellow double center line dashes
      for (let z = -98; z <= 216; z += 4) {
        const d1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 1.8), this.defaultMats.orange);
        d1.position.set(ave.x - 0.2, 0.035, z);
        const d2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 1.8), this.defaultMats.orange);
        d2.position.set(ave.x + 0.2, 0.035, z);
        gridGroup.add(d1, d2);
      }
    });

    // Render Cross Streets with Dashed Lines
    streets.forEach((st) => {
      const road = new THREE.Mesh(new THREE.BoxGeometry(190, 0.04, st.width), streetMat);
      road.position.set(12, 0.02, st.z);
      gridGroup.add(road);

      for (let x = -80; x <= 104; x += 4) {
        const d = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.25), dashMat);
        d.position.set(x, 0.035, st.z);
        gridGroup.add(d);
      }

      // Zebra crosswalks at each Avenue intersection
      avenues.forEach((ave) => {
        const offsets = [-ave.width / 2 - 2.2, ave.width / 2 + 2.2];
        offsets.forEach((off) => {
          for (let b = -st.width / 2 + 0.8; b <= st.width / 2 - 0.8; b += 1.1) {
            const zebra = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.55), dashMat);
            zebra.position.set(ave.x + off, 0.036, st.z + b);
            gridGroup.add(zebra);
          }
        });
      });
    });

    // Sidewalk Curbs: Generate raised sidewalk city blocks between avenues & streets
    for (let i = 0; i < avenues.length - 1; i++) {
      const a1 = avenues[i];
      const a2 = avenues[i + 1];
      const blkW = (a2.x - a1.x) - (a1.width / 2 + a2.width / 2) - 0.8;
      const blkX = (a1.x + a2.x) / 2;

      for (let j = 0; j < streets.length - 1; j++) {
        const s1 = streets[j];
        const s2 = streets[j + 1];
        const blkD = (s2.z - s1.z) - (s1.width / 2 + s2.width / 2) - 0.8;
        const blkZ = (s1.z + s2.z) / 2;

        if (blkW > 4 && blkD > 4) {
          const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(blkW, 0.16, blkD), this.defaultMats.black);
          sidewalk.position.set(blkX, 0.08, blkZ);
          gridGroup.add(sidewalk);

          // Flagstone grid seams
          for (let sx = -blkW / 2 + 4; sx < blkW / 2; sx += 4) {
            const seam = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.17, blkD), this.defaultMats.blue);
            seam.position.set(blkX + sx, 0.085, blkZ);
            gridGroup.add(seam);
          }
          for (let sz = -blkD / 2 + 4; sz < blkD / 2; sz += 4) {
            const seam = new THREE.Mesh(new THREE.BoxGeometry(blkW, 0.17, 0.08), this.defaultMats.blue);
            seam.position.set(blkX, 0.085, blkZ + sz);
            gridGroup.add(seam);
          }

          // Cellar doors & steel grates on select blocks
          if ((i + j) % 2 === 0) {
            const cellar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 1.4), curbMat);
            cellar.position.set(blkX + blkW / 2 - 2.5, 0.18, blkZ + blkD / 2 - 1.2);
            cellar.rotation.x = -0.15;
            gridGroup.add(cellar);

            const grate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 1.1), this.defaultMats.black);
            grate.position.set(blkX - blkW / 2 + 2.8, 0.165, blkZ + blkD / 2 - 1.2);
            gridGroup.add(grate);
          }
        }
      }
    }

    // NYC DOT Green Double Street Sign Posts at major corners
    const signIntersections = [
      { x: -16, z: -20, ave: "BROADWAY", st: "W 42ND ST" },
      { x: 40, z: -20, ave: "5TH AVE", st: "E 42ND ST" },
      { x: 96, z: -20, ave: "PARK AVE", st: "E 42ND ST" },
      { x: 40, z: 18, ave: "5TH AVE", st: "W 34TH ST" },
      { x: -16, z: 18, ave: "BROADWAY", st: "W 34TH ST" },
      { x: 12, z: 56, ave: "6TH AVE", st: "W 23RD ST" },
      { x: 40, z: 94, ave: "5TH AVE", st: "14TH ST" },
      { x: -16, z: 132, ave: "BROADWAY", st: "HOUSTON ST" },
      { x: 12, z: 170, ave: "6TH AVE", st: "CANAL ST" },
      { x: 40, z: 208, ave: "5TH AVE", st: "WALL ST" },
    ];

    signIntersections.forEach((si) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.2), this.defaultMats.black);
      pole.position.set(si.x + 5.5, 2.1, si.z + 5.0);

      // Blade 1: Avenue (facing X axis)
      const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 1.5), this.defaultMats.green);
      blade1.position.set(si.x + 5.5, 3.9, si.z + 5.0);

      // Blade 2: Street (facing Z axis)
      const blade2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.08), this.defaultMats.green);
      blade2.position.set(si.x + 5.5, 4.25, si.z + 5.0);

      gridGroup.add(pole, blade1, blade2);
    });

    // Classic Blue USPS Mail Collection Boxes at corners
    const mailboxes = [[-10.5, -15], [45.5, 23], [17.5, 61], [-10.5, 137], [17.5, 213]];
    mailboxes.forEach(([mbX, mbZ]) => {
      const mbox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.3, 0.85), this.defaultMats.blueFill);
      mbox.position.set(mbX, 0.75, mbZ);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.85, 8), this.defaultMats.blue);
      cap.rotation.z = Math.PI / 2;
      cap.position.set(mbX, 1.4, mbZ);
      gridGroup.add(mbox, cap);
    });

    this.engine.scene.add(gridGroup);
  }

  // 2. The Iconic Empire State Building (Art Deco setbacks, Mooring Mast, Spire & Red Flashing Beacon)
  public createEmpireStateBuilding(x: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Podium Base (Floor 1-6) with Grand 5th Ave Arched Entrance
    const baseH = 14;
    const base = new THREE.Mesh(new THREE.BoxGeometry(18, baseH, 18), this.defaultMats.blue);
    base.position.y = baseH / 2;
    group.add(base);

    // Grand Entrance Arch & Bronze Marquee Canopy
    const arch = new THREE.Mesh(new THREE.BoxGeometry(5.5, 7, 0.8), this.defaultMats.black);
    arch.position.set(0, 3.5, 9.1);
    const marquee = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.35, 2.4), this.defaultMats.orange);
    marquee.position.set(0, 4.2, 10.2);
    group.add(arch, marquee);

    // Facade Window Matrix on Base (Floors 2 to 5)
    for (let wy = 3.5; wy <= 11.5; wy += 2.6) {
      for (let wx = -6.5; wx <= 6.5; wx += 2.6) {
        if (Math.abs(wx) < 2 && wy < 6) continue; // Skip above entrance arch
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.2), (Math.sin(wx * 3 + wy) > 0.1) ? this.defaultMats.orange : this.defaultMats.black);
        win.position.set(wx, wy, 9.08);
        group.add(win);
      }
    }

    // Setback Tier 1 (Floor 7-18)
    const t1H = 12;
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(13.5, t1H, 13.5), this.defaultMats.blue);
    tier1.position.y = baseH + t1H / 2;
    group.add(tier1);

    // Setback 1 Terrace Details (Rooftop HVAC chillers & satellite dish)
    const hvac = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2.4), this.defaultMats.black);
    hvac.position.set(5.5, baseH + 0.9, 5.5);
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8, 0, Math.PI), this.defaultMats.blue);
    dish.position.set(-5.5, baseH + 1.2, 5.5);
    dish.rotation.x = -0.6;
    group.add(hvac, dish);

    // Setback Tier 2 (Floor 19-30)
    const t2H = 12;
    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(9.5, t2H, 9.5), this.defaultMats.blue);
    tier2.position.y = baseH + t1H + t2H / 2;
    group.add(tier2);

    // Vertical Art Deco Fluting Lines (Stainless steel limestone pilasters)
    for (let f = -4; f <= 4; f += 2) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.2, t2H, 0.3), this.defaultMats.black);
      line.position.set(f, baseH + t1H + t2H / 2, 4.8);
      group.add(line);
    }

    // Setback Tier 3: Observatory Tower (86th Floor Deck)
    const obsH = 7;
    const obsY = baseH + t1H + t2H;
    const tier3 = new THREE.Mesh(new THREE.BoxGeometry(6.5, obsH, 6.5), this.defaultMats.blue);
    tier3.position.y = obsY + obsH / 2;
    group.add(tier3);

    // Observation Deck Perimeter Railing
    const rail = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.8, 7.2), this.defaultMats.black);
    rail.position.y = obsY + 0.4;
    group.add(rail);

    // Mooring Mast (Dirigible / Zeppelin Docking Tower)
    const mastH = 7;
    const mastY = obsY + obsH;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, mastH, 12), this.defaultMats.blue);
    mast.position.y = mastY + mastH / 2;
    group.add(mast);

    // Needle Antenna Spire
    const spireH = 10;
    const spireY = mastY + mastH;
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, spireH, 8), this.defaultMats.black);
    spire.position.y = spireY + spireH / 2;
    group.add(spire);

    // Red Flashing Aircraft Warning Beacon Light
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), this.defaultMats.red);
    beacon.position.y = spireY + spireH;
    group.add(beacon);

    // Rooftop Billboard (34th St Facing)
    const billboard = this.createAdBillboardMesh(this.initialAdConfigs[1], 10.5, 5.0, group);
    billboard.position.set(0, baseH + 3.0, 9.2);
    group.add(billboard);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 3. The Chrysler Building (Art Deco terraced sunburst arches & needle spire)
  public createChryslerBuilding(x: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Base podium with Art Deco grand entrance
    const baseH = 15;
    const base = new THREE.Mesh(new THREE.BoxGeometry(16, baseH, 16), this.defaultMats.blue);
    base.position.y = baseH / 2;
    group.add(base);

    // Triangular Grand Lobby Entrance on 42nd St
    const entryPortal = new THREE.Mesh(new THREE.BoxGeometry(5.2, 6.5, 0.8), this.defaultMats.black);
    entryPortal.position.set(0, 3.25, 8.1);
    const entryTransom = new THREE.Mesh(new THREE.ConeGeometry(2.6, 2.2, 3), this.defaultMats.orange);
    entryTransom.position.set(0, 7.2, 8.1);
    entryTransom.rotation.z = Math.PI;
    group.add(entryPortal, entryTransom);

    // Tower Shaft with Vertical Window Stripes
    const shaftH = 16;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(11, shaftH, 11), this.defaultMats.blue);
    shaft.position.y = baseH + shaftH / 2;
    group.add(shaft);

    for (let wy = baseH + 2; wy < baseH + shaftH - 2; wy += 3.2) {
      for (let wx = -4.2; wx <= 4.2; wx += 2.8) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 0.2), this.defaultMats.black);
        win.position.set(wx, wy, 5.58);
        group.add(win);
      }
    }

    // Corner Gargoyle Projections (Chrysler radiator cap eagles)
    const cornY = baseH + shaftH;
    const gOffsets = [[-5.8, -5.8], [5.8, -5.8], [-5.8, 5.8], [5.8, 5.8]];
    gOffsets.forEach(([gx, gz]) => {
      const eagle = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.6, 4), this.defaultMats.black);
      eagle.position.set(gx, cornY + 0.5, gz);
      eagle.rotation.x = Math.PI / 3;
      group.add(eagle);
    });

    // 4-Tier Sunburst Crown Vaults
    let currY = cornY;
    const crownRadii = [4.8, 3.8, 2.8, 1.8];
    crownRadii.forEach((r) => {
      const vault = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.75, r, 2.4, 8), this.defaultMats.blue);
      vault.position.y = currY + 1.2;
      group.add(vault);

      // Triangular sunburst dormer window incisions
      const windowBand = new THREE.Mesh(new THREE.BoxGeometry(r * 1.6, 0.8, r * 1.6), this.defaultMats.orange);
      windowBand.position.y = currY + 1.2;
      group.add(windowBand);

      currY += 2.4;
    });

    // Needle Spire
    const spireH = 12;
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.35, spireH, 6), this.defaultMats.cyan);
    spire.position.y = currY + spireH / 2;
    group.add(spire);

    // Rooftop Ad Billboard
    const billboard = this.createAdBillboardMesh(this.initialAdConfigs[2], 9.8, 4.8, group);
    billboard.position.set(0, baseH + 3.2, 8.2);
    group.add(billboard);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 4. The Flatiron Building (Triangular wedge at Broadway & 5th Ave)
  public createFlatironBuilding(x: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Acute Triangular Wedge Extrusion
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);       // Prow tip (front corner)
    shape.lineTo(-4.5, -16);  // Back-left
    shape.lineTo(4.5, -16);   // Back-right
    shape.closePath();

    const extrudeSettings = {
      depth: 22,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.3,
      bevelThickness: 0.3,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.rotateX(Math.PI / 2); // Orient vertically

    const wedgeMesh = new THREE.Mesh(geom, this.defaultMats.blue);
    wedgeMesh.position.y = 0;
    group.add(wedgeMesh);

    // Neoclassical Cornice Overhangs every 4 floors
    for (let h = 5; h <= 21; h += 5.5) {
      const cMesh = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 16), this.defaultMats.black);
      cMesh.position.set(0, h, -8);
      group.add(cMesh);
    }

    // Rooftop Cedar Water Tower
    this.createWaterTower(group, 0, 22.5, -12);

    // Prow Billboard facing the intersection
    const billboard = this.createAdBillboardMesh(this.initialAdConfigs[3], 7.5, 4.2, group);
    billboard.position.set(0, 11, 0.6);
    group.add(billboard);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 5. Times Square Billboard Canyon: Stacked Electronic Ad Screens
  public createTimesSquareCanyon(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Tower 1: One Times Square (Curved multi-screen facade)
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(12, 28, 12), this.defaultMats.blue);
    t1.position.set(0, 14, 0);
    group.add(t1);
    // Running Ticker Tape Ribbon (Electronic News/Stock Ticker)
    const ticker = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.85, 12.4), this.defaultMats.orange);
    ticker.position.set(0, 7.5, 0);
    group.add(ticker);

    // Broadway Theater Marquee (The Majestic Theater)
    const marqueeGroup = new THREE.Group();
    marqueeGroup.position.set(0, 3.8, 6.4);
    const mRoof = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.6, 2.4), this.defaultMats.orange);
    const mSign = new THREE.Mesh(new THREE.BoxGeometry(8.4, 1.2, 0.2), this.defaultMats.black);
    mSign.position.set(0, 0.8, 1.15);
    // Marquee perimeter bulbs
    for (let bx = -4.0; bx <= 4.0; bx += 0.8) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), this.defaultMats.orange);
      bulb.position.set(bx, 0.8, 1.3);
      marqueeGroup.add(bulb);
    }
    marqueeGroup.add(mRoof, mSign);
    group.add(marqueeGroup);

    // Primary Times Square Mega-LED Billboard
    const b1 = this.createAdBillboardMesh(this.initialAdConfigs[0], 11.2, 6.2, group);
    b1.position.set(0, 21, 6.2);
    group.add(b1);

    // Mid-level Electronic Screen
    const b2 = this.createAdBillboardMesh(this.initialAdConfigs[4], 10.5, 5.0, group);
    b2.position.set(0, 12.5, 6.2);
    group.add(b2);

    // Rooftop Ball Drop Tower & Mast
    const ballMast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7), this.defaultMats.black);
    ballMast.position.set(0, 31.5, 4.5);
    group.add(ballMast);

    const timeBall = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), this.defaultMats.orange);
    timeBall.position.set(0, 34, 4.5);
    group.add(timeBall);

    // Times Square Pedestrian Bleachers (The Red Steps)
    for (let step = 0; step < 8; step++) {
      const redStep = new THREE.Mesh(new THREE.BoxGeometry(8 - step * 0.7, 0.4, 0.8), this.defaultMats.red);
      redStep.position.set(0, step * 0.4 + 0.2, 10 + step * 0.8);
      group.add(redStep);
    }

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // Corner Bodega Deli & 99¢ Pizza Shop with Sidewalk Crates & Cafe Seating
  public createCornerBodegaAndPizza(x: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // 2-Story Brick Corner Building
    const body = new THREE.Mesh(new THREE.BoxGeometry(8.5, 8.5, 10), this.defaultMats.blue);
    body.position.set(0, 4.25, 0);
    group.add(body);

    // Bodega Striped Awning ("24H NYC DELI & BAGELS")
    const awning = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.2, 2.2), this.defaultMats.green);
    awning.position.set(0, 3.4, 5.2);
    awning.rotation.x = 0.28;
    group.add(awning);

    // Corner Neon Sign ("NY PIZZA 🍕 99¢ SLICE")
    const pizzaSign = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 0.15), this.defaultMats.red);
    pizzaSign.position.set(4.35, 4.5, 3.5);
    pizzaSign.rotation.y = Math.PI / 2;
    const pizzaSlice = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.0, 3), this.defaultMats.orange);
    pizzaSlice.position.set(4.45, 4.5, 3.5);
    pizzaSlice.rotation.z = -Math.PI / 2;
    group.add(pizzaSign, pizzaSlice);

    // Sidewalk Produce & Flower Crates
    const crateMat = this.defaultMats.orange;
    const crate1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.8), crateMat);
    crate1.position.set(-2.2, 0.3, 5.8);
    const crate2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.8), crateMat);
    crate2.position.set(0.2, 0.3, 5.8);
    group.add(crate1, crate2);

    // Fruit dots (apples and oranges)
    for (let f = -0.6; f <= 0.6; f += 0.3) {
      const apple = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), this.defaultMats.red);
      apple.position.set(-2.2 + f, 0.7, 5.8);
      const orange = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), this.defaultMats.orange);
      orange.position.set(0.2 + f, 0.7, 5.8);
      group.add(apple, orange);
    }

    // Sidewalk Bistro Table & Stools
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.08, 8), this.defaultMats.black);
    table.position.set(3.2, 0.75, 6.2);
    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.75), this.defaultMats.black);
    tableLeg.position.set(3.2, 0.38, 6.2);
    const stool1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.45, 8), this.defaultMats.red);
    stool1.position.set(2.4, 0.22, 6.2);
    const stool2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.45, 8), this.defaultMats.red);
    stool2.position.set(4.0, 0.22, 6.2);
    group.add(table, tableLeg, stool1, stool2);

    // Rooftop AC Compressor
    const ac = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1.4), this.defaultMats.black);
    ac.position.set(-1.8, 9.1, -1.5);
    group.add(ac);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 6. Classic NYC Brownstone Walk-Up Row with Stoops & Zigzag Fire Escapes
  public createBrownstoneRow(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // 3 Connected 4-story Brick Brownstones
    const brownstoneW = 8.5;
    for (let i = 0; i < 3; i++) {
      const bx = (i - 1) * brownstoneW;

      // Brownstone Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(brownstoneW - 0.4, 14, 11), this.defaultMats.blue);
      body.position.set(bx, 7, 0);
      group.add(body);

      // High Front Stoop (Stone staircase to parlor floor)
      const stoopSteps = 6;
      for (let s = 0; s < stoopSteps; s++) {
        const tread = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 0.55), this.defaultMats.black);
        tread.position.set(bx + 2.2, s * 0.35 + 0.18, 5.8 + (stoopSteps - s) * 0.55);
        group.add(tread);
      }

      // Stoop Handrail
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 3.6), this.defaultMats.black);
      rail.position.set(bx + 3.4, 1.8, 7.5);
      rail.rotation.x = 0.45;
      group.add(rail);

      // Roof Cornice Overhang
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(brownstoneW, 0.8, 12), this.defaultMats.black);
      cornice.position.set(bx, 14.4, 0);
      group.add(cornice);

      // Zigzag Fire Escape System (Floors 2, 3, 4)
      this.createFireEscape(group, bx - 1.8, 0, 5.7, 3.6, 3);

      // Rooftop Cedar Water Tower on end brownstone
      if (i === 0) {
        this.createWaterTower(group, bx, 15, -2);
      }
    }

    // Street Wall Banner Ad
    const banner = this.createAdBillboardMesh(this.initialAdConfigs[6], 7.8, 3.8, group);
    banner.position.set(0, 11.2, 5.7);
    group.add(banner);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // Helper: Authentic NYC Rooftop Cedar Water Tower on 4-Legged Trestle
  private createWaterTower(parentGroup: THREE.Group, x: number, y: number, z: number) {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(x, y, z);

    // 4 Diagonal Structural Trestle Legs
    const legOffsets = [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]];
    legOffsets.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.2), this.defaultMats.black);
      leg.position.set(lx, 1.6, lz);
      towerGroup.add(leg);
    });

    // Cross-bracing rods
    const brace1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.08), this.defaultMats.black);
    brace1.position.set(0, 1.6, 1.2);
    towerGroup.add(brace1);

    // Cedar Wooden Barrel Tank
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 3.2, 12), this.defaultMats.orange);
    tank.position.set(0, 4.8, 0);
    towerGroup.add(tank);

    // Black Iron Compression Hoop Rings
    for (let r = 3.6; r <= 6.0; r += 0.8) {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.84, 0.05, 4, 16), this.defaultMats.black);
      hoop.rotateX(Math.PI / 2);
      hoop.position.set(0, r, 0);
      towerGroup.add(hoop);
    }

    // Conical Wood-Shingle Roof Cap
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.4, 12), this.defaultMats.orange);
    roof.position.set(0, 7.1, 0);
    towerGroup.add(roof);

    parentGroup.add(towerGroup);
  }

  // Helper: Full Exterior Zigzag Fire Escape (Platforms, handrails & angled ladders)
  private createFireEscape(parentGroup: THREE.Group, x: number, y: number, z: number, width: number, floors: number) {
    const feGroup = new THREE.Group();
    feGroup.position.set(x, y, z);

    const floorH = 3.4;
    for (let f = 1; f <= floors; f++) {
      const platformY = f * floorH;

      // Grated Balcony Platform
      const platform = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, 1.4), this.defaultMats.black);
      platform.position.set(0, platformY, 0.7);
      feGroup.add(platform);

      // Safety Guardrails
      const railFront = new THREE.Mesh(new THREE.BoxGeometry(width, 0.8, 0.08), this.defaultMats.black);
      railFront.position.set(0, platformY + 0.4, 1.36);
      feGroup.add(railFront);

      const railSideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 1.4), this.defaultMats.black);
      railSideL.position.set(-width / 2, platformY + 0.4, 0.7);
      const railSideR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 1.4), this.defaultMats.black);
      railSideR.position.set(width / 2, platformY + 0.4, 0.7);
      feGroup.add(railSideL, railSideR);

      // Angled Escape Ladder connecting to lower floor
      if (f > 1) {
        const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 0.1), this.defaultMats.black);
        ladder.position.set((f % 2 === 0 ? 0.8 : -0.8), platformY - floorH / 2, 0.7);
        ladder.rotation.z = (f % 2 === 0 ? 0.38 : -0.38);
        feGroup.add(ladder);
      }
    }

    // Top Roof Gooseneck Ladder
    const roofLadder = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.6), this.defaultMats.black);
    roofLadder.position.set(-width / 3, floors * floorH + 1.8, 0.7);
    feGroup.add(roofLadder);

    parentGroup.add(feGroup);
  }

  // 7. The High Line Elevated Train Line & Subway Car (West Side Viaduct)
  public createHighLineElevatedTrain(x: number = -88, z: number = 56) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = Math.PI / 2; // Aligned along North-South Avenue on Manhattan West Side

    const trestleH = 8.5;
    const length = 220;

    // Heavy Riveted Steel Support Bents every 14m
    for (let px = -98; px <= 98; px += 14) {
      const colL = new THREE.Mesh(new THREE.BoxGeometry(0.6, trestleH, 0.6), this.defaultMats.black);
      colL.position.set(px, trestleH / 2, -3.2);
      const colR = new THREE.Mesh(new THREE.BoxGeometry(0.6, trestleH, 0.6), this.defaultMats.black);
      colR.position.set(px, trestleH / 2, 3.2);

      const crossGirder = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 7.4), this.defaultMats.black);
      crossGirder.position.set(px, trestleH - 0.4, 0);

      group.add(colL, colR, crossGirder);
    }

    // Elevated Track Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(length, 0.5, 6.8), this.defaultMats.black);
    deck.position.set(0, trestleH + 0.25, 0);
    group.add(deck);

    // Track Ties (Wood cross-beams)
    for (let tx = -100; tx <= 100; tx += 1.8) {
      const tie = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 4.8), this.defaultMats.black);
      tie.position.set(tx, trestleH + 0.58, 0);
      group.add(tie);
    }

    // Dual Steel Rails
    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(length, 0.2, 0.1), this.defaultMats.blue);
    rail1.position.set(0, trestleH + 0.72, -1.2);
    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(length, 0.2, 0.1), this.defaultMats.blue);
    rail2.position.set(0, trestleH + 0.72, 1.2);
    group.add(rail1, rail2);

    // Authentic Silver/Doodle NYC Subway Car (MTA R211 Style)
    const car = new THREE.Group();
    car.position.set(this.trainProgress, trestleH + 2.5, 0);

    const carBody = new THREE.Mesh(new THREE.BoxGeometry(16, 3.2, 3.2), this.defaultMats.blue);
    car.add(carBody);

    // Roof Curves
    const carRoof = new THREE.Mesh(new THREE.BoxGeometry(16.1, 0.5, 2.9), this.defaultMats.black);
    carRoof.position.y = 1.7;
    car.add(carRoof);

    // Subway Windows & Dual Sliding Doors
    for (let w = -6; w <= 6; w += 3) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 3.26), this.defaultMats.black);
      win.position.set(w, 0.2, 0);
      car.add(win);
    }

    // Blue MTA Wave Stripe
    const mtaStripe = new THREE.Mesh(new THREE.BoxGeometry(16.05, 0.25, 3.22), this.defaultMats.blueFill);
    mtaStripe.position.set(0, -0.6, 0);
    car.add(mtaStripe);

    group.add(car);
    this.subwayTrain = car;

    // Overpass Highway Ad Billboard (Facing toward East / Manhattan Center)
    const bb = this.createAdBillboardMesh(this.initialAdConfigs[5], 11.5, 4.8, group);
    bb.position.set(0, trestleH + 5.2, 3.6);
    group.add(bb);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 8. Central Park: Expansive Real Scale Green Oasis, Lakes, Bridges & Tree Groves
  public createCentralPark(x: number, z: number) {
    const parkGroup = new THREE.Group();
    parkGroup.position.set(x, 0, z);

    // Stone Perimeter Walls (Bordering 59th St, 8th Ave, 5th Ave)
    const wallMat = this.defaultMats.black;
    const wallS = new THREE.Mesh(new THREE.BoxGeometry(86, 0.9, 0.5), wallMat);
    wallS.position.set(0, 0.45, 55); // Along 59th St
    const wallN = new THREE.Mesh(new THREE.BoxGeometry(86, 0.9, 0.5), wallMat);
    wallN.position.set(0, 0.45, -55);
    const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 110), wallMat);
    wallW.position.set(-43, 0.45, 0); // Along Central Park West
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 110), wallMat);
    wallE.position.set(43, 0.45, 0); // Along 5th Ave
    parkGroup.add(wallS, wallN, wallW, wallE);

    // Meandering Paved Walking Paths
    const path1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.05, 100), this.defaultMats.black);
    path1.position.set(-10, 0.03, 0);
    path1.rotation.y = 0.12;
    const path2 = new THREE.Mesh(new THREE.BoxGeometry(70, 0.05, 3.8), this.defaultMats.black);
    path2.position.set(0, 0.03, 8);
    path2.rotation.y = -0.15;
    parkGroup.add(path1, path2);

    // Central Park Main Scenic Lake (The Lake & Conservatory Water)
    const lakeGeo = new THREE.CylinderGeometry(18, 18, 0.1, 24);
    const lake = new THREE.Mesh(lakeGeo, this.defaultMats.blueFill);
    lake.position.set(12, 0.05, -12);
    parkGroup.add(lake);

    // Second Scenic Pond (The Pond near Gapstow)
    const pondGeo = new THREE.CylinderGeometry(11, 11, 0.1, 18);
    const pond = new THREE.Mesh(pondGeo, this.defaultMats.blueFill);
    pond.position.set(-16, 0.05, 26);
    parkGroup.add(pond);

    // Lily Pads & Floating Wooden Sailboats
    for (let lp = 0; lp < 8; lp++) {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.04, 6), this.defaultMats.green);
      pad.position.set(12 + Math.cos(lp * 0.9) * 10, 0.12, -12 + Math.sin(lp * 0.9) * 10);
      parkGroup.add(pad);
    }
    const boatHull = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 0.8), this.defaultMats.orange);
    boatHull.position.set(12, 0.18, -12);
    const boatSail = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.6, 3), this.defaultMats.black);
    boatSail.position.set(12, 1.05, -12);
    boatSail.rotation.y = 0.4;
    parkGroup.add(boatHull, boatSail);

    // Gapstow Arched Stone Footbridge over The Pond
    const bridge1 = new THREE.Group();
    bridge1.position.set(-16, 0, 18);
    const bridgeArch = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.4, 3.2), this.defaultMats.black);
    bridgeArch.position.set(0, 1.2, 0);
    const rampL = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 3.2), this.defaultMats.black);
    rampL.position.set(-4.2, 0.6, 0);
    rampL.rotation.z = -0.32;
    const rampR = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 3.2), this.defaultMats.black);
    rampR.position.set(4.2, 0.6, 0);
    rampR.rotation.z = 0.32;
    const parapetL = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.7, 0.25), this.defaultMats.blue);
    parapetL.position.set(0, 1.45, 1.5);
    const parapetR = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.7, 0.25), this.defaultMats.blue);
    parapetR.position.set(0, 1.45, -1.5);
    bridge1.add(bridgeArch, rampL, rampR, parapetL, parapetR);
    parkGroup.add(bridge1);

    // Bow Bridge over The Lake
    const bridge2 = new THREE.Group();
    bridge2.position.set(12, 0, 2);
    bridge2.rotation.y = Math.PI / 2;
    const b2Arch = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.4, 3.2), this.defaultMats.black);
    b2Arch.position.set(0, 1.2, 0);
    bridge2.add(b2Arch);
    parkGroup.add(bridge2);

    // Park Benches (Wood slats with black iron armrests)
    const benchCoords = [
      [-8, 12, 0], [6, 16, Math.PI], [-24, 8, -Math.PI / 2],
      [26, -18, Math.PI / 2], [-4, -28, 0], [18, -32, Math.PI]
    ];
    benchCoords.forEach(([bx, bz, brot]) => {
      const bench = new THREE.Group();
      bench.position.set(bx, 0, bz);
      bench.rotation.y = brot;

      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.6), this.defaultMats.orange);
      seat.position.set(0, 0.6, 0);
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.1), this.defaultMats.orange);
      back.position.set(0, 1.0, -0.28);
      const legs = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 0.5), this.defaultMats.black);
      legs.position.set(0, 0.3, 0);

      bench.add(seat, back, legs);
      parkGroup.add(bench);
    });

    // Central Park Hand-Drawn Trees (20+ Trees across the park grounds)
    const parkTrees: [number, number, boolean][] = [
      [-30, -35, false], [-18, -40, true], [-6, -38, false], [8, -38, false], [24, -40, false], [34, -32, true],
      [-32, -18, true], [-6, -20, false], [28, -8, false], [32, 6, true],
      [-34, 10, false], [-6, 2, false], [24, 20, false], [32, 28, false],
      [-30, 36, false], [-4, 32, true], [10, 34, false], [26, 42, true],
      [-20, 44, false], [0, 46, false]
    ];
    parkTrees.forEach(([tx, tz, isCyan]) => {
      const tree = this.createDoodleTree(tx, tz, Boolean(isCyan));
      parkGroup.add(tree);
    });

    this.engine.scene.add(parkGroup);
    parkGroup.userData.noCollision = true;
    this.buildings.push(parkGroup);
    return parkGroup;
  }

  // 9. One World Trade Center (Freedom Tower) & Financial District
  public createOneWorldTradeCenter(x: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // One World Trade Center (100m soaring tower)
    const wtcGroup = new THREE.Group();
    wtcGroup.position.set(0, 0, 0);

    // Base Podium (Square, height 20m)
    const basePodium = new THREE.Mesh(new THREE.BoxGeometry(16, 20, 16), this.defaultMats.blue);
    basePodium.position.y = 10;
    wtcGroup.add(basePodium);

    // Blast-resistant fins on base
    for (let f = -7; f <= 7; f += 1.4) {
      const finF = new THREE.Mesh(new THREE.BoxGeometry(0.12, 19.6, 0.4), this.defaultMats.black);
      finF.position.set(f, 10, 8.1);
      const finB = new THREE.Mesh(new THREE.BoxGeometry(0.12, 19.6, 0.4), this.defaultMats.black);
      finB.position.set(f, 10, -8.1);
      wtcGroup.add(finF, finB);
    }

    // Chamfered Octagonal Main Tower (Floors 20 to 102, height 56m)
    for (let h = 0; h < 6; h++) {
      const tierH = 9.5;
      const tY = 20 + h * tierH + tierH / 2;
      const scale = 1.0 - h * 0.055;
      const tier = new THREE.Mesh(new THREE.BoxGeometry(15 * scale, tierH, 15 * scale), this.defaultMats.blue);
      tier.position.y = tY;
      tier.rotation.y = (h * Math.PI) / 24;
      wtcGroup.add(tier);

      const edgeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, tierH, 0.2), this.defaultMats.cyan);
      edgeL.position.set(-7.2 * scale, tY, -7.2 * scale);
      const edgeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, tierH, 0.2), this.defaultMats.cyan);
      edgeR.position.set(7.2 * scale, tY, 7.2 * scale);
      wtcGroup.add(edgeL, edgeR);
    }

    // Circular Observation Deck Ring
    const parapet = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 6.2, 3.2, 16), this.defaultMats.black);
    parapet.position.y = 78;
    wtcGroup.add(parapet);

    // Communications Spire Mast & Antenna (reaching 109m high)
    const spireMast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.8, 24, 8), this.defaultMats.blue);
    spireMast.position.y = 91.5;
    const spireTip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.2, 10, 6), this.defaultMats.black);
    spireTip.position.y = 104;
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), this.defaultMats.red);
    beacon.position.y = 109.5;
    wtcGroup.add(spireMast, spireTip, beacon);

    group.add(wtcGroup);

    // Wall Street Stone Tower (Art Deco 40 Wall St)
    const wallStTower = new THREE.Group();
    wallStTower.position.set(24, 0, -12);
    const wstBase = new THREE.Mesh(new THREE.BoxGeometry(14, 38, 14), this.defaultMats.blue);
    wstBase.position.y = 19;
    const wstMid = new THREE.Mesh(new THREE.BoxGeometry(10, 18, 10), this.defaultMats.blue);
    wstMid.position.y = 47;
    const wstSpire = new THREE.Mesh(new THREE.ConeGeometry(4.2, 14, 4), this.defaultMats.green);
    wstSpire.position.y = 63;
    wstSpire.rotation.y = Math.PI / 4;
    wallStTower.add(wstBase, wstMid, wstSpire);
    group.add(wallStTower);

    // New York Stock Exchange Neoclassical Facade
    const nyse = new THREE.Group();
    nyse.position.set(-22, 0, 10);
    const nyseBody = new THREE.Mesh(new THREE.BoxGeometry(15, 16, 10), this.defaultMats.blue);
    nyseBody.position.y = 8;
    for (let cx = -5; cx <= 5; cx += 2) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 11, 8), this.defaultMats.black);
      col.position.set(cx, 6.5, 5.2);
      nyse.add(col);
    }
    const nysePediment = new THREE.Mesh(new THREE.ConeGeometry(5.8, 3.2, 4), this.defaultMats.blue);
    nysePediment.position.set(0, 13.5, 5.2);
    nysePediment.rotation.y = Math.PI / 4;
    nyse.add(nyseBody, nysePediment);
    group.add(nyse);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // Parked Classic NYPD Police Cruiser with Push Bumper & Red/Blue Beacon
  private createNYPDPoliceCruiser(x: number, z: number) {
    const cruiser = new THREE.Group();
    cruiser.position.set(x, 0, z);

    // White body with navy blue side stripe
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.75, 4.2), this.defaultMats.blue);
    body.position.y = 0.55;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.25, 4.2), this.defaultMats.blueFill);
    stripe.position.y = 0.55;

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 2.2), this.defaultMats.blue);
    cabin.position.set(0, 1.1, -0.2);

    // Front Push Bumper / Bull Bar
    const pushBumper = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.3), this.defaultMats.black);
    pushBumper.position.set(0, 0.45, 2.25);

    // Rooftop Red and Blue Emergency Light Bar
    const lightBar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.3), this.defaultMats.black);
    lightBar.position.set(0, 1.48, -0.2);
    const redLight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.32), this.defaultMats.red);
    redLight.position.set(-0.35, 1.52, -0.2);
    const blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.32), this.defaultMats.blueFill);
    blueLight.position.set(0.35, 1.52, -0.2);

    cruiser.add(body, stripe, cabin, pushBumper, lightBar, redLight, blueLight);

    // 4 Wheels
    [[-0.98, 1.2], [0.98, 1.2], [-0.98, -1.2], [0.98, -1.2]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 10), this.defaultMats.black);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.35, wz);
      cruiser.add(wheel);
    });

    this.engine.scene.add(cruiser);
    this.buildings.push(cruiser);
  }

  // Animated Hand-Drawn Doodle Pedestrians Walking the Sidewalks
  private createNYCPedestrians() {
    const pedestrianSpawns = [
      { x: -12, z: -25, axis: "z" as const, min: -50, max: 10, speed: 2.2, dir: 1, coat: this.defaultMats.orange },
      { x: -12, z: 22, axis: "z" as const, min: 14, max: 85, speed: 1.8, dir: -1, coat: this.defaultMats.blue },
      { x: 44, z: -10, axis: "z" as const, min: -40, max: 12, speed: 2.5, dir: -1, coat: this.defaultMats.red },
      { x: 44, z: 24, axis: "z" as const, min: 14, max: 60, speed: 2.0, dir: 1, coat: this.defaultMats.green },
      { x: 16, z: 62, axis: "z" as const, min: 54, max: 95, speed: 1.9, dir: 1, coat: this.defaultMats.orange },
      { x: -40, z: 60, axis: "z" as const, min: 52, max: 110, speed: 2.1, dir: -1, coat: this.defaultMats.blue },
      { x: 16, z: 175, axis: "z" as const, min: 168, max: 215, speed: 2.2, dir: 1, coat: this.defaultMats.orange },
      { x: 44, z: 212, axis: "z" as const, min: 180, max: 216, speed: 1.8, dir: -1, coat: this.defaultMats.red },
      { x: -10, z: -16, axis: "x" as const, min: -40, max: 35, speed: 2.0, dir: 1, coat: this.defaultMats.blue },
      { x: 20, z: 22, axis: "x" as const, min: -35, max: 65, speed: 2.2, dir: -1, coat: this.defaultMats.orange },
      { x: -10, z: 60, axis: "x" as const, min: -40, max: 35, speed: 1.7, dir: 1, coat: this.defaultMats.red },
      { x: 10, z: 98, axis: "x" as const, min: -35, max: 65, speed: 2.1, dir: 1, coat: this.defaultMats.green },
      { x: 0, z: 212, axis: "x" as const, min: -40, max: 60, speed: 1.9, dir: -1, coat: this.defaultMats.cyan },
    ];

    pedestrianSpawns.forEach((ps) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(ps.x, 0.16, ps.z);
      if (ps.axis === "x") {
        pGroup.rotation.y = ps.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        pGroup.rotation.y = ps.dir > 0 ? 0 : Math.PI;
      }

      // Torso / Jacket
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.65, 0.28), ps.coat);
      torso.position.y = 0.95;

      // Head with Beanie / Cap
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), this.defaultMats.orange);
      head.position.y = 1.42;
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.14, 8), this.defaultMats.black);
      hat.position.y = 1.54;

      // Two Swinging Legs
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.12), this.defaultMats.black);
      legL.position.set(-0.12, 0.35, 0);
      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.12), this.defaultMats.black);
      legR.position.set(0.12, 0.35, 0);

      // Accessory: Coffee cup or Briefcase
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.16, 6), this.defaultMats.red);
      cup.position.set(0.26, 0.95, 0.15);

      pGroup.add(torso, head, hat, legL, legR, cup);
      this.engine.scene.add(pGroup);

      this.pedestrians.push({
        group: pGroup,
        axis: ps.axis,
        dir: ps.dir,
        min: ps.min,
        max: ps.max,
        speed: ps.speed,
        legs: [legL, legR],
      });
    });
  }

  // 9. Subway Entrances (Iconic green globe lampposts & descending stairs)
  private createSubwayEntrances() {
    const subGroup = new THREE.Group();

    const entrances = [
      { x: -20, z: -23, rot: 0 },         // Times Square / 42nd St
      { x: 36, z: 15, rot: Math.PI },      // Herald Square / 34th St
      { x: 8, z: 53, rot: -Math.PI / 2 },  // Flatiron / 23rd St
      { x: 8, z: 204, rot: 0 },            // Wall Street / Financial District
      { x: 92, z: -23, rot: Math.PI },     // Grand Central / Lexington
    ];

    entrances.forEach((ent) => {
      const stGroup = new THREE.Group();
      stGroup.position.set(ent.x, 0, ent.z);
      stGroup.rotation.y = ent.rot;

      // Descending stairs stairwell well
      const well = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 3.8), this.defaultMats.black);
      well.position.set(0, 0.05, 0);
      stGroup.add(well);

      // Wrought-iron green perimeter railing
      const railL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 3.8), this.defaultMats.green);
      railL.position.set(-1.2, 0.5, 0);
      const railR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 3.8), this.defaultMats.green);
      railR.position.set(1.2, 0.5, 0);
      const railB = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 0.1), this.defaultMats.green);
      railB.position.set(0, 0.5, -1.9);

      stGroup.add(railL, railR, railB);

      // Two Iconic NYC Green Globe Entrance Lamps
      [-1.2, 1.2].forEach((lx) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4), this.defaultMats.black);
        post.position.set(lx, 1.2, 1.8);
        const globe = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), this.defaultMats.green);
        globe.position.set(lx, 2.5, 1.8);
        stGroup.add(post, globe);
      });

      subGroup.add(stGroup);
    });

    // Street Kiosks at subway corners with attached ad spaces
    const kiosk1 = this.createStreetKiosk(44, 18, 7);
    const kiosk2 = this.createStreetKiosk(-12, -24, 8);
    subGroup.add(kiosk1, kiosk2);

    this.engine.scene.add(subGroup);
  }

  // 10. NYC Yellow Cabs with Medallion Roof Signs & Delivery Trucks (Across 7 Avenues & 9 Streets)
  private createNYCYellowCabs() {
    const lanes = [
      // Avenues (North-South, Z axis)
      { axis: "z" as const, fixedX: -70, dir: 1, min: -95, max: 215, speed: 14, isTaxi: true },
      { axis: "z" as const, fixedX: -42, dir: -1, min: -95, max: 215, speed: 16, isTaxi: true },
      { axis: "z" as const, fixedX: -18, dir: 1, min: -95, max: 215, speed: 13, isTaxi: true },
      { axis: "z" as const, fixedX: -14, dir: -1, min: -95, max: 215, speed: 15, isTaxi: false }, // Delivery truck
      { axis: "z" as const, fixedX: 10, dir: 1, min: -95, max: 215, speed: 12, isTaxi: true },
      { axis: "z" as const, fixedX: 38, dir: -1, min: -95, max: 215, speed: 15, isTaxi: true },
      { axis: "z" as const, fixedX: 66, dir: 1, min: -95, max: 215, speed: 14, isTaxi: true },
      { axis: "z" as const, fixedX: 94, dir: -1, min: -95, max: 215, speed: 16, isTaxi: false }, // Delivery truck
      // Cross Streets (East-West, X axis)
      { axis: "x" as const, fixedZ: -90, dir: 1, min: -75, max: 98, speed: 12, isTaxi: true },
      { axis: "x" as const, fixedZ: -56, dir: -1, min: -75, max: 98, speed: 13, isTaxi: true },
      { axis: "x" as const, fixedZ: -20, dir: 1, min: -75, max: 98, speed: 11, isTaxi: true },
      { axis: "x" as const, fixedZ: 18, dir: -1, min: -75, max: 98, speed: 14, isTaxi: true },
      { axis: "x" as const, fixedZ: 56, dir: 1, min: -75, max: 98, speed: 12, isTaxi: false }, // Delivery truck
      { axis: "x" as const, fixedZ: 94, dir: -1, min: -75, max: 98, speed: 13, isTaxi: true },
      { axis: "x" as const, fixedZ: 132, dir: 1, min: -75, max: 98, speed: 12, isTaxi: true },
      { axis: "x" as const, fixedZ: 170, dir: -1, min: -75, max: 98, speed: 14, isTaxi: true },
      { axis: "x" as const, fixedZ: 208, dir: 1, min: -75, max: 98, speed: 13, isTaxi: true },
    ];

    lanes.forEach((lane, idx) => {
      const carGroup = new THREE.Group();
      const wheels: THREE.Mesh[] = [];

      if (lane.isTaxi) {
        // Classic NYC Yellow Cab (Checker/Crown Victoria)
        const bodyMat = this.defaultMats.orange; // Yellow/Amber ink
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.75, 4.0), bodyMat);
        body.position.y = 0.55;
        carGroup.add(body);

        // Checkerboard side stripe
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.15, 3.8), this.defaultMats.black);
        stripe.position.y = 0.55;
        carGroup.add(stripe);

        // Cab Passenger Greenhouse / Windows
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 2.2), this.defaultMats.black);
        cabin.position.set(0, 1.25, -0.2);
        carGroup.add(cabin);

        // "NYC TAXI" Medallion Roof Light
        const roofLight = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 0.9), this.defaultMats.orange);
        roofLight.position.set(0, 1.72, -0.2);
        carGroup.add(roofLight);
      } else {
        // NYC Box Delivery Truck ("MANHATTAN DELI EXPRESS")
        const cab = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.6, 2.2), this.defaultMats.blue);
        cab.position.set(0, 1.1, 1.4);
        carGroup.add(cab);

        const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.4, 4.8), this.defaultMats.black);
        cargoBox.position.set(0, 1.5, -1.8);
        carGroup.add(cargoBox);
      }

      // 4 Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 8);
      wheelGeo.rotateZ(Math.PI / 2);
      const wPositions = [
        [-1.0, 0.36, 1.2],
        [1.0, 0.36, 1.2],
        [-1.0, 0.36, -1.2],
        [1.0, 0.36, -1.2],
      ];
      wPositions.forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, this.defaultMats.black);
        wheel.position.set(wx, wy, wz);
        carGroup.add(wheel);
        wheels.push(wheel);
      });

      // Position in lane
      if (lane.axis === "z") {
        const offset = ((idx * 37) % (lane.max - lane.min));
        carGroup.position.set(lane.fixedX, 0, lane.min + offset);
        if (lane.dir < 0) carGroup.rotation.y = Math.PI;
      } else {
        const offset = ((idx * 29) % (lane.max - lane.min));
        carGroup.position.set(lane.min + offset, 0, lane.fixedZ);
        carGroup.rotation.y = lane.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      }

      this.engine.scene.add(carGroup);
      this.trafficCars.push({
        group: carGroup,
        speed: lane.speed,
        axis: lane.axis,
        direction: lane.dir,
        min: lane.min,
        max: lane.max,
        wheels,
      });
    });
  }

  // 11. Street Furniture: Newsstands, Fire Hydrants, Gooseneck Streetlamps, Steaming Manholes
  private createStreetFurniture() {
    const furnGroup = new THREE.Group();

    // Classic NYC Green Newsstand Kiosks
    const newsstand = new THREE.Group();
    newsstand.position.set(-11, 0, -5);

    const shed = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.8, 2.2), this.defaultMats.green);
    shed.position.y = 1.4;
    const awning = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 1.2), this.defaultMats.orange);
    awning.position.set(0, 2.5, 1.2);
    awning.rotation.x = 0.25;

    // Newspaper rack stacks
    const racks = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.8, 0.6), this.defaultMats.black);
    racks.position.set(0, 0.5, 1.0);

    newsstand.add(shed, awning, racks);
    furnGroup.add(newsstand);

    // Cast-iron Red Fire Hydrants on street corners
    const hydrants = [
      [-11, -21], [45, 17], [17, 55], [-11, 131], [17, 207], [73, 17], [-67, 55]
    ];
    hydrants.forEach(([hx, hz]) => {
      const hyd = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.9), this.defaultMats.red);
      hyd.position.set(hx, 0.45, hz);
      furnGroup.add(hyd);
    });

    // Gooseneck Streetlamps along sidewalks
    const lamps = [
      [-11, -70], [-11, -30], [-11, 10], [-11, 50], [-11, 90], [-11, 130], [-11, 170], [-11, 205],
      [45, -70], [45, -30], [45, 10], [45, 50], [45, 90], [45, 130], [45, 170], [45, 205],
    ];
    lamps.forEach(([lx, lz]) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.8), this.defaultMats.black);
      pole.position.set(lx, 2.9, lz);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.12), this.defaultMats.black);
      arm.position.set(lx + (lx < 0 ? 0.5 : -0.5), 5.7, lz);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.4, 6), this.defaultMats.orange);
      shade.position.set(lx + (lx < 0 ? 1.0 : -1.0), 5.5, lz);
      shade.rotation.x = Math.PI;

      furnGroup.add(pole, arm, shade);
    });

    // Steaming Manhole Covers (Iconic NYC orange-and-white steam pipe / sewer grates)
    const manholes = [
      [-16, -10], [40, 2], [12, 130], [12, 170], [40, 204]
    ];
    manholes.forEach(([mx, mz], idx) => {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.05, 12), this.defaultMats.black);
      plate.position.set(mx, 0.03, mz);
      furnGroup.add(plate);

      // Striped orange steam pipe cone
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 2.2), this.defaultMats.orange);
      pipe.position.set(mx, 1.1, mz);
      furnGroup.add(pipe);

      // Steam puff sphere
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.45, 6, 6), this.defaultMats.blue);
      puff.position.set(mx, 2.4, mz);
      furnGroup.add(puff);

      this.steamPuffs.push({
        mesh: puff,
        basePos: new THREE.Vector3(mx, 2.2, mz),
        timeOffset: idx * 1.5,
      });
    });

    this.engine.scene.add(furnGroup);
  }

  // 12. Atmosphere: Drifting Clouds & Gliding Paper Airplane
  private createAtmosphere() {
    const cloudGroup = new THREE.Group();

    const cloudConfigs = [
      { x: -110, y: 72, z: -80, scale: 2.0 },
      { x: 75, y: 76, z: -120, scale: 2.2 },
      { x: -45, y: 68, z: 95, scale: 1.8 },
      { x: 120, y: 70, z: 60, scale: 2.1 },
      { x: -80, y: 74, z: 180, scale: 1.9 },
    ];

    cloudConfigs.forEach((cfg) => {
      const singleCloud = new THREE.Group();
      singleCloud.position.set(cfg.x, cfg.y, cfg.z);

      const p1 = new THREE.Mesh(new THREE.SphereGeometry(3.6 * cfg.scale, 8, 6), this.defaultMats.blue);
      const p2 = new THREE.Mesh(new THREE.SphereGeometry(2.8 * cfg.scale, 8, 6), this.defaultMats.blue);
      p2.position.set(3.2 * cfg.scale, -0.4, 0);
      const p3 = new THREE.Mesh(new THREE.SphereGeometry(2.5 * cfg.scale, 8, 6), this.defaultMats.blue);
      p3.position.set(-3.2 * cfg.scale, -0.5, 0);

      singleCloud.add(p1, p2, p3);
      cloudGroup.add(singleCloud);
      this.clouds.push(singleCloud);
    });

    this.engine.scene.add(cloudGroup);

    // Folded Doodle Paper Airplane
    const planeGroup = new THREE.Group();
    planeGroup.position.set(0, 52, 0);

    const wingShape = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, 2.6,
      -2.5, 0.4, -2.4,
      0, 0.2, -1.8,

      0, 0, 2.6,
      0, 0.2, -1.8,
      2.5, 0.4, -2.4,

      0, 0, 2.6,
      0, -0.8, -1.5,
      0, 0.2, -1.8,
    ]);
    wingShape.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    wingShape.computeVertexNormals();

    const planeMesh = new THREE.Mesh(wingShape, this.defaultMats.blue);
    planeGroup.add(planeMesh);
    this.engine.scene.add(planeGroup);
    this.paperAirplane = planeGroup;
  }

  // Create Billboard Mesh with attached AdSpace metadata
  private createAdBillboardMesh(
    adConfig: typeof this.initialAdConfigs[0],
    width: number,
    height: number,
    parentGroup: THREE.Group
  ): THREE.Mesh {
    const { canvas, texture } = this.createBillboardTexture(adConfig);

    const billboardGeo = new THREE.PlaneGeometry(width, height);
    const billboardMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const billboardMesh = new THREE.Mesh(billboardGeo, billboardMat);

    // Outline frame
    const frameGeo = new THREE.BoxGeometry(width + 0.3, height + 0.3, 0.2);
    const frameMesh = new THREE.Mesh(frameGeo, this.defaultMats.blue);
    billboardMesh.add(frameMesh);
    frameMesh.position.z = -0.11;

    const adId = `ad_${Math.random().toString(36).substring(2, 9)}`;
    const adSpace: AdSpace = {
      id: adId,
      title: adConfig.title,
      category: adConfig.category,
      viewsMonthly: adConfig.viewsMonthly,
      priceMonthly: adConfig.priceMonthly,
      sponsorName: adConfig.sponsorName,
      sponsorTagline: adConfig.sponsorTagline,
      accentColor: adConfig.accentColor,
      isAvailable: adConfig.isAvailable,
      mesh: billboardMesh,
      canvas,
      texture,
      parentGroup,
    };

    billboardMesh.userData = { isAdSpace: true, adId };
    this.adSpaces.set(adId, adSpace);

    return billboardMesh;
  }

  // Generate 2D canvas texture for an ad space with authentic doodle styling
  private createBillboardTexture(ad: {
    sponsorName: string;
    sponsorTagline: string;
    accentColor: string;
    isAvailable: boolean;
    priceMonthly: number;
    viewsMonthly: number;
  }): { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    this.drawAdCanvas(ctx, canvas.width, canvas.height, ad);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return { canvas, texture };
  }

  public redrawBillboard(ad: AdSpace) {
    const ctx = ad.canvas.getContext("2d")!;
    this.drawAdCanvas(ctx, ad.canvas.width, ad.canvas.height, ad);
    ad.texture.needsUpdate = true;
  }

  private drawAdCanvas(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    ad: {
      sponsorName: string;
      sponsorTagline: string;
      accentColor: string;
      isAvailable: boolean;
      priceMonthly: number;
      viewsMonthly: number;
    }
  ) {
    // 1. Paper texture fill
    ctx.fillStyle = "#faf7ee";
    ctx.fillRect(0, 0, w, h);

    // 2. Faint blue ruled lines
    ctx.strokeStyle = "rgba(26, 48, 192, 0.12)";
    ctx.lineWidth = 1.5;
    for (let y = 24; y < h; y += 28) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
    }

    // 3. Double-hand-drawn border
    ctx.strokeStyle = ad.isAvailable ? "#d02030" : "#1a30c0";
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    ctx.strokeStyle = ad.isAvailable ? "rgba(208, 32, 48, 0.45)" : "rgba(26, 48, 192, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    // 4. Status Badge at Top Left
    ctx.font = "bold 22px 'Patrick Hand', cursive, sans-serif";
    if (ad.isAvailable) {
      ctx.fillStyle = "#d02030";
      ctx.fillText("★ AVAILABLE FOR LEASE", 32, 46);

      ctx.font = "bold 44px 'Patrick Hand', cursive, sans-serif";
      ctx.fillStyle = "#1a30c0";
      ctx.fillText(ad.sponsorName || "YOUR AD HERE", 32, 108);

      ctx.font = "24px 'Patrick Hand', cursive, sans-serif";
      ctx.fillStyle = "#27272a";
      ctx.fillText(ad.sponsorTagline || "Click to rent this 3D billboard slot", 32, 150);

      ctx.font = "bold 28px 'Patrick Hand', monospace, sans-serif";
      ctx.fillStyle = "#d02030";
      ctx.fillText(`$${ad.priceMonthly}/mo · ${(ad.viewsMonthly / 1000).toFixed(0)}K views`, 32, 206);
    } else {
      ctx.fillStyle = "#059669";
      ctx.fillText("● NYC VERIFIED SPONSOR", 32, 46);

      ctx.font = "bold 48px 'Patrick Hand', cursive, sans-serif";
      ctx.fillStyle = ad.accentColor || "#1a30c0";
      ctx.fillText(ad.sponsorName, 32, 112);

      ctx.font = "25px 'Patrick Hand', cursive, sans-serif";
      ctx.fillStyle = "#18181b";
      ctx.fillText(ad.sponsorTagline, 32, 156);

      ctx.font = "bold 22px 'Patrick Hand', monospace, sans-serif";
      ctx.fillStyle = "#52525b";
      ctx.fillText(`Verified Traffic: ${(ad.viewsMonthly / 1000).toFixed(0)}K monthly views`, 32, 206);
    }

    // Corner doodle pins
    ctx.fillStyle = "#1a30c0";
    [[20, 20], [w - 20, 20], [20, h - 20], [w - 20, h - 20]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Beautiful Hand-Drawn Doodle Trees
  public createDoodleTree(x: number, z: number, isCyan = false): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Woody Trunk with Bark Outlines
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.2), this.defaultMats.black);
    trunk.position.y = 1.6;
    group.add(trunk);

    // 2 Branch splits
    const branchL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.4), this.defaultMats.black);
    branchL.position.set(-0.35, 2.5, 0);
    branchL.rotation.z = Math.PI / 5;
    const branchR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, 1.2), this.defaultMats.black);
    branchR.position.set(0.35, 2.6, 0.1);
    branchR.rotation.z = -Math.PI / 4.5;
    group.add(branchL, branchR);

    // Fluffy Foliage Puffs
    const foliageMat = isCyan ? this.defaultMats.cyan : this.defaultMats.green;
    const puffCenter = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), foliageMat);
    puffCenter.position.set(0, 3.9, 0);
    const puffLeft = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), foliageMat);
    puffLeft.position.set(-0.9, 3.4, 0.3);
    const puffRight = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), foliageMat);
    puffRight.position.set(0.9, 3.5, -0.2);

    group.add(puffCenter, puffLeft, puffRight);
    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // Sidewalk Digital Kiosks
  public createStreetKiosk(x: number, z: number, adIndex = 7): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.4, 0.8), this.defaultMats.black);
    base.position.y = 2.2;
    group.add(base);

    const config = this.initialAdConfigs[adIndex % this.initialAdConfigs.length];
    const screen = this.createAdBillboardMesh(config, 2.0, 3.4, group);
    screen.position.set(0, 2.3, 0.42);
    group.add(screen);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // User Building Placement Tool
  public placeBuilding(type: BuildingType, x: number, z: number) {
    switch (type) {
      case "skyscraper":
        return this.createEmpireStateBuilding(x, z);
      case "indie-loft":
        return this.createBrownstoneRow(x, z);
      case "crane-tower":
        return this.createChryslerBuilding(x, z);
      case "highway-billboard":
        return this.createHighLineElevatedTrain(z);
      case "street-kiosk":
        return this.createStreetKiosk(x, z);
      case "tree":
        return this.createDoodleTree(x, z);
    }
  }

  // District switcher / Fast-Travel Navigation across Doodle Metropolis
  public switchDistrict(district: string) {
    const target = (district === "indie" || district === "tech" || district === "nyc") ? (district === "nyc" ? "downtown" : "monaco") : district;
    const info = DISTRICT_REGISTRY.find((d) => d.id === target || d.id === district);

    // If already running the full unified metropolis with a camera controller, teleport seamlessly
    if (this.cameraController && typeof this.cameraController.teleportTo === "function" && info) {
      this.currentDistrict = info.id;
      this.cameraController.teleportTo(info.spawnPoint.x, info.spawnPoint.y, info.spawnPoint.z, info.lookAt);
      doodleAudio.scribble();
      return;
    }

    // Fallback: build district directly for test runners or standalone instances
    this.currentDistrict = target;
    DistrictManager.buildDistrict(target as any, this);
  }




  public clearDistrict() {
    this.buildings.forEach((b) => this.engine.scene.remove(b));
    this.buildings = [];
    this.adSpaces.clear();
    this.trafficCars.forEach((c) => this.engine.scene.remove(c.group));
    this.trafficCars = [];
    this.f1Cars.forEach((c) => this.engine.scene.remove(c.group));
    this.f1Cars = [];
    this.yachts.forEach((y) => this.engine.scene.remove(y));
    this.yachts = [];
    this.yachtRadars = [];
    if (this.tenderBoat) {
      this.engine.scene.remove(this.tenderBoat.group);
      this.tenderBoat = null;
    }
    this.pedestrians.forEach((p) => this.engine.scene.remove(p.group));
    this.pedestrians = [];
    this.clouds.forEach((c) => this.engine.scene.remove(c));
    this.clouds = [];
    if (this.paperAirplane) this.engine.scene.remove(this.paperAirplane);
    this.paperAirplane = null;
    if (this.subwayTrain) this.engine.scene.remove(this.subwayTrain);
    this.subwayTrain = null;
    this.steamPuffs = [];
    this.f1TrackCurve = null;
    this.secrets.forEach((s) => {
      if (s.mesh) this.engine.scene.remove(s.mesh);
    });
    this.secrets = [];
  }

  // ==========================================
  // MAP 2: AUTHENTIC F1 CIRCUIT DE MONACO
  // ==========================================
  public buildMonacoCircuit() {
    this.createMonacoTrack();
    this.createMonacoTunnel();
    this.createPortHerculeHarbor();
    this.createSuperyachts();
    this.createMonteCarloCasinoAndVillas();
    this.createSafetyCarAndPitEquipment();
    this.createF1Grandstands();
    this.createF1Cars();
    this.createMonacoAtmosphere();
    this.spawnDistrictSecrets("monaco");
  }

  // 1. Monaco F1 Track Layout with Kerbs, Armco, Starting Grid & Gantry
  private createMonacoTrack() {
    const trackGroup = new THREE.Group();

    // Circuit de Monaco closed racing line loop - Scaled to authentic real map scale
    const waypoints = [
      // 1. Pit Straight (Boulevard Albert 1er alongside the harbor)
      new THREE.Vector3(-70, 0.05, 58),
      new THREE.Vector3(-22, 0.05, 58),
      new THREE.Vector3(26, 0.05, 58),
      new THREE.Vector3(62, 0.05, 58),

      // 2. Turn 1: Sainte-Dévote
      new THREE.Vector3(88, 0.05, 50),
      new THREE.Vector3(99, 0.05, 30),

      // 3. Beau Rivage (uphill climb to Casino)
      new THREE.Vector3(96, 0.05, 0),
      new THREE.Vector3(88, 0.05, -35),
      new THREE.Vector3(75, 0.05, -66),

      // 4. Massenet (Turn 3) & Casino Square (Turn 4)
      new THREE.Vector3(48, 0.05, -88),
      new THREE.Vector3(18, 0.05, -96),
      new THREE.Vector3(-9, 0.05, -94),

      // 5. Mirabeau Haute (Turn 5)
      new THREE.Vector3(-31, 0.05, -88),

      // 6. Fairmont Hairpin (Turn 6) - 180° slowest hairpin in F1
      new THREE.Vector3(-44, 0.05, -77),
      new THREE.Vector3(-33, 0.05, -62),

      // 7. Mirabeau Bas & Portier (Turn 7 & 8)
      new THREE.Vector3(-40, 0.05, -44),
      new THREE.Vector3(-62, 0.05, -31),

      // 8. The Monaco Tunnel (Turn 9)
      new THREE.Vector3(-88, 0.05, -22),
      new THREE.Vector3(-110, 0.05, -4),
      new THREE.Vector3(-116, 0.05, 18),

      // 9. Nouvelle Chicane (Turns 10 & 11) - Harbor exit
      new THREE.Vector3(-110, 0.05, 31),
      new THREE.Vector3(-101, 0.05, 37),

      // 10. Tabac (Turn 12)
      new THREE.Vector3(-97, 0.05, 44),

      // 11. Swimming Pool Chicane (Turns 13-16)
      new THREE.Vector3(-92, 0.05, 50),
      new THREE.Vector3(-101, 0.05, 55),
      new THREE.Vector3(-92, 0.05, 59),

      // 12. La Rascasse (Turns 17 & 18)
      new THREE.Vector3(-97, 0.05, 62),

      // 13. Anthony Noghès (Turn 19)
      new THREE.Vector3(-84, 0.05, 60),
    ];

    this.f1TrackCurve = new THREE.CatmullRomCurve3(waypoints, true);

    const numPts = 240;
    const pts = this.f1TrackCurve.getPoints(numPts);

    for (let i = 0; i < numPts; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const tangent = p2.clone().sub(p1).normalize();
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const segLen = p1.distanceTo(p2);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const rotY = Math.atan2(tangent.x, tangent.z);

      // Asphalt track ribbon
      const road = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.03, segLen), this.defaultMats.black);
      road.position.set(mid.x, 0.02, mid.z);
      road.rotation.y = rotY;
      trackGroup.add(road);

      // Centerline white dashes
      if (i % 2 === 0) {
        const dash = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, segLen * 0.5), this.defaultMats.blue);
        dash.position.set(mid.x, 0.035, mid.z);
        dash.rotation.y = rotY;
        trackGroup.add(dash);
      }

      // Steel Armco Barriers along track edges
      const barrierL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.75, segLen), this.defaultMats.blue);
      barrierL.position.copy(mid).add(normal.clone().multiplyScalar(4.4));
      barrierL.position.y = 0.38;
      barrierL.rotation.y = rotY;

      const barrierR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.75, segLen), this.defaultMats.blue);
      barrierR.position.copy(mid).add(normal.clone().multiplyScalar(-4.4));
      barrierR.position.y = 0.38;
      barrierR.rotation.y = rotY;
      trackGroup.add(barrierL, barrierR);

      // Red & White Kerbs on sharp corners
      const isCorner =
        (i >= 26 && i <= 50) ||   // Sainte-Dévote
        (i >= 72 && i <= 112) ||  // Casino & Mirabeau
        (i >= 118 && i <= 145) || // Fairmont Hairpin
        (i >= 170 && i <= 196) || // Nouvelle Chicane
        (i >= 202 && i <= 236);   // Swimming pool & Rascasse

      if (isCorner) {
        const kerbMat = (i % 2 === 0) ? this.defaultMats.red : this.defaultMats.orange;
        const kerb = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, segLen), kerbMat);
        kerb.position.copy(mid).add(normal.clone().multiplyScalar(4.1));
        kerb.position.y = 0.04;
        kerb.rotation.y = rotY;
        trackGroup.add(kerb);
      }
    }

    // --- Pit Straight Features ---
    // Start / Finish Checkered Line at X: 11, Z: 58
    const sfLine = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.05, 1.4), this.defaultMats.black);
    sfLine.position.set(11, 0.03, 58);
    trackGroup.add(sfLine);
    for (let c = -3.6; c <= 3.6; c += 0.8) {
      const checker = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.6), this.defaultMats.blueFill);
      checker.position.set(11 + (Math.abs(c) % 1.6 < 0.8 ? 0.35 : -0.35), 0.04, 58 + c);
      trackGroup.add(checker);
    }

    // 10 Starting Grid Slots (White brackets)
    for (let g = 0; g < 10; g++) {
      const gx = -4 - g * 4.6;
      const gz = g % 2 === 0 ? 59.5 : 56.5;
      const box = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 3.2), this.defaultMats.blue);
      box.position.set(gx, 0.035, gz);
      trackGroup.add(box);
    }

    // Pit Wall separating the Pit Lane
    const pitWall = new THREE.Mesh(new THREE.BoxGeometry(110, 1.1, 0.35), this.defaultMats.blue);
    pitWall.position.set(0, 0.55, 62.5);
    trackGroup.add(pitWall);

    // 4 Team Telemetry Perches with Canopies & Screens
    [-40, -18, 4, 26].forEach((px) => {
      const perch = new THREE.Group();
      perch.position.set(px, 1.1, 62.5);
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 1.8), this.defaultMats.blue);
      canopy.position.set(0, 1.2, 0);
      const pillar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2), this.defaultMats.black);
      pillar1.position.set(-1.6, 0.6, 0.7);
      const pillar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2), this.defaultMats.black);
      pillar2.position.set(1.6, 0.6, 0.7);
      const screen = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.65, 0.1), this.defaultMats.cyan);
      screen.position.set(0, 0.5, -0.2);
      perch.add(canopy, pillar1, pillar2, screen);
      trackGroup.add(perch);
    });

    // Braking Zone Rubber Skid Marks on Asphalt into major turns
    const skidZones = [
      { x: 75, z: 53, rot: 0.15, len: 20 },   // Into Sainte-Dévote
      { x: -22, z: -90, rot: -0.6, len: 16 }, // Into Mirabeau
      { x: -40, z: -82, rot: -1.2, len: 14 }, // Into Fairmont Hairpin
      { x: -114, z: 18, rot: 2.1, len: 22 },  // Into Nouvelle Chicane (after Tunnel)
      { x: -97, z: 60, rot: 0.05, len: 16 },  // Into La Rascasse
    ];
    skidZones.forEach((skid) => {
      const markL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, skid.len), this.defaultMats.black);
      markL.position.set(skid.x - 0.9, 0.038, skid.z);
      markL.rotation.y = skid.rot;
      const markR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, skid.len), this.defaultMats.black);
      markR.position.set(skid.x + 0.9, 0.038, skid.z);
      markR.rotation.y = skid.rot;
      trackGroup.add(markL, markR);
    });

    // Brake Distance Marker Boards (150m, 100m, 50m) along barriers
    const brakeBoards = [
      { x: 65, z: 52, dist: "100" },
      { x: 75, z: 52, dist: "50" },
      { x: -113, z: 8, dist: "150" },
      { x: -113, z: 18, dist: "100" },
      { x: -111, z: 26, dist: "50" },
    ];
    brakeBoards.forEach((b) => {
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 1.6), this.defaultMats.blue);
      board.position.set(b.x, 1.0, b.z);
      const textStripe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, 1.2), this.defaultMats.black);
      textStripe.position.set(b.x, 1.0, b.z);
      trackGroup.add(board, textStripe);
    });

    // TechPro Impact Runoff Barriers at Sainte-Dévote & Nouvelle Chicane runoffs
    const runoffTechPro = [
      { x: 96, z: 58, rot: 0 },
      { x: -118, z: 35, rot: -0.4 },
    ];
    runoffTechPro.forEach((tp) => {
      for (let block = -3; block <= 3; block++) {
        const mat = (block % 2 === 0) ? this.defaultMats.orange : this.defaultMats.blue;
        const cube = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.3, 1.4), mat);
        cube.position.set(tp.x + block * 1.5, 0.65, tp.z);
        cube.rotation.y = tp.rot;
        trackGroup.add(cube);
      }
    });

    // Covered Corner Track Marshals with Waving Safety Flags
    const marshalPosts = [
      { x: 92, z: 40, flag: this.defaultMats.orange },
      { x: -48, z: -70, flag: this.defaultMats.green },
      { x: -106, z: 40, flag: this.defaultMats.red },
    ];
    marshalPosts.forEach((mp) => {
      const post = new THREE.Group();
      post.position.set(mp.x, 0, mp.z);
      const shelter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 1.8), this.defaultMats.orange);
      shelter.position.y = 1.2;
      const marshal = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.5), this.defaultMats.red);
      marshal.position.set(0.6, 0.75, 0.9);
      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.55, 0.9), mp.flag);
      flag.position.set(0.6, 1.7, 1.4);
      post.add(shelter, marshal, flag);
      trackGroup.add(post);
    });

    // Overhead Starting Gantry Bridge spanning across the track at X: 11, Z: 58
    const gantry = new THREE.Group();
    gantry.position.set(11, 0, 58);
    const pLeft = new THREE.Mesh(new THREE.BoxGeometry(0.7, 7.6, 0.7), this.defaultMats.blue);
    pLeft.position.set(0, 3.8, -4.8);
    const pRight = new THREE.Mesh(new THREE.BoxGeometry(0.7, 7.6, 0.7), this.defaultMats.blue);
    pRight.position.set(0, 3.8, 4.8);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 10.5), this.defaultMats.blue);
    beam.position.set(0, 7.4, 0);
    gantry.add(pLeft, pRight, beam);

    // 5 Red F1 Starting Lights
    for (let l = -2.0; l <= 2.0; l += 1.0) {
      const lightBox = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.0, 0.35), this.defaultMats.black);
      lightBox.position.set(0, 6.5, l);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), this.defaultMats.red);
      lamp.position.set(0.22, 0, 0);
      lightBox.add(lamp);
      gantry.add(lightBox);
    }

    // Monaco Billboard 1: Start/Finish Rolex / Tag Heuer Gantry Billboard
    const bbGantry = this.createAdBillboardMesh(this.monacoAdConfigs[0], 8.5, 2.0, gantry);
    bbGantry.position.set(0.48, 5.2, 0);
    bbGantry.rotation.y = -Math.PI / 2;
    gantry.add(bbGantry);

    trackGroup.add(gantry);
    this.engine.scene.add(trackGroup);
    trackGroup.userData.noCollision = true;
    this.buildings.push(trackGroup);
  }

  // Official FIA Safety Car & Pit Lane Garage Gear
  private createSafetyCarAndPitEquipment() {
    const pitGroup = new THREE.Group();

    // 1. Official FIA Safety Car (Mercedes-AMG GT / Aston Martin Vantage Style)
    const scGroup = new THREE.Group();
    scGroup.position.set(48, 0, 65.5); // Parked in pit exit pocket

    const scBody = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.9, 2.0), this.defaultMats.cyan);
    scBody.position.y = 0.58;
    const scCabin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.65, 1.6), this.defaultMats.black);
    scCabin.position.set(-0.2, 1.2, 0);

    // Rooftop Safety Car Amber Flashing Light Bar
    const scLightBar = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.22, 0.38), this.defaultMats.orange);
    scLightBar.position.set(-0.2, 1.62, 0);

    // High Downforce Rear Wing
    const scWing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 1.8), this.defaultMats.black);
    scWing.position.set(-2.0, 1.3, 0);

    scGroup.add(scBody, scCabin, scLightBar, scWing);

    // 4 Wheels
    [[-1.3, -0.95], [-1.3, 0.95], [1.3, -0.95], [1.3, 0.95]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 10), this.defaultMats.black);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, 0.38, wz);
      scGroup.add(wheel);
    });

    pitGroup.add(scGroup);

    // 2. Electronic Pit Speed Limit Gantry: "PIT LIMIT 60"
    const pitSign = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 3.6), this.defaultMats.black);
    pitSign.position.set(-50, 2.8, 64.0);
    const pitSignPost = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.8), this.defaultMats.blue);
    pitSignPost.position.set(-50, 1.4, 64.0);
    pitGroup.add(pitSign, pitSignPost);

    // 3. Stacks of Pirelli Tires in Pit Lane (Soft Red, Medium Yellow, Hard White)
    const tireStackSpots = [-30, -10, 10, 30];
    tireStackSpots.forEach((tx, idx) => {
      const tMat = idx % 2 === 0 ? this.defaultMats.red : this.defaultMats.orange;
      for (let ty = 0; ty < 3; ty++) {
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.34, 10), this.defaultMats.black);
        tire.position.set(tx, 0.17 + ty * 0.34, 66.0);
        const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.35, 10), tMat);
        stripe.position.set(tx, 0.17 + ty * 0.34, 66.0);
        pitGroup.add(tire, stripe);
      }
    });

    this.engine.scene.add(pitGroup);
    this.buildings.push(pitGroup);
  }

  // 2. The Famous Covered Monaco Tunnel
  private createMonacoTunnel() {
    const tunnelGroup = new THREE.Group();
    const tunnelLength = 48;
    const tunnelRadius = 5.8;

    // Arched Ribbed Roof
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const x = -82 - t * 32;
      const z = -26 + t * 44;
      const rotY = Math.atan2(-32, 44);

      const rib = new THREE.Mesh(
        new THREE.TorusGeometry(tunnelRadius, 0.26, 8, 18, Math.PI),
        this.defaultMats.black
      );
      rib.position.set(x, 0.1, z);
      rib.rotation.y = rotY;
      rib.rotation.x = Math.PI / 2;
      tunnelGroup.add(rib);

      // Overhead interior tunnel illumination
      const ceilLight = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 1.8), this.defaultMats.orange);
      ceilLight.position.set(x, tunnelRadius - 0.25, z);
      tunnelGroup.add(ceilLight);

      // Jet Ventilation Fans suspended from ceiling
      if (i === 4 || i === 9) {
        const fanHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 2.2, 10), this.defaultMats.black);
        fanHousing.position.set(x, tunnelRadius - 0.9, z);
        fanHousing.rotation.y = rotY;
        fanHousing.rotation.z = Math.PI / 2;
        tunnelGroup.add(fanHousing);
      }
    }

    // Solid Tunnel Ceiling Shell
    const shell = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.35, tunnelLength + 4), this.defaultMats.blue);
    shell.position.set(-98, tunnelRadius + 0.2, -4);
    shell.rotation.y = Math.atan2(-32, 44);
    tunnelGroup.add(shell);

    // Tunnel Sea-side Structural View Pillars
    for (let p = -22; p <= 16; p += 6.5) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.6, tunnelRadius, 1.0), this.defaultMats.blue);
      pillar.position.set(-93 + (p + 22) * -0.65, tunnelRadius / 2, p);
      tunnelGroup.add(pillar);
    }

    // Monaco Billboard 3: Tunnel Entrance Overpass Billboard with Portal Header
    const portalGantry = new THREE.Group();
    portalGantry.position.set(-82, 0, -26);
    portalGantry.rotation.y = Math.atan2(-32, 44);
    const bbTunnel = this.createAdBillboardMesh(this.monacoAdConfigs[2], 8.5, 2.2, portalGantry);
    bbTunnel.position.set(0, 5.2, 0);
    const portalSign = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.7, 0.35), this.defaultMats.red);
    portalSign.position.set(0, 6.6, 0);
    portalGantry.add(bbTunnel, portalSign);
    tunnelGroup.add(portalGantry);

    // Speed Trap Camera Gantry at Tunnel Exit
    const exitGantry = new THREE.Group();
    exitGantry.position.set(-113, 0, 24);
    exitGantry.rotation.y = Math.atan2(-32, 44);
    const exitFrame = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.35, 0.45), this.defaultMats.black);
    exitFrame.position.y = 5.2;
    const cameraBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.7), this.defaultMats.cyan);
    cameraBox.position.set(0, 4.7, 0);
    exitGantry.add(exitFrame, cameraBox);
    tunnelGroup.add(exitGantry);

    this.engine.scene.add(tunnelGroup);
    this.buildings.push(tunnelGroup);
  }

  // 3. Port Hercule Harbor with Waterfront Piers, Lighthouse & Animated Speedboat
  private createPortHerculeHarbor() {
    const harborGroup = new THREE.Group();

    // Mediterranean Blue Water Surface Basin
    const waterGeo = new THREE.PlaneGeometry(120, 55);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = this.defaultMats.blueFill;
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(-25, 0.015, 14);
    harborGroup.add(water);

    // Wave ripple doodle lines
    for (let w = 0; w < 32; w++) {
      const ripple = new THREE.Mesh(new THREE.BoxGeometry(3.5 + (w % 4) * 2.0, 0.02, 0.15), this.defaultMats.cyan);
      ripple.position.set(-75 + (w * 5.2) % 105, 0.025, -10 + (w * 4.2) % 45);
      harborGroup.add(ripple);
    }

    // Concrete Quayside Piers with Mooring Cleats
    const quai1 = new THREE.Mesh(new THREE.BoxGeometry(120, 0.25, 2.2), this.defaultMats.blue);
    quai1.position.set(-25, 0.12, 44); // Quai des États-Unis
    const quai2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 55), this.defaultMats.blue);
    quai2.position.set(35, 0.12, 14); // Quai Antoine 1er
    harborGroup.add(quai1, quai2);

    // Harbor Breakwater Stone Pier with Navigation Lighthouse (Jetée Lucciana)
    const jetty = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 4.5), this.defaultMats.black);
    jetty.position.set(38, 0.4, -12);
    const lighthouse = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 6.5, 8), this.defaultMats.blue);
    lighthouse.position.set(40, 3.65, -12);
    const lightTop = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), this.defaultMats.green);
    lightTop.position.set(40, 7.2, -12);
    harborGroup.add(jetty, lighthouse, lightTop);

    // Mooring Bollards
    for (let bx = -70; bx <= 25; bx += 8.5) {
      const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.5, 8), this.defaultMats.black);
      bollard.position.set(bx, 0.38, 44.5);
      harborGroup.add(bollard);
    }

    // Palm Trees along the Quayside Boulevard
    for (let px = -68; px <= 22; px += 10) {
      const palm = this.createPalmTree(px, 48.0);
      harborGroup.add(palm);
    }

    // High-Speed Yacht Tender / Speedboat in Port Hercule Harbor
    const tender = new THREE.Group();
    tender.position.set(-25, 0.1, 14);
    const tHull = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.75, 2.0), this.defaultMats.orange);
    tHull.position.y = 0.28;
    const tWindshield = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.6), this.defaultMats.cyan);
    tWindshield.position.set(0.7, 0.7, 0);
    const wake = new THREE.Mesh(new THREE.ConeGeometry(2.0, 7.0, 3), this.defaultMats.blueFill);
    wake.position.set(-3.8, 0.02, 0);
    wake.rotation.z = Math.PI / 2;
    tender.add(tHull, tWindshield, wake);
    harborGroup.add(tender);
    this.tenderBoat = { group: tender, progress: 0, speed: 0.12, wake };

    // Rainier III Nautical Stadium (Swimming Pool Chicane Section)
    const poolGroup = new THREE.Group();
    poolGroup.position.set(-88, 0, 42);

    const poolBasin = new THREE.Mesh(new THREE.BoxGeometry(24, 0.4, 10), this.defaultMats.cyan);
    poolBasin.position.set(0, 0.2, 0);
    const poolWater = new THREE.Mesh(new THREE.PlaneGeometry(22.5, 8.8), this.defaultMats.blueFill);
    poolWater.rotateX(-Math.PI / 2);
    poolWater.position.set(0, 0.41, 0);
    poolGroup.add(poolBasin, poolWater);

    // 10m Olympic Diving Tower
    const diveTower = new THREE.Group();
    diveTower.position.set(-9.5, 0, 0);
    const dPlatform = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.18, 1.4), this.defaultMats.blue);
    dPlatform.position.set(0, 6.2, 0);
    const dLadder = new THREE.Mesh(new THREE.BoxGeometry(0.35, 6.2, 0.35), this.defaultMats.blue);
    dLadder.position.set(0, 3.1, 0);
    diveTower.add(dPlatform, dLadder);
    poolGroup.add(diveTower);

    // Monaco Billboard 5: Swimming Pool Chicane Pedestrian Overpass Bridge
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(-96, 0, 53);
    const bridgeArch = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 10.0), this.defaultMats.blue);
    bridgeArch.position.set(0, 5.0, 0);
    const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.0), this.defaultMats.black);
    b1.position.set(0, 2.5, -4.5);
    const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.0), this.defaultMats.black);
    b2.position.set(0, 2.5, 4.5);
    bridgeGroup.add(bridgeArch, b1, b2);

    const bbBridge = this.createAdBillboardMesh(this.monacoAdConfigs[4], 7.5, 1.8, bridgeGroup);
    bbBridge.position.set(0, 5.0, 0);
    bridgeGroup.add(bbBridge);
    harborGroup.add(bridgeGroup);

    // Monaco Billboard 7 & 8: Portier & Nouvelle Chicane Kiosks
    const kiosk1 = this.createStreetKiosk(-52, -31, 6);
    const kiosk2 = this.createStreetKiosk(-106, 28, 7);
    harborGroup.add(kiosk1, kiosk2);

    harborGroup.add(poolGroup);
    this.engine.scene.add(harborGroup);
    harborGroup.userData.noCollision = true;
    this.buildings.push(harborGroup);
  }

  // 4. Moored Luxury Superyachts in Port Hercule
  private createSuperyachts() {
    this.yachtRadars = [];

    // 1. Mega-Yacht "M/Y DOODLE" (Flagship luxury superyacht moored stern-to)
    const yacht1 = new THREE.Group();
    yacht1.position.set(-18, 0, 10);
    yacht1.userData.baseY = 0;

    // Main Hull (Sharp bow, flared deck, swim platform)
    const hullMat = this.defaultMats.blue;
    const hull = new THREE.Mesh(new THREE.BoxGeometry(36, 4.0, 8.5), hullMat);
    hull.position.set(0, 1.6, 0);
    const bow = new THREE.Mesh(new THREE.ConeGeometry(4.4, 8.0, 4), hullMat);
    bow.rotation.z = -Math.PI / 2;
    bow.position.set(22, 1.6, 0);
    const bootStripe = new THREE.Mesh(new THREE.BoxGeometry(37, 0.3, 8.6), this.defaultMats.cyan);
    bootStripe.position.set(0, 0.5, 0);
    yacht1.add(hull, bow, bootStripe);

    // 3-Tier Superstructure
    const deck1 = new THREE.Mesh(new THREE.BoxGeometry(24, 3.0, 7.5), hullMat);
    deck1.position.set(-2.0, 4.8, 0);
    const deck2 = new THREE.Mesh(new THREE.BoxGeometry(16, 2.8, 6.2), hullMat);
    deck2.position.set(-1.5, 7.6, 0);
    const bridgeWindow = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.4, 6.3), this.defaultMats.black);
    bridgeWindow.position.set(4.5, 7.6, 0);
    yacht1.add(deck1, deck2, bridgeWindow);

    // Radar Arch & Satellite Domes with Spinning Scanner
    const radarArch = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.8, 4.6), this.defaultMats.blue);
    radarArch.position.set(-4.5, 10.4, 0);
    const domeL = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), this.defaultMats.orange);
    domeL.position.set(-4.5, 12.2, -1.6);
    const domeR = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), this.defaultMats.orange);
    domeR.position.set(-4.5, 12.2, 1.6);

    const radarBar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 0.4), this.defaultMats.black);
    radarBar.position.set(-4.5, 13.0, 0);
    this.yachtRadars.push(radarBar);

    // Monaco Flag on Stern Staff
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.2), this.defaultMats.black);
    flagPole.position.set(-17.5, 4.8, 0);
    const monacoFlag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.0, 1.6), this.defaultMats.red);
    monacoFlag.position.set(-17.5, 5.5, 0.8);
    yacht1.add(radarArch, domeL, domeR, radarBar, flagPole, monacoFlag);

    // Helipad / VIP party terrace on Sun Deck
    const helipad = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.2, 16), this.defaultMats.blue);
    helipad.position.set(-11.5, 6.4, 0);
    yacht1.add(helipad);

    // Monaco Billboard 4: M/Y DOODLE - Harbor Superyacht VIP Deck Billboard
    const bbYacht = this.createAdBillboardMesh(this.monacoAdConfigs[3], 9.5, 2.4, yacht1);
    bbYacht.position.set(-4.5, 7.8, 3.4);
    yacht1.add(bbYacht);

    // 2. Tri-Deck Superyacht "S/Y MONTE CARLO"
    const yacht2 = new THREE.Group();
    yacht2.position.set(-48, 0, 16);
    yacht2.userData.baseY = 0;
    const hull2 = new THREE.Mesh(new THREE.BoxGeometry(28, 3.4, 7.0), hullMat);
    hull2.position.set(0, 1.3, 0);
    const cabin2 = new THREE.Mesh(new THREE.BoxGeometry(18, 2.6, 5.8), hullMat);
    cabin2.position.set(-1.5, 4.2, 0);
    const awning = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.12, 5.6), this.defaultMats.orange);
    awning.position.set(-5.5, 5.9, 0);
    yacht2.add(hull2, cabin2, awning);

    // 3. Sports Cruiser "RIVIERA FLASH"
    const yacht3 = new THREE.Group();
    yacht3.position.set(10, 0, 14);
    yacht3.userData.baseY = 0;
    const hull3 = new THREE.Mesh(new THREE.BoxGeometry(18, 2.6, 5.0), hullMat);
    hull3.position.set(0, 1.0, 0);
    const cabin3 = new THREE.Mesh(new THREE.BoxGeometry(9, 2.0, 4.0), hullMat);
    cabin3.position.set(-1, 3.2, 0);
    yacht3.add(hull3, cabin3);

    // 4. Additional Luxury Yacht
    const yacht4 = new THREE.Group();
    yacht4.position.set(-34, 0, 28);
    yacht4.userData.baseY = 0;
    const hull4 = new THREE.Mesh(new THREE.BoxGeometry(22, 2.8, 5.8), hullMat);
    hull4.position.set(0, 1.1, 0);
    const cabin4 = new THREE.Mesh(new THREE.BoxGeometry(12, 2.2, 4.6), hullMat);
    cabin4.position.set(-1, 3.5, 0);
    yacht4.add(hull4, cabin4);

    this.yachts.push(yacht1, yacht2, yacht3, yacht4);
    this.engine.scene.add(yacht1, yacht2, yacht3, yacht4);
    this.buildings.push(yacht1, yacht2, yacht3, yacht4);
  }

  // 5. Casino de Monte Carlo, Fairmont Hotel & Mediterranean Hillside Villas
  private createMonteCarloCasinoAndVillas() {
    const casinoGroup = new THREE.Group();

    // 1. Casino de Monte Carlo at Casino Square (X: 18, Z: -106)
    const casino = new THREE.Group();
    casino.position.set(18, 0, -106);

    // Grand Beaux-Arts Palatial Base
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(34, 15, 18), this.defaultMats.blue);
    mainBody.position.set(0, 7.5, 0);

    // 6 Grand Neoclassical Columns
    for (let c = -6.0; c <= 6.0; c += 2.4) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 12, 8), this.defaultMats.black);
      col.position.set(c, 6.0, 9.3);
      casino.add(col);
    }

    // Triangular Pediment over Portico
    const pediment = new THREE.Mesh(new THREE.ConeGeometry(6.8, 4.0, 4), this.defaultMats.blue);
    pediment.position.set(0, 14.5, 9.3);
    pediment.rotation.y = Math.PI / 4;

    // Green Copper Decorative Dome
    const dome = new THREE.Mesh(new THREE.SphereGeometry(4.8, 8, 8), this.defaultMats.green);
    dome.position.set(0, 17.5, 0);

    casino.add(mainBody, pediment, dome);

    // Casino Plaza with Circular Fountain
    const fountainRing = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 0.6, 16), this.defaultMats.blue);
    fountainRing.position.set(0, 0.3, 16);
    const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 4.1, 0.5, 16), this.defaultMats.cyan);
    fountainWater.position.set(0, 0.42, 16);
    const fountainJet = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.3, 3.6, 6), this.defaultMats.cyan);
    fountainJet.position.set(0, 2.0, 16);
    casino.add(fountainRing, fountainWater, fountainJet);

    // 4 Exotic Supercars Parked in Casino Square Plaza
    // 1. Ferrari 296 GTB (Rosso Corsa Red)
    const carFerrari = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 2.0), this.defaultMats.red);
    carFerrari.position.set(-8.5, 0.6, 16);
    // 2. Lamborghini Revuelto with Angular Wing (Cyber Yellow)
    const carLambo = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.1, 2.1), this.defaultMats.orange);
    carLambo.position.set(8.5, 0.55, 16);
    const lamboWing = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 1.9), this.defaultMats.black);
    lamboWing.position.set(8.5, 1.2, 18.0);
    // 3. Porsche 911 GT3 RS with Swan-Neck Wing
    const carPorsche = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.25, 1.9), this.defaultMats.black);
    carPorsche.position.set(-8.5, 0.62, 21);
    // 4. Rolls-Royce Phantom (Midnight Blue with prominent grille)
    const carRolls = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.55, 2.2), this.defaultMats.blue);
    carRolls.position.set(8.5, 0.77, 21);
    const rollsGrille = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.0, 1.3), this.defaultMats.cyan);
    rollsGrille.position.set(8.5, 0.8, 19.8);
    casino.add(carFerrari, carLambo, lamboWing, carPorsche, carRolls, rollsGrille);

    // Monaco Billboard 6: Monte Carlo Casino Square Plaza Billboard
    const bbCasino = this.createAdBillboardMesh(this.monacoAdConfigs[5], 9.2, 2.8, casino);
    bbCasino.position.set(0, 9.5, 9.4);
    casino.add(bbCasino);

    casinoGroup.add(casino);

    // Hôtel de Paris Monte-Carlo (Adjacent to Casino Square)
    const hdp = new THREE.Group();
    hdp.position.set(52, 0, -84);
    const hdpBody = new THREE.Mesh(new THREE.BoxGeometry(22, 18, 16), this.defaultMats.blue);
    hdpBody.position.set(0, 9, 0);
    const hdpCanopy = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.3, 3.6), this.defaultMats.red);
    hdpCanopy.position.set(0, 4.8, 8.5);
    hdp.add(hdpBody, hdpCanopy);
    casinoGroup.add(hdp);

    // Café de Paris Terrace with Outdoor Bistro Parasols
    const cdp = new THREE.Group();
    cdp.position.set(-12, 0, -106);
    const cdpBody = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 10), this.defaultMats.blue);
    cdpBody.position.set(0, 5, 0);
    const cdpAwning = new THREE.Mesh(new THREE.BoxGeometry(16.4, 0.25, 3.2), this.defaultMats.orange);
    cdpAwning.position.set(0, 4.0, 5.4);
    cdpAwning.rotation.x = 0.25;
    for (let px = -5; px <= 5; px += 5) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.6), this.defaultMats.black);
      pole.position.set(px, 1.3, 8.0);
      const parasol = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.75, 6), this.defaultMats.red);
      parasol.position.set(px, 2.7, 8.0);
      cdp.add(pole, parasol);
    }
    cdp.add(cdpBody, cdpAwning);
    casinoGroup.add(cdp);

    // 2. Fairmont Hotel overlooking the Fairmont Hairpin (X: -39, Z: -78)
    const fairmont = new THREE.Group();
    fairmont.position.set(-39, 0, -78);

    const fBody = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 14), this.defaultMats.blue);
    fBody.position.set(0, 7.0, 0);

    // Terraced Balconies overlooking the 180° hairpin
    for (let floor = 3; floor <= 12; floor += 2.8) {
      const balcony = new THREE.Mesh(new THREE.BoxGeometry(22.4, 0.25, 2.6), this.defaultMats.blue);
      balcony.position.set(0, floor, 7.2);
      fairmont.add(balcony);
    }

    // Monaco Billboard 2: Fairmont Hairpin Grandstand Apex Wall Banner
    const bbFairmont = this.createAdBillboardMesh(this.monacoAdConfigs[1], 8.5, 2.6, fairmont);
    bbFairmont.position.set(0, 4.0, 7.3);
    fairmont.add(bbFairmont);

    fairmont.add(fBody);
    casinoGroup.add(fairmont);

    // 3. Maritime Alps Hillside Retaining Walls & Pastel Mediterranean Villas
    const cliffWall = new THREE.Mesh(new THREE.BoxGeometry(110, 24, 8), this.defaultMats.black);
    cliffWall.position.set(70, 12, -70);
    casinoGroup.add(cliffWall);

    const villaPositions = [
      { x: 88, z: -40, h: 18, color: this.defaultMats.orange },
      { x: 92, z: -15, h: 16, color: this.defaultMats.blue },
      { x: 74, z: -85, h: 20, color: this.defaultMats.green },
      { x: 42, z: -125, h: 18, color: this.defaultMats.orange },
      { x: -8, z: -125, h: 16, color: this.defaultMats.blue },
    ];

    villaPositions.forEach((vp) => {
      const villa = new THREE.Group();
      villa.position.set(vp.x, 0, vp.z);
      const vBody = new THREE.Mesh(new THREE.BoxGeometry(12, vp.h, 10), vp.color);
      vBody.position.set(0, vp.h / 2, 0);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(8.5, 3.5, 4), this.defaultMats.red);
      roof.position.set(0, vp.h + 1.75, 0);
      roof.rotation.y = Math.PI / 4;
      villa.add(vBody, roof);
      casinoGroup.add(villa);
    });

    this.engine.scene.add(casinoGroup);
    this.buildings.push(casinoGroup);
  }

  // 6. Tiered Spectator Grandstands (Grandstand K & Grandstand T)
  private createF1Grandstands() {
    const gsGroup = new THREE.Group();

    // Grandstand K (Harbor-front tiered seating along Tabac / Piscine)
    const gsK = new THREE.Group();
    gsK.position.set(-92, 0, 33);
    gsK.rotation.y = Math.PI / 2;

    // 4 Tiered Seating Steps
    for (let tier = 0; tier < 4; tier++) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(26, 0.7, 1.4), this.defaultMats.blue);
      bench.position.set(0, 0.7 + tier * 1.0, -tier * 1.2);
      gsK.add(bench);

      for (let s = -11; s <= 11; s += 1.8) {
        const specMat = (Math.abs(s) % 2 < 1) ? this.defaultMats.red : this.defaultMats.orange;
        const spec = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 6), specMat);
        spec.position.set(s, 1.3 + tier * 1.0, -tier * 1.2);
        gsK.add(spec);
      }
    }
    gsGroup.add(gsK);

    // Grandstand T (Opposite the Pit Lane & Start/Finish)
    const gsT = new THREE.Group();
    gsT.position.set(-10, 0, 75);

    for (let tier = 0; tier < 5; tier++) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(38, 0.8, 1.4), this.defaultMats.blue);
      bench.position.set(0, 0.8 + tier * 1.1, tier * 1.2);
      gsT.add(bench);

      for (let s = -17; s <= 17; s += 2.0) {
        const specMat = (s % 3 === 0) ? this.defaultMats.red : (s % 3 === 1 ? this.defaultMats.cyan : this.defaultMats.green);
        const spec = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 6), specMat);
        spec.position.set(s, 1.4 + tier * 1.1, tier * 1.2);
        gsT.add(spec);
      }
    }
    gsGroup.add(gsT);

    // Grandstand B at Casino Square
    const gsB = new THREE.Group();
    gsB.position.set(40, 0, -108);
    for (let tier = 0; tier < 4; tier++) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(20, 0.7, 1.4), this.defaultMats.blue);
      bench.position.set(0, 0.7 + tier * 1.0, tier * 1.2);
      gsB.add(bench);
    }
    gsGroup.add(gsB);

    this.engine.scene.add(gsGroup);
    this.buildings.push(gsGroup);
  }

  // 7. 5 Animated Formula 1 Race Cars Racing Around Monaco
  private createF1Cars() {
    this.f1Cars = [];

    const f1Teams = [
      { name: "Scuderia Ferrari", bodyColor: this.defaultMats.red, accentColor: this.defaultMats.black, speed: 0.076, progress: 0.05 },
      { name: "Red Bull Racing", bodyColor: this.defaultMats.blue, accentColor: this.defaultMats.orange, speed: 0.078, progress: 0.25 },
      { name: "Mercedes-AMG", bodyColor: this.defaultMats.cyan, accentColor: this.defaultMats.black, speed: 0.075, progress: 0.45 },
      { name: "McLaren F1", bodyColor: this.defaultMats.orange, accentColor: this.defaultMats.black, speed: 0.077, progress: 0.65 },
      { name: "Aston Martin", bodyColor: this.defaultMats.green, accentColor: this.defaultMats.orange, speed: 0.074, progress: 0.85 },
    ];

    f1Teams.forEach((team) => {
      const carGroup = new THREE.Group();

      // Sleek Formula 1 Chassis Monocoque
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.42, 2.2, 4), team.bodyColor);
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, 0.32, 1.1);

      const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.48, 1.8), team.bodyColor);
      cockpit.position.set(0, 0.38, -0.2);

      const sidepodL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 1.4), team.bodyColor);
      sidepodL.position.set(-0.55, 0.35, -0.2);
      const sidepodR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 1.4), team.bodyColor);
      sidepodR.position.set(0.55, 0.35, -0.2);

      // Driver Helmet & Halo titanium safety bar
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), team.accentColor);
      helmet.position.set(0, 0.68, -0.1);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 6, 8, Math.PI), this.defaultMats.black);
      halo.position.set(0, 0.72, 0.05);
      halo.rotation.x = -Math.PI / 4;

      // Engine Airbox scoop and Dorsal Shark Fin
      const airbox = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.6), team.bodyColor);
      airbox.position.set(0, 0.82, -0.55);
      const sharkFin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 1.2), team.accentColor);
      sharkFin.position.set(0, 0.75, -1.0);

      // Aerodynamic Front Wing with Endplates
      const frontWing = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 0.55), team.accentColor);
      frontWing.position.set(0, 0.18, 2.1);
      const fwEndL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.6), team.accentColor);
      fwEndL.position.set(-1.05, 0.28, 2.1);
      const fwEndR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.6), team.accentColor);
      fwEndR.position.set(1.05, 0.28, 2.1);

      // High-Downforce Rear Wing with Endplates
      const rearWing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.5), team.accentColor);
      rearWing.position.set(0, 0.95, -1.7);
      const rwEndL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.65), team.accentColor);
      rwEndL.position.set(-0.8, 0.75, -1.7);
      const rwEndR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.65), team.accentColor);
      rwEndR.position.set(0.8, 0.75, -1.7);

      // Rear Rain / ERS Blinking Safety Light
      const rearLight = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.15), this.defaultMats.red);
      rearLight.position.set(0, 0.42, -1.92);

      // Titanium Skid Plate Spark Trail Mesh
      const spark = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.4, 4), this.defaultMats.orange);
      spark.position.set(0, 0.12, -2.5);
      spark.rotation.x = -Math.PI / 2;
      spark.visible = false;

      carGroup.add(
        nose,
        cockpit,
        sidepodL,
        sidepodR,
        helmet,
        halo,
        airbox,
        sharkFin,
        frontWing,
        fwEndL,
        fwEndR,
        rearWing,
        rwEndL,
        rwEndR,
        rearLight,
        spark
      );

      // 4 Pirelli Slick Tires on Wishbone Suspension Arms
      const wheels: THREE.Mesh[] = [];
      const wheelPositions = [
        { x: -0.92, y: 0.35, z: 1.2, r: 0.38, w: 0.34 }, // Front Left
        { x: 0.92, y: 0.35, z: 1.2, r: 0.38, w: 0.34 },  // Front Right
        { x: -0.96, y: 0.40, z: -1.2, r: 0.42, w: 0.42 }, // Rear Left (Wider)
        { x: 0.96, y: 0.40, z: -1.2, r: 0.42, w: 0.42 },  // Rear Right (Wider)
      ];

      wheelPositions.forEach((wp) => {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(wp.r, wp.r, wp.w, 14),
          this.defaultMats.black
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wp.x, wp.y, wp.z);

        // Colored Pirelli Tire Sidewall Pinstripe
        const pzero = new THREE.Mesh(new THREE.CylinderGeometry(wp.r * 0.75, wp.r * 0.75, wp.w + 0.02, 10), team.accentColor);
        pzero.position.set(0, 0, 0);
        wheel.add(pzero);

        carGroup.add(wheel);
        wheels.push(wheel);
      });

      this.engine.scene.add(carGroup);
      this.f1Cars.push({
        group: carGroup,
        speed: team.speed,
        progress: team.progress,
        wheels,
        frontWheels: [wheels[0], wheels[1]],
        rearLight,
        spark,
        name: team.name,
      });
    });
  }

  private createPalmTree(x: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Slender curved trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 5.2, 8), this.defaultMats.orange);
    trunk.position.set(0, 2.6, 0);
    trunk.rotation.z = 0.08;
    group.add(trunk);

    // 6 Radiating Palm Fronds
    for (let f = 0; f < 6; f++) {
      const angle = (f / 6) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.7), this.defaultMats.green);
      frond.position.set(Math.cos(angle) * 1.2, 5.0, Math.sin(angle) * 1.2);
      frond.rotation.y = angle;
      frond.rotation.z = -0.35;
      group.add(frond);
    }

    return group;
  }

  private createMonacoAtmosphere() {
    this.createAtmosphere();
  }

  // Animation Update Loop: Vehicles, F1 cars, Subway train, Yachts, Clouds, Paper airplane, Steaming manholes
  public update(delta: number) {
    // 0. Animate Secret Collectibles (Spinning & Floating)
    const nowSecTime = performance.now() / 1000;
    this.secrets.forEach((s) => {
      if (!s.collected && s.mesh) {
        s.mesh.rotation.y += delta * 2.5;
        s.mesh.position.y = s.position.y + Math.sin(nowSecTime * 3 + s.position.x) * 0.22;
      }
    });

    // 1. Move Yellow Cabs along streets (in NYC)
    this.trafficCars.forEach((car) => {
      const moveStep = car.direction * car.speed * delta;
      if (car.axis === "x") {
        car.group.position.x += moveStep;
        if (car.direction > 0 && car.group.position.x > car.max) car.group.position.x = car.min;
        if (car.direction < 0 && car.group.position.x < car.min) car.group.position.x = car.max;
      } else {
        car.group.position.z += moveStep;
        if (car.direction > 0 && car.group.position.z > car.max) car.group.position.z = car.min;
        if (car.direction < 0 && car.group.position.z < car.min) car.group.position.z = car.max;
      }

      // Spin wheels
      car.wheels.forEach((w) => {
        w.rotation.x += car.speed * delta * 2.5;
      });
    });

    // 2. Animate Monaco F1 race cars along the track
    if (this.f1TrackCurve && this.f1Cars.length > 0) {
      const time = performance.now() / 1000;
      this.f1Cars.forEach((car) => {
        car.progress = (car.progress + car.speed * delta) % 1.0;
        const pos = this.f1TrackCurve!.getPointAt(car.progress);
        const tangent = this.f1TrackCurve!.getTangentAt(car.progress);
        car.group.position.copy(pos);
        const lookTarget = pos.clone().add(tangent);
        car.group.lookAt(lookTarget);

        // Dynamic Front Wheel Steering Angle based on corner curve
        const nextTangent = this.f1TrackCurve!.getTangentAt((car.progress + 0.02) % 1.0);
        const steerSign = tangent.x * nextTangent.z - tangent.z * nextTangent.x;
        const steerAngle = THREE.MathUtils.clamp(steerSign * 8.0, -0.45, 0.45);
        if (car.frontWheels.length >= 2) {
          car.frontWheels[0].rotation.y = steerAngle;
          car.frontWheels[1].rotation.y = steerAngle;
        }

        // Spin Wheels
        car.wheels.forEach((w) => {
          w.rotation.x += car.speed * delta * 55;
        });

        // Blinking Red Rain/ERS Safety LED
        if (car.rearLight) {
          car.rearLight.visible = Math.sin(time * 26) > 0;
        }

        // Titanium Skid Plate Sparks on High-Speed Straightaways (Pit Straight & Tunnel Exit)
        const isHighSpeed = (car.progress > 0.95 || car.progress < 0.22) || (car.progress > 0.58 && car.progress < 0.68);
        if (car.spark) {
          car.spark.visible = isHighSpeed && Math.random() > 0.35;
          if (car.spark.visible) {
            const ss = 0.8 + Math.random() * 0.6;
            car.spark.scale.set(ss, ss * (1.0 + Math.random() * 0.8), ss);
          }
        }
      });
    }

    // 3. Gentle bobbing of luxury superyachts in Monaco harbor & spinning radars
    if (this.yachts.length > 0) {
      const time = performance.now() / 1000;
      this.yachts.forEach((yacht, i) => {
        yacht.position.y = (yacht.userData.baseY || 0) + Math.sin(time * 1.6 + i * 1.2) * 0.07;
        yacht.rotation.z = Math.sin(time * 1.2 + i * 0.9) * 0.012;
      });

      this.yachtRadars.forEach((radar) => {
        radar.rotation.y += 3.2 * delta;
      });
    }

    // 4. Animate High-Speed Yacht Tender / Speedboat in Port Hercule
    if (this.tenderBoat) {
      this.tenderBoat.progress = (this.tenderBoat.progress + this.tenderBoat.speed * delta) % 1.0;
      const angle = this.tenderBoat.progress * Math.PI * 2;
      const tx = -25 + Math.cos(angle) * 36;
      const tz = 14 + Math.sin(angle * 2) * 12;
      const nextAngle = (this.tenderBoat.progress + 0.01) * Math.PI * 2;
      const ntx = -25 + Math.cos(nextAngle) * 36;
      const ntz = 14 + Math.sin(nextAngle * 2) * 12;

      this.tenderBoat.group.position.set(tx, 0.12 + Math.sin(angle * 4) * 0.03, tz);
      this.tenderBoat.group.lookAt(ntx, 0.12, ntz);

      // Pulse and scale water wake
      const wakeScale = 1.0 + Math.sin(angle * 6) * 0.2;
      this.tenderBoat.wake.scale.set(wakeScale, 1.0, wakeScale);
    }

    // 5. Animate Walking NYC Pedestrians
    if (this.pedestrians.length > 0) {
      const time = performance.now() / 1000;
      this.pedestrians.forEach((p, idx) => {
        const step = p.dir * p.speed * delta;
        if (p.axis === "x") {
          p.group.position.x += step;
          if (p.dir > 0 && p.group.position.x > p.max) {
            p.dir = -1;
            p.group.rotation.y = -Math.PI / 2;
          } else if (p.dir < 0 && p.group.position.x < p.min) {
            p.dir = 1;
            p.group.rotation.y = Math.PI / 2;
          }
        } else {
          p.group.position.z += step;
          if (p.dir > 0 && p.group.position.z > p.max) {
            p.dir = -1;
            p.group.rotation.y = Math.PI;
          } else if (p.dir < 0 && p.group.position.z < p.min) {
            p.dir = 1;
            p.group.rotation.y = 0;
          }
        }

        // Bob torso and swing legs
        const walkPhase = time * 7 + idx * 1.5;
        p.group.position.y = 0.16 + Math.abs(Math.sin(walkPhase)) * 0.06;
        if (p.legs.length >= 2) {
          p.legs[0].rotation.x = Math.sin(walkPhase) * 0.45;
          p.legs[1].rotation.x = -Math.sin(walkPhase) * 0.45;
        }
      });
    }

    // 6. Animate High Line Subway Train
    if (this.subwayTrain) {
      this.trainProgress += 24 * delta;
      if (this.trainProgress > 105) this.trainProgress = -105;
      this.subwayTrain.position.x = this.trainProgress;
    }

    // 7. Drift clouds across the sky
    this.clouds.forEach((cloud) => {
      cloud.position.x += 2.2 * delta;
      if (cloud.position.x > 250) cloud.position.x = -250;
    });

    // 8. Bank and orbit the folded doodle paper airplane
    if (this.paperAirplane) {
      this.airplaneAngle += 0.14 * delta;
      const r = 110;
      this.paperAirplane.position.x = Math.cos(this.airplaneAngle) * r;
      this.paperAirplane.position.z = Math.sin(this.airplaneAngle) * r;
      this.paperAirplane.position.y = 52 + Math.sin(this.airplaneAngle * 2) * 3.5;
      this.paperAirplane.rotation.y = -this.airplaneAngle + Math.PI / 2;
      this.paperAirplane.rotation.z = Math.cos(this.airplaneAngle * 2) * 0.18;
    }

    // 9. Animate steaming manholes
    this.steamPuffs.forEach((puff) => {
      const t = performance.now() / 1000 + puff.timeOffset;
      puff.mesh.position.y = puff.basePos.y + (t % 1.6) * 1.2;
      const s = 1.0 + (t % 1.6) * 0.8;
      puff.mesh.scale.set(s, s, s);
    });
  }

  // Pointer click detection for billboards & placement
  public handlePointerClick(event: MouseEvent): AdSpace | null {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.engine.camera);

    const adMeshes = Array.from(this.adSpaces.values()).map((a) => a.mesh);
    const intersects = this.raycaster.intersectObjects(adMeshes, true);

    if (intersects.length > 0) {
      let hitObj: THREE.Object3D | null = intersects[0].object;
      while (hitObj && !hitObj.userData.isAdSpace) {
        hitObj = hitObj.parent;
      }

      if (hitObj && hitObj.userData.adId) {
        const ad = this.adSpaces.get(hitObj.userData.adId);
        if (ad) {
          this.selectedAdSpace = ad;
          doodleAudio.penClick();
          return ad;
        }
      }
    }

    if (this.buildTool !== "select" && this.buildTool !== "demolish") {
      const groundHits = this.raycaster.intersectObject(this.groundPlane);
      if (groundHits.length > 0) {
        const pt = groundHits[0].point;
        const gx = Math.round(pt.x / 4) * 4;
        const gz = Math.round(pt.z / 4) * 4;

        this.placeBuilding(this.buildTool, gx, gz);
        doodleAudio.placeBlock();
      }
    }

    return null;
  }

  public leaseAdSpace(
    adId: string,
    inputs: { sponsorName: string; sponsorTagline: string; accentColor: string }
  ): boolean {
    const ad = this.adSpaces.get(adId);
    if (!ad) return false;

    ad.sponsorName = inputs.sponsorName;
    ad.sponsorTagline = inputs.sponsorTagline;
    ad.accentColor = inputs.accentColor;
    ad.isAvailable = false;

    this.redrawBillboard(ad);
    doodleAudio.rentAd();
    return true;
  }

  public spawnDistrictSecrets(district: string) {
    // Clear existing secret meshes
    this.secrets.forEach((s) => {
      if (s.mesh) this.engine.scene.remove(s.mesh);
    });
    this.secrets = [];

    const secretDefs: Record<string, { id: string; name: string; pos: [number, number, number] }[]> = {
      nyc: [
        { id: "nyc_vault", name: "🗝️ 34th St Rooftop Vault Key", pos: [12, 10.0, 18] },
        { id: "nyc_metro", name: "🚇 Wall St Golden Metrocard", pos: [14, 1.2, 206] },
        { id: "nyc_capsule", name: "🌲 Central Park Time Capsule", pos: [-6, 1.5, -140] },
      ],
      monaco: [
        { id: "monaco_chip", name: "👑 Casino Royale Diamond Chip", pos: [-45, 1.8, 0] },
        { id: "monaco_trophy", name: "🏆 Grand Prix Winner's Trophy", pos: [0, 1.8, 58] },
        { id: "monaco_anchor", name: "⚓ Port Hercule Golden Anchor", pos: [-95, 1.5, 40] },
      ],
      neon: [
        { id: "neon_deck", name: "💾 Cyberpunk Zero-Day Deck", pos: [-18, 1.5, -22] },
        { id: "neon_core", name: "⚡ Nexus Holo-Core", pos: [0, 1.8, 0] },
      ],
      oldtown: [
        { id: "oldtown_gear", name: "🕰️ Master Clockwork Gear", pos: [0, 1.8, -32] },
        { id: "oldtown_coin", name: "⛲ Renaissance Wish Coin", pos: [0, 2.0, 16] },
      ],
      waterfront: [
        { id: "waterfront_sextant", name: "🌊 Captain's Brass Sextant", pos: [-20, 2.0, 25] },
        { id: "waterfront_lens", name: "💡 Lighthouse Keeper's Lens", pos: [50, 1.8, -30] },
      ],
    };

    const defs = secretDefs[district] || [];
    defs.forEach((def) => {
      const isCollected = this.collectedSecrets.has(def.id);
      const secret: DoodleSecret = {
        id: def.id,
        district,
        name: def.name,
        position: new THREE.Vector3(...def.pos),
        collected: isCollected,
      };

      if (!isCollected) {
        const sGroup = new THREE.Group();
        sGroup.position.copy(secret.position);
        const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), this.defaultMats.orange);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 8, 16), this.defaultMats.cyan);
        ring.rotation.x = Math.PI / 3;
        sGroup.add(core, ring);
        sGroup.userData.noCollision = true;
        this.engine.scene.add(sGroup);
        secret.mesh = sGroup;
      }
      this.secrets.push(secret);
    });
  }

  public spawnAllSecrets() {
    // Clear existing secret meshes
    this.secrets.forEach((s) => {
      if (s.mesh) this.engine.scene.remove(s.mesh);
    });
    this.secrets = [];

    const allSecretDefs: { id: string; district: string; name: string; pos: [number, number, number] }[] = [
      // 1. Downtown
      { id: "downtown_vault", district: "downtown", name: "🗝️ 34th St Rooftop Vault Key", pos: [-70, 10.0, 18] },
      { id: "downtown_bull", district: "downtown", name: "🐂 Golden Bull of Wall Street", pos: [-72, 1.2, -10] },
      // 2. Entertainment
      { id: "ent_pass", district: "entertainment", name: "🎟️ Golden VIP Backstage Pass", pos: [70, 1.5, 10] },
      { id: "ent_arcade", district: "entertainment", name: "🕹️ Pixel Palace High-Score Cartridge", pos: [106, 1.5, 24] },
      // 3. Market
      { id: "market_spoon", district: "market", name: "🍜 Golden Ramen Spoon of Fortune", pos: [0, 1.5, -40] },
      { id: "market_compass", district: "market", name: "🧭 Merchant's Antique Brass Compass", pos: [-18, 1.5, -50] },
      // 4. Old Town
      { id: "oldtown_gear", district: "oldtown", name: "🕰️ Master Belfry Clockwork Gear", pos: [-70, 1.8, -158] },
      { id: "oldtown_coin", district: "oldtown", name: "⛲ Renaissance Fountain Wish Coin", pos: [-70, 2.0, -118] },
      // 5. Neon City
      { id: "neon_deck", district: "neon", name: "💾 Cyberpunk Zero-Day Cyberdeck", pos: [52, 1.5, -152] },
      { id: "neon_core", district: "neon", name: "⚡ Nexus Holo-Spire Data Core", pos: [70, 1.8, -130] },
      // 6. Residential Hills
      { id: "hills_astrolabe", district: "hills", name: "🔭 Hilltop Observatory Brass Astrolabe", pos: [0, 26.8, -285] },
      { id: "hills_rose", district: "hills", name: "🌹 Secret Villa Garden Golden Rose", pos: [30, 15.5, -225] },
      // 7. Cloud District
      { id: "cloud_feather", district: "cloud", name: "🪶 Stratospheric Nimbus Golden Feather", pos: [0, 81.8, -340] },
      { id: "cloud_token", district: "cloud", name: "🚁 Skyway Helipad Master Token", pos: [45, 126.8, -340] },
      // 8. University
      { id: "uni_scroll", district: "university", name: "📜 Grand Library Ancient Blueprint Scroll", pos: [-170, 1.8, 40] },
      { id: "uni_medal", district: "university", name: "🎨 Creative Arts Academy Gold Medal", pos: [-170, 5.0, 82] },
      // 9. Monaco GP
      { id: "monaco_trophy", district: "monaco", name: "🏆 Grand Prix Winner's Golden Trophy", pos: [170, 1.8, 108] },
      { id: "monaco_flag", district: "monaco", name: "🏁 Coastal Paddock Checkered Flag", pos: [145, 1.8, 50] },
      // 10. Industrial
      { id: "ind_wrench", district: "industrial", name: "🔧 Titanium Gantry Crane Wrench", pos: [-180, 1.8, 225] },
      { id: "ind_valve", district: "industrial", name: "⚙️ High-Pressure Steam Boiler Valve", pos: [-145, 1.8, 190] },
      // 11. Underground
      { id: "und_keycard", district: "underground", name: "💳 Subterranean Transit Master Keycard", pos: [0, -14.5, 75] },
      { id: "und_crystal", district: "underground", name: "💎 Forgotten Metro Tunnel Crystal", pos: [-35, -14.5, 115] },
      // 12. Waterfront
      { id: "water_pearl", district: "waterfront", name: "🦪 Ocean Boardwalk Golden Pearl Shell", pos: [-60, 2.0, 325] },
      { id: "water_lens", district: "waterfront", name: "💡 Lighthouse Keeper's Prismatic Lens", pos: [-22, 1.8, 275] },
      // 13. Port
      { id: "port_manifest", district: "port", name: "📋 Golden Shipping Container Manifest", pos: [125, 1.8, 300] },
      { id: "port_anchor", district: "port", name: "⚓ Dockside Anchor of Prosperity", pos: [55, 1.8, 300] },
      // 14. Airport
      { id: "air_wings", district: "airport", name: "✈️ Supersonic Aviator's Golden Wings", pos: [-85, 3.5, 415] },
      { id: "air_badge", district: "airport", name: "📡 Air Traffic Radar Operator's Badge", pos: [-12, 1.8, 395] },
      // 15. Secret Core
      { id: "secret_fountain_pen", district: "secret", name: "🖋️ The Creator's Colossal Fountain Pen", pos: [0, -23.5, -340] },
      { id: "secret_seed", district: "secret", name: "✨ Infinite Blueprint Drafting Seed", pos: [24, -20.0, -316] },
    ];

    allSecretDefs.forEach((def) => {
      const isCollected = this.collectedSecrets.has(def.id);
      const secret: DoodleSecret = {
        id: def.id,
        district: def.district,
        name: def.name,
        position: new THREE.Vector3(...def.pos),
        collected: isCollected,
      };

      if (!isCollected) {
        const sGroup = new THREE.Group();
        sGroup.position.copy(secret.position);
        const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), this.defaultMats.orange);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 8, 16), this.defaultMats.cyan);
        ring.rotation.x = Math.PI / 3;
        sGroup.add(core, ring);
        sGroup.userData.noCollision = true;
        this.engine.scene.add(sGroup);
        secret.mesh = sGroup;
      }
      this.secrets.push(secret);
    });
  }

  public checkSecretsProximity(playerPos: THREE.Vector3, onDiscover?: (secret: DoodleSecret) => void): void {
    for (let i = 0; i < this.secrets.length; i++) {
      const s = this.secrets[i];
      if (s.collected) continue;
      const dist = s.position.distanceTo(playerPos);
      if (dist < 3.2) {
        s.collected = true;
        this.collectedSecrets.add(s.id);
        if (s.mesh) {
          this.engine.scene.remove(s.mesh);
        }
        doodleAudio.discoveryChime();
        if (onDiscover) {
          onDiscover(s);
        }
      }
    }
  }

  public getCityMetrics() {
    let totalRevenue = 0;
    let totalViews = 0;
    let totalSpaces = this.adSpaces.size;
    let rentedSpaces = 0;

    for (const ad of this.adSpaces.values()) {
      totalViews += ad.viewsMonthly;
      if (!ad.isAvailable) {
        totalRevenue += ad.priceMonthly;
        rentedSpaces++;
      }
    }

    return {
      totalRevenue,
      totalViews,
      totalSpaces,
      rentedSpaces,
      occupancyPct: totalSpaces > 0 ? Math.round((rentedSpaces / totalSpaces) * 100) : 0,
      secretsFound: this.collectedSecrets.size,
      totalSecrets: Math.max(30, this.secrets.length),
    };
  }
}
