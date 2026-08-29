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
    this.headingOffset = 0; // World heading alignment offset so VR always faces directly at target

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

  getDeviceYaw() {
    if (!this.hasOrientation) return 0;
    const alphaRad = THREE.MathUtils.degToRad(this.deviceOrientation.alpha || 0);
    const betaRad = THREE.MathUtils.degToRad(this.deviceOrientation.beta || 0);
    const gammaRad = THREE.MathUtils.degToRad(this.deviceOrientation.gamma || 0);
    const screenOrient = (window.screen && window.screen.orientation) ? (window.screen.orientation.angle || 0) : (window.orientation || 0);
    const screenOrientRad = THREE.MathUtils.degToRad(screenOrient);

    const q = new THREE.Quaternion();
    const zee = new THREE.Vector3(0, 0, 1);
    const euler = new THREE.Euler();
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

    euler.set(betaRad, alphaRad, -gammaRad, 'YXZ');
    q.setFromEuler(euler);
    q.multiply(q1);
    q.multiply(q0.setFromAxisAngle(zee, -screenOrientRad));

    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
    return Math.atan2(-fwd.x, -fwd.z);
  }

  recenterVR(targetLookAt) {
    if (!targetLookAt) return;
    const dir = new THREE.Vector3().subVectors(targetLookAt, this.cameraRig.position);
    dir.y = 0;
    if (dir.lengthSq() > 0.001) {
      dir.normalize();
      const targetYaw = Math.atan2(-dir.x, -dir.z);
      const currentYaw = this.getDeviceYaw();
      this.headingOffset = targetYaw - currentYaw;
      console.log('🎯 VR Recentered towards target');
    }
  }

  flipVR180() {
    this.headingOffset = (this.headingOffset + Math.PI) % (Math.PI * 2);
    console.log('🔄 VR 180° Flipped');
  }

  toggleDualScreenVR(targetLookAt) {
    this.isDualScreenVR = !this.isDualScreenVR;
    if (this.isDualScreenVR) {
      this.requestOrientationPermission();
      setTimeout(() => {
        if (targetLookAt) this.recenterVR(targetLookAt);
      }, 150);
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

      // Keep camera rig pure translation so parent transform never inverts gyro head tracking
      this.cameraRig.quaternion.identity();

      // Apply standard W3C DeviceOrientation with Screen Orientation angle compensation & heading alignment
      if (this.hasOrientation) {
        const alphaRad = THREE.MathUtils.degToRad(this.deviceOrientation.alpha || 0);
        const betaRad = THREE.MathUtils.degToRad(this.deviceOrientation.beta || 0);
        const gammaRad = THREE.MathUtils.degToRad(this.deviceOrientation.gamma || 0);
        const screenOrient = (window.screen && window.screen.orientation) ? (window.screen.orientation.angle || 0) : (window.orientation || 0);
        const screenOrientRad = THREE.MathUtils.degToRad(screenOrient);

        this.setObjectQuaternion(this.camera.quaternion, alphaRad, betaRad, gammaRad, screenOrientRad);
      }

      // Update stereo eye positions & orientations relative to cameraRig
      const eyeOffset = this.ipd * 0.5;
      const leftVec = new THREE.Vector3(-eyeOffset, 0, 0).applyQuaternion(this.camera.quaternion);
      const rightVec = new THREE.Vector3(eyeOffset, 0, 0).applyQuaternion(this.camera.quaternion);

      this.cameraLeft.position.copy(leftVec);
      this.cameraLeft.quaternion.copy(this.camera.quaternion);

      this.cameraRight.position.copy(rightVec);
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

  setObjectQuaternion(quaternion, alpha, beta, gamma, orient) {
    const zee = new THREE.Vector3(0, 0, 1);
    const euler = new THREE.Euler();
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around x-axis

    euler.set(beta, alpha, -gamma, 'YXZ'); // Standard device coordinate frame
    quaternion.setFromEuler(euler);
    quaternion.multiply(q1); // Camera looks out back of device, not top
    quaternion.multiply(q0.setFromAxisAngle(zee, -orient)); // Adjust for device screen rotation (0, 90, 180, 270)

    // Apply calibrated heading offset so looking forward in real world always faces directly at the planet:
    if (this.headingOffset !== 0) {
      const qHeading = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.headingOffset);
      quaternion.premultiply(qHeading);
    }
  }
}
