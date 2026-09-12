import * as THREE from "three";
import { DoodleEngine, INK_COLORS } from "./DoodleEngine";
import { doodleAudio } from "./DoodleAudio";

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

export class CityBuilder {
  public engine: DoodleEngine;
  public adSpaces: Map<string, AdSpace> = new Map();
  public buildings: THREE.Group[] = [];
  public selectedAdSpace: AdSpace | null = null;
  public buildTool: BuildingType | "select" | "demolish" = "select";
  public currentDistrict: "tech" | "indie" = "tech";

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private groundPlane: THREE.Mesh;
  private trafficCars: TrafficVehicle[] = [];
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

    // Ground Plane with Notebook Grid
    const groundGeo = new THREE.PlaneGeometry(180, 180, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = engine.createDoodleMaterial({ ink: INK_COLORS.BLACK, fill: false, shadeBias: 0.18 });
    this.groundPlane = new THREE.Mesh(groundGeo, groundMat);
    this.groundPlane.position.y = 0;
    this.engine.scene.add(this.groundPlane);

    this.buildNewYorkCity();
  }

  // Master method: Builds the authentic, fully detailed New York City
  public buildNewYorkCity() {
    this.createManhattanStreetGrid();
    this.createEmpireStateBuilding(-36, 14);
    this.createChryslerBuilding(36, -24);
    this.createFlatironBuilding(0, -6);
    this.createTimesSquareCanyon(16, -6);
    this.createBrownstoneRow(-36, -20);
    this.createHighLineElevatedTrain(46);
    this.createCentralPark(-14, 38);
    this.createSubwayEntrances();
    this.createNYCYellowCabs();
    this.createStreetFurniture();
    this.createAtmosphere();
  }

  // 1. Authentic Manhattan Grid: 5th Ave, Broadway, 42nd St & 34th St with Crosswalks & Cellar Doors
  private createManhattanStreetGrid() {
    const gridGroup = new THREE.Group();
    const streetMat = this.defaultMats.blue;
    const dashMat = this.defaultMats.blue;
    const curbMat = this.defaultMats.black;

    // Avenues (North-South, Z axis)
    const avenues = [
      { x: -16, width: 8.5, name: "5th Avenue" },
      { x: 16, width: 8.5, name: "Broadway" },
    ];

    // Cross Streets (East-West, X axis)
    const streets = [
      { z: -24, width: 7.5, name: "42nd Street" },
      { z: 14, width: 7.5, name: "34th Street" },
      { z: 46, width: 7.5, name: "Houston Street" },
    ];

    // Perimeter boundary line
    const border = new THREE.Mesh(new THREE.BoxGeometry(150, 0.08, 150), streetMat);
    gridGroup.add(border);

    // Render Avenues with Dashed Lines
    avenues.forEach((ave) => {
      const road = new THREE.Mesh(new THREE.BoxGeometry(ave.width, 0.04, 144), streetMat);
      road.position.set(ave.x, 0.02, 0);
      gridGroup.add(road);

      // Yellow/doodle double center line dashes
      for (let z = -65; z <= 65; z += 4) {
        const d1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 1.8), this.defaultMats.orange);
        d1.position.set(ave.x - 0.2, 0.035, z);
        const d2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 1.8), this.defaultMats.orange);
        d2.position.set(ave.x + 0.2, 0.035, z);
        gridGroup.add(d1, d2);
      }
    });

    // Render Cross Streets with Dashed Lines
    streets.forEach((st) => {
      const road = new THREE.Mesh(new THREE.BoxGeometry(144, 0.04, st.width), streetMat);
      road.position.set(0, 0.02, st.z);
      gridGroup.add(road);

      for (let x = -65; x <= 65; x += 4) {
        const d = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.25), dashMat);
        d.position.set(x, 0.035, st.z);
        gridGroup.add(d);
      }

      // Zebra crosswalks at each Avenue intersection
      avenues.forEach((ave) => {
        const offsets = [-ave.width / 2 - 2.5, ave.width / 2 + 2.5];
        offsets.forEach((off) => {
          for (let b = -st.width / 2 + 0.8; b <= st.width / 2 - 0.8; b += 1.1) {
            const zebra = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.55), dashMat);
            zebra.position.set(ave.x + off, 0.036, st.z + b);
            gridGroup.add(zebra);
          }
        });
      });
    });

    // Sidewalk Curbs (Raised stone edges)
    const blocks = [
      { x: -38, z: -5, w: 32, d: 26 },
      { x: 38, z: -5, w: 32, d: 26 },
      { x: -38, z: 30, w: 32, d: 20 },
      { x: 38, z: 30, w: 32, d: 20 },
      { x: 0, z: -5, w: 20, d: 26 },
      { x: 0, z: 30, w: 20, d: 20 },
    ];

    blocks.forEach((blk) => {
      const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(blk.w, 0.16, blk.d), this.defaultMats.black);
      sidewalk.position.set(blk.x, 0.08, blk.z);
      gridGroup.add(sidewalk);

      // Flagstone grid seams
      for (let sx = -blk.w / 2 + 4; sx < blk.w / 2; sx += 4) {
        const seam = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.17, blk.d), this.defaultMats.blue);
        seam.position.set(blk.x + sx, 0.085, blk.z);
        gridGroup.add(seam);
      }
      for (let sz = -blk.d / 2 + 4; sz < blk.d / 2; sz += 4) {
        const seam = new THREE.Mesh(new THREE.BoxGeometry(blk.w, 0.17, 0.08), this.defaultMats.blue);
        seam.position.set(blk.x, 0.085, blk.z + sz);
        gridGroup.add(seam);
      }

      // Classic NYC angled metal cellar doors along sidewalk front
      const cellarL = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 1.4), curbMat);
      cellarL.position.set(blk.x + blk.w / 2 - 2.5, 0.18, blk.z + blk.d / 2 - 1.2);
      cellarL.rotation.x = -0.15;
      gridGroup.add(cellarL);
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

    // Grand Entrance Arch
    const arch = new THREE.Mesh(new THREE.BoxGeometry(5.5, 7, 0.8), this.defaultMats.black);
    arch.position.set(0, 3.5, 9.1);
    group.add(arch);

    // Setback Tier 1 (Floor 7-18)
    const t1H = 12;
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(13.5, t1H, 13.5), this.defaultMats.blue);
    tier1.position.y = baseH + t1H / 2;
    group.add(tier1);

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

    // Base podium
    const baseH = 15;
    const base = new THREE.Mesh(new THREE.BoxGeometry(16, baseH, 16), this.defaultMats.blue);
    base.position.y = baseH / 2;
    group.add(base);

    // Tower Shaft
    const shaftH = 16;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(11, shaftH, 11), this.defaultMats.blue);
    shaft.position.y = baseH + shaftH / 2;
    group.add(shaft);

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
      const windowBand = new THREE.Mesh(new THREE.BoxGeometry(r * 1.6, 0.8, r * 1.6), this.defaultMats.black);
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

  // 7. The High Line Elevated Train Line & Subway Car
  public createHighLineElevatedTrain(z: number) {
    const group = new THREE.Group();
    group.position.set(0, 0, z);

    const trestleH = 8.5;
    const length = 130;

    // Heavy Riveted Steel Support Bents every 14m
    for (let px = -56; px <= 56; px += 14) {
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
    for (let tx = -60; tx <= 60; tx += 1.8) {
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

    // Overpass Highway Ad Billboard
    const bb = this.createAdBillboardMesh(this.initialAdConfigs[5], 11.5, 4.8, group);
    bb.position.set(0, trestleH + 5.2, 3.6);
    group.add(bb);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 8. Central Park Green Pocket: Stone Walls, Winding Paths, Benches & Hand-Drawn Trees
  public createCentralPark(x: number, z: number) {
    const parkGroup = new THREE.Group();
    parkGroup.position.set(x, 0, z);

    // Low Stone Perimeter Wall
    const wallMat = this.defaultMats.black;
    const wallF = new THREE.Mesh(new THREE.BoxGeometry(22, 0.9, 0.4), wallMat);
    wallF.position.set(0, 0.45, -12);
    const wallB = new THREE.Mesh(new THREE.BoxGeometry(22, 0.9, 0.4), wallMat);
    wallB.position.set(0, 0.45, 12);
    parkGroup.add(wallF, wallB);

    // Meandering Paved Path
    const path = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.05, 22), this.defaultMats.black);
    path.position.set(0, 0.03, 0);
    path.rotation.y = 0.25;
    parkGroup.add(path);

    // Park Benches (Wood slats with black iron armrests)
    const benchCoords = [[-4, -5, 0], [4, 5, Math.PI], [-5, 6, -Math.PI / 2]];
    benchCoords.forEach(([bx, bz, brot]) => {
      const bench = new THREE.Group();
      bench.position.set(bx, 0, bz);
      bench.rotation.y = brot;

      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 0.6), this.defaultMats.orange);
      seat.position.set(0, 0.6, 0);
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 0.1), this.defaultMats.orange);
      back.position.set(0, 1.0, -0.28);
      const legs = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 0.5), this.defaultMats.black);
      legs.position.set(0, 0.3, 0);

      bench.add(seat, back, legs);
      parkGroup.add(bench);
    });

    // Hand-Drawn Doodle Trees in the Park (Crisp green ballpoint pen outlines!)
    const parkTrees = [
      [-6, -7, false], [6, -8, false], [-7, 3, true],
      [7, 4, false], [-3, 8, false], [5, 8, false]
    ];
    parkTrees.forEach(([tx, tz, isCyan]) => {
      const tree = this.createDoodleTree(tx, tz, Boolean(isCyan));
      parkGroup.add(tree);
    });

    this.engine.scene.add(parkGroup);
    this.buildings.push(parkGroup);
    return parkGroup;
  }

  // 9. Subway Entrances (Iconic green globe lampposts & descending stairs)
  private createSubwayEntrances() {
    const subGroup = new THREE.Group();

    const entrances = [
      { x: -11, z: 12, rot: 0 },
      { x: 11, z: -20, rot: Math.PI },
      { x: 11, z: 12, rot: -Math.PI / 2 },
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

    // Street Kiosks at subway corners
    const kiosk1 = this.createStreetKiosk(-12, 18, 7);
    const kiosk2 = this.createStreetKiosk(12, -28, 8);
    subGroup.add(kiosk1, kiosk2);

    this.engine.scene.add(subGroup);
  }

  // 10. NYC Yellow Cabs with Medallion Roof Signs & Delivery Trucks
  private createNYCYellowCabs() {
    const lanes = [
      { axis: "z" as const, fixedX: -14, dir: 1, min: -65, max: 65, speed: 13, isTaxi: true },
      { axis: "z" as const, fixedX: -18, dir: -1, min: -65, max: 65, speed: 15, isTaxi: true },
      { axis: "z" as const, fixedX: 14, dir: 1, min: -65, max: 65, speed: 12, isTaxi: true },
      { axis: "z" as const, fixedX: 18, dir: -1, min: -65, max: 65, speed: 14, isTaxi: false }, // Delivery truck
      { axis: "x" as const, fixedZ: -24, dir: 1, min: -65, max: 65, speed: 11, isTaxi: true },
      { axis: "x" as const, fixedZ: 14, dir: -1, min: -65, max: 65, speed: 13, isTaxi: true },
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
        carGroup.position.set(lane.fixedX, 0, lane.min + idx * 22);
        if (lane.dir < 0) carGroup.rotation.y = Math.PI;
      } else {
        carGroup.position.set(lane.min + idx * 22, 0, lane.fixedZ);
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
    const hydrants = [[-11, -21], [11, -21], [-11, 11], [11, 11], [-11, 43], [11, 43]];
    hydrants.forEach(([hx, hz]) => {
      const hyd = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.9), this.defaultMats.red);
      hyd.position.set(hx, 0.45, hz);
      furnGroup.add(hyd);
    });

    // Gooseneck Streetlamps along sidewalks
    const lamps = [
      [-11, -30], [-11, -12], [-11, 6], [-11, 24],
      [11, -30], [11, -12], [11, 6], [11, 24],
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
    const manholes = [[-16, -10], [16, 2], [0, 14]];
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
      { x: -55, y: 52, z: -35, scale: 1.3 },
      { x: 35, y: 56, z: -55, scale: 1.5 },
      { x: -15, y: 48, z: 45, scale: 1.1 },
      { x: 60, y: 50, z: 30, scale: 1.4 },
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
    planeGroup.position.set(0, 38, 0);

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

  // District switcher
  public switchDistrict(district: "tech" | "indie") {
    this.currentDistrict = district;
    this.clearDistrict();
    if (district === "tech") {
      this.buildNewYorkCity();
    } else {
      // Indie Village: Focus on Brownstones, Green Parks, Water Towers, Cafes
      this.createManhattanStreetGrid();
      this.createBrownstoneRow(-38, -20);
      this.createBrownstoneRow(-38, 10);
      this.createBrownstoneRow(38, -20);
      this.createBrownstoneRow(38, 10);
      this.createFlatironBuilding(0, -6);
      this.createCentralPark(0, 24);
      this.createCentralPark(-18, -6);
      this.createSubwayEntrances();
      this.createNYCYellowCabs();
      this.createStreetFurniture();
      this.createAtmosphere();
    }
    doodleAudio.scribble();
  }

  private clearDistrict() {
    this.buildings.forEach((b) => this.engine.scene.remove(b));
    this.buildings = [];
    this.adSpaces.clear();
    this.trafficCars.forEach((c) => this.engine.scene.remove(c.group));
    this.trafficCars = [];
    this.clouds.forEach((c) => this.engine.scene.remove(c));
    this.clouds = [];
    if (this.paperAirplane) this.engine.scene.remove(this.paperAirplane);
    this.paperAirplane = null;
    this.steamPuffs = [];
  }

  // Animation Update Loop: Vehicles, Subway train, Clouds, Paper airplane, Steaming manholes
  public update(delta: number) {
    // 1. Move Yellow Cabs along streets and rotate wheels
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

    // 2. Animate High Line Subway Train
    if (this.subwayTrain) {
      this.trainProgress += 16 * delta;
      if (this.trainProgress > 65) this.trainProgress = -65;
      this.subwayTrain.position.x = this.trainProgress;
    }

    // 3. Drift clouds across the sky
    this.clouds.forEach((cloud) => {
      cloud.position.x += 1.6 * delta;
      if (cloud.position.x > 80) cloud.position.x = -80;
    });

    // 4. Bank and orbit the folded doodle paper airplane
    if (this.paperAirplane) {
      this.airplaneAngle += 0.22 * delta;
      const r = 44;
      this.paperAirplane.position.x = Math.cos(this.airplaneAngle) * r;
      this.paperAirplane.position.z = Math.sin(this.airplaneAngle) * r;
      this.paperAirplane.position.y = 38 + Math.sin(this.airplaneAngle * 2) * 2.5;
      this.paperAirplane.rotation.y = -this.airplaneAngle + Math.PI / 2;
      this.paperAirplane.rotation.z = Math.cos(this.airplaneAngle * 2) * 0.18;
    }

    // 5. Animate steaming manholes
    this.steamPuffs.forEach((puff, idx) => {
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
    };
  }
}
