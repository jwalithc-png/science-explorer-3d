import * as THREE from 'three';
import { createLeafMaterial } from '../shaders/LeafShader.js';
import { TextureGenerator } from '../procedural/TextureGenerator.js';
import { GeometryBuilder } from '../procedural/GeometryBuilder.js';

/**
 * 3D Leaf Tissue Cross-Section Model (Level 1: Macro Botanical View)
 * 
 * Layers from Top to Bottom:
 * 1. Upper Waxy Cuticle (translucent protective lipid layer)
 * 2. Upper Epidermis (brick-shaped cells with nuclei)
 * 3. Palisade Mesophyll (tightly packed vertical cylindrical cells packed with chloroplasts)
 * 4. Spongy Mesophyll (loose, irregular cells with large intercellular air spaces)
 * 5. Vascular Bundle Vein:
 *    - Xylem (lignified helical vessels delivering H2O)
 *    - Phloem (sieve tubes exporting synthesized sucrose/glucose)
 * 6. Lower Epidermis with functional Stomata guard cells (breathing gas exchange)
 */
export class LeafModel {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.group.position.set(options.x || 0, options.y || 0, options.z || 0);

    this.stomataPairs = [];
    this.chloroplastMeshes = [];
    this.time = 0;

    this.buildLayers();
    this.buildVascularBundle();
    this.buildStomata();
    this.buildAnnotations();
  }

  buildLayers() {
    const width = 24;
    const depth = 16;

    // 1. Upper Waxy Cuticle
    const cuticleGeo = new THREE.BoxGeometry(width, 0.2, depth);
    const cuticleMat = new THREE.MeshPhysicalMaterial({
      color: 0x86efac,
      transmission: 0.85,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1,
      ior: 1.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const cuticle = new THREE.Mesh(cuticleGeo, cuticleMat);
    cuticle.position.y = 4.1;
    this.group.add(cuticle);

    // 2. Upper Epidermis
    const epiGeo = new THREE.BoxGeometry(width, 0.7, depth);
    const epiTex = TextureGenerator.createEpidermisTexture();
    epiTex.repeat.set(4, 3);
    const epiMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.3,
      map: epiTex
    });
    const upperEpi = new THREE.Mesh(epiGeo, epiMat);
    upperEpi.position.y = 3.6;
    this.group.add(upperEpi);

    // 3. Palisade Mesophyll Layer (Vertical columnar cylinders)
    const palisadeGroup = new THREE.Group();
    const palisadeGeo = new THREE.CylinderGeometry(0.55, 0.55, 3.2, 14);
    const palisadeMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.4,
      metalness: 0.1
    });

    const palCols = 16;
    const palRows = 10;
    const spacingX = (width - 2) / palCols;
    const spacingZ = (depth - 2) / palRows;

    for (let i = 0; i < palCols; i++) {
      for (let j = 0; j < palRows; j++) {
        // Skip space for vascular bundle in center
        const posX = (i - palCols / 2 + 0.5) * spacingX;
        const posZ = (j - palRows / 2 + 0.5) * spacingZ;
        if (Math.abs(posX) < 3.5 && Math.abs(posZ) < 3.5) continue;

        const cell = new THREE.Mesh(palisadeGeo, palisadeMat);
        cell.position.set(
          posX + (Math.random() - 0.5) * 0.15,
          1.7,
          posZ + (Math.random() - 0.5) * 0.15
        );
        palisadeGroup.add(cell);

        // Add internal green chloroplast spheres inside palisade cell
        const chloGeo = new THREE.SphereGeometry(0.16, 8, 8);
        const chloMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
        for (let k = 0; k < 6; k++) {
          const chlo = new THREE.Mesh(chloGeo, chloMat);
          chlo.position.set(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 2.4,
            (Math.random() - 0.5) * 0.5
          );
          cell.add(chlo);
          this.chloroplastMeshes.push(chlo);
        }
      }
    }
    this.group.add(palisadeGroup);

    // 4. Spongy Mesophyll Layer (Loosely packed irregular spheres with air spaces)
    const spongyGroup = new THREE.Group();
    const spongyGeo = new THREE.DodecahedronGeometry(0.75, 1);
    const spongyMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.5
    });

    for (let i = 0; i < 90; i++) {
      const posX = (Math.random() - 0.5) * (width - 2);
      const posZ = (Math.random() - 0.5) * (depth - 2);
      if (Math.abs(posX) < 3.5 && Math.abs(posZ) < 3.5) continue; // Skip vein

      const sCell = new THREE.Mesh(spongyGeo, spongyMat);
      sCell.position.set(
        posX,
        -0.8 + (Math.random() - 0.5) * 1.6,
        posZ
      );
      sCell.scale.set(
        0.8 + Math.random() * 0.4,
        0.7 + Math.random() * 0.3,
        0.8 + Math.random() * 0.4
      );
      spongyGroup.add(sCell);
    }
    this.group.add(spongyGroup);

    // 5. Lower Epidermis
    const lowerEpi = new THREE.Mesh(epiGeo.clone(), epiMat);
    lowerEpi.position.y = -2.2;
    this.group.add(lowerEpi);

    // 6. Lower Cuticle
    const lowerCuticle = new THREE.Mesh(cuticleGeo.clone(), cuticleMat);
    lowerCuticle.position.y = -2.6;
    this.group.add(lowerCuticle);
  }

  buildVascularBundle() {
    const veinGroup = new THREE.Group();
    veinGroup.position.set(0, 0.4, 0);

    // Bundle Sheath (cylindrical outer ring)
    const sheathGeo = new THREE.CylinderGeometry(2.4, 2.4, 8, 20, 1, true);
    const sheathMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    const sheath = new THREE.Mesh(sheathGeo, sheathMat);
    sheath.rotation.x = Math.PI * 0.5;
    veinGroup.add(sheath);

    // Xylem Vessels (upper half delivering H2O)
    const xylemRingsTex = TextureGenerator.createXylemRingsTexture();
    const xylemMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      map: xylemRingsTex,
      roughness: 0.4
    });

    for (let i = -1; i <= 1; i++) {
      const xylemGeo = new THREE.CylinderGeometry(0.5, 0.5, 8.2, 16);
      const xylem = new THREE.Mesh(xylemGeo, xylemMat);
      xylem.rotation.x = Math.PI * 0.5;
      xylem.position.set(i * 1.1, 0.9, 0);
      veinGroup.add(xylem);
    }

    // Phloem Vessels (lower half transporting Glucose/Sucrose)
    const phloemMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.3
    });

    for (let i = -1; i <= 1; i++) {
      const phloemGeo = new THREE.CylinderGeometry(0.4, 0.4, 8.2, 14);
      const phloem = new THREE.Mesh(phloemGeo, phloemMat);
      phloem.rotation.x = Math.PI * 0.5;
      phloem.position.set(i * 0.9, -0.8, 0);
      veinGroup.add(phloem);
    }

    this.group.add(veinGroup);
  }

  buildStomata() {
    // Add multiple animated stomatal guard cell complexes along the lower epidermis
    const stomataPositions = [
      { x: -6, z: -3 },
      { x: -7, z: 4 },
      { x: 6, z: -4 },
      { x: 7, z: 3 },
      { x: 0, z: -5.5 },
      { x: 0, z: 5.5 }
    ];

    stomataPositions.forEach((pos) => {
      const stomata = GeometryBuilder.createGuardCellPair();
      stomata.position.set(pos.x, -2.55, pos.z);
      stomata.rotation.x = Math.PI * 0.5;
      this.group.add(stomata);
      this.stomataPairs.push(stomata);
    });
  }

  buildAnnotations() {
    // 3D Visual indicator arrows & guides
    const sunArrowGeo = new THREE.ConeGeometry(0.6, 2.0, 12);
    const sunArrowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let i = -8; i <= 8; i += 8) {
      const arrow = new THREE.Mesh(sunArrowGeo, sunArrowMat);
      arrow.position.set(i, 8.5, 0);
      arrow.rotation.x = Math.PI;
      this.group.add(arrow);
    }
  }

  update(delta, simParams = {}) {
    this.time += delta * (simParams.simSpeed || 1.0);

    // Animate stomata opening & closing (breathing turgor cycle)
    const stomataAperture = Math.sin(this.time * 0.8) * 0.35 + 0.65;
    this.stomataPairs.forEach((stoma) => {
      if (stoma.userData) {
        stoma.userData.leftCell.position.x = -0.45 * stomataAperture;
        stoma.userData.rightCell.position.x = 0.45 * stomataAperture;
        stoma.userData.pore.scale.x = stomataAperture;
      }
    });

    // Chloroplast light excitation pulse
    const pulse = Math.sin(this.time * 2.0) * 0.15 + 0.85;
    this.chloroplastMeshes.forEach((c) => {
      c.scale.setScalar(pulse);
    });
  }
}
