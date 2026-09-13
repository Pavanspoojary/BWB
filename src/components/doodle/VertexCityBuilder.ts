import * as THREE from "three";

/**
 * MAP SPECIFICATION — VERTEX CITY
 * REFERENCE CANVAS: 1660 × 1107
 * COORDINATE SYSTEM: X = 0–1660 from west to east, Y = 0–1107 from north to south.
 * CIVIC CENTER: Founder Circle at X=825, Y=470 (World 0,0)
 * 3D WORLD SCALE: 0.5 meters per map coordinate unit
 */
export const VERTEX_CANVAS = {
  width: 1660,
  height: 1107,
  centerX: 825,
  centerY: 470,
  scale: 0.5,
};

/** Convert 2D map pixel coordinates to 3D world space (X, Y elevation, Z) */
export function mapToWorld(mapX: number, mapY: number, elevation: number = 0): THREE.Vector3 {
  const x = (mapX - VERTEX_CANVAS.centerX) * VERTEX_CANVAS.scale;
  const z = (mapY - VERTEX_CANVAS.centerY) * VERTEX_CANVAS.scale;
  return new THREE.Vector3(x, elevation, z);
}

/** Convert 3D world space (X, Z) back to 2D map pixel coordinates */
export function worldToMap(worldX: number, worldZ: number): { x: number; y: number } {
  const x = worldX / VERTEX_CANVAS.scale + VERTEX_CANVAS.centerX;
  const y = worldZ / VERTEX_CANVAS.scale + VERTEX_CANVAS.centerY;
  return { x, y };
}

export class VertexCityBuilder {
  public static buildVertexCity(city: any): THREE.Group {
    const root = new THREE.Group();
    root.name = "VertexCity_Root";
    const mats = this.getMaterials(city);

    // 1. Terrain & Water System (Vertex Bay, Innovation River, Prototype Lake, Cloud Gardens Pond, Freedom Beach)
    root.add(this.buildTerrainAndWater(mats));

    // 2. Road Network (Orbit Ring, Southern Highway, 6 Roundabouts, Radial & Concentric Avenues, Bridges)
    root.add(this.buildRoadNetwork(mats));

    // 3. Southern Rail Corridor & The Yard (SW to NE Rail Line, Industrial Switching Yard)
    root.add(this.buildRailSystem(mats));

    // 4. Civic Center — Founder Circle (Center obelisk, colonnade, plaza, trees, central ad billboard)
    root.add(this.buildFounderCircle(city, mats));

    // 5. Urban Districts (Launch Quarter, Product Square, Foundry District, Venture Ward, Open Source Commons)
    root.add(this.buildUrbanDistricts(city, mats));

    // 6. Signature Landmarks (Venture Stadium, Signal Station, Launch Terminal, The Harbor)
    root.add(this.buildLandmarks(city, mats));

    // 7. Parks & Landscaped Outskirts (Prototype Park, Maker's Park, Cloud Gardens, Ideation Ridge, Creators' Hills)
    root.add(this.buildParksAndOutskirts(mats));

    // 8. Signage, Wayfinding & District Titles (Directional signs & specifications headers)
    root.add(this.buildSignageAndLabels(mats));

    return root;
  }

  // =========================================================================
  // 1. TERRAIN & WATER SYSTEM
  // =========================================================================
  private static buildTerrainAndWater(mats: any): THREE.Group {
    const group = new THREE.Group();
    group.name = "TerrainAndWater";

    // Master Paper Ground Plane (Covering full playable area ~940m x 680m)
    const groundGeo = new THREE.PlaneGeometry(940, 680);
    const groundMesh = new THREE.Mesh(groundGeo, mats.paper || mats.black);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(0, -0.05, 0);
    groundMesh.userData.noCollision = true;
    group.add(groundMesh);

    // Subtle hand-drawn blueprint grid lines on paper ground
    const gridHelper = new THREE.GridHelper(900, 90, 0x1a30c0, 0x1a30c0);
    gridHelper.position.set(0, 0.01, 0);
    if (gridHelper.material instanceof THREE.Material) {
      gridHelper.material.opacity = 0.08;
      gridHelper.material.transparent = true;
    }
    gridHelper.userData.noCollision = true;
    group.add(gridHelper);

    // -----------------------------------------------------------------------
    // VERTEX BAY: Southeastern Ocean Body (X: 1050-1660, Y: 750-1107)
    // -----------------------------------------------------------------------
    const bayP1 = mapToWorld(1050, 750);
    const bayP2 = mapToWorld(1660, 1107);
    const bayWidth = Math.abs(bayP2.x - bayP1.x);
    const bayDepth = Math.abs(bayP2.z - bayP1.z);
    const bayCenterX = (bayP1.x + bayP2.x) / 2;
    const bayCenterZ = (bayP1.z + bayP2.z) / 2;

    const bayGeo = new THREE.PlaneGeometry(bayWidth, bayDepth);
    const bayMesh = new THREE.Mesh(bayGeo, mats.cyan);
    bayMesh.rotation.x = -Math.PI / 2;
    bayMesh.position.set(bayCenterX, 0.08, bayCenterZ);
    bayMesh.userData.noCollision = true;
    group.add(bayMesh);

    // Subtle water ripple stripes for Vertex Bay
    for (let r = 0; r < 8; r++) {
      const ripple = new THREE.Mesh(new THREE.BoxGeometry(bayWidth * 0.75, 0.08, 0.8), mats.blue);
      ripple.position.set(bayCenterX, 0.12, bayP1.z + r * (bayDepth / 8));
      ripple.userData.noCollision = true;
      group.add(ripple);
    }

    // -----------------------------------------------------------------------
    // FREEDOM BEACH: Sandy Coastline along X: 1390-1660, Y: 570-850
    // -----------------------------------------------------------------------
    const beachP1 = mapToWorld(1390, 570);
    const beachP2 = mapToWorld(1660, 850);
    const beachW = Math.abs(beachP2.x - beachP1.x);
    const beachD = Math.abs(beachP2.z - beachP1.z);
    const beachX = (beachP1.x + beachP2.x) / 2;
    const beachZ = (beachP1.z + beachP2.z) / 2;

    const beachMesh = new THREE.Mesh(new THREE.PlaneGeometry(beachW, beachD), mats.orange);
    beachMesh.rotation.x = -Math.PI / 2;
    beachMesh.position.set(beachX, 0.09, beachZ);
    beachMesh.userData.noCollision = true;
    group.add(beachMesh);

    // Beach props: Umbrellas, beach loungers & coastal boulders
    for (let i = 0; i < 6; i++) {
      const ux = beachP1.x + 15 + (i % 3) * 35;
      const uz = beachP1.z + 20 + Math.floor(i / 3) * 45;
      // Umbrella pole + cone canopy
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3), mats.black);
      pole.position.set(ux, 1.5, uz);
      group.add(pole);
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.2, 8), (i % 2 === 0) ? mats.red : mats.orange);
      canopy.position.set(ux, 3.2, uz);
      group.add(canopy);
      // Lounger chair
      const chair = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 1.0), mats.black);
      chair.position.set(ux + 1.8, 0.25, uz);
      chair.userData.noCollision = true;
      group.add(chair);
    }

    // -----------------------------------------------------------------------
    // INNOVATION RIVER: Flows West to East from (430, 610) to (1080, 610)
    // -----------------------------------------------------------------------
    const riverPoints = [
      mapToWorld(430, 610),
      mapToWorld(570, 600),
      mapToWorld(700, 565),
      mapToWorld(830, 550),
      mapToWorld(960, 560),
      mapToWorld(1080, 610),
      mapToWorld(1200, 680), // Curves toward Vertex Bay
    ];

    for (let i = 0; i < riverPoints.length - 1; i++) {
      const pA = riverPoints[i];
      const pB = riverPoints[i + 1];
      const segVec = new THREE.Vector3().subVectors(pB, pA);
      const length = segVec.length();
      const angle = Math.atan2(segVec.z, segVec.x);
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);

      // Water ribbon
      const waterSeg = new THREE.Mesh(new THREE.BoxGeometry(length, 0.12, 22), mats.cyan);
      waterSeg.position.set(mid.x, 0.07, mid.z);
      waterSeg.rotation.y = -angle;
      waterSeg.userData.noCollision = true;
      group.add(waterSeg);

      // River Embankment Stone Curbs
      const curbL = new THREE.Mesh(new THREE.BoxGeometry(length, 0.4, 0.8), mats.blue);
      const curbR = new THREE.Mesh(new THREE.BoxGeometry(length, 0.4, 0.8), mats.blue);
      curbL.position.set(mid.x, 0.2, mid.z - 11.2);
      curbR.position.set(mid.x, 0.2, mid.z + 11.2);
      curbL.rotation.y = -angle;
      curbR.rotation.y = -angle;
      group.add(curbL);
      group.add(curbR);
    }

    // -----------------------------------------------------------------------
    // PROTOTYPE LAKE: Freshwater organic lake in Prototype Park (Center: 350, 600)
    // -----------------------------------------------------------------------
    const lakeCenter = mapToWorld(350, 600);
    const lakeMesh = new THREE.Mesh(new THREE.CylinderGeometry(48, 56, 0.15, 24), mats.cyan);
    lakeMesh.position.set(lakeCenter.x, 0.08, lakeCenter.z);
    lakeMesh.scale.set(1.1, 1.0, 1.45); // Vertical/organic stretch
    lakeMesh.userData.noCollision = true;
    group.add(lakeMesh);

    // Stone rim around lake
    const lakeRim = new THREE.Mesh(new THREE.TorusGeometry(52, 1.2, 6, 24), mats.blue);
    lakeRim.rotation.x = Math.PI / 2;
    lakeRim.scale.set(1.1, 1.45, 1.0);
    lakeRim.position.set(lakeCenter.x, 0.2, lakeCenter.z);
    group.add(lakeRim);

    // Small Island in Prototype Lake at (385, 570)
    const islandPos = mapToWorld(385, 570);
    const islandMesh = new THREE.Mesh(new THREE.CylinderGeometry(10, 12, 0.6, 16), mats.green);
    islandMesh.position.set(islandPos.x, 0.3, islandPos.z);
    group.add(islandMesh);

    // Gazebo on island
    const gazeboBase = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.4, 8), mats.black);
    gazeboBase.position.set(islandPos.x, 0.8, islandPos.z);
    group.add(gazeboBase);
    const gazeboRoof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.5, 8), mats.red);
    gazeboRoof.position.set(islandPos.x, 3.0, islandPos.z);
    group.add(gazeboRoof);

    // -----------------------------------------------------------------------
    // CLOUD GARDENS POND: Small scenic pond in northern park (Center: 525, 125)
    // -----------------------------------------------------------------------
    const pondCenter = mapToWorld(525, 125);
    const pondMesh = new THREE.Mesh(new THREE.CylinderGeometry(24, 28, 0.14, 20), mats.cyan);
    pondMesh.position.set(pondCenter.x, 0.08, pondCenter.z);
    pondMesh.userData.noCollision = true;
    group.add(pondMesh);

    // Central green islet in Cloud Gardens
    const pondIsland = new THREE.Mesh(new THREE.CylinderGeometry(6, 7, 0.5, 12), mats.green);
    pondIsland.position.set(pondCenter.x, 0.25, pondCenter.z);
    group.add(pondIsland);

    const islandTree = this.createDoodleTree(pondCenter.x, 0.5, pondCenter.z, mats);
    group.add(islandTree);

    return group;
  }

  // =========================================================================
  // 2. ROAD NETWORK, ROUNDABOUTS & BRIDGES
  // =========================================================================
  private static buildRoadNetwork(mats: any): THREE.Group {
    const group = new THREE.Group();
    group.name = "RoadNetwork";

    // -----------------------------------------------------------------------
    // 6 MAJOR ROUNDABOUTS (A to F)
    // -----------------------------------------------------------------------
    const roundabouts = [
      { id: "A", name: "Founder Circle", mapX: 825, mapY: 470, radius: 45, ringW: 12 },
      { id: "B", name: "Foundry / Product Hub", mapX: 520, mapY: 350, radius: 18, ringW: 8 },
      { id: "C", name: "Orbit Ring Interchange", mapX: 1180, mapY: 100, radius: 22, ringW: 9 },
      { id: "D", name: "Venture Junction", mapX: 1120, mapY: 390, radius: 16, ringW: 7 },
      { id: "E", name: "Prototype / River Junction", mapX: 520, mapY: 610, radius: 18, ringW: 8 },
      { id: "F", name: "Harbor / Southern Highway", mapX: 1130, mapY: 700, radius: 20, ringW: 8 },
    ];

    for (const rb of roundabouts) {
      const pos = mapToWorld(rb.mapX, rb.mapY);
      // Outer asphalt ring
      const ringGeo = new THREE.RingGeometry(rb.radius - rb.ringW, rb.radius, 32);
      const ringMesh = new THREE.Mesh(ringGeo, mats.blue);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(pos.x, 0.09, pos.z);
      ringMesh.userData.noCollision = true;
      group.add(ringMesh);

      // White/Cyan lane dividing dash line
      const dashGeo = new THREE.RingGeometry(rb.radius - rb.ringW * 0.5 - 0.2, rb.radius - rb.ringW * 0.5 + 0.2, 32);
      const dashMesh = new THREE.Mesh(dashGeo, mats.cyan);
      dashMesh.rotation.x = -Math.PI / 2;
      dashMesh.position.set(pos.x, 0.1, pos.z);
      dashMesh.userData.noCollision = true;
      group.add(dashMesh);

      // Inner landscaped roundabout island
      const centerIsland = new THREE.Mesh(
        new THREE.CylinderGeometry(rb.radius - rb.ringW, rb.radius - rb.ringW, 0.5, 32),
        mats.green
      );
      centerIsland.position.set(pos.x, 0.25, pos.z);
      group.add(centerIsland);

      // Curb ring
      const curb = new THREE.Mesh(new THREE.TorusGeometry(rb.radius - rb.ringW, 0.4, 6, 32), mats.black);
      curb.rotation.x = Math.PI / 2;
      curb.position.set(pos.x, 0.45, pos.z);
      group.add(curb);
    }

    // -----------------------------------------------------------------------
    // INNER RING CONCENTRIC BOULEVARD (radius ~85m around Founder Circle)
    // -----------------------------------------------------------------------
    const fc = mapToWorld(825, 470);
    const innerRingGeo = new THREE.RingGeometry(80, 92, 48);
    const innerRingMesh = new THREE.Mesh(innerRingGeo, mats.blue);
    innerRingMesh.rotation.x = -Math.PI / 2;
    innerRingMesh.position.set(fc.x, 0.08, fc.z);
    innerRingMesh.userData.noCollision = true;
    group.add(innerRingMesh);

    // -----------------------------------------------------------------------
    // RADIAL & ARTERIAL BOULEVARDS
    // -----------------------------------------------------------------------
    // 1. DEPLOY AVENUE: North/South at X=825, Y: 70 to 430
    this.addStraightRoad(group, 825, 70, 825, 425, 14, mats);

    // 2. SPRINT STREET: West/East from X: 430, Y: 450 to X: 1200, Y: 465
    this.addStraightRoad(group, 430, 450, 780, 465, 12, mats);
    this.addStraightRoad(group, 870, 470, 1200, 465, 12, mats);

    // 3. BUILD STREET: Diagonal NW from (360, 330) to (570, 175)
    this.addStraightRoad(group, 360, 330, 570, 175, 10, mats);

    // 4. KERNEL ROAD: Diagonal arterial from (1000, 80) to (760, 440)
    this.addStraightRoad(group, 1000, 80, 760, 440, 11, mats);

    // 5. STACK ROAD: Diagonal from (650, 450) to (565, 600)
    this.addStraightRoad(group, 650, 450, 565, 600, 10, mats);

    // 6. INVESTOR BOULEVARD: North/South arterial at X=1120, Y: 100 to 520
    this.addStraightRoad(group, 1120, 100, 1120, 520, 13, mats);

    // 7. API BOULEVARD: North/South arterial at X=1130, Y: 250 to 600
    this.addStraightRoad(group, 1130, 250, 1130, 600, 11, mats);

    // 8. CREATORS' HILLS ARTERIAL: Curves from (0, 455) to (420, 455)
    this.addStraightRoad(group, 0, 455, 420, 455, 12, mats);

    // -----------------------------------------------------------------------
    // ORBIT RING: Northern & Western Multilane Highway
    // Points: (180, 215) -> (300, 70) -> (570, 35) -> (850, 38) -> (1120, 45) -> (1350, 80) -> (1490, 160)
    // -----------------------------------------------------------------------
    const orbitPts = [
      mapToWorld(180, 215),
      mapToWorld(300, 70),
      mapToWorld(570, 35),
      mapToWorld(850, 38),
      mapToWorld(1120, 45),
      mapToWorld(1350, 80),
      mapToWorld(1490, 160),
    ];

    for (let i = 0; i < orbitPts.length - 1; i++) {
      const pA = orbitPts[i];
      const pB = orbitPts[i + 1];
      const seg = new THREE.Vector3().subVectors(pB, pA);
      const len = seg.length();
      const ang = Math.atan2(seg.z, seg.x);
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);

      // Elevated multilane highway deck
      const deck = new THREE.Mesh(new THREE.BoxGeometry(len, 0.8, 16), mats.blue);
      deck.position.set(mid.x, 2.5, mid.z);
      deck.rotation.y = -ang;
      group.add(deck);

      // Highway guardrails
      const railL = new THREE.Mesh(new THREE.BoxGeometry(len, 1.2, 0.5), mats.orange);
      const railR = new THREE.Mesh(new THREE.BoxGeometry(len, 1.2, 0.5), mats.orange);
      railL.position.set(mid.x, 3.2, mid.z - 7.8);
      railR.position.set(mid.x, 3.2, mid.z + 7.8);
      railL.rotation.y = -ang;
      railR.rotation.y = -ang;
      group.add(railL);
      group.add(railR);

      // Support pillars every 30m
      const numPillars = Math.max(1, Math.floor(len / 30));
      for (let p = 0; p <= numPillars; p++) {
        const t = p / numPillars;
        const pilX = pA.x + seg.x * t;
        const pilZ = pA.z + seg.z * t;
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 2.5, 8), mats.black);
        pillar.position.set(pilX, 1.25, pilZ);
        group.add(pillar);
      }
    }

    // -----------------------------------------------------------------------
    // MAIN SOUTHERN HIGHWAY
    // Route: (160, 850) -> (350, 900) -> (600, 930) -> (850, 930) -> (1100, 900) -> (1280, 850)
    // -----------------------------------------------------------------------
    const southPts = [
      mapToWorld(160, 850),
      mapToWorld(350, 900),
      mapToWorld(600, 930),
      mapToWorld(850, 930),
      mapToWorld(1100, 900),
      mapToWorld(1280, 850),
    ];

    for (let i = 0; i < southPts.length - 1; i++) {
      const pA = southPts[i];
      const pB = southPts[i + 1];
      const seg = new THREE.Vector3().subVectors(pB, pA);
      const len = seg.length();
      const ang = Math.atan2(seg.z, seg.x);
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);

      const road = new THREE.Mesh(new THREE.BoxGeometry(len, 0.2, 14), mats.blue);
      road.position.set(mid.x, 0.1, mid.z);
      road.rotation.y = -ang;
      road.userData.noCollision = true;
      group.add(road);
    }

    // -----------------------------------------------------------------------
    // 3 BRIDGES OVER INNOVATION RIVER
    // -----------------------------------------------------------------------
    // 1. PIVOT BRIDGE: X: 620-760, Y: 575-650
    this.addTrussBridge(group, mapToWorld(690, 560), mapToWorld(690, 640), 12, "PIVOT BRIDGE", mats);

    // 2. MERGE BRIDGE: X: 930-1100, Y: 520-650
    this.addTrussBridge(group, mapToWorld(1015, 530), mapToWorld(1015, 635), 14, "MERGE BRIDGE", mats);

    // 3. RELEASE BRIDGE: X: 1050-1190, Y: 580-720
    this.addTrussBridge(group, mapToWorld(1120, 600), mapToWorld(1120, 710), 12, "RELEASE BRIDGE", mats);

    return group;
  }

  // =========================================================================
  // 3. SOUTHERN RAIL CORRIDOR & THE YARD
  // =========================================================================
  private static buildRailSystem(mats: any): THREE.Group {
    const group = new THREE.Group();
    group.name = "RailSystem";

    // Diagonal route: (390, 870) -> (500, 720) -> (620, 590) -> (750, 470) -> (870, 330) -> (1000, 190) -> (1120, 60)
    const railNodes = [
      mapToWorld(390, 870),
      mapToWorld(500, 720),
      mapToWorld(620, 590),
      mapToWorld(750, 470),
      mapToWorld(870, 330),
      mapToWorld(1000, 190),
      mapToWorld(1120, 60),
    ];

    for (let i = 0; i < railNodes.length - 1; i++) {
      const pA = railNodes[i];
      const pB = railNodes[i + 1];
      const seg = new THREE.Vector3().subVectors(pB, pA);
      const len = seg.length();
      const ang = Math.atan2(seg.z, seg.x);
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);

      // Ballast gravel bed
      const ballast = new THREE.Mesh(new THREE.BoxGeometry(len, 0.4, 7.5), mats.black);
      ballast.position.set(mid.x, 0.2, mid.z);
      ballast.rotation.y = -ang;
      group.add(ballast);

      // Dual parallel steel rails
      const railLeft = new THREE.Mesh(new THREE.BoxGeometry(len, 0.35, 0.25), mats.orange);
      const railRight = new THREE.Mesh(new THREE.BoxGeometry(len, 0.35, 0.25), mats.orange);
      railLeft.position.set(mid.x, 0.45, mid.z - 1.8);
      railRight.position.set(mid.x, 0.45, mid.z + 1.8);
      railLeft.rotation.y = -ang;
      railRight.rotation.y = -ang;
      group.add(railLeft);
      group.add(railRight);

      // Wooden cross ties (sleepers)
      const numTies = Math.floor(len / 2.5);
      for (let t = 0; t <= numTies; t++) {
        const factor = t / numTies;
        const tx = pA.x + seg.x * factor;
        const tz = pA.z + seg.z * factor;
        const tie = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 5.5), mats.black);
        tie.position.set(tx, 0.35, tz);
        tie.rotation.y = -ang;
        tie.userData.noCollision = true;
        group.add(tie);
      }
    }

    // -----------------------------------------------------------------------
    // THE YARD: Northeast Industrial Freight Rail Zone (X: 1370-1660, Y: 0-300)
    // -----------------------------------------------------------------------
    const yardGroup = new THREE.Group();
    yardGroup.name = "TheYard";
    const yardCenter = mapToWorld(1480, 150);

    // Ground industrial pavement
    const yardPavement = new THREE.Mesh(new THREE.BoxGeometry(120, 0.2, 110), mats.black);
    yardPavement.position.set(yardCenter.x, 0.1, yardCenter.z);
    yardPavement.userData.noCollision = true;
    yardGroup.add(yardPavement);

    // 4 Parallel rail siding tracks
    for (let s = 0; s < 4; s++) {
      const trackZ = yardCenter.z - 35 + s * 22;
      const trackRail = new THREE.Mesh(new THREE.BoxGeometry(110, 0.3, 0.3), mats.orange);
      trackRail.position.set(yardCenter.x, 0.3, trackZ);
      yardGroup.add(trackRail);

      // Freight Wagons on tracks
      if (s % 2 === 0) {
        const wagon = new THREE.Mesh(new THREE.BoxGeometry(22, 5.5, 4.2), (s === 0) ? mats.red : mats.blue);
        wagon.position.set(yardCenter.x - 20 + s * 15, 3.2, trackZ);
        yardGroup.add(wagon);
      }
    }

    // Large Industrial Freight Warehouse with triple smokestacks
    const whBody = new THREE.Mesh(new THREE.BoxGeometry(45, 14, 32), mats.blue);
    whBody.position.set(yardCenter.x + 25, 7.0, yardCenter.z - 20);
    yardGroup.add(whBody);

    // Gabled roof
    const whRoof = new THREE.Mesh(new THREE.ConeGeometry(24, 6, 4), mats.red);
    whRoof.rotation.y = Math.PI / 4;
    whRoof.position.set(yardCenter.x + 25, 17, yardCenter.z - 20);
    yardGroup.add(whRoof);

    // Triple Smokestacks
    for (let stk = 0; stk < 3; stk++) {
      const chimney = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 18, 12), mats.orange);
      chimney.position.set(yardCenter.x + 12 + stk * 10, 16, yardCenter.z - 32);
      yardGroup.add(chimney);
    }

    // 12 Cargo Container Stacks
    const containerColors = [mats.red, mats.blue, mats.orange, mats.cyan];
    for (let c = 0; c < 12; c++) {
      const cx = yardCenter.x - 45 + (c % 4) * 16;
      const cz = yardCenter.z + 18 + Math.floor(c / 4) * 12;
      const cBox = new THREE.Mesh(new THREE.BoxGeometry(12, 3.8, 3.5), containerColors[c % containerColors.length]);
      cBox.position.set(cx, 1.9, cz);
      yardGroup.add(cBox);

      // Stacked 2nd container tier
      if (c % 2 === 0) {
        const cTop = new THREE.Mesh(new THREE.BoxGeometry(12, 3.8, 3.5), containerColors[(c + 1) % containerColors.length]);
        cTop.position.set(cx, 5.7, cz);
        yardGroup.add(cTop);
      }
    }

    group.add(yardGroup);
    return group;
  }

  // =========================================================================
  // 4. FOUNDER CIRCLE (CIVIC CENTER — WORLD 0,0)
  // =========================================================================
  private static buildFounderCircle(city: any, mats: any): THREE.Group {
    const group = new THREE.Group();
    group.name = "FounderCircle";
    const fc = mapToWorld(825, 470); // (0, 0)

    // Stepped Circular Monument Plinth
    const plinth1 = new THREE.Mesh(new THREE.CylinderGeometry(18, 20, 0.8, 32), mats.black);
    plinth1.position.set(fc.x, 0.4, fc.z);
    group.add(plinth1);

    const plinth2 = new THREE.Mesh(new THREE.CylinderGeometry(13, 15, 0.8, 24), mats.black);
    plinth2.position.set(fc.x, 1.2, fc.z);
    group.add(plinth2);

    // Central Founder Obelisk Needle (Height 32m)
    const obeliskBase = new THREE.Mesh(new THREE.BoxGeometry(4.5, 6, 4.5), mats.blue);
    obeliskBase.position.set(fc.x, 4.2, fc.z);
    group.add(obeliskBase);

    const obeliskShaft = new THREE.Mesh(new THREE.BoxGeometry(3.2, 22, 3.2), mats.cyan);
    obeliskShaft.position.set(fc.x, 18.2, fc.z);
    group.add(obeliskShaft);

    // Gold/Orange Pyramidion Tip
    const obeliskTip = new THREE.Mesh(new THREE.ConeGeometry(2.4, 4.5, 4), mats.orange);
    obeliskTip.position.set(fc.x, 31.4, fc.z);
    obeliskTip.rotation.y = Math.PI / 4;
    group.add(obeliskTip);

    // Concentric Colonnade with 8 Classical Columns
    for (let c = 0; c < 8; c++) {
      const angle = (c / 8) * Math.PI * 2;
      const colX = fc.x + Math.cos(angle) * 24;
      const colZ = fc.z + Math.sin(angle) * 24;

      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 8, 12), mats.blue);
      column.position.set(colX, 4.0, colZ);
      group.add(column);

      // Decorative Lamp Sphere on top
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), mats.orange);
      lamp.position.set(colX, 8.4, colZ);
      group.add(lamp);
    }

    // Trees encircling the civic plaza
    for (let t = 0; t < 12; t++) {
      const angle = (t / 12) * Math.PI * 2 + 0.2;
      const tx = fc.x + Math.cos(angle) * 31;
      const tz = fc.z + Math.sin(angle) * 31;
      group.add(this.createDoodleTree(tx, 0.3, tz, mats));
    }

    // CENTERPIECE AD BILLBOARD: BuiltWhileBroke / Stripe Megaboard
    if (city && typeof city.createAdBillboardMesh === "function" && city.initialAdConfigs) {
      const bb = city.createAdBillboardMesh(city.initialAdConfigs[0], 14, 7.5, group);
      bb.position.set(fc.x, 12, fc.z - 36);
      bb.rotation.y = 0;
    }

    return group;
  }

  // =========================================================================
  // 5. URBAN DISTRICTS (LAUNCH QUARTER, PRODUCT SQ, FOUNDRY, VENTURE, OPEN SOURCE)
  // =========================================================================
  private static buildUrbanDistricts(city: any, mats: any): THREE.Group {
    const group = new THREE.Group();
    group.name = "UrbanDistricts";

    // -----------------------------------------------------------------------
    // LAUNCH QUARTER: Dense northern startup sector (X: 650-1010, Y: 70-350)
    // -----------------------------------------------------------------------
    const lqGroup = new THREE.Group();
    lqGroup.name = "LaunchQuarter";
    const lqPlots = [
      { mapX: 740, mapY: 210, w: 22, d: 20, h: 46, mat: mats.blue },
      { mapX: 910, mapY: 210, w: 24, d: 22, h: 52, mat: mats.cyan },
      { mapX: 730, mapY: 300, w: 20, d: 18, h: 36, mat: mats.blue },
      { mapX: 920, mapY: 300, w: 22, d: 18, h: 42, mat: mats.blue },
      { mapX: 780, mapY: 140, w: 18, d: 16, h: 32, mat: mats.orange },
      { mapX: 870, mapY: 140, w: 18, d: 16, h: 34, mat: mats.orange },
      { mapX: 710, mapY: 110, w: 20, d: 16, h: 28, mat: mats.blue },
      { mapX: 940, mapY: 110, w: 20, d: 16, h: 30, mat: mats.blue },
      { mapX: 680, mapY: 250, w: 18, d: 16, h: 35, mat: mats.cyan },
      { mapX: 970, mapY: 250, w: 18, d: 16, h: 38, mat: mats.blue },
      { mapX: 760, mapY: 340, w: 22, d: 16, h: 40, mat: mats.orange },
      { mapX: 890, mapY: 340, w: 22, d: 16, h: 44, mat: mats.cyan },
      { mapX: 800, mapY: 80, w: 16, d: 14, h: 26, mat: mats.blue },
      { mapX: 850, mapY: 80, w: 16, d: 14, h: 26, mat: mats.blue },
    ];

    for (const plot of lqPlots) {
      const pos = mapToWorld(plot.mapX, plot.mapY);
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(plot.w, plot.h, plot.d), plot.mat);
      bldg.position.set(pos.x, plot.h / 2, pos.z);
      lqGroup.add(bldg);

      // Rooftop cornice & antenna
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(plot.w + 1.2, 0.8, plot.d + 1.2), mats.orange);
      cornice.position.set(pos.x, plot.h + 0.4, pos.z);
      lqGroup.add(cornice);

      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 8, 8), mats.red);
      antenna.position.set(pos.x, plot.h + 4.4, pos.z);
      lqGroup.add(antenna);
    }

    // Deploy Avenue Ad Banner
    if (city && typeof city.createAdBillboardMesh === "function" && city.initialAdConfigs) {
      const banner = city.createAdBillboardMesh(city.initialAdConfigs[1], 11, 5.5, lqGroup);
      banner.position.set(mapToWorld(825, 230).x, 14, mapToWorld(825, 230).z);
      banner.rotation.y = Math.PI / 2;
    }

    group.add(lqGroup);

    // -----------------------------------------------------------------------
    // PRODUCT SQUARE: Central-West Tech lofts & grid (X: 500-720, Y: 350-485)
    // -----------------------------------------------------------------------
    const psGroup = new THREE.Group();
    psGroup.name = "ProductSquare";
    const psPlots = [
      { mapX: 580, mapY: 390, w: 24, d: 20, h: 28, mat: mats.blue },
      { mapX: 660, mapY: 390, w: 22, d: 18, h: 32, mat: mats.cyan },
      { mapX: 570, mapY: 460, w: 20, d: 16, h: 24, mat: mats.orange },
      { mapX: 670, mapY: 460, w: 22, d: 18, h: 26, mat: mats.blue },
      { mapX: 520, mapY: 410, w: 18, d: 16, h: 22, mat: mats.blue },
      { mapX: 520, mapY: 470, w: 18, d: 16, h: 20, mat: mats.cyan },
      { mapX: 620, mapY: 360, w: 20, d: 16, h: 25, mat: mats.orange },
      { mapX: 620, mapY: 480, w: 20, d: 16, h: 24, mat: mats.blue },
    ];

    for (const plot of psPlots) {
      const pos = mapToWorld(plot.mapX, plot.mapY);
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(plot.w, plot.h, plot.d), plot.mat);
      bldg.position.set(pos.x, plot.h / 2, pos.z);
      psGroup.add(bldg);

      // Entrance portico
      const door = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 0.4), mats.black);
      door.position.set(pos.x, 2.5, pos.z + plot.d / 2 + 0.2);
      door.userData.noCollision = true;
      psGroup.add(door);
    }

    // Product Square Corner Billboard
    if (city && typeof city.createAdBillboardMesh === "function" && city.initialAdConfigs) {
      const psBoard = city.createAdBillboardMesh(city.initialAdConfigs[4], 10, 5, psGroup);
      psBoard.position.set(mapToWorld(620, 420).x, 10, mapToWorld(620, 420).z);
    }

    group.add(psGroup);

    // -----------------------------------------------------------------------
    // FOUNDRY DISTRICT: Industrial maker workshops (X: 390-650, Y: 190-360)
    // -----------------------------------------------------------------------
    const fdGroup = new THREE.Group();
    fdGroup.name = "FoundryDistrict";
    const fdPlots = [
      { mapX: 470, mapY: 240, w: 32, d: 24, h: 18, mat: mats.blue },
      { mapX: 550, mapY: 260, w: 28, d: 22, h: 20, mat: mats.red },
      { mapX: 450, mapY: 320, w: 26, d: 20, h: 16, mat: mats.blue },
      { mapX: 530, mapY: 330, w: 24, d: 20, h: 17, mat: mats.orange },
      { mapX: 410, mapY: 260, w: 22, d: 18, h: 15, mat: mats.blue },
      { mapX: 590, mapY: 210, w: 24, d: 20, h: 18, mat: mats.cyan },
    ];

    for (const plot of fdPlots) {
      const pos = mapToWorld(plot.mapX, plot.mapY);
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(plot.w, plot.h, plot.d), plot.mat);
      bldg.position.set(pos.x, plot.h / 2, pos.z);
      fdGroup.add(bldg);

      // Industrial Sawtooth Gabled Rooflines
      const roof = new THREE.Mesh(new THREE.ConeGeometry(plot.w * 0.45, 5, 4), mats.black);
      roof.position.set(pos.x, plot.h + 2.5, pos.z);
      roof.rotation.y = Math.PI / 4;
      fdGroup.add(roof);
    }

    // Water Tower in Foundry District
    const wtPos = mapToWorld(510, 220);
    const wtLegs = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 14, 4), mats.black);
    wtLegs.position.set(wtPos.x, 7, wtPos.z);
    fdGroup.add(wtLegs);
    const wtTank = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 6, 16), mats.orange);
    wtTank.position.set(wtPos.x, 17, wtPos.z);
    fdGroup.add(wtTank);

    group.add(fdGroup);

    // -----------------------------------------------------------------------
    // VENTURE WARD: Eastern Financial & Skyscraper District (X: 1040-1320, Y: 200-390)
    // -----------------------------------------------------------------------
    const vwGroup = new THREE.Group();
    vwGroup.name = "VentureWard";
    const vwPlots = [
      { mapX: 1100, mapY: 260, w: 26, d: 24, h: 58, mat: mats.cyan },
      { mapX: 1200, mapY: 260, w: 28, d: 26, h: 64, mat: mats.blue },
      { mapX: 1110, mapY: 340, w: 24, d: 22, h: 48, mat: mats.blue },
      { mapX: 1220, mapY: 350, w: 26, d: 24, h: 54, mat: mats.cyan },
      { mapX: 1060, mapY: 220, w: 22, d: 20, h: 42, mat: mats.orange },
      { mapX: 1260, mapY: 240, w: 24, d: 22, h: 50, mat: mats.blue },
      { mapX: 1160, mapY: 380, w: 24, d: 22, h: 46, mat: mats.blue },
      { mapX: 1260, mapY: 380, w: 22, d: 20, h: 44, mat: mats.orange },
    ];

    for (const plot of vwPlots) {
      const pos = mapToWorld(plot.mapX, plot.mapY);
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(plot.w, plot.h, plot.d), plot.mat);
      bldg.position.set(pos.x, plot.h / 2, pos.z);
      vwGroup.add(bldg);

      // Setback pinnacle level
      const pinnacle = new THREE.Mesh(new THREE.BoxGeometry(plot.w * 0.6, 10, plot.d * 0.6), mats.orange);
      pinnacle.position.set(pos.x, plot.h + 5, pos.z);
      vwGroup.add(pinnacle);

      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 12, 8), mats.red);
      spire.position.set(pos.x, plot.h + 16, pos.z);
      vwGroup.add(spire);
    }

    // Raycast / Venture Ward Skyboard
    if (city && typeof city.createAdBillboardMesh === "function" && city.initialAdConfigs) {
      const vBoard = city.createAdBillboardMesh(city.initialAdConfigs[2], 12, 6, vwGroup);
      vBoard.position.set(mapToWorld(1160, 300).x, 22, mapToWorld(1160, 300).z);
    }

    group.add(vwGroup);

    // -----------------------------------------------------------------------
    // OPEN SOURCE COMMONS: Low-Rise Tech Campus (X: 950-1170, Y: 380-540)
    // -----------------------------------------------------------------------
    const oscGroup = new THREE.Group();
    oscGroup.name = "OpenSourceCommons";
    const oscPlots = [
      { mapX: 1010, mapY: 420, w: 26, d: 20, h: 18, mat: mats.green },
      { mapX: 1080, mapY: 450, w: 28, d: 22, h: 22, mat: mats.blue },
      { mapX: 1010, mapY: 500, w: 24, d: 18, h: 16, mat: mats.cyan },
      { mapX: 1070, mapY: 510, w: 24, d: 18, h: 20, mat: mats.orange },
      { mapX: 1140, mapY: 460, w: 22, d: 18, h: 18, mat: mats.blue },
      { mapX: 1140, mapY: 510, w: 22, d: 18, h: 19, mat: mats.cyan },
    ];

    for (const plot of oscPlots) {
      const pos = mapToWorld(plot.mapX, plot.mapY);
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(plot.w, plot.h, plot.d), plot.mat);
      bldg.position.set(pos.x, plot.h / 2, pos.z);
      oscGroup.add(bldg);

      // Campus garden quad trees
      oscGroup.add(this.createDoodleTree(pos.x + plot.w / 2 + 5, 0.2, pos.z, mats));
    }

    group.add(oscGroup);
    return group;
  }

  // =========================================================================
  // 6. SIGNATURE LANDMARKS (STADIUM, SIGNAL STATION, TERMINAL, HARBOR)
  // =========================================================================
  private static buildLandmarks(city: any, mats: any): THREE.Group {
    const group = new THREE.Group();
    group.name = "SignatureLandmarks";

    // -----------------------------------------------------------------------
    // 1. VENTURE STADIUM: Oval Sports Arena (X: 1330-1550, Y: 390-580)
    // -----------------------------------------------------------------------
    const stadGroup = new THREE.Group();
    stadGroup.name = "VentureStadium";
    const stadPos = mapToWorld(1440, 485);

    // Outer oval spectator bowl
    const bowlGeo = new THREE.CylinderGeometry(42, 48, 16, 32);
    const bowlMesh = new THREE.Mesh(bowlGeo, mats.blue);
    bowlMesh.position.set(stadPos.x, 8, stadPos.z);
    bowlMesh.scale.set(1.25, 1.0, 0.95);
    stadGroup.add(bowlMesh);

    // Interior playing green pitch
    const pitch = new THREE.Mesh(new THREE.BoxGeometry(45, 0.3, 28), mats.green);
    pitch.position.set(stadPos.x, 1.2, stadPos.z);
    stadGroup.add(pitch);

    // 4 Stadium Floodlight Pylons
    const pylons = [
      { dx: -48, dz: -32 },
      { dx: 48, dz: -32 },
      { dx: -48, dz: 32 },
      { dx: 48, dz: 32 },
    ];
    for (const p of pylons) {
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 24, 8), mats.black);
      pylon.position.set(stadPos.x + p.dx, 12, stadPos.z + p.dz);
      stadGroup.add(pylon);

      const lampHead = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.2, 1.2), mats.orange);
      lampHead.position.set(stadPos.x + p.dx, 24, stadPos.z + p.dz);
      stadGroup.add(lampHead);
    }

    group.add(stadGroup);

    // -----------------------------------------------------------------------
    // 2. SIGNAL STATION: Large Isolated Facility (X: 190-395, Y: 310-470)
    // -----------------------------------------------------------------------
    const sigGroup = new THREE.Group();
    sigGroup.name = "SignalStation";
    const sigPos = mapToWorld(290, 370);

    // Main Bunker Structure (Footprint X: 220-365, Y: 315-430)
    const bunker = new THREE.Mesh(new THREE.BoxGeometry(65, 12, 52), mats.blue);
    bunker.position.set(sigPos.x, 6, sigPos.z);
    sigGroup.add(bunker);

    // Large Parabolic Radar Dish (Diameter 14m)
    const dishMast = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 12, 12), mats.black);
    dishMast.position.set(sigPos.x - 12, 18, sigPos.z);
    sigGroup.add(dishMast);

    const dish = new THREE.Mesh(new THREE.SphereGeometry(7, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), mats.cyan);
    dish.position.set(sigPos.x - 12, 25, sigPos.z);
    dish.rotation.x = Math.PI / 3.5;
    sigGroup.add(dish);

    // Tall Lattice Radio Transmission Tower (Height 42m)
    const radioTower = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 2.8, 42, 4), mats.orange);
    radioTower.position.set(sigPos.x + 18, 21, sigPos.z);
    sigGroup.add(radioTower);

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), mats.red);
    beacon.position.set(sigPos.x + 18, 42.8, sigPos.z);
    sigGroup.add(beacon);

    group.add(sigGroup);

    // -----------------------------------------------------------------------
    // 3. LAUNCH TERMINAL: Intermodal Transit Hub (X: 210-450, Y: 700-850)
    // -----------------------------------------------------------------------
    const termGroup = new THREE.Group();
    termGroup.name = "LaunchTerminal";
    const termPos = mapToWorld(330, 775);

    // Passenger Concourse Hall
    const concourse = new THREE.Mesh(new THREE.BoxGeometry(95, 14, 48), mats.blue);
    concourse.position.set(termPos.x, 7, termPos.z);
    termGroup.add(concourse);

    // Arched Vaulted Canopy Roof
    const roofArch = new THREE.Mesh(new THREE.CylinderGeometry(26, 26, 95, 16, 1, false, 0, Math.PI), mats.cyan);
    roofArch.rotation.z = Math.PI / 2;
    roofArch.position.set(termPos.x, 14, termPos.z);
    termGroup.add(roofArch);

    // Terminal Clocktower
    const termClock = new THREE.Mesh(new THREE.BoxGeometry(7, 28, 7), mats.black);
    termClock.position.set(termPos.x - 42, 14, termPos.z + 18);
    termGroup.add(termClock);

    const clockFace = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.4, 16), mats.orange);
    clockFace.rotation.x = Math.PI / 2;
    clockFace.position.set(termPos.x - 42, 24, termPos.z + 21.6);
    termGroup.add(clockFace);

    group.add(termGroup);

    // -----------------------------------------------------------------------
    // 4. THE HARBOR: Coastal Port & Marina (X: 1170-1450, Y: 600-880)
    // -----------------------------------------------------------------------
    const harborGroup = new THREE.Group();
    harborGroup.name = "TheHarbor";
    const harborPos = mapToWorld(1310, 740);

    // Concrete Quayside Piers
    const quay = new THREE.Mesh(new THREE.BoxGeometry(110, 2.2, 85), mats.black);
    quay.position.set(harborPos.x, 1.1, harborPos.z);
    harborGroup.add(quay);

    // Maritime Warehouses
    const wh1 = new THREE.Mesh(new THREE.BoxGeometry(32, 12, 22), mats.blue);
    wh1.position.set(harborPos.x - 28, 7.1, harborPos.z - 18);
    harborGroup.add(wh1);

    const wh2 = new THREE.Mesh(new THREE.BoxGeometry(28, 10, 18), mats.red);
    wh2.position.set(harborPos.x + 24, 6.1, harborPos.z - 22);
    harborGroup.add(wh2);

    // Ship-to-Shore Gantry Crane
    const craneBase = new THREE.Mesh(new THREE.BoxGeometry(12, 28, 12), mats.orange);
    craneBase.position.set(harborPos.x + 36, 15, harborPos.z + 22);
    harborGroup.add(craneBase);

    const craneBoom = new THREE.Mesh(new THREE.BoxGeometry(36, 3, 3), mats.orange);
    craneBoom.position.set(harborPos.x + 36, 29, harborPos.z + 32);
    harborGroup.add(craneBoom);

    // Docked Luxury Superyacht in Harbor Marina
    const yachtHull = new THREE.Mesh(new THREE.BoxGeometry(8, 3.5, 26), mats.cyan);
    yachtHull.position.set(harborPos.x - 12, 1.2, harborPos.z + 34);
    harborGroup.add(yachtHull);

    const yachtCabin = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 14), mats.orange);
    yachtCabin.position.set(harborPos.x - 12, 4.5, harborPos.z + 32);
    harborGroup.add(yachtCabin);

    // 2nd Yacht
    const yacht2 = new THREE.Mesh(new THREE.BoxGeometry(7, 3.2, 22), mats.blue);
    yacht2.position.set(harborPos.x + 8, 1.2, harborPos.z + 36);
    harborGroup.add(yacht2);

    // 12 Harbor Cargo Shipping Containers
    const cColors = [mats.orange, mats.blue, mats.red, mats.cyan];
    for (let c = 0; c < 12; c++) {
      const cx = harborPos.x - 40 + (c % 4) * 15;
      const cz = harborPos.z + 8 + Math.floor(c / 4) * 10;
      const cMesh = new THREE.Mesh(new THREE.BoxGeometry(12, 3.5, 3.2), cColors[c % cColors.length]);
      cMesh.position.set(cx, 1.75, cz);
      harborGroup.add(cMesh);

      if (c % 2 === 1) {
        const cMesh2 = new THREE.Mesh(new THREE.BoxGeometry(12, 3.5, 3.2), cColors[(c + 1) % cColors.length]);
        cMesh2.position.set(cx, 5.25, cz);
        harborGroup.add(cMesh2);
      }
    }

    // Supabase / Harbor Terminal Billboard
    if (city && typeof city.createAdBillboardMesh === "function" && city.initialAdConfigs) {
      const hBoard = city.createAdBillboardMesh(city.initialAdConfigs[3], 11, 5, harborGroup);
      hBoard.position.set(harborPos.x - 28, 15, harborPos.z - 6);
    }

    group.add(harborGroup);
    return group;
  }

  // =========================================================================
  // 7. PARKS & LANDSCAPED OUTSKIRTS
  // =========================================================================
  private static buildParksAndOutskirts(mats: any): THREE.Group {
    const group = new THREE.Group();
    group.name = "ParksAndOutskirts";

    // -----------------------------------------------------------------------
    // MAKER'S PARK: Waterfront Park south of Innovation River (X: 750-1080, Y: 590-790)
    // -----------------------------------------------------------------------
    const mpPos = mapToWorld(915, 690);
    const mpGrass = new THREE.Mesh(new THREE.CylinderGeometry(70, 75, 0.4, 32), mats.green);
    mpGrass.position.set(mpPos.x, 0.2, mpPos.z);
    mpGrass.userData.noCollision = true;
    group.add(mpGrass);

    // Circular Promenade Walkways & Central Fountain Plaza
    const mpFountain = new THREE.Mesh(new THREE.CylinderGeometry(8, 9, 1.2, 16), mats.blue);
    mpFountain.position.set(mpPos.x, 0.8, mpPos.z);
    group.add(mpFountain);

    const mpSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.6, 5, 8), mats.cyan);
    mpSpout.position.set(mpPos.x, 3.2, mpPos.z);
    group.add(mpSpout);

    // Park trees scattered in groves
    for (let t = 0; t < 24; t++) {
      const angle = (t / 24) * Math.PI * 2;
      const dist = 24 + (t % 4) * 12;
      const tx = mpPos.x + Math.cos(angle) * dist;
      const tz = mpPos.z + Math.sin(angle) * dist;
      group.add(this.createDoodleTree(tx, 0.4, tz, mats));
    }

    // -----------------------------------------------------------------------
    // PROTOTYPE PARK TREES (Around Prototype Lake X: 170-470, Y: 470-700)
    // -----------------------------------------------------------------------
    const ppCenter = mapToWorld(350, 600);
    for (let pt = 0; pt < 20; pt++) {
      const angle = (pt / 20) * Math.PI * 2;
      const dist = 60 + (pt % 3) * 15;
      const ptx = ppCenter.x + Math.cos(angle) * dist;
      const ptz = ppCenter.z + Math.sin(angle) * (dist * 1.3);
      group.add(this.createDoodleTree(ptx, 0.3, ptz, mats));
    }

    // -----------------------------------------------------------------------
    // CLOUD GARDENS (X: 430-630, Y: 55-220)
    // -----------------------------------------------------------------------
    const cgPos = mapToWorld(530, 140);
    const cgGrass = new THREE.Mesh(new THREE.BoxGeometry(85, 0.3, 65), mats.green);
    cgGrass.position.set(cgPos.x, 0.15, cgPos.z);
    cgGrass.userData.noCollision = true;
    group.add(cgGrass);

    // Symmetrical garden trees
    for (let i = 0; i < 8; i++) {
      const gx = cgPos.x - 30 + (i % 4) * 20;
      const gz = cgPos.z - 18 + Math.floor(i / 4) * 36;
      group.add(this.createDoodleTree(gx, 0.3, gz, mats));
    }

    // -----------------------------------------------------------------------
    // IDEATION RIDGE & CREATORS' HILLS (Western Elevated Rolling Terrain)
    // -----------------------------------------------------------------------
    const hills = [
      { mapX: 180, mapY: 150, radius: 45, height: 16 },
      { mapX: 120, mapY: 280, radius: 40, height: 14 },
      { mapX: 150, mapY: 480, radius: 48, height: 18 },
      { mapX: 100, mapY: 620, radius: 42, height: 15 },
    ];

    for (const h of hills) {
      const pos = mapToWorld(h.mapX, h.mapY);
      const mound = new THREE.Mesh(new THREE.CylinderGeometry(h.radius * 0.4, h.radius, h.height, 16), mats.green);
      mound.position.set(pos.x, h.height / 2, pos.z);
      group.add(mound);

      // Lookout pavilion on hilltop
      const hut = new THREE.Mesh(new THREE.ConeGeometry(5, 4, 6), mats.red);
      hut.position.set(pos.x, h.height + 2, pos.z);
      group.add(hut);

      // Hillside pine trees
      for (let p = 0; p < 4; p++) {
        const px = pos.x + (p - 1.5) * 12;
        const pz = pos.z + ((p % 2 === 0) ? 14 : -14);
        group.add(this.createDoodleTree(px, h.height * 0.3, pz, mats));
      }
    }

    return group;
  }

  // =========================================================================
  // 8. SIGNAGE, WAYFINDING & DISTRICT TITLES
  // =========================================================================
  private static buildSignageAndLabels(mats: any): THREE.Group {
    const group = new THREE.Group();
    group.name = "SignageAndLabels";

    // -----------------------------------------------------------------------
    // DIRECTIONAL EXIT SIGNS (Specification 46)
    // -----------------------------------------------------------------------
    const dirSigns = [
      { text: "← TO IDEATION RIDGE", mapX: 280, mapY: 60, rotY: 0 },
      { text: "← TO CREATORS' HILLS", mapX: 80, mapY: 455, rotY: Math.PI / 2 },
      { text: "↓ TO SANDBOX PLAINS", mapX: 150, mapY: 780, rotY: 0 },
      { text: "→ TO GLOBAL MARKETS", mapX: 1500, mapY: 320, rotY: -Math.PI / 2 },
      { text: "→ TO GROWTH VALLEY", mapX: 1430, mapY: 80, rotY: 0 },
    ];

    for (const s of dirSigns) {
      const pos = mapToWorld(s.mapX, s.mapY);
      const signGroup = this.createRoadSign(s.text, mats);
      signGroup.position.set(pos.x, 0, pos.z);
      signGroup.rotation.y = s.rotY;
      group.add(signGroup);
    }

    // -----------------------------------------------------------------------
    // DISTRICT TITLE BILLBOARDS (Specification 50)
    // -----------------------------------------------------------------------
    const districtTitles = [
      { title: "VERTEX CITY", sub: "IDEAS MOVE HERE", mapX: 825, mapY: 380, h: 18 },
      { title: "LAUNCH QUARTER", sub: "IDEAS TAKE OFF", mapX: 825, mapY: 180, h: 14 },
      { title: "PRODUCT SQUARE", sub: "IDEAS MEET USERS", mapX: 610, mapY: 370, h: 12 },
      { title: "FOUNDRY DISTRICT", sub: "BUILD WHAT'S NEXT", mapX: 480, mapY: 210, h: 12 },
      { title: "VENTURE WARD", sub: "CAPITAL FUELS DREAMS", mapX: 1180, mapY: 240, h: 14 },
      { title: "OPEN SOURCE COMMONS", sub: "BUILD TOGETHER", mapX: 1060, mapY: 410, h: 10 },
      { title: "PROTOTYPE PARK", sub: "TEST • ITERATE • IMPROVE", mapX: 310, mapY: 530, h: 10 },
      { title: "MAKER'S PARK", sub: "PEOPLE • NATURE • IDEAS", mapX: 915, mapY: 620, h: 10 },
      { title: "THE HARBOR", sub: "SHIP IDEAS WORLDWIDE", mapX: 1290, mapY: 670, h: 12 },
      { title: "THE YARD", sub: "RAIL • MOVE • SCALE", mapX: 1460, mapY: 90, h: 12 },
      { title: "SIGNAL STATION", sub: "DATA CONNECTS US", mapX: 290, mapY: 330, h: 12 },
      { title: "VENTURE STADIUM", sub: "BIGGER IDEAS", mapX: 1440, mapY: 420, h: 12 },
    ];

    for (const dt of districtTitles) {
      const pos = mapToWorld(dt.mapX, dt.mapY);
      const signMesh = this.createDistrictLabelMesh(dt.title, dt.sub, mats);
      signMesh.position.set(pos.x, dt.h, pos.z);
      group.add(signMesh);
    }

    return group;
  }

  // =========================================================================
  // HELPER BUILDERS
  // =========================================================================

  /** Helper to add a straight paved road between two map coordinates */
  private static addStraightRoad(
    parent: THREE.Group,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number,
    mats: any
  ) {
    const pA = mapToWorld(x1, y1);
    const pB = mapToWorld(x2, y2);
    const seg = new THREE.Vector3().subVectors(pB, pA);
    const len = seg.length();
    const ang = Math.atan2(seg.z, seg.x);
    const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);

    // Road asphalt
    const road = new THREE.Mesh(new THREE.BoxGeometry(len, 0.16, width), mats.blue);
    road.position.set(mid.x, 0.08, mid.z);
    road.rotation.y = -ang;
    road.userData.noCollision = true;
    parent.add(road);

    // Center dash line
    const dash = new THREE.Mesh(new THREE.BoxGeometry(len, 0.18, 0.4), mats.cyan);
    dash.position.set(mid.x, 0.09, mid.z);
    dash.rotation.y = -ang;
    dash.userData.noCollision = true;
    parent.add(dash);

    // Sidewalk curbs
    const curbL = new THREE.Mesh(new THREE.BoxGeometry(len, 0.35, 0.8), mats.black);
    const curbR = new THREE.Mesh(new THREE.BoxGeometry(len, 0.35, 0.8), mats.black);
    curbL.position.set(mid.x, 0.18, mid.z - width / 2 - 0.4);
    curbR.position.set(mid.x, 0.18, mid.z + width / 2 + 0.4);
    curbL.rotation.y = -ang;
    curbR.rotation.y = -ang;
    parent.add(curbL);
    parent.add(curbR);

    // Streetlights along road every 40m
    const numLights = Math.max(1, Math.floor(len / 40));
    for (let i = 0; i <= numLights; i++) {
      const t = i / numLights;
      const lx = pA.x + seg.x * t;
      const lz = pA.z + seg.z * t;
      parent.add(this.createStreetlight(lx, 0, lz - width / 2 - 1.2, mats));
    }
  }

  /** Helper to construct a structural truss bridge */
  private static addTrussBridge(
    parent: THREE.Group,
    pA: THREE.Vector3,
    pB: THREE.Vector3,
    width: number,
    name: string,
    mats: any
  ) {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.name = name;
    const seg = new THREE.Vector3().subVectors(pB, pA);
    const len = seg.length();
    const ang = Math.atan2(seg.z, seg.x);
    const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);

    // Bridge Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(len, 1.2, width), mats.black);
    deck.position.set(mid.x, 2.2, mid.z);
    deck.rotation.y = -ang;
    bridgeGroup.add(deck);

    // Steel Truss Side Girders
    const trussL = new THREE.Mesh(new THREE.BoxGeometry(len, 4.5, 0.6), mats.orange);
    const trussR = new THREE.Mesh(new THREE.BoxGeometry(len, 4.5, 0.6), mats.orange);
    trussL.position.set(mid.x, 4.4, mid.z - width / 2);
    trussR.position.set(mid.x, 4.4, mid.z + width / 2);
    trussL.rotation.y = -ang;
    trussR.rotation.y = -ang;
    bridgeGroup.add(trussL);
    bridgeGroup.add(trussR);

    // Bridge Piers underneath
    const pier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 3.5, 8), mats.black);
    const pier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 3.5, 8), mats.black);
    pier1.position.set(pA.x, 0.8, pA.z);
    pier2.position.set(pB.x, 0.8, pB.z);
    bridgeGroup.add(pier1);
    bridgeGroup.add(pier2);

    parent.add(bridgeGroup);
  }

  /** Helper to create a hand-drawn doodle tree */
  private static createDoodleTree(x: number, y: number, z: number, mats: any): THREE.Group {
    const tree = new THREE.Group();
    tree.name = "DoodleTree";

    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 3.5, 8), mats.black);
    trunk.position.set(x, y + 1.75, z);
    tree.add(trunk);

    // Foliage (Stacked green doodle spheres/cones)
    const fol1 = new THREE.Mesh(new THREE.SphereGeometry(2.2, 10, 10), mats.green);
    fol1.position.set(x, y + 4.2, z);
    fol1.scale.set(1.1, 0.9, 1.1);
    tree.add(fol1);

    const fol2 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.5, 8), mats.green);
    fol2.position.set(x, y + 5.8, z);
    tree.add(fol2);

    return tree;
  }

  /** Helper to create an authentic street light pole */
  private static createStreetlight(x: number, y: number, z: number, mats: any): THREE.Group {
    const light = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 6, 8), mats.black);
    pole.position.set(x, y + 3, z);
    light.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 0.15), mats.black);
    arm.position.set(x + 0.6, y + 6, z);
    light.add(arm);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), mats.orange);
    bulb.position.set(x + 1.2, y + 5.8, z);
    light.add(bulb);

    return light;
  }

  /** Helper to create a 3D road sign gantry */
  private static createRoadSign(text: string, mats: any): THREE.Group {
    const group = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 7, 8), mats.black);
    post.position.set(0, 3.5, 0);
    group.add(post);

    let boardMat = mats.orange;
    if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#e06010";
        ctx.fillRect(0, 0, 512, 128);
        ctx.strokeStyle = "#101420";
        ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, 504, 120);

        ctx.fillStyle = "#faf7ee";
        ctx.font = "bold 34px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(text, 256, 75);
      }
      const tex = new THREE.CanvasTexture(canvas);
      boardMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
    }

    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(16, 3.2, 0.4), boardMat);
    signBoard.position.set(0, 7.2, 0);
    group.add(signBoard);

    // Border trim
    const border = new THREE.Mesh(new THREE.BoxGeometry(16.4, 3.6, 0.2), mats.black);
    border.position.set(0, 7.2, -0.15);
    group.add(border);

    return group;
  }

  /** Helper to create district label billboard */
  private static createDistrictLabelMesh(title: string, sub: string, mats: any): THREE.Mesh {
    if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 160;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#faf7ee";
        ctx.fillRect(0, 0, 512, 160);

        ctx.strokeStyle = "#1a30c0";
        ctx.lineWidth = 8;
        ctx.strokeRect(6, 6, 500, 148);

        ctx.fillStyle = "#1a30c0";
        ctx.font = "bold 44px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(title, 256, 68);

        ctx.fillStyle = "#d02030";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(sub, 256, 120);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(28, 9), mat);
      mesh.userData.noCollision = true;
      return mesh;
    }
    const placeholder = new THREE.Mesh(new THREE.PlaneGeometry(28, 9), mats.orange);
    placeholder.userData.noCollision = true;
    return placeholder;
  }

  /** Resolve materials using doodle shader materials or standard fallbacks */
  private static getMaterials(city?: any) {
    if (city && city.defaultMats) {
      return city.defaultMats;
    }
    return {
      paper: new THREE.MeshBasicMaterial({ color: 0xfaf7ee }),
      blue: new THREE.MeshBasicMaterial({ color: 0x1a30c0 }),
      orange: new THREE.MeshBasicMaterial({ color: 0xe06010 }),
      red: new THREE.MeshBasicMaterial({ color: 0xd02030 }),
      cyan: new THREE.MeshBasicMaterial({ color: 0x00b4d8 }),
      green: new THREE.MeshBasicMaterial({ color: 0x22c55e }),
      black: new THREE.MeshBasicMaterial({ color: 0x18181b }),
    };
  }
}
