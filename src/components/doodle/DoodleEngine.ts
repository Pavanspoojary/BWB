import * as THREE from "three";

export const INK_COLORS = {
  BLUE: 0,
  RED: 1,
  BLACK: 2,
  ORANGE: 3,
  GREEN: 4,
  CYAN: 5,
};

export const INK_VECTORS = [
  new THREE.Vector3(0.10, 0.19, 0.76), // Blue ink
  new THREE.Vector3(0.86, 0.12, 0.20), // Red ink
  new THREE.Vector3(0.18, 0.20, 0.26), // Black/Dark pencil
  new THREE.Vector3(0.92, 0.55, 0.08), // Orange highlighter
  new THREE.Vector3(0.12, 0.60, 0.30), // Green pen
  new THREE.Vector3(0.08, 0.52, 0.88), // Blueprint cyan
];

const G_VERTEX_SHADER = `
varying vec3 vNormalV;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 transformed = position;
  vec3 objectNormal = normal;
  #ifdef USE_INSTANCING
    transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
    objectNormal = mat3(instanceMatrix) * objectNormal;
  #endif
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  vNormalV = normalize(normalMatrix * objectNormal);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const G_FRAGMENT_SHADER = `
precision highp float;
uniform float uInk;
uniform float uFill;
uniform float uShadeScale;
uniform float uShadeBias;
uniform vec3 uLightDir;
varying vec3 vNormalV;
varying vec2 vUv;

void main() {
  vec3 n = normalize(vNormalV);
  if (!gl_FrontFacing) n = -n;
  float ndl = dot(n, uLightDir) * 0.5 + 0.5;
  float shade = clamp(ndl * uShadeScale + uShadeBias, 0.0, 1.0);
  if (uFill > 0.5) shade = -1.0;
  gl_FragColor = vec4(shade, uInk, n.x, n.y);
}
`;

const POST_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const POST_FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tScene;
uniform sampler2D tDepth;
uniform vec2 uRes;
uniform float uAspect;
uniform float uTime;
uniform float uNear;
uniform float uFar;
uniform float uLineSpacing;
uniform vec3 uPaper;
uniform vec3 uInks[6];
uniform mat4 uInvProj;
uniform mat4 uInvView;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float linDepth(float z) {
  float zn = z * 2.0 - 1.0;
  return (2.0 * uNear * uFar) / (uFar + uNear - zn * (uFar - uNear));
}

vec3 inkColor(float id) {
  int i = int(id + 0.5);
  if (i <= 0) return uInks[0];
  if (i == 1) return uInks[1];
  if (i == 2) return uInks[2];
  if (i == 3) return uInks[3];
  if (i == 4) return uInks[4];
  return uInks[5];
}

float stripes(vec2 p, vec2 dir, float spacing, float width) {
  float t = dot(p, vec2(-dir.y, dir.x));
  float f = abs(fract(t / spacing) - 0.5) * spacing;
  float soft = width * 0.6;
  return 1.0 - smoothstep(width * 0.5 - soft, width * 0.5 + soft, f);
}

void main() {
  vec2 px = 1.0 / uRes;
  float sc = uRes.y / 900.0;
  vec2 nuv = vUv * vec2(uAspect, 1.0);

  // Hand-drawn line jitter
  vec2 wob = vec2(vnoise(nuv * 6.0 + 11.3), vnoise(nuv * 6.0 + 37.0)) - 0.5;
  vec2 suv = vUv + wob * 1.8 * sc * px;

  vec4 s = texture2D(tScene, suv);
  float z = texture2D(tDepth, suv).x;
  float d = linDepth(z);
  float o = 1.15 * sc;

  vec2 ox = vec2(o, 0.0) * px;
  vec2 oy = vec2(0.0, o) * px;

  float zl = texture2D(tDepth, suv - ox).x;
  float zr = texture2D(tDepth, suv + ox).x;
  float zu = texture2D(tDepth, suv + oy).x;
  float zd = texture2D(tDepth, suv - oy).x;

  vec4 sl = texture2D(tScene, suv - ox);
  vec4 sr = texture2D(tScene, suv + ox);
  vec4 su = texture2D(tScene, suv + oy);
  vec4 sd = texture2D(tScene, suv - oy);

  // Scale-invariant Laplacian edge detection on inverse depth
  float iw = 1.0 / d;
  float lap = abs(1.0 / linDepth(zl) + 1.0 / linDepth(zr) - 2.0 * iw)
            + abs(1.0 / linDepth(zu) + 1.0 / linDepth(zd) - 2.0 * iw);
  float edge = smoothstep(0.07, 0.30, lap / (iw + 1e-7));

  // Normal difference edge detection
  float nEdge = length(sl.ba - sr.ba) + length(su.ba - sd.ba);
  edge = max(edge, smoothstep(0.38, 0.82, nEdge));

  // Front-most ink sample for silhouette borders
  float zmin = z;
  float inkId = s.g;
  if (zl < zmin) { zmin = zl; inkId = sl.g; }
  if (zr < zmin) { zmin = zr; inkId = sr.g; }
  if (zu < zmin) { zmin = zu; inkId = su.g; }
  if (zd < zmin) { zmin = zd; inkId = sd.g; }
  float dFront = linDepth(zmin);
  bool sky = z >= 0.9999;

  // World-anchored crosshatching strokes
  float shade = s.r;
  float hatch = 0.0;
  if (!sky) {
    if (shade < 0.0) {
      hatch = 1.0;
    } else {
      vec4 clip = vec4(vUv * 2.0 - 1.0, z * 2.0 - 1.0, 1.0);
      vec4 vpos = uInvProj * clip;
      vpos /= vpos.w;
      vec3 wpos = (uInvView * vec4(vpos.xyz, 1.0)).xyz;

      vec2 nxy = s.ba;
      vec3 nView = vec3(nxy, sqrt(max(0.0, 1.0 - dot(nxy, nxy))));
      vec3 wn = normalize(mat3(uInvView) * nView);
      vec3 an = abs(wn);

      vec2 hp = an.y > max(an.x, an.z) ? wpos.xz : (an.x > an.z ? wpos.zy : wpos.xy);
      float lod = exp2(floor(log2(max(1e-4, (0.0165 * d) / 0.16))));
      float sp = 0.16 * lod;
      float w = sp * 0.17;
      hp += (vnoise(hp * (2.5 / sp)) - 0.5) * sp * 0.4;

      const vec2 d1 = vec2(0.7071, 0.7071);
      const vec2 d2 = vec2(-0.7071, 0.7071);
      const vec2 d3 = vec2(0.2588, 0.9659);

      float h1 = stripes(hp, d1, sp, w);
      float h2 = stripes(hp, d2, sp * 1.15, w);
      float h3 = stripes(hp, d3, sp * 0.7, w);

      hatch = h1 * smoothstep(0.64, 0.5, shade);
      hatch = max(hatch, h2 * smoothstep(0.42, 0.32, shade));
      hatch = max(hatch, h3 * smoothstep(0.24, 0.14, shade));
      hatch = max(hatch, smoothstep(0.12, 0.0, shade) * 0.9);
    }
  }

  float fade = mix(1.0, 0.28, smoothstep(30.0, 550.0, d));
  float fadeE = mix(1.0, 0.45, smoothstep(60.0, 850.0, dFront));

  // Notebook paper simulation (cream base, grain, blue ruled lines, red left margin)
  vec2 pp = gl_FragCoord.xy;
  float grain = vnoise(pp * 0.8) * 0.6 + vnoise(pp * 0.17) * 0.4;
  vec3 paper = uPaper * (0.95 + 0.06 * grain);

  float ls = uLineSpacing;
  float ly = mod(pp.y + ls * 0.5, ls);
  float rule = 1.0 - smoothstep(0.5 * sc, 1.7 * sc, abs(ly - ls * 0.5));
  paper = mix(paper, vec3(0.58, 0.70, 0.92), rule * 0.45);

  float margin = 1.0 - smoothstep(0.9 * sc, 2.3 * sc, abs(pp.x - uRes.x * 0.07));
  paper = mix(paper, vec3(0.92, 0.48, 0.55), margin * 0.55);

  vec3 col = paper;
  // Apply ink crosshatching
  col = mix(col, inkColor(s.g), hatch * 0.72 * fade);

  // Apply ballpoint pen edge outlines with hand-drawn edge thickness waver
  float ew = 0.75 + 0.35 * vnoise(pp * 0.35);
  col = mix(col, inkColor(inkId) * 0.92, clamp(edge * ew, 0.0, 1.0) * fadeE);

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface DoodleEngineOptions {
  canvas: HTMLCanvasElement;
  antialias?: boolean;
}

export class DoodleEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public renderTarget: THREE.WebGLRenderTarget;

  private postScene: THREE.Scene;
  private postCamera: THREE.OrthographicCamera;
  private postMaterial: THREE.ShaderMaterial;
  private lightDir = new THREE.Vector3(0.4, 0.85, 0.35).normalize();
  private timeUniform = { value: 0 };
  private invProj = new THREE.Matrix4();
  private invView = new THREE.Matrix4();

  constructor(options: DoodleEngineOptions) {
    const { canvas, antialias = true } = options;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Main 3D Scene - Expanded far plane for real-scale city & circuit maps
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 20000);
    this.camera.position.set(0, 16, 42);

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Render Target with Depth Texture
    const depthTexture = new THREE.DepthTexture(width, height);
    depthTexture.type = THREE.UnsignedIntType;

    this.renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthTexture,
      depthBuffer: true,
    });

    // Fullscreen Post-Processing Quad
    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.postMaterial = new THREE.ShaderMaterial({
      vertexShader: POST_VERTEX_SHADER,
      fragmentShader: POST_FRAGMENT_SHADER,
      uniforms: {
        tScene: { value: this.renderTarget.texture },
        tDepth: { value: depthTexture },
        uRes: { value: new THREE.Vector2(width, height) },
        uAspect: { value: width / height },
        uTime: this.timeUniform,
        uNear: { value: this.camera.near },
        uFar: { value: this.camera.far },
        uLineSpacing: { value: 28.0 },
        uPaper: { value: new THREE.Vector3(0.965, 0.955, 0.905) },
        uInks: { value: INK_VECTORS },
        uInvProj: { value: this.invProj },
        uInvView: { value: this.invView },
      },
      depthTest: false,
      depthWrite: false,
    });

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(quadGeo, this.postMaterial);
    this.postScene.add(quad);

    this.setupSkyAndEnvironment();
    window.addEventListener("resize", this.onResize);
  }

  public createDoodleMaterial(options: {
    ink?: number;
    fill?: boolean;
    shadeScale?: number;
    shadeBias?: number;
    side?: THREE.Side;
  } = {}): THREE.ShaderMaterial {
    const ink = options.ink ?? INK_COLORS.BLUE;
    const fill = options.fill ? 1 : 0;
    const shadeScale = options.shadeScale ?? 1.0;
    const shadeBias = options.shadeBias ?? 0.0;

    return new THREE.ShaderMaterial({
      vertexShader: G_VERTEX_SHADER,
      fragmentShader: G_FRAGMENT_SHADER,
      uniforms: {
        uInk: { value: ink },
        uFill: { value: fill },
        uShadeScale: { value: shadeScale },
        uShadeBias: { value: shadeBias },
        uLightDir: { value: this.lightDir },
        uTime: this.timeUniform,
      },
      side: options.side ?? THREE.FrontSide,
    });
  }

  private setupSkyAndEnvironment() {
    const skyGroup = new THREE.Group();
    skyGroup.name = "DoodleSkyDome";

    const blueMat = this.createDoodleMaterial({ ink: INK_COLORS.BLUE, fill: false });
    const cyanMat = this.createDoodleMaterial({ ink: INK_COLORS.CYAN, fill: false });
    const orangeMat = this.createDoodleMaterial({ ink: INK_COLORS.ORANGE, fill: true });

    const domeRadius = 75;

    // 1. Longitude Rib Arches (from ground rim to apex)
    const numRibs = 12;
    for (let i = 0; i < numRibs; i++) {
      const angle = (i / numRibs) * Math.PI;
      const points: THREE.Vector3[] = [];
      const segments = 32;
      for (let s = 0; s <= segments; s++) {
        const phi = (s / segments) * Math.PI;
        const x = Math.sin(phi) * Math.cos(angle) * domeRadius;
        const z = Math.sin(phi) * Math.sin(angle) * domeRadius;
        const y = Math.cos(phi) * domeRadius;
        if (y >= -1) points.push(new THREE.Vector3(x, Math.max(0, y), z));
      }
      if (points.length >= 2) {
        const curve = new THREE.CatmullRomCurve3(points);
        const ribGeo = new THREE.TubeGeometry(curve, 32, 0.25, 4, false);
        const rib = new THREE.Mesh(ribGeo, blueMat);
        rib.userData.noCollision = true;
        skyGroup.add(rib);
      }
    }

    // 2. Concentric Horizontal Latitude Rings
    const ringHeights = [22, 45, 62];
    ringHeights.forEach((h) => {
      const r = Math.sqrt(Math.max(0, domeRadius * domeRadius - h * h));
      const ringGeo = new THREE.TorusGeometry(r, 0.22, 6, 48);
      ringGeo.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, cyanMat);
      ring.position.y = h;
      ring.userData.noCollision = true;
      skyGroup.add(ring);
    });

    // 3. Ground Rim Collar Ring
    const rimGeo = new THREE.TorusGeometry(domeRadius, 0.35, 6, 48);
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, blueMat);
    rim.position.y = 0.2;
    rim.userData.noCollision = true;
    skyGroup.add(rim);

    // 4. Hand-Drawn Doodle Sun with Rays (matching reference screenshot)
    const sunGroup = new THREE.Group();
    sunGroup.position.set(-18, 52, -35);
    const sunRingGeo = new THREE.RingGeometry(5.0, 5.8, 32);
    const sunRing = new THREE.Mesh(sunRingGeo, orangeMat);
    sunGroup.add(sunRing);

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const rayGeo = new THREE.BoxGeometry(0.35, 3.2, 0.35);
      const ray = new THREE.Mesh(rayGeo, orangeMat);
      ray.position.set(Math.cos(angle) * 7.6, Math.sin(angle) * 7.6, 0);
      ray.rotation.z = angle + Math.PI / 2;
      sunGroup.add(ray);
    }
    const eye1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.2), orangeMat);
    eye1.position.set(-1.8, 1.2, 0.1);
    const eye2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.2), orangeMat);
    eye2.position.set(1.8, 1.2, 0.1);
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.2, 4, 12, Math.PI), orangeMat);
    mouth.position.set(0, -0.6, 0.1);
    mouth.rotation.z = Math.PI;
    sunGroup.add(eye1, eye2, mouth);
    sunGroup.userData.noCollision = true;
    skyGroup.add(sunGroup);

    // 5. Floating Doodle Clouds
    const cloudPositions = [
      { x: 32, y: 48, z: -25, scale: 1.2 },
      { x: -35, y: 44, z: 15, scale: 0.9 },
      { x: 20, y: 55, z: 25, scale: 1.0 },
    ];
    cloudPositions.forEach((cp) => {
      const cloud = new THREE.Group();
      cloud.position.set(cp.x, cp.y, cp.z);
      const c1 = new THREE.Mesh(new THREE.SphereGeometry(3.5 * cp.scale, 8, 6), cyanMat);
      const c2 = new THREE.Mesh(new THREE.SphereGeometry(4.5 * cp.scale, 8, 6), cyanMat);
      c2.position.set(3.2 * cp.scale, 0.8 * cp.scale, 0);
      const c3 = new THREE.Mesh(new THREE.SphereGeometry(3.2 * cp.scale, 8, 6), cyanMat);
      c3.position.set(6.2 * cp.scale, -0.4 * cp.scale, 0);
      cloud.add(c1, c2, c3);
      cloud.userData.noCollision = true;
      skyGroup.add(cloud);
    });

    // 6. Paper Airplanes Gliding in Sky Dome
    const planePositions = [
      { x: -10, y: 46, z: -10, rotY: 0.4, rotZ: 0.1 },
      { x: 25, y: 38, z: -15, rotY: -0.6, rotZ: -0.15 },
    ];
    planePositions.forEach((pp) => {
      const plane = new THREE.Group();
      plane.position.set(pp.x, pp.y, pp.z);
      plane.rotation.set(0.1, pp.rotY, pp.rotZ);

      const wingGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        0, 0, 3.5,
        -2.2, 0.4, -2.5,
        0, 0.1, -1.8,
        0, 0, 3.5,
        0, 0.1, -1.8,
        2.2, 0.4, -2.5,
        0, 0, 3.5,
        0, -0.6, -2.0,
        0, 0.1, -1.8,
      ]);
      wingGeo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      wingGeo.computeVertexNormals();
      const planeMesh = new THREE.Mesh(wingGeo, blueMat);
      plane.add(planeMesh);
      plane.userData.noCollision = true;
      skyGroup.add(plane);
    });

    this.scene.add(skyGroup);
  }

  private onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
    this.renderTarget.setSize(w, h);

    this.postMaterial.uniforms.uRes.value.set(w, h);
    this.postMaterial.uniforms.uAspect.value = w / h;
  };

  public render(delta: number = 0.016) {
    this.timeUniform.value += delta;

    // Update inverse view and projection matrices
    this.invProj.copy(this.camera.projectionMatrixInverse);
    this.invView.copy(this.camera.matrixWorld);

    // Pass 1: Render G-Buffer to Target
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    // Pass 2: Render Post-Processing Doodle Shader to Canvas
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);
  }

  public dispose() {
    window.removeEventListener("resize", this.onResize);
    this.renderTarget.dispose();
    this.renderer.dispose();
  }
}