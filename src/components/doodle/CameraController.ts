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

  // Walk bounds for comfortable district exploration
  private readonly walkClamp = new THREE.Vector3(320, 0, 320);

  // Zoom limits for orbit mode (distance from target)
  private readonly minOrbitRadius = 15;
  private readonly maxOrbitRadius = 550;
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
      this.updateWalkCamera();
    } else {
      this.updateOrbitCamera();
    }
  }

  private setupEvents() {
    this.domElement.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("mousemove", this.onMouseMove);
    this.domElement.addEventListener("wheel", this.onWheel, { passive: false });

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

  private checkCollision(testPos: THREE.Vector3): boolean {
    if (!this.getColliders) return false;
    const colliders = this.getColliders();
    if (!colliders || colliders.length === 0) return false;

    const radius = 0.8;
    const pMinX = testPos.x - radius;
    const pMaxX = testPos.x + radius;
    const pMinZ = testPos.z - radius;
    const pMaxZ = testPos.z + radius;
    const pMinY = testPos.y - 0.8;
    const pMaxY = testPos.y + 0.8;

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

  public update(delta: number) {
    if (this.mode === "orbit") {
      if (this.autoRotate && !this.isOrbitDragging && !this.isPanning) {
        this.spherical.theta += 0.04 * delta;
        // Clamp orbit radius within limits
        this.spherical.radius = Math.max(this.minOrbitRadius, Math.min(this.maxOrbitRadius, this.spherical.radius));
        this.updateOrbitCamera();
      }
    } else if (this.mode === "walk") {
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
          const deltaMove = moveDir.clone().multiplyScalar(speed * delta);

          // Wall collision with smooth sliding along axes
          const testX = this.walkPos.clone();
          testX.x += deltaMove.x;
          if (!this.checkCollision(testX)) {
            this.walkPos.x = testX.x;
          }

          const testZ = this.walkPos.clone();
          testZ.z += deltaMove.z;
          if (!this.checkCollision(testZ)) {
            this.walkPos.z = testZ.z;
          }

          // Clamp inside district boundary
          this.walkPos.x = Math.max(-this.walkClamp.x, Math.min(this.walkClamp.x, this.walkPos.x));
          this.walkPos.z = Math.max(-this.walkClamp.z, Math.min(this.walkClamp.z, this.walkPos.z));
        }
      }

      // Jump & Gravity physics
      if (!this.isGrounded) {
        this.verticalVelocity -= 28.0 * delta; // Gravity
        this.walkPos.y += this.verticalVelocity * delta;

        if (this.walkPos.y <= this.groundHeight) {
          this.walkPos.y = this.groundHeight;
          this.verticalVelocity = 0;
          this.isGrounded = true;
          this.jumpsRemaining = 2;
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
