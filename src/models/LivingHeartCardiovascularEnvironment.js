import * as THREE from 'three';

/**
 * Living Heart & Cardiovascular Background Environment
 * 
 * Features:
 * 1. Deep Organic Thoracic & Pericardial Lumen with Endothelial Sheen & Rhythmic Systolic Contraction
 * 2. 1,400+ Flowing, Tumbling Biconcave Red Blood Cells (Erythrocytes):
 *    - Deoxygenated Venous Flow (Cyan/Blue) on the right-heart / pulmonary transit
 *    - Transition / Oxygenation Zone in the pulmonary capillary region
 *    - Oxygenated Arterial Flow (Ruby Scarlet) on the left-heart / systemic aorta transit
 * 3. White Blood Cells (Leukocytes - Neutrophils & Monocytes) rolling along endothelial margins
 * 4. Micro-Thrombocytes (Platelets) shimmering in the fluid stream
 * 5. Branching Coronary Arterial & Venous Capillaries with Rhythmic Systolic Vascular Pulse
 * 6. Floating Blood Plasma Micro-Nutrients & Bio-Fluid Shimmer Currents
 * 7. Cardiac Conduction Action Potential Wavefront Impulses
 */
export class LivingHeartCardiovascularEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'LivingHeartCardiovascularEnvironment';
    this.scene.add(this.group);

    this.time = 0;
    this.pulsePhase = 0;
    this.rbcCount = 1400;
    this.rbcData = [];

    this.initThoracicPericardiumTunnel();
    this.initFlowingRedBloodCells();
    this.initWhiteBloodCells();
    this.initPlatelets();
    this.initCoronaryCapillaries();
    this.initPlasmaStreamlines();
    this.initConductionImpulses();
  }

  initThoracicPericardiumTunnel() {
    // Curving anatomical thoracic cavity / great vessel conduit spanning X: -170 to +180
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-170, -3, -8),
      new THREE.Vector3(-120, 2, 5),
      new THREE.Vector3(-60, -2, -4),
      new THREE.Vector3(0, 4, 6),
      new THREE.Vector3(60, -1, -3),
      new THREE.Vector3(120, 3, 5),
      new THREE.Vector3(180, 0, 0)
    ]);

    const tubeGeo = new THREE.TubeGeometry(curve, 72, 32, 32, false);

    // Sculpt muscular rugae and trabecular myocardial folds
    const posAttr = tubeGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);

      // Anatomical myocardial ridges
      const noise = Math.sin(x * 0.15 + y * 0.25) * Math.cos(z * 0.18) * 2.2;
      posAttr.setXYZ(i, x, y + noise * 0.5, z + noise * 0.5);
    }
    tubeGeo.computeVertexNormals();

    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x3b0712,       // Deep rich myocardial burgundy
      roughness: 0.60,
      metalness: 0.18,
      side: THREE.BackSide, // Interior view (inside the living thoracic/cardiac space)
      emissive: 0x1a0206,
      emissiveIntensity: 0.50
    });

    this.pericardiumMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.group.add(this.pericardiumMesh);
  }

  initFlowingRedBloodCells() {
    // Authentic Biconcave Disc Erythrocyte Geometry
    const rbcGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.22, 16, 4);
    const pos = rbcGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const dist = Math.hypot(x, z);

      if (Math.abs(y) > 0.08) {
        // Pinch top and bottom center to form authentic biconcave shape
        const pinch = (1.0 - Math.exp(-dist * 3.2)) * 0.62 + 0.38;
        pos.setY(i, y * pinch);
      }
    }
    rbcGeo.computeVertexNormals();

    // InstancedMesh for 1,400 high-performance red blood cells
    const rbcMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Tinted per instance (venous blue-purple to arterial ruby-red)
      roughness: 0.28,
      metalness: 0.22,
      side: THREE.DoubleSide
    });

    this.rbcInstancedMesh = new THREE.InstancedMesh(rbcGeo, rbcMat, this.rbcCount);
    this.rbcInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < this.rbcCount; i++) {
      const x = THREE.MathUtils.randFloat(-165, 175);
      const radius = THREE.MathUtils.randFloat(2.5, 24.0);
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const y = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const scale = THREE.MathUtils.randFloat(0.75, 1.25);
      const rotSpeedX = THREE.MathUtils.randFloat(-1.8, 1.8);
      const rotSpeedY = THREE.MathUtils.randFloat(-2.2, 2.2);
      const rotSpeedZ = THREE.MathUtils.randFloat(-1.5, 1.5);
      const flowSpeed = THREE.MathUtils.randFloat(18.0, 32.0);

      this.rbcData.push({
        x, y, z,
        baseY: y,
        baseZ: z,
        scale,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        rotSpeedX,
        rotSpeedY,
        rotSpeedZ,
        flowSpeed,
        phase: Math.random() * Math.PI * 2
      });

      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      this.rbcInstancedMesh.setMatrixAt(i, dummy.matrix);

      // Color coding: Blue/Cyan for venous (X < -15), Purple gradient (-15 < X < 15), Ruby Red for arterial (X > 15)
      if (x < -15) {
        // Deoxygenated venous blood
        color.setHSL(0.58 + (x + 165) * 0.0003, 0.85, 0.48);
      } else if (x > 15) {
        // Oxygenated arterial ruby blood
        color.setHSL(0.98, 0.90, 0.46);
      } else {
        // Alveolar transition: blue -> magenta -> crimson
        const t = (x + 15) / 30;
        const venous = new THREE.Color(0x2563eb);
        const arterial = new THREE.Color(0xdc2626);
        color.copy(venous).lerp(arterial, t);
      }
      this.rbcInstancedMesh.setColorAt(i, color);
    }

    if (this.rbcInstancedMesh.instanceColor) {
      this.rbcInstancedMesh.instanceColor.needsUpdate = true;
    }
    this.rbcInstancedMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.rbcInstancedMesh);
  }

  initWhiteBloodCells() {
    // Granulated spherical leukocytes (Neutrophils & Lymphocytes)
    const wbcCount = 90;
    const wbcGeo = new THREE.DodecahedronGeometry(1.15, 2);
    const wbcMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.55,
      metalness: 0.10,
      emissive: 0x94a3b8,
      emissiveIntensity: 0.25
    });

    this.wbcMesh = new THREE.InstancedMesh(wbcGeo, wbcMat, wbcCount);
    this.wbcData = [];

    const dummy = new THREE.Object3D();
    for (let i = 0; i < wbcCount; i++) {
      const x = THREE.MathUtils.randFloat(-160, 170);
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const radius = THREE.MathUtils.randFloat(18.0, 26.0); // Roll closer to endothelial walls
      const y = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      this.wbcData.push({
        x, y, z,
        scale: THREE.MathUtils.randFloat(0.85, 1.3),
        flowSpeed: THREE.MathUtils.randFloat(8.0, 15.0), // Slower rolling movement
        rotSpeed: THREE.MathUtils.randFloat(0.5, 1.2),
        rot: Math.random() * Math.PI * 2
      });

      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      this.wbcMesh.setMatrixAt(i, dummy.matrix);
    }

    this.wbcMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.wbcMesh);
  }

  initPlatelets() {
    // Platelets (Thrombocytes) - small glistening discoid fragments
    const plateletCount = 300;
    const pGeo = new THREE.TetrahedronGeometry(0.35, 1);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.3,
      metalness: 0.4,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.45
    });

    this.plateletMesh = new THREE.InstancedMesh(pGeo, pMat, plateletCount);
    this.plateletData = [];

    const dummy = new THREE.Object3D();
    for (let i = 0; i < plateletCount; i++) {
      const x = THREE.MathUtils.randFloat(-165, 175);
      const radius = THREE.MathUtils.randFloat(3.0, 22.0);
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const y = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      this.plateletData.push({
        x, y, z,
        flowSpeed: THREE.MathUtils.randFloat(22.0, 38.0),
        rotSpeed: THREE.MathUtils.randFloat(2.0, 5.0),
        rot: Math.random() * Math.PI
      });

      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      this.plateletMesh.setMatrixAt(i, dummy.matrix);
    }

    this.plateletMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.plateletMesh);
  }

  initCoronaryCapillaries() {
    // Intricate bioluminescent coronary vascular network embedded in heart walls
    const capillaryGroup = new THREE.Group();
    const mat = new THREE.LineBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.40,
      blending: THREE.AdditiveBlending
    });

    for (let branch = 0; branch < 36; branch++) {
      const startX = THREE.MathUtils.randFloat(-150, 160);
      const startAngle = Math.random() * Math.PI * 2;
      const startRadius = 26;
      let curr = new THREE.Vector3(startX, Math.sin(startAngle) * startRadius, Math.cos(startAngle) * startRadius);

      const points = [curr.clone()];
      for (let seg = 0; seg < 10; seg++) {
        const nextX = curr.x + THREE.MathUtils.randFloat(-4, 6);
        const nextAngle = startAngle + (seg * 0.08) + THREE.MathUtils.randFloat(-0.06, 0.06);
        const nextRadius = startRadius - (seg * 0.4);
        curr = new THREE.Vector3(nextX, Math.sin(nextAngle) * nextRadius, Math.cos(nextAngle) * nextRadius);
        points.push(curr.clone());
      }

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, mat);
      capillaryGroup.add(line);
    }

    this.capillaries = capillaryGroup;
    this.group.add(this.capillaries);
  }

  initPlasmaStreamlines() {
    // Floating bio-fluid shimmer particles (albumin, electrolytes, hormones)
    const count = 600;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const x = THREE.MathUtils.randFloat(-165, 175);
      const angle = Math.random() * Math.PI * 2;
      const r = THREE.MathUtils.randFloat(1.5, 23.0);
      positions[idx] = x;
      positions[idx + 1] = Math.sin(angle) * r;
      positions[idx + 2] = Math.cos(angle) * r;

      if (x < -15) {
        colors[idx] = 0.22;
        colors[idx + 1] = 0.60;
        colors[idx + 2] = 0.98;
      } else {
        colors[idx] = 0.98;
        colors[idx + 1] = 0.40;
        colors[idx + 2] = 0.35;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.60,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });

    this.plasmaParticles = new THREE.Points(geo, mat);
    this.group.add(this.plasmaParticles);
  }

  initConductionImpulses() {
    // Electrical conduction action potentials traveling through myocardial tissue
    const count = 120;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx] = THREE.MathUtils.randFloat(-150, 160);
      positions[idx + 1] = THREE.MathUtils.randFloat(-12, 12);
      positions[idx + 2] = THREE.MathUtils.randFloat(-12, 12);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.4,
      color: 0xfef08a, // Brilliant electrical gold
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.conductionPoints = new THREE.Points(geo, mat);
    this.group.add(this.conductionPoints);
  }

  update(delta, params = {}) {
    const hr = params.heartRateBPM || 75;
    const beatFreq = (hr / 60.0) * Math.PI * 2; // Rad/sec matching live heart rate
    const speedMult = params.simSpeed !== undefined ? params.simSpeed : 1.0;

    this.time += delta * speedMult;
    this.pulsePhase += delta * beatFreq * speedMult;

    // Rhythmic Systolic / Diastolic Cardiac Pulse (Lub-Dub wave)
    const systolicS1 = Math.pow(Math.max(0, Math.sin(this.pulsePhase)), 8);
    const diastolicS2 = Math.pow(Math.max(0, Math.sin(this.pulsePhase + 0.35 * Math.PI)), 10) * 0.7;
    const cardiacPulse = systolicS1 + diastolicS2;

    // 1. Pulsate pericardial cavity wall
    if (this.pericardiumMesh) {
      const wallScale = 1.0 + cardiacPulse * 0.045;
      this.pericardiumMesh.scale.set(1.0, wallScale, wallScale);
      this.pericardiumMesh.material.emissiveIntensity = 0.40 + cardiacPulse * 0.45;
    }

    // 2. Animate 1,400 flowing & tumbling Red Blood Cells
    if (this.rbcInstancedMesh) {
      const dummy = new THREE.Object3D();
      const color = new THREE.Color();
      const flowBoost = 1.0 + cardiacPulse * 0.65; // Arterial systolic rush

      for (let i = 0; i < this.rbcCount; i++) {
        const d = this.rbcData[i];
        d.x += d.flowSpeed * flowBoost * delta * 0.75 * speedMult;
        d.rotX += d.rotSpeedX * delta;
        d.rotY += d.rotSpeedY * delta;
        d.rotZ += d.rotSpeedZ * delta;

        // Wrap around seamlessly
        if (d.x > 175) {
          d.x = -165;
        }

        // Slight radial breathing matching systolic pulse
        const radPulse = 1.0 + cardiacPulse * 0.08;
        const curY = d.baseY * radPulse;
        const curZ = d.baseZ * radPulse;

        dummy.position.set(d.x, curY, curZ);
        dummy.rotation.set(d.rotX, d.rotY, d.rotZ);
        dummy.scale.set(d.scale, d.scale, d.scale);
        dummy.updateMatrix();
        this.rbcInstancedMesh.setMatrixAt(i, dummy.matrix);

        // Dynamic oxygenation color transition at lungs (X: -15 to +15)
        if (d.x < -15) {
          color.setHSL(0.58 + (d.x + 165) * 0.0003, 0.85, 0.48);
        } else if (d.x > 15) {
          color.setHSL(0.98, 0.90, 0.46);
        } else {
          const t = (d.x + 15) / 30;
          color.set(0x2563eb).lerp(new THREE.Color(0xdc2626), t);
        }
        this.rbcInstancedMesh.setColorAt(i, color);
      }

      this.rbcInstancedMesh.instanceMatrix.needsUpdate = true;
      if (this.rbcInstancedMesh.instanceColor) {
        this.rbcInstancedMesh.instanceColor.needsUpdate = true;
      }
    }

    // 3. Animate White Blood Cells
    if (this.wbcMesh) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.wbcData.length; i++) {
        const w = this.wbcData[i];
        w.x += w.flowSpeed * delta * speedMult;
        w.rot += w.rotSpeed * delta;
        if (w.x > 170) w.x = -160;

        dummy.position.set(w.x, w.y, w.z);
        dummy.rotation.set(w.rot, w.rot * 0.8, 0);
        dummy.scale.set(w.scale, w.scale, w.scale);
        dummy.updateMatrix();
        this.wbcMesh.setMatrixAt(i, dummy.matrix);
      }
      this.wbcMesh.instanceMatrix.needsUpdate = true;
    }

    // 4. Animate Platelets
    if (this.plateletMesh) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.plateletData.length; i++) {
        const p = this.plateletData[i];
        p.x += p.flowSpeed * delta * speedMult;
        p.rot += p.rotSpeed * delta;
        if (p.x > 175) p.x = -165;

        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(p.rot, p.rot, p.rot);
        dummy.updateMatrix();
        this.plateletMesh.setMatrixAt(i, dummy.matrix);
      }
      this.plateletMesh.instanceMatrix.needsUpdate = true;
    }

    // 5. Plasma Particles
    if (this.plasmaParticles) {
      const pos = this.plasmaParticles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i) + 20.0 * delta * speedMult;
        if (x > 175) x = -165;
        pos.setX(i, x);
      }
      pos.needsUpdate = true;
    }

    // 6. Coronary Capillary Vascular Glow
    if (this.capillaries) {
      this.capillaries.children.forEach(line => {
        if (line.material) {
          line.material.opacity = 0.25 + cardiacPulse * 0.50;
        }
      });
    }

    // 7. Electrical Action Potential Impulses
    if (this.conductionPoints) {
      const pos = this.conductionPoints.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i) + 48.0 * delta * speedMult; // Rapid conduction velocity
        if (x > 160) x = -150;
        pos.setX(i, x);
      }
      pos.needsUpdate = true;
      this.conductionPoints.material.opacity = 0.55 + cardiacPulse * 0.40;
    }
  }
}
