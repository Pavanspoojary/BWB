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

export class CityBuilder {
  public engine: DoodleEngine;
  public adSpaces: Map<string, AdSpace> = new Map();
  public buildings: THREE.Group[] = [];
  public selectedAdSpace: AdSpace | null = null;
  public buildTool: BuildingType | "select" | "demolish" = "select";

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private groundPlane: THREE.Mesh;
  private previewGhost: THREE.Group | null = null;
  private defaultMats: {
    blue: THREE.ShaderMaterial;
    blueFill: THREE.ShaderMaterial;
    red: THREE.ShaderMaterial;
    black: THREE.ShaderMaterial;
    orange: THREE.ShaderMaterial;
    green: THREE.ShaderMaterial;
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
      sponsorName: "RECYCLE YOUR SAAS",
      sponsorTagline: "Click to rent this digital street spot",
      accentColor: "#3b82f6",
      isAvailable: true,
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
      sponsorName: "BUILD WHILE BROKE",
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
  ];

  constructor(engine: DoodleEngine) {
    this.engine = engine;

    this.defaultMats = {
      blue: engine.createDoodleMaterial({ ink: INK_COLORS.BLUE, fill: false }),
      blueFill: engine.createDoodleMaterial({ ink: INK_COLORS.BLUE, fill: true }),
      red: engine.createDoodleMaterial({ ink: INK_COLORS.RED, fill: false }),
      black: engine.createDoodleMaterial({ ink: INK_COLORS.BLACK, fill: false }),
      orange: engine.createDoodleMaterial({ ink: INK_COLORS.ORANGE, fill: false }),
      green: engine.createDoodleMaterial({ ink: INK_COLORS.GREEN, fill: true }),
    };

    // Ground Plane with Grid Markings
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = engine.createDoodleMaterial({ ink: INK_COLORS.BLACK, fill: false, shadeBias: 0.2 });
    this.groundPlane = new THREE.Mesh(groundGeo, groundMat);
    this.groundPlane.position.y = 0;
    this.engine.scene.add(this.groundPlane);

    this.createRoadGrid();
    this.seedInitialCity();
  }

  // Draw street grid with dashed pen markings
  private createRoadGrid() {
    const roadGroup = new THREE.Group();
    const streetMat = this.engine.createDoodleMaterial({ ink: INK_COLORS.BLUE, fill: false });

    // Perimeter boundary line
    const borderGeo = new THREE.BoxGeometry(140, 0.1, 140);
    const borderMesh = new THREE.Mesh(borderGeo, streetMat);
    roadGroup.add(borderMesh);

    // Cross streets (Avenues & Boulevards)
    const roadWidth = 6.0;
    const roadLines = [-40, -15, 15, 40];

    roadLines.forEach((pos) => {
      // Horizontal Street
      const hRoad = new THREE.Mesh(new THREE.BoxGeometry(130, 0.05, roadWidth), streetMat);
      hRoad.position.set(0, 0.02, pos);
      roadGroup.add(hRoad);

      // Vertical Street
      const vRoad = new THREE.Mesh(new THREE.BoxGeometry(roadWidth, 0.05, 130), streetMat);
      vRoad.position.set(pos, 0.02, 0);
      roadGroup.add(vRoad);
    });

    this.engine.scene.add(roadGroup);
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
      ctx.fillText("★ AVAILABLE FOR SPONSOR", 32, 46);

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

  // 1. Skyscraper with Rooftop Billboard Frame
  public createSkyscraper(x: number, z: number, height = 24, adIndex = 0): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Main Tower Body
    const bodyGeo = new THREE.BoxGeometry(10, height, 10);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.defaultMats.blue);
    bodyMesh.position.y = height / 2;
    group.add(bodyMesh);

    // Window grid lines
    const floors = Math.floor(height / 3);
    for (let f = 1; f < floors; f++) {
      const windowLineGeo = new THREE.BoxGeometry(10.1, 0.15, 10.1);
      const windowLine = new THREE.Mesh(windowLineGeo, this.defaultMats.blue);
      windowLine.position.y = f * 3;
      group.add(windowLine);
    }

    // Rooftop Terrace & Billboard Mount
    const mountPostL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3), this.defaultMats.black);
    mountPostL.position.set(-3.5, height + 1.5, 0);
    group.add(mountPostL);

    const mountPostR = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3), this.defaultMats.black);
    mountPostR.position.set(3.5, height + 1.5, 0);
    group.add(mountPostR);

    // Rooftop Billboard
    const config = this.initialAdConfigs[adIndex % this.initialAdConfigs.length];
    const billboard = this.createAdBillboardMesh(config, 9.5, 4.8, group);
    billboard.position.set(0, height + 3.2, 0);
    group.add(billboard);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 2. Indie Hacker Loft with Wall Banner
  public createIndieLoft(x: number, z: number, adIndex = 1): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // 3-story brick building
    const loftGeo = new THREE.BoxGeometry(12, 11, 8);
    const loftMesh = new THREE.Mesh(loftGeo, this.defaultMats.blue);
    loftMesh.position.y = 5.5;
    group.add(loftMesh);

    // Pitched doodle roof
    const roofGeo = new THREE.ConeGeometry(8.5, 3.5, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMesh = new THREE.Mesh(roofGeo, this.defaultMats.orange);
    roofMesh.position.y = 12.5;
    group.add(roofMesh);

    // Wall Banner Ad on Side
    const config = this.initialAdConfigs[adIndex % this.initialAdConfigs.length];
    const banner = this.createAdBillboardMesh(config, 8, 4, group);
    banner.position.set(0, 6, 4.08);
    group.add(banner);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 3. Construction Crane Tower with Scaffolding Banner
  public createCraneTower(x: number, z: number, adIndex = 5): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Half-constructed building floors
    const frameGeo = new THREE.BoxGeometry(11, 16, 11);
    const frameMesh = new THREE.Mesh(frameGeo, this.defaultMats.blue);
    frameMesh.position.y = 8;
    group.add(frameMesh);

    // Tall yellow/orange construction crane
    const craneMastGeo = new THREE.CylinderGeometry(0.3, 0.3, 24);
    const craneMast = new THREE.Mesh(craneMastGeo, this.defaultMats.orange);
    craneMast.position.set(2, 12, -2);
    group.add(craneMast);

    // Crane Arm (Jib)
    const craneJibGeo = new THREE.BoxGeometry(14, 0.4, 0.4);
    const craneJib = new THREE.Mesh(craneJibGeo, this.defaultMats.orange);
    craneJib.position.set(4, 24, -2);
    group.add(craneJib);

    // Hook cable
    const cableGeo = new THREE.CylinderGeometry(0.05, 0.05, 6);
    const cable = new THREE.Mesh(cableGeo, this.defaultMats.black);
    cable.position.set(8, 20.8, -2);
    group.add(cable);

    // Scaffolding Ad Banner
    const config = this.initialAdConfigs[adIndex % this.initialAdConfigs.length];
    const banner = this.createAdBillboardMesh(config, 9.5, 4.5, group);
    banner.position.set(0, 11, 5.6);
    group.add(banner);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 4. Highway Double-Sided Standalone Billboard
  public createHighwayBillboard(x: number, z: number, adIndex = 2): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Central Support Pole
    const poleGeo = new THREE.CylinderGeometry(0.45, 0.55, 12);
    const pole = new THREE.Mesh(poleGeo, this.defaultMats.black);
    pole.position.y = 6;
    group.add(pole);

    // Front Billboard Face
    const config = this.initialAdConfigs[adIndex % this.initialAdConfigs.length];
    const frontBillboard = this.createAdBillboardMesh(config, 10, 5, group);
    frontBillboard.position.set(0, 11.5, 0.2);
    group.add(frontBillboard);

    // Back Billboard Face
    const backBillboard = this.createAdBillboardMesh(config, 10, 5, group);
    backBillboard.position.set(0, 11.5, -0.2);
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

    const baseGeo = new THREE.BoxGeometry(2.4, 4.2, 0.8);
    const baseMesh = new THREE.Mesh(baseGeo, this.defaultMats.black);
    baseMesh.position.y = 2.1;
    group.add(baseMesh);

    const config = this.initialAdConfigs[adIndex % this.initialAdConfigs.length];
    const screen = this.createAdBillboardMesh(config, 2.0, 3.4, group);
    screen.position.set(0, 2.2, 0.42);
    group.add(screen);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // 6. Cute Hand-Drawn Doodle Trees
  public createDoodleTree(x: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2.5);
    const trunk = new THREE.Mesh(trunkGeo, this.defaultMats.black);
    trunk.position.y = 1.25;
    group.add(trunk);

    // Foliage (fluffy ballpoint green sphere)
    const foliageGeo = new THREE.DodecahedronGeometry(1.8, 1);
    const foliage = new THREE.Mesh(foliageGeo, this.defaultMats.green);
    foliage.position.y = 3.2;
    group.add(foliage);

    this.engine.scene.add(group);
    this.buildings.push(group);
    return group;
  }

  // Seed the initial full-fledged doodle city
  private seedInitialCity() {
    // 1. Center Plaza Skyscrapers with Rooftop Billboards
    this.createSkyscraper(-25, -25, 26, 0); // Supabase
    this.createSkyscraper(25, -25, 22, 4);  // Turso
    this.createSkyscraper(-25, 25, 18, 1);  // Available Wall

    // 2. Crane & Scaffolding Under Construction
    this.createCraneTower(25, 25, 5); // Build While Broke

    // 3. Indie Lofts
    this.createIndieLoft(0, -28, 1);
    this.createIndieLoft(-28, 0, 3);

    // 4. Standalone Highway Billboards
    this.createHighwayBillboard(0, 28, 2); // Raycast

    // 5. Street Kiosks along walkways
    this.createStreetKiosk(-12, 12, 3);
    this.createStreetKiosk(12, -12, 6);

    // 6. Tree clusters along street sides
    const treeCoords = [
      [-12, -18], [-12, -22], [-18, -12], [-22, -12],
      [12, 18], [12, 22], [18, 12], [22, 12],
      [-5, -10], [5, 10], [-10, 5], [10, -5],
    ];
    treeCoords.forEach(([tx, tz]) => this.createDoodleTree(tx, tz));
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
