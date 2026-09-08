import * as THREE from 'three';

/**
 * Stage 2: Right Atrium & Tricuspid Valve Model
 * Features:
 * - Transparent chamber cutaway of the Right Atrium
 * - Pectinate muscles and oval fossa (Fossa Ovalis)
 * - 3 fibrous Tricuspid Valve leaflets that dynamically flap open (diastole) and close (systole)
 * - Taut fibrous Chordae Tendineae anchored to 3 Papillary Muscles
 * - Flowing venous erythrocytes passing through valve orifice
 */
export class RightAtriumTricuspidModel {
  constructor(pos = { x: -105, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(pos.x, pos.y, pos.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.time = 0;
    this.initModel();
  }

  initModel() {
    // 1. Right Atrium Chamber Cutaway (Hemisphere with opening for inspection)
    const atriumGeo = new THREE.SphereGeometry(3.5, 32, 24, 0, Math.PI * 1.5, 0, Math.PI);
    const atriumMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.4,
      metalness: 0.15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72,
      emissive: 0x1e40af,
      emissiveIntensity: 0.35
    });
    this.atriumMesh = new THREE.Mesh(atriumGeo, atriumMat);
    this.inspectPivot.add(this.atriumMesh);

    // 2. Pectinate Muscle Ridges (Comb-like internal muscular ridges)
    const pectinateGroup = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const ridgeGeo = new THREE.TorusGeometry(3.2, 0.12, 8, 24, Math.PI * 0.75);
      const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 });
      const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
      ridge.position.set(0, -1.8 + i * 0.45, 0);
      ridge.rotation.x = Math.PI * 0.5 + (i * 0.08);
      pectinateGroup.add(ridge);
    }
    this.inspectPivot.add(pectinateGroup);

    // 3. Fossa Ovalis (Central oval depression on interatrial septum)
    const fossaGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.15, 24);
    const fossaMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      roughness: 0.25,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.4
    });
    this.fossaOvalis = new THREE.Mesh(fossaGeo, fossaMat);
    this.fossaOvalis.position.set(-2.2, 0.5, 0.2);
    this.fossaOvalis.rotation.z = Math.PI * 0.45;
    this.inspectPivot.add(this.fossaOvalis);

    // 4. Tricuspid Valve Fibrous Annulus Ring
    const annulusGeo = new THREE.TorusGeometry(1.7, 0.18, 16, 32);
    const annulusMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.4 });
    this.valveAnnulus = new THREE.Mesh(annulusGeo, annulusMat);
    this.valveAnnulus.position.set(0, -2.4, 0);
    this.valveAnnulus.rotation.x = Math.PI * 0.5;
    this.inspectPivot.add(this.valveAnnulus);

    // 5. Three Valve Leaflets (Anterior, Posterior, Septal)
    this.leaflets = [];
    const leafletMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.25,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88
    });

    for (let k = 0; k < 3; k++) {
      const angle = (k / 3) * Math.PI * 2;
      const leafGeo = new THREE.ConeGeometry(0.95, 1.4, 16, 1, true);
      leafGeo.rotateX(Math.PI);
      const leaf = new THREE.Mesh(leafGeo, leafletMat);
      leaf.position.set(Math.cos(angle) * 0.85, -2.5, Math.sin(angle) * 0.85);
      leaf.rotation.y = angle;
      this.leaflets.push(leaf);
      this.inspectPivot.add(leaf);
    }

    // 6. Chordae Tendineae (Fibrous Strings)
    this.chordaeGroup = new THREE.Group();
    const chordMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    for (let c = 0; c < 12; c++) {
      const topAngle = (c / 12) * Math.PI * 2;
      const topPos = new THREE.Vector3(Math.cos(topAngle) * 1.1, -2.8, Math.sin(topAngle) * 1.1);
      const botPos = new THREE.Vector3(Math.cos(topAngle) * 0.4, -4.5, Math.sin(topAngle) * 0.4);
      const geo = new THREE.BufferGeometry().setFromPoints([topPos, botPos]);
      const line = new THREE.Line(geo, chordMat);
      this.chordaeGroup.add(line);
    }
    this.inspectPivot.add(this.chordaeGroup);

    // 7. Papillary Muscles (3 conical muscle anchors)
    for (let p = 0; p < 3; p++) {
      const pAngle = (p / 3) * Math.PI * 2;
      const pGeo = new THREE.ConeGeometry(0.45, 1.6, 16);
      const pMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(Math.cos(pAngle) * 0.6, -4.8, Math.sin(pAngle) * 0.6);
      this.inspectPivot.add(pMesh);
    }

    // 8. Flowing Erythrocytes through Valve
    const count = 75;
    const rbcGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12);
    const rbcMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, emissive: 0x1d4ed8, emissiveIntensity: 0.4 });
    this.rbcMesh = new THREE.InstancedMesh(rbcGeo, rbcMat, count);
    this.rbcData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const y = THREE.MathUtils.randFloat(-5.0, 2.5);
      const r = THREE.MathUtils.randFloat(0.1, 1.2);
      const theta = Math.random() * Math.PI * 2;
      this.rbcData.push({
        y, r, theta,
        speed: THREE.MathUtils.randFloat(2.5, 5.0)
      });
      dummy.position.set(Math.cos(theta) * r, y, Math.sin(theta) * r);
      dummy.updateMatrix();
      this.rbcMesh.setMatrixAt(i, dummy.matrix);
    }
    this.inspectPivot.add(this.rbcMesh);
  }

  update(delta, params = {}) {
    const hr = params.heartRateBPM || 75;
    const freq = (hr / 60) * Math.PI * 2;
    this.time += delta;

    // Cardiac cycle phase: Diastole (valves open) vs Systole (valves close)
    const cycle = (Math.sin(this.time * freq) + 1.0) * 0.5; // 0 to 1
    const isOpen = cycle > 0.45;

    // Flap valve leaflets open and close
    const flapAngle = isOpen ? 0.35 : 0.05;
    this.leaflets.forEach((leaf, idx) => {
      leaf.scale.set(1.0, 1.0, isOpen ? 0.65 : 1.15);
      leaf.rotation.x = flapAngle;
    });

    // Atrium contraction pulsation
    const pScale = 1.0 + Math.sin(this.time * freq) * 0.04;
    this.atriumMesh.scale.set(pScale, pScale, pScale);

    // Animate downward flowing blood cells
    if (this.rbcMesh) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.rbcData.length; i++) {
        const d = this.rbcData[i];
        d.y -= d.speed * delta;
        if (d.y < -5.2) d.y = 2.5;

        dummy.position.set(Math.cos(d.theta) * d.r, d.y, Math.sin(d.theta) * d.r);
        dummy.rotation.x += delta * 2.0;
        dummy.updateMatrix();
        this.rbcMesh.setMatrixAt(i, dummy.matrix);
      }
      this.rbcMesh.instanceMatrix.needsUpdate = true;
    }
  }
}
