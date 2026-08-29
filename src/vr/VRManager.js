import * as THREE from 'three';

/**
 * WebXR VR Manager
 * Supports Native Immersive VR, 6-DOF Controllers, Thumbstick Locomotion,
 * PC Remote Mouse/Keyboard Flight Control, and Target Planet Teleportation.
 */
export class VRManager {
  constructor(renderer, scene, camera, solarSystem, selectionManager, gizmo) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.solarSystem = solarSystem;
    this.selectionManager = selectionManager;
    this.gizmo = gizmo;

    this.isVRSupported = false;
    this.isInVR = false;

    // VR User Rig (for camera and controllers in space)
    this.dolly = new THREE.Group();
    this.dolly.name = 'VR_Dolly_Rig';
    this.dolly.position.set(0, 40, 220);
    this.scene.add(this.dolly);
    this.dolly.add(this.camera);

    // Continuous Flight State
    this.flightSpeed = 140.0;
    this.isFlyingForward = false;
    this.isFlyingBackward = false;
    this.isStrafingLeft = false;
    this.isStrafingRight = false;

    // Remote PC keys state
    this.remoteKeys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      lookLeft: false,
      lookRight: false
    };

    // Remote velocity & rotation
    this.remoteRotVelocity = { x: 0, y: 0 };
    this.remoteVelocity = new THREE.Vector3();

    // Controllers
    this.controllers = [];
    this.controllerGrips = [];
    this.activeRaycaster = new THREE.Raycaster();
    this.tempMatrix = new THREE.Matrix4();

    // Controller Drag State
    this.vrDraggingGizmo = false;
    this.draggingController = null;

    this.checkVRSupport();
  }

  async checkVRSupport() {
    const vrBtn = document.getElementById('btn-vr-enter');
    if ('xr' in navigator) {
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        this.isVRSupported = supported;
        if (supported) {
          this.setupVRButton(vrBtn);
          this.initControllers();
        } else {
          this.setVRButtonUnsupported(vrBtn);
        }
      } catch (err) {
        this.setVRButtonUnsupported(vrBtn);
      }
    } else {
      this.setVRButtonUnsupported(vrBtn);
    }
  }

  setupVRButton(btn) {
    if (!btn) return;
    btn.innerHTML = '<span class="vr-icon">🥽</span> ENTER VR';
    btn.classList.add('glow-btn-cyan');
    btn.addEventListener('click', () => this.toggleVRSession(btn));
  }

  setVRButtonUnsupported(btn) {
    if (!btn) return;
    btn.innerHTML = '<span class="vr-icon">🥽</span> ENTER VR';
    btn.title = 'WebXR Immersive Mode';
    btn.addEventListener('click', () => this.toggleVRSession(btn));
  }

  async toggleVRSession(btn) {
    if (!this.isInVR) {
      try {
        const session = await navigator.xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
        });
        await this.renderer.xr.setSession(session);
        this.isInVR = true;
        if (btn) btn.innerHTML = '<span class="vr-icon">🥽</span> EXIT VR';

        session.addEventListener('end', () => {
          this.isInVR = false;
          if (btn) btn.innerHTML = '<span class="vr-icon">🥽</span> ENTER VR';
        });
      } catch (err) {
        console.warn('VR session request fallback:', err);
      }
    } else {
      const session = this.renderer.xr.getSession();
      if (session) session.end();
    }
  }

  initControllers() {
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      controller.addEventListener('selectstart', (e) => this.onSelectStart(e));
      controller.addEventListener('selectend', (e) => this.onSelectEnd(e));
      controller.addEventListener('squeezestart', (e) => this.onSqueezeStart(e));
      controller.addEventListener('squeezeend', (e) => this.onSqueezeEnd(e));
      this.dolly.add(controller);
      this.controllers.push(controller);

      // Laser Ray Visual
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -5)
      ]);
      const rayMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.75
      });
      const laser = new THREE.Line(rayGeo, rayMat);
      laser.name = 'VR_Laser_Ray';
      controller.add(laser);

      // Grip Model / Controller visual
      const grip = this.renderer.xr.getControllerGrip(i);
      this.dolly.add(grip);
      this.controllerGrips.push(grip);
    }
  }

  // --- PC Remote Control Integration in WebXR ---

  applyRemoteDrag(dx, dy) {
    // Mouse drag on PC rotates VR Dolly
    this.remoteRotVelocity.y -= dx * 0.0028;
    this.remoteRotVelocity.x -= dy * 0.0028;
  }

  applyRemoteZoom(deltaY) {
    // Scroll wheel moves dolly forward/backward along VR view
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const direction = -Math.sign(deltaY);
    const step = Math.min(Math.abs(deltaY) * 0.15, 30.0);
    this.dolly.position.addScaledVector(forward, direction * step);
  }

  setRemoteKey(code, pressed) {
    switch (code) {
      case 'KeyW': case 'ArrowUp': this.remoteKeys.forward = pressed; break;
      case 'KeyS': case 'ArrowDown': this.remoteKeys.backward = pressed; break;
      case 'KeyA': this.remoteKeys.left = pressed; break;
      case 'KeyD': this.remoteKeys.right = pressed; break;
      case 'ArrowLeft': this.remoteKeys.lookLeft = pressed; break;
      case 'ArrowRight': this.remoteKeys.lookRight = pressed; break;
      case 'Space': this.remoteKeys.up = pressed; break;
      case 'ShiftLeft': case 'ShiftRight': this.remoteKeys.down = pressed; break;
    }
  }

  flyToPlanet(body) {
    if (!body) return;
    const targetPos = new THREE.Vector3();
    body.getWorldPosition(targetPos);
    const dist = Math.max(body.radius * 3.5, 18);
    this.dolly.position.set(
      targetPos.x + dist * 0.7,
      targetPos.y + dist * 0.3,
      targetPos.z + dist
    );
  }

  resetView() {
    this.dolly.position.set(0, 40, 220);
    this.dolly.rotation.set(0, 0, 0);
    this.isFlyingForward = false;
    this.isFlyingBackward = false;
    this.remoteVelocity.set(0, 0, 0);
    this.remoteRotVelocity = { x: 0, y: 0 };
  }

  onSelectStart(event) {
    const controller = event.target;
    this.tempMatrix.identity().extractRotation(controller.matrixWorld);
    this.activeRaycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.activeRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);

    // 1. Raycast against 3D Gizmo
    if (this.gizmo && this.gizmo.handlePointerDown(this.activeRaycaster)) {
      this.vrDraggingGizmo = true;
      this.draggingController = controller;
      return;
    }

    // 2. Raycast against Solar System Bodies
    const intersectables = [];
    this.solarSystem.bodies.forEach((body) => {
      if (body.mesh) intersectables.push(body.mesh);
    });

    const hits = this.activeRaycaster.intersectObjects(intersectables, false);
    if (hits.length > 0) {
      let obj = hits[0].object;
      while (obj && !obj.userData?.celestialBody) {
        obj = obj.parent;
      }
      if (obj && obj.userData?.celestialBody) {
        const body = obj.userData.celestialBody;
        this.selectionManager.selectBody(body);
        this.flyToPlanet(body);
        return;
      }
    }

    // 3. Click in empty space toggles forward thrusters
    this.isFlyingForward = !this.isFlyingForward;
    this.isFlyingBackward = false;
  }

  onSelectEnd(event) {
    if (this.vrDraggingGizmo && event.target === this.draggingController) {
      this.vrDraggingGizmo = false;
      this.gizmo.onPointerUp();
      this.draggingController = null;
    }
  }

  onSqueezeStart(event) {
    if (this.selectionManager.selectedBody) {
      this.flyToPlanet(this.selectionManager.selectedBody);
    }
  }

  onSqueezeEnd(event) {}

  update(deltaTime) {
    const isPresenting = this.renderer.xr.isPresenting || this.isInVR;
    if (!isPresenting) return;

    // 1. Handle VR Gizmo Dragging per frame
    if (this.vrDraggingGizmo && this.draggingController) {
      this.tempMatrix.identity().extractRotation(this.draggingController.matrixWorld);
      this.activeRaycaster.ray.origin.setFromMatrixPosition(this.draggingController.matrixWorld);
      this.activeRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
      this.gizmo.onDrag(this.activeRaycaster);
    }

    // 2. Camera direction vectors
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0);

    // 3. Apply PC Remote Mouse Drag Rotation to Dolly
    if (Math.abs(this.remoteRotVelocity.y) > 0.0001) {
      this.dolly.rotation.y += this.remoteRotVelocity.y;
      this.remoteRotVelocity.y *= 0.88;
    }
    if (Math.abs(this.remoteRotVelocity.x) > 0.0001) {
      this.dolly.rotation.x += this.remoteRotVelocity.x;
      this.remoteRotVelocity.x *= 0.88;
    }

    // 4. Handle VR Gamepad Thumbstick Locomotion
    const session = this.renderer.xr.getSession();
    if (session && session.inputSources) {
      for (const source of session.inputSources) {
        if (source.gamepad && source.gamepad.axes) {
          const axes = source.gamepad.axes;
          if (axes.length >= 2) {
            const stickX = axes[2] !== undefined ? axes[2] : axes[0];
            const stickY = axes[3] !== undefined ? axes[3] : axes[1];

            if (Math.abs(stickX) > 0.1 || Math.abs(stickY) > 0.1) {
              const moveSpeed = this.flightSpeed * deltaTime;
              this.dolly.position.addScaledVector(forward, -stickY * moveSpeed);
              this.dolly.position.addScaledVector(right, stickX * moveSpeed);
            }
          }
        }
      }
    }

    // 5. Handle PC Remote Keyboard Locomotion
    if (this.remoteKeys.lookLeft) this.dolly.rotation.y += 1.4 * deltaTime;
    if (this.remoteKeys.lookRight) this.dolly.rotation.y -= 1.4 * deltaTime;

    const moveVector = new THREE.Vector3();
    if (this.remoteKeys.forward || this.isFlyingForward) moveVector.add(forward);
    if (this.remoteKeys.backward || this.isFlyingBackward) moveVector.sub(forward);
    if (this.remoteKeys.right || this.isStrafingRight) moveVector.add(right);
    if (this.remoteKeys.left || this.isStrafingLeft) moveVector.sub(right);
    if (this.remoteKeys.up) moveVector.add(up);
    if (this.remoteKeys.down) moveVector.sub(up);

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      this.dolly.position.addScaledVector(moveVector, this.flightSpeed * deltaTime);
    }
  }
}
