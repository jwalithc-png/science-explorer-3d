import * as THREE from 'three';

/**
 * Lighting Rig for Multi-Module Scientific Simulation
 * Supports per-module lighting presets:
 * - Solar: Deep space directional sunlight
 * - Photosynthesis: Warm golden sunlight & green ambient
 * - Reproduction: Warm biological bioluminescent glow
 */
export class Lighting {
  constructor(scene) {
    this.scene = scene;

    this.mainLight = null;
    this.ambientLight = null;
    this.stageLights = [];

    this.init();
  }

  init() {
    // 1. Key Directional Light
    this.mainLight = new THREE.DirectionalLight(0xfff1f2, 1.9);
    this.mainLight.position.set(40, 60, 50);
    this.scene.add(this.mainLight);

    // 2. Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xffe4e6, 0.75);
    this.scene.add(this.ambientLight);
  }

  /**
   * Switch lighting preset based on active module
   */
  setModule(moduleId, stagePositions) {
    // Remove old stage lights
    this.stageLights.forEach(light => this.scene.remove(light));
    this.stageLights = [];

    if (moduleId === 'solar') {
      this.mainLight.color.set(0xffffff);
      this.mainLight.intensity = 2.0;
      this.mainLight.position.set(0, 100, 50);
      this.ambientLight.color.set(0xd1d5db);
      this.ambientLight.intensity = 0.35;

      // Sunlight point at each planet position
      if (stagePositions) {
        stagePositions.forEach((pos) => {
          const pLight = new THREE.PointLight(0xfacc15, 1.8, 60, 1.2);
          pLight.position.set(pos.x, pos.y + 5, pos.z + 2);
          this.scene.add(pLight);
          this.stageLights.push(pLight);
        });
      }
    } else if (moduleId === 'photosynthesis') {
      this.mainLight.color.set(0xfff7ed);
      this.mainLight.intensity = 2.2;
      this.mainLight.position.set(40, 60, 50);
      this.ambientLight.color.set(0xd9f99d);
      this.ambientLight.intensity = 0.5;

      const stageColors = [0xfacc15, 0x38bdf8, 0x22c55e, 0x4ade80, 0x15803d, 0xeab308, 0x06b6d4, 0xf97316, 0xa855f7];
      if (stagePositions) {
        stagePositions.forEach((pos, idx) => {
          const color = stageColors[idx] || 0x22c55e;
          const pLight = new THREE.PointLight(color, 2.2, 35, 1.4);
          pLight.position.set(pos.x, pos.y + 4, pos.z + 2);
          this.scene.add(pLight);
          this.stageLights.push(pLight);
        });
      }
    } else if (moduleId === 'reproduction') {
      this.mainLight.color.set(0xfff1f2);
      this.mainLight.intensity = 1.9;
      this.mainLight.position.set(40, 60, 50);
      this.ambientLight.color.set(0xffe4e6);
      this.ambientLight.intensity = 0.75;

      const stageColors = [0x38bdf8, 0xfb7185, 0xfacc15, 0xa855f7, 0x22c55e, 0xf97316, 0xef4444, 0x38bdf8, 0xec4899];
      if (stagePositions) {
        stagePositions.forEach((pos, idx) => {
          const color = stageColors[idx] || 0xfb7185;
          const pLight = new THREE.PointLight(color, 2.5, 35, 1.4);
          pLight.position.set(pos.x, pos.y + 4, pos.z + 2);
          this.scene.add(pLight);
          this.stageLights.push(pLight);
        });
      }
    }
  }

  update(delta, simParams = {}) {
    // Dynamic light pulsation (works across all modules)
    const time = performance.now() * 0.001;

    // Gentle pulsation on lights
    this.stageLights.forEach((light, idx) => {
      const baseIntensity = light.intensity;
      light.intensity = baseIntensity + Math.sin(time * 2.0 + idx * 0.7) * 0.2;
    });
  }
}
