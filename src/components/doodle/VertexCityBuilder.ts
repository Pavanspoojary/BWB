import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * ROADS-ONLY MAP — VERTEX CITY
 * REFERENCE CANVAS: 1660 x 1107 px, X west->east, Y north->south.
 * Founder Circle anchor: map (825, 470).
 * 3D WORLD SCALE: 10 map px = 1 world unit  =>  city spans 166 x 110.7 units.
 *
 * Contents: orbital highway, radial boulevards, concentric rings, curved
 * arterials, rectangular local streets, diagonal corridors, bridges
 * (flyovers), interchange ramps, roundabouts and railway corridors.
 * NO buildings, NO water, NO parks, NO labels, NO text — roads only.
 */

export const VERTEX_CANVAS = {
  width: 1660,
  height: 1107,
  centerX: 825,
  centerY: 470,
  scale: 0.1,
};

/** Map pixels -> world units. */
export function mx(px: number): number {
  return (px - VERTEX_CANVAS.centerX) * VERTEX_CANVAS.scale;
}
/** Map pixels (Y south) -> world Z. */
export function mz(py: number): number {
  return (py - VERTEX_CANVAS.centerY) * VERTEX_CANVAS.scale;
}
/** Map point pair -> world [X, Z]. */
export function mp(x: number, y: number): [number, number] {
  return [mx(x), mz(y)];
}

/** Convert 2D map pixel coordinates to 3D world space (X, Y elevation, Z). */
export function mapToWorld(mapX: number, mapY: number, elevation: number = 0): THREE.Vector3 {
  return new THREE.Vector3(mx(mapX), elevation, mz(mapY));
}

/** Convert 3D world space (X, Z) back to 2D map pixel coordinates. */
export function worldToMap(worldX: number, worldZ: number): { x: number; y: number } {
  const x = worldX / VERTEX_CANVAS.scale + VERTEX_CANVAS.centerX;
  const y = worldZ / VERTEX_CANVAS.scale + VERTEX_CANVAS.centerY;
  return { x, y };
}

type Pt = [number, number]; // map-pixel [x, y] pair

export class VertexCityBuilder {
  public static buildVertexCity(city: any): THREE.Group {
    const root = new THREE.Group();
    root.name = "VertexCity_Root";
    const mats = this.getMaterials(city);

    resetPaint();
    this.buildHighways(root, mats);
    this.buildRadials(root, mats);
    this.buildRings(root, mats);
    this.buildArterials(root, mats);
    this.buildLocalGrids(root, mats);
    this.buildRoundabouts(root, mats);
    this.buildBridges(root, mats);
    this.buildRail(root, mats);
    this.buildStreetFurniture(root, mats);
    flushPaint(root, mats);

    return root;
  }

  // =====================================================================
  // Paint collectors: all lane paint merges into 2 meshes (zero clutter)
  // =====================================================================

  // =====================================================================
  // §2+§20 highways, §3 interchange, coastal link
  // =====================================================================
  private static buildHighways(root: THREE.Group, mats: any) {
    // Outer orbital, northern arc
    this.divided(
      root, mats,
      [[180, 215], [250, 110], [390, 55], [600, 35], [850, 35], [1100, 45], [1300, 65], [1430, 110], [1500, 180], [1530, 300]],
      21, 8, { laneDashes: true, edges: true }
    );
    // Outer orbital, southern/western arc
    this.divided(
      root, mats,
      [[1450, 700], [1350, 820], [1100, 900], [850, 930], [600, 930], [350, 900], [180, 820], [120, 650], [110, 500], [130, 340], [180, 215]],
      21, 8, { laneDashes: true, edges: true }
    );
    // Eastern coastal road closes the orbital loop
    this.divided(
      root, mats,
      [[1500, 180], [1560, 300], [1570, 470], [1530, 640], [1450, 700]],
      16, 6, { laneDashes: true, edges: true }
    );
    // Southern highway
    this.divided(
      root, mats,
      [[150, 850], [350, 885], [550, 910], [800, 925], [1050, 920], [1250, 875], [1450, 820]],
      21, 8, { laneDashes: true, edges: true }
    );
    // §3 northern interchange ramps (looping connectors around the ring)
    const ramps: Pt[][] = [
      [[1080, 60], [1120, 85], [1150, 105]],
      [[1295, 70], [1250, 95], [1218, 118]],
      [[1150, 150], [1165, 125], [1180, 110]],
      [[700, 42], [760, 70], [820, 120]],
      [[180, 820], [150, 845], [150, 850]],
    ];
    for (const ramp of ramps) {
      this.road(root, mats, ramp, 9, { dashes: false, edges: true });
    }
  }

  // =====================================================================
  // §4-§6 western entry + primary N-S / E-W radial boulevards
  // =====================================================================
  private static buildRadials(root: THREE.Group, mats: any) {
    // Western entry arterial, merging into the east-west radial
    this.divided(root, mats, [[0, 455], [180, 455], [350, 450], [500, 450], [650, 455], [700, 470]], 16, 6, {
      laneDashes: true, edges: true,
    });
    // Rails touch the roundabout ring (r=35) without gaps
    this.divided(root, mats, [[825, 35], [825, 150], [825, 280], [825, 390], [825, 436]], 18, 7, {
      laneDashes: true, edges: true,
    });
    this.divided(root, mats, [[825, 504], [825, 600], [825, 760], [825, 930]], 18, 7, {
      laneDashes: true, edges: true,
    });
    // East-west radial, split around Founder Circle
    this.divided(root, mats, [[150, 470], [300, 470], [500, 470], [650, 470], [791, 470]], 18, 7, {
      laneDashes: true, edges: true,
    });
    this.divided(root, mats, [[859, 470], [1000, 470], [1200, 470], [1450, 470], [1660, 470]], 18, 7, {
      laneDashes: true, edges: true,
    });
  }

  // =====================================================================
  // §7-§9 concentric rings around Founder Circle
  // =====================================================================
  private static buildRings(root: THREE.Group, mats: any) {
    // Ring 1 — smooth circle, r=100
    this.road(root, mats, circlePts(825, 470, 100, 28), 10, { dashes: true, closed: true });
    // Ring 2 — slightly imperfect, r=190 + wobble
    const r2: Pt[] = [];
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const r = 190 + 8 * Math.sin(3 * a);
      r2.push([825 + r * Math.cos(a), 470 + r * Math.sin(a)]);
    }
    this.road(root, mats, r2, 12, { dashes: true, closed: true });
    // Ring 3 — major distributor, r=300 + wobble
    const r3: Pt[] = [];
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2;
      const r = 300 + 10 * Math.sin(2 * a + 1);
      r3.push([825 + r * Math.cos(a), 470 + r * Math.sin(a)]);
    }
    this.road(root, mats, r3, 16, { dashes: true, closed: true });
  }

  // =====================================================================
  // §10-§19 radial networks + named diagonal/arterial corridors
  // =====================================================================
  private static buildArterials(root: THREE.Group, mats: any) {
    const FC: Pt = [825, 470];
    const radial = (tx: number, ty: number) => radialPts(FC, tx, ty);

    // §10 northwest radials (curved spokes)
    this.road(root, mats, radial(500, 170), 9, { dashes: true });
    this.road(root, mats, radial(350, 300), 9, { dashes: true });
    this.road(root, mats, radial(250, 450), 9, { dashes: true });
    this.road(root, mats, radial(500, 90), 9, { dashes: true });
    // §11 northeast radials
    this.road(root, mats, radial(1000, 170), 9, { dashes: true });
    this.road(root, mats, radial(1120, 250), 9, { dashes: true });
    this.road(root, mats, radial(1250, 350), 9, { dashes: true });
    this.road(root, mats, radial(1450, 300), 9, { dashes: true });
    // §12 southwest radials
    this.road(root, mats, radial(600, 650), 9, { dashes: true });
    this.road(root, mats, radial(500, 750), 9, { dashes: true });
    this.road(root, mats, radial(350, 850), 9, { dashes: true });
    this.road(root, mats, radial(180, 850), 9, { dashes: true });
    // §13 southeast radials
    this.road(root, mats, radial(1000, 600), 9, { dashes: true });
    this.road(root, mats, radial(1130, 700), 9, { dashes: true });
    this.road(root, mats, radial(1250, 800), 9, { dashes: true });
    this.road(root, mats, radial(1400, 850), 9, { dashes: true });

    // §14 Build Street (diagonal, touches the orbital)
    this.road(root, mats, [[350, 350], [470, 260], [570, 180], [650, 120], [660, 60]], 9, { dashes: true });
    // §15 Kernel Road (NE/SW diagonal arterial, divided)
    this.divided(
      root, mats,
      [[1100, 50], [1000, 160], [920, 270], [850, 380], [760, 500], [650, 620], [520, 760], [400, 900]],
      14, 5, { laneDashes: true, edges: true }
    );
    // §16 Sprint Street (split around Founder Circle)
    this.road(root, mats, [[400, 430], [550, 430], [700, 440], [791, 464]], 9, { dashes: true });
    this.road(root, mats, [[859, 476], [950, 450], [1100, 440], [1250, 450]], 9, { dashes: true });
    // §17 Stack Road (lands on the SW radial)
    this.road(root, mats, [[690, 430], [640, 500], [590, 570], [530, 640], [535, 720]], 8, { dashes: true });
    // §18 API Boulevard (divided, runs to the southern highway)
    this.divided(root, mats, [[1120, 170], [1120, 300], [1120, 450], [1130, 600], [1150, 760], [1205, 895]], 14, 6, {
      laneDashes: true, edges: true,
    });
    // §19 Investor Boulevard (divided, orbital ring to southern highway)
    this.divided(root, mats, [[1225, 85], [1250, 100], [1250, 250], [1230, 400], [1250, 550], [1300, 700], [1350, 850]], 14, 6, {
      laneDashes: true, edges: true,
    });
    // Harbor main boulevard (§22)
    this.divided(root, mats, [[1050, 750], [1180, 760], [1320, 730], [1450, 700]], 14, 6, {
      laneDashes: true, edges: true,
    });
  }

  // =====================================================================
  // §21-§24, §27-§28 local grids, prototype curves, harbor, stadium, outer
  // =====================================================================
  private static buildLocalGrids(root: THREE.Group, mats: any) {
    // Central secondary arcs (bend with the rings, cross radials as junctions)
    this.road(root, mats, circlePts(825, 470, 130, 36), 7, { closed: true });
    this.road(root, mats, circlePts(825, 470, 160, 40), 7, { closed: true });
    this.road(root, mats, arcPts(825, 470, 220, 25, 155, 30), 8, {});
    this.road(root, mats, arcPts(825, 470, 260, 25, 155, 34), 8, {});

    // Prototype curved network (§21, no rigid grid)
    this.road(root, mats, [[300, 450], [280, 550], [330, 680], [450, 750]], 8, {});
    this.road(root, mats, [[280, 550], [200, 610], [150, 700]], 7, {});
    this.road(root, mats, [[330, 680], [260, 730], [275, 845]], 7, {});
    // Prototype-to-center link + north link into the east-west radial
    this.road(root, mats, [[450, 750], [520, 610]], 7, {});
    this.road(root, mats, [[520, 580], [520, 470]], 7, {});

    // Harbor parallel + connectors (§22)
    this.road(root, mats, [[1050, 810], [1200, 800], [1400, 770]], 8, {});
    this.road(root, mats, [[1120, 730], [1120, 810]], 7, {});
    this.road(root, mats, [[1300, 720], [1300, 790]], 7, {});
    this.road(root, mats, [[1180, 790], [1180, 893]], 8, {});

    // Stadium access oval (§23) + spurs
    const oval: Pt[] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      oval.push([1430 + 70 * Math.cos(a), 470 + 55 * Math.sin(a)]);
    }
    this.road(root, mats, oval, 10, { dashes: true, closed: true });
    this.road(root, mats, [[1430, 415], [1430, 350], [1420, 300]], 8, {});
    this.road(root, mats, [[1500, 470], [1560, 470]], 8, {});

    // Northeast industrial truck grid (§24, generous radii via curves)
    for (const gx of [1340, 1420, 1500]) {
      this.road(root, mats, [[gx, 70], [gx, 280]], 10, {});
    }
    for (const gy of [120, 200, 270]) {
      this.road(root, mats, [[1250, gy], [1560, gy]], 10, {});
    }

    // Outer curved streets (§28, sparse + sweeping)
    this.road(root, mats, [[250, 300], [180, 455], [200, 600]], 7, {});
    this.road(root, mats, [[100, 600], [150, 750], [330, 884]], 7, {});
    this.road(root, mats, [[600, 120], [750, 90], [950, 100], [1100, 100]], 8, {});
  }

  // =====================================================================
  // §25 roundabouts (7) with islands + approach paint
  // =====================================================================
  private static buildRoundabouts(root: THREE.Group, mats: any) {
    const rbs: [number, number, number][] = [
      [825, 470, 35], // 1 Founder Circle
      [520, 350, 30], // 2 western
      [1180, 105, 45], // 3 interchange
      [1120, 390, 28], // 4 venture junction
      [520, 610, 30], // 5 prototype junction
      [1130, 700, 32], // 6 harbor junction
      [300, 850, 30], // 7 southern
    ];
    for (const [cx, cy, r] of rbs) {
      // Asphalt ring
      const ring = new THREE.Mesh(new THREE.RingGeometry((r - 14) * 0.1, r * 0.1, 40), mats.black);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(mx(cx), nextLift() + 0.02, mz(cy));
      ring.userData.noCollision = true;
      root.add(ring);
      // Island disc + curb
      const isl = new THREE.Mesh(new THREE.CircleGeometry((r - 14) * 0.1, 32), mats.black);
      isl.rotation.x = -Math.PI / 2;
      isl.position.set(mx(cx), nextLift() + 0.015, mz(cy));
      isl.userData.noCollision = true;
      root.add(isl);
      const curb = new THREE.Mesh(new THREE.TorusGeometry((r - 14) * 0.1, 0.12, 6, 32), mats.orange);
      curb.rotation.x = Math.PI / 2;
      curb.position.set(mx(cx), 0.18, mz(cy));
      curb.userData.noCollision = true;
      root.add(curb);
    }

    // Founder Circle monument (auction-block obelisk, the map anchor)
    const fx = mx(825);
    const fz = mz(470);
    const obBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 2.2), mats.black);
    obBase.position.set(fx, 0.4, fz);
    const obShaft = new THREE.Mesh(new THREE.BoxGeometry(1.1, 5.0, 1.1), mats.blue);
    obShaft.position.set(fx, 3.3, fz);
    const obCap = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.3, 4), mats.orange);
    obCap.position.set(fx, 6.4, fz);
    obCap.rotation.y = Math.PI / 4;
    const obBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), mats.red);
    obBeacon.position.set(fx, 7.4, fz);
    obBeacon.userData.noCollision = true;
    root.add(obBase, obShaft, obCap, obBeacon);

    // Center bollards on the other six islands
    for (const [cx, cy] of [[520, 350], [1180, 105], [1120, 390], [520, 610], [1130, 700], [300, 850]]) {
      const bol = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), mats.black);
      bol.position.set(mx(cx), 0.6, mz(cy));
      root.add(bol);
    }

    // Crosswalks at roundabout approaches (clear of the rings, map px)
    const cw: [number, number, boolean][] = [
      [825, 420, false], [877, 470, true],
      [495, 350, true], [520, 312, false],
      [1180, 158, false], [1233, 105, true],
      [1120, 354, false], [1156, 390, true],
      [482, 610, true], [520, 648, false],
      [1090, 700, true], [1130, 740, false],
      [262, 850, true], [300, 812, false],
    ];
    for (const [cx, cy, alongX] of cw) crosswalk(cx, cy, alongX);
    // Stop bars at Founder Circle entries
    stopbar(825, 428, true);
    stopbar(825, 512, true);
    stopbar(783, 470, false);
    stopbar(867, 470, false);
  }

  // =====================================================================
  // §26 flyover bridges (no river drawn — grade separations)
  // =====================================================================
  private static buildBridges(root: THREE.Group, mats: any) {
    // B1 over the southwestern convergence
    this.flyover(root, mats, 620, 575, 760, 650, 15);
    // B2 over the southeastern radials
    this.flyover(root, mats, 900, 540, 1050, 630, 16);
    // B3 carrying the harbor diagonal over API Boulevard
    this.flyover(root, mats, 1050, 630, 1190, 720, 14);
    // Kernel Road flyover where it crosses the north-south radial
    this.flyover(root, mats, 860, 368, 786, 458, 12);
  }

  private static flyover(
    root: THREE.Group, mats: any,
    x1: number, y1: number, x2: number, y2: number, wPx: number
  ) {
    const ax = mx(x1);
    const az = mz(y1);
    const bx = mx(x2);
    const bz = mz(y2);
    const dx = bx - ax;
    const dz = bz - az;
    const len = Math.hypot(dx, dz);
    const rotY = Math.atan2(-dz, dx);
    const cx = (ax + bx) / 2;
    const cz = (az + bz) / 2;
    const wU = wPx * VERTEX_CANVAS.scale;

    const deck = new THREE.Mesh(new THREE.BoxGeometry(len, 0.5, wU), mats.black);
    deck.position.set(cx, 2.75, cz);
    deck.rotation.y = rotY;
    deck.userData.noCollision = true;
    root.add(deck);
    // Railings (overhead decor — jump-through safe)
    for (const s of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.8, 0.22), mats.orange);
      rail.position.set(
        cx - Math.sin(rotY) * s * (wU / 2),
        3.35,
        cz - Math.cos(rotY) * s * (wU / 2)
      );
      rail.rotation.y = rotY;
      rail.userData.noCollision = true;
      root.add(rail);
    }
    // Piers at both ends
    for (const t of [0.12, 0.88]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.5, wU * 0.7), mats.black);
      pier.position.set(ax + dx * t, 1.25, az + dz * t);
      pier.rotation.y = rotY;
      root.add(pier);
    }
    // Deck center dashes ride on top of the deck
    const curve = new THREE.LineCurve3(new THREE.Vector3(ax, 0, az), new THREE.Vector3(bx, 0, bz));
    dashesAlong(curve, len, 0, 3.06, 0);
  }

  // =====================================================================
  // Railway corridors (southern main + northeastern spur)
  // =====================================================================
  private static buildRail(root: THREE.Group, mats: any) {
    const lines: Pt[][] = [
      [[0, 895], [400, 912], [800, 930], [1100, 905], [1300, 830], [1450, 705]],
      [[1300, 830], [1380, 650], [1420, 450], [1430, 280]],
    ];
    for (const pts of lines) {
      const curve = curveFrom(pts, false);
      // Ballast bed (world-unit widths: 0.9 bed, 0.11 rails)
      const bal = ribbonMesh(pts, 0.9, 0.07, mats.black, false);
      root.add(bal);
      // Twin steel rails
      for (const s of [-2.2, 2.2]) {
        const railPts = offsetPts(pts, s);
        const rail = ribbonMesh(railPts, 0.11, 0.1, mats.blue, false);
        root.add(rail);
      }
      // Sleepers stamped along the curve
      const len = curve.getLength() * 10; // approx map px
      const n = Math.floor(len / 8);
      const p = new THREE.Vector3();
      const t = new THREE.Vector3();
      for (let i = 0; i <= n; i++) {
        const u = i / Math.max(1, n);
        curve.getPoint(u, p);
        curve.getTangent(u, t);
        stamp(
          sleeperGeos, 0.24, 0.07, 1.0,
          p.x, 0.09, p.z, Math.atan2(-t.z, t.x)
        );
      }
    }
  }

  // =====================================================================
  // Lamps, signals, blank blades (§30 furniture, §31 control)
  // =====================================================================
  private static buildStreetFurniture(root: THREE.Group, mats: any) {
    const lampAt = (wx: number, wz: number, armDir: number) => {
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.32, 6.2, 0.32), mats.black);
      pole.position.set(wx, 3.1, wz);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.22, 0.22), mats.black);
      arm.position.set(wx + armDir * 0.85, 6.1, wz);
      arm.userData.noCollision = true;
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.3, 0.55), mats.cyan);
      head.position.set(wx + armDir * 1.6, 5.95, wz);
      head.userData.noCollision = true;
      root.add(pole, arm, head);
    };
    // Lamps along the north-south radial (world x=-0.5), clear of Ring 1
    for (const side of [-5.5, 5.5]) {
      for (const lz of [-45, 15, 45]) {
        lampAt(-0.5 + side, lz, side > 0 ? -1 : 1);
      }
    }
    // Lamps along the east-west radial (world z=-8.35), clear of the circle
    for (const lx of [-60, -30, 30, 60]) {
      lampAt(lx, -8.35 + 5.5, 0);
      const pole2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 6.2, 0.32), mats.black);
      pole2.position.set(lx, 3.1, -8.35 - 5.5);
      const head2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.3, 0.55), mats.cyan);
      head2.position.set(lx, 5.95, -8.35 - 5.5);
      head2.userData.noCollision = true;
      root.add(pole2, head2);
    }
    // Signal poles at four outer roundabout corners (map px)
    const corners: [number, number, boolean][] = [
      [1165, 435, true], [1175, 745, false], [565, 395, true], [565, 655, false],
    ];
    for (const [pmx, pmy, green] of corners) {
      const px = mx(pmx);
      const pz = mz(pmy);
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.42, 5.8, 0.42), mats.black);
      pole.position.set(px, 2.9, pz);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.8, 0.75), mats.black);
      head.position.set(px, 5.4, pz);
      root.add(pole, head);
      const cols = green ? [mats.black, mats.black, mats.green] : [mats.red, mats.black, mats.black];
      cols.forEach((lm, i) => {
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), lm);
        lamp.position.set(px, 5.95 - i * 0.55, pz + 0.4);
        lamp.userData.noCollision = true;
        root.add(lamp);
      });
    }
    // Blank wayfinding blades at the Founder Circle exits (no text — roads only)
    const blades: [number, number, number][] = [
      [-0.5, -16, 0], [-0.5, -0.5, 0], [7, -8.35, Math.PI / 2], [-8, -8.35, Math.PI / 2],
    ];
    for (const [bx, bz, rot] of blades) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.4, 0.24), mats.black);
      post.position.set(bx, 1.7, bz);
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.1), mats.green);
      b1.position.set(bx, 3.2, bz);
      b1.rotation.y = rot;
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.1), mats.blue);
      b2.position.set(bx, 2.6, bz);
      b2.rotation.y = rot + Math.PI / 2;
      root.add(post, b1, b2);
    }
  }

  // =====================================================================
  // Core road-drawing primitives
  // =====================================================================

  /** Single asphalt ribbon + optional paint. */
  private static road(
    root: THREE.Group, mats: any, pts: Pt[], wPx: number,
    opts: { dashes?: boolean; edges?: boolean; closed?: boolean } = {}
  ) {
    const wU = wPx * VERTEX_CANVAS.scale;
    const y = nextLift();
    const mesh = ribbonMesh(pts, wU, y, mats.black, !!opts.closed);
    root.add(mesh);
    const curve = curveFrom(pts, !!opts.closed);
    if (opts.dashes) {
      dashesAlong(curve, curve.getLength(), wU, 0.35, y + 0.05);
    }
    if (opts.edges) {
      for (const s of [-1, 1]) {
        const off = offsetPts(pts, s * (wPx / 2 - 1));
        const edge = ribbonMesh(off, 0.12, y + 0.045, mats.cyan, !!opts.closed);
        root.add(edge);
      }
    }
  }

  /** Divided boulevard: two carriageways with a paper median + barriers. */
  private static divided(
    root: THREE.Group, mats: any, pts: Pt[], lanePx: number, medianPx: number,
    opts: { laneDashes?: boolean; edges?: boolean } = {}
  ) {
    const offPx = lanePx / 2 + medianPx / 2;
    for (const s of [-1, 1]) {
      const side = offsetPts(pts, s * offPx);
      const wU = lanePx * VERTEX_CANVAS.scale;
      const y = nextLift();
      root.add(ribbonMesh(side, wU, y, mats.black, false));
      const curve = curveFrom(side, false);
      if (opts.laneDashes) {
        dashesAlong(curve, curve.getLength(), wU, 0.32, y + 0.05);
      }
      if (opts.edges) {
        for (const e of [-1, 1]) {
          const eo = offsetPts(side, e * (lanePx / 2 - 1));
          root.add(ribbonMesh(eo, 0.12, y + 0.045, mats.cyan, false));
        }
      }
    }
    // Median barrier blocks along the middle
    const curve = curveFrom(pts, false);
    const len = curve.getLength();
    const n = Math.floor(len / 9);
    const p = new THREE.Vector3();
    const t = new THREE.Vector3();
    for (let i = 0; i <= n; i++) {
      const u = n === 0 ? 0 : i / n;
      curve.getPoint(u, p);
      curve.getTangent(u, t);
      stamp(orangeGeos, 1.2, 0.5, 0.4, p.x, 0.3, p.z, Math.atan2(-t.z, t.x));
    }
  }

  private static getMaterials(city?: any) {
    if (city && city.defaultMats) {
      return city.defaultMats;
    }
    return {
      blue: new THREE.MeshBasicMaterial({ color: 0x1a30c0 }),
      red: new THREE.MeshBasicMaterial({ color: 0xd02030 }),
      black: new THREE.MeshBasicMaterial({ color: 0x111118 }),
      orange: new THREE.MeshBasicMaterial({ color: 0xe06010 }),
      green: new THREE.MeshBasicMaterial({ color: 0x059669 }),
      cyan: new THREE.MeshBasicMaterial({ color: 0x00b4d8 }),
      paper: new THREE.MeshBasicMaterial({ color: 0xf5f0dd }),
    };
  }
}

// =====================================================================
// Module paint collectors (reset per build, merged into 3 meshes)
// =====================================================================
const orangeGeos: THREE.BufferGeometry[] = [];
const cyanGeos: THREE.BufferGeometry[] = [];
const sleeperGeos: THREE.BufferGeometry[] = [];
let liftIdx = 0;

function resetPaint() {
  orangeGeos.length = 0;
  cyanGeos.length = 0;
  sleeperGeos.length = 0;
  liftIdx = 0;
}

/** Tiny per-road lift so overlapping ribbons never z-fight. */
function nextLift(): number {
  return 0.1 + liftIdx++ * 0.0035;
}

/** Stamp one paint box into a merge list. */
function stamp(
  list: THREE.BufferGeometry[], w: number, h: number, d: number,
  x: number, y: number, z: number, rotY = 0
) {
  const g = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Matrix4().makeRotationY(rotY);
  m.setPosition(x, y, z);
  g.applyMatrix4(m);
  list.push(g);
}

/** Merge collected paint into single meshes. */
function flushPaint(root: THREE.Group, mats: any) {
  const jobs: [THREE.BufferGeometry[], any][] = [
    [orangeGeos, mats.orange],
    [cyanGeos, mats.cyan],
    [sleeperGeos, mats.black],
  ];
  for (const [list, mat] of jobs) {
    if (list.length === 0) continue;
    const merged = mergeGeometries(list, false);
    const mesh = new THREE.Mesh(merged, mat);
    mesh.userData.noCollision = true;
    root.add(mesh);
    for (const g of list) g.dispose();
  }
}

/** Smooth curve through map-pixel points. */
function curveFrom(pts: Pt[], closed: boolean): THREE.CatmullRomCurve3 {
  const v3 = pts.map(([x, y]) => new THREE.Vector3(mx(x), 0, mz(y)));
  return new THREE.CatmullRomCurve3(v3, closed, "centripetal");
}

/** Flat asphalt ribbon following map-pixel points. */
function ribbonMesh(pts: Pt[], wU: number, y: number, mat: any, closed: boolean): THREE.Mesh {
  const curve = curveFrom(pts, closed);
  const segs = Math.max(24, pts.length * 8);
  const pos: number[] = [];
  const idx: number[] = [];
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    curve.getPoint(u, p);
    curve.getTangent(u, t);
    let nx = -t.z;
    let nz = t.x;
    const l = Math.hypot(nx, nz) || 1;
    nx /= l;
    nz /= l;
    pos.push(p.x - (nx * wU) / 2, y, p.z - (nz * wU) / 2);
    pos.push(p.x + (nx * wU) / 2, y, p.z + (nz * wU) / 2);
    if (i < segs) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.noCollision = true;
  return mesh;
}

/** Offset map-pixel points laterally by dPx (for carriageways/edges/rails). */
function offsetPts(pts: Pt[], dPx: number): Pt[] {
  return pts.map(([x, y], i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    return [x - dy * dPx, y + dx * dPx] as Pt;
  });
}

/** Points along a circle (map px). */
function circlePts(cx: number, cy: number, rPx: number, n: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + rPx * Math.cos(a), cy + rPx * Math.sin(a)]);
  }
  return pts;
}

/** Points along a partial arc (degrees, map-y-south clockwise). */
function arcPts(cx: number, cy: number, rPx: number, a0deg: number, a1deg: number, n: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0deg + ((a1deg - a0deg) * i) / n) * Math.PI) / 180;
    pts.push([cx + rPx * Math.cos(a), cy + rPx * Math.sin(a)]);
  }
  return pts;
}

/** Curved radial spoke: Founder Circle edge -> target, bowed sideways. */
function radialPts(from: Pt, tx: number, ty: number): Pt[] {
  const dx = tx - from[0];
  const dy = ty - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const sx = from[0] + (dx / len) * 105;
  const sy = from[1] + (dy / len) * 105;
  // Bow control point perpendicular to the spoke for a natural curve
  const bow = len * 0.06;
  const nx = -dy / len;
  const ny = dx / len;
  return [
    [sx, sy],
    [sx + dx * 0.33 + nx * bow, sy + dy * 0.33 + ny * bow],
    [sx + dx * 0.66 - nx * bow * 0.5, sy + dy * 0.66 - ny * bow * 0.5],
    [tx, ty],
  ];
}

/** Orange center dashes along a curve (skips nothing — caller splits roads). */
function dashesAlong(curve: THREE.CatmullRomCurve3 | THREE.LineCurve3, lenU: number, _wU: number, y: number, _y2: number) {
  void _wU;
  void _y2;
  const spacing = 4.2;
  const dashLen = 1.6;
  const n = Math.max(1, Math.floor(lenU / spacing));
  const p = new THREE.Vector3();
  const t = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    curve.getPoint(u, p);
    curve.getTangent(u, t);
    stamp(orangeGeos, dashLen, 0.05, 0.24, p.x, y, p.z, Math.atan2(-t.z, t.x));
  }
}

/** Zebra crossing. alongX=true crosses an east-west road. */
function crosswalk(cx: number, cy: number, alongX: boolean) {
  const x = mx(cx);
  const z = mz(cy);
  // Stamped high: always above the stacked asphalt ribbons below.
  for (let i = -2; i <= 2; i++) {
    if (alongX) {
      stamp(cyanGeos, 4.2, 0.05, 0.55, x, 0.42, z + i * 1.15, 0);
    } else {
      stamp(cyanGeos, 0.55, 0.05, 4.2, x + i * 1.15, 0.42, z, 0);
    }
  }
}

/** Stop bar across a road. alongX=true bars an east-west road. */
function stopbar(cx: number, cy: number, alongX: boolean) {
  const x = mx(cx);
  const z = mz(cy);
  if (alongX) {
    stamp(cyanGeos, 5.5, 0.05, 0.6, x, 0.42, z, 0);
  } else {
    stamp(cyanGeos, 0.6, 0.05, 5.5, x, 0.42, z, 0);
  }
}
