import * as THREE from 'three';
import { createChlorophyllMaterial } from '../shaders/ChlorophyllShader.js';
import { GeometryBuilder } from '../procedural/GeometryBuilder.js';
import { TextureGenerator } from '../procedural/TextureGenerator.js';

/**
 * Plant Cell & Chloroplast Organelle Model (Level 2: Cellular & Organelle View)
 * 
 * Features:
 * 1. Plant Cell: Rigid cell wall, plasma membrane, large central vacuole
 * 2. Cytoplasmic Streaming (Cyclosis): Chloroplasts circulating around vacuole in cytoplasm
 * 3. Cutaway Chloroplast:
 *    - Outer & Inner Envelope membranes
 *    - Stroma (enzymatic alkaline fluid matrix)
 *    - Granum stacks (stacked thylakoid discs)
 *    - Stroma Lamellae / fret interconnecting conduits
 *    - Starch grains & plastoglobules
 */
export class CellChloroplastModel {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.group.position.set(options.x || 45, options.y || 0, options.z || 0);

    this.streamingChloroplasts = [];
    this.chlorophyllMaterials = [];
    this.time = 0;

    this.buildPlantCell();
    this.buildDetailedChloroplast();
  }

  buildPlantCell() {
    const cellGroup = new THREE.Group();
    cellGroup.position.set(-6, 0, 0);

    // 1. Cellulose Cell Wall (outer rigid box)
    const wallGeo = new THREE.BoxGeometry(10, 8, 8);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.6,
      wireframe: false,
      transparent: true,
      opacity: 0.4
    });
    const cellWall = new THREE.Mesh(wallGeo, wallMat);
    cellGroup.add(cellWall);

    // 2. Large Central Vacuole (occupies 80% of cell interior)
    const vacGeo = new THREE.SphereGeometry(2.8, 24, 24);
    const vacMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.85,
      opacity: 0.5,
      transparent: true,
      roughness: 0.1
    });
    const vacuole = new THREE.Mesh(vacGeo, vacMat);
    vacuole.scale.set(1.1, 1.0, 0.9);
    cellGroup.add(vacuole);

    // 3. Nucleus with chromatin
    const nucGeo = new THREE.SphereGeometry(0.9, 16, 16);
    const nucMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.4 });
    const nucleus = new THREE.Mesh(nucGeo, nucMat);
    nucleus.position.set(2.8, 1.8, 1.5);
    cellGroup.add(nucleus);

    // 4. Cytoplasmic Streaming (Cyclosis) Chloroplasts
    const chloGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const chloMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.3,
      emissive: 0x15803d,
      emissiveIntensity: 0.3
    });

    const count = 18;
    for (let i = 0; i < count; i++) {
      const chlo = new THREE.Mesh(chloGeo, chloMat);
      chlo.scale.set(1.4, 0.8, 0.9);
      cellGroup.add(chlo);

      this.streamingChloroplasts.push({
        mesh: chlo,
        angle: (i / count) * Math.PI * 2,
        orbitRadiusX: 3.6 + (Math.random() - 0.5) * 0.4,
        orbitRadiusZ: 2.8 + (Math.random() - 0.5) * 0.4,
        orbitY: (Math.random() - 0.5) * 2.5,
        speed: 0.5 + Math.random() * 0.3
      });
    }

    this.group.add(cellGroup);
  }

  buildDetailedChloroplast() {
    const chloroGroup = new THREE.Group();
    chloroGroup.position.set(6, 0, 0);

    // Outer & Inner Envelope Membrane (cutaway ellipsoid)
    const envGeo = new THREE.SphereGeometry(5.0, 32, 24, 0, Math.PI * 1.5);
    const envMat = new THREE.MeshPhysicalMaterial({
      color: 0x15803d,
      transmission: 0.65,
      opacity: 0.85,
      transparent: true,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    const envelope = new THREE.Mesh(envGeo, envMat);
    envelope.scale.set(1.4, 0.9, 1.0);
    chloroGroup.add(envelope);

    // Stroma Fluid Matrix (Inner glow plane)
    const stromaMat = new THREE.MeshBasicMaterial({
      color: 0x86efac,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const stromaDisc = new THREE.Mesh(new THREE.CircleGeometry(4.8, 32), stromaMat);
    stromaDisc.rotation.x = Math.PI * 0.5;
    chloroGroup.add(stromaDisc);

    // Thylakoid Granum Stacks (Stacks of circular discs)
    const chloShdMat = createChlorophyllMaterial({
      baseColor: '#166534',
      fluorescenceColor: '#4ade80'
    });
    this.chlorophyllMaterials.push(chloShdMat);

    const granaPositions = [
      { x: -3.0, z: -1.5, discs: 9, r: 1.1 },
      { x: -1.2, z: 1.8, discs: 11, r: 1.2 },
      { x: 1.5, z: -1.2, discs: 8, r: 1.0 },
      { x: 3.2, z: 1.5, discs: 10, r: 1.15 },
      { x: 0.2, z: -2.4, discs: 7, r: 0.95 },
      { x: -2.8, z: 2.2, discs: 8, r: 1.05 }
    ];

    granaPositions.forEach((pos) => {
      const granum = GeometryBuilder.createGranumStack(pos.discs, pos.r, 0.18, chloShdMat);
      granum.position.set(pos.x, 0, pos.z);
      chloroGroup.add(granum);
    });

    // Stroma Lamellae / Fret channels (tubular bridges connecting granum stacks)
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.4
    });

    for (let i = 0; i < granaPositions.length - 1; i++) {
      const p1 = granaPositions[i];
      const p2 = granaPositions[i + 1];

      const v1 = new THREE.Vector3(p1.x, 0, p1.z);
      const v2 = new THREE.Vector3(p2.x, 0, p2.z);
      const dist = v1.distanceTo(v2);

      const lamellaGeo = new THREE.BoxGeometry(0.3, 0.08, dist);
      const lamella = new THREE.Mesh(lamellaGeo, bridgeMat);
      lamella.position.copy(v1.clone().lerp(v2, 0.5));
      lamella.lookAt(v2);
      chloroGroup.add(lamella);
    }

    // Starch Grains & Plastoglobules (lipid droplets)
    const starchMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.2 });
    const lipidMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });

    for (let i = 0; i < 6; i++) {
      // Starch storage
      const starch = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), starchMat);
      starch.scale.set(1.5, 0.8, 1.0);
      starch.position.set((Math.random() - 0.5) * 4.0, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 3.0);
      chloroGroup.add(starch);

      // Plastoglobule
      const plasto = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), lipidMat);
      plasto.position.set((Math.random() - 0.5) * 5.0, (Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 3.5);
      chloroGroup.add(plasto);
    }

    this.group.add(chloroGroup);
  }

  update(delta, simParams = {}) {
    this.time += delta * (simParams.simSpeed || 1.0);

    // Cytoplasmic Streaming (Cyclosis) animation
    this.streamingChloroplasts.forEach((item) => {
      item.angle += delta * item.speed * 0.8 * (simParams.simSpeed || 1.0);
      item.mesh.position.x = Math.cos(item.angle) * item.orbitRadiusX;
      item.mesh.position.z = Math.sin(item.angle) * item.orbitRadiusZ;
      item.mesh.position.y = item.orbitY + Math.sin(item.angle * 2.0) * 0.3;
      item.mesh.rotation.y = item.angle + Math.PI * 0.5;
    });

    // Update chlorophyll shader uniforms
    this.chlorophyllMaterials.forEach((mat) => {
      if (mat.uniforms && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = this.time;
        mat.uniforms.uLightIntensity.value = simParams.lightIntensity || 1.0;
      }
    });
  }
}
