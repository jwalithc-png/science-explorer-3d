import * as THREE from 'three';

/**
 * Stage 7: Mitral (Bicuspid) Valve & Annulus Model
 * Features:
 * - D-shaped saddle fibrous annulus
 * - 2 heavy, pliable fibrous leaflets (Anterior and Posterior cusps)
 * - Extensive arborizing Chordae Tendineae withstanding up to 120 mmHg
 * - Two massive Papillary Muscles (Anterolateral and Posteromedial)
 * - High-speed ventricular inflow jet of oxygen-rich erythrocytes
 */
export class MitralValveModel {
  constructor(pos = { x: 45, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(pos.x, pos.y, pos.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.time = 0;
    this.initModel();
  }

  initModel() {
    // 1. D-Shaped Fibrous Saddle Annulus
    const annulusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.8, 1.8, 0.2),
      new THREE.Vector3(0, 2.0, 0.4),
      new THREE.Vector3(1.8, 1.8, 0.2),
      new THREE.Vector3(2.2, 0.0, -0.1),
      new THREE.Vector3(1.4, -1.8, -0.3),
      new THREE.Vector3(0, -2.0, -0.4),
      new THREE.Vector3(-1.4, -1.8, -0.3),
      new THREE.Vector3(-2.2, 0.0, -0.1)
    ], true);
    const annulusGeo = new THREE.TubeGeometry(annulusCurve, 32, 0.24, 16, true);
    const annulusMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.35 });
    this.annulus = new THREE.Mesh(annulusGeo, annulusMat);
    this.inspectPivot.add(this.annulus);

    // 2. Anterior Mitral Leaflet (Broad, smooth curtain-like cusp)
    const antGeo = new THREE.ConeGeometry(1.6, 2.4, 20, 1, true);
    antGeo.rotateX(Math.PI * 0.9);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0xffe4e6,
      roughness: 0.3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.90
    });
    this.antLeaflet = new THREE.Mesh(antGeo, leafMat);
    this.antLeaflet.position.set(0, 0.2, 0.6);
    this.inspectPivot.add(this.antLeaflet);

    // 3. Posterior Mitral Leaflet (Scalloped: P1, P2, P3 scallops)
    const postGeo = new THREE.ConeGeometry(1.5, 1.8, 20, 1, true);
    postGeo.rotateX(Math.PI * 0.1);
    this.postLeaflet = new THREE.Mesh(postGeo, leafMat);
    this.postLeaflet.position.set(0, 0.2, -0.6);
    this.inspectPivot.add(this.postLeaflet);

    // 4. Arborizing Chordae Tendineae (Dense fibrous cords)
    this.chordaeGroup = new THREE.Group();
    const chordMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.90 });

    const papLeft = new THREE.Vector3(-1.6, -4.6, 0.8);
    const papRight = new THREE.Vector3(1.6, -4.6, -0.8);

    for (let c = 0; c < 16; c++) {
      const isLeft = c < 8;
      const targetPap = isLeft ? papLeft : papRight;
      const leafOffset = (c % 8) / 8.0 - 0.5;
      const topPos = new THREE.Vector3(leafOffset * 2.5, -0.6, (c % 2 === 0 ? 0.7 : -0.7));

      const lineGeo = new THREE.BufferGeometry().setFromPoints([topPos, targetPap]);
      const line = new THREE.Line(lineGeo, chordMat);
      this.chordaeGroup.add(line);
    }
    this.inspectPivot.add(this.chordaeGroup);

    // 5. Massive Papillary Muscles (Anterolateral and Posteromedial)
    const papMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.5 });
    const papGeo = new THREE.ConeGeometry(0.75, 2.4, 16);

    this.pap1 = new THREE.Mesh(papGeo, papMat);
    this.pap1.position.copy(papLeft);
    this.inspectPivot.add(this.pap1);

    this.pap2 = new THREE.Mesh(papGeo, papMat);
    this.pap2.position.copy(papRight);
    this.inspectPivot.add(this.pap2);

    // 6. High-Speed E/A Wave Inflow Erythrocytes
    const count = 90;
    const rbcGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12);
    const rbcMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25, emissive: 0xb91c1c, emissiveIntensity: 0.5 });
    this.rbcInst = new THREE.InstancedMesh(rbcGeo, rbcMat, count);
    this.rbcData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const y = THREE.MathUtils.randFloat(-5.2, 2.5);
      const r = THREE.MathUtils.randFloat(0.1, 1.3);
      const theta = Math.random() * Math.PI * 2;
      this.rbcData.push({
        y, r, theta,
        speed: THREE.MathUtils.randFloat(4.0, 7.5)
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

    // Diastolic valve opening vs Systolic coaptation
    const cycle = (Math.sin(this.time * freq) + 1.0) * 0.5;
    const isOpen = cycle > 0.42;

    // Leaflet opening deflection
    this.antLeaflet.rotation.x = isOpen ? Math.PI * 0.82 : Math.PI * 0.95;
    this.postLeaflet.rotation.x = isOpen ? Math.PI * 0.22 : Math.PI * 0.05;

    // Papillary muscle contraction tension
    const tension = 1.0 + Math.sin(this.time * freq) * 0.05;
    this.pap1.scale.set(1.0, tension, 1.0);
    this.pap2.scale.set(1.0, tension, 1.0);

    // Fast downward erythrocyte flow through valve orifice
    if (this.rbcInst) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.rbcData.length; i++) {
        const d = this.rbcData[i];
        d.y -= d.speed * delta;
        if (d.y < -5.4) d.y = 2.4;

        dummy.position.set(Math.cos(d.theta) * d.r, d.y, Math.sin(d.theta) * d.r);
        dummy.rotation.x += delta * 3.0;
        dummy.updateMatrix();
        this.rbcInst.setMatrixAt(i, dummy.matrix);
      }
      this.rbcInst.instanceMatrix.needsUpdate = true;
    }
  }
}
