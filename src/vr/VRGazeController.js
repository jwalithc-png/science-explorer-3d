import * as THREE from 'three';

/**
 * Ultra-Lightweight, High-Performance VR Gaze Locomotion & Head Controller
 * 
 * 100% GPU Native - Zero dynamic canvas texture uploads (Eliminates mobile GPU stalls/freezing)
 */
export class VRGazeController {
  constructor({ scene, sceneManager, solarSystem, selectionManager, cinematicIntro, onToast }) {
    this.scene = scene;
    this.sceneManager = sceneManager;
    this.solarSystem = solarSystem;
    this.selectionManager = selectionManager;
    this.cinematicIntro = cinematicIntro;
    this.onToast = onToast;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 8000;

    // Movement & Thrusters State
    this.flightSpeed = 140.0;
    this.isFlyingForward = false;
    this.isFlyingBackward = false;
    this.isStrafingLeft = false;
    this.isStrafingRight = false;

    // Gaze Dwell State
    this.hoverTarget = null;
    this.dwellTime = 0;
    this.requiredDwell = 1.2; // 1.2s dwell
    this.isTriggered = false;
    this.frameIndex = 0;

    // Build 100% Native Vector Reticle (Zero Canvas overhead)
    this.createGazeReticle();

    // Bind physical inputs
    this.bindInputs();
  }

  createGazeReticle() {
    this.reticleGroup = new THREE.Group();
    this.reticleGroup.name = 'VR_Gaze_Reticle_Group';
    this.reticleGroup.position.set(0, 0, -2.5); // 2.5m in front of head

    // 1. Center dot
    const dotGeo = new THREE.RingGeometry(0, 0.012, 16);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
      opacity: 0.95
    });
    this.centerDot = new THREE.Mesh(dotGeo, dotMat);
    this.centerDot.renderOrder = 999;
    this.reticleGroup.add(this.centerDot);

    // 2. Outer target ring
    const ringGeo = new THREE.RingGeometry(0.026, 0.034, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
      opacity: 0.75
    });
    this.targetRing = new THREE.Mesh(ringGeo, ringMat);
    this.targetRing.renderOrder = 999;
    this.reticleGroup.add(this.targetRing);

    // 3. Dynamic Progress Dwell Ring (Native Geometry, Zero texture memory)
    this.dwellGeo = new THREE.RingGeometry(0.038, 0.048, 32, 1, 0, 0.001);
    this.dwellMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      side: THREE.DoubleSide,
      depthTest: false,
      transparent: true,
      opacity: 0.9
    });
    this.dwellMesh = new THREE.Mesh(this.dwellGeo, this.dwellMat);
    this.dwellMesh.renderOrder = 1000;
    this.dwellMesh.rotation.z = Math.PI * 0.5;
    this.reticleGroup.add(this.dwellMesh);

    if (this.sceneManager && this.sceneManager.headCamera) {
      this.sceneManager.headCamera.add(this.reticleGroup);
    }
  }

  updateDwellProgress(progress) {
    if (this.dwellMesh) {
      const arc = Math.max(0.001, Math.min(progress * Math.PI * 2, Math.PI * 2));
      this.dwellMesh.geometry.dispose();
      this.dwellMesh.geometry = new THREE.RingGeometry(0.038, 0.048, 32, 1, 0, arc);
      this.dwellMesh.visible = progress > 0.01;
    }
  }

  toggleFlight() {
    this.isFlyingForward = !this.isFlyingForward;
    this.isFlyingBackward = false;
    if (this.onToast) {
      this.onToast(this.isFlyingForward ? '🚀 FORWARD THRUSTERS ACTIVE' : '⏹ THRUSTERS STOPPED');
    }
  }

  stopAllFlight() {
    this.isFlyingForward = false;
    this.isFlyingBackward = false;
    this.isStrafingLeft = false;
    this.isStrafingRight = false;
    if (this.onToast) this.onToast('⏹ ALL THRUSTERS STOPPED');
  }

  resetView() {
    this.stopAllFlight();
    this.selectionManager.clearSelection();
    this.sceneManager.camera.position.set(0, 140, 320);
    this.sceneManager.camera.lookAt(0, 0, 0);
    if (this.onToast) this.onToast('🔍 VIEW RESET TO OVERVIEW');
  }

  bindInputs() {
    // 1. Single tap / VR Box top button toggles flight or triggers hovered item
    window.addEventListener('pointerdown', () => this.handleTriggerPress());
    window.addEventListener('touchstart', () => this.handleTriggerPress(), { passive: true });

    // 2. Keyboard & Bluetooth Remote buttons
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.isFlyingForward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.isFlyingBackward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.isStrafingLeft = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.isStrafingRight = true;
      if (e.code === 'Space' || e.code === 'Enter') this.handleTriggerPress();
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.isFlyingForward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.isFlyingBackward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.isStrafingLeft = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.isStrafingRight = false;
    });
  }

  handleTriggerPress() {
    if (this.hoverTarget) {
      this.executeTargetAction(this.hoverTarget);
    } else {
      this.toggleFlight();
    }
  }

  executeTargetAction(target) {
    this.selectionManager.selectBody(target);
    this.selectionManager.flyToBody(target);
    if (navigator.vibrate) navigator.vibrate([35]);
    if (this.onToast) this.onToast(`FLYING TO ${target.name.toUpperCase()}`);

    this.dwellTime = 0;
    this.isTriggered = true;
    this.updateDwellProgress(0);
  }

  update(deltaTime) {
    if (!this.sceneManager || !this.sceneManager.isSplitScreenVR) {
      this.reticleGroup.visible = false;
      return;
    }

    this.reticleGroup.visible = true;
    this.frameIndex++;

    const headCam = this.sceneManager.headCamera;
    const origin = new THREE.Vector3();
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);

    headCam.getWorldPosition(origin);
    forward.applyQuaternion(headCam.getWorldQuaternion(new THREE.Quaternion()));
    right.applyQuaternion(headCam.getWorldQuaternion(new THREE.Quaternion()));

    // 1. Throttled Raycasting (runs every 3rd frame to conserve 100% GPU/CPU power)
    if (this.frameIndex % 3 === 0) {
      this.raycaster.set(origin, forward);

      const intersectables = [];
      for (const body of this.solarSystem.bodies.values()) {
        if (body.bodyMesh) intersectables.push(body.bodyMesh);
      }

      const intersects = this.raycaster.intersectObjects(intersectables, false);

      let currentTarget = null;
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData?.celestialBody) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.celestialBody) {
          currentTarget = obj.userData.celestialBody;
        }
      }

      if (currentTarget !== this.hoverTarget) {
        this.hoverTarget = currentTarget;
        this.dwellTime = 0;
        this.isTriggered = false;
        this.updateDwellProgress(0);
      }
    }

    // 2. Dwell Timer Progress
    if (this.hoverTarget) {
      if (!this.isTriggered) {
        this.dwellTime += deltaTime;
        const progress = Math.min(this.dwellTime / this.requiredDwell, 1.0);
        this.updateDwellProgress(progress);
        this.targetRing.scale.setScalar(1.0 + progress * 0.3);

        if (progress >= 1.0) {
          this.executeTargetAction(this.hoverTarget);
        }
      }
    } else {
      this.targetRing.scale.setScalar(1.0);
    }

    // 3. Apply Spatial Translation to Scene Camera
    const move = new THREE.Vector3();
    if (this.isFlyingForward) move.add(forward);
    if (this.isFlyingBackward) move.sub(forward);
    if (this.isStrafingRight) move.add(right);
    if (this.isStrafingLeft) move.sub(right);

    if (move.lengthSq() > 0) {
      move.normalize();
      this.sceneManager.camera.position.addScaledVector(move, this.flightSpeed * deltaTime);
    }
  }
}
