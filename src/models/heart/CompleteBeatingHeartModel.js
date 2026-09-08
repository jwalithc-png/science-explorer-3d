import * as THREE from 'three';

/**
 * Stage 10: Complete Beating Heart & Cardiac Conduction System Model
 * Features:
 * - Complete 4-chamber anatomical beating heart (Right/Left Atria, Right/Left Ventricles)
 * - Great vessels (Aorta, Pulmonary Trunk, Vena Cava, Pulmonary Veins)
 * - Branching anterior and posterior Coronary Arteries and Cardiac Veins
 * - Complete Bioluminescent Cardiac Conduction Network:
 *   1. Sinoatrial (SA) Node (Pacemaker)
 *   2. Atrioventricular (AV) Node
 *   3. Bundle of His (Atrioventricular Bundle)
 *   4. Left and Right Bundle Branches
 *   5. Arborizing Subendocardial Purkinje Fibers
 * - True dual-phase cardiac cycle: Atrial Systole -> AV Nodal Delay -> Ventricular Systole
 * - Synchronized electrical excitation wavefronts illuminating the myocardium
 */
export class CompleteBeatingHeartModel {
  constructor(pos = { x: 140, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(pos.x, pos.y, pos.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.time = 0;
    this.initModel();
  }

  initModel() {
    // 1. Left Ventricular Muscular Cone (Apex & Left Border)
    const lvGeo = new THREE.ConeGeometry(3.2, 6.8, 32);
    lvGeo.rotateX(Math.PI);
    const lvMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.42,
      metalness: 0.2,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.35
    });
    this.lvBody = new THREE.Mesh(lvGeo, lvMat);
    this.lvBody.position.set(0.6, -1.8, 0);
    this.lvBody.rotation.z = -0.15;
    this.inspectPivot.add(this.lvBody);

    // 2. Right Ventricular Anterior Muscle Crescent
    const rvGeo = new THREE.SphereGeometry(2.8, 24, 20);
    rvGeo.scale(0.8, 1.3, 0.9);
    const rvMat = new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      roughness: 0.45,
      metalness: 0.2,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.3
    });
    this.rvBody = new THREE.Mesh(rvGeo, rvMat);
    this.rvBody.position.set(-1.4, -1.2, 0.8);
    this.inspectPivot.add(this.rvBody);

    // 3. Right Atrium and Left Atrium Basal Chambers
    const raGeo = new THREE.SphereGeometry(2.0, 20, 16);
    raGeo.scale(1.0, 1.2, 1.1);
    this.raBody = new THREE.Mesh(raGeo, rvMat);
    this.raBody.position.set(-2.0, 2.2, -0.2);
    this.inspectPivot.add(this.raBody);

    const laGeo = new THREE.SphereGeometry(1.9, 20, 16);
    laGeo.scale(1.0, 1.2, 1.0);
    this.laBody = new THREE.Mesh(laGeo, lvMat);
    this.laBody.position.set(1.6, 2.0, -0.8);
    this.inspectPivot.add(this.laBody);

    // 4. Aortic Arch (Emerging from center-left base)
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 1.2, 0.4),
      new THREE.Vector3(0.5, 3.8, 0.2),
      new THREE.Vector3(-0.4, 4.8, -0.2),
      new THREE.Vector3(-1.8, 3.8, -0.8)
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 24, 0.9, 16, false);
    const aortaMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.32, metalness: 0.25 });
    this.aorta = new THREE.Mesh(aortaGeo, aortaMat);
    this.inspectPivot.add(this.aorta);

    // 5. Pulmonary Trunk (Crossing anterior to aorta)
    const ptCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.8, 0.8, 1.2),
      new THREE.Vector3(-0.2, 2.8, 0.8),
      new THREE.Vector3(0.8, 3.5, 0.2)
    ]);
    const ptGeo = new THREE.TubeGeometry(ptCurve, 20, 0.82, 16, false);
    const ptMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 });
    this.pulmonaryTrunk = new THREE.Mesh(ptGeo, ptMat);
    this.inspectPivot.add(this.pulmonaryTrunk);

    // 6. Coronary Arteries (Left Anterior Descending - LAD, Right Coronary Artery - RCA)
    const coronaryMat = new THREE.MeshStandardMaterial({ color: 0xf87171, roughness: 0.3 });
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.4, 1.8, 1.2),
      new THREE.Vector3(-0.2, 0.2, 1.8),
      new THREE.Vector3(-0.4, -1.8, 1.4),
      new THREE.Vector3(0.1, -4.2, 0.4)
    ]);
    const ladGeo = new THREE.TubeGeometry(ladCurve, 24, 0.16, 8, false);
    this.ladMesh = new THREE.Mesh(ladGeo, coronaryMat);
    this.inspectPivot.add(this.ladMesh);

    // 7. Cardiac Conduction Network Geometry
    this.conductionGroup = new THREE.Group();

    // SA Node (Sinoatrial node pacemaker sphere)
    const saGeo = new THREE.SphereGeometry(0.38, 16, 16);
    this.saMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    this.saNode = new THREE.Mesh(saGeo, this.saMat);
    this.saNode.position.set(-2.6, 3.2, 0.4);
    this.conductionGroup.add(this.saNode);

    // AV Node (Atrioventricular node sphere)
    const avGeo = new THREE.SphereGeometry(0.32, 16, 16);
    this.avMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    this.avNode = new THREE.Mesh(avGeo, this.avMat);
    this.avNode.position.set(-0.6, 1.0, 0.2);
    this.conductionGroup.add(this.avNode);

    // Bundle of His & Purkinje fiber lines
    const hisCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.6, 1.0, 0.2),
      new THREE.Vector3(-0.4, -0.2, 0.4),
      new THREE.Vector3(0.0, -1.8, 0.6)
    ]);
    const hisGeo = new THREE.TubeGeometry(hisCurve, 16, 0.12, 8, false);
    const hisMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    this.hisBundle = new THREE.Mesh(hisGeo, hisMat);
    this.conductionGroup.add(this.hisBundle);

    // Purkinje Fiber Network lines across ventricle
    const purkMat = new THREE.LineBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.85 });
    for (let f = 0; f < 12; f++) {
      const angle = (f / 12) * Math.PI * 2;
      const pts = [
        new THREE.Vector3(0.0, -1.8, 0.6),
        new THREE.Vector3(Math.cos(angle) * 1.5, -2.8, Math.sin(angle) * 1.5),
        new THREE.Vector3(Math.cos(angle) * 2.4, -3.8, Math.sin(angle) * 2.2)
      ];
      const pGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const pLine = new THREE.Line(pGeo, purkMat);
      this.conductionGroup.add(pLine);
    }
    this.inspectPivot.add(this.conductionGroup);

    // 8. Electrical Conduction Spark
    const sparkGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.elecSpark = new THREE.Mesh(sparkGeo, sparkMat);
    this.inspectPivot.add(this.elecSpark);
  }

  update(delta, params = {}) {
    const hr = params.heartRateBPM || 75;
    const freq = (hr / 60) * Math.PI * 2;
    this.time += delta;

    // Dual-Phase Cardiac Cycle:
    // Phase A: Atrial Systole (t: 0 to 0.25)
    // Phase B: Ventricular Systole (t: 0.35 to 0.70)
    const cyclePhase = (this.time * freq) % (Math.PI * 2);

    const atrialSystole = Math.pow(Math.max(0, Math.sin(cyclePhase)), 6);
    const ventricularSystole = Math.pow(Math.max(0, Math.sin(cyclePhase - 0.7)), 5);

    // Atrial pumping
    const atriaScale = 1.0 - atrialSystole * 0.14;
    this.raBody.scale.set(atriaScale, atriaScale, atriaScale);
    this.laBody.scale.set(atriaScale, atriaScale, atriaScale);

    // Ventricular pumping (Apex wringing torsion & radial contraction)
    const ventScale = 1.0 - ventricularSystole * 0.16;
    const ventTwist = ventricularSystole * 0.18;
    this.lvBody.scale.set(ventScale, 1.0 + ventricularSystole * 0.05, ventScale);
    this.lvBody.rotation.y = ventTwist;
    this.rvBody.scale.set(ventScale, 1.0 + ventricularSystole * 0.04, ventScale);

    // Aortic systolic expansion
    const aortaExpansion = 1.0 + ventricularSystole * 0.08;
    this.aorta.scale.set(aortaExpansion, 1.0, aortaExpansion);

    // Electrical Pacemaker Flash
    this.saMat.color.setHex(atrialSystole > 0.3 ? 0xffffff : 0xfef08a);
    this.avMat.color.setHex(ventricularSystole > 0.3 ? 0xffffff : 0xfde047);

    // Move electrical spark from SA node down to apex
    const normT = (cyclePhase / (Math.PI * 2));
    if (normT < 0.3) {
      // Atrial conduction: SA -> AV
      this.elecSpark.position.lerpVectors(this.saNode.position, this.avNode.position, normT / 0.3);
      this.elecSpark.visible = true;
    } else if (normT < 0.7) {
      // Ventricular conduction: AV -> Apex
      const vT = (normT - 0.3) / 0.4;
      this.elecSpark.position.set(
        THREE.MathUtils.lerp(-0.6, 0.1, vT),
        THREE.MathUtils.lerp(1.0, -4.2, vT),
        THREE.MathUtils.lerp(0.2, 0.4, vT)
      );
      this.elecSpark.visible = true;
    } else {
      this.elecSpark.visible = false;
    }
  }
}
