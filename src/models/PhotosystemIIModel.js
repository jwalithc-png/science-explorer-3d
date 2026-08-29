import * as THREE from 'three';
import { createLipidBilayerMaterial } from '../shaders/LipidBilayerShader.js';
import { createChlorophyllMaterial } from '../shaders/ChlorophyllShader.js';

/**
 * Photosystem II & Water Photolysis Molecular Model (Stage 6)
 * 
 * Features:
 * 1. Dimeric PSII Supercomplex embedded in thylakoid lipid bilayer
 * 2. LHCII Light-Harvesting Chlorophyll Antennae absorbing 680nm photons
 * 3. Mn4CaO5 Oxygen-Evolving Complex (OEC) catalytic cluster (4 Manganese + 1 Calcium + 5 Oxygens)
 * 4. Continuous Water Photolysis: 2H2O ➔ O2 + 4H+ + 4e-
 * 5. Dynamic photon absorption flashes & bubbling O2 evolution
 * 6. High-energy electron ejection down Pheophytin and QA/QB Plastoquinones
 */
export class PhotosystemIIModel {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.group.position.set(options.x || 130, options.y || 0, options.z || 0);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.time = 0;
    this.o2Bubbles = [];
    this.electronFlashes = [];

    this.buildLipidBilayer();
    this.buildPSIICoreComplex();
    this.buildOECCluster();
    this.buildAntennaeLHCII();
    this.buildPhotolysisAnimations();
  }

  buildLipidBilayer() {
    const memMat = createLipidBilayerMaterial({
      headColor: '#0284c7',
      tailColor: '#0f172a'
    });
    const memGeo = new THREE.BoxGeometry(28, 1.4, 20);
    const membrane = new THREE.Mesh(memGeo, memMat);
    membrane.position.y = 0;
    this.inspectPivot.add(membrane);
  }

  buildPSIICoreComplex() {
    this.psiiCore = new THREE.Group();
    this.psiiCore.position.set(0, 0, 0);

    // Dimeric Transmembrane Core Proteins (D1 and D2 reaction center subunits)
    const d1Geo = new THREE.CylinderGeometry(1.6, 1.8, 5.2, 16);
    const d1Mat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Deep chlorophyll green
      roughness: 0.35,
      metalness: 0.15
    });

    const d1Mesh = new THREE.Mesh(d1Geo, d1Mat);
    d1Mesh.position.set(-1.4, 0.4, 0);
    this.psiiCore.add(d1Mesh);

    const d2Mesh = new THREE.Mesh(d1Geo, d1Mat);
    d2Mesh.position.set(1.4, 0.4, 0);
    this.psiiCore.add(d2Mesh);

    // P680 Special Pair Chlorophylls
    const p680Geo = new THREE.SphereGeometry(0.7, 16, 16);
    const p680Mat = new THREE.MeshBasicMaterial({
      color: 0xfacc15, // Golden glow
      wireframe: false
    });

    this.p680A = new THREE.Mesh(p680Geo, p680Mat);
    this.p680A.position.set(-0.6, 0.6, 0.4);
    this.psiiCore.add(this.p680A);

    this.p680B = new THREE.Mesh(p680Geo, p680Mat);
    this.p680B.position.set(0.6, 0.6, -0.4);
    this.psiiCore.add(this.p680B);

    this.inspectPivot.add(this.psiiCore);
  }

  buildOECCluster() {
    // Mn4CaO5 Distorted Chair Oxygen-Evolving Complex in lumenal cavity (y = -1.8)
    this.oecGroup = new THREE.Group();
    this.oecGroup.position.set(0, -1.8, 0);

    const mnMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.6, roughness: 0.2 }); // Violet Manganese ions
    const caMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.4, roughness: 0.3 }); // Cyan Calcium ion
    const oxMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }); // Red Oxygen bridges

    const mnGeo = new THREE.SphereGeometry(0.32, 14, 14);
    const caGeo = new THREE.SphereGeometry(0.42, 14, 14);
    const oxGeo = new THREE.SphereGeometry(0.22, 12, 12);

    // 4 Manganese ions
    const mnCoords = [
      { x: -0.6, y: 0.2, z: 0.3 },
      { x: 0.4, y: 0.3, z: 0.4 },
      { x: 0.0, y: -0.3, z: -0.3 },
      { x: -0.5, y: -0.2, z: -0.4 }
    ];
    mnCoords.forEach(c => {
      const m = new THREE.Mesh(mnGeo, mnMat);
      m.position.set(c.x, c.y, c.z);
      this.oecGroup.add(m);
    });

    // 1 Calcium ion
    const ca = new THREE.Mesh(caGeo, caMat);
    ca.position.set(0.7, -0.1, -0.2);
    this.oecGroup.add(ca);

    // 5 Oxygen bridging atoms
    for (let i = 0; i < 5; i++) {
      const ox = new THREE.Mesh(oxGeo, oxMat);
      const angle = (i / 5) * Math.PI * 2;
      ox.position.set(Math.cos(angle) * 0.4, Math.sin(angle) * 0.25, Math.sin(angle) * 0.3);
      this.oecGroup.add(ox);
    }

    this.inspectPivot.add(this.oecGroup);
  }

  buildAntennaeLHCII() {
    // Flanking Light-Harvesting Complexes (LHCII trimers)
    const lhciiGeo = new THREE.CylinderGeometry(1.2, 1.4, 4.4, 12);
    const lhciiMat = createChlorophyllMaterial({
      chlorophyllColor: '#22c55e',
      carotenoidColor: '#facc15'
    });

    const positions = [
      { x: -4.5, y: 0.3, z: 1.2 },
      { x: -4.2, y: 0.3, z: -2.0 },
      { x: 4.5, y: 0.3, z: 1.2 },
      { x: 4.2, y: 0.3, z: -2.0 }
    ];

    positions.forEach(pos => {
      const mesh = new THREE.Mesh(lhciiGeo, lhciiMat);
      mesh.position.set(pos.x, pos.y, pos.z);
      this.inspectPivot.add(mesh);
    });
  }

  buildPhotolysisAnimations() {
    // Rising O2 bubbles released into lumen and stromal air
    this.bubbleGroup = new THREE.Group();
    const bubbleGeo = new THREE.SphereGeometry(0.28, 12, 12);
    const bubbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
      transmission: 0.8
    });

    for (let i = 0; i < 12; i++) {
      const b = new THREE.Mesh(bubbleGeo, bubbleMat);
      b.position.set((Math.random() - 0.5) * 4.0, -1.8 + Math.random() * 6.0, (Math.random() - 0.5) * 4.0);
      this.bubbleGroup.add(b);
      this.o2Bubbles.push({
        mesh: b,
        speed: 1.5 + Math.random() * 2.0,
        startY: -2.0,
        endY: 4.5
      });
    }
    this.inspectPivot.add(this.bubbleGroup);

    // Ejected High-Energy Electrons (e-) flashes
    const flashGeo = new THREE.SphereGeometry(0.18, 10, 10);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    for (let i = 0; i < 6; i++) {
      const f = new THREE.Mesh(flashGeo, flashMat);
      f.position.set(0, 1.2, 0);
      this.inspectPivot.add(f);
      this.electronFlashes.push({
        mesh: f,
        progress: i / 6,
        speed: 1.2 + Math.random() * 0.8
      });
    }
  }

  update(delta, params = {}) {
    const time = performance.now() * 0.001;
    const speedMult = params.simSpeed || 1.0;
    const deltaT = delta * speedMult;

    this.time += deltaT;

    // 1. P680 reaction center resonance glow
    if (this.p680A && this.p680B) {
      const glow = 1.0 + Math.sin(this.time * 6.0) * 0.3;
      this.p680A.scale.setScalar(glow);
      this.p680B.scale.setScalar(glow);
    }

    // 2. OEC Catalytic Cluster breathing/oscillation
    if (this.oecGroup) {
      this.oecGroup.rotation.y += deltaT * 0.4;
      this.oecGroup.scale.setScalar(1.0 + Math.sin(this.time * 4.0) * 0.06);
    }

    // 3. Float O2 gas bubbles upward
    this.o2Bubbles.forEach(b => {
      b.mesh.position.y += b.speed * deltaT;
      b.mesh.position.x += Math.sin(this.time * 3.0 + b.mesh.position.y) * 0.02;
      if (b.mesh.position.y > b.endY) {
        b.mesh.position.y = b.startY;
        b.mesh.position.x = (Math.random() - 0.5) * 3.0;
        b.mesh.position.z = (Math.random() - 0.5) * 3.0;
      }
    });

    // 4. Eject High-Energy Electrons along Plastoquinone pathway
    this.electronFlashes.forEach(f => {
      f.progress += f.speed * deltaT;
      if (f.progress > 1.0) f.progress = 0;

      // Trajectory from P680 (0, 0.8) to Plastoquinone QA/QB (3.5, 0.2)
      f.mesh.position.x = f.progress * 4.2;
      f.mesh.position.y = 0.8 - f.progress * 0.6 + Math.sin(f.progress * Math.PI) * 0.4;
      f.mesh.position.z = Math.sin(f.progress * Math.PI * 2.0) * 0.5;
      f.mesh.scale.setScalar(1.0 + Math.sin(this.time * 20.0) * 0.4);
    });
  }
}
