import * as THREE from 'three';
import { createLeafMaterial } from '../shaders/LeafShader.js';

/**
 * Step-by-Step Plant Growth (Morphogenesis) 3D Model
 * (Stage 3: Cellular Morphogenesis Powered by Photosynthetic Energy)
 * 
 * 4 Interactive Morphogenetic Phases:
 * 1. Seed & Geotropic Root Radicle (0.0 - 0.25)
 * 2. Hypocotyl & Sprout Cotyledon Emergence (0.25 - 0.50)
 * 3. Vegetative Shoot & True Leaf Foliage Expansion (0.50 - 0.75)
 * 4. Floral Budding & Bloom (0.75 - 1.00)
 */
export class PlantGrowthModel {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.group.position.set(options.x || 10, options.y || 0, options.z || 0);

    this.time = 0;
    this.growthProgress = 1.0; // 0.0 to 1.0 (defaults to full view, scrubbable)
    this.autoGrow = true;
    this.growSpeed = 0.08;

    this.buildSoilCutaway();
    this.buildSeedAndRoots();
    this.buildStemAndLeaves();
    this.buildFlowerBloom();
  }

  buildSoilCutaway() {
    // Soil layer with glass cutaway displaying subterranean roots
    const soilGeo = new THREE.BoxGeometry(10, 3.5, 8);
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723, // Rich dark earth soil
      roughness: 0.9
    });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = -1.75;
    this.group.add(soil);

    // Top green grass rim
    const turfGeo = new THREE.BoxGeometry(10.1, 0.15, 8.1);
    const turfMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const turf = new THREE.Mesh(turfGeo, turfMat);
    turf.position.y = 0.05;
    this.group.add(turf);
  }

  buildSeedAndRoots() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.position.set(0, -0.2, 0);

    // 1. Cotyledon Seed Case
    const seedGeo = new THREE.SphereGeometry(0.4, 12, 12);
    seedGeo.scale(1.2, 0.8, 0.9);
    const seedMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    this.seedMesh = new THREE.Mesh(seedGeo, seedMat);
    this.seedMesh.position.y = -0.3;
    this.rootGroup.add(this.seedMesh);

    // 2. Primary Taproot
    const rootMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 }); // Pale root cream
    const rootGeo = new THREE.CylinderGeometry(0.12, 0.02, 3.0, 10);
    this.taproot = new THREE.Mesh(rootGeo, rootMat);
    this.taproot.position.y = -1.8;
    this.rootGroup.add(this.taproot);

    // 3. Lateral Root Hair Branches
    this.lateralRoots = [];
    for (let r = 0; r < 8; r++) {
      const latGeo = new THREE.CylinderGeometry(0.04, 0.01, 1.2, 8);
      const latRoot = new THREE.Mesh(latGeo, rootMat);
      const angle = (r / 8) * Math.PI * 2;
      latRoot.position.set(Math.cos(angle) * 0.4, -0.8 - (r * 0.25), Math.sin(angle) * 0.4);
      latRoot.rotation.z = Math.cos(angle) * 0.8;
      latRoot.rotation.x = Math.sin(angle) * 0.8;
      this.rootGroup.add(latRoot);
      this.lateralRoots.push(latRoot);
    }

    this.group.add(this.rootGroup);
  }

  buildStemAndLeaves() {
    this.shootGroup = new THREE.Group();

    // 1. Main Vegetative Stem
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.35 });
    const stemGeo = new THREE.CylinderGeometry(0.18, 0.25, 6.5, 14);
    this.mainStem = new THREE.Mesh(stemGeo, stemMat);
    this.mainStem.position.y = 3.25;
    this.shootGroup.add(this.mainStem);

    // 2. True Leaves on Petioles
    this.trueLeaves = [];
    const leafMat = createLeafMaterial({
      epidermisColor: '#16a34a',
      veinColor: '#86efac'
    });

    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.8, 1.0, 0, 2.4);
    leafShape.quadraticCurveTo(-0.8, 1.0, 0, 0);

    const leafGeo = new THREE.ShapeGeometry(leafShape);
    leafGeo.scale(0.8, 0.8, 0.8);

    const leafNodes = [
      { y: 1.2, angle: 0.0, tilt: 0.8, scale: 0.7 },
      { y: 1.8, angle: Math.PI * 0.6, tilt: 0.85, scale: 0.9 },
      { y: 2.8, angle: Math.PI * 1.2, tilt: 0.75, scale: 1.1 },
      { y: 3.6, angle: Math.PI * 0.2, tilt: 0.7, scale: 1.2 },
      { y: 4.5, angle: Math.PI * 0.8, tilt: 0.65, scale: 1.0 },
      { y: 5.2, angle: Math.PI * 1.5, tilt: 0.6, scale: 0.85 }
    ];

    leafNodes.forEach(node => {
      const petioleGroup = new THREE.Group();
      petioleGroup.position.set(0, node.y, 0);
      petioleGroup.rotation.y = node.angle;

      // Petiole stalk
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), stemMat);
      stalk.position.x = 0.4;
      stalk.rotation.z = Math.PI * 0.5 - 0.2;
      petioleGroup.add(stalk);

      // Leaf blade
      const blade = new THREE.Mesh(leafGeo, leafMat);
      blade.position.set(1.0, 0.3, 0);
      blade.rotation.z = -node.tilt;
      blade.rotation.x = Math.PI * 0.5;
      petioleGroup.add(blade);

      this.shootGroup.add(petioleGroup);
      this.trueLeaves.push({ group: petioleGroup, baseScale: node.scale, nodeY: node.y });
    });

    this.group.add(this.shootGroup);
  }

  buildFlowerBloom() {
    this.flowerGroup = new THREE.Group();
    this.flowerGroup.position.set(0, 6.5, 0);

    // Receptacle base
    const recMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
    const rec = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.5, 12), recMat);
    rec.rotation.x = Math.PI;
    this.flowerGroup.add(rec);

    // Flower Petals (Rose/Magenta blooming crown)
    this.petals = [];
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      roughness: 0.25,
      side: THREE.DoubleSide
    });

    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.quadraticCurveTo(0.6, 0.6, 0, 1.4);
    petalShape.quadraticCurveTo(-0.6, 0.6, 0, 0);
    const petalGeo = new THREE.ShapeGeometry(petalShape);

    const petalCount = 6;
    for (let p = 0; p < petalCount; p++) {
      const angle = (p / petalCount) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(Math.cos(angle) * 0.2, 0.2, Math.sin(angle) * 0.2);
      petal.rotation.y = angle;
      petal.rotation.x = 0.6; // Open angle
      this.flowerGroup.add(petal);
      this.petals.push(petal);
    }

    // Golden Stamen & Pistil Center
    const stamenMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const pistil = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), stamenMat);
    pistil.position.y = 0.35;
    this.flowerGroup.add(pistil);

    this.group.add(this.flowerGroup);
  }

  setGrowthProgress(progress) {
    this.growthProgress = Math.max(0.0, Math.min(1.0, progress));
    this.applyGrowth();
  }

  applyGrowth() {
    const p = this.growthProgress;

    // 1. Root & Seed scaling (0.0 to 0.5)
    const rootScale = Math.min(1.0, p * 2.5);
    this.taproot.scale.set(1.0, rootScale, 1.0);
    this.lateralRoots.forEach((lr, i) => {
      const latScale = Math.max(0.01, (p - 0.1 - i * 0.03) * 3.0);
      lr.scale.setScalar(Math.min(1.0, Math.max(0.01, latScale)));
    });

    // 2. Main shoot & stem elongation (0.2 to 0.8)
    const stemProgress = Math.max(0.01, Math.min(1.0, (p - 0.2) / 0.6));
    this.shootGroup.scale.set(stemProgress, stemProgress, stemProgress);
    this.shootGroup.position.y = (stemProgress - 1.0) * 0.5;

    // 3. True leaves expanding sequentially based on height
    this.trueLeaves.forEach(leaf => {
      const threshold = 0.25 + (leaf.nodeY / 6.5) * 0.45;
      const leafP = Math.max(0.01, Math.min(1.0, (p - threshold) * 4.0));
      leaf.group.scale.setScalar(leaf.baseScale * leafP);
    });

    // 4. Floral bud & bloom opening (0.75 to 1.0)
    const flowerProgress = Math.max(0.01, Math.min(1.0, (p - 0.75) / 0.25));
    this.flowerGroup.scale.setScalar(flowerProgress);

    // Open petals
    this.petals.forEach(petal => {
      petal.rotation.x = 0.1 + flowerProgress * 0.75;
    });
  }

  update(delta, simParams = {}) {
    const speed = (simParams.simSpeed || 1.0) * (simParams.lightIntensity || 1.0);
    this.time += delta * speed;

    if (this.autoGrow) {
      this.growthProgress += delta * this.growSpeed * speed;
      if (this.growthProgress > 1.0) {
        this.growthProgress = 1.0;
        this.autoGrow = false; // Finished bloom
      }
      this.applyGrowth();
    }

    // Gentle plant breeze sway
    const breeze = Math.sin(this.time * 1.8) * 0.02;
    this.shootGroup.rotation.z = breeze;
  }
}
