import * as THREE from 'three';

/**
 * Three.js Scene, Camera, WebGLRenderer & Render Loop Manager
 * Supports:
 * 1. Standard Mono Desktop Rendering
 * 2. Native WebXR Hardware Immersive-VR
 * 3. Mobile Cardboard / VR Box Dual-Screen Stereoscopic Split-Screen (SBS) with Gyro Head-Tracking
 */
export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;

    // 1. Scene - Living Human Body Interior Atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x160309); // Deep warm biological crimson
    this.scene.fog = new THREE.FogExp2(0x160309, 0.007);

    // 2. Main Camera & Stereo Cameras
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );
    this.camera.position.set(-120, 8, 24);

    this.cameraRig = new THREE.Group();
    this.cameraRig.add(this.camera);
    this.scene.add(this.cameraRig);

    // Stereo SBS cameras for Cardboard / VR Box
    this.cameraLeft = new THREE.PerspectiveCamera(60, (window.innerWidth * 0.5) / window.innerHeight, 0.1, 600);
    this.cameraRight = new THREE.PerspectiveCamera(60, (window.innerWidth * 0.5) / window.innerHeight, 0.1, 600);
    this.cameraRig.add(this.cameraLeft);
    this.cameraRig.add(this.cameraRight);

    this.isDualScreenVR = false;
    this.ipd = 0.064; // 64mm interpupillary distance

    // 3. WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setPixelRatio(1.0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 4. Device Orientation Gyro Sensor for Cardboard VR
    this.deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
    this.hasOrientation = false;
    this.initOrientationSensor();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Switch scene background & fog for module switching
   */
  setEnvironment(config) {
    if (config.sceneBackground !== undefined) {
      this.scene.background = new THREE.Color(config.sceneBackground);
    }
    if (config.sceneFogColor !== undefined) {
      this.scene.fog = new THREE.FogExp2(config.sceneFogColor, config.sceneFogDensity || 0.007);
    }
  }

  initOrientationSensor() {
    window.addEventListener('deviceorientation', (e) => {
      if (e.alpha !== null && e.beta !== null) {
        this.deviceOrientation.alpha = e.alpha;
        this.deviceOrientation.beta = e.beta;
        this.deviceOrientation.gamma = e.gamma;
        this.hasOrientation = true;
      }
    });
  }

  requestOrientationPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(resp => {
        if (resp === 'granted') {
          console.log('[VR] Device orientation access granted');
        }
      }).catch(console.warn);
    }
  }

  toggleDualScreenVR() {
    this.isDualScreenVR = !this.isDualScreenVR;
    if (this.isDualScreenVR) {
      this.requestOrientationPermission();
      // Try fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
    this.onWindowResize();
    return this.isDualScreenVR;
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.cameraLeft.aspect = (width * 0.5) / height;
    this.cameraLeft.updateProjectionMatrix();

    this.cameraRight.aspect = (width * 0.5) / height;
    this.cameraRight.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  setAnimationLoop(callback) {
    this.renderer.setAnimationLoop(callback);
  }

  render() {
    if (this.renderer.xr.isPresenting) {
      // Native WebXR takes care of stereo rendering
      this.renderer.render(this.scene, this.camera);
      return;
    }

    if (this.isDualScreenVR) {
      // Cardboard Dual-Screen SBS stereoscopic render
      const width = window.innerWidth;
      const height = window.innerHeight;
      const halfWidth = Math.floor(width * 0.5);

      // Apply gyro orientation to camera rig in Cardboard mode
      if (this.hasOrientation) {
        const radBeta = THREE.MathUtils.degToRad(this.deviceOrientation.beta - 90);
        const radGamma = THREE.MathUtils.degToRad(-this.deviceOrientation.gamma);
        const radAlpha = THREE.MathUtils.degToRad(this.deviceOrientation.alpha);
        this.camera.quaternion.setFromEuler(new THREE.Euler(radBeta, radAlpha, radGamma, 'YXZ'));
      }

      // Update stereo eye positions based on IPD
      this.cameraLeft.position.copy(this.camera.position).add(new THREE.Vector3(-this.ipd * 0.5, 0, 0).applyQuaternion(this.camera.quaternion));
      this.cameraLeft.quaternion.copy(this.camera.quaternion);

      this.cameraRight.position.copy(this.camera.position).add(new THREE.Vector3(this.ipd * 0.5, 0, 0).applyQuaternion(this.camera.quaternion));
      this.cameraRight.quaternion.copy(this.camera.quaternion);

      this.renderer.setScissorTest(true);

      // Left Eye Viewport
      this.renderer.setScissor(0, 0, halfWidth, height);
      this.renderer.setViewport(0, 0, halfWidth, height);
      this.renderer.render(this.scene, this.cameraLeft);

      // Right Eye Viewport
      this.renderer.setScissor(halfWidth, 0, halfWidth, height);
      this.renderer.setViewport(halfWidth, 0, halfWidth, height);
      this.renderer.render(this.scene, this.cameraRight);

      this.renderer.setScissorTest(false);
    } else {
      // Standard Mono Screen Render
      this.renderer.render(this.scene, this.camera);
    }
  }
}
