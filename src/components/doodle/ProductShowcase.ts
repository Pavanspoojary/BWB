import * as THREE from "three";
import { DoodleEngine } from "./DoodleEngine";

/**
 * Piece 06 — immersive 3D product hunt for the /product page.
 * Doodle-styled launch boards orbit a central point in the void;
 * drag to look around (VR-like), scroll to zoom, click a board to
 * inspect it. Counts repaint live when votes land.
 */

export interface ShowcaseProduct {
  id: string;
  name: string;
  tagline: string;
  upvotes: number;
  url: string;
}

interface Board {
  id: string;
  group: THREE.Group;
  mesh: THREE.Mesh;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  baseY: number;
  phase: number;
  product: ShowcaseProduct;
}

const CARD_W = 512;
const CARD_H = 320;

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxW: number, base: number, family: string): number {
  let size = base;
  ctx.font = `bold ${size}px ${family}`;
  while (size > 20 && ctx.measureText(text).width > maxW) {
    size -= 4;
    ctx.font = `bold ${size}px ${family}`;
  }
  return size;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const trial = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(trial).width > maxW && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length >= maxLines) break;
    } else {
      cur = trial;
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  return lines;
}

export class ProductShowcase {
  private engine: DoodleEngine;
  private boards: Board[] = [];
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private target = new THREE.Vector3(0, 3.5, 0);
  private theta = 0.6;
  private phi = 1.02;
  private radius = 26;
  private autoSpin = true;
  private dragging = false;
  private lastPX = 0;
  private lastPY = 0;
  private downPX = 0;
  private downPY = 0;
  private elapsed = 0;
  private onSelect: (id: string) => void;
  private canvas: HTMLCanvasElement;
  private onPointerDown = (e: PointerEvent) => {
    this.dragging = true;
    this.lastPX = e.clientX;
    this.lastPY = e.clientY;
    this.downPX = e.clientX;
    this.downPY = e.clientY;
  };
  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    const dx = e.clientX - this.lastPX;
    const dy = e.clientY - this.lastPY;
    this.lastPX = e.clientX;
    this.lastPY = e.clientY;
    this.theta -= dx * 0.005;
    this.phi = Math.max(0.35, Math.min(1.35, this.phi - dy * 0.004));
  };
  private onPointerUp = (e: PointerEvent) => {
    const moved = Math.hypot(e.clientX - this.downPX, e.clientY - this.downPY);
    this.dragging = false;
    if (moved > 6) return;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.engine.camera);
    const meshes = this.boards.map((b) => b.mesh);
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (hits.length > 0) {
      const hit = hits[0].object;
      const board = this.boards.find((b) => b.mesh === hit);
      if (board) this.onSelect(board.id);
    }
  };
  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.radius = Math.max(9, Math.min(60, this.radius * (1 + e.deltaY * 0.001)));
  };

  constructor(canvas: HTMLCanvasElement, onSelect: (id: string) => void) {
    this.canvas = canvas;
    this.onSelect = onSelect;
    const parent = canvas.parentElement;
    const w = parent ? parent.clientWidth : window.innerWidth;
    const h = parent ? parent.clientHeight : 480;
    this.engine = new DoodleEngine({ canvas, width: w, height: h });
    canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("wheel", this.onWheel, { passive: false });
  }

  /** Rebuild the ring only when the product set changes; otherwise repaint. */
  public sync(products: ShowcaseProduct[]) {
    const known = new Set(this.boards.map((b) => b.id));
    const incoming = new Set(products.map((p) => p.id));
    const same =
      known.size === incoming.size && [...known].every((id) => incoming.has(id));
    if (!same) {
      this.rebuild(products);
      return;
    }
    let dirty = false;
    for (const b of this.boards) {
      const p = products.find((q) => q.id === b.id);
      if (p && (p.upvotes !== b.product.upvotes || p.name !== b.product.name || p.tagline !== b.product.tagline)) {
        b.product = { ...p };
        this.paintCard(b);
        dirty = true;
      }
    }
    void dirty;
  }

  private rebuild(products: ShowcaseProduct[]) {
    for (const b of this.boards) {
      this.engine.scene.remove(b.group);
      b.texture.dispose();
      (b.mesh.material as THREE.Material).dispose();
    }
    this.boards = [];
    const n = Math.max(1, products.length);
    const R = Math.max(11, Math.min(24, 8 + n * 1.4));
    this.radius = Math.max(this.radius, R + 9);
    products.forEach((p, i) => {
      const a = (i / n) * Math.PI * 2;
      const group = new THREE.Group();
      const baseY = 3.5 + (i % 2) * 1.6;
      group.position.set(Math.cos(a) * R, baseY, Math.sin(a) * R);
      group.lookAt(this.target.x, baseY, this.target.z);
      const canvas = document.createElement("canvas");
      canvas.width = CARD_W;
      canvas.height = CARD_H;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 5),
        new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
      );
      group.add(mesh);
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(8.4, 5.4, 0.25),
        new THREE.MeshBasicMaterial({ color: 0x1a30c0 })
      );
      frame.position.z = -0.16;
      group.add(frame);
      const board: Board = {
        id: p.id, group, mesh, canvas, texture,
        baseY, phase: i * 1.7, product: { ...p },
      };
      this.paintCard(board);
      this.engine.scene.add(group);
      this.boards.push(board);
    });
  }

  private paintCard(b: Board) {
    const ctx = b.canvas.getContext("2d")!;
    const p = b.product;
    ctx.fillStyle = "#faf7ee";
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.strokeStyle = "rgba(26,48,192,0.12)";
    ctx.lineWidth = 1.5;
    for (let y = 24; y < CARD_H; y += 28) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(CARD_W - 10, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#1a30c0";
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, CARD_W - 20, CARD_H - 20);
    const family = "'Patrick Hand', cursive, sans-serif";
    ctx.fillStyle = "#d02030";
    const size = fitFont(ctx, p.name || "Untitled", CARD_W - 70, 58, family);
    ctx.font = `bold ${size}px ${family}`;
    ctx.fillText(p.name || "Untitled", 34, 84);
    ctx.fillStyle = "#18181b";
    ctx.font = `25px ${family}`;
    const lines = wrapLines(ctx, p.tagline || "Fresh out of the oven", CARD_W - 70, 3);
    lines.forEach((ln, i) => ctx.fillText(ln, 34, 128 + i * 32));
    ctx.font = `bold 30px ${family}`;
    ctx.fillStyle = "#d02030";
    ctx.fillText(`▲ ${p.upvotes.toLocaleString()}`, 34, CARD_H - 30);
    ctx.font = `20px ${family}`;
    ctx.fillStyle = "#1a30c0";
    ctx.fillText(p.url ? "click to open ↗" : "click to inspect", CARD_W - 34 - ctx.measureText(p.url ? "click to open ↗" : "click to inspect").width, CARD_H - 30);
    b.texture.needsUpdate = true;
  }

  public update(delta: number) {
    this.elapsed += delta;
    if (!this.dragging && this.autoSpin) this.theta += delta * 0.12;
    const sp = Math.sin(this.phi);
    this.engine.camera.position.set(
      this.target.x + this.radius * sp * Math.sin(this.theta),
      this.target.y + this.radius * Math.cos(this.phi),
      this.target.z + this.radius * sp * Math.cos(this.theta)
    );
    this.engine.camera.lookAt(this.target);
    for (const b of this.boards) {
      b.group.position.y = b.baseY + Math.sin(this.elapsed * 0.8 + b.phase) * 0.4;
    }
    this.engine.render(delta);
  }

  public setAutoSpin(on: boolean) {
    this.autoSpin = on;
  }

  public dispose() {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("wheel", this.onWheel);
    for (const b of this.boards) {
      b.texture.dispose();
      (b.mesh.material as THREE.Material).dispose();
    }
    this.boards = [];
    this.engine.dispose();
  }
}
