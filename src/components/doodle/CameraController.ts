import * as THREE from "three";

export type CameraMode = "orbit" | "walk";

export class CameraController {
  public mode: CameraMode = "orbit";
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;

  // Orbit controls state
  private target = new THREE.Vector3(0, 4, 0);
  private spherical = new THREE.Spherical(55, Math.PI / 3.2, Math.PI / 4);
  private isOrbitDragging = false;
  private isPanning = false;
  private previousMouse = { x: 0, y: 0 };

  // Walk controls state
  private walkPos = new THREE.Vector3(0, 2.0, 35);
  private walkYaw = 0;
  private walkPitch = 0;
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private walkSpeed = 16.0;
  private walkStepTimer = 0;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.updateOrbitCamera();
    this.setupEvents();
  }

  public setMode(mode: CameraMode) {
    this.mode = mode;
    if (mode === "walk") {
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
        const panSpeed = 0.04 * (this.spherical.radius / 50);
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
      this.spherical.radius = Math.max(12, Math.min(120, this.spherical.radius + e.deltaY * 0.05));
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
    const bob = Math.sin(this.walkStepTimer * 12) * 0.06;
    this.camera.position.set(this.walkPos.x, this.walkPos.y + bob, this.walkPos.z);
  }

  public update(delta: number) {
    if (this.mode === "walk") {
      const isMoving = this.moveForward || this.moveBackward || this.moveLeft || this.moveRight;
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
          this.walkPos.addScaledVector(moveDir, this.walkSpeed * delta);
          // Clamp inside city boundary
          this.walkPos.x = Math.max(-65, Math.min(65, this.walkPos.x));
          this.walkPos.z = Math.max(-65, Math.min(65, this.walkPos.z));
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
