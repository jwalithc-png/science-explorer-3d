import * as THREE from 'three';

/**
 * Stage 3: Acrosome Reaction & Membrane Fusion Model
 * High-magnification view of the sperm head penetrating the Zona Pellucida,
 * releasing acrosomal enzymes (hyaluronidase/acrosin), and docking via Izumo1-Juno receptors.
 */
export class AcrosomeFusionModel {
  constructor(position = { x: -30, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(position.x, position.y, position.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.initZonaMatrixSection();
    this.initOolemmaMembrane();
    this.initPenetratingSperm();
    this.initEnzymeParticles();
    this.initIzumoJunoReceptors();
  }

  initZonaMatrixSection() {
    // Cross-section of the porous Zona Pellucida glycoprotein mesh (ZP1-ZP4 network)
    const zpGeo = new THREE.BoxGeometry(16, 2.2, 8);
    const zpMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.55,
      emissive: 0xe11d48,
      emissiveIntensity: 0.2
    });

    this.zpMesh = new THREE.Mesh(zpGeo, zpMat);
    this.zpMesh.position.set(0, 3.2, 0);
    this.inspectPivot.add(this.zpMesh);

    // Glycoprotein mesh grid lines (ZP filaments)
    const grid = new THREE.GridHelper(16, 20, 0xf43f5e, 0xfda4af);
    grid.position.set(0, 3.2, 0);
    this.inspectPivot.add(grid);
  }

  initOolemmaMembrane() {
    // Egg Plasma Membrane (Oolemma) with microvilli folds
    const oolGeo = new THREE.BoxGeometry(16, 1.2, 8);
    const oolMat = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      roughness: 0.6,
      emissive: 0x881337,
      emissiveIntensity: 0.4
    });
    this.oolMesh = new THREE.Mesh(oolGeo, oolMat);
    this.oolMesh.position.set(0, -1.8, 0);
    this.inspectPivot.add(this.oolMesh);

    // Oocyte Microvilli finger-like projections
    const microvilliCount = 40;
    const mvGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.8, 8);
    const mvMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 });
    this.mvMesh = new THREE.InstancedMesh(mvGeo, mvMat, microvilliCount);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < microvilliCount; i++) {
      const x = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 6;
      dummy.position.set(x, -1.0, z);
      dummy.rotation.set((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4);
      dummy.updateMatrix();
      this.mvMesh.setMatrixAt(i, dummy.matrix);
    }
    this.mvMesh.instanceMatrix.needsUpdate = true;
    this.inspectPivot.add(this.mvMesh);
  }

  initPenetratingSperm() {
    // Single winner sperm actively penetrating through the zona tunnel
    this.sperm = new THREE.Group();
    this.sperm.position.set(0, 1.5, 0);
    this.sperm.rotation.z = -Math.PI * 0.5; // Head pointing downward into oolemma

    // Head
    const headGeo = new THREE.SphereGeometry(1.0, 24, 20);
    headGeo.scale(1.4, 0.9, 0.6);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.3,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3
    });
    this.spermHead = new THREE.Mesh(headGeo, headMat);
    this.sperm.add(this.spermHead);

    // Rupturing Acrosome Vesicle (Acrosome Reaction in progress)
    const acroGeo = new THREE.SphereGeometry(1.02, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
    acroGeo.scale(1.42, 0.92, 0.62);
    const acroMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.2,
      emissive: 0xeab308,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.75
    });
    this.acroCap = new THREE.Mesh(acroGeo, acroMat);
    this.acroCap.position.set(0.2, 0, 0);
    this.sperm.add(this.acroCap);

    // Midpiece
    const midGeo = new THREE.CylinderGeometry(0.3, 0.28, 1.6, 16);
    const midMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.5 });
    const mid = new THREE.Mesh(midGeo, midMat);
    mid.rotation.z = Math.PI * 0.5;
    mid.position.set(-1.4, 0, 0);
    this.sperm.add(mid);

    // Flagellum
    const tailPoints = [];
    for (let i = 0; i < 20; i++) {
      tailPoints.push(new THREE.Vector3(-2.2 - i * 0.4, Math.sin(i * 0.8) * 0.4, 0));
    }
    const tailGeo = new THREE.BufferGeometry().setFromPoints(tailPoints);
    const tailMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    this.tail = new THREE.Line(tailGeo, tailMat);
    this.sperm.add(this.tail);

    this.inspectPivot.add(this.sperm);
  }

  initEnzymeParticles() {
    // Acrosin & Hyaluronidase proteolytic enzyme vesicles dissolving the Zona
    const enzCount = 120;
    const enzGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(enzCount * 3);
    const colors = new Float32Array(enzCount * 3);

    for (let i = 0; i < enzCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = 1.0 + Math.random() * 2.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;

      // Enzyme glowing yellow/green
      colors[i * 3] = 0.98;
      colors[i * 3 + 1] = 0.85;
      colors[i * 3 + 2] = 0.15;
    }

    enzGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    enzGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const enzMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.enzymePoints = new THREE.Points(enzGeo, enzMat);
    this.inspectPivot.add(this.enzymePoints);
  }

  initIzumoJunoReceptors() {
    // Molecular Lock-and-Key: Izumo1 (Cyan sperm protein) and Juno (Ruby egg receptor)
    this.receptorGroup = new THREE.Group();
    this.receptorGroup.position.set(0, -1.0, 0);

    const receptorCount = 12;
    for (let i = 0; i < receptorCount; i++) {
      const pair = new THREE.Group();
      pair.position.set((i - receptorCount / 2) * 0.8, 0, (Math.random() - 0.5) * 1.5);

      // Juno Receptor (Egg side - Red/Pink cup)
      const junoGeo = new THREE.CylinderGeometry(0.12, 0.06, 0.35, 8);
      const junoMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xdb2777, emissiveIntensity: 0.6 });
      const juno = new THREE.Mesh(junoGeo, junoMat);
      juno.position.set(0, -0.15, 0);
      pair.add(juno);

      // Izumo1 Protein (Sperm side - Cyan key)
      const izumoGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const izumoMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 0.8 });
      const izumo = new THREE.Mesh(izumoGeo, izumoMat);
      izumo.position.set(0, 0.1, 0);
      pair.add(izumo);

      this.receptorGroup.add(pair);
    }
    this.inspectPivot.add(this.receptorGroup);
  }

  update(delta, params = {}) {
    const time = performance.now() * 0.001;

    // 1. Auto 360° Turntable Rotation
    if (params.autoRotate360) {
      this.inspectPivot.rotation.y += delta * (params.rotationSpeed360 || 0.5);
    }

    // 2. Hyperactivation drilling motion of the penetrating sperm
    const speed = (params.simSpeed || 1.0) * (params.spermMotilitySpeed || 1.0);
    this.sperm.position.y = 1.2 + Math.sin(time * 8.0 * speed) * 0.15;
    this.sperm.rotation.x = Math.sin(time * 12.0 * speed) * 0.12;

    // 3. Enzyme bubble fluctuation
    const pos = this.enzymePoints.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] -= 0.8 * delta * speed;
      if (pos[i + 1] < 0.5) pos[i + 1] = 3.5;
    }
    this.enzymePoints.geometry.attributes.position.needsUpdate = true;
  }
}
