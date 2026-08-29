import * as THREE from 'three';
import { globalLensManager } from './lensConfig.js';

/**
 * GLSL Optical Lens Distortion & Chromatic Aberration Post-Processing Pass
 * 
 * Engineered with 4x Hardware MSAA Anti-Aliasing and 1.4x Super-Sampled Render Targets
 * for ultra-high-definition, crystal-clear VR Box rendering with zero blocky pixel blur.
 */
export class VRLensPostProcess {
  constructor(renderer, width, height) {
    this.renderer = renderer;
    this.width = width;
    this.height = height;

    this.lensManager = globalLensManager;

    // Create High-Resolution Super-Sampled Render Targets for Left & Right Eye
    this.createRenderTargets();

    // Create Fullscreen Quad Post-Process Scene
    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.initShaderMaterial();

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    this.quadMesh = new THREE.Mesh(quadGeo, this.material);
    this.postScene.add(this.quadMesh);

    // Wire lens config updates into shader uniforms
    this.lensManager.onChange((config) => this.updateUniforms(config));
  }

  createRenderTargets() {
    const halfWidth = Math.max(1, Math.floor(this.width / 2));
    const eyeHeight = Math.max(1, this.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 3.0);

    // VR Eye Super-Sampling Scale (1.4x) for crystal-clear retina definition under lens magnification
    const renderScale = 1.4;
    const targetWidth = Math.floor(halfWidth * dpr * renderScale);
    const targetHeight = Math.floor(eyeHeight * dpr * renderScale);

    const targetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      colorSpace: THREE.SRGBColorSpace,
      depthBuffer: true,
      stencilBuffer: false,
      samples: 4 // Hardware 4x Multi-Sample Anti-Aliasing (MSAA) in WebGL2!
    };

    if (this.leftTarget) this.leftTarget.dispose();
    if (this.rightTarget) this.rightTarget.dispose();

    this.leftTarget = new THREE.WebGLRenderTarget(targetWidth, targetHeight, targetOptions);
    this.leftTarget.texture.name = 'VR_Left_Eye_Target';
    this.leftTarget.texture.generateMipmaps = false;

    this.rightTarget = new THREE.WebGLRenderTarget(targetWidth, targetHeight, targetOptions);
    this.rightTarget.texture.name = 'VR_Right_Eye_Target';
    this.rightTarget.texture.generateMipmaps = false;

    if (this.material) {
      this.material.uniforms.uLeftTexture.value = this.leftTarget.texture;
      this.material.uniforms.uRightTexture.value = this.rightTarget.texture;
      this.material.uniforms.uResolution.value.set(this.width, this.height);
    }
  }

  initShaderMaterial() {
    const cfg = this.lensManager.config;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uLeftTexture: { value: this.leftTarget.texture },
        uRightTexture: { value: this.rightTarget.texture },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uLensCenterL: { value: new THREE.Vector2(cfg.lensCenterLX, cfg.lensCenterLY) },
        uLensCenterR: { value: new THREE.Vector2(cfg.lensCenterRX, cfg.lensCenterRY) },
        uLensRadius: { value: new THREE.Vector2(cfg.lensRadiusX, cfg.lensRadiusY) },
        uK1: { value: cfg.distortionK1 },
        uK2: { value: cfg.distortionK2 },
        uChroma: { value: cfg.chromaticAberration },
        uShowGrid: { value: this.lensManager.showCalibrationGrid ? 1.0 : 0.0 },
        uShowMask: { value: this.lensManager.showLensMask ? 1.0 : 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform sampler2D uLeftTexture;
        uniform sampler2D uRightTexture;
        uniform vec2 uResolution;
        uniform vec2 uLensCenterL;
        uniform vec2 uLensCenterR;
        uniform vec2 uLensRadius;
        uniform float uK1;
        uniform float uK2;
        uniform float uChroma;
        uniform float uShowGrid;
        uniform float uShowMask;

        varying vec2 vUv;

        // Apply radial polynomial barrel distortion
        vec2 computeDistortedUV(vec2 localUV, vec2 lensCenter, float chromaOffset) {
          vec2 d = (localUV - lensCenter) / uLensRadius;
          float r2 = dot(d, d);
          float factor = 1.0 + (uK1 + chromaOffset) * r2 + (uK2 + chromaOffset * 0.5) * r2 * r2;
          return lensCenter + d * uLensRadius * factor;
        }

        // Calibration Test Grid overlay for physical optical alignment
        vec4 computeCalibrationGrid(vec2 localUV, vec2 lensCenter) {
          vec2 d = (localUV - lensCenter) / uLensRadius;
          float r = length(d);

          vec4 gridCol = vec4(0.0);

          // 1. Concentric calibration circles
          float ring1 = abs(r - 0.25);
          float ring2 = abs(r - 0.50);
          float ring3 = abs(r - 0.75);
          float ring4 = abs(r - 1.00);
          float minRing = min(min(ring1, ring2), min(ring3, ring4));
          if (minRing < 0.006) {
            gridCol = vec4(0.22, 0.74, 0.97, 0.75); // Cyan rings
          }

          // 2. Optical Center Crosshairs
          vec2 centerDist = abs(localUV - lensCenter);
          if ((centerDist.x < 0.003 && centerDist.y < 0.4) || (centerDist.y < 0.003 && centerDist.x < 0.4)) {
            gridCol = vec4(0.96, 0.62, 0.07, 0.85); // Amber crosshair
          }

          // 3. Grid check lines
          vec2 gridLines = abs(fract(localUV * 10.0 - 0.5) - 0.5) / 10.0;
          if (gridLines.x < 0.0015 || gridLines.y < 0.0015) {
            gridCol = mix(gridCol, vec4(0.58, 0.64, 0.72, 0.35), 0.5);
          }

          // Center target dot
          if (length(localUV - lensCenter) < 0.012) {
            gridCol = vec4(1.0, 1.0, 1.0, 1.0);
          }

          return gridCol;
        }

        void main() {
          // Identify left eye (0.0 to 0.5) vs right eye (0.5 to 1.0)
          bool isLeft = vUv.x < 0.5;
          vec2 localUV = isLeft ? vec2(vUv.x * 2.0, vUv.y) : vec2((vUv.x - 0.5) * 2.0, vUv.y);
          vec2 lensCenter = isLeft ? uLensCenterL : uLensCenterR;

          // Compute UV coordinates (with or without chromatic offset)
          vec2 uvG = computeDistortedUV(localUV, lensCenter, 0.0);

          vec3 finalColor = vec3(0.0);

          if (isLeft) {
            if (uvG.x >= 0.0 && uvG.x <= 1.0 && uvG.y >= 0.0 && uvG.y <= 1.0) {
              if (abs(uChroma) > 0.0001) {
                vec2 uvR = computeDistortedUV(localUV, lensCenter, uChroma);
                vec2 uvB = computeDistortedUV(localUV, lensCenter, -uChroma);
                float r = texture2D(uLeftTexture, clamp(uvR, 0.0, 1.0)).r;
                float g = texture2D(uLeftTexture, clamp(uvG, 0.0, 1.0)).g;
                float b = texture2D(uLeftTexture, clamp(uvB, 0.0, 1.0)).b;
                finalColor = vec3(r, g, b);
              } else {
                finalColor = texture2D(uLeftTexture, uvG).rgb;
              }
            }
          } else {
            if (uvG.x >= 0.0 && uvG.x <= 1.0 && uvG.y >= 0.0 && uvG.y <= 1.0) {
              if (abs(uChroma) > 0.0001) {
                vec2 uvR = computeDistortedUV(localUV, lensCenter, uChroma);
                vec2 uvB = computeDistortedUV(localUV, lensCenter, -uChroma);
                float r = texture2D(uRightTexture, clamp(uvR, 0.0, 1.0)).r;
                float g = texture2D(uRightTexture, clamp(uvG, 0.0, 1.0)).g;
                float b = texture2D(uRightTexture, clamp(uvB, 0.0, 1.0)).b;
                finalColor = vec3(r, g, b);
              } else {
                finalColor = texture2D(uRightTexture, uvG).rgb;
              }
            }
          }

          // Optional Lens Vignette Mask
          if (uShowMask > 0.5) {
            vec2 dMask = (localUV - lensCenter) / uLensRadius;
            float rMask = length(dMask);
            float vignette = smoothstep(1.0, 0.88, rMask);
            finalColor *= vignette;
          }

          // Calibration Test Grid Overlay
          if (uShowGrid > 0.5) {
            vec4 grid = computeCalibrationGrid(localUV, lensCenter);
            finalColor = mix(finalColor, grid.rgb, grid.a);
          }

          // Center Divider Line
          float distToCenter = abs(vUv.x - 0.5);
          if (distToCenter < (1.5 / uResolution.x)) {
            finalColor = vec3(0.22, 0.74, 0.97); // Cyan center divider
          }

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      depthTest: false,
      depthWrite: false
    });
  }

  updateUniforms(cfg) {
    if (!this.material) return;
    this.material.uniforms.uLensCenterL.value.set(cfg.lensCenterLX, cfg.lensCenterLY);
    this.material.uniforms.uLensCenterR.value.set(cfg.lensCenterRX, cfg.lensCenterRY);
    this.material.uniforms.uLensRadius.value.set(cfg.lensRadiusX, cfg.lensRadiusY);
    this.material.uniforms.uK1.value = cfg.distortionK1;
    this.material.uniforms.uK2.value = cfg.distortionK2;
    this.material.uniforms.uChroma.value = cfg.chromaticAberration;
    this.material.uniforms.uShowGrid.value = this.lensManager.showCalibrationGrid ? 1.0 : 0.0;
    this.material.uniforms.uShowMask.value = this.lensManager.showLensMask ? 1.0 : 0.0;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.createRenderTargets();
  }

  render(scene, leftEyeCamera, rightEyeCamera) {
    // 1. Render COMPLETE Solar System to Left Eye Offscreen Target with 4x MSAA Anti-Aliasing
    this.renderer.setRenderTarget(this.leftTarget);
    this.renderer.clear();
    this.renderer.render(scene, leftEyeCamera);

    // 2. Render COMPLETE Solar System to Right Eye Offscreen Target with 4x MSAA Anti-Aliasing
    this.renderer.setRenderTarget(this.rightTarget);
    this.renderer.clear();
    this.renderer.render(scene, rightEyeCamera);

    // 3. Render GPU Optical Lens Warp Post-Process Pass to Screen
    this.renderer.setRenderTarget(null);
    this.renderer.setViewport(0, 0, this.width, this.height);
    this.renderer.render(this.postScene, this.postCamera);
  }

  dispose() {
    if (this.leftTarget) this.leftTarget.dispose();
    if (this.rightTarget) this.rightTarget.dispose();
    if (this.material) this.material.dispose();
    if (this.quadMesh && this.quadMesh.geometry) this.quadMesh.geometry.dispose();
  }
}
