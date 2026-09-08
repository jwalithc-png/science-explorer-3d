import * as THREE from 'three';

/**
 * Stage 3: Right Ventricle & Trabeculae Model
 * Features:
 * - Crescent-shaped anatomical muscular chamber
 * - Muscular columns (Trabeculae Carneae) lining the interior
 * - Moderator Band (Septomarginal Trabecula) spanning septum to anterior wall with electrical pulse
 * - Conus Arteriosus (Infundibulum) funnel leading upward to pulmonary trunk
 * - Systolic ejection pumping animation
 */
export class RightVentricleModel {
  constructor(pos = { x: -75, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(pos.x, pos.y, pos.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.time = 0;
    this.initModel();
  }

  initModel() {
    // 1. Crescent Muscular Ventricle Chamber (Outer shell cutaway)
    const rvShape = new THREE.Shape();
    rvShape.moveTo(-2.5, -4.5);
    rvShape.quadraticCurveTo(-4.0, 0, -2.0, 3.5);
    rvShape.quadraticCurveTo(1.5, 3.8, 2.8, 1.2);
    rvShape.quadraticCurveTo(3.2, -2.5, -2.5, -4.5);

    const extrudeSettings = { depth: 3.2, bevelEnabled: true, bevelSegments: 6, steps: 4, bevelSize: 0.4, bevelThickness: 0.4 };
    const rvGeo = new THREE.ExtrudeGeometry(rvShape, extrudeSettings);
    const rvMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.5,
      metalness: 0.2,
      transparent: true,
      opacity: 0.76,
      side: THREE.DoubleSide,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35
    });
    this.rvMesh = new THREE.Mesh(rvGeo, rvMat);
    this.rvMesh.position.set(0, 0, -1.6);
    this.inspectPivot.add(this.rvMesh);

    // 2. Trabeculae Carneae (Muscular ridges along inner walls)
    const trabeculaeGroup = new THREE.Group();
    const trabMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.6 });
    for (let i = 0; i < 14; i++) {
      const tCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(THREE.MathUtils.randFloat(-2.2, 1.8), -3.5 + i * 0.45, -1.2),
        new THREE.Vector3(THREE.MathUtils.randFloat(-1.8, 2.2), -3.2 + i * 0.45, 0.5),
        new THREE.Vector3(THREE.MathUtils.randFloat(-1.5, 2.0), -2.8 + i * 0.45, 1.2)
      ]);
      const tGeo = new THREE.TubeGeometry(tCurve, 16, 0.22, 8, false);
      const tMesh = new THREE.Mesh(tGeo, trabMat);
      trabeculaeGroup.add(tMesh);
    }
    this.inspectPivot.add(trabeculaeGroup);

    // 3. Moderator Band (Septomarginal Trabecula)
    const modCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.8, -1.5, -0.6),
      new THREE.Vector3(-0.2, -1.8, 0.4),
      new THREE.Vector3(1.6, -1.2, 0.8)
    ]);
    const modGeo = new THREE.TubeGeometry(modCurve, 20, 0.38, 12, false);
    const modMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.35,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5
    });
    this.moderatorBand = new THREE.Mesh(modGeo, modMat);
    this.inspectPivot.add(this.moderatorBand);

    // 4. Electrical Conduction Sparks along Moderator Band
    const sparkGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    this.modSpark = new THREE.Mesh(sparkGeo, sparkMat);
    this.inspectPivot.add(this.modSpark);

    // 5. Conus Arteriosus / Infundibulum (Funnel leading upward to pulmonary trunk)
    const conusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.5, 2.2, 0.2),
      new THREE.Vector3(-0.2, 4.2, -0.2),
      new THREE.Vector3(0.2, 6.0, -0.4)
    ]);
    const conusGeo = new THREE.TubeGeometry(conusCurve, 24, 1.3, 16, false);
    const conusMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.35,
      transparent: true,
      opacity: 0.82
    });
    this.conusMesh = new THREE.Mesh(conusGeo, conusMat);
    this.inspectPivot.add(this.conusMesh);

    // 6. Churning Venous Erythrocytes in Ventricle
    const count = 90;
    const rbcGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12);
    const rbcMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, emissive: 0x0369a1, emissiveIntensity: 0.4 });
    this.rbcInst = new THREE.InstancedMesh(rbcGeo, rbcMat, count);
    this.rbcData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const pos = new THREE.Vector3(
        THREE.MathUtils.randFloat(-2.2, 2.2),
        THREE.MathUtils.randFloat(-3.8, 4.8),
        THREE.MathUtils.randFloat(-1.2, 1.2)
      );
      this.rbcData.push({
        basePos: pos.clone(),
        currPos: pos.clone(),
        vy: THREE.MathUtils.randFloat(2.0, 4.5),
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI
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

    // Systolic squeeze: chamber contracts in volume
    const squeeze = Math.pow(Math.max(0, Math.sin(this.time * freq)), 4);
    const scaleX = 1.0 - squeeze * 0.12;
    const scaleZ = 1.0 - squeeze * 0.14;
    this.rvMesh.scale.set(scaleX, 1.0 + squeeze * 0.04, scaleZ);

    // Electrical conduction spark travels along moderator band
    const tSpark = (this.time * freq * 0.5) % 1.0;
    const modCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.8, -1.5, -0.6),
      new THREE.Vector3(-0.2, -1.8, 0.4),
      new THREE.Vector3(1.6, -1.2, 0.8)
    ]);
    const pt = modCurve.getPoint(tSpark);
    this.modSpark.position.copy(pt);
    this.modSpark.visible = squeeze > 0.1;

    // Animate blood cells rushing upward into the conus arteriosus
    if (this.rbcInst) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.rbcData.length; i++) {
        const d = this.rbcData[i];
        d.currPos.y += d.vy * delta * (1.0 + squeeze * 1.5);
        if (d.currPos.y > 5.8) {
          d.currPos.y = -3.8;
          d.currPos.x = THREE.MathUtils.randFloat(-2.0, 2.0);
        }
        dummy.position.copy(d.currPos);
        dummy.rotation.x += delta * 2.0;
        dummy.rotation.y += delta * 1.5;
        dummy.updateMatrix();
        this.rbcInst.setMatrixAt(i, dummy.matrix);
      }
      this.rbcInst.instanceMatrix.needsUpdate = true;
    }
  }
}
