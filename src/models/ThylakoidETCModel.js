import * as THREE from 'three';
import { createLipidBilayerMaterial } from '../shaders/LipidBilayerShader.js';
import { createChlorophyllMaterial } from '../shaders/ChlorophyllShader.js';
import { GeometryBuilder } from '../procedural/GeometryBuilder.js';

/**
 * Molecular Thylakoid Membrane & Electron Transport Chain (ETC) Model
 * (Level 3: Light-Dependent Reactions)
 * 
 * Components:
 * 1. Phospholipid Bilayer Membrane (Stroma top Y > 0, Lumen bottom Y < 0)
 * 2. Photosystem II (PSII / P680) with LHCII antennae & Mn4CaO5 Water-Splitting OEC
 * 3. Plastoquinone (PQ / PQH2) lipid-soluble shuttle
 * 4. Cytochrome b6f Complex (Q-cycle proton pump)
 * 5. Plastocyanin (PC) lumenal electron shuttle
 * 6. Photosystem I (PSI / P700) with LHCI antennae & Fe-S clusters
 * 7. Ferredoxin (Fd) stromal electron carrier
 * 8. Ferredoxin-NADP+ Reductase (FNR) synthesizing NADPH
 */
export class ThylakoidETCModel {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.group.position.set(options.x || 90, options.y || 0, options.z || 0);

    this.time = 0;
    this.materials = [];
    this.mobileCarriers = {};

    this.buildLipidBilayer();
    this.buildPhotosystemII();
    this.buildCytochromeB6f();
    this.buildPhotosystemI();
    this.buildFNR();
    this.buildMobileCarriers();
    this.buildCompartmentLabels();
  }

  buildLipidBilayer() {
    // Top & bottom monolayer sheets with phospholipid headgroups
    const width = 60;
    const depth = 20;

    const bilayerMat = createLipidBilayerMaterial({
      headColor: '#0284c7',
      tailColor: '#0f172a',
      sssColor: '#38bdf8'
    });
    this.materials.push(bilayerMat);

    const bilayerGeo = new THREE.BoxGeometry(width, 1.4, depth, 40, 2, 20);
    const bilayer = new THREE.Mesh(bilayerGeo, bilayerMat);
    bilayer.position.y = 0;
    this.group.add(bilayer);

    // Phospholipid headgroup spheres for detailed molecular texture
    const headGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });

    const headInstanced = new THREE.InstancedMesh(headGeo, headMat, 600);
    const dummy = new THREE.Object3D();
    let idx = 0;

    for (let x = -28; x <= 28; x += 1.8) {
      for (let z = -8; z <= 8; z += 1.8) {
        if (idx >= 600) break;
        // Upper layer (stroma facing)
        dummy.position.set(x + (Math.random() - 0.5) * 0.4, 0.75, z + (Math.random() - 0.5) * 0.4);
        dummy.updateMatrix();
        headInstanced.setMatrixAt(idx++, dummy.matrix);

        if (idx >= 600) break;
        // Lower layer (lumen facing)
        dummy.position.set(x + (Math.random() - 0.5) * 0.4, -0.75, z + (Math.random() - 0.5) * 0.4);
        dummy.updateMatrix();
        headInstanced.setMatrixAt(idx++, dummy.matrix);
      }
    }
    headInstanced.instanceMatrix.needsUpdate = true;
    this.group.add(headInstanced);
  }

  buildPhotosystemII() {
    const psiiGroup = new THREE.Group();
    psiiGroup.position.set(0, 0, 0); // Local origin for PSII

    // Transmembrane Core (D1, D2 proteins)
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.35 });
    const coreGeo = new THREE.CylinderGeometry(1.8, 1.8, 3.2, 20);
    const core = new THREE.Mesh(coreGeo, coreMat);
    psiiGroup.add(core);

    // Light-Harvesting Complexes (LHCII Antennae Trimers)
    const antMat = createChlorophyllMaterial({ baseColor: '#16a34a', fluorescenceColor: '#86efac' });
    this.materials.push(antMat);

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.6, 12), antMat);
      ant.position.set(Math.cos(angle) * 2.2, 0.3, Math.sin(angle) * 2.2);
      psiiGroup.add(ant);
    }

    // Oxygen-Evolving Complex (OEC / Mn4CaO5 Water-Splitting Pocket in Lumen)
    const oecGroup = new THREE.Group();
    oecGroup.position.set(0, -1.8, 0);

    const mnMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.6, roughness: 0.2 });
    const caMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.4, roughness: 0.3 });

    // 4 Manganese ions + 1 Calcium ion
    for (let m = 0; m < 4; m++) {
      const mn = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), mnMat);
      mn.position.set(Math.cos(m * 1.5) * 0.4, (m % 2) * 0.3, Math.sin(m * 1.5) * 0.4);
      oecGroup.add(mn);
    }
    const ca = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), caMat);
    ca.position.set(0, 0.4, 0);
    oecGroup.add(ca);

    psiiGroup.add(oecGroup);
    this.group.add(psiiGroup);
    this.psiiGroup = psiiGroup;
  }

  buildCytochromeB6f() {
    const cytGroup = new THREE.Group();
    cytGroup.position.set(16, 0, 0);

    // Dimeric Complex
    const cytMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.3 }); // Heme red/crimson
    const b6Geo = new THREE.CylinderGeometry(1.6, 1.6, 3.4, 18);
    const b6 = new THREE.Mesh(b6Geo, cytMat);
    cytGroup.add(b6);

    // Internal Heme Iron clusters
    const hemeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    for (let h = 0; h < 4; h++) {
      const heme = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), hemeMat);
      heme.position.set(Math.cos(h * 1.5) * 0.8, (h - 1.5) * 0.6, Math.sin(h * 1.5) * 0.8);
      cytGroup.add(heme);
    }

    // Proton pumping channel indicator
    const channelGeo = new THREE.CylinderGeometry(0.2, 0.2, 3.8, 8);
    const channelMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.6 });
    const channel = new THREE.Mesh(channelGeo, channelMat);
    cytGroup.add(channel);

    this.group.add(cytGroup);
    this.cytGroup = cytGroup;
  }

  buildPhotosystemI() {
    const psiGroup = new THREE.Group();
    psiGroup.position.set(30, 0, 0);

    // Trimeric Core (PsaA, PsaB, PsaC)
    const psiMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.35 });
    const psiCoreGeo = new THREE.CylinderGeometry(2.1, 2.1, 3.4, 20);
    const psiCore = new THREE.Mesh(psiCoreGeo, psiMat);
    psiGroup.add(psiCore);

    // LHCI Antennae ring
    const lhciMat = createChlorophyllMaterial({ baseColor: '#047857', fluorescenceColor: '#34d399' });
    this.materials.push(lhciMat);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 2.8, 12), lhciMat);
      ant.position.set(Math.cos(angle) * 2.5, 0.4, Math.sin(angle) * 2.5);
      psiGroup.add(ant);
    }

    // Iron-Sulfur Centers (Fx, Fa, Fb) in stroma ridge
    const fesMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.2 });
    for (let f = 0; f < 3; f++) {
      const fes = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), fesMat);
      fes.position.set((f - 1) * 0.4, 2.0, 0);
      psiGroup.add(fes);
    }

    this.group.add(psiGroup);
    this.psiGroup = psiGroup;
  }

  buildFNR() {
    const fnrGroup = new THREE.Group();
    fnrGroup.position.set(38, 2.2, 0); // Stroma side near PSI

    // Ferredoxin-NADP+ Reductase protein
    const fnrMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 });
    const fnrMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), fnrMat);
    fnrGroup.add(fnrMesh);

    // Catalytic FAD cofactor center
    const fadMesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
    fadMesh.position.set(0, 0.3, 0);
    fnrGroup.add(fadMesh);

    this.group.add(fnrGroup);
    this.fnrGroup = fnrGroup;
  }

  buildMobileCarriers() {
    // 1. Plastoquinone (PQ) shuttle within lipid bilayer (between PSII and Cyt b6f)
    const pqGeo = new THREE.SphereGeometry(0.45, 12, 12);
    const pqMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.3, roughness: 0.2 });
    const pqMesh = new THREE.Mesh(pqGeo, pqMat);
    pqMesh.position.set(8, 0, 0);
    this.group.add(pqMesh);

    // 2. Plastocyanin (PC) shuttle in Lumen (between Cyt b6f and PSI)
    const pcGeo = new THREE.SphereGeometry(0.42, 12, 12);
    const pcMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.5, roughness: 0.2 });
    const pcMesh = new THREE.Mesh(pcGeo, pcMat);
    pcMesh.position.set(23, -2.0, 0);
    this.group.add(pcMesh);

    // 3. Ferredoxin (Fd) shuttle in Stroma (between PSI and FNR)
    const fdGeo = new THREE.SphereGeometry(0.4, 12, 12);
    const fdMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.4, roughness: 0.3 });
    const fdMesh = new THREE.Mesh(fdGeo, fdMat);
    fdMesh.position.set(34, 2.2, 0);
    this.group.add(fdMesh);

    this.mobileCarriers = { pqMesh, pcMesh, fdMesh };
  }

  buildCompartmentLabels() {
    // Visual orientation guides for Stroma vs Lumen
    const gridHelper = new THREE.GridHelper(60, 20, 0x0284c7, 0x0f172a);
    gridHelper.position.y = -4.0;
    this.group.add(gridHelper);
  }

  update(delta, simParams = {}) {
    this.time += delta * (simParams.simSpeed || 1.0);

    // Animate mobile carriers shuttling
    if (this.mobileCarriers.pqMesh) {
      // PQ oscillates between PSII (x=2) and Cyt b6f (x=14)
      const pqT = (Math.sin(this.time * 2.2) + 1) * 0.5;
      this.mobileCarriers.pqMesh.position.x = 2 + pqT * 12;
      this.mobileCarriers.pqMesh.position.z = Math.sin(this.time * 4.0) * 1.2;
    }

    if (this.mobileCarriers.pcMesh) {
      // PC oscillates between Cyt b6f (x=17) and PSI (x=28) in lumen
      const pcT = (Math.cos(this.time * 2.5) + 1) * 0.5;
      this.mobileCarriers.pcMesh.position.x = 17 + pcT * 11;
      this.mobileCarriers.pcMesh.position.z = Math.cos(this.time * 3.5) * 1.0;
    }

    if (this.mobileCarriers.fdMesh) {
      // Fd oscillates between PSI (x=31) and FNR (x=37) in stroma
      const fdT = (Math.sin(this.time * 3.0) + 1) * 0.5;
      this.mobileCarriers.fdMesh.position.x = 31 + fdT * 6;
      this.mobileCarriers.fdMesh.position.y = 2.2 + Math.sin(this.time * 5.0) * 0.3;
    }

    // Update shader uniforms
    this.materials.forEach((mat) => {
      if (mat.uniforms && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = this.time;
        if (mat.uniforms.uLightIntensity) {
          mat.uniforms.uLightIntensity.value = simParams.lightIntensity || 1.0;
        }
      }
    });
  }
}
