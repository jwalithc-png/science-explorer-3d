import * as THREE from 'three';

/**
 * Stage 1: Superior & Inferior Vena Cava Model
 * Features:
 * - Dual large venous conduit trunks (SVC and IVC) entering right atrium
 * - Deoxygenated venous blood stream with flowing cyan-blue erythrocytes
 * - Eustachian valve flap and vascular adventitial layers
 * - Central venous pressure pulsation
 */
export class VenaCavaModel {
  constructor(pos = { x: -135, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(pos.x, pos.y, pos.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.time = 0;
    this.initModel();
  }

  initModel() {
    // 1. Superior Vena Cava (Descending into right atrium)
    const svcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.5, 7.5, -0.5),
      new THREE.Vector3(-1.0, 4.0, 0.0),
      new THREE.Vector3(-0.2, 1.2, 0.2)
    ]);
    const svcGeo = new THREE.TubeGeometry(svcCurve, 32, 1.35, 20, false);
    const venousMat = new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      roughness: 0.35,
      metalness: 0.25,
      transparent: true,
      opacity: 0.88,
      emissive: 0x172554,
      emissiveIntensity: 0.35
    });
    this.svcMesh = new THREE.Mesh(svcGeo, venousMat);
    this.inspectPivot.add(this.svcMesh);

    // 2. Inferior Vena Cava (Ascending from lower body)
    const ivcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.8, -7.5, 0.2),
      new THREE.Vector3(-1.2, -3.8, 0.0),
      new THREE.Vector3(-0.2, -1.0, 0.2)
    ]);
    const ivcGeo = new THREE.TubeGeometry(ivcCurve, 32, 1.6, 20, false);
    this.ivcMesh = new THREE.Mesh(ivcGeo, venousMat);
    this.inspectPivot.add(this.ivcMesh);

    // 3. Right Atrium Inflow Chamber junction
    const raGeo = new THREE.SphereGeometry(2.4, 24, 20);
    raGeo.scale(1.2, 1.5, 1.0);
    const raMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.45,
      metalness: 0.2,
      wireframe: false,
      transparent: true,
      opacity: 0.75,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.40
    });
    this.raJunction = new THREE.Mesh(raGeo, raMat);
    this.raJunction.position.set(0.6, 0.1, 0.2);
    this.inspectPivot.add(this.raJunction);

    // 4. Eustachian Valve Flap at IVC junction
    const valveGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.08, 16, 1, false, 0, Math.PI);
    const valveMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.eustachianValve = new THREE.Mesh(valveGeo, valveMat);
    this.eustachianValve.position.set(-0.3, -1.1, 0.2);
    this.eustachianValve.rotation.x = Math.PI * 0.4;
    this.inspectPivot.add(this.eustachianValve);

    // 5. Flowing Deoxygenated Venous Erythrocytes
    const rbcCount = 120;
    const rbcGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12);
    const rbcMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.5
    });
    this.rbcInst = new THREE.InstancedMesh(rbcGeo, rbcMat, rbcCount);
    this.rbcData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < rbcCount; i++) {
      const isSVC = i < 60;
      const t = Math.random();
      const pos = isSVC ? svcCurve.getPoint(t) : ivcCurve.getPoint(t);
      const radOffset = THREE.MathUtils.randFloat(-0.6, 0.6);
      pos.x += radOffset * 0.5;
      pos.z += radOffset * 0.5;

      this.rbcData.push({
        isSVC,
        t,
        speed: THREE.MathUtils.randFloat(0.18, 0.35),
        curve: isSVC ? svcCurve : ivcCurve,
        radOffset
      });

      dummy.position.copy(pos);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      this.rbcInst.setMatrixAt(i, dummy.matrix);
    }
    this.rbcInst.instanceMatrix.needsUpdate = true;
    this.inspectPivot.add(this.rbcInst);

    // 6. Glowing Directional Inflow Flow Ring indicators
    const ringGeo = new THREE.TorusGeometry(1.4, 0.06, 12, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.65 });
    this.ringSVC = new THREE.Mesh(ringGeo, ringMat);
    this.ringSVC.position.set(-1.2, 4.5, 0.0);
    this.ringSVC.rotation.x = Math.PI * 0.5;
    this.inspectPivot.add(this.ringSVC);

    this.ringIVC = new THREE.Mesh(ringGeo, ringMat);
    this.ringIVC.position.set(-1.4, -4.5, 0.0);
    this.ringIVC.rotation.x = Math.PI * 0.5;
    this.inspectPivot.add(this.ringIVC);
  }

  update(delta, params = {}) {
    const hr = params.heartRateBPM || 75;
    const freq = (hr / 60) * Math.PI * 2;
    this.time += delta;

    const pulse = Math.sin(this.time * freq);
    const pulseFactor = 1.0 + pulse * 0.04;

    this.raJunction.scale.set(1.2 * pulseFactor, 1.5 * pulseFactor, 1.0 * pulseFactor);
    this.eustachianValve.rotation.z = Math.sin(this.time * freq) * 0.15;

    // Animate RBC flow
    if (this.rbcInst) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.rbcData.length; i++) {
        const d = this.rbcData[i];
        d.t += d.speed * delta;
        if (d.t > 1.0) d.t = 0.0;

        const pt = d.curve.getPoint(d.t);
        pt.x += d.radOffset * 0.4;
        pt.z += d.radOffset * 0.4;

        dummy.position.copy(pt);
        dummy.rotation.x += delta * 2.0;
        dummy.rotation.y += delta * 1.5;
        dummy.updateMatrix();
        this.rbcInst.setMatrixAt(i, dummy.matrix);
      }
      this.rbcInst.instanceMatrix.needsUpdate = true;
    }
  }
}
