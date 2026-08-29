import * as THREE from 'three';
import { GeometryBuilder } from '../procedural/GeometryBuilder.js';

/**
 * RuBisCO Enzyme & Calvin Cycle Model (Level 4: Stroma Biochemical Dark Reactions)
 * 
 * 4 Biochemical Reaction Phases:
 * 1. Carbon Fixation: RuBisCO carboxylates RuBP (5C) + CO2 ➔ 2x 3-PGA (3C)
 * 2. Reduction: 3-PGA + ATP + NADPH ➔ G3P (triose phosphate)
 * 3. Sugar Export: G3P ➔ Glucose (C6H12O6) & Starch storage grains
 * 4. RuBP Regeneration: G3P + ATP ➔ RuBP (5C) to reset cycle
 */
export class CalvinCycleModel {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.group.position.set(options.x || 210, options.y || 0, options.z || 0);

    this.time = 0;
    this.orbitingNodes = [];
    this.rubiscoSubunits = [];

    this.buildRuBisCOEnzyme();
    this.buildCycleRibbon();
    this.buildReactionNodes();
    this.buildGlucoseStarchDepot();
  }

  buildRuBisCOEnzyme() {
    const rubiscoGroup = new THREE.Group();
    rubiscoGroup.position.set(0, 0, 0);

    // RuBisCO L8S8 Complex (8 Large subunits + 8 Small subunits)
    const largeSubMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.35 }); // Purple large subunits (L)
    const smallSubMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.3 });  // Lavender small subunits (S)

    // Top tier (4 Large + 4 Small)
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      // Large subunit
      const lSub = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 16), largeSubMat);
      lSub.position.set(Math.cos(angle) * 1.8, 0.9, Math.sin(angle) * 1.8);
      lSub.scale.set(1.1, 1.3, 1.1);
      rubiscoGroup.add(lSub);
      this.rubiscoSubunits.push(lSub);

      // Small subunit on top pole
      const sSub = new THREE.Mesh(new THREE.SphereGeometry(0.65, 14, 14), smallSubMat);
      sSub.position.set(Math.cos(angle + 0.35) * 1.5, 2.2, Math.sin(angle + 0.35) * 1.5);
      rubiscoGroup.add(sSub);
      this.rubiscoSubunits.push(sSub);
    }

    // Bottom tier (4 Large + 4 Small)
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
      // Large subunit
      const lSub = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 16), largeSubMat);
      lSub.position.set(Math.cos(angle) * 1.8, -0.9, Math.sin(angle) * 1.8);
      lSub.scale.set(1.1, 1.3, 1.1);
      rubiscoGroup.add(lSub);
      this.rubiscoSubunits.push(lSub);

      // Small subunit on bottom pole
      const sSub = new THREE.Mesh(new THREE.SphereGeometry(0.65, 14, 14), smallSubMat);
      sSub.position.set(Math.cos(angle + 0.35) * 1.5, -2.2, Math.sin(angle + 0.35) * 1.5);
      rubiscoGroup.add(sSub);
      this.rubiscoSubunits.push(sSub);
    }

    // Active Catalytic Site Indicator (Mg2+ / Carbamylated Lysine)
    const activeSiteGeo = new THREE.SphereGeometry(0.4, 10, 10);
    const activeSiteMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.3;
      const site = new THREE.Mesh(activeSiteGeo, activeSiteMat);
      site.position.set(Math.cos(angle) * 2.4, 0, Math.sin(angle) * 2.4);
      rubiscoGroup.add(site);
    }

    this.group.add(rubiscoGroup);
    this.rubiscoGroup = rubiscoGroup;
  }

  buildCycleRibbon() {
    // Glowing circular biochemical pathway ribbon
    const ringGeo = new THREE.TorusGeometry(8.5, 0.18, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.5;
    this.group.add(ring);
  }

  buildReactionNodes() {
    // 4 Key Reaction Nodes spaced around the circular pathway
    const nodes = [
      {
        name: 'Phase 1: Carbon Fixation',
        angle: 0,
        color: 0x38bdf8,
        label: 'CO₂ + RuBP ➔ 2x 3-PGA',
        scale: 1.4
      },
      {
        name: 'Phase 2: Reduction Phase',
        angle: Math.PI * 0.5,
        color: 0x10b981,
        label: '3-PGA + ATP + NADPH ➔ G3P',
        scale: 1.3
      },
      {
        name: 'Phase 3: Glucose Assembly',
        angle: Math.PI,
        color: 0xec4899,
        label: '2x G3P ➔ Glucose (C₆H₁₂O₆)',
        scale: 1.5
      },
      {
        name: 'Phase 4: RuBP Regeneration',
        angle: Math.PI * 1.5,
        color: 0xf97316,
        label: '5x G3P + ATP ➔ 3x RuBP',
        scale: 1.3
      }
    ];

    nodes.forEach((node) => {
      const nodeGroup = new THREE.Group();
      const posX = Math.cos(node.angle) * 8.5;
      const posZ = Math.sin(node.angle) * 8.5;
      nodeGroup.position.set(posX, 0, posZ);

      // Glowing Node Sphere
      const sphereMat = new THREE.MeshStandardMaterial({
        color: node.color,
        roughness: 0.2,
        emissive: node.color,
        emissiveIntensity: 0.5
      });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.85 * node.scale, 16, 16), sphereMat);
      nodeGroup.add(sphere);

      // Orbiting reactant satellites
      for (let s = 0; s < 3; s++) {
        const sat = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        sat.position.set(Math.cos(s * 2.1) * 1.6, Math.sin(s * 2.1) * 0.8, 0);
        nodeGroup.add(sat);
      }

      this.group.add(nodeGroup);
      this.orbitingNodes.push({ group: nodeGroup, baseAngle: node.angle });
    });
  }

  buildGlucoseStarchDepot() {
    // 3D Glucose Ring & Starch Granule storage depot off to the side (Phase 3 exit)
    const depotGroup = new THREE.Group();
    depotGroup.position.set(-14, 0, 0);

    // Glucose Pyranose Ring Model (6-membered chair conformation)
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3 });
    const ringCenter = new THREE.Group();

    for (let c = 0; c < 6; c++) {
      const angle = (c / 6) * Math.PI * 2;
      const carbon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), ringMat);
      const isOxygen = c === 5;
      if (isOxygen) {
        carbon.material = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
      }
      carbon.position.set(Math.cos(angle) * 1.2, (c % 2) * 0.4 - 0.2, Math.sin(angle) * 1.2);
      ringCenter.add(carbon);
    }
    depotGroup.add(ringCenter);

    // Giant Starch Storage Grain (branched polymer depot)
    const starchMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.4 });
    const starchGrain = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 2), starchMat);
    starchGrain.position.set(-3.5, 0, -2.0);
    starchGrain.scale.set(1.4, 1.0, 1.2);
    depotGroup.add(starchGrain);

    this.group.add(depotGroup);
    this.depotGroup = depotGroup;
  }

  update(delta, simParams = {}) {
    const speed = 1.0 * (simParams.simSpeed || 1.0) * (simParams.co2Level || 1.0);
    this.time += delta * speed;

    // Slow organic rotation of RuBisCO macromolecule
    if (this.rubiscoGroup) {
      this.rubiscoGroup.rotation.y = this.time * 0.3;
    }

    // Gentle breathing of reaction nodes
    this.orbitingNodes.forEach((node, idx) => {
      const pulse = Math.sin(this.time * 2.0 + idx) * 0.1 + 1.0;
      node.group.scale.setScalar(pulse);
    });

    if (this.depotGroup) {
      this.depotGroup.rotation.y = this.time * 0.2;
    }
  }
}
