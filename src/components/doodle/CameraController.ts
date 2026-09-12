import * as THREE from "three";

export type CameraMode = "orbit" | "walk";

export class CameraController {
  public mode: CameraMode = "orbit";
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;
  public autoRotate: boolean = true;
  public getColliders?: () => THREE.Box3[];

  // Orbit controls state
  private target = new THREE.Vector3(0, 6, 0);
  private spherical = new THREE.Spherical(95, Math.PI / 3.2, Math.PI / 4);
  private isOrbitDragging = false;
  private isPanning = false;
  private previousMouse = { x: 0, y: 0 };

  // Walk controls state
  private walkPos = new THREE.Vector3(0, 2.0, 35);
  private walkYaw = Math.PI;
  private walkPitch = 0;
  private walkStepTimer = 0;
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private isSprinting = false;
  private isCrouching = false;
  // Jump physics
  private verticalVelocity = 0;
  private isGrounded = true;
  private jumpsRemaining = 2;
  private groundHeight = 2.0;

  // Walk bounds for comfortable megacity exploration
  private readonly walkClamp = new THREE.Vector3(600, 0, 600);

  // Zoom limits for orbit mode (distance from target)
  private readonly minOrbitRadius = 15;
  private readonly maxOrbitRadius = 900;
  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.updateOrbitCamera();
    this.setupEvents();
  }

  public setMode(mode: CameraMode) {
    this.mode = mode;
    if (mode === "walk") {
      this.autoRotate = false;
      this.walkPos.set(0, 2.0, 35);
      this.walkYaw = Math.PI;
      this.walkPitch = 0;
      this.resolvePenetration();
      this.updateWalkCamera();
    } else {
      this.updateOrbitCamera();
    }
  }

  private setupEvents() {
    if (typeof window === "undefined") return;
    if (this.domElement && typeof this.domElement.addEventListener === "function") {
      this.domElement.addEventListener("mousedown", this.onMouseDown);
      this.domElement.addEventListener("wheel", this.onWheel, { passive: false });
    }
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private onMouseDown = (e: MouseEvent) => {
    this.previousMouse.x = e.clientX;
    this.previousMouse.y = e.clientY;

    if (this.mode === "orbit") {
      this.autoRotate = false;
      if (e.button === 0) {
        this.isOrbitDragging = true;
      } else if (e.button === 2) {
        this.isPanning = true;
      }
    } else if (this.mode === "walk") {
      if (e.button === 0) {
        this.isOrbitDragging = true;
      }
    }
  };

  private onMouseUp = () => {
    this.isOrbitDragging = false;
    this.isPanning = false;
  };

  private onMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - this.previousMouse.x;
    const dy = e.clientY - this.previousMouse.y;
    this.previousMouse.x = e.clientX;
    this.previousMouse.y = e.clientY;

    if (this.mode === "orbit") {
      if (this.isOrbitDragging) {
        this.spherical.theta -= dx * 0.005;
        this.spherical.phi = Math.max(0.1, Math.min(Math.PI / 2.05, this.spherical.phi - dy * 0.005));
        this.updateOrbitCamera();
      } else if (this.isPanning) {
        const panSpeed = 0.05 * (this.spherical.radius / 60);
        const forward = new THREE.Vector3().subVectors(this.target, this.camera.position);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();

        this.target.addScaledVector(right, dx * panSpeed);
        this.target.addScaledVector(forward, dy * panSpeed);
        this.updateOrbitCamera();
      }
    } else if (this.mode === "walk") {
      if (this.isOrbitDragging) {
        this.walkYaw -= dx * 0.0035;
        this.walkPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.walkPitch - dy * 0.0035));
        this.updateWalkCamera();
      }
    }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (this.mode === "orbit") {
      this.spherical.radius = Math.max(this.minOrbitRadius, Math.min(this.maxOrbitRadius, this.spherical.radius + e.deltaY * 0.08));
      this.updateOrbitCamera();
    }
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.mode !== "walk") return;
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        this.moveForward = true;
        break;
      case "KeyS":
      case "ArrowDown":
        this.moveBackward = true;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.moveLeft = true;
        break;
      case "KeyD":
      case "ArrowRight":
        this.moveRight = true;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        this.isSprinting = true;
        break;
      case "KeyC":
      case "ControlLeft":
      case "ControlRight":
        this.isCrouching = true;
        break;
      case "Space":
        if (this.jumpsRemaining > 0) {
          this.verticalVelocity = 12.0;
          this.isGrounded = false;
          this.jumpsRemaining--;
        }
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        this.moveForward = false;
        break;
      case "KeyS":
      case "ArrowDown":
        this.moveBackward = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        this.moveLeft = false;
        break;
      case "KeyD":
      case "ArrowRight":
        this.moveRight = false;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        this.isSprinting = false;
        break;
      case "KeyC":
      case "ControlLeft":
      case "ControlRight":
        this.isCrouching = false;
        break;
    }
  };

  private updateOrbitCamera() {
    this.camera.position.setFromSpherical(this.spherical).add(this.target);
    this.camera.lookAt(this.target);
  }

  private updateWalkCamera() {
    const euler = new THREE.Euler(this.walkPitch, this.walkYaw, 0, "YXZ");
    this.camera.quaternion.setFromEuler(euler);

    // Footstep bobbing
    const bob = this.isGrounded ? Math.sin(this.walkStepTimer * (this.isSprinting ? 16 : 11)) * 0.06 : 0;
    const eyeTarget = this.isCrouching ? 1.1 : this.groundHeight;
    this.camera.position.set(this.walkPos.x, this.walkPos.y + bob + (eyeTarget - this.groundHeight), this.walkPos.z);
  }

  public getPosition(): THREE.Vector3 {
    return this.mode === "walk" ? this.walkPos : this.camera.position;
  }

  public teleportTo(x: number, y: number, z: number, targetLookAt?: THREE.Vector3) {
    if (this.mode === "walk") {
      this.groundHeight = y + 2.0;
      this.walkPos.set(x, y + 2.0, z);
      this.verticalVelocity = 0;
      this.isGrounded = true;

      // If spawn position hits an obstacle, nudge player until clear
      if (this.checkCollision(this.walkPos)) {
        for (const offset of [1.5, -1.5, 3.0, -3.0, 4.5, -4.5]) {
          const nudgeZ = this.walkPos.clone().setZ(this.walkPos.z + offset);
          if (!this.checkCollision(nudgeZ)) {
            this.walkPos.copy(nudgeZ);
            break;
          }
          const nudgeX = this.walkPos.clone().setX(this.walkPos.x + offset);
          if (!this.checkCollision(nudgeX)) {
            this.walkPos.copy(nudgeX);
            break;
          }
        }
      }
      this.resolvePenetration();

      if (targetLookAt) {
        const dir = new THREE.Vector3().subVectors(targetLookAt, this.walkPos);
        this.walkYaw = Math.atan2(-dir.x, -dir.z);
      }
      this.updateWalkCamera();
    } else {
      this.target.set(x, y + 6, z);
      this.updateOrbitCamera();
    }
  }

  private resolvePenetration() {
    if (!this.getColliders) return;
    const colliders = this.getColliders();
    if (!colliders || colliders.length === 0) return;

    const radius = 0.65;
    const pMinY = this.walkPos.y - 1.85;
    const pMaxY = this.walkPos.y + 0.3;

    for (let iter = 0; iter < 4; iter++) {
      let collided = false;
      for (let i = 0; i < colliders.length; i++) {
        const b = colliders[i];
        if (pMinY < b.max.y && pMaxY > b.min.y) {
          const pMinX = this.walkPos.x - radius;
          const pMaxX = this.walkPos.x + radius;
          const pMinZ = this.walkPos.z - radius;
          const pMaxZ = this.walkPos.z + radius;

          if (pMinX < b.max.x && pMaxX > b.min.x && pMinZ < b.max.z && pMaxZ > b.min.z) {
            collided = true;
            // Push player out towards the shallowest exit normal
            const overlapX1 = b.max.x - pMinX; // push +X
            const overlapX2 = pMaxX - b.min.x; // push -X
            const overlapZ1 = b.max.z - pMinZ; // push +Z
            const overlapZ2 = pMaxZ - b.min.z; // push -Z

            const minOverlap = Math.min(overlapX1, overlapX2, overlapZ1, overlapZ2);
            if (minOverlap === overlapX1) {
              this.walkPos.x += overlapX1 + 0.02;
            } else if (minOverlap === overlapX2) {
              this.walkPos.x -= overlapX2 + 0.02;
            } else if (minOverlap === overlapZ1) {
              this.walkPos.z += overlapZ1 + 0.02;
            } else {
              this.walkPos.z -= overlapZ2 + 0.02;
            }
          }
        }
      }
      if (!collided) break;
    }
  }

  private checkCollision(testPos: THREE.Vector3): boolean {
    if (!this.getColliders) return false;
    const colliders = this.getColliders();
    if (!colliders || colliders.length === 0) return false;

    const radius = 0.65;
    const pMinX = testPos.x - radius;
    const pMaxX = testPos.x + radius;
    const pMinZ = testPos.z - radius;
    const pMaxZ = testPos.z + radius;
    // Player's feet are at ground level (testPos.y - 1.85), head is at (testPos.y + 0.3)
    const pMinY = testPos.y - 1.85;
    const pMaxY = testPos.y + 0.3;

    for (let i = 0; i < colliders.length; i++) {
      const b = colliders[i];
      if (pMinY < b.max.y && pMaxY > b.min.y) {
        if (pMinX < b.max.x && pMaxX > b.min.x && pMinZ < b.max.z && pMaxZ > b.min.z) {
          return true;
        }
      }
    }
    return false;
  }

  private getSurfaceHeightUnder(pos: THREE.Vector3): number {
    let surfaceY = 0;
    // Base district heights for compatibility
    if (pos.z >= -280 && pos.z <= -180 && Math.abs(pos.x) <= 90) {
      const t = Math.max(0, Math.min(1, ((-pos.z) - 180) / 100));
      surfaceY = t * 25;
    } else if (pos.z <= -280 && Math.abs(pos.x) <= 100 && pos.y >= 50) {
      surfaceY = 80;
    } else if (pos.z >= 30 && pos.z <= 160 && Math.abs(pos.x) <= 80 && pos.y < -5) {
      surfaceY = -16;
    } else if (pos.z <= -280 && Math.abs(pos.x) <= 80 && pos.y < -10) {
      surfaceY = -25;
    }

    if (!this.getColliders) return surfaceY;
    const colliders = this.getColliders();
    if (!colliders || colliders.length === 0) return surfaceY;

    const feetY = pos.y - 1.85;
    const footRadius = 0.45;

    // Detect highest solid collider surface directly beneath player's feet
    for (let i = 0; i < colliders.length; i++) {
      const b = colliders[i];
      if (
        pos.x + footRadius > b.min.x &&
        pos.x - footRadius < b.max.x &&
        pos.z + footRadius > b.min.z &&
        pos.z - footRadius < b.max.z
      ) {
        // Platform or stair step: must be below feet or at most 0.65m step-up
        if (b.max.y <= feetY + 0.65) {
          if (b.max.y > surfaceY) {
            surfaceY = b.max.y;
          }
        }
      }
    }
    return surfaceY;
  }

  public update(delta: number) {
    if (this.mode === "orbit") {
      if (this.autoRotate && !this.isOrbitDragging && !this.isPanning) {
        this.spherical.theta += 0.04 * delta;
        // Clamp orbit radius within limits
        this.spherical.radius = Math.max(this.minOrbitRadius, Math.min(this.maxOrbitRadius, this.spherical.radius));
        this.updateOrbitCamera();
      }
    } else if (this.mode === "walk") {
      const surfaceY = this.getSurfaceHeightUnder(this.walkPos);
      this.groundHeight = surfaceY + 2.0;

      const isMoving = this.moveForward || this.moveBackward || this.moveLeft || this.moveRight;
      const speed = this.isSprinting ? 36.0 : (this.isCrouching ? 8.0 : 20.0);

      if (isMoving) {
        this.walkStepTimer += delta;

        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.walkYaw);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.walkYaw);

        const moveDir = new THREE.Vector3();
        if (this.moveForward) moveDir.add(forward);
        if (this.moveBackward) moveDir.sub(forward);
        if (this.moveRight) moveDir.add(right);
        if (this.moveLeft) moveDir.sub(right);

        if (moveDir.lengthSq() > 0) {
          moveDir.normalize();
          const totalMove = moveDir.clone().multiplyScalar(speed * delta);
          const dist = totalMove.length();
          const maxStep = 0.25; // Sub-stepping prevents wall tunneling at high speed
          const steps = Math.max(1, Math.ceil(dist / maxStep));
          const stepMove = totalMove.clone().divideScalar(steps);

          for (let s = 0; s < steps; s++) {
            // Wall collision with smooth sliding along X axis + stair stepping
            const testX = this.walkPos.clone();
            testX.x += stepMove.x;
            if (!this.checkCollision(testX)) {
              this.walkPos.x = testX.x;
            } else {
              const stepUpX = testX.clone();
              stepUpX.y += 0.5;
              if (!this.checkCollision(stepUpX)) {
                this.walkPos.x = testX.x;
                this.walkPos.y = stepUpX.y;
              }
            }

            // Wall collision with smooth sliding along Z axis + stair stepping
            const testZ = this.walkPos.clone();
            testZ.z += stepMove.z;
            if (!this.checkCollision(testZ)) {
              this.walkPos.z = testZ.z;
            } else {
              const stepUpZ = testZ.clone();
              stepUpZ.y += 0.5;
              if (!this.checkCollision(stepUpZ)) {
                this.walkPos.z = testZ.z;
                this.walkPos.y = stepUpZ.y;
              }
            }
          }

          this.resolvePenetration();

          // Clamp inside arena boundary
          this.walkPos.x = Math.max(-this.walkClamp.x, Math.min(this.walkClamp.x, this.walkPos.x));
          this.walkPos.z = Math.max(-this.walkClamp.z, Math.min(this.walkClamp.z, this.walkPos.z));
        }
      }

      // Jump & Gravity physics with vertical platform landing
      if (!this.isGrounded) {
        this.verticalVelocity -= 28.0 * delta; // Gravity
        this.walkPos.y += this.verticalVelocity * delta;

        if (this.walkPos.y <= this.groundHeight) {
          this.walkPos.y = this.groundHeight;
          this.verticalVelocity = 0;
          this.isGrounded = true;
          this.jumpsRemaining = 2;
        }
      } else {
        // If walking off an edge onto lower ground or void
        if (this.walkPos.y > this.groundHeight + 0.3) {
          this.isGrounded = false;
        } else {
          // Smoothly adapt to stepped surface height (e.g. climbing stairs)
          this.walkPos.y = THREE.MathUtils.lerp(this.walkPos.y, this.groundHeight, 0.35);
        }
      }

      this.updateWalkCamera();
    }
  }

  public dispose() {
    this.domElement.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("mousemove", this.onMouseMove);
    this.domElement.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
