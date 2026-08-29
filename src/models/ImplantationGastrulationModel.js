import * as THREE from 'three';

/**
 * Stage 6: Endometrial Implantation & Gastrulation Model
 * Demonstrates the blastocyst embedding into the maternal endometrial wall,
 * syncytiotrophoblast blood lacunae, and the 3 Primary Germ Layers (Ectoderm, Mesoderm, Endoderm).
 */
export class ImplantationGastrulationModel {
  constructor(position = { x: 105, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(position.x, position.y, position.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.initEndometrialWall();
    this.initSyncytiotrophoblastVilli();
    this.initGermLayersDisc();
    this.initAmnioticYolkSac();
  }

  initEndometrialWall() {
    // Maternal Endometrium (Vascular uterine stroma)
    const endoGeo = new THREE.BoxGeometry(16, 12, 4);
    const endoMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      roughness: 0.7,
      metalness: 0.1,
      emissive: 0x4c0519,
      emissiveIntensity: 0.3
    });
    this.endoMesh = new THREE.Mesh(endoGeo, endoMat);
    this.endoMesh.position.set(0, 0, -2.5);
    this.inspectPivot.add(this.endoMesh);

    // Maternal Blood Lacunae pools
    const lacunaCount = 14;
    for (let i = 0; i < lacunaCount; i++) {
      const lacGeo = new THREE.SphereGeometry(0.6 + Math.random() * 0.4, 12, 12);
      const lacMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.3,
        emissive: 0x991b1b,
        emissiveIntensity: 0.6
      });
      const lac = new THREE.Mesh(lacGeo, lacMat);
      lac.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8, -1.2);
      this.inspectPivot.add(lac);
    }
  }

  initSyncytiotrophoblastVilli() {
    // Invasive multinucleated Syncytiotrophoblast branching projections
    this.villiGroup = new THREE.Group();
    const villiCount = 28;

    for (let i = 0; i < villiCount; i++) {
      const angle = (i / villiCount) * Math.PI * 2;
      const r = 3.2;
      const vCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(r * Math.cos(angle), r * Math.sin(angle), 0),
        new THREE.Vector3((r + 1.2) * Math.cos(angle), (r + 1.2) * Math.sin(angle), -0.8),
        new THREE.Vector3((r + 2.0) * Math.cos(angle), (r + 2.0) * Math.sin(angle), -1.8)
      ]);
      const vGeo = new THREE.TubeGeometry(vCurve, 12, 0.22, 8, false);
      const vMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        roughness: 0.4,
        emissive: 0xc2410c,
        emissiveIntensity: 0.4
      });
      const villus = new THREE.Mesh(vGeo, vMat);
      this.villiGroup.add(villus);
    }
    this.inspectPivot.add(this.villiGroup);
  }

  initGermLayersDisc() {
    // Trilaminar Embryonic Disc (Gastrulation: Ectoderm, Mesoderm, Endoderm)
    this.discGroup = new THREE.Group();
    this.discGroup.position.set(0, 0, 0.4);

    // 1. Ectoderm (Top Blue layer - Future Brain, Spinal Cord, Skin)
    const ectoGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.25, 32);
    const ectoMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.3,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5
    });
    this.ectoMesh = new THREE.Mesh(ectoGeo, ectoMat);
    this.ectoMesh.position.set(0, 0.3, 0);
    this.discGroup.add(this.ectoMesh);

    // Primitive Streak Groove down the midline
    const streakGeo = new THREE.BoxGeometry(0.2, 0.1, 2.4);
    const streakMat = new THREE.MeshBasicMaterial({ color: 0x0369a1 });
    const streak = new THREE.Mesh(streakGeo, streakMat);
    streak.position.set(0, 0.45, 0);
    this.discGroup.add(streak);

    // 2. Mesoderm (Middle Orange layer - Future Heart, Blood, Muscles, Bones)
    const mesoGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.25, 32);
    const mesoMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.4,
      emissive: 0xea580c,
      emissiveIntensity: 0.5
    });
    this.mesoMesh = new THREE.Mesh(mesoGeo, mesoMat);
    this.mesoMesh.position.set(0, 0, 0);
    this.discGroup.add(this.mesoMesh);

    // 3. Endoderm (Bottom Gold layer - Future GI Tract, Lungs, Liver)
    const endoLayerGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.25, 32);
    const endoLayerMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.4,
      emissive: 0xca8a04,
      emissiveIntensity: 0.5
    });
    this.endoLayerMesh = new THREE.Mesh(endoLayerGeo, endoLayerMat);
    this.endoLayerMesh.position.set(0, -0.3, 0);
    this.discGroup.add(this.endoLayerMesh);

    this.inspectPivot.add(this.discGroup);
  }

  initAmnioticYolkSac() {
    // Amniotic Cavity (Dorsal - Blue dome)
    const amGeo = new THREE.SphereGeometry(1.8, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const amMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.2,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    this.amnioticDome = new THREE.Mesh(amGeo, amMat);
    this.amnioticDome.position.set(0, 0.45, 0);
    this.inspectPivot.add(this.amnioticDome);

    // Yolk Sac (Ventral - Gold dome)
    const yolkGeo = new THREE.SphereGeometry(1.8, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const yolkMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.3,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });
    this.yolkDome = new THREE.Mesh(yolkGeo, yolkMat);
    this.yolkDome.position.set(0, -0.45, 0);
    this.yolkDome.rotation.x = Math.PI;
    this.inspectPivot.add(this.yolkDome);
  }

  update(delta, params = {}) {
    const time = performance.now() * 0.001;

    // 1. Auto 360° Turntable Rotation
    if (params.autoRotate360) {
      this.inspectPivot.rotation.y += delta * (params.rotationSpeed360 || 0.5);
    }

    // 2. Maternal blood lacunae perfusion pulse
    const lacPulse = 0.4 + Math.sin(time * 2.5) * 0.2;
    this.villiGroup.children.forEach(v => {
      v.material.emissiveIntensity = lacPulse;
    });
  }
}
