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
  private craneJibArm: THREE.Object3D | null = null;
  private craneAngle = 0;
  private airplaneAngle = 0;

  private defaultMats: {
    blue: THREE.ShaderMaterial;
    blueFill: THREE.ShaderMaterial;
    red: THREE.ShaderMaterial;
    black: THREE.ShaderMaterial;
    orange: THREE.ShaderMaterial;
    green: THREE.ShaderMaterial;
    cyan: THREE.ShaderMaterial;
  };

  // Pre-configured default sponsor listings for rich initial showcase
  private initialAdConfigs = [
    {
      title: "Central Tech Tower - North Rooftop",
      category: "Rooftop Billboard" as const,
      viewsMonthly: 140000,
      priceMonthly: 1200,
      sponsorName: "SUPABASE",
      sponsorTagline: "The Open Source Firebase Alternative",
      accentColor: "#10b981",
      isAvailable: false,
    },
    {
      title: "Indie Hacker Loft - East Wall",
      category: "Wall Banner" as const,
      viewsMonthly: 65000,
      priceMonthly: 450,
      sponsorName: "YOUR BRAND HERE",
      sponsorTagline: "Reach 65K+ active developers monthly",
      accentColor: "#d02030",
      isAvailable: true,
    },
    {
      title: "Highway Overpass Double-Deck",
      category: "Highway Billboard" as const,
      viewsMonthly: 220000,
      priceMonthly: 1850,
      sponsorName: "RAYCAST",
      sponsorTagline: "Your shortcut to everything on Mac",
      accentColor: "#ef4444",
      isAvailable: false,
    },
    {
      title: "Developer Plaza - Digital Kiosk A",
      category: "Street Kiosk" as const,
      viewsMonthly: 35000,
      priceMonthly: 280,
      sponsorName: "POSTHOG",
      sponsorTagline: "The open source Product Analytics suite",
      accentColor: "#3b82f6",
      isAvailable: false,
    },
    {
      title: "Cloud Skyscraper - South Rooftop",
      category: "Rooftop Billboard" as const,
      viewsMonthly: 110000,
      priceMonthly: 950,
      sponsorName: "TURSO",
      sponsorTagline: "SQLite database for developers",
      accentColor: "#06b6d4",
      isAvailable: false,
    },
    {
      title: "Crane Tower - Construction Scaffolding",
      category: "Scaffolding Ad" as const,
      viewsMonthly: 85000,
      priceMonthly: 520,
      sponsorName: "BUILT WHILE BROKE",
      sponsorTagline: "Radical zero-dollar architecture hacks",
      accentColor: "#ea580c",
      isAvailable: false,
    },
    {
      title: "Metro Station Exit Kiosk",
      category: "Street Kiosk" as const,
      viewsMonthly: 48000,
      priceMonthly: 320,
      sponsorName: "AVAILABLE AD SLOT",
      sponsorTagline: "Prime pedestrian foot-traffic",
      accentColor: "#1a30c0",
      isAvailable: true,
    },
    {
      title: "Vercel Plaza Billboard",
      category: "Rooftop Billboard" as const,
      viewsMonthly: 195000,
      priceMonthly: 1600,
      sponsorName: "VERCEL",
      sponsorTagline: "Develop. Preview. Ship.",
      accentColor: "#1a30c0",
      isAvailable: false,
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

    // Ground Plane with Notebook Grid Markings
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = engine.createDoodleMaterial({ ink: INK_COLORS.BLACK, fill: false, shadeBias: 0.15 });
    this.groundPlane = new THREE.Mesh(groundGeo, groundMat);
    this.groundPlane.position.y = 0;
    this.engine.scene.add(this.groundPlane);

    this.createRoadGrid();
    this.createStreetDecorations();
    this.createTrafficVehicles();
    this.createAtmosphere();
    this.seedDistrict("tech");
  }

  // Draw street grid with dashed pen markings and crosswalks
  private createRoadGrid() {
    const roadGroup = new THREE.Group();
    const streetMat = this.engine.createDoodleMaterial({ ink: INK_COLORS.BLUE, fill: false });
    const dashMat = this.engine.createDoodleMaterial({ ink: INK_COLORS.BLUE, fill: false });

    // Perimeter boundary line
    const borderGeo = new THREE.BoxGeometry(140, 0.08, 140);
    const borderMesh = new THREE.Mesh(borderGeo, streetMat);
    roadGroup.add(borderMesh);

    // Cross streets (Avenues & Boulevards)
    const roadWidth = 7.0;
    const roadLines = [-40, -15, 15, 40];

    roadLines.forEach((pos) => {
      // Horizontal Street Asphalt
      const hRoad = new THREE.Mesh(new THREE.BoxGeometry(136, 0.05, roadWidth), streetMat);
      hRoad.position.set(0, 0.02, pos);
      roadGroup.add(hRoad);

      // Horizontal Dashed Center Line
      for (let x = -60; x <= 60; x += 4.5) {
        const dash = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.07, 0.25), dashMat);
        dash.position.set(x, 0.035, pos);
        roadGroup.add(dash);
      }

      // Vertical Street Asphalt
      const vRoad = new THREE.Mesh(new THREE.BoxGeometry(roadWidth, 0.05, 136), streetMat);
      vRoad.position.set(pos, 0.02, 0);
      roadGroup.add(vRoad);

      // Vertical Dashed Center Line
      for (let z = -60; z <= 60; z += 4.5) {
        const dash = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.07, 2.0), dashMat);
        dash.position.set(pos, 0.035, z);
        roadGroup.add(dash);
      }

      // Crosswalks at intersections
      roadLines.forEach((crossPos) => {
        // 4 zebra crosswalk stripes around each intersection
        const offsets = [-4.8, 4.8];
        offsets.forEach((off) => {
          // East-West crosswalk bars
          for (let bar = -2.2; bar <= 2.2; bar += 1.1) {
            const zebra = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.07, 1.8), dashMat);
            zebra.position.set(pos + bar, 0.036, crossPos + off);
            roadGroup.add(zebra);
          }
          // North-South crosswalk bars
          for (let bar = -2.2; bar <= 2.2; bar += 1.1) {
            const zebra = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.07, 0.6), dashMat);
            zebra.position.set(pos + off, 0.036, crossPos + bar);
            roadGroup.add(zebra);
          }
        });
      });
    });

    this.engine.scene.add(roadGroup);
  }

  // Streetlamps and fire hydrants along sidewalks
  private createStreetDecorations() {
    const decorGroup = new THREE.Group();
    const lampCoords = [
      [-19.5, -30], [-19.5, -2], [-19.5, 28],
      [19.5, -30], [19.5, -2], [19.5, 28],
      [-30, -19.5], [-2, -19.5], [28, -19.5],
      [-30, 19.5], [-2, 19.5], [28, 19.5],
    ];

    lampCoords.forEach(([lx, lz]) => {
      // Lamp post pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.5), this.defaultMats.black);
      pole.position.set(lx, 2.75, lz);
      decorGroup.add(pole);

      // Curved arm
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.12), this.defaultMats.black);
      arm.position.set(lx + (lx < 0 ? 0.5 : -0.5), 5.4, lz);
      decorGroup.add(arm);

      // Lamp shade cone
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.4, 6), this.defaultMats.orange);
      shade.position.set(lx + (lx < 0 ? 1.0 : -1.0), 5.2, lz);
      shade.rotation.x = Math.PI;
      decorGroup.add(shade);
    });

    // Fire hydrants at street corners
    const hydrantCoords = [[-11, -11], [11, 11], [-11, 11], [11, -11]];
    hydrantCoords.forEach(([hx, hz]) => {
      const hydrant = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.8), this.defaultMats.red);
      hydrant.position.set(hx, 0.4, hz);
      decorGroup.add(hydrant);
    });

    this.engine.scene.add(decorGroup);
  }

  // Dynamic Doodle Traffic: Yellow Cabs and Commuter Cars cruising along streets
  private createTrafficVehicles() {
    const lanes = [
      { axis: "x" as const, fixedPos: -15, dir: 1, min: -65, max: 65, isTaxi: true, speed: 12 },
      { axis: "x" as const, fixedPos: 15, dir: -1, min: -65, max: 65, isTaxi: false, speed: 10 },
      { axis: "z" as const, fixedPos: -40, dir: 1, min: -65, max: 65, isTaxi: true, speed: 11 },
      { axis: "z" as const, fixedPos: 40, dir: -1, min: -65, max: 65, isTaxi: false, speed: 14 },
    ];

    lanes.forEach((lane, idx) => {
      const carGroup = new THREE.Group();

      // Car Body (Chassis)
      const bodyMat = lane.isTaxi ? this.defaultMats.orange : this.defaultMats.blue;
      const bodyGeo = new THREE.BoxGeometry(3.6, 0.8, 1.8);
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.y = 0.6;
      carGroup.add(bodyMesh);

      // Upper Cabin with Windows
      const cabinGeo = new THREE.BoxGeometry(2.1, 0.7, 1.5);
      const cabinMesh = new THREE.Mesh(cabinGeo, this.defaultMats.black);
      cabinMesh.position.set(-0.2, 1.3, 0);
      carGroup.add(cabinMesh);

      // Taxi Roof Sign
      if (lane.isTaxi) {
        const signGeo = new THREE.BoxGeometry(0.8, 0.3, 0.4);
        const signMesh = new THREE.Mesh(signGeo, this.defaultMats.orange);
        signMesh.position.set(-0.2, 1.8, 0);
        carGroup.add(signMesh);
      }

      // 4 Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 8);
      wheelGeo.rotateX(Math.PI / 2);
      const wheelMat = this.defaultMats.black;

      const wheelPositions = [
        [1.1, 0.35, 0.95],
        [1.1, 0.35, -0.95],
        [-1.1, 0.35, 0.95],
        [-1.1, 0.35, -0.95],
      ];

      wheelPositions.forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(wx, wy, wz);
        carGroup.add(wheel);
      });

      // Position car in lane
      if (lane.axis === "x") {
        carGroup.position.set(lane.min + idx * 30, 0, lane.fixedPos + (lane.dir > 0 ? 1.6 : -1.6));
        if (lane.dir < 0) carGroup.rotation.y = Math.PI;
      } else {
        carGroup.position.set(lane.fixedPos + (lane.dir > 0 ? 1.6 : -1.6), 0, lane.min + idx * 30);
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
      });
    });
  }

  // Floating Doodle Clouds & Gliding Paper Airplane in the sky
  private createAtmosphere() {
    const cloudGroup = new THREE.Group();

    // 4 Drifting Doodle Clouds
    const cloudConfigs = [
      { x: -50, y: 48, z: -40, scale: 1.2 },
      { x: 30, y: 55, z: -60, scale: 1.4 },
      { x: -20, y: 52, z: 50, scale: 1.0 },
      { x: 55, y: 46, z: 35, scale: 1.3 },
    ];

    cloudConfigs.forEach((cfg) => {
      const singleCloud = new THREE.Group();
      singleCloud.position.set(cfg.x, cfg.y, cfg.z);

      // 3 overlapping doodle spheres per cloud
      const puff1 = new THREE.Mesh(new THREE.SphereGeometry(3.5 * cfg.scale, 8, 6), this.defaultMats.blue);
      const puff2 = new THREE.Mesh(new THREE.SphereGeometry(2.6 * cfg.scale, 8, 6), this.defaultMats.blue);
      puff2.position.set(3.2 * cfg.scale, -0.4, 0);
      const puff3 = new THREE.Mesh(new THREE.SphereGeometry(2.4 * cfg.scale, 8, 6), this.defaultMats.blue);
      puff3.position.set(-3.0 * cfg.scale, -0.5, 0);

      singleCloud.add(puff1, puff2, puff3);
      cloudGroup.add(singleCloud);
      this.clouds.push(singleCloud);
    });

    this.engine.scene.add(cloudGroup);

    // Folded Doodle Paper Airplane
    const planeGroup = new THREE.Group();
    planeGroup.position.set(0, 36, 0);

    const wingShape = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, 2.5,   // Nose tip
      -2.4, 0.4, -2.5, // Left wingtip
      0, 0.2, -1.8,    // Central fold

      0, 0, 2.5,   // Nose tip
      0, 0.2, -1.8,    // Central fold
      2.4, 0.4, -2.5,  // Right wingtip

      0, 0, 2.5,   // Keel nose
      0, -0.8, -1.5,   // Keel bottom
      0, 0.2, -1.8,    // Keel rear
    ]);
    wingShape.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    wingShape.computeVertexNormals();

    const planeMesh = new THREE.Mesh(wingShape, this.defaultMats.blue);
    planeGroup.add(planeMesh);
    this.engine.scene.add(planeGroup);
    this.paperAirplane = planeGroup;
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

      // Main CTA
      ctx.font = "bold 44px 'Patrick Hand', cursive, sans-serif";
      ctx.fillStyle = "#1a30c0";
      ctx.fillText(ad.sponsorName || "YOUR AD HERE", 32, 108);

      ctx.font = "24px 'Patrick Hand', cursive, sans-serif";
      ctx.fillStyle = "#27272a";
      ctx.fillText(ad.sponsorTagline || "Click to rent this 3D billboard slot", 32, 150);

      // Metrics Ribbon
      ctx.font = "bold 28px 'Patrick Hand', monospace, sans-serif";
      ctx.fillStyle = "#d02030";
      ctx.fillText(`$${ad.priceMonthly}/mo · ${(ad.viewsMonthly / 1000).toFixed(0)}K views`, 32, 206);
    } else {
      ctx.fillStyle = "#059669";
      ctx.fillText("● VERIFIED TECH SPONSOR", 32, 46);

      // Sponsor Brand
      ctx.font = "bold 48px 'Patrick Hand', cursive, sans-serif";
      ctx.fillStyle = ad.accentColor || "#1a30c0";
      ctx.fillText(ad.sponsorName, 32, 112);

      // Tagline
      ctx.font = "25px 'Patrick Hand', cursive, sans-serif";
      ctx.fillStyle = "#18181b";
      ctx.fillText(ad.sponsorTagline, 32, 156);

      // Bottom impressions verification tag
      ctx.font = "bold 22px 'Patrick Hand', monospace, sans-serif";
      ctx.fillStyle = "#52525b";
      ctx.fillText(`Verified Traffic: ${(ad.viewsMonthly / 1000).toFixed(0)}K monthly views`, 32, 206);
    }

    // Corner doodle pins
    ctx.fillStyle = "#1a30c0";
    [
      [20, 20],
      [w - 20, 20],
      [20, h - 20],
      [w - 20, h - 20],
    ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Create Billboard Mesh with attached AdSpace metadata
  private createAdBillboardMesh(
    adConfig: typeof this.initialAdConfigs[0],
    width: number,
    height: number,
    parentGroup: THREE.Group
  ): THREE.Mesh {
    const { canvas, texture } = this.createBillboardTexture(adConfig);

    // Front ad face
    const billboardGeo = new THREE.PlaneGeometry(width, height);
    const billboardMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const billboardMesh = new THREE.Mesh(billboardGeo, billboardMat);

    // Outline frame with truss depth
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

  // 1. Skyscraper with Setbacks, Antenna Spire & Rooftop Billboard
  public createSkyscraper(x: number, z: number, height = 26, adIndex = 0): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Base Tier
    const baseH = height * 0.65;
    const baseGeo = new THREE.BoxGeometry(11, baseH, 11);
    const baseMesh = new THREE.Mesh(baseGeo, this.defaultMats.blue);
    baseMesh.position.y = baseH / 2;
    group.add(baseMesh);

    // Setback Upper Tier
    const upperH = height * 0.35;
    const upperGeo = new THREE.BoxGeometry(8, upperH, 8);
    const upperMesh = new THREE.Mesh(upperGeo, this.defaultMats.blue);
    upperMesh.position.y = baseH + upperH / 2;
    group.add(upperMesh);

    // Architectural Window Floor Bands
    const floors = Math.floor(height / 3.2);
    for (let f = 1; f < floors; f++) {
      const w = f * 3.2 > baseH ? 8.1 : 11.1;
      const windowLine = new THREE.Mesh(new THREE.BoxGeometry(w, 0.15, w), this.defaultMats.blue);
      windowLine.position.y = f * 3.2;
      group.add(windowLine);
    }

    // Rooftop Antenna Mast with Red Beacon
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 6), this.defaultMats.black);
    mast.position.set(2.5, height + 3.0, 2.5);
    group.add(mast);

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), this.defaultMats.red);
    beacon.position.set(2.5, height + 6.1, 2.5);
    group.add(beacon);

    // Rooftop Billboard Mount Posts
    const mountPostL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3), this.defaultMats.black);
    mountPostL.position.set(-2.8, height + 1.5, 0);
    group.add(mountPostL);

    const mountPostR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3), this.defaultMats.black);
    mountPostR.position.set(2.8, height + 1.5, 0);
    group.add(mountPostR);

    // Rooftop Billboard
    const config = this.initialAdConfigs[adIndex % this.initialAdConfigs.length];
    const billboard = this.createAdBillboardMesh(config, 9.2, 4.6, group);
    billboard.position.set(0, height + 3.2, 0);
    group.add(billboard);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 2. Indie Hacker Loft with Fire Escape Stairs & Rooftop Water Tower
  public createIndieLoft(x: number, z: number, adIndex = 1): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // 3-story brick building
    const loftGeo = new THREE.BoxGeometry(12, 11, 9);
    const loftMesh = new THREE.Mesh(loftGeo, this.defaultMats.blue);
    loftMesh.position.y = 5.5;
    group.add(loftMesh);

    // Fire Escape zigzag balconies on right side wall
    for (let f = 1; f <= 3; f++) {
      const platform = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 3.2), this.defaultMats.black);
      platform.position.set(6.1, f * 3.2, 0);
      group.add(platform);

      const railing = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 3.2), this.defaultMats.black);
      railing.position.set(6.85, f * 3.2 + 0.35, 0);
      group.add(railing);
    }

    // Rooftop Water Tower on 4 Stilts
    const tankGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.8, 10);
    const tank = new THREE.Mesh(tankGeo, this.defaultMats.orange);
    tank.position.set(-3.2, 14.5, -1.8);
    group.add(tank);

    const tankRoof = new THREE.Mesh(new THREE.ConeGeometry(1.9, 1.2, 10), this.defaultMats.orange);
    tankRoof.position.set(-3.2, 16.5, -1.8);
    group.add(tankRoof);

    // 4 Stilts
    const stiltOffsets = [[-1.0, -1.0], [1.0, -1.0], [-1.0, 1.0], [1.0, 1.0]];
    stiltOffsets.forEach(([ox, oz]) => {
      const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5), this.defaultMats.black);
      stilt.position.set(-3.2 + ox, 12.25, -1.8 + oz);
      group.add(stilt);
    });

    // Wall Banner Ad
    const config = this.initialAdConfigs[adIndex % this.initialAdConfigs.length];
    const banner = this.createAdBillboardMesh(config, 8.5, 4.2, group);
    banner.position.set(0, 6.2, 4.58);
    group.add(banner);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 3. Construction Crane Tower with Rotating Jib Arm
  public createCraneTower(x: number, z: number, adIndex = 5): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Skeletal building under construction
    const frameGeo = new THREE.BoxGeometry(11, 16, 11);
    const frameMesh = new THREE.Mesh(frameGeo, this.defaultMats.blue);
    frameMesh.position.y = 8;
    group.add(frameMesh);

    // Crane Mast
    const craneMast = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 26), this.defaultMats.orange);
    craneMast.position.set(2.5, 13, -2.5);
    group.add(craneMast);

    // Rotating Crane Jib Arm Pivot Group
    const jibGroup = new THREE.Group();
    jibGroup.position.set(2.5, 26, -2.5);

    // Operator Cab
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.4), this.defaultMats.orange);
    cab.position.set(0, 0.6, 0);
    jibGroup.add(cab);

    // Jib Arm (Front)
    const jibArm = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 0.4), this.defaultMats.orange);
    jibArm.position.set(7.5, 0.6, 0);
    jibGroup.add(jibArm);

    // Counterweight (Back)
    const counterWeight = new THREE.Mesh(new THREE.BoxGeometry(4, 0.8, 0.8), this.defaultMats.black);
    counterWeight.position.set(-3.5, 0.6, 0);
    jibGroup.add(counterWeight);

    // Hanging Cable & Hook
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 8), this.defaultMats.black);
    cable.position.set(11, -3.4, 0);
    jibGroup.add(cable);

    group.add(jibGroup);
    this.craneJibArm = jibGroup;

    // Scaffolding Ad Banner
    const config = this.initialAdConfigs[adIndex % this.initialAdConfigs.length];
    const banner = this.createAdBillboardMesh(config, 9.5, 4.5, group);
    banner.position.set(0, 11, 5.6);
    group.add(banner);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 4. Highway Double-Sided Standalone Truss Billboard
  public createHighwayBillboard(x: number, z: number, adIndex = 2): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Heavy Central Pylon
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 13), this.defaultMats.black);
    pole.position.y = 6.5;
    group.add(pole);

    // Horizontal Steel Truss Frame
    const truss = new THREE.Mesh(new THREE.BoxGeometry(11, 1.0, 1.2), this.defaultMats.black);
    truss.position.y = 12.0;
    group.add(truss);

    // Front Billboard Face
    const config = this.initialAdConfigs[adIndex % this.initialAdConfigs.length];
    const frontBillboard = this.createAdBillboardMesh(config, 10.2, 5.0, group);
    frontBillboard.position.set(0, 12.2, 0.4);
    group.add(frontBillboard);

    // Back Billboard Face
    const backConfig = this.initialAdConfigs[(adIndex + 2) % this.initialAdConfigs.length];
    const backBillboard = this.createAdBillboardMesh(backConfig, 10.2, 5.0, group);
    backBillboard.position.set(0, 12.2, -0.4);
    backBillboard.rotation.y = Math.PI;
    group.add(backBillboard);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 5. Sidewalk Digital Kiosk
  public createStreetKiosk(x: number, z: number, adIndex = 3): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.4, 0.8), this.defaultMats.black);
    baseMesh.position.y = 2.2;
    group.add(baseMesh);

    const config = this.initialAdConfigs[adIndex % this.initialAdConfigs.length];
    const screen = this.createAdBillboardMesh(config, 2.0, 3.4, group);
    screen.position.set(0, 2.3, 0.42);
    group.add(screen);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 6. Beautiful Hand-Drawn Doodle Trees (No solid red blobs!)
  public createDoodleTree(x: number, z: number, isCyan = false): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Woody Trunk with Bark Outlines
    const trunkMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.0), this.defaultMats.black);
    trunkMesh.position.y = 1.5;
    group.add(trunkMesh);

    // 2 Branch splits
    const branchL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.4), this.defaultMats.black);
    branchL.position.set(-0.35, 2.4, 0);
    branchL.rotation.z = Math.PI / 5;
    group.add(branchL);

    const branchR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, 1.2), this.defaultMats.black);
    branchR.position.set(0.35, 2.5, 0.1);
    branchR.rotation.z = -Math.PI / 4.5;
    group.add(branchR);

    // Fluffy Doodle Foliage Puffs (fill: false ensures crisp ballpoint outlines with paper negative space)
    const foliageMat = isCyan ? this.defaultMats.cyan : this.defaultMats.green;

    const puffCenter = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), foliageMat);
    puffCenter.position.set(0, 3.8, 0);
    group.add(puffCenter);

    const puffLeft = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), foliageMat);
    puffLeft.position.set(-0.9, 3.3, 0.3);
    group.add(puffLeft);

    const puffRight = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), foliageMat);
    puffRight.position.set(0.9, 3.4, -0.2);
    group.add(puffRight);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // Switch between Districts: "tech" (Skyscraper metropolis) and "indie" (Loft & cafe park)
  public switchDistrict(district: "tech" | "indie") {
    this.currentDistrict = district;
    this.clearDistrict();
    this.seedDistrict(district);
    doodleAudio.scribble();
  }

  private clearDistrict() {
    this.buildings.forEach((b) => this.engine.scene.remove(b));
    this.buildings = [];
    this.adSpaces.clear();
  }

  private seedDistrict(district: "tech" | "indie") {
    if (district === "tech") {
      // High-density Skyscraper Metropolis with big tech billboards
      this.createSkyscraper(-25, -25, 28, 0); // Supabase
      this.createSkyscraper(25, -25, 24, 4);  // Turso
      this.createSkyscraper(-25, 25, 20, 7);  // Vercel
      this.createCraneTower(25, 25, 5);       // Build While Broke
      this.createHighwayBillboard(0, 28, 2);  // Raycast
      this.createIndieLoft(0, -28, 1);        // Your Brand Here
      this.createStreetKiosk(-12, 12, 3);     // PostHog
      this.createStreetKiosk(12, -12, 6);     // Available

      // Trees along pedestrian walks
      const treeCoords = [
        [-12, -18], [-12, -22], [-18, -12], [-22, -12],
        [12, 18], [12, 22], [18, 12], [22, 12],
        [-5, -10], [5, 10], [-10, 5], [10, -5],
      ];
      treeCoords.forEach(([tx, tz]) => this.createDoodleTree(tx, tz));
    } else {
      // Indie Alley: Brick lofts, cozy indie hacker spaces, lush green trees, street kiosks
      this.createIndieLoft(-22, -22, 1);
      this.createIndieLoft(22, -22, 0);
      this.createIndieLoft(-22, 22, 3);
      this.createIndieLoft(22, 22, 5);
      this.createHighwayBillboard(0, -28, 2);
      this.createStreetKiosk(-10, 10, 6);
      this.createStreetKiosk(10, -10, 4);

      // Lush forest park in center plaza
      for (let x = -16; x <= 16; x += 8) {
        for (let z = -16; z <= 16; z += 8) {
          if (Math.abs(x) > 2 || Math.abs(z) > 2) {
            this.createDoodleTree(x, z, (x + z) % 3 === 0);
          }
        }
      }
    }
  }

  // Animation Update: Moves traffic cars, drifts clouds, banks paper airplane, rotates crane
  public update(delta: number) {
    // 1. Move traffic cars along streets
    this.trafficCars.forEach((car) => {
      if (car.axis === "x") {
        car.group.position.x += car.direction * car.speed * delta;
        if (car.direction > 0 && car.group.position.x > car.max) car.group.position.x = car.min;
        if (car.direction < 0 && car.group.position.x < car.min) car.group.position.x = car.max;
      } else {
        car.group.position.z += car.direction * car.speed * delta;
        if (car.direction > 0 && car.group.position.z > car.max) car.group.position.z = car.min;
        if (car.direction < 0 && car.group.position.z < car.min) car.group.position.z = car.max;
      }
    });

    // 2. Drift clouds lazily across the sky
    this.clouds.forEach((cloud) => {
      cloud.position.x += 1.8 * delta;
      if (cloud.position.x > 80) cloud.position.x = -80;
    });

    // 3. Bank and orbit the folded doodle paper airplane
    if (this.paperAirplane) {
      this.airplaneAngle += 0.22 * delta;
      const r = 42;
      this.paperAirplane.position.x = Math.cos(this.airplaneAngle) * r;
      this.paperAirplane.position.z = Math.sin(this.airplaneAngle) * r;
      this.paperAirplane.position.y = 34 + Math.sin(this.airplaneAngle * 2) * 2.5;
      this.paperAirplane.rotation.y = -this.airplaneAngle + Math.PI / 2;
      this.paperAirplane.rotation.z = Math.cos(this.airplaneAngle * 2) * 0.18; // banking roll
    }

    // 4. Slowly sway crane jib arm
    if (this.craneJibArm) {
      this.craneAngle += 0.3 * delta;
      this.craneJibArm.rotation.y = Math.sin(this.craneAngle) * 0.75;
    }
  }

  // Raycasting click detection
  public handlePointerClick(event: MouseEvent): AdSpace | null {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.engine.camera);

    // Gather all ad billboard meshes
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

    // If in build tool mode, place selected structure on ground plane
    if (this.buildTool !== "select" && this.buildTool !== "demolish") {
      const groundHits = this.raycaster.intersectObject(this.groundPlane);
      if (groundHits.length > 0) {
        const pt = groundHits[0].point;
        // Snap to 4m grid
        const gx = Math.round(pt.x / 4) * 4;
        const gz = Math.round(pt.z / 4) * 4;

        this.placeBuilding(this.buildTool, gx, gz);
        doodleAudio.placeBlock();
      }
    }

    return null;
  }

  public placeBuilding(type: BuildingType, x: number, z: number) {
    switch (type) {
      case "skyscraper":
        return this.createSkyscraper(x, z, 20 + Math.floor(Math.random() * 8));
      case "indie-loft":
        return this.createIndieLoft(x, z);
      case "crane-tower":
        return this.createCraneTower(x, z);
      case "highway-billboard":
        return this.createHighwayBillboard(x, z);
      case "street-kiosk":
        return this.createStreetKiosk(x, z);
      case "tree":
        return this.createDoodleTree(x, z);
    }
  }

  // Lease / update an ad space with custom user inputs
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

  // Calculate city metrics
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
