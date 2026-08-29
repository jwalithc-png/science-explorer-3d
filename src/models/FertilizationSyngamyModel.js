import * as THREE from 'three';
import { createCalciumWaveMaterial } from '../shaders/CalciumWaveShader.js';

/**
 * Stage 4: Cortical Reaction, Zinc Spark & Syngamy (The Spark of Life) Model
 * Demonstrates the propagating calcium wave, zinc spark flash, cortical granule exocytosis,
 * and the central migration and fusion (syngamy) of male and female pronuclei.
 */
export class FertilizationSyngamyModel {
  constructor(position = { x: 15, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(position.x, position.y, position.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.initZygoteCell();
    this.initCalciumWaveSphere();
    this.initPronuclei();
    this.initPolarBodies();
    this.initCorticalGranules();
  }

  initZygoteCell() {
    // Large single-celled Zygote Cytoplasm
    const cellGeo = new THREE.SphereGeometry(3.6, 36, 36);
    const cellMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      roughness: 0.45,
      metalness: 0.1,
      emissive: 0x6b21a8,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.88
    });
    this.zygoteMesh = new THREE.Mesh(cellGeo, cellMat);
    this.inspectPivot.add(this.zygoteMesh);

    // Hardened Fertilization Envelope (Zona Pellucida modified by cortical ovoperoxidase)
    const envGeo = new THREE.SphereGeometry(4.3, 36, 36);
    const envMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.45,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.4
    });
    this.envelopeMesh = new THREE.Mesh(envGeo, envMat);
    this.inspectPivot.add(this.envelopeMesh);
  }

  initCalciumWaveSphere() {
    // Bioluminescent expanding Calcium Wave & Zinc Spark Shockwave
    const waveGeo = new THREE.SphereGeometry(3.8, 48, 48);
    this.waveMat = createCalciumWaveMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWaveOrigin: { value: new THREE.Vector3(1, 0, 0) },
        uWaveRadius: { value: 0.5 },
        uWaveWidth: { value: 0.5 },
        uColorWave: { value: new THREE.Color(0xa855f7) },
        uColorSpark: { value: new THREE.Color(0xfacc15) },
        uIntensity: { value: 1.0 }
      }
    });
    this.waveMesh = new THREE.Mesh(waveGeo, this.waveMat);
    this.inspectPivot.add(this.waveMesh);
  }

  initPronuclei() {
    // Male and Female Pronuclei migrating towards the center to fuse (Syngamy)
    this.pronucleiGroup = new THREE.Group();

    // 1. Female Pronucleus (Maternal 23 chromosomes)
    const femaleGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const femaleMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xdb2777,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      transparent: true,
      opacity: 0.85
    });
    this.femalePronucleus = new THREE.Mesh(femaleGeo, femaleMat);
    this.femalePronucleus.position.set(-1.2, 0.2, 0);
    this.pronucleiGroup.add(this.femalePronucleus);

    // Female Chromatin strands
    const femaleChromGeo = new THREE.TorusKnotGeometry(0.35, 0.06, 32, 8);
    const chromMatF = new THREE.MeshBasicMaterial({ color: 0xfdf2f8, wireframe: true });
    this.femalePronucleus.add(new THREE.Mesh(femaleChromGeo, chromMatF));

    // 2. Male Pronucleus (Paternal 23 chromosomes)
    const maleGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const maleMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      transparent: true,
      opacity: 0.85
    });
    this.malePronucleus = new THREE.Mesh(maleGeo, maleMat);
    this.malePronucleus.position.set(1.2, -0.2, 0);
    this.pronucleiGroup.add(this.malePronucleus);

    // Male Chromatin strands
    const maleChromGeo = new THREE.TorusKnotGeometry(0.35, 0.06, 32, 8);
    const chromMatM = new THREE.MeshBasicMaterial({ color: 0xf0f9ff, wireframe: true });
    this.malePronucleus.add(new THREE.Mesh(maleChromGeo, chromMatM));

    // Mitotic Spindle uniting both genomes
    const spindleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8);
    const spindleMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.7 });
    this.spindle = new THREE.Mesh(spindleGeo, spindleMat);
    this.spindle.rotation.z = Math.PI * 0.5;
    this.pronucleiGroup.add(this.spindle);

    this.inspectPivot.add(this.pronucleiGroup);
  }

  initPolarBodies() {
    // 1st and 2nd Polar bodies extruded in perivitelline space
    const pb1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 })
    );
    pb1.position.set(2.5, 2.5, 0.3);
    this.inspectPivot.add(pb1);

    const pb2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.4 })
    );
    pb2.position.set(2.7, 2.1, -0.4);
    this.inspectPivot.add(pb2);
  }

  initCorticalGranules() {
    // Granules fusing at cortex releasing enzymes
    const granCount = 80;
    const granGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const granMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    this.granulesMesh = new THREE.InstancedMesh(granGeo, granMat, granCount);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < granCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 3.55;
      dummy.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      dummy.updateMatrix();
      this.granulesMesh.setMatrixAt(i, dummy.matrix);
    }
    this.granulesMesh.instanceMatrix.needsUpdate = true;
    this.inspectPivot.add(this.granulesMesh);
  }

  update(delta, params = {}) {
    const time = performance.now() * 0.001;
    const speed = params.simSpeed || 1.0;

    // 1. Auto 360° Turntable Rotation
    if (params.autoRotate360) {
      this.inspectPivot.rotation.y += delta * (params.rotationSpeed360 || 0.5);
    }

    // 2. Animate Calcium Wave Shockwave expansion
    if (this.waveMat.uniforms) {
      this.waveMat.uniforms.uTime.value = time * speed;
      // Oscillating expanding ripple across sphere (0 to 2.0)
      this.waveMat.uniforms.uWaveRadius.value = (time * 0.6 * speed) % 2.2;
      this.waveMat.uniforms.uIntensity.value = params.calciumWaveIntensity || 1.0;
    }

    // 3. Pronuclei Migration & Dynamic Fusion Oscillation
    const osc = Math.sin(time * 1.2 * speed);
    const dist = THREE.MathUtils.lerp(0.3, 1.2, (osc + 1) * 0.5);
    this.femalePronucleus.position.x = -dist;
    this.malePronucleus.position.x = dist;

    // Syngamy energy glow
    const glow = (1.0 - (dist / 1.2)) * 1.5;
    this.femalePronucleus.material.emissiveIntensity = 0.6 + glow;
    this.malePronucleus.material.emissiveIntensity = 0.6 + glow;
  }
}
