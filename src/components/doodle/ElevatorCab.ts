import * as THREE from "three";

/**
 * Piece 09 — vintage doodle elevator cab (doors permanently shut).
 * A sketch-covered, wood-panelled, brass-trimmed front elevation:
 * closed doors + frame + lintel, direction lamps, floor-call bell,
 * and a full graffiti wall of maker URLs. The whole city is this cab.
 */

export class ElevatorCab {
  private mats: any;

  constructor(private engine: any, private city: any) {
    // Materials cloned from the existing doodle ink set
    this.mats = (city && (city as any).defaultMats) || {
      blue: null, black: null, orange: null, red: null, green: null, cyan: null,
    };
    const root = new THREE.Group();
    root.name = "ElevatorCab";

    const B = (w: number, h: number, d: number, mat: any, x: number, y: number, z: number, nc = false) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      if (nc) m.userData.noCollision = true;
      root.add(m);
      return m;
    };

    // 1. Metallic/wood shaft: front wall + frame
    B(14, 16, 0.6, this.mats.black, 0, 8, -4);
    // Door jambs + header
    B(0.8, 1.0, 11.4, this.mats.orange, -3.6, 5.5, -3.9);
    B(0.8, 1.0, 11.4, this.mats.orange, 3.6, 5.5, -3.9);
    B(7.6, 1.6, 0.8, this.mats.orange, 0, 10.6, -3.9);
    // Floor plinth
    B(12, 0.8, 0.8, this.mats.black, 0, 0.4, -3.9);

    // Direction lamps (▲ lit / ▼ dim)
    for (const s of [-1, 1]) {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), s > 0 ? this.mats.green : this.mats.red);
      lamp.position.set(s * 1.6, 10.1, -3.45);
      lamp.userData.noCollision = true;
      root.add(lamp);
    }

    // Doors: twin panels with centre seam + brushed grain bands
    const doorL = B(3.6, 9.4, 0.7, this.mats.blue, -1.85, 4.7, -3.85);
    const doorR = B(3.6, 9.4, 0.7, this.mats.blue, 1.85, 4.7, -3.85);
    // Centre seam detail
    B(0.16, 9.4, 0.12, this.mats.black, 0, 4.7, -3.4);
    for (const dx of [-1.85, 1.85]) {
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 10), this.mats.black);
      knob.rotation.x = Math.PI / 2;
      knob.position.set(dx * 0.2, 6.9, -3.3);
      root.add(knob);
    }

    // Graffiti wall panels (canvas textures, two layers on the sides)
    this.addGraffitiPanel(root, "left");
    this.addGraffitiPanel(root, "right");

    // Trim rails (handrail + ceiling cove)
    B(13.6, 0.35, 0.4, this.mats.black, 0, 3.4, -3.5);
    B(13.6, 0.5, 0.8, this.mats.orange, 0, 14.4, -3.7);

    // Floor-call panel plate beside the doors (DOM panel rides HTML; 3D plate is its shadow)
    B(1.8, 4.4, 0.5, this.mats.black, -5.6, 7.0, -3.9);

    // Hatch on top (roof hatch above the cab)
    B(2.0, 0.6, 2.0, this.mats.black, 0, 12.6, -3.5);

    this.engine.scene.add(root);
    this.city.buildings.push(root);
    this.city.updateColliders();
  }

  /** Canvas texture of messy maker URLs, taped onto the cab wall. */
  private graffitiTexture(side: "left" | "right"): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#faf7ee";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "rgba(26,48,192,0.18)";
    ctx.lineWidth = 2;
    for (let y = 30; y < 512; y += 44) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y + (Math.random() * 4 - 2));
      ctx.stroke();
    }
    const urls = [
      "doodle.city/launch", "wrap.dev/start", "rail.st/ship", "pod.dev/open",
      "hack.am/go", "split.run/now", "seed.spot/build", "sharpie.dev/tag",
      "maker.fun/online", "craft.sh/go", "builtwhilebroke.tech", "ship.now/live",
      "stab.you/early", "drawn.io/start", "auth.via/tg", "canyon.dev/scene",
    ];
    ctx.font = "bold 24px 'Caveat', cursive";
    for (let i = 0; i < 24; i++) {
      const x = 20 + Math.random() * 360;
      const y = 50 + Math.random() * 410;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.14);
      ctx.fillStyle = i % 3 === 0 ? "#d02030" : "#1a30c0";
      ctx.fillText(urls[i % urls.length], 0, 0);
      ctx.restore();
    }
    // Corner doodles: arrows + stars
    ctx.strokeStyle = "#d02030";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 440);
    ctx.lineTo(30, 470);
    ctx.lineTo(60, 460);
    ctx.lineTo(30, 480);
    ctx.stroke();
    ctx.strokeStyle = "#1a30c0";
    ctx.strokeRect(380, 40, 90, 60);
    ctx.beginPath();
    ctx.arc(430, 470, 16, 0, Math.PI * 2);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private addGraffitiPanel(root: THREE.Group, side: "left" | "right") {
    const geo = new THREE.PlaneGeometry(4.6, 11);
    const mat = new THREE.MeshBasicMaterial({ map: this.graffitiTexture(side), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(side === "left" ? -5.2 : 5.2, 6.4, -3.55);
    mesh.userData.noCollision = true;
    root.add(mesh);
  }
}
