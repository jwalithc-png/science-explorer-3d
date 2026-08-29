import * as THREE from 'three';
import { createEmbryoMaterial } from '../shaders/EmbryoHeartbeatShader.js';

/**
 * Stage 7: Embryonic Organogenesis & The First Heartbeat Model (Weeks 4 to 8)
 * Features a detailed 3D C-shaped human embryo with an actively beating primitive cardiac tube,
 * neural tube, brain vesicles, eye placode, somite segments, and developing limb buds.
 */
export class EmbryoOrganogenesisModel {
  constructor(position = { x: 150, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(position.x, position.y, position.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.initEmbryoBody();
    this.initPulsatingHeartTube();
    this.initSomiteSegments();
    this.initLimbBuds();
    this.initFacialFeatures();
    this.initUmbilicalStalk();
  }

  initEmbryoBody() {
    // Curving C-shaped anatomical embryonic trunk & neural tube
    this.embryoCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 3.2, -0.4),  // Cranial / Brain crown
      new THREE.Vector3(1.6, 2.4, 0),   // Midbrain flexure
      new THREE.Vector3(2.0, 0.8, 0.2),  // Cervical curve
      new THREE.Vector3(1.2, -0.8, 0.1), // Thoracic / Cardiac level
      new THREE.Vector3(0.2, -2.0, 0),  // Lumbar region
      new THREE.Vector3(-0.8, -2.4, -0.2),// Caudal tail bud
      new THREE.Vector3(-1.2, -1.8, -0.1)// Tail hook
    ]);

    const bodyGeo = new THREE.TubeGeometry(this.embryoCurve, 40, 1.35, 24, false);
    this.bodyMat = createEmbryoMaterial({
      uniforms: {
        uTime: { value: 0 },
        uHeartbeatPulse: { value: 0.0 },
        uBaseColor: { value: new THREE.Color(0xfca5a5) },
        uVesselColor: { value: new THREE.Color(0xdc2626) },
        uHeartCoreColor: { value: new THREE.Color(0xef4444) },
        uFresnelPower: { value: 2.2 },
        uSubsurface: { value: 0.75 },
        uTranslucency: { value: 0.9 }
      }
    });

    this.bodyMesh = new THREE.Mesh(bodyGeo, this.bodyMat);
    this.inspectPivot.add(this.bodyMesh);

    // Prominent Cranial Brain Dome (Forebrain vesicle / Telencephalon)
    const headGeo = new THREE.SphereGeometry(1.65, 28, 24);
    headGeo.scale(1.2, 1.0, 1.1);
    this.headMesh = new THREE.Mesh(headGeo, this.bodyMat);
    this.headMesh.position.set(0.2, 3.0, -0.3);
    this.inspectPivot.add(this.headMesh);
  }

  initPulsatingHeartTube() {
    // Prominent Cardiac Prominence & Primitive Heart Tube (Day 22+ spontaneous rhythm)
    this.heartGroup = new THREE.Group();
    this.heartGroup.position.set(1.4, 0.2, 0.6);

    const heartGeo = new THREE.SphereGeometry(0.85, 20, 20);
    heartGeo.scale(1.3, 1.0, 0.9);
    this.heartMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      emissive: 0xdc2626,
      emissiveIntensity: 0.8
    });
    this.heartMesh = new THREE.Mesh(heartGeo, this.heartMat);
    this.heartGroup.add(this.heartMesh);

    // Aortic arch loops & vitelline vessels
    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.4, 0),
      new THREE.Vector3(0.4, 0.8, -0.2),
      new THREE.Vector3(0, 1.2, -0.4)
    ]);
    const archGeo = new THREE.TubeGeometry(archCurve, 12, 0.12, 8, false);
    const archMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const archMesh = new THREE.Mesh(archGeo, archMat);
    this.heartGroup.add(archMesh);

    this.inspectPivot.add(this.heartGroup);
  }

  initSomiteSegments() {
    // Paired Somites (Block-like segments of paraxial mesoderm along neural axis)
    const somiteCount = 24;
    const somGeo = new THREE.BoxGeometry(0.25, 0.2, 0.35);
    const somMat = new THREE.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.5 });
    this.somitesMesh = new THREE.InstancedMesh(somGeo, somMat, somiteCount * 2);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < somiteCount; i++) {
      const t = 0.15 + (i / somiteCount) * 0.7;
      const pt = this.embryoCurve.getPoint(t);
      const tangent = this.embryoCurve.getTangent(t);
      const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();

      // Left somite
      dummy.position.copy(pt).addScaledVector(normal, 0.9).add(new THREE.Vector3(0, 0, 0.55));
      dummy.updateMatrix();
      this.somitesMesh.setMatrixAt(i * 2, dummy.matrix);

      // Right somite
      dummy.position.copy(pt).addScaledVector(normal, 0.9).add(new THREE.Vector3(0, 0, -0.55));
      dummy.updateMatrix();
      this.somitesMesh.setMatrixAt(i * 2 + 1, dummy.matrix);
    }
    this.somitesMesh.instanceMatrix.needsUpdate = true;
    this.inspectPivot.add(this.somitesMesh);
  }

  initLimbBuds() {
    // Upper Limb Paddle (Arm bud with developing digital rays)
    const armGeo = new THREE.BoxGeometry(0.7, 0.45, 0.9);
    armGeo.scale(1.2, 0.8, 1.0);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xfecdd3, roughness: 0.4 });

    this.armLeft = new THREE.Mesh(armGeo, armMat);
    this.armLeft.position.set(1.4, 0.6, 1.2);
    this.armLeft.rotation.set(0.3, 0.2, 0.4);
    this.inspectPivot.add(this.armLeft);

    this.armRight = new THREE.Mesh(armGeo, armMat);
    this.armRight.position.set(1.4, 0.6, -1.2);
    this.armRight.rotation.set(-0.3, -0.2, 0.4);
    this.inspectPivot.add(this.armRight);

    // Lower Limb Paddle (Leg bud)
    const legGeo = new THREE.BoxGeometry(0.65, 0.45, 0.8);
    this.legLeft = new THREE.Mesh(legGeo, armMat);
    this.legLeft.position.set(0.2, -1.6, 1.1);
    this.inspectPivot.add(this.legLeft);

    this.legRight = new THREE.Mesh(legGeo, armMat);
    this.legRight.position.set(0.2, -1.6, -1.1);
    this.inspectPivot.add(this.legRight);
  }

  initFacialFeatures() {
    // Optic Cup (Developing pigmented eye)
    const eyeGeo = new THREE.SphereGeometry(0.28, 12, 12);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.1,
      emissive: 0x0f172a,
      emissiveIntensity: 0.3
    });

    const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
    eyeLeft.position.set(1.1, 2.8, 0.9);
    this.inspectPivot.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
    eyeRight.position.set(1.1, 2.8, -0.9);
    this.inspectPivot.add(eyeRight);

    // Branchial / Pharyngeal Arches (Throat arches)
    for (let i = 0; i < 3; i++) {
      const archGeo = new THREE.TorusGeometry(0.4 - i * 0.05, 0.08, 8, 16, Math.PI);
      const archMat = new THREE.MeshStandardMaterial({ color: 0xfb7185 });
      const arch = new THREE.Mesh(archGeo, archMat);
      arch.position.set(1.2 - i * 0.2, 1.8 - i * 0.3, 0);
      arch.rotation.y = Math.PI * 0.5;
      this.inspectPivot.add(arch);
    }
  }

  initUmbilicalStalk() {
    // Umbilical connection cord leading to maternal-fetal exchange
    const cordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.8, -0.5, 0),
      new THREE.Vector3(2.2, -0.8, 1.0),
      new THREE.Vector3(4.0, -1.4, 1.6)
    ]);
    const cordGeo = new THREE.TubeGeometry(cordCurve, 16, 0.35, 12, false);
    const cordMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.3,
      transparent: true,
      opacity: 0.8
    });
    this.cordMesh = new THREE.Mesh(cordGeo, cordMat);
    this.inspectPivot.add(this.cordMesh);
  }

  update(delta, params = {}) {
    const time = performance.now() * 0.001;

    // 1. Auto 360° Turntable Rotation
    if (params.autoRotate360) {
      this.inspectPivot.rotation.y += delta * (params.rotationSpeed360 || 0.5);
    }

    // 2. Cardiac Cycle Pulse Synchronized with Heart Rate BPM (e.g. 140 BPM)
    const bpm = params.heartRateBPM || 140;
    const heartFreq = (bpm / 60.0) * Math.PI * 2;
    // Systolic contraction spike
    const rawPulse = Math.sin(time * heartFreq);
    const systolicPulse = Math.pow(Math.max(0, rawPulse), 3.0); // Sharp rhythmic beat

    // Update body shader
    if (this.bodyMat.uniforms) {
      this.bodyMat.uniforms.uTime.value = time;
      this.bodyMat.uniforms.uHeartbeatPulse.value = systolicPulse;
    }

    // Physical rhythmic expansion of cardiac tube
    const heartScale = 1.0 + systolicPulse * 0.25;
    this.heartGroup.scale.set(heartScale, heartScale, heartScale);
    this.heartMat.emissiveIntensity = 0.6 + systolicPulse * 1.4;
  }
}
