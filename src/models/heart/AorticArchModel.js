import * as THREE from 'three';

/**
 * Stage 9: Aortic Valve, Sinuses of Valsalva & Aortic Arch Model
 * Features:
 * - 3 semilunar aortic cusps seated in aortic root
 * - Sinuses of Valsalva with Left & Right Coronary Artery Ostia
 * - Ascending Aorta, curved Aortic Arch, and Descending Thoracic Aorta
 * - Three major arch branches:
 *   1. Brachiocephalic Trunk
 *   2. Left Common Carotid Artery
 *   3. Left Subclavian Artery
 * - Powerful systemic ejection jet of arterial blood cells
 */
export class AorticArchModel {
  constructor(pos = { x: 105, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(pos.x, pos.y, pos.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.time = 0;
    this.initModel();
  }

  initModel() {
    // 1. Ascending Aorta, Aortic Arch, and Descending Aorta
    this.aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -4.5, 0),        // Aortic root / LV outflow
      new THREE.Vector3(0, -1.0, 0.4),       // Ascending aorta
      new THREE.Vector3(0.5, 2.8, 0.2),      // Peak of ascending aorta
      new THREE.Vector3(-0.8, 4.5, -0.4),    // Crest of aortic arch
      new THREE.Vector3(-2.8, 3.2, -1.2),    // Arch turning postero-inferiorly
      new THREE.Vector3(-3.2, -3.5, -1.8)    // Descending thoracic aorta
    ]);
    const aortaGeo = new THREE.TubeGeometry(this.aortaCurve, 40, 1.4, 20, false);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.32,
      metalness: 0.25,
      transparent: true,
      opacity: 0.86,
      side: THREE.DoubleSide,
      emissive: 0x991b1b,
      emissiveIntensity: 0.35
    });
    this.aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    this.inspectPivot.add(this.aortaMesh);

    // 2. Sinuses of Valsalva Bulges at base
    const sinusGeo = new THREE.SphereGeometry(1.65, 20, 16);
    const sinusMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35, transparent: true, opacity: 0.8 });
    this.sinusMesh = new THREE.Mesh(sinusGeo, sinusMat);
    this.sinusMesh.position.set(0, -3.6, 0.1);
    this.sinusMesh.scale.set(1.1, 0.8, 1.1);
    this.inspectPivot.add(this.sinusMesh);

    // 3. Coronary Artery Ostia (Left and Right coronary artery origins)
    const lcaCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.8, -3.5, 1.2), new THREE.Vector3(2.5, -3.8, 2.0)]);
    const lcaGeo = new THREE.TubeGeometry(lcaCurve, 12, 0.35, 12, false);
    const coronaryMat = new THREE.MeshStandardMaterial({ color: 0xf87171, roughness: 0.3 });
    this.lcaMesh = new THREE.Mesh(lcaGeo, coronaryMat);
    this.inspectPivot.add(this.lcaMesh);

    const rcaCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.8, -3.5, 1.2), new THREE.Vector3(-2.5, -3.8, 1.8)]);
    const rcaGeo = new THREE.TubeGeometry(rcaCurve, 12, 0.35, 12, false);
    this.rcaMesh = new THREE.Mesh(rcaGeo, coronaryMat);
    this.inspectPivot.add(this.rcaMesh);

    // 4. Three Great Arch Arterial Branches
    this.branchCurves = [
      // Brachiocephalic Trunk (Innominate)
      new THREE.CatmullRomCurve3([new THREE.Vector3(0.3, 3.8, 0.0), new THREE.Vector3(1.2, 6.2, 0.4)]),
      // Left Common Carotid Artery
      new THREE.CatmullRomCurve3([new THREE.Vector3(-0.6, 4.4, -0.2), new THREE.Vector3(-0.6, 6.5, 0.0)]),
      // Left Subclavian Artery
      new THREE.CatmullRomCurve3([new THREE.Vector3(-1.6, 4.2, -0.5), new THREE.Vector3(-2.4, 6.2, -0.6)])
    ];

    this.branchCurves.forEach(bCurve => {
      const bGeo = new THREE.TubeGeometry(bCurve, 16, 0.52, 12, false);
      const bMesh = new THREE.Mesh(bGeo, aortaMat);
      this.inspectPivot.add(bMesh);
    });

    // 5. High-Velocity Ejection Erythrocytes Jetting Through Aorta
    const count = 110;
    const rbcGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12);
    const rbcMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25, emissive: 0xb91c1c, emissiveIntensity: 0.6 });
    this.rbcInst = new THREE.InstancedMesh(rbcGeo, rbcMat, count);
    this.rbcData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const goesToBranch = Math.random() < 0.35;
      const branchIdx = Math.floor(Math.random() * 3);
      const t = Math.random();
      const pos = goesToBranch ? this.branchCurves[branchIdx].getPoint(t) : this.aortaCurve.getPoint(t);

      this.rbcData.push({
        goesToBranch,
        curve: goesToBranch ? this.branchCurves[branchIdx] : this.aortaCurve,
        t,
        speed: THREE.MathUtils.randFloat(0.4, 0.8)
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

    // Systolic pulse pressure wave (120/80 mmHg pulse)
    const wave = Math.pow(Math.max(0, Math.sin(this.time * freq)), 5);
    const expansion = 1.0 + wave * 0.09;
    this.aortaMesh.scale.set(expansion, 1.0, expansion);

    // Fast-flowing blood cells through arch and head branches
    if (this.rbcInst) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.rbcData.length; i++) {
        const d = this.rbcData[i];
        d.t += d.speed * delta * (1.0 + wave * 2.0);
        if (d.t > 1.0) d.t = 0.0;

        const pt = d.curve.getPoint(d.t);
        dummy.position.copy(pt);
        dummy.rotation.x += delta * 3.5;
        dummy.rotation.y += delta * 2.2;
        dummy.updateMatrix();
        this.rbcInst.setMatrixAt(i, dummy.matrix);
      }
      this.rbcInst.instanceMatrix.needsUpdate = true;
    }
  }
}
