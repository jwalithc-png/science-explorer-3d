import * as THREE from 'three';
import { createLeafMaterial } from '../shaders/LeafShader.js';

/**
 * Tree Canopy & Solar Ray Absorption Model (Stage 2: Macro Biological Catchment)
 * 
 * Features:
 * 1. Tree trunk with woody bark texture and natural branching
 * 2. Dense photosynthetic canopy with translucent sun-facing leaves
 * 3. Volumetric sunbeams (God Rays) streaming through the foliage
 * 4. Photon absorption scintillation flashes on leaf surfaces
 */
export class TreeCanopyModel {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.group.position.set(options.x || -25, options.y || 0, options.z || 0);

    this.time = 0;
    this.leaves = [];
    this.godRays = [];

    this.buildTerrain();
    this.buildTree();
    this.buildGodRays();
  }

  buildTerrain() {
    // Forest floor with lush grass/soil
    const groundGeo = new THREE.CylinderGeometry(14, 14, 0.6, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x14532d, // Deep forest green
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.3;
    this.group.add(ground);
  }

  buildTree() {
    const treeGroup = new THREE.Group();

    // 1. Trunk (Tapered wood cylinder)
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x5c3d2e, // Woody brown
      roughness: 0.85
    });
    const trunkGeo = new THREE.CylinderGeometry(0.8, 1.4, 6.0, 16);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 3.0;
    treeGroup.add(trunk);

    // 2. Main Branches
    const branchMat = trunkMat;
    const branchConfigs = [
      { y: 4.2, rotZ: 0.6, rotY: 0.0, len: 3.5, r: 0.5 },
      { y: 4.6, rotZ: -0.55, rotY: 1.6, len: 3.2, r: 0.45 },
      { y: 5.0, rotZ: 0.5, rotY: 3.1, len: 3.0, r: 0.4 },
      { y: 5.4, rotZ: -0.6, rotY: 4.7, len: 2.8, r: 0.35 }
    ];

    branchConfigs.forEach(bc => {
      const bGroup = new THREE.Group();
      bGroup.position.set(0, bc.y, 0);
      bGroup.rotation.y = bc.rotY;

      const branchGeo = new THREE.CylinderGeometry(bc.r * 0.6, bc.r, bc.len, 10);
      const branch = new THREE.Mesh(branchGeo, branchMat);
      branch.position.y = bc.len * 0.5;
      branch.rotation.z = bc.rotZ;
      bGroup.add(branch);

      treeGroup.add(bGroup);
    });

    // 3. Foliage & Leaves Clusters
    const leafMat = createLeafMaterial({
      epidermisColor: '#22c55e',
      veinColor: '#86efac'
    });

    const leafGeo = new THREE.SphereGeometry(0.35, 8, 8);
    leafGeo.scale(1.4, 0.2, 0.8);

    // Multiple canopy dome layers
    const canopyClusters = [
      { x: 0, y: 7.5, z: 0, r: 3.2, count: 60 },
      { x: 2.0, y: 6.2, z: 0.8, r: 2.4, count: 40 },
      { x: -1.8, y: 6.4, z: 1.5, r: 2.2, count: 35 },
      { x: 0.5, y: 6.0, z: -2.0, r: 2.3, count: 35 },
      { x: -1.2, y: 5.8, z: -1.6, r: 2.0, count: 30 }
    ];

    canopyClusters.forEach(cluster => {
      for (let i = 0; i < cluster.count; i++) {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.5; // Top hemisphere
        const rad = cluster.r * (0.6 + Math.random() * 0.4);

        leaf.position.set(
          cluster.x + Math.sin(phi) * Math.cos(theta) * rad,
          cluster.y + Math.cos(phi) * rad * 0.7,
          cluster.z + Math.sin(phi) * Math.sin(theta) * rad
        );

        // Turn leaves upward towards sunlight
        leaf.rotation.set(
          (Math.random() - 0.5) * 0.4 - 0.2,
          Math.random() * Math.PI * 2,
          (Math.random() - 0.5) * 0.4
        );

        treeGroup.add(leaf);
        this.leaves.push({
          mesh: leaf,
          baseY: leaf.position.y,
          speed: 1.0 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2
        });
      }
    });

    this.group.add(treeGroup);
  }

  buildGodRays() {
    // Volumetric sunlight shafts streaming down from above the canopy
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    for (let r = 0; r < 6; r++) {
      const angle = (r / 6) * Math.PI * 2;
      const coneGeo = new THREE.ConeGeometry(2.5, 14, 16, 1, true);
      const godRay = new THREE.Mesh(coneGeo, rayMat);
      godRay.position.set(Math.cos(angle) * 3.5, 9.5, Math.sin(angle) * 3.5);
      godRay.rotation.x = Math.PI + (Math.random() - 0.5) * 0.2;
      godRay.rotation.z = (Math.random() - 0.5) * 0.2;
      this.group.add(godRay);
      this.godRays.push(godRay);
    }
  }

  update(delta, simParams = {}) {
    this.time += delta * (simParams.simSpeed || 1.0);

    // Leaves gentle wind rustling & photon excitement
    this.leaves.forEach(leaf => {
      const sway = Math.sin(this.time * leaf.speed + leaf.phase) * 0.04;
      leaf.mesh.position.y = leaf.baseY + sway;
      leaf.mesh.rotation.z += sway * 0.1;
    });

    // Sunbeam intensity breathing
    const rayPulse = Math.sin(this.time * 2.0) * 0.06 + 0.18;
    this.godRays.forEach(ray => {
      ray.material.opacity = rayPulse * (simParams.lightIntensity || 1.0);
    });
  }
}
