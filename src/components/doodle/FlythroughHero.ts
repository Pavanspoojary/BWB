import * as THREE from "three";
import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { DoodleEngine, INK_COLORS } from "./DoodleEngine";

/**
 * Piece 08 — full-page VR-style 3D products world for /product.
 * Camera rides a Catmull-Rom spline; page scroll maps to t (0-1), eased
 * per frame. No physics, no colliders, no player entity — rail only.
 *
 * EVERY product renders as a CSS3D DOM card (crisp text, real ▲ vote,
 * inspect eye, close ✕, visit ↗ — no raycasting). Background pillars/
 * gates/rings are plain ink-material WebGL. Ink post shader stays on top.
 *
 * Disabled on mobile viewports, reduced motion, WebGL failure, env kill
 * switch, or ?nohero=1 — caller shows the fallback note.
 */

export interface HeroProduct {
  id: string;
  name: string;
  tagline: string;
  upvotes: number;
  url: string;
}

export interface HeroCallbacks {
  onVote: (id: string) => void;
}

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

export function heroEnabled(): boolean {
  try {
    const env = (import.meta as any)?.env?.PUBLIC_HERO_FLYTHROUGH;
    if (env === "0" || env === "off" || env === "false") return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get("nohero") === "1") return false;
    if (window.localStorage.getItem("bwb_nohero") === "1") return false;
  } catch {
    /* storage/blocked env — default on */
  }
  if (window.matchMedia("(max-width: 640px)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

export class FlythroughHero {
  private engine: DoodleEngine;
  private css: CSS3DRenderer;
  private curve: THREE.CatmullRomCurve3;
  private lookTarget = new THREE.Vector3(0, 4, 0);
  private t = 0;
  private targetT = 0;
  private cards: { id: string; obj: CSS3DObject; el: HTMLElement; voteBtn: HTMLElement; countEl: HTMLElement; inspectBtn: HTMLElement; closeBtn: HTMLElement; visitA: HTMLAnchorElement }[] = [];
  private collapsed: Record<string, boolean> = {};
  private running = true;
  private lastT = 0;
  private onVote: (id: string) => void;
  private track: HTMLElement;
  private raf = 0;
  private onScroll = () => {
    const rect = this.track.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = Math.max(1, rect.height - vh);
    this.targetT = Math.max(0, Math.min(1, -rect.top / total));
  };
  private onVisibility = (entries: IntersectionObserverEntry[]) => {
    for (const e of entries) this.running = e.isIntersecting;
  };

  constructor(track: HTMLElement, viewport: HTMLElement, canvas: HTMLCanvasElement, cb: HeroCallbacks) {
    this.track = track;
    this.onVote = cb.onVote;
    const w = viewport.clientWidth || window.innerWidth;
    const h = viewport.clientHeight || window.innerHeight;
    this.engine = new DoodleEngine({ canvas, width: w, height: h });
    this.css = new CSS3DRenderer();
    this.css.setSize(w, h);
    this.css.domElement.style.position = "absolute";
    this.css.domElement.style.inset = "0";
    this.css.domElement.style.pointerEvents = "none";
    viewport.appendChild(this.css.domElement);

    this.buildBackdrop();
    // Spline: high wide opener -> weave between pillars -> hero pass by the
    // lead card ring -> rise and settle looking back at the circle.
    this.curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 16, 40),
        new THREE.Vector3(22, 9, 20),
        new THREE.Vector3(12, 4.5, 2),
        new THREE.Vector3(-10, 5, -10),
        new THREE.Vector3(-20, 7, -24),
        new THREE.Vector3(-4, 12, -38),
      ],
      false,
      "centripetal"
    );

    window.addEventListener("scroll", this.onScroll, { passive: true });
    this.onScroll();
    new IntersectionObserver(this.onVisibility).observe(viewport);
    this.lastT = performance.now();
    const loop = (t: number) => {
      this.raf = requestAnimationFrame(loop);
      if (!this.running) {
        this.lastT = t;
        return;
      }
      const delta = Math.min((t - this.lastT) / 1000, 0.1);
      this.lastT = t;
      // Ease camera toward scroll target (landing moment, not primary UI)
      this.t += (this.targetT - this.t) * Math.min(1, delta * 3.2);
      if (Math.abs(this.targetT - this.t) < 0.0005) this.t = this.targetT;
      const pos = this.curve.getPoint(this.t);
      this.engine.camera.position.copy(pos);
      this.engine.camera.lookAt(this.lookTarget);
      this.engine.render(delta);
      this.css.render(this.engine.scene, this.engine.camera);
    };
    requestAnimationFrame(loop);
  }

  /** Decorative ink pillars, crossbeam gates and rings. No collision. */
  private buildBackdrop() {
    const rand = mulberry32(470123);
    const mats = {
      blue: this.engine.createDoodleMaterial({ ink: INK_COLORS.BLUE, fill: false }),
      black: this.engine.createDoodleMaterial({ ink: INK_COLORS.BLACK, fill: false }),
      orange: this.engine.createDoodleMaterial({ ink: INK_COLORS.ORANGE, fill: false }),
      red: this.engine.createDoodleMaterial({ ink: INK_COLORS.RED, fill: false }),
      cyan: this.engine.createDoodleMaterial({ ink: INK_COLORS.CYAN, fill: false }),
    };
    const scene = this.engine.scene;
    const addDeco = (m: THREE.Mesh) => {
      m.userData.noCollision = true;
      scene.add(m);
      return m;
    };
    // Two arcs of pillars flanking the flight path
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = 24 + rand() * 8;
      const h = 7 + rand() * 14;
      const w = 1.2 + rand() * 1.4;
      const matPick = [mats.blue, mats.black, mats.blue, mats.orange][i % 4];
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), matPick);
      pillar.position.set(Math.cos(a) * r, h / 2 - 1, Math.sin(a) * r - 4);
      pillar.rotation.y = rand() * Math.PI;
      addDeco(pillar);
      if (i % 4 === 0) {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.4, w + 0.5), mats.orange);
        cap.position.set(pillar.position.x, h - 1 + 0.2, pillar.position.z);
        addDeco(cap);
      }
    }
    // Crossbeam gates the spline threads through
    for (const [gx, gy, gz, span] of [[12, 9, 12, 12], [-12, 10, -16, 14]] as [number, number, number, number][]) {
      for (const s of [-1, 1]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.9, gy, 0.9), mats.black);
        post.position.set(gx + s * (span / 2), gy / 2 - 1, gz);
        addDeco(post);
      }
      const beam = new THREE.Mesh(new THREE.BoxGeometry(span + 1, 1.1, 1.1), mats.blue);
      beam.position.set(gx, gy - 1, gz);
      addDeco(beam);
    }
    // Floating doodle rings for depth
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2 + (i % 3), 0.22, 6, 28), i % 2 === 0 ? mats.cyan : mats.red);
      ring.position.set(-18 + i * 9, 10 + (i % 3) * 3, -20 - i * 3);
      ring.rotation.set(rand() * 0.6, rand() * Math.PI, 0);
      addDeco(ring);
    }
  }

  /** All products around a circle; rebuild DOM only when the id set changes. */
  public setProducts(products: HeroProduct[], votes: string[]) {
    const ids = products.map((p) => p.id);
    const same =
      this.cards.length === ids.length && this.cards.every((c, i) => c.id === ids[i]);
    if (!same) this.rebuildCards(products);
    for (const c of this.cards) {
      const p = products.find((q) => q.id === c.id);
      if (!p) continue;
      c.countEl.textContent = p.upvotes.toLocaleString();
      const voted = votes.includes(p.id);
      c.voteBtn.className = "fly-vote" + (voted ? " voted" : "");
      c.voteBtn.setAttribute("aria-pressed", voted ? "true" : "false");
    }
  }

  private rebuildCards(products: HeroProduct[]) {
    for (const c of this.cards) {
      this.engine.scene.remove(c.obj);
      c.el.remove();
    }
    this.cards = [];
    const n = Math.max(1, products.length);
    const R = Math.max(16, Math.min(30, 12 + n * 2));
    products.forEach((p, i) => {
      const a = (i / n) * Math.PI * 2;
      const y = 3.5 + (i % 3) * 2.2;
      const el = document.createElement("div");
      el.className = "fly-card";
      el.innerHTML =
        `<div class="fly-medal">#${i + 1}</div>` +
        `<div class="fly-name"></div>` +
        `<div class="fly-tag"></div>` +
        `<div class="fly-row">` +
        `<button class="fly-vote" type="button">▲ <span class="fly-count"></span></button>` +
        `<button class="fly-inspect" type="button" title="Inspect">👁</button>` +
        `<button class="fly-close" type="button" title="Hide">✕</button>` +
        `<a class="fly-visit" href="#" target="_blank" rel="noopener noreferrer">↗</a>` +
        `</div>`;
      (el.querySelector(".fly-name") as HTMLElement).textContent = p.name;
      (el.querySelector(".fly-tag") as HTMLElement).textContent = p.tagline || "Fresh out of the oven";
      const voteBtn = el.querySelector(".fly-vote") as HTMLElement;
      const inspectBtn = el.querySelector(".fly-inspect") as HTMLElement;
      const closeBtn = el.querySelector(".fly-close") as HTMLElement;
      const visitA = el.querySelector(".fly-visit") as HTMLAnchorElement;
      if (p.url) {
        visitA.href = p.url;
      } else {
        visitA.style.display = "none";
      }
      voteBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        this.onVote?.(p.id);
      });
      inspectBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        el.classList.toggle("collapsed");
      });

      const obj = new CSS3DObject(el);
      obj.position.set(Math.cos(a) * R, y, Math.sin(a) * R);
      obj.lookAt(this.lookTarget);

      closeBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        this.collapsed[p.id] = true;
        el.style.display = "none";
        obj.visible = false;
      });

      if (this.collapsed[p.id]) {
        el.style.display = "none";
        obj.visible = false;
      }
      this.engine.scene.add(obj);
      this.cards.push({
        id: p.id, obj, el, voteBtn,
        countEl: el.querySelector(".fly-count") as HTMLElement,
        inspectBtn, closeBtn, visitA,
      });
    });
  }

  public dispose() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("scroll", this.onScroll);
    this.engine.dispose();
  }
}
