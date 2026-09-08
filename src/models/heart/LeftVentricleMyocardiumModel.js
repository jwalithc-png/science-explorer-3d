import * as THREE from 'three';

/**
 * Stage 8: Left Ventricle & Thick Myocardium Model
 * Features:
 * - Thick-walled conical muscular chamber (11 mm myocardium)
 * - Helical spiral myofibril striation bands (wringing towel contraction)
 * - Apex of the heart geometry
 * - Intense high-pressure systolic contraction generating 120 mmHg
 * - Swirling high-velocity oxygenated blood cells
 */
export class LeftVentricleMyocardiumModel {
  constructor(pos = { x: 75, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(pos.x, pos.y, pos.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.time = 0;
    this.initModel();
  }

  initModel() {
    // 1. Thick Conical Myocardial Chamber Shell (Cutaway to reveal thick wall)
    const lvGeo = new THREE.ConeGeometry(3.6, 7.8, 32, 16, true, 0, Math.PI * 1.5);
    lvGeo.rotateX(Math.PI);
    const lvMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.45,
      metalness: 0.18,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.82,
      emissive: 0x991b1b,
      emissiveIntensity: 0.40
    });
    this.lvMesh = new THREE.Mesh(lvGeo, lvMat);
    this.inspectPivot.add(this.lvMesh);

    // 2. Thick Outer Epicardial Layer to illustrate 11 mm wall thickness
    const epicardGeo = new THREE.ConeGeometry(4.2, 8.2, 32, 16, true, 0, Math.PI * 1.5);
    epicardGeo.rotateX(Math.PI);
    const epicardMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      roughness: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45
    });
    this.epicardMesh = new THREE.Mesh(epicardGeo, epicardMat);
    this.inspectPivot.add(this.epicardMesh);

    // 3. Helical Myofibril Bands (Spiral muscle fibers demonstrating wringing motion)
    this.helicalBands = new THREE.Group();
    const bandMat = new THREE.LineBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.75 });
    for (let b = 0; b < 16; b++) {
      const startAngle = (b / 16) * Math.PI * 2;
      const pts = [];
      for (let s = 0; s <= 30; s++) {
        const t = s / 30.0;
        const y = 3.5 - t * 7.5;
        const r = (1.0 - t * 0.85) * 3.8;
        const angle = startAngle + t * Math.PI * 1.8;
        pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
      }
      const bGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const bLine = new THREE.Line(bGeo, bandMat);
      this.helicalBands.add(bLine);
    }
    this.inspectPivot.add(this.helicalBands);

    // 4. Cardiac Apex (Pointed bottom tip of the heart)
    const apexGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const apexMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 });
    this.apexMesh = new THREE.Mesh(apexGeo, apexMat);
    this.apexMesh.position.set(0, -4.2, 0);
    this.inspectPivot.add(this.apexMesh);

    // 5. Swirling High-Velocity Erythrocytes Inside Left Ventricle
    const count = 100;
    const rbcGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12);
    const rbcMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25, emissive: 0xdc2626, emissiveIntensity: 0.55 });
    this.rbcInst = new THREE.InstancedMesh(rbcGeo, rbcMat, count);
    this.rbcData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const y = THREE.MathUtils.randFloat(-3.8, 3.2);
      const frac = (y + 4.0) / 7.2;
      const maxR = (1.0 - (1.0 - frac) * 0.8) * 2.8;
      const r = THREE.MathUtils.randFloat(0.2, maxR);
      const theta = Math.random() * Math.PI * 2;

      this.rbcData.push({
        y, r, theta,
        vy: THREE.MathUtils.randFloat(3.5, 6.5),
        omega: THREE.MathUtils.randFloat(3.0, 5.5)
      });
      dummy.position.set(Math.cos(theta) * r, y, Math.sin(theta) * r);
      dummy.updateMatrix();
      this.rbcInst.setMatrixAt(i, dummy.matrix);
    }
    this.inspectPivot.add(this.rbcInst);
  }

  update(delta, params = {}) {
    const hr = params.heartRateBPM || 75;
    const freq = (hr / 60) * Math.PI * 2;
    this.time += delta;

    // Powerful Systolic Squeeze (Isovolumetric contraction + ejection)
    const systole = Math.pow(Math.max(0, Math.sin(this.time * freq)), 4);

    // Radial contraction + longitudinal apex wringing
    const radScale = 1.0 - systole * 0.18;
    const twistAngle = systole * 0.22; // Towel-wringing torsion
    this.lvMesh.scale.set(radScale, 1.0 + systole * 0.06, radScale);
    this.lvMesh.rotation.y = twistAngle;
    this.helicalBands.rotation.y = twistAngle * 1.5;

    // Swirling high-velocity vortex of oxygenated cells
    if (this.rbcInst) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.rbcData.length; i++) {
        const d = this.rbcData[i];
        d.theta += d.omega * delta * (1.0 + systole * 2.2);
        d.y += d.vy * delta * (1.0 + systole * 1.8);
        if (d.y > 3.4) {
          d.y = -3.8;
        }

        const frac = (d.y + 4.0) / 7.2;
        const curR = d.r * radScale * (0.2 + frac * 0.8);
        dummy.position.set(Math.cos(d.theta) * curR, d.y, Math.sin(d.theta) * curR);
        dummy.rotation.x += delta * 3.5;
        dummy.rotation.y += delta * 2.0;
        dummy.updateMatrix();
        this.rbcInst.setMatrixAt(i, dummy.matrix);
      }
      this.rbcInst.instanceMatrix.needsUpdate = true;
    }
  }
}
