import * as THREE from 'three';

/**
 * Stage 4: Pulmonary Valve & Trunk Model
 * Features:
 * - 3 semilunar cusps opening under systolic pressure without chordae
 * - Main Pulmonary Trunk bifurcating into Left and Right Pulmonary Arteries
 * - Elastic arterial Windkessel expansion during systolic ejection
 * - High-speed jet of venous blood cells flowing to the lungs
 */
export class PulmonaryArteryModel {
  constructor(pos = { x: -45, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(pos.x, pos.y, pos.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.time = 0;
    this.initModel();
  }

  initModel() {
    // 1. Main Pulmonary Trunk (Short wide arterial conduit)
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -4.5, 0),
      new THREE.Vector3(0, -1.0, 0.2),
      new THREE.Vector3(0, 1.8, 0)
    ]);
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 24, 1.45, 20, false);
    const artMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.35,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    this.trunkMesh = new THREE.Mesh(trunkGeo, artMat);
    this.inspectPivot.add(this.trunkMesh);

    // 2. Right Pulmonary Artery (Branches laterally to right lung)
    const rpaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.8, 0),
      new THREE.Vector3(-2.2, 3.2, -0.6),
      new THREE.Vector3(-5.5, 4.2, -1.2)
    ]);
    const rpaGeo = new THREE.TubeGeometry(rpaCurve, 24, 1.15, 16, false);
    this.rpaMesh = new THREE.Mesh(rpaGeo, artMat);
    this.inspectPivot.add(this.rpaMesh);

    // 3. Left Pulmonary Artery (Branches laterally to left lung)
    const lpaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.8, 0),
      new THREE.Vector3(2.2, 3.2, -0.4),
      new THREE.Vector3(5.5, 4.2, -0.8)
    ]);
    const lpaGeo = new THREE.TubeGeometry(lpaCurve, 24, 1.15, 16, false);
    this.lpaMesh = new THREE.Mesh(lpaGeo, artMat);
    this.inspectPivot.add(this.lpaMesh);

    // 4. Three Semilunar Cusps (Pocket-like valves at base of trunk)
    this.cusps = [];
    const cuspMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.25,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.90
    });

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const cuspGeo = new THREE.SphereGeometry(0.9, 16, 12, 0, Math.PI, 0, Math.PI * 0.5);
      const cusp = new THREE.Mesh(cuspGeo, cuspMat);
      cusp.position.set(Math.cos(angle) * 0.75, -4.2, Math.sin(angle) * 0.75);
      cusp.rotation.y = angle + Math.PI * 0.5;
      this.cusps.push(cusp);
      this.inspectPivot.add(cusp);
    }

    // 5. High-Velocity Ejection Erythrocyte Particles
    const count = 100;
    const rbcGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12);
    const rbcMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, emissive: 0x0284c7, emissiveIntensity: 0.5 });
    this.rbcInst = new THREE.InstancedMesh(rbcGeo, rbcMat, count);
    this.rbcData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const branch = Math.random() < 0.5 ? 'rpa' : 'lpa';
      const t = Math.random();
      const pos = branch === 'rpa' ? rpaCurve.getPoint(t) : lpaCurve.getPoint(t);
      this.rbcData.push({
        branch,
        t,
        speed: THREE.MathUtils.randFloat(0.35, 0.65),
        curve: branch === 'rpa' ? rpaCurve : lpaCurve
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

    // Systolic ejection surge
    const surge = Math.pow(Math.max(0, Math.sin(this.time * freq)), 6);

    // Semilunar cusps flatten against wall when open, pocket out when closed
    this.cusps.forEach(cusp => {
      cusp.scale.set(1.0 - surge * 0.5, 1.0 - surge * 0.6, 1.0 - surge * 0.5);
    });

    // Arterial Windkessel pulsation
    const exp = 1.0 + surge * 0.08;
    this.trunkMesh.scale.set(exp, 1.0, exp);

    // Animate blood cells streaming into left and right branches
    if (this.rbcInst) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.rbcData.length; i++) {
        const d = this.rbcData[i];
        d.t += d.speed * delta * (1.0 + surge * 2.0);
        if (d.t > 1.0) d.t = 0.0;

        const pt = d.curve.getPoint(d.t);
        dummy.position.copy(pt);
        dummy.rotation.x += delta * 3.0;
        dummy.rotation.z += delta * 2.0;
        dummy.updateMatrix();
        this.rbcInst.setMatrixAt(i, dummy.matrix);
      }
      this.rbcInst.instanceMatrix.needsUpdate = true;
    }
  }
}
