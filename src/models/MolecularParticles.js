import * as THREE from 'three';

/**
 * High-Performance Instanced Molecular Particle System (10,000+ Count)
 * 
 * Supports all 9 connected biological stages:
 * 1. Cosmic Solar Photons (Sun ➔ Space ➔ Earth)
 * 2. Canopy Sunray showers & photon absorption
 * 3. Root Water & Glucose Vascular Transport in Growing Plant
 * 4. Stomatal Gas Exchange (CO2, H2O, O2)
 * 5. Molecular Thylakoid Reactions (PSII, ETC, Cyt b6f, PSI, ATP Synthase, Calvin Cycle)
 */
export class MolecularParticles {
  constructor(scene) {
    this.scene = scene;
    this.time = 0;

    // Scratch objects to avoid GC
    this.dummy = new THREE.Object3D();

    // Particle pools configuration
    this.config = {
      space_photons: { count: 1800, size: 0.18, color: 0xfef08a, emissive: 0xfacc15 },
      canopy_photons: { count: 1500, size: 0.15, color: 0xfacc15, emissive: 0xfde047 },
      growth_nutrients: { count: 1200, size: 0.14, color: 0x38bdf8, emissive: 0x0284c7 },
      h2o: { count: 1400, size: 0.18, color: 0x38bdf8, emissive: 0x0284c7 },
      co2: { count: 1200, size: 0.20, color: 0x94a3b8, emissive: 0x475569 },
      o2: { count: 1000, size: 0.20, color: 0xef4444, emissive: 0xf87171 },
      protons: { count: 1800, size: 0.12, color: 0x06b6d4, emissive: 0x67e8f9 },
      electrons: { count: 800, size: 0.10, color: 0xfbbf24, emissive: 0xfde047 },
      atp_nadph: { count: 800, size: 0.26, color: 0xf97316, emissive: 0x10b981 }
    };

    this.meshes = {};
    this.particleData = {};

    this.initPools();
  }

  initPools() {
    const sphereGeo = new THREE.SphereGeometry(1, 10, 10);

    for (const [key, cfg] of Object.entries(this.config)) {
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.emissive,
        emissiveIntensity: 0.85,
        roughness: 0.3,
        metalness: 0.1
      });

      const instancedMesh = new THREE.InstancedMesh(sphereGeo, mat, cfg.count);
      instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      this.scene.add(instancedMesh);
      this.meshes[key] = instancedMesh;

      this.particleData[key] = {
        positions: new Float32Array(cfg.count * 3),
        velocities: new Float32Array(cfg.count * 3),
        progress: new Float32Array(cfg.count),
        speed: new Float32Array(cfg.count),
        scale: cfg.size
      };

      this.seedParticles(key, cfg.count);
    }
  }

  seedParticles(key, count) {
    const data = this.particleData[key];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      data.progress[i] = Math.random();
      data.speed[i] = 0.4 + Math.random() * 0.8;

      if (key === 'space_photons') {
        // Traveling across interplanetary space from Sun (X=-120) to Earth (X=-60)
        data.positions[i3] = -120 + Math.random() * 60;
        data.positions[i3 + 1] = (Math.random() - 0.5) * 6;
        data.positions[i3 + 2] = (Math.random() - 0.5) * 6;
      } else if (key === 'canopy_photons') {
        // Showering down onto tree canopy (X=-25)
        data.positions[i3] = -25 + (Math.random() - 0.5) * 10;
        data.positions[i3 + 1] = 4 + Math.random() * 12;
        data.positions[i3 + 2] = (Math.random() - 0.5) * 10;
      } else if (key === 'growth_nutrients') {
        // Water & glucose traveling inside growing plant (X=10, Y=-2 to 6)
        data.positions[i3] = 10 + (Math.random() - 0.5) * 0.4;
        data.positions[i3 + 1] = -2 + Math.random() * 8;
        data.positions[i3 + 2] = (Math.random() - 0.5) * 0.4;
      } else if (key === 'h2o') {
        // Xylem veins in Leaf (X: 45) and PSII lumen (X: 130)
        data.positions[i3] = 45 + (Math.random() - 0.5) * 6;
        data.positions[i3 + 1] = -4 + Math.random() * 6;
        data.positions[i3 + 2] = (Math.random() - 0.5) * 12;
      } else if (key === 'co2') {
        // Inhaled through stomata (X: 45) and Calvin cycle (X: 250)
        data.positions[i3] = 45 + (Math.random() - 0.5) * 16;
        data.positions[i3 + 1] = -5 + Math.random() * 4;
        data.positions[i3 + 2] = (Math.random() - 0.5) * 12;
      } else if (key === 'o2') {
        data.positions[i3] = 130 + (Math.random() - 0.5) * 6;
        data.positions[i3 + 1] = -2 + Math.random() * 5;
        data.positions[i3 + 2] = (Math.random() - 0.5) * 6;
      } else if (key === 'protons') {
        // Lumen (X: 130 to 210)
        data.positions[i3] = 130 + Math.random() * 80;
        data.positions[i3 + 1] = -3.5 + Math.random() * 2.5;
        data.positions[i3 + 2] = (Math.random() - 0.5) * 8;
      } else if (key === 'electrons') {
        // ETC (X: 130 to 170)
        data.positions[i3] = 130 + Math.random() * 40;
        data.positions[i3 + 1] = 0 + (Math.random() - 0.5) * 1.0;
        data.positions[i3 + 2] = (Math.random() - 0.5) * 2.0;
      } else if (key === 'atp_nadph') {
        // ATP Synthase (210) to Calvin (250)
        data.positions[i3] = 210 + Math.random() * 40;
        data.positions[i3 + 1] = 2 + Math.random() * 6;
        data.positions[i3 + 2] = (Math.random() - 0.5) * 12;
      }
    }
  }

  update(delta, simParams = {}) {
    const speedMult = (simParams.simSpeed || 1.0);
    this.time += delta * speedMult;

    this.updateSpacePhotons(delta, speedMult, simParams);
    this.updateCanopyPhotons(delta, speedMult, simParams);
    this.updateGrowthNutrients(delta, speedMult, simParams);
    this.updateLeafMolecules(delta, speedMult, simParams);
    this.updateThylakoidParticles(delta, speedMult, simParams);
  }

  updateSpacePhotons(delta, speedMult, simParams) {
    const mesh = this.meshes.space_photons;
    const data = this.particleData.space_photons;
    const count = this.config.space_photons.count;
    const intensity = simParams.lightIntensity || 1.0;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      data.progress[i] += delta * data.speed[i] * 0.8 * speedMult * intensity;
      if (data.progress[i] > 1.0) data.progress[i] -= 1.0;

      const t = data.progress[i];
      // Travel from Sun (X=-120) to Earth (X=-60)
      data.positions[i3] = -120 + t * 60;
      data.positions[i3 + 1] = Math.sin(t * 12 + i) * (0.8 + t * 1.2);
      data.positions[i3 + 2] = Math.cos(t * 12 + i) * (0.8 + t * 1.2);

      this.dummy.position.set(data.positions[i3], data.positions[i3 + 1], data.positions[i3 + 2]);
      const s = data.scale * intensity;
      this.dummy.scale.set(s * 2.5, s, s); // Stretched along travel X
      this.dummy.updateMatrix();
      mesh.setMatrixAt(i, this.dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  updateCanopyPhotons(delta, speedMult, simParams) {
    const mesh = this.meshes.canopy_photons;
    const data = this.particleData.canopy_photons;
    const count = this.config.canopy_photons.count;
    const intensity = simParams.lightIntensity || 1.0;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      data.positions[i3 + 1] -= delta * (6 + data.speed[i] * 4) * speedMult * intensity;

      if (data.positions[i3 + 1] < 1.0) {
        data.positions[i3 + 1] = 16.0 + Math.random() * 4.0;
        data.positions[i3] = -25 + (Math.random() - 0.5) * 8.0;
        data.positions[i3 + 2] = (Math.random() - 0.5) * 8.0;
      }

      this.dummy.position.set(data.positions[i3], data.positions[i3 + 1], data.positions[i3 + 2]);
      const s = data.scale * intensity;
      this.dummy.scale.set(s, s * 2.0, s);
      this.dummy.updateMatrix();
      mesh.setMatrixAt(i, this.dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  updateGrowthNutrients(delta, speedMult, simParams) {
    const mesh = this.meshes.growth_nutrients;
    const data = this.particleData.growth_nutrients;
    const count = this.config.growth_nutrients.count;
    const growth = simParams.plantGrowth !== undefined ? simParams.plantGrowth : 1.0;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      data.progress[i] += delta * data.speed[i] * 0.5 * speedMult;
      if (data.progress[i] > 1.0) data.progress[i] -= 1.0;

      const t = data.progress[i];
      const maxH = -1.5 + growth * 7.5;
      data.positions[i3] = 10 + Math.sin(t * 8 + i) * 0.15;
      data.positions[i3 + 1] = -1.8 + t * (maxH + 1.8);
      data.positions[i3 + 2] = Math.cos(t * 8 + i) * 0.15;

      this.dummy.position.set(data.positions[i3], data.positions[i3 + 1], data.positions[i3 + 2]);
      this.dummy.scale.setScalar(data.scale);
      this.dummy.updateMatrix();
      mesh.setMatrixAt(i, this.dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  updateLeafMolecules(delta, speedMult, simParams) {
    // H2O
    const hMesh = this.meshes.h2o;
    const hData = this.particleData.h2o;
    for (let i = 0; i < this.config.h2o.count; i++) {
      const i3 = i * 3;
      hData.progress[i] += delta * hData.speed[i] * 0.4 * speedMult;
      if (hData.progress[i] > 1.0) hData.progress[i] -= 1.0;
      const t = hData.progress[i];
      hData.positions[i3 + 1] = -4 + t * 8;
      this.dummy.position.set(45 + (Math.sin(t * 6 + i) * 1.5), hData.positions[i3 + 1], (Math.cos(t * 6 + i) * 1.5));
      this.dummy.scale.setScalar(hData.scale);
      this.dummy.updateMatrix();
      hMesh.setMatrixAt(i, this.dummy.matrix);
    }
    hMesh.instanceMatrix.needsUpdate = true;

    // CO2
    const cMesh = this.meshes.co2;
    const cData = this.particleData.co2;
    for (let i = 0; i < this.config.co2.count; i++) {
      const i3 = i * 3;
      cData.progress[i] += delta * cData.speed[i] * 0.3 * speedMult;
      if (cData.progress[i] > 1.0) cData.progress[i] -= 1.0;
      const t = cData.progress[i];
      this.dummy.position.set(45 + Math.sin(t * 5 + i) * 6.0, -5.0 + t * 6.0, Math.cos(t * 5 + i) * 5.0);
      this.dummy.scale.setScalar(cData.scale);
      this.dummy.updateMatrix();
      cMesh.setMatrixAt(i, this.dummy.matrix);
    }
    cMesh.instanceMatrix.needsUpdate = true;
  }

  updateThylakoidParticles(delta, speedMult, simParams) {
    // O2
    const oMesh = this.meshes.o2;
    const oData = this.particleData.o2;
    for (let i = 0; i < this.config.o2.count; i++) {
      const i3 = i * 3;
      oData.progress[i] += delta * oData.speed[i] * 0.5 * speedMult;
      if (oData.progress[i] > 1.0) oData.progress[i] -= 1.0;
      const t = oData.progress[i];
      this.dummy.position.set(130 + Math.sin(t * 8 + i) * (t * 4), -1.8 + t * 8.0, Math.cos(t * 8 + i) * (t * 4));
      this.dummy.scale.setScalar(oData.scale * (0.8 + t * 0.4));
      this.dummy.updateMatrix();
      oMesh.setMatrixAt(i, this.dummy.matrix);
    }
    oMesh.instanceMatrix.needsUpdate = true;

    // Protons (H+)
    const pMesh = this.meshes.protons;
    const pData = this.particleData.protons;
    for (let i = 0; i < this.config.protons.count; i++) {
      const i3 = i * 3;
      pData.progress[i] += delta * pData.speed[i] * 0.6 * speedMult;
      if (pData.progress[i] > 1.0) pData.progress[i] -= 1.0;
      const t = pData.progress[i];
      this.dummy.position.set(130 + t * 80, -3.0 + Math.sin(t * 12 + i) * 1.0, Math.cos(t * 10 + i) * 3.5);
      this.dummy.scale.setScalar(pData.scale);
      this.dummy.updateMatrix();
      pMesh.setMatrixAt(i, this.dummy.matrix);
    }
    pMesh.instanceMatrix.needsUpdate = true;

    // Electrons (e-)
    const eMesh = this.meshes.electrons;
    const eData = this.particleData.electrons;
    for (let i = 0; i < this.config.electrons.count; i++) {
      const i3 = i * 3;
      eData.progress[i] += delta * eData.speed[i] * 1.2 * speedMult;
      if (eData.progress[i] > 1.0) eData.progress[i] -= 1.0;
      const t = eData.progress[i];
      this.dummy.position.set(130 + t * 40, Math.sin(t * Math.PI * 6) * 1.2, Math.sin(t * Math.PI * 10 + i) * 0.6);
      this.dummy.scale.setScalar(eData.scale);
      this.dummy.updateMatrix();
      eMesh.setMatrixAt(i, this.dummy.matrix);
    }
    eMesh.instanceMatrix.needsUpdate = true;

    // ATP & NADPH
    const aMesh = this.meshes.atp_nadph;
    const aData = this.particleData.atp_nadph;
    for (let i = 0; i < this.config.atp_nadph.count; i++) {
      const i3 = i * 3;
      aData.progress[i] += delta * aData.speed[i] * 0.35 * speedMult;
      if (aData.progress[i] > 1.0) aData.progress[i] -= 1.0;
      const t = aData.progress[i];
      this.dummy.position.set(210 + t * 40, 4.0 + Math.sin(t * 4 + i) * 1.5, Math.cos(t * 4 + i) * 4.0);
      this.dummy.scale.setScalar(aData.scale);
      this.dummy.updateMatrix();
      aMesh.setMatrixAt(i, this.dummy.matrix);
    }
    aMesh.instanceMatrix.needsUpdate = true;
  }
}
