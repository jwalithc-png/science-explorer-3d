import * as THREE from 'three';

/**
 * WebXR Session & VR Controller Manager
 * Handles immersive-vr lifecycle, stereoscopic hardware rendering,
 * controller rays, and session state changes.
 */
export class WebXRManager {
  constructor(renderer, scene, cameraRig, onSessionStateChange, onFallbackVR) {
    this.renderer = renderer;
    this.scene = scene;
    this.cameraRig = cameraRig;
    this.onSessionStateChange = onSessionStateChange;
    this.onFallbackVR = onFallbackVR;

    this.isVR = false;
    this.controllers = [];
    this.controllerGrips = [];

    this.initXR();
  }

  initXR() {
    if (this.renderer && this.renderer.xr) {
      this.renderer.xr.enabled = true;

      // Listen to session events
      this.renderer.xr.addEventListener('sessionstart', () => {
        this.isVR = true;
        if (this.onSessionStateChange) this.onSessionStateChange(true);
      });

      this.renderer.xr.addEventListener('sessionend', () => {
        this.isVR = false;
        if (this.onSessionStateChange) this.onSessionStateChange(false);
      });

      this.setupControllers();
    }
  }

  setupControllers() {
    if (!this.renderer || !this.renderer.xr) return;

    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      this.cameraRig.add(controller);
      this.controllers.push(controller);

      // Laser pointer ray geometry
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -4)
      ]);
      const rayMat = new THREE.LineBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.6
      });
      const line = new THREE.Line(rayGeo, rayMat);
      controller.add(line);

      // Controller grip mesh (hand tracker proxy)
      const grip = this.renderer.xr.getControllerGrip(i);
      const gripGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8);
      const gripMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const gripMesh = new THREE.Mesh(gripGeo, gripMat);
      gripMesh.rotation.x = Math.PI * 0.5;
      grip.add(gripMesh);
      this.cameraRig.add(grip);
      this.controllerGrips.push(grip);
    }
  }

  async enterVR() {
    if (!navigator.xr) {
      if (this.onFallbackVR) {
        this.onFallbackVR();
      }
      return;
    }

    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr');
      if (!supported) {
        if (this.onFallbackVR) {
          this.onFallbackVR();
        }
        return;
      }

      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
      });

      await this.renderer.xr.setSession(session);
    } catch (err) {
      console.warn('Could not start native WebXR session, falling back to Dual-Screen VR:', err);
      if (this.onFallbackVR) {
        this.onFallbackVR();
      }
    }
  }

  getIsVR() {
    return this.isVR;
  }
}
