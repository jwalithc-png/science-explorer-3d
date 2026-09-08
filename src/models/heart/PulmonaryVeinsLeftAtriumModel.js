import * as THREE from 'three';

/**
 * Stage 6: Pulmonary Veins & Left Atrium Model
 * Features:
 * - Four Pulmonary Veins (Left Superior, Left Inferior, Right Superior, Right Inferior)
 * - Smooth-walled Left Atrial chamber cutaway
 * - Left Auricular appendage volume reservoir
 * - Streams of newly oxygen-saturated scarlet arterial erythrocytes entering the chamber
 */
export class PulmonaryVeinsLeftAtriumModel {
  constructor(pos = { x: 15, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(pos.x, pos.y, pos.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.time = 0;
    this.initModel();
  }

  initModel() {
    // 1. Left Atrial Main Cavity (Hemispherical cutaway for internal view)
    const laGeo = new THREE.SphereGeometry(3.2, 32, 24, 0, Math.PI * 1.5, 0, Math.PI);
    const laMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      roughness: 0.38,
      metalness: 0.2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.76,
      emissive: 0x9f1239,
      emissiveIntensity: 0.35
    });
    this.laMesh = new THREE.Mesh(laGeo, laMat);
    this.inspectPivot.add(this.laMesh);

    // 2. Four Pulmonary Vein Conduits
    const veinMat = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      roughness: 0.35,
      metalness: 0.25,
      transparent: true,
      opacity: 0.88
    });

    this.veinCurves = [
      // Left Superior Pulmonary Vein
      new THREE.CatmullRomCurve3([new THREE.Vector3(-4.8, 3.2, -1.2), new THREE.Vector3(-2.8, 2.0, -0.6), new THREE.Vector3(-1.2, 1.2, 0.0)]),
      // Left Inferior Pulmonary Vein
      new THREE.CatmullRomCurve3([new THREE.Vector3(-4.8, -2.2, -1.2), new THREE.Vector3(-2.8, -1.2, -0.6), new THREE.Vector3(-1.2, -0.6, 0.0)]),
      // Right Superior Pulmonary Vein
      new THREE.CatmullRomCurve3([new THREE.Vector3(4.8, 3.2, -1.2), new THREE.Vector3(2.8, 2.0, -0.6), new THREE.Vector3(1.2, 1.2, 0.0)]),
      // Right Inferior Pulmonary Vein
      new THREE.CatmullRomCurve3([new THREE.Vector3(4.8, -2.2, -1.2), new THREE.Vector3(2.8, -1.2, -0.6), new THREE.Vector3(1.2, -0.6, 0.0)])
    ];

    this.veinCurves.forEach(curve => {
      const geo = new THREE.TubeGeometry(curve, 20, 0.95, 16, false);
      const mesh = new THREE.Mesh(geo, veinMat);
      this.inspectPivot.add(mesh);
    });

    // 3. Left Auricle / Appendage (Ear-shaped trabeculated pouch)
    const auricleGeo = new THREE.ConeGeometry(1.2, 2.6, 16);
    auricleGeo.rotateZ(Math.PI * 0.35);
    const auricleMat = new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.5 });
    this.auricle = new THREE.Mesh(auricleGeo, auricleMat);
    this.auricle.position.set(-2.5, 1.6, 1.2);
    this.inspectPivot.add(this.auricle);

    // 4. Inflowing Scarlet Arterial Erythrocytes
    const rbcCount = 100;
    const rbcGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12);
    const rbcMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.25,
      metalness: 0.2,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.55
    });
    this.rbcInst = new THREE.InstancedMesh(rbcGeo, rbcMat, rbcCount);
    this.rbcData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < rbcCount; i++) {
      const veinIdx = i % 4;
      const curve = this.veinCurves[veinIdx];
      const t = Math.random();
      const pos = curve.getPoint(t);

      this.rbcData.push({
        curve,
        t,
        speed: THREE.MathUtils.randFloat(0.25, 0.45)
      });
      dummy.position.copy(pos);
      dummy.updateMatrix();
      this.rbcInst.setMatrixAt(i, dummy.matrix);
    }
    this.inspectPivot.add(this.rbcInst);
  }

  update(delta, params = {}) {
    const hr = params.heartRateBPM || 75;
    const freq = (hr / 60) * Math.PI * 2;
    this.time += delta;

    // Atrial diastolic expansion and systolic booster kick
    const pScale = 1.0 + Math.sin(this.time * freq) * 0.045;
    this.laMesh.scale.set(pScale, pScale, pScale);

    // Flowing oxygen-rich blood cells
    if (this.rbcInst) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.rbcData.length; i++) {
        const d = this.rbcData[i];
        d.t += d.speed * delta;
        if (d.t > 1.0) d.t = 0.0;

        const pt = d.curve.getPoint(d.t);
        dummy.position.copy(pt);
        dummy.rotation.x += delta * 2.5;
        dummy.rotation.y += delta * 1.8;
        dummy.updateMatrix();
        this.rbcInst.setMatrixAt(i, dummy.matrix);
      }
      this.rbcInst.instanceMatrix.needsUpdate = true;
    }
  }
}
