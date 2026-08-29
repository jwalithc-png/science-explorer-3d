import * as THREE from 'three';
import { createZonaPellucidaMaterial } from '../shaders/ZonaPellucidaShader.js';

/**
 * Stage 2: The Mature Oocyte & Corona Radiata Model
 * Giant female gamete with translucent Zona Pellucida, internal cytoplasm,
 * 1st polar body, and surrounding follicular Corona Radiata cells.
 */
export class OocyteModel {
  constructor(position = { x: -75, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(position.x, position.y, position.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.initOocyteCore();
    this.initZonaPellucida();
    this.initPolarBody();
    this.initCoronaRadiata();
    this.initApproachingSperm();
  }

  initOocyteCore() {
    // 1. Oocyte Cytoplasm (Ooplasm) filled with nutrient yolk granules and maternal mRNAs
    const coreGeo = new THREE.SphereGeometry(3.6, 36, 36);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.5,
      metalness: 0.1,
      emissive: 0x9f1239,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.9
    });
    this.oocyteMesh = new THREE.Mesh(coreGeo, this.coreMat);
    this.inspectPivot.add(this.oocyteMesh);

    // Internal Metaphase II Maternal Spindle & Chromosomes
    const spindleGeo = new THREE.CylinderGeometry(0.1, 0.4, 1.2, 12);
    const spindleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8
    });
    this.spindleMesh = new THREE.Mesh(spindleGeo, spindleMat);
    this.spindleMesh.position.set(1.6, 1.6, 0);
    this.spindleMesh.rotation.z = 0.6;
    this.inspectPivot.add(this.spindleMesh);

    // Maternal Chromosomes at Metaphase Plate
    const chromoGeo = new THREE.TorusGeometry(0.35, 0.08, 8, 16);
    const chromoMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const chromoMesh = new THREE.Mesh(chromoGeo, chromoMat);
    chromoMesh.position.copy(this.spindleMesh.position);
    chromoMesh.rotation.x = Math.PI * 0.5;
    this.inspectPivot.add(chromoMesh);
  }

  initZonaPellucida() {
    // 2. Translucent Glycoprotein Shell (Zona Pellucida - 15 µm thick)
    const zonaGeo = new THREE.SphereGeometry(4.3, 40, 40);
    this.zonaMat = createZonaPellucidaMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorInner: { value: new THREE.Color(0xfb7185) },
        uColorOuter: { value: new THREE.Color(0xfff1f2) },
        uGlowColor: { value: new THREE.Color(0xf43f5e) },
        uFresnelPower: { value: 2.2 },
        uSubsurfacePower: { value: 1.5 },
        uOpacity: { value: 0.55 },
        uCutaway: { value: 0.0 }
      }
    });
    this.zonaMesh = new THREE.Mesh(zonaGeo, this.zonaMat);
    this.inspectPivot.add(this.zonaMesh);
  }

  initPolarBody() {
    // 3. 1st Polar Body in the perivitelline space between oolemma and zona
    const pbGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const pbMat = new THREE.MeshStandardMaterial({
      color: 0xfda4af,
      roughness: 0.4,
      emissive: 0xe11d48,
      emissiveIntensity: 0.3
    });
    this.polarBodyMesh = new THREE.Mesh(pbGeo, pbMat);
    this.polarBodyMesh.position.set(2.7, 2.7, 0.4);
    this.inspectPivot.add(this.polarBodyMesh);
  }

  initCoronaRadiata() {
    // 4. Follicular Corona Radiata Cells surrounding the Zona
    const cellCount = 110;
    const cellGeo = new THREE.SphereGeometry(0.42, 12, 10);
    const cellMat = new THREE.MeshStandardMaterial({
      color: 0xfecdd3,
      roughness: 0.5,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.85
    });

    this.coronaMesh = new THREE.InstancedMesh(cellGeo, cellMat, cellCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < cellCount; i++) {
      // Distribute radially around sphere surface at radius 4.8 - 6.2
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 4.8 + Math.random() * 1.5;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      dummy.position.set(x, y, z);
      const scale = 0.7 + Math.random() * 0.5;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      this.coronaMesh.setMatrixAt(i, dummy.matrix);
    }
    this.coronaMesh.instanceMatrix.needsUpdate = true;
    this.inspectPivot.add(this.coronaMesh);
  }

  initApproachingSperm() {
    // Swarm of sperm swimming towards the egg
    const spermCount = 45;
    this.spermGroup = new THREE.Group();

    for (let i = 0; i < spermCount; i++) {
      const sp = new THREE.Group();
      const headGeo = new THREE.SphereGeometry(0.25, 10, 8);
      headGeo.scale(1.4, 0.9, 0.6);
      const headMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 });
      const head = new THREE.Mesh(headGeo, headMat);
      sp.add(head);

      const tailGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.3, 0, 0),
        new THREE.Vector3(-1.2, 0.1, 0),
        new THREE.Vector3(-2.2, -0.1, 0),
        new THREE.Vector3(-3.2, 0, 0)
      ]);
      const tailMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
      const tail = new THREE.Line(tailGeo, tailMat);
      sp.add(tail);

      // Position radially outside corona radiata pointing inward
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 7.5 + Math.random() * 4.0;

      sp.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      sp.lookAt(0, 0, 0); // Point towards oocyte center

      this.spermGroup.add(sp);
    }
    this.inspectPivot.add(this.spermGroup);
  }

  update(delta, params = {}) {
    const time = performance.now() * 0.001;

    // 1. Auto 360° Turntable Rotation
    if (params.autoRotate360) {
      this.inspectPivot.rotation.y += delta * (params.rotationSpeed360 || 0.5);
    }

    // 2. Update Zona Pellucida Shader
    if (this.zonaMat.uniforms) {
      this.zonaMat.uniforms.uTime.value = time;
      this.zonaMat.uniforms.uCutaway.value = params.crossSectionView ? 1.0 : 0.0;
    }

    // 3. Gentle oocyte cytoplasmic respiration pulse
    const pulse = 1.0 + Math.sin(time * 1.5) * 0.015;
    this.oocyteMesh.scale.set(pulse, pulse, pulse);

    // 4. Animate approaching sperm swimming wiggle
    const speed = (params.simSpeed || 1.0) * (params.spermMotilitySpeed || 1.0);
    this.spermGroup.children.forEach((sp, idx) => {
      sp.rotation.z += Math.sin(time * 10.0 + idx) * 0.04 * speed;
    });
  }
}
