import * as THREE from 'three';
import { CONCEPTION_STAGES } from '../data/conceptionStages.js';

const DEFAULT_STAGES = CONCEPTION_STAGES;

/**
 * Universal 3D Environment Navigation Controller
 * Supports simultaneous Mouse, Keyboard, and Touch controls in both Desktop and VR modes.
 * 
 * 🖱️ MOUSE CONTROLS (Desktop & VR):
 * - Left-Click + Drag: 360° Omnidirectional Camera & Environment Orbit (360° Yaw + 180° Pitch)
 * - Right-Click / Middle-Click + Drag: Smooth Screen & Camera Panning in any 3D direction
 * - Scroll Wheel / Touch Pinch: Smooth Dolly Zoom In & Out (radius 4 to 450 units)
 * 
 * ⌨️ KEYBOARD CONTROLS (Desktop & VR):
 * - Arrow Keys (▲, ▼, ◀, ▶): Move camera in that direction (Up, Down, Left, Right)
 * - Z: Zoom In    X: Zoom Out
 * - 1 – 9: Jump & track stage / celestial body
 * - R: Rotate the currently selected 3D model on its axis
 * - C: Turn OFF / Stop the 3D model rotation
 * - F, B, L, T: Instant Camera Sides (Front, Back, Left, Top)
 * - Space: Pause / Resume simulation
 */
export class NavigationController {
  constructor(camera, cameraRig, domElement, isVRCallback, getActiveModelCallback) {
    this.camera = camera;
    this.cameraRig = cameraRig;
    this.domElement = domElement;
    this.isVRCallback = isVRCallback;
    this.getActiveModelCallback = getActiveModelCallback;

    this.stages = DEFAULT_STAGES;
    this.currentStageIndex = 0;
    this.isTransitioning = false;
    this.transitionProgress = 1.0;
    this.transitionDuration = 2.4; // Majestic cinematic glide duration

    // Auto 360 Spin
    this.autoRotate360 = false;

    // Per-model self-rotation: index of the model currently spinning on its own axis (-1 = none)
    this.spinningModelIndex = -1;
    this.modelSpinSpeed = 1.5; // radians per second

    // Flight interpolation endpoints
    this.startPos = new THREE.Vector3();
    this.targetPos = new THREE.Vector3();
    this.startLookAt = new THREE.Vector3();
    this.targetLookAt = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3(0, 0, 0);

    // Desktop & VR Spherical Orbit state (Full 360° yaw, full 180° pitch)
    this.isDragging = false;
    this.isRightDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.spherical = new THREE.Spherical(28, Math.PI * 0.38, 0);

    // Keyboard state
    this.keysPressed = {};

    this.initEventListeners();
    this.setStage(0, false);
  }

  startRotatingCurrentModel() {
    this.spinningModelIndex = this.currentStageIndex;
    console.log(`🔄 Rotating model ${this.currentStageIndex + 1} on its axis`);
  }

  stopRotatingModel() {
    this.spinningModelIndex = -1;
    console.log('🛑 Stopped 3D model rotation');
  }

  toggleRotatingCurrentModel() {
    if (this.spinningModelIndex === this.currentStageIndex) {
      this.stopRotatingModel();
    } else {
      this.startRotatingCurrentModel();
    }
  }

  initEventListeners() {
    // Window-level mouse listeners so clicking anywhere on screen rotates the 3D environment smoothly
    window.addEventListener('mousedown', (e) => {
      // Don't intercept clicks on interactive buttons, inputs, links, or modals
      if (e.target.closest('button, input, select, a, .hud-controls-panel, .help-card, .scientific-panel')) {
        return;
      }

      if (this.isGizmoActiveCallback && this.isGizmoActiveCallback()) {
        return;
      }

      if (e.button === 0) {
        // Left click: 360° Camera & 3D Environment Orbit Rotation
        this.isDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      } else if (e.button === 1 || e.button === 2) {
        // Right / Middle click: Pan Screen Up/Down/Left/Right
        this.isRightDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('contextmenu', (e) => {
      if (!e.target.closest('input, textarea')) {
        e.preventDefault();
      }
    });

    window.addEventListener('mousemove', (e) => {
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };

      if (this.isDragging) {
        // Full 360° Horizontal Yaw + 180° Vertical Pitch Orbit around environment & target
        this.spherical.theta -= deltaX * 0.0055;
        this.spherical.phi = Math.max(0.02, Math.min(Math.PI - 0.02, this.spherical.phi - deltaY * 0.0055));
        this.updateCameraFromSpherical();
      } else if (this.isRightDragging) {
        // Right drag: Pan screen up, down, left, right
        this.panCamera(-deltaX * 0.08, deltaY * 0.08);
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.isDragging = false;
      if (e.button === 1 || e.button === 2) this.isRightDragging = false;
    });

    // Mouse scroll wheel: Zoom in / out in both desktop and VR
    window.addEventListener('wheel', (e) => {
      if (e.target.closest('.help-body, .panel-body')) return;

      e.preventDefault();
      this.zoomCamera(e.deltaY * 0.04);
    }, { passive: false });

    // Keyboard Listeners
    window.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea')) return;
      this.keysPressed[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed[e.code] = false;
    });

    // Touch controls for mobile / tablets / VR
    let touchStartDist = 0;
    window.addEventListener('touchstart', (e) => {
      if (e.target.closest('button, input, select, a, .hud-controls-panel, .help-card, .scientific-panel')) {
        return;
      }

      if (this.isGizmoActiveCallback && this.isGizmoActiveCallback()) {
        return;
      }

      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (e.target.closest('.help-body, .panel-body')) return;

      if (e.touches.length === 1 && this.isDragging) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        this.spherical.theta -= deltaX * 0.007;
        this.spherical.phi = Math.max(0.02, Math.min(Math.PI - 0.02, this.spherical.phi - deltaY * 0.007));
        this.updateCameraFromSpherical();
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = touchStartDist - dist;
        this.zoomCamera(diff * 0.08);
        touchStartDist = dist;
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  zoomCamera(deltaZoom) {
    this.spherical.radius = Math.max(4, Math.min(450, this.spherical.radius + deltaZoom));
    this.updateCameraFromSpherical();
  }

  panCamera(deltaX, deltaY) {
    const activeCamera = this.camera;
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(activeCamera.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(activeCamera.quaternion);

    right.y = 0;
    right.normalize();

    this.currentLookAt.addScaledVector(right, deltaX);
    this.currentLookAt.addScaledVector(up, deltaY);
    this.updateCameraFromSpherical();
  }

  setStages(stagesArray, getModelCallback) {
    this.stages = stagesArray;
    if (getModelCallback) this.getActiveModelCallback = getModelCallback;
    this.currentStageIndex = 0;
    this.isTransitioning = false;
    this.transitionProgress = 1.0;
    this.setStage(0, false);
  }

  setCameraSideView(sideName) {
    const stage = this.stages[this.currentStageIndex];
    if (!stage) return;

    const r = stage.vrOffsetDist || 20;
    const targetLook = this.getTargetWorldPosition();

    let offset = new THREE.Vector3(0, 1.5, r);

    switch (sideName.toLowerCase()) {
      case 'front': offset.set(0, 1.5, r); break;
      case 'back': offset.set(0, 1.5, -r); break;
      case 'left': offset.set(-r, 1.5, 0); break;
      case 'right': offset.set(r, 1.5, 0); break;
      case 'top': offset.set(0, r * 1.25, 0.01); break;
      case 'bottom': offset.set(0, -r * 1.25, 0.01); break;
      case 'iso': offset.set(r * 0.7, r * 0.6, r * 0.7); break;
      default: offset.set(0, 2, r);
    }

    const targetPos = targetLook.clone().add(offset);
    this.startPos.copy(this.cameraRig ? this.cameraRig.position : this.camera.position);
    this.targetPos.copy(targetPos);
    this.startLookAt.copy(this.currentLookAt);
    this.targetLookAt.copy(targetLook);
    this.isTransitioning = true;
    this.transitionProgress = 0;
  }

  getTargetWorldPosition() {
    const model = this.getActiveModelCallback ? this.getActiveModelCallback(this.currentStageIndex) : null;
    if (model && model.group) {
      const worldPos = new THREE.Vector3();
      model.group.getWorldPosition(worldPos);
      return worldPos;
    }
    const stage = this.stages[this.currentStageIndex];
    if (stage && stage.lookAt) {
      return new THREE.Vector3(stage.lookAt.x, stage.lookAt.y || 0, stage.lookAt.z || 0);
    }
    return new THREE.Vector3(0, 0, 0);
  }

  updateCameraFromSpherical() {
    if (this.isTransitioning) return;
    const offset = new THREE.Vector3().setFromSpherical(this.spherical);
    const targetPos = this.currentLookAt.clone().add(offset);

    if (this.cameraRig) {
      this.cameraRig.position.copy(targetPos);
      if (this.isVRCallback && this.isVRCallback()) {
        this.cameraRig.quaternion.identity();
      } else {
        this.cameraRig.lookAt(this.currentLookAt);
        this.camera.position.set(0, 0, 0);
        this.camera.rotation.set(0, 0, 0);
      }
    } else {
      this.camera.position.copy(targetPos);
      this.camera.lookAt(this.currentLookAt);
    }
  }

  setStage(stageIndex, animated = true, customDuration = null) {
    if (stageIndex < 0 || stageIndex >= this.stages.length) return;
    this.autoRotate360 = false; // Disable camera orbital spinning so camera stops moving once arrived
    this.currentStageIndex = stageIndex;
    const stage = this.stages[stageIndex];
    const targetLook = this.getTargetWorldPosition();

    const dist = stage.vrOffsetDist || (stage.cameraPos ? Math.hypot(stage.cameraPos.x - (stage.lookAt ? stage.lookAt.x : 0), stage.cameraPos.z - (stage.lookAt ? stage.lookAt.z : 0)) : 25);
    this.spherical.radius = Math.max(6, dist);

    const offset = new THREE.Vector3().setFromSpherical(this.spherical);
    const targetPos = targetLook.clone().add(offset);

    if (animated) {
      this.transitionDuration = customDuration || 2.4;
      this.startPos.copy(this.cameraRig ? this.cameraRig.position : this.camera.position);
      this.targetPos.copy(targetPos);
      this.startLookAt.copy(this.currentLookAt);
      this.targetLookAt.copy(targetLook);
      this.isTransitioning = true;
      this.transitionProgress = 0;
    } else {
      this.currentLookAt.copy(targetLook);
      if (this.cameraRig) {
        this.cameraRig.position.copy(targetPos);
        if (this.isVRCallback && this.isVRCallback()) {
          this.cameraRig.quaternion.identity();
        } else {
          this.cameraRig.lookAt(this.currentLookAt);
          this.camera.position.set(0, 0, 0);
          this.camera.rotation.set(0, 0, 0);
        }
      } else {
        this.camera.position.copy(targetPos);
        this.camera.lookAt(this.currentLookAt);
      }
    }
  }

  applyRemoteInput(input) {
    if (input.type === 'drag') {
      if (this.isGizmoActiveCallback && this.isGizmoActiveCallback()) {
        return;
      }
      this.spherical.theta -= input.dx * 0.008;
      this.spherical.phi = Math.max(0.02, Math.min(Math.PI - 0.02, this.spherical.phi - input.dy * 0.008));
      this.updateCameraFromSpherical();
    } else if (input.type === 'pan') {
      this.panCamera(input.dx * 0.12, input.dy * 0.12);
    } else if (input.type === 'wheel') {
      this.zoomCamera(input.dy * 0.05);
    } else if (input.type === 'cameraSide') {
      this.setCameraSideView(input.side);
    } else if (input.type === 'teleport') {
      this.setStage(input.stageIndex, true);
    } else if (input.type === 'rotateModel') {
      this.startRotatingCurrentModel();
    } else if (input.type === 'stopRotateModel') {
      this.stopRotatingModel();
    } else if (input.type === 'reset') {
      this.setStage(0, true);
    }
  }

  update(delta) {
    // 1. Auto Turntable 360° continuous rotation
    if (this.autoRotate360 && !this.isDragging && !this.isRightDragging) {
      this.spherical.theta += delta * 0.35;
      this.updateCameraFromSpherical();
    }

    // 2. Keyboard Arrow Keys & WASD Screen Panning (Works in Desktop and VR)
    const activeCamera = this.camera;
    const panSpeed = 45.0 * delta * (this.spherical.radius * 0.04);
    let panned = false;

    if (this.keysPressed['ArrowLeft'] || this.keysPressed['KeyA']) {
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(activeCamera.quaternion);
      right.y = 0;
      right.normalize();
      this.currentLookAt.addScaledVector(right, -panSpeed);
      panned = true;
    }
    if (this.keysPressed['ArrowRight'] || this.keysPressed['KeyD']) {
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(activeCamera.quaternion);
      right.y = 0;
      right.normalize();
      this.currentLookAt.addScaledVector(right, panSpeed);
      panned = true;
    }
    if (this.keysPressed['ArrowUp'] || this.keysPressed['KeyW']) {
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(activeCamera.quaternion);
      this.currentLookAt.addScaledVector(up, panSpeed);
      panned = true;
    }
    if (this.keysPressed['ArrowDown'] || this.keysPressed['KeyS']) {
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(activeCamera.quaternion);
      this.currentLookAt.addScaledVector(up, -panSpeed);
      panned = true;
    }

    // 3. Keyboard Smooth Zoom (Z zooms in, X zooms out, Q/E, Equal/Minus, PageUp/PageDown)
    const zoomSpeed = 35.0 * delta;
    if (this.keysPressed['KeyZ'] || this.keysPressed['KeyQ'] || this.keysPressed['Equal'] || this.keysPressed['NumpadAdd'] || this.keysPressed['PageUp']) {
      this.zoomCamera(-zoomSpeed);
    }
    if (this.keysPressed['KeyX'] || this.keysPressed['KeyE'] || this.keysPressed['Minus'] || this.keysPressed['NumpadSubtract'] || this.keysPressed['PageDown']) {
      this.zoomCamera(zoomSpeed);
    }

    // 4. Keyboard 360° Orbit Rotation (J/L for yaw, I/K for pitch)
    const orbitSpeed = 1.6 * delta;
    if (this.keysPressed['KeyJ']) {
      this.spherical.theta += orbitSpeed;
      this.updateCameraFromSpherical();
    }
    if (this.keysPressed['KeyL'] && !this.keysPressed['ControlLeft']) {
      this.spherical.theta -= orbitSpeed;
      this.updateCameraFromSpherical();
    }
    if (this.keysPressed['KeyI']) {
      this.spherical.phi = Math.max(0.02, this.spherical.phi - orbitSpeed);
      this.updateCameraFromSpherical();
    }
    if (this.keysPressed['KeyK']) {
      this.spherical.phi = Math.min(Math.PI - 0.02, this.spherical.phi + orbitSpeed);
      this.updateCameraFromSpherical();
    }

    if (this.isTransitioning) {
      this.transitionProgress += delta / this.transitionDuration;

      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.isTransitioning = false;
      }

      // Smooth Quintic Ease-In-Out
      const t = this.transitionProgress;
      const ease = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

      const dynamicTarget = this.getTargetWorldPosition();
      this.targetLookAt.copy(dynamicTarget);

      this.currentLookAt.lerpVectors(this.startLookAt, this.targetLookAt, ease);

      if (this.cameraRig) {
        this.cameraRig.position.lerpVectors(this.startPos, this.targetPos, ease);
        if (this.isVRCallback && this.isVRCallback()) {
          this.cameraRig.quaternion.identity();
        } else {
          this.cameraRig.lookAt(this.currentLookAt);
          this.camera.position.set(0, 0, 0);
          this.camera.rotation.set(0, 0, 0);
        }
      } else {
        this.camera.position.lerpVectors(this.startPos, this.targetPos, ease);
        this.camera.lookAt(this.currentLookAt);
      }

      if (!this.isTransitioning) {
        const offset = (this.cameraRig ? this.cameraRig.position : this.camera.position).clone().sub(this.currentLookAt);
        this.spherical.setFromVector3(offset);
      }
    } else {
      // Dynamic live target tracking (unless user manually panned away or is dragging)
      if (!panned && !this.isRightDragging) {
        const targetPos = this.getTargetWorldPosition();
        this.currentLookAt.lerp(targetPos, Math.min(1.0, delta * 6.0));
      }

      this.updateCameraFromSpherical();
    }
  }
}
