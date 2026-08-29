import * as THREE from 'three';

const ZEE = new THREE.Vector3(0, 0, 1);
const Q0 = new THREE.Quaternion();
const Q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -90 deg X

/**
 * 6-DOF Spaceflight Navigation & Mobile Gyroscope 360° Head Tracking Controls
 * Supports:
 * - DeviceOrientationEvent (alpha, beta, gamma)
 * - DeviceOrientationAbsolute
 * - Generic Sensor API (AbsoluteOrientationSensor / RelativeOrientationSensor)
 * - Touch 360° pan & Mouse free-look
 * - Full 360° Omnidirectional Yaw & Pitch
 */
export class NavigationControls {
  constructor(camera, domElement, solarSystem, selectionManager, gizmo, onToast) {
    this.camera = camera;
    this.domElement = domElement;
    this.solarSystem = solarSystem;
    this.selectionManager = selectionManager;
    this.gizmo = gizmo;
    this.onToast = onToast;

    // Speeds & Damping
    this.moveSpeed = 160.0;
    this.fastSpeedMult = 2.5;
    this.rotSpeed = 1.35;
    this.damping = 0.88;

    // Movement & Rotation
    this.velocity = new THREE.Vector3();
    this.zoomVelocity = 0;
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.rotationVelocity = { x: 0, y: 0 };
    this.manualYaw = 0;
    this.manualPitch = 0;

    // Device Gyroscope State
    this.deviceOrientation = {
      alpha: 0,
      beta: 0,
      gamma: 0,
      enabled: false,
      screenOrientation: 0
    };
    this.deviceQuaternion = new THREE.Quaternion();
    this.headingOffset = 0;

    // Keys
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      lookLeft: false,
      lookRight: false,
      lookUp: false,
      lookDown: false,
      shift: false
    };

    // Pointer & Touch
    this.isPointerDown = false;
    this.pointerPrev = { x: 0, y: 0 };

    this.initListeners();
    this.initDeviceOrientation();
  }

  initListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    // Pointer / Mouse Down
    this.domElement.addEventListener('pointerdown', (e) => {
      if (this.gizmo && this.gizmo.isDragging) return;
      this.isPointerDown = true;
      this.pointerPrev = { x: e.clientX, y: e.clientY };
      this.requestOrientationPermission();
    });

    // Pointer Move (360° Free Look)
    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown) return;
      if (this.gizmo && this.gizmo.isDragging) return;

      const deltaX = e.clientX - this.pointerPrev.x;
      const deltaY = e.clientY - this.pointerPrev.y;
      this.pointerPrev = { x: e.clientX, y: e.clientY };

      this.applyDrag(deltaX, deltaY);
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    // Mobile Touch Drag 360° Free Look
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length >= 1) {
        this.isPointerDown = true;
        this.pointerPrev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.requestOrientationPermission();
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isPointerDown || !e.touches[0]) return;
      const deltaX = e.touches[0].clientX - this.pointerPrev.x;
      const deltaY = e.touches[0].clientY - this.pointerPrev.y;
      this.pointerPrev = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      this.applyDrag(deltaX, deltaY);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isPointerDown = false;
    });

    // Mouse Wheel Zoom
    this.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.applyZoom(e.deltaY);
    }, { passive: false });
  }

  applyDrag(deltaX, deltaY) {
    const rotX = deltaY * 0.0024;
    const rotY = deltaX * 0.0024;
    this.rotationVelocity.y -= rotY;
    this.rotationVelocity.x -= rotX;
    this.manualYaw -= rotY;
    this.manualPitch -= rotX;
    this.manualPitch = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, this.manualPitch));
  }

  applyZoom(deltaY) {
    const direction = -Math.sign(deltaY);
    const intensity = Math.min(Math.abs(deltaY) * 0.008, 1.2);
    const camDist = Math.max(15, this.camera.position.length());
    const baseStep = Math.min(camDist * 0.2, 50.0);
    this.zoomVelocity += direction * intensity * baseStep;
  }

  /**
   * Request Gyroscope & Motion Sensor Access (iOS 13+ & Android)
   */
  requestOrientationPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            this.bindOrientationListeners();
          }
        })
        .catch(() => {});
    } else {
      this.bindOrientationListeners();
    }
  }

  initDeviceOrientation() {
    this.bindOrientationListeners();
    this.initGenericSensors();
  }

  bindOrientationListeners() {
    const handleOrientation = (e) => {
      if (e.alpha !== null && e.beta !== null && e.gamma !== null) {
        this.deviceOrientation.alpha = e.alpha;
        this.deviceOrientation.beta = e.beta;
        this.deviceOrientation.gamma = e.gamma;
        this.deviceOrientation.enabled = true;
        this.deviceOrientation.screenOrientation = window.orientation || (window.screen.orientation ? window.screen.orientation.angle : 0) || 0;
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('orientationchange', () => {
      this.deviceOrientation.screenOrientation = window.orientation || (window.screen.orientation ? window.screen.orientation.angle : 0) || 0;
    });
  }

  initGenericSensors() {
    if ('AbsoluteOrientationSensor' in window) {
      try {
        const sensor = new window.AbsoluteOrientationSensor({ frequency: 60 });
        sensor.addEventListener('reading', () => {
          if (sensor.quaternion) {
            this.deviceQuaternion.fromArray(sensor.quaternion);
            this.deviceOrientation.enabled = true;
          }
        });
        sensor.start();
      } catch (err) {}
    }
  }

  computeDeviceQuaternion() {
    const alpha = THREE.MathUtils.degToRad(this.deviceOrientation.alpha || 0);
    const beta = THREE.MathUtils.degToRad(this.deviceOrientation.beta || 0);
    const gamma = THREE.MathUtils.degToRad(this.deviceOrientation.gamma || 0);
    const orient = THREE.MathUtils.degToRad(this.deviceOrientation.screenOrientation || 0);

    const euler = new THREE.Euler(beta, alpha, -gamma, 'YXZ');
    this.deviceQuaternion.setFromEuler(euler);
    this.deviceQuaternion.multiply(Q1);
    this.deviceQuaternion.multiply(Q0.setFromAxisAngle(ZEE, -orient));
  }

  onKeyDown(e) {
    if (e.code === 'Space') e.preventDefault();

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyQ':
        this.keys.left = true;
        break;
      case 'ArrowLeft':
        this.keys.lookLeft = true;
        break;
      case 'KeyD':
        this.keys.right = true;
        break;
      case 'ArrowRight':
        this.keys.lookRight = true;
        break;
      case 'Space':
        this.keys.up = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.shift = true;
        this.keys.down = true;
        break;

      case 'KeyA':
        this.handleAnimationToggleKey();
        break;

      case 'Escape':
        this.selectionManager.clearSelection();
        if (this.onToast) this.onToast('SELECTION CLEARED // OVERVIEW MODE');
        break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyQ':
        this.keys.left = false;
        break;
      case 'ArrowLeft':
        this.keys.lookLeft = false;
        break;
      case 'KeyD':
        this.keys.right = false;
        break;
      case 'ArrowRight':
        this.keys.lookRight = false;
        break;
      case 'Space':
        this.keys.up = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.shift = false;
        this.keys.down = false;
        break;
    }
  }

  handleAnimationToggleKey() {
    const selected = this.selectionManager.selectedBody;

    if (selected) {
      const newState = selected.toggleAnimation();
      const statusText = newState ? 'RESUMED' : 'PAUSED';
      if (this.onToast) {
        this.onToast(`${selected.name.toUpperCase()} ANIMATION ${statusText}`);
      }
    } else {
      const newState = this.solarSystem.toggleGlobalAnimation();
      const statusText = newState ? 'ALL BODIES ACTIVE' : 'ALL BODIES FROZEN';
      if (this.onToast) {
        this.onToast(`GLOBAL SYSTEM ANIMATION: ${statusText}`);
      }
    }
  }

  update(deltaTime) {
    // 1. Angular Keyboard & Mouse / Touch Free-Look in Full 360° Space
    if (this.keys.lookLeft) {
      this.rotationVelocity.y += this.rotSpeed * deltaTime;
      this.manualYaw += this.rotSpeed * deltaTime;
    }
    if (this.keys.lookRight) {
      this.rotationVelocity.y -= this.rotSpeed * deltaTime;
      this.manualYaw -= this.rotSpeed * deltaTime;
    }

    if (this.deviceOrientation.enabled) {
      this.computeDeviceQuaternion();
      this.camera.quaternion.copy(this.deviceQuaternion);

      // Apply manual offset on top of gyro
      if (Math.abs(this.manualYaw) > 0.0001 || Math.abs(this.manualPitch) > 0.0001) {
        const offsetEuler = new THREE.Euler(this.manualPitch, this.manualYaw, 0, 'YXZ');
        const offsetQ = new THREE.Quaternion().setFromEuler(offsetEuler);
        this.camera.quaternion.multiply(offsetQ);
      }
    } else {
      this.euler.setFromQuaternion(this.camera.quaternion);
      
      // Yaw rotates continuously across all 360 degrees
      this.euler.y += this.rotationVelocity.y;
      this.euler.x += this.rotationVelocity.x;

      // Pitch range allowed up to ±88° (zenith & nadir)
      this.euler.x = Math.max(-Math.PI * 0.49, Math.min(Math.PI * 0.49, this.euler.x));
      this.camera.quaternion.setFromEuler(this.euler);
    }

    this.rotationVelocity.x *= this.damping;
    this.rotationVelocity.y *= this.damping;

    // 2. Translational Keyboard Navigation
    const moveVector = new THREE.Vector3();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0);

    let speed = this.moveSpeed;
    if (this.keys.shift && !this.keys.down) speed *= this.fastSpeedMult;

    if (this.keys.forward) moveVector.add(forward);
    if (this.keys.backward) moveVector.sub(forward);
    if (this.keys.right) moveVector.add(right);
    if (this.keys.left) moveVector.sub(right);
    if (this.keys.up) moveVector.add(up);
    if (this.keys.down) moveVector.sub(up);

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      this.velocity.addScaledVector(moveVector, speed * deltaTime);
    }

    this.camera.position.addScaledVector(this.velocity, deltaTime);
    this.velocity.multiplyScalar(this.damping);

    // 3. Smooth Damped Mouse Zoom
    if (Math.abs(this.zoomVelocity) > 0.005) {
      this.camera.position.addScaledVector(forward, this.zoomVelocity * deltaTime * 6.0);
      this.zoomVelocity *= 0.82;
    }
  }
}
