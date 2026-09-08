import * as THREE from 'three';

/**
 * Stage 5: Pulmonary Alveolar Capillary Gas Exchange Model
 * Features:
 * - Spherical lung alveoli cluster with respiratory ventilation expansion
 * - Capillary microvascular basket wrapping the alveoli
 * - Single-file erythrocyte stream transitioning color from venous cyan-blue to arterial ruby-red
 * - Floating O2 (oxygen uptake) and CO2 (carbon dioxide release) diffusion particles
 */
export class AlveolarCapillaryGasExchangeModel {
  constructor(pos = { x: -15, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(pos.x, pos.y, pos.z);

    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.time = 0;
    this.initModel();
  }

  initModel() {
    // 1. Central Alveoli Cluster (Spherical air sacs with gentle respiratory breathing)
    this.alveoliCluster = new THREE.Group();
    const alvMat = new THREE.MeshStandardMaterial({
      color: 0xfbcfe8,
      roughness: 0.45,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
      emissive: 0xf472b6,
      emissiveIntensity: 0.2
    });

    const sacPositions = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-1.4, 0.8, 0.5),
      new THREE.Vector3(1.5, -0.6, -0.4),
      new THREE.Vector3(0.5, 1.6, -0.8),
      new THREE.Vector3(-0.8, -1.2, 0.6)
    ];

    sacPositions.forEach(p => {
      const geo = new THREE.SphereGeometry(1.8, 24, 20);
      const mesh = new THREE.Mesh(geo, alvMat);
      mesh.position.copy(p);
      this.alveoliCluster.add(mesh);
    });
    this.inspectPivot.add(this.alveoliCluster);

    // 2. Microvascular Capillary Basket
    const capillaryGroup = new THREE.Group();
    const capMat = new THREE.LineBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.65 });
    for (let c = 0; c < 24; c++) {
      const theta = (c / 24) * Math.PI * 2;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-5.0, Math.sin(theta) * 2.2, Math.cos(theta) * 2.2),
        new THREE.Vector3(-2.2, Math.sin(theta + 0.6) * 3.2, Math.cos(theta + 0.6) * 3.2),
        new THREE.Vector3(0, Math.sin(theta) * 3.4, Math.cos(theta) * 3.4),
        new THREE.Vector3(2.2, Math.sin(theta - 0.6) * 3.2, Math.cos(theta - 0.6) * 3.2),
        new THREE.Vector3(5.0, Math.sin(theta) * 2.2, Math.cos(theta) * 2.2)
      ]);
      const geo = new THREE.TubeGeometry(curve, 24, 0.16, 8, false);
      const cap = new THREE.Mesh(geo, capMat);
      capillaryGroup.add(cap);
    }
    this.inspectPivot.add(capillaryGroup);

    // 3. Erythrocyte Color-Transition Streamline
    const rbcCount = 110;
    const rbcGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12);
    const rbcMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.2 });
    this.rbcMesh = new THREE.InstancedMesh(rbcGeo, rbcMat, rbcCount);
    this.rbcData = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < rbcCount; i++) {
      const progress = i / rbcCount;
      const x = -5.5 + progress * 11.0;
      const angle = progress * Math.PI * 6.0;
      const r = 3.2 + Math.sin(progress * Math.PI * 4.0) * 0.4;
      const y = Math.sin(angle) * r;
      const z = Math.cos(angle) * r;

      this.rbcData.push({ progress, x, y, z, r, angle, speed: 0.12 });
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      this.rbcMesh.setMatrixAt(i, dummy.matrix);

      // Gradient color: Cyan/Blue (X < -1) -> Purple/Violet -> Ruby Red (X > 1)
      const color = new THREE.Color();
      if (x < -1.5) {
        color.set(0x2563eb);
      } else if (x > 1.5) {
        color.set(0xdc2626);
      } else {
        const t = (x + 1.5) / 3.0;
        color.set(0x2563eb).lerp(new THREE.Color(0xdc2626), t);
      }
      this.rbcMesh.setColorAt(i, color);
    }
    if (this.rbcMesh.instanceColor) this.rbcMesh.instanceColor.needsUpdate = true;
    this.inspectPivot.add(this.rbcMesh);

    // 4. Gas Diffusion Particles (Gold O2 entering, Cyan CO2 exiting)
    const gasCount = 80;
    const gasGeo = new THREE.BufferGeometry();
    const gPos = new Float32Array(gasCount * 3);
    const gCol = new Float32Array(gasCount * 3);
    for (let g = 0; g < gasCount; g++) {
      const idx = g * 3;
      const isO2 = g < 40;
      gPos[idx] = THREE.MathUtils.randFloat(-2.5, 2.5);
      gPos[idx + 1] = THREE.MathUtils.randFloat(-2.5, 2.5);
      gPos[idx + 2] = THREE.MathUtils.randFloat(-2.5, 2.5);

      if (isO2) {
        gCol[idx] = 1.0; gCol[idx + 1] = 0.85; gCol[idx + 2] = 0.2; // O2 gold
      } else {
        gCol[idx] = 0.3; gCol[idx + 1] = 0.7; gCol[idx + 2] = 1.0; // CO2 cyan
      }
    }
    gasGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
    gasGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3));
    const gasMat = new THREE.PointsMaterial({ size: 0.45, vertexColors: true, transparent: true, opacity: 0.85 });
    this.gasPoints = new THREE.Points(gasGeo, gasMat);
    this.inspectPivot.add(this.gasPoints);
  }

  update(delta, params = {}) {
    this.time += delta;

    // Respiratory ventilation expansion (gentle breathing rhythm ~16 breaths/min)
    const breath = 1.0 + Math.sin(this.time * 1.6) * 0.08;
    this.alveoliCluster.scale.set(breath, breath, breath);

    // Animate RBC flow along capillaries with real-time color update
    if (this.rbcMesh) {
      const dummy = new THREE.Object3D();
      const color = new THREE.Color();

      for (let i = 0; i < this.rbcData.length; i++) {
        const d = this.rbcData[i];
        d.progress += d.speed * delta;
        if (d.progress > 1.0) d.progress = 0.0;

        d.x = -5.5 + d.progress * 11.0;
        d.angle += delta * 1.5;
        d.y = Math.sin(d.angle) * d.r;
        d.z = Math.cos(d.angle) * d.r;

        dummy.position.set(d.x, d.y, d.z);
        dummy.rotation.x += delta * 2.0;
        dummy.updateMatrix();
        this.rbcMesh.setMatrixAt(i, dummy.matrix);

        // Transition color as cell passes alveolar exchange window
        if (d.x < -1.5) {
          color.set(0x2563eb);
        } else if (d.x > 1.5) {
          color.set(0xdc2626);
        } else {
          const t = (d.x + 1.5) / 3.0;
          color.set(0x2563eb).lerp(new THREE.Color(0xdc2626), t);
        }
        this.rbcMesh.setColorAt(i, color);
      }
      this.rbcMesh.instanceMatrix.needsUpdate = true;
      if (this.rbcMesh.instanceColor) this.rbcMesh.instanceColor.needsUpdate = true;
    }

    // Jitter gas diffusion particles
    if (this.gasPoints) {
      const pos = this.gasPoints.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + Math.sin(this.time * 4.0 + i) * 0.01;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
  }
}
