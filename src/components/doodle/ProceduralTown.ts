import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Procedural mini-town on the island, Infinitown-style:
 * dense randomized blocks, glowing windows, entrances, fire escapes,
 * rooftop clutter, street props, lamps, pedestrians, a pier with a boat
 * and circulating traffic with headlights. Seeded RNG => stable layout.
 * Small trim merges into a handful of draw calls.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Mover {
  group: THREE.Group;
  pts: THREE.Vector3[];
  cum: number[];
  total: number;
  dist: number;
  speed: number;
  bob: number;
  wheels: THREE.Mesh[];
}

interface Floater {
  group: THREE.Group;
  baseY: number;
  phase: number;
}

const STREET_XS = [-30, 0, 30];
const STREET_ZS = [-30, 0, 30];
const STREET_W = 5;

export class ProceduralTown {
  private movers: Mover[] = [];
  private floaters: Floater[] = [];
  private elapsed = 0;
  private labels: { x: number; y: number; z: number }[] = [];

  // Merged trim collectors (flushed once at the end of construction)
  private trimBlack: THREE.BufferGeometry[] = [];
  private trimOrange: THREE.BufferGeometry[] = [];
  private trimRed: THREE.BufferGeometry[] = [];
  private trimGreen: THREE.BufferGeometry[] = [];
  private cyanWin: THREE.BufferGeometry[] = [];
  private orangeWin: THREE.BufferGeometry[] = [];

  constructor(private engine: any, private city: any) {
    const mats = city.defaultMats;
    const rand = mulberry32(20260913);
    const root = new THREE.Group();
    root.name = "ProceduralTown";

    this.buildStreets(root, mats);
    this.buildBlocks(root, mats, rand);
    this.buildNumberPlates(root);
    this.buildLamps(root, mats);
    this.buildStreetProps(root, mats);
    this.buildTrees();
    this.buildPedestrians(root, mats);
    this.buildTraffic(root, mats, rand);
    this.buildPier(root, mats);
    this.flushTrim(root, mats);

    engine.scene.add(root);
    city.buildings.push(root);
    city.updateColliders();
  }

  /** Advance traffic, pedestrians and the moored boat. Called every frame. */
  public update(delta: number) {
    this.elapsed += delta;
    for (const m of this.movers) {
      m.dist = (((m.dist + m.speed * delta) % m.total) + m.total) % m.total;
      let i = 0;
      while (i < m.cum.length - 2 && m.cum[i + 1] < m.dist) i++;
      const segStart = m.cum[i];
      const segLen = m.cum[i + 1] - segStart || 1;
      const t = (m.dist - segStart) / segLen;
      const a = m.pts[i % m.pts.length];
      const b = m.pts[(i + 1) % m.pts.length];
      const bobY = m.bob > 0 ? Math.abs(Math.sin(this.elapsed * 9 + m.dist)) * m.bob : 0;
      m.group.position.set(a.x + (b.x - a.x) * t, bobY, a.z + (b.z - a.z) * t);
      m.group.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
      // Rolling wheels: forward roll about the local X axle
      if (m.wheels.length > 0) {
        const spin = ((m.speed * delta) / 0.35) * Math.sign(m.speed);
        for (const w of m.wheels) w.rotation.x += spin;
      }
    }
    for (const f of this.floaters) {
      f.group.position.y = f.baseY + Math.sin(this.elapsed * 1.4 + f.phase) * 0.15;
      f.group.rotation.z = Math.sin(this.elapsed * 1.1 + f.phase) * 0.04;
    }
  }

  // ------------------------------------------------------------------
  // Streets: 3x3 grid + center dashes + crosswalks
  // ------------------------------------------------------------------
  private buildStreets(root: THREE.Group, mats: any) {
    const dashGeos: THREE.BufferGeometry[] = [];
    const crossGeos: THREE.BufferGeometry[] = [];
    for (const ax of STREET_XS) {
      const road = new THREE.Mesh(new THREE.BoxGeometry(STREET_W, 0.12, 110), mats.black);
      road.position.set(ax, 0.06, 0);
      road.userData.noCollision = true;
      root.add(road);
      for (let z = -52; z <= 52; z += 4.2) {
        if (Math.abs(z) < 9) continue;
        let nearCross = false;
        for (const sz of STREET_ZS) {
          if (Math.abs(z - sz) < 6) {
            nearCross = true;
            break;
          }
        }
        if (nearCross) continue;
        dashGeos.push(this.stampBox(0.24, 0.05, 1.6, ax, 0.15, z, 0));
      }
    }
    for (const sz of STREET_ZS) {
      const road = new THREE.Mesh(new THREE.BoxGeometry(110, 0.12, STREET_W), mats.black);
      road.position.set(0, 0.06, sz);
      road.userData.noCollision = true;
      root.add(road);
      for (let x = -52; x <= 52; x += 4.2) {
        if (Math.abs(x) < 9) continue;
        let near = false;
        for (const ax of STREET_XS) {
          if (Math.abs(x - ax) < 6) {
            near = true;
            break;
          }
        }
        if (near) continue;
        dashGeos.push(this.stampBox(1.6, 0.05, 0.24, x, 0.15, sz, 0));
      }
    }
    // Crosswalks on the four approaches of the center intersection
    for (const [cx, cz, alongX] of [[0, -8.5, true], [0, 8.5, true], [-8.5, 0, false], [8.5, 0, false]] as [number, number, boolean][]) {
      for (let i = -2; i <= 2; i++) {
        if (alongX) crossGeos.push(this.stampBox(4.4, 0.05, 0.55, cx, 0.15, cz + i * 1.15, 0));
        else crossGeos.push(this.stampBox(0.55, 0.05, 4.4, cx + i * 1.15, 0.15, cz, 0));
      }
    }
    // Manhole lids along the avenues
    for (const [hx, hz] of [[-30, -14], [0, 22], [30, -38], [-14, -30], [22, 0], [-38, 30]] as [number, number][]) {
      const lid = new THREE.CylinderGeometry(0.6, 0.6, 0.06, 12);
      const m = new THREE.Matrix4();
      m.setPosition(hx, 0.13, hz);
      lid.applyMatrix4(m);
      this.trimBlack.push(lid);
    }
    const dashMesh = new THREE.Mesh(mergeGeometries(dashGeos, false), mats.orange);
    dashMesh.userData.noCollision = true;
    root.add(dashMesh);
    const crossMesh = new THREE.Mesh(mergeGeometries(crossGeos, false), mats.cyan);
    crossMesh.userData.noCollision = true;
    root.add(crossMesh);
  }

  // ------------------------------------------------------------------
  // Blocks: sidewalk bases + randomized detailed buildings
  // ------------------------------------------------------------------
  private buildBlocks(root: THREE.Group, mats: any, rand: () => number) {
    const bands: [number, number][] = [[-48, -32.5], [-27.5, -2.5], [2.5, 27.5], [32.5, 48]];
    const bodies = [mats.blue, mats.blue, mats.blue, mats.blue, mats.black, mats.black, mats.orange, mats.red, mats.green];
    for (const [x0, x1] of bands) {
      for (const [z0, z1] of bands) {
        const cx = (x0 + x1) / 2;
        const cz = (z0 + z1) / 2;
        if (Math.hypot(cx, cz) > 50) continue; // corner blocks fall in the water
        const base = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.16, z1 - z0), mats.black);
        base.position.set(cx, 0.08, cz);
        base.userData.noCollision = true;
        root.add(base);
        for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as [number, number][]) {
          const bx = cx + lx * (x1 - x0) * 0.25;
          const bz = cz + lz * (z1 - z0) * 0.25;
          if (rand() < 0.26) {
            if (rand() < 0.5) this.buildLotTree(bx, bz);
            continue;
          }
          this.buildTower(root, mats, rand, bodies, bx, bz, Math.hypot(bx, bz));
        }
      }
    }
  }

  private buildTower(
    root: THREE.Group, mats: any, rand: () => number, bodies: any[],
    bx: number, bz: number, distCenter: number
  ) {
    // Compact footprints so canopies and fire escapes never clip neighbours
    const w = 4.5 + rand() * 1.5;
    const d = 4.5 + rand() * 1.5;
    const h = 5 + rand() * 8 + (1 - Math.min(1, distCenter / 55)) * 22;
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodies[Math.floor(rand() * bodies.length)]);
    body.position.set(bx, h / 2, bz);
    root.add(body);
    this.labels.push({ x: bx, y: h + 2.4, z: bz });

    // Window grids with sills on all four faces
    const cols = Math.max(1, Math.floor((w - 1.5) / 2.2));
    const rows = Math.max(1, Math.floor((h - 3) / 2.8));
    for (let f = 0; f < 4; f++) {
      const alongX = f < 2;
      const span = alongX ? w : d;
      const faceOff = (alongX ? d : w) / 2 + 0.06;
      const sign = f % 2 === 0 ? 1 : -1;
      for (let c = 0; c < cols; c++) {
        const off = (-((cols - 1) * 2.2) / 2 + c * 2.2);
        if (Math.abs(off) > span / 2 - 1) continue;
        for (let r = 0; r < rows; r++) {
          const wy = 2.4 + r * 2.8;
          if (wy > h - 1.2) continue;
          const roll = rand();
          if (roll < 0.2) continue; // dark window
          const list = roll < 0.72 ? this.cyanWin : this.orangeWin;
          const gw = alongX ? 1.1 : 0.12;
          const gd = alongX ? 0.12 : 1.1;
          if (alongX) list.push(this.placedBox(gw, 1.4, gd, bx + off, wy, bz + sign * faceOff, 0));
          else list.push(this.placedBox(gw, 1.4, gd, bx + sign * faceOff, wy, bz + off, 0));
          // Stone sill under every lit window
          const sw = alongX ? 1.3 : 0.16;
          const sd = alongX ? 0.16 : 1.3;
          if (alongX) this.trimBlack.push(this.placedBox(sw, 0.16, sd, bx + off, wy - 0.82, bz + sign * faceOff, 0));
          else this.trimBlack.push(this.placedBox(sw, 0.16, sd, bx + sign * faceOff, wy - 0.82, bz + off, 0));
        }
      }
    }

    // Cornice ring below the roofline
    const corniceList = rand() < 0.5 ? this.trimOrange : this.trimBlack;
    corniceList.push(this.placedBox(w + 0.3, 0.32, 0.35, bx, h - 0.2, bz + d / 2, 0));
    corniceList.push(this.placedBox(w + 0.3, 0.32, 0.35, bx, h - 0.2, bz - d / 2, 0));
    corniceList.push(this.placedBox(0.35, 0.32, d + 0.3, bx + w / 2, h - 0.2, bz, 0));
    corniceList.push(this.placedBox(0.35, 0.32, d + 0.3, bx - w / 2, h - 0.2, bz, 0));

    // Rooftop: parapet or plant + vents + antenna
    if (rand() < 0.55) {
      const pt = 0.3;
      const ph = 0.9;
      const mk = (sx: number, sz: number, px: number, pz: number) => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(sx, ph, sz), mats.black);
        p.position.set(bx + px, h + ph / 2, bz + pz);
        root.add(p);
      };
      mk(w + 0.2, pt, 0, d / 2);
      mk(w + 0.2, pt, 0, -d / 2);
      mk(pt, d + 0.2, w / 2, 0);
      mk(pt, d + 0.2, -w / 2, 0);
    } else {
      const ac = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.5), mats.black);
      ac.position.set(bx - w / 5, h + 0.55, bz);
      root.add(ac);
      const tankLegs = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), mats.black);
      tankLegs.position.set(bx + w / 5, h + 0.6, bz - d / 6);
      root.add(tankLegs);
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.6, 10), mats.orange);
      tank.position.set(bx + w / 5, h + 2.0, bz - d / 6);
      root.add(tank);
    }
    if (rand() < 0.5) {
      for (const [vx, vz] of [[-w / 4, -d / 4], [w / 4, d / 5]] as [number, number][]) {
        const vent = new THREE.CylinderGeometry(0.22, 0.22, 1.0, 8);
        const m = new THREE.Matrix4();
        m.setPosition(bx + vx, h + 0.5, bz + vz);
        vent.applyMatrix4(m);
        this.trimBlack.push(vent);
      }
    }
    if (rand() < 0.35) {
      const mast = new THREE.CylinderGeometry(0.07, 0.07, 3.2, 6);
      const m = new THREE.Matrix4();
      m.setPosition(bx, h + 1.6, bz);
      mast.applyMatrix4(m);
      this.trimBlack.push(mast);
      const beacon = new THREE.SphereGeometry(0.16, 6, 6);
      const mb = new THREE.Matrix4();
      mb.setPosition(bx, h + 3.3, bz);
      beacon.applyMatrix4(mb);
      this.trimRed.push(beacon);
    }

    // Entrance: door + step + canopy + lantern on a random face
    const side = Math.floor(rand() * 4);
    const alongX = side < 2;
    const sign = side % 2 === 0 ? 1 : -1;
    const faceD = (alongX ? d : w) / 2;
    if (alongX) {
      this.trimBlack.push(this.placedBox(1.4, 2.4, 0.16, bx, 1.2, bz + sign * (faceD + 0.05), 0));
      this.trimBlack.push(this.placedBox(2.0, 0.3, 1.0, bx, 0.15, bz + sign * (faceD + 0.5), 0));
      this.trimOrange.push(this.placedBox(2.6, 0.16, 1.3, bx, 2.9, bz + sign * (faceD + 0.65), 0));
      const lamp = new THREE.SphereGeometry(0.15, 6, 6);
      const m = new THREE.Matrix4();
      m.setPosition(bx + 1.1, 3.2, bz + sign * (faceD + 0.3));
      lamp.applyMatrix4(m);
      this.orangeWin.push(lamp);
    } else {
      this.trimBlack.push(this.placedBox(0.16, 2.4, 1.4, bx + sign * (faceD + 0.05), 1.2, bz, 0));
      this.trimBlack.push(this.placedBox(1.0, 0.3, 2.0, bx + sign * (faceD + 0.5), 0.15, bz, 0));
      this.trimOrange.push(this.placedBox(1.3, 0.16, 2.6, bx + sign * (faceD + 0.65), 2.9, bz, 0));
      const lamp = new THREE.SphereGeometry(0.15, 6, 6);
      const m = new THREE.Matrix4();
      m.setPosition(bx + sign * (faceD + 0.3), 3.2, bz + 1.1);
      lamp.applyMatrix4(m);
      this.orangeWin.push(lamp);
    }

    // Fire escape on a different face (40%)
    if (rand() < 0.4) {
      const fs = (side + 1 + Math.floor(rand() * 3)) % 4;
      const fax = fs < 2;
      const fsign = fs % 2 === 0 ? 1 : -1;
      const foff = (fax ? d : w) / 2 + 0.7;
      for (const fy of [4.5, 7.5]) {
        if (fy > h - 1) continue;
        if (fax) {
          this.trimBlack.push(this.placedBox(2.6, 0.22, 1.2, bx, fy, bz + fsign * foff, 0));
          this.trimBlack.push(this.placedBox(2.6, 0.9, 0.12, bx, fy + 0.55, bz + fsign * (foff + 0.55), 0));
        } else {
          this.trimBlack.push(this.placedBox(1.2, 0.22, 2.6, bx + fsign * foff, fy, bz, 0));
          this.trimBlack.push(this.placedBox(0.12, 0.9, 2.6, bx + fsign * (foff + 0.55), fy + 0.55, bz, 0));
        }
      }
      if (fax) this.trimBlack.push(this.placedBox(0.25, 3.4, 0.14, bx + 1.1, 6.0, bz + fsign * foff, 0));
      else this.trimBlack.push(this.placedBox(0.14, 3.4, 0.25, bx + fsign * foff, 6.0, bz + 1.1, 0));
    }
  }

  /** Shade tree for an empty lot (merged trunk + crown). */
  private buildLotTree(bx: number, bz: number) {
    const trunk = new THREE.BoxGeometry(0.5, 3.4, 0.5);
    const m = new THREE.Matrix4();
    m.setPosition(bx, 1.7, bz);
    trunk.applyMatrix4(m);
    this.trimBlack.push(trunk);
    const crown = new THREE.SphereGeometry(2.0, 8, 7);
    const m2 = new THREE.Matrix4();
    m2.setPosition(bx, 4.4, bz);
    crown.applyMatrix4(m2);
    this.trimGreen.push(crown);
    const crown2 = new THREE.SphereGeometry(1.3, 7, 6);
    const m3 = new THREE.Matrix4();
    m3.setPosition(bx + 1.2, 3.6, bz + 0.6);
    crown2.applyMatrix4(m3);
    this.trimGreen.push(crown2);
  }

  /** Floating number plates #01.. ordered north-to-south, west-to-east. */
  private buildNumberPlates(root: THREE.Group) {
    const ordered = [...this.labels].sort((a, b) => a.z - b.z || a.x - b.x);
    ordered.forEach((spot, i) => {
      const plate = this.makeNumberSprite(`#${String(i + 1).padStart(2, "0")}`);
      plate.position.set(spot.x, spot.y, spot.z);
      root.add(plate);
    });
  }

  private makeNumberSprite(text: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#faf7ee";
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = "#1a30c0";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 236, 108);
    ctx.fillStyle = "#d02030";
    ctx.font = "bold 62px 'Patrick Hand', cursive, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 68);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: true }));
    sprite.scale.set(3.6, 1.8, 1);
    sprite.userData.noCollision = true;
    return sprite;
  }

  // ------------------------------------------------------------------
  // Streetlamps (on roadways only — lots are unpredictable)
  // ------------------------------------------------------------------
  private buildLamps(root: THREE.Group, mats: any) {
    // N-S streets: pole at curb + arm reaching over the asphalt
    for (const sx of [-30, 0, 30]) {
      for (const sz of [-15, 15]) {
        const pole = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6.0, 0.3), mats.black);
        pole.position.set(sx + 2.0, 3.0, sz);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 0.2), mats.black);
        arm.position.set(sx + 1.2, 5.9, sz);
        arm.userData.noCollision = true;
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), mats.orange);
        lamp.position.set(sx + 0.4, 5.7, sz);
        lamp.userData.noCollision = true;
        root.add(pole, arm, lamp);
      }
    }
    // E-W streets: globe lamps at the curb
    for (const sz of [-30, 0, 30]) {
      for (const sx of [-15, 15]) {
        const pole = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6.0, 0.3), mats.black);
        pole.position.set(sx, 3.0, sz + 2.0);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), mats.orange);
        lamp.position.set(sx, 6.1, sz + 2.0);
        lamp.userData.noCollision = true;
        root.add(pole, lamp);
      }
    }
  }

  // ------------------------------------------------------------------
  // Street props: hydrants, bins, benches, bus shelter, parked cars
  // ------------------------------------------------------------------
  private buildStreetProps(root: THREE.Group, mats: any) {
    // Fire hydrants hug the curbs (on asphalt, clear of traffic + lots)
    for (const [hx, hz] of [[28.2, -8.5], [-28.2, 8.5], [8.5, 28.2], [-8.5, -28.2], [28.2, -33], [-28.2, 33]] as [number, number][]) {
      this.trimRed.push(this.placedBox(0.45, 0.85, 0.45, hx, 0.42, hz, 0));
      this.trimBlack.push(this.placedBox(0.65, 0.18, 0.18, hx, 0.5, hz, 0));
    }
    // Trash bins on the asphalt edges
    for (const [qx, qz] of [[-32, 8], [-2, -8], [28, 22], [-28, -22], [8, 32], [-8, -32]] as [number, number][]) {
      this.trimBlack.push(this.placedBox(0.55, 0.9, 0.55, qx, 0.45, qz, 0));
    }
    // Park benches sit in the gaps between lots (x=±15 corridors are clear)
    for (const [ex, ez, rot] of [[15, 8.5, 1], [-15, -8.5, 1], [15, -15, 0], [-15, 15, 0], [15, 22, 0], [-15, -22, 0]] as [number, number, number][]) {
      if (rot === 0) {
        this.trimOrange.push(this.placedBox(2.2, 0.18, 0.7, ex, 0.6, ez, 0));
        this.trimOrange.push(this.placedBox(2.2, 0.6, 0.15, ex, 1.0, ez - 0.35, 0));
        this.trimBlack.push(this.placedBox(0.18, 0.6, 0.6, ex - 0.9, 0.3, ez, 0));
        this.trimBlack.push(this.placedBox(0.18, 0.6, 0.6, ex + 0.9, 0.3, ez, 0));
      } else {
        this.trimOrange.push(this.placedBox(0.7, 0.18, 2.2, ex, 0.6, ez, 0));
        this.trimOrange.push(this.placedBox(0.15, 0.6, 2.2, ex - 0.35, 1.0, ez, 0));
        this.trimBlack.push(this.placedBox(0.6, 0.6, 0.18, ex, 0.3, ez - 0.9, 0));
        this.trimBlack.push(this.placedBox(0.6, 0.6, 0.18, ex, 0.3, ez + 0.9, 0));
      }
    }
    // Bus shelter mid-block (z=14..16 sits in the gap between lot rows)
    const shx = 8;
    const shz = 15;
    this.cyanWin.push(this.placedBox(4.2, 2.0, 0.16, shx, 1.4, shz + 0.9, 0));
    this.trimBlack.push(this.placedBox(4.6, 0.25, 2.0, shx, 2.55, shz, 0));
    for (const px of [-2.1, 2.1]) {
      this.trimBlack.push(this.placedBox(0.22, 2.55, 0.22, shx + px, 1.27, shz, 0));
    }
    this.trimOrange.push(this.placedBox(3.4, 0.16, 0.6, shx, 0.65, shz + 0.3, 0));
    // Parked cars (static cousins of the traffic fleet, clear of lanes)
    const parked: [number, number, number, any][] = [
      [-27.9, 22, 0, mats.red],
      [27.9, 8, Math.PI, mats.cyan],
      [-8, 27.9, Math.PI / 2, mats.orange],
    ];
    for (const [px, pz, rot, paint] of parked) {
      const car = this.buildCar(mats, paint);
      car.position.set(px, 0, pz);
      car.rotation.y = rot;
      root.add(car);
    }
  }

  // ------------------------------------------------------------------
  // Corner-block shade trees on the open paper
  // ------------------------------------------------------------------
  private buildTrees() {
    for (const [tx, tz] of [[-40, -40], [40, -40], [-40, 40], [40, 40]] as [number, number][]) {
      this.buildLotTree(tx, tz);
    }
  }

  // ------------------------------------------------------------------
  // Pedestrians strolling the shoreline promenade
  // ------------------------------------------------------------------
  private buildPedestrians(root: THREE.Group, mats: any) {
    const paints = [mats.red, mats.blue, mats.orange, mats.green, mats.black, mats.cyan];
    const loop: THREE.Vector3[] = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      loop.push(new THREE.Vector3(Math.cos(a) * 50, 0, Math.sin(a) * 50));
    }
    const cum: number[] = [0];
    for (let i = 1; i <= loop.length; i++) {
      cum.push(cum[i - 1] + loop[i % loop.length].distanceTo(loop[i - 1]));
    }
    const total = cum[cum.length - 1];
    for (let k = 0; k < 6; k++) {
      const ped = new THREE.Group();
      const bodyH = 0.7 + (k % 3) * 0.1;
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, bodyH, 0.3), paints[k % paints.length]);
      body.position.y = 0.45 + bodyH / 2;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 7, 6), mats.black);
      head.position.y = 0.45 + bodyH + 0.22;
      ped.add(body, head);
      ped.traverse((o) => {
        o.userData.noCollision = true;
      });
      root.add(ped);
      this.movers.push({
        group: ped, pts: loop, cum, total,
        dist: (k / 6) * total,
        speed: (k % 2 === 0 ? 1 : -1) * (1.6 + (k % 3) * 0.3),
        bob: 0.06,
        wheels: [],
      });
    }
  }

  // ------------------------------------------------------------------
  // Traffic: two non-overlapping one-way loops (right-hand lanes, no head-ons)
  // ------------------------------------------------------------------
  private buildTraffic(root: THREE.Group, mats: any, rand: () => number) {
    // Loop 1: outer square on the ±30 streets
    this.addLoop(root, mats, rand, [[-30, -30], [30, -30], [30, 30], [-30, 30]], 4);
    // Loop 2: skinny center loop on the x=0 street + z=±28 connectors
    this.addLoop(root, mats, rand, [[-1.25, -28], [-1.25, 28], [1.25, 28], [1.25, -28]], 3);
  }

  private addLoop(
    root: THREE.Group, mats: any, rand: () => number,
    loop: [number, number][], carCount: number
  ) {
    const curve = new THREE.CatmullRomCurve3(
      loop.map(([x, z]) => new THREE.Vector3(x, 0, z)),
      true,
      "centripetal"
    );
    const pts = curve.getPoints(80);
    const cum: number[] = [0];
    for (let i = 1; i <= pts.length; i++) {
      cum.push(cum[i - 1] + pts[i % pts.length].distanceTo(pts[i - 1]));
    }
    const total = cum[cum.length - 1];
    const paint = [mats.red, mats.orange, mats.cyan, mats.black, mats.blue];
    for (let k = 0; k < carCount; k++) {
      const car = this.buildCar(mats, paint[Math.floor(rand() * paint.length)]);
      root.add(car);
      this.movers.push({
        group: car, pts, cum, total,
        dist: (k / carCount) * total,
        speed: 6.5 + rand() * 3.5,
        bob: 0,
        wheels: (car.userData.wheels as THREE.Mesh[]) || [],
      });
    }
  }

  private buildCar(mats: any, paint: any): THREE.Group {
    const car = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 3.6), paint);
    body.position.y = 0.65;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 1.8), mats.black);
    cabin.position.set(0, 1.2, -0.2);
    car.add(body, cabin);
    const wheels: THREE.Mesh[] = [];
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 10);
    for (const [wx, wz] of [[-0.85, 1.2], [0.85, 1.2], [-0.85, -1.2], [0.85, -1.2]] as [number, number][]) {
      const wheel = new THREE.Mesh(wheelGeo, mats.black);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.35, wz);
      wheels.push(wheel);
      car.add(wheel);
    }
    car.userData.wheels = wheels;
    for (const hx of [-0.6, 0.6]) {
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), mats.cyan);
      head.position.set(hx, 0.7, 1.85);
      car.add(head);
      const tail = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), mats.red);
      tail.position.set(hx, 0.7, -1.85);
      car.add(tail);
    }
    car.traverse((o) => {
      o.userData.noCollision = true;
    });
    return car;
  }

  // ------------------------------------------------------------------
  // South-shore pier with a moored rowboat
  // ------------------------------------------------------------------
  private buildPier(root: THREE.Group, mats: any) {
    for (let i = 0; i < 6; i++) {
      this.trimOrange.push(this.placedBox(4.0, 0.22, 2.2, 0, -0.4, 56 + i * 2.5, 0));
    }
    for (const [px, pz] of [[-1.8, 56], [1.8, 56], [-1.8, 68], [1.8, 68]] as [number, number][]) {
      this.trimBlack.push(this.placedBox(0.35, 3.4, 0.35, px, -1.6, pz, 0));
    }
    const boat = new THREE.Group();
    boat.position.set(8, -2.2, 64);
    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 4.5), mats.black);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 4.7), mats.orange);
    rim.position.y = 0.45;
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 0.6), mats.orange);
    bench.position.y = 0.2;
    boat.add(hull, rim, bench);
    boat.traverse((o) => {
      o.userData.noCollision = true;
    });
    root.add(boat);
    this.floaters.push({ group: boat, baseY: -2.2, phase: 0.7 });
  }

  // ------------------------------------------------------------------
  // Flush merged trim into single meshes
  // ------------------------------------------------------------------
  private flushTrim(root: THREE.Group, mats: any) {
    const jobs: [THREE.BufferGeometry[], any][] = [
      [this.cyanWin, mats.cyan],
      [this.orangeWin, mats.orange],
      [this.trimBlack, mats.black],
      [this.trimOrange, mats.orange],
      [this.trimRed, mats.red],
      [this.trimGreen, mats.green],
    ];
    for (const [list, mat] of jobs) {
      if (list.length === 0) continue;
      const mesh = new THREE.Mesh(mergeGeometries(list, false), mat);
      mesh.userData.noCollision = true;
      root.add(mesh);
      for (const g of list) g.dispose();
    }
  }

  private placedBox(w: number, h: number, d: number, x: number, y: number, z: number, rotY: number): THREE.BufferGeometry {
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Matrix4().makeRotationY(rotY);
    m.setPosition(x, y, z);
    g.applyMatrix4(m);
    return g;
  }

  private stampBox(w: number, h: number, d: number, x: number, y: number, z: number, rotY: number): THREE.BufferGeometry {
    return this.placedBox(w, h, d, x, y, z, rotY);
  }
}
