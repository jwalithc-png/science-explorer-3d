import * as THREE from 'three';
import { createEmbryoMaterial } from '../shaders/EmbryoHeartbeatShader.js';

/**
 * Stage 8: Fetal Development & Placental Life-Support Model (Weeks 12 to 28)
 * Demonstrates a weightless human fetus inside the translucent Amniotic Sac,
 * connected via a spiraling Umbilical Cord to the maternal-fetal Placenta.
 */
export class FetalDevelopmentModel {
  constructor(position = { x: 195, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(position.x, position.y, position.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.initAmnioticSac();
    this.initPlacenta();
    this.initUmbilicalCord();
    this.initFetusBody();
    this.initFluidParticles();
  }

  initAmnioticSac() {
    // Large Translucent Amniotic Sac membrane
    const sacGeo = new THREE.SphereGeometry(6.2, 36, 32);
    this.sacMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      emissive: 0x0284c7,
      emissiveIntensity: 0.15
    });
    this.sacMesh = new THREE.Mesh(sacGeo, this.sacMat);
    this.inspectPivot.add(this.sacMesh);
  }

  initPlacenta() {
    // Discoid Placenta attached to the maternal wall
    this.placentaGroup = new THREE.Group();
    this.placentaGroup.position.set(0, 5.0, 0);

    const placGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.9, 32);
    const placMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.6,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.4
    });
    this.placentaMesh = new THREE.Mesh(placGeo, placMat);
    this.placentaGroup.add(this.placentaMesh);

    // Chorionic villi vascular tree network on placental fetal surface
    const vTreeCount = 8;
    for (let i = 0; i < vTreeCount; i++) {
      const angle = (i / vTreeCount) * Math.PI * 2;
      const vCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.45, 0),
        new THREE.Vector3(Math.cos(angle) * 1.5, -0.45, Math.sin(angle) * 1.5),
        new THREE.Vector3(Math.cos(angle) * 2.8, -0.45, Math.sin(angle) * 2.8)
      ]);
      const vGeo = new THREE.TubeGeometry(vCurve, 12, 0.08, 6, false);
      const vMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xff0000 : 0x0088ff });
      this.placentaGroup.add(new THREE.Mesh(vGeo, vMat));
    }

    this.inspectPivot.add(this.placentaGroup);
  }

  initUmbilicalCord() {
    // Spiraling Umbilical Cord (2 Arteries + 1 Vein wrapped in Wharton's Jelly)
    this.cordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 4.5, 0),
      new THREE.Vector3(1.2, 3.0, 0.8),
      new THREE.Vector3(0.5, 1.5, -0.5),
      new THREE.Vector3(0.2, 0.2, 0.8) // Enters fetal navel
    ]);

    const cordGeo = new THREE.TubeGeometry(this.cordCurve, 32, 0.35, 12, false);
    const cordMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.2,
      transparent: true,
      opacity: 0.75,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.3
    });
    this.cordMesh = new THREE.Mesh(cordGeo, cordMat);
    this.inspectPivot.add(this.cordMesh);
  }

  initFetusBody() {
    // Floating Human Fetus in natural curled flexion
    this.fetus = new THREE.Group();
    this.fetus.position.set(0, 0, 0);

    this.fetusMat = createEmbryoMaterial({
      uniforms: {
        uTime: { value: 0 },
        uHeartbeatPulse: { value: 0.0 },
        uBaseColor: { value: new THREE.Color(0xfecdd3) },
        uVesselColor: { value: new THREE.Color(0xe11d48) },
        uHeartCoreColor: { value: new THREE.Color(0xef4444) },
        uFresnelPower: { value: 2.0 },
        uSubsurface: { value: 0.8 },
        uTranslucency: { value: 0.95 }
      }
    });

    // 1. Head (Cranial Vault, forehead, delicate nose & chin)
    const headGeo = new THREE.SphereGeometry(1.6, 28, 24);
    headGeo.scale(1.05, 1.25, 1.1);
    this.fetusHead = new THREE.Mesh(headGeo, this.fetusMat);
    this.fetusHead.position.set(0, 1.8, 0.4);
    this.fetus.add(this.fetusHead);

    // Eyes (Closed fetal eyelids)
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.5 });
    const eyeLeft = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), eyeMat);
    eyeLeft.position.set(0.65, 1.8, 1.2);
    this.fetusHead.add(eyeLeft);

    const eyeRight = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), eyeMat);
    eyeRight.position.set(-0.65, 1.8, 1.2);
    this.fetusHead.add(eyeRight);

    // 2. Torso (Ribcage, abdomen)
    const torsoGeo = new THREE.SphereGeometry(1.5, 24, 24);
    torsoGeo.scale(0.9, 1.4, 0.85);
    this.fetusTorso = new THREE.Mesh(torsoGeo, this.fetusMat);
    this.fetusTorso.position.set(0, 0.1, 0.1);
    this.fetus.add(this.fetusTorso);

    // 3. Arms (Curled around chest with tiny hands)
    const armGeo = new THREE.CylinderGeometry(0.3, 0.25, 1.6, 12);
    this.armLeft = new THREE.Mesh(armGeo, this.fetusMat);
    this.armLeft.position.set(1.1, 0.5, 0.7);
    this.armLeft.rotation.set(0.6, 0.4, -0.5);
    this.fetus.add(this.armLeft);

    this.armRight = new THREE.Mesh(armGeo, this.fetusMat);
    this.armRight.position.set(-1.1, 0.5, 0.7);
    this.armRight.rotation.set(0.6, -0.4, 0.5);
    this.fetus.add(this.armRight);

    // 4. Legs (Flexed upwards towards abdomen with tiny feet)
    const legGeo = new THREE.CylinderGeometry(0.35, 0.28, 1.8, 12);
    this.legLeft = new THREE.Mesh(legGeo, this.fetusMat);
    this.legLeft.position.set(0.8, -1.2, 0.8);
    this.legLeft.rotation.set(-0.8, 0.3, -0.3);
    this.fetus.add(this.legLeft);

    this.legRight = new THREE.Mesh(legGeo, this.fetusMat);
    this.legRight.position.set(-0.8, -1.2, 0.8);
    this.legRight.rotation.set(-0.8, -0.3, 0.3);
    this.fetus.add(this.legRight);

    this.inspectPivot.add(this.fetus);
  }

  initFluidParticles() {
    // Micro-particulates floating gently in warm amniotic fluid
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      const r = Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    this.fluidPoints = new THREE.Points(pGeo, pMat);
    this.inspectPivot.add(this.fluidPoints);
  }

  update(delta, params = {}) {
    const time = performance.now() * 0.001;

    // 1. Auto 360° Turntable Rotation
    if (params.autoRotate360) {
      this.inspectPivot.rotation.y += delta * (params.rotationSpeed360 || 0.5);
    }

    // 2. Weightless gentle fetal floating motion
    this.fetus.position.y = Math.sin(time * 0.8) * 0.18;
    this.fetus.rotation.z = Math.sin(time * 0.6) * 0.06;
    this.fetus.rotation.x = Math.cos(time * 0.5) * 0.05;

    // 3. Fetal Heartbeat & Chest breathing rhythm
    const bpm = params.heartRateBPM || 140;
    const heartFreq = (bpm / 60.0) * Math.PI * 2;
    const pulse = Math.pow(Math.max(0, Math.sin(time * heartFreq)), 3.0);

    if (this.fetusMat.uniforms) {
      this.fetusMat.uniforms.uTime.value = time;
      this.fetusMat.uniforms.uHeartbeatPulse.value = pulse;
    }

    // Chest expansion
    this.fetusTorso.scale.x = 0.9 + pulse * 0.04;
    this.fetusTorso.scale.z = 0.85 + pulse * 0.04;

    // 4. Amniotic Fluid Translucency adjustment
    this.sacMat.opacity = 0.28 * (params.amnioticGlow || 1.0);
  }
}
