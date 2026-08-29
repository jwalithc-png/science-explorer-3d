import * as THREE from 'three';

/**
 * Stage 9: Full-Term Child Formation & Miracle of Life Model (Week 38 to 40)
 * Photorealistic 3D full-term infant curled in cephalic vertex presentation,
 * featuring realistic skin, vernix caseosa, chest breathing dynamics, and life-supporting umbilical vessels.
 */
export class FullTermChildModel {
  constructor(position = { x: 240, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(position.x, position.y, position.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.initUterineCavity();
    this.initPlacentalVessels();
    this.initFullTermInfant();
    this.initAmnioticHalo();
  }

  initUterineCavity() {
    // Maternal Womb / Uterine Wall boundary
    const wombGeo = new THREE.SphereGeometry(7.2, 36, 32);
    const wombMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.35,
      emissive: 0x4c0519,
      emissiveIntensity: 0.3
    });
    this.wombMesh = new THREE.Mesh(wombGeo, wombMat);
    this.inspectPivot.add(this.wombMesh);
  }

  initPlacentalVessels() {
    // Mature Maternal Placenta (Fundal position)
    const placGeo = new THREE.CylinderGeometry(4.2, 4.5, 1.1, 32);
    const placMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      roughness: 0.5,
      emissive: 0x991b1b,
      emissiveIntensity: 0.4
    });
    this.placenta = new THREE.Mesh(placGeo, placMat);
    this.placenta.position.set(0, 5.8, 0);
    this.inspectPivot.add(this.placenta);

    // Spiraled Wharton's Jelly Umbilical Cord
    const cordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 5.2, 0),
      new THREE.Vector3(1.5, 3.8, 0.6),
      new THREE.Vector3(0.8, 2.0, -0.6),
      new THREE.Vector3(0.1, 0.4, 0.9)
    ]);
    const cordGeo = new THREE.TubeGeometry(cordCurve, 32, 0.4, 12, false);
    const cordMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35
    });
    this.cordMesh = new THREE.Mesh(cordGeo, cordMat);
    this.inspectPivot.add(this.cordMesh);
  }

  initFullTermInfant() {
    // Curled Full-Term Human Infant (Vertex Cephalic Presentation - Head Down)
    this.baby = new THREE.Group();
    this.baby.position.set(0, 0.2, 0);
    this.baby.rotation.z = Math.PI; // Cephalic orientation (head downward)

    // Photorealistic Infant Skin Material with Subsurface Scattering & Vernix
    this.skinMat = new THREE.MeshStandardMaterial({
      color: 0xfecdd3,
      roughness: 0.45,
      metalness: 0.05,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.15
    });

    // 1. Head (Smooth Cranium, soft cheeks, delicate facial features)
    const headGeo = new THREE.SphereGeometry(2.0, 32, 28);
    headGeo.scale(1.05, 1.25, 1.15);
    this.babyHead = new THREE.Mesh(headGeo, this.skinMat);
    this.babyHead.position.set(0, 2.4, 0.5);
    this.baby.add(this.babyHead);

    // Delicate nose
    const noseGeo = new THREE.ConeGeometry(0.2, 0.4, 8);
    const nose = new THREE.Mesh(noseGeo, this.skinMat);
    nose.position.set(0, 2.3, 1.7);
    nose.rotation.x = Math.PI * 0.4;
    this.babyHead.add(nose);

    // Peaceful closed eyelids & eyelashes
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
    const eyeL = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 6, 12, Math.PI), eyeMat);
    eyeL.position.set(0.65, 2.5, 1.55);
    this.babyHead.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 6, 12, Math.PI), eyeMat);
    eyeR.position.set(-0.65, 2.5, 1.55);
    this.babyHead.add(eyeR);

    // Tiny infant lips
    const lipMat = new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.3 });
    const lips = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.4, 8, 12), lipMat);
    lips.rotation.z = Math.PI * 0.5;
    lips.position.set(0, 1.9, 1.65);
    this.babyHead.add(lips);

    // 2. Torso (Chubby infant chest & tummy)
    const torsoGeo = new THREE.SphereGeometry(1.9, 28, 24);
    torsoGeo.scale(1.0, 1.45, 0.95);
    this.babyTorso = new THREE.Mesh(torsoGeo, this.skinMat);
    this.babyTorso.position.set(0, 0.2, 0.2);
    this.baby.add(this.babyTorso);

    // 3. Arms & Tiny Hands curled peacefully across chest
    const armGeo = new THREE.CylinderGeometry(0.42, 0.35, 2.0, 14);
    this.armL = new THREE.Mesh(armGeo, this.skinMat);
    this.armL.position.set(1.4, 0.8, 0.8);
    this.armL.rotation.set(0.7, 0.5, -0.6);
    this.baby.add(this.armL);

    this.armR = new THREE.Mesh(armGeo, this.skinMat);
    this.armR.position.set(-1.4, 0.8, 0.8);
    this.armR.rotation.set(0.7, -0.5, 0.6);
    this.baby.add(this.armR);

    // 4. Flexed Legs & Feet
    const legGeo = new THREE.CylinderGeometry(0.48, 0.38, 2.2, 14);
    this.legL = new THREE.Mesh(legGeo, this.skinMat);
    this.legL.position.set(1.1, -1.4, 0.9);
    this.legL.rotation.set(-1.0, 0.4, -0.4);
    this.baby.add(this.legL);

    this.legR = new THREE.Mesh(legGeo, this.skinMat);
    this.legR.position.set(-1.1, -1.4, 0.9);
    this.legR.rotation.set(-1.0, -0.4, 0.4);
    this.baby.add(this.legR);

    this.inspectPivot.add(this.baby);
  }

  initAmnioticHalo() {
    // Bioluminescent miracle halo glow around the full-term baby
    const haloGeo = new THREE.RingGeometry(5.2, 6.0, 36);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    this.haloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.haloMesh.rotation.x = Math.PI * 0.5;
    this.inspectPivot.add(this.haloMesh);
  }

  update(delta, params = {}) {
    const time = performance.now() * 0.001;

    // 1. Auto 360° Turntable Rotation
    if (params.autoRotate360) {
      this.inspectPivot.rotation.y += delta * (params.rotationSpeed360 || 0.5);
    }

    // 2. Rhythmic Infant Respiration & Heartbeat
    const bpm = params.heartRateBPM || 140;
    const heartFreq = (bpm / 60.0) * Math.PI * 2;
    const breath = Math.sin(time * 1.5) * 0.03; // Gentle breathing rise and fall
    const pulse = Math.pow(Math.max(0, Math.sin(time * heartFreq)), 3.0) * 0.02;

    this.babyTorso.scale.set(1.0 + breath + pulse, 1.45 + breath, 0.95 + breath + pulse);

    // 3. Halo rotation
    this.haloMesh.rotation.z += delta * 0.2;
  }
}
