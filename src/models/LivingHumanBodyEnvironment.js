import * as THREE from 'three';

/**
 * Living Human Body Background Environment
 * Features:
 * 1. Deep Organic Endothelial / Uterine Lumen Cavity with Subsurface Scattering & Breathing Peristalsis
 * 2. 1,200+ Flowing, Tumbling Biconcave Red Blood Cells (Erythrocytes) along Bloodstream Currents
 * 3. Granulated White Blood Cells (Leukocytes) & Platelets
 * 4. Branching Bioluminescent Nerve Plexus with Pulsating Electrical Action Potentials
 * 5. Arterial & Venous Capillary Networks with Vascular Pulse
 * 6. Floating Blood Plasma Micro-Nutrients & Fluid Shimmer
 */
export class LivingHumanBodyEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.rbcCount = 1200;
    this.rbcData = [];

    this.initTissueTunnel();
    this.initFlowingRedBloodCells();
    this.initWhiteBloodCells();
    this.initNervePlexus();
    this.initVascularCapillaries();
    this.initPlasmaParticles();
  }

  initTissueTunnel() {
    // Giant curving organic anatomical body cavity / vascular lumen spanning the entire world (X: -160 to +280)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-160, -4, -8),
      new THREE.Vector3(-100, 2, 6),
      new THREE.Vector3(-30, -2, -4),
      new THREE.Vector3(40, 3, 5),
      new THREE.Vector3(120, -1, -3),
      new THREE.Vector3(200, 4, 6),
      new THREE.Vector3(280, 0, 0)
    ]);

    // Tubular lumen mesh with organic mucosal folds
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 28, 32, false);

    // Deform vertices slightly to create organic cellular ridges and rugae folds
    const posAttr = tubeGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);

      // Micro-rugal wrinkles
      const noise = Math.sin(x * 0.2 + y * 0.3) * Math.cos(z * 0.2) * 1.8;
      posAttr.setXYZ(i, x, y + noise * 0.4, z + noise * 0.4);
    }
    tubeGeo.computeVertexNormals();

    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x4c0519,       // Deep rich biological burgundy
      roughness: 0.65,
      metalness: 0.15,
      side: THREE.BackSide, // Interior view (inside the human body)
      emissive: 0x1f0208,
      emissiveIntensity: 0.45
    });

    this.tissueMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.group.add(this.tissueMesh);
  }

  initFlowingRedBloodCells() {
    // Realistic Biconcave Disc Erythrocyte Geometry (Squashed sphere with center depression)
    const rbcGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.22, 16, 4);
    // Pinch top and bottom center to form authentic biconcave shape
    const pos = rbcGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const distFromCenter = Math.hypot(x, z);

      if (Math.abs(y) > 0.08) {
        // Indent towards center
        const pinch = (1.0 - Math.exp(-distFromCenter * 3.5)) * 0.65 + 0.35;
        pos.setY(i, y * pinch);
      }
    }
    rbcGeo.computeVertexNormals();

    // Glossy oxygen-rich hemoglobin material
    const rbcMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,      // Arterial crimson
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.92
    });

    this.rbcMesh = new THREE.InstancedMesh(rbcGeo, rbcMat, this.rbcCount);
    this.rbcMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(this.rbcMesh);

    this.dummy = new THREE.Object3D();

    for (let i = 0; i < this.rbcCount; i++) {
      this.rbcData.push({
        x: -160 + Math.random() * 440,
        y: (Math.random() - 0.5) * 32,
        z: (Math.random() - 0.5) * 32,
        vx: 3.5 + Math.random() * 4.5, // Flowing along bloodstream
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 2.0,
        vRotY: (Math.random() - 0.5) * 2.0,
        scale: 0.8 + Math.random() * 0.5
      });
    }
  }

  initWhiteBloodCells() {
    // Spherical granulated Leukocytes (White Blood Cells)
    const wbcCount = 80;
    const wbcGeo = new THREE.SphereGeometry(0.9, 14, 12);
    const wbcMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.4,
      emissive: 0x94a3b8,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.88
    });

    this.wbcMesh = new THREE.InstancedMesh(wbcGeo, wbcMat, wbcCount);
    this.wbcData = [];

    const dummy = new THREE.Object3D();
    for (let i = 0; i < wbcCount; i++) {
      const data = {
        x: -160 + Math.random() * 440,
        y: (Math.random() - 0.5) * 28,
        z: (Math.random() - 0.5) * 28,
        vx: 2.0 + Math.random() * 2.5
      };
      this.wbcData.push(data);

      dummy.position.set(data.x, data.y, data.z);
      dummy.updateMatrix();
      this.wbcMesh.setMatrixAt(i, dummy.matrix);
    }
    this.wbcMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.wbcMesh);
  }

  initNervePlexus() {
    // Branching glowing nerve fiber networks running along walls and overhead
    this.nerveGroup = new THREE.Group();
    this.actionPotentials = []; // Array of moving action potential electrical sparks

    const nerveTracks = [
      // Major longitudinal neural tracts
      [new THREE.Vector3(-150, 18, -12), new THREE.Vector3(-60, 22, -8), new THREE.Vector3(40, 20, -10), new THREE.Vector3(140, 24, -6), new THREE.Vector3(260, 18, -10)],
      [new THREE.Vector3(-140, -16, 14), new THREE.Vector3(-40, -20, 10), new THREE.Vector3(60, -18, 12), new THREE.Vector3(160, -22, 8), new THREE.Vector3(250, -16, 12)],
      [new THREE.Vector3(-120, 10, 16), new THREE.Vector3(-20, 14, 18), new THREE.Vector3(90, 12, 15), new THREE.Vector3(200, 16, 18)],
      [new THREE.Vector3(-80, -12, -16), new THREE.Vector3(15, -14, -18), new THREE.Vector3(110, -10, -15), new THREE.Vector3(220, -15, -16)]
    ];

    nerveTracks.forEach((pts, trackIdx) => {
      const nCurve = new THREE.CatmullRomCurve3(pts);
      const nGeo = new THREE.TubeGeometry(nCurve, 40, 0.28, 8, false);
      const nMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        roughness: 0.3
      });
      const nerveMesh = new THREE.Mesh(nGeo, nMat);
      this.nerveGroup.add(nerveMesh);

      // Branching dendritic arborizations
      for (let j = 0; j < 8; j++) {
        const t = j / 8;
        const root = nCurve.getPoint(t);
        const branchEnd = root.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ));
        const bCurve = new THREE.CatmullRomCurve3([root, branchEnd]);
        const bGeo = new THREE.TubeGeometry(bCurve, 8, 0.12, 6, false);
        const bMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
        this.nerveGroup.add(new THREE.Mesh(bGeo, bMat));
      }

      // Electrical Action Potential Spark on this nerve
      const sparkGeo = new THREE.SphereGeometry(0.55, 12, 12);
      const sparkMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
      this.nerveGroup.add(sparkMesh);

      this.actionPotentials.push({
        mesh: sparkMesh,
        curve: nCurve,
        progress: Math.random(),
        speed: 0.18 + Math.random() * 0.15
      });
    });

    this.group.add(this.nerveGroup);
  }

  initVascularCapillaries() {
    // Arterial (Crimson) and Venous (Deep Cyan/Blue) micro-vessels lining the background
    this.vascularGroup = new THREE.Group();

    const vesselCount = 18;
    for (let i = 0; i < vesselCount; i++) {
      const isArtery = i % 2 === 0;
      const xStart = -140 + (i / vesselCount) * 400;
      const yBase = (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 8);

      const vCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(xStart - 15, yBase, (Math.random() - 0.5) * 20),
        new THREE.Vector3(xStart, yBase + (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 20),
        new THREE.Vector3(xStart + 15, yBase, (Math.random() - 0.5) * 20)
      ]);

      const vGeo = new THREE.TubeGeometry(vCurve, 16, 0.35, 8, false);
      const vMat = new THREE.MeshStandardMaterial({
        color: isArtery ? 0xef4444 : 0x0284c7,
        emissive: isArtery ? 0xb91c1c : 0x0369a1,
        emissiveIntensity: 0.6,
        roughness: 0.4
      });
      this.vascularGroup.add(new THREE.Mesh(vGeo, vMat));
    }

    this.group.add(this.vascularGroup);
  }

  initPlasmaParticles() {
    // Flowing plasma nutrients, glucose, and bio-luminescent fluid micro-bubbles
    const partCount = 800;
    const partGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(partCount * 3);
    const colors = new Float32Array(partCount * 3);

    for (let i = 0; i < partCount; i++) {
      positions[i * 3] = -160 + Math.random() * 440;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 36;

      // Warm biological glow (pinkish gold)
      colors[i * 3] = 0.95;
      colors[i * 3 + 1] = 0.4 + Math.random() * 0.3;
      colors[i * 3 + 2] = 0.5 + Math.random() * 0.4;
    }

    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const partMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.plasmaPoints = new THREE.Points(partGeo, partMat);
    this.group.add(this.plasmaPoints);
  }

  update(delta, params = {}) {
    const time = performance.now() * 0.001;
    const speed = (params.simSpeed || 1.0);

    // 1. Rhythmic Biological Breathing & Vascular Peristalsis
    const bpm = params.heartRateBPM || 140;
    const heartFreq = (bpm / 60.0) * Math.PI * 2;
    const pulse = Math.pow(Math.max(0, Math.sin(time * heartFreq)), 3.0);

    // Tissue wall peristaltic expansion
    const peristalsis = 1.0 + Math.sin(time * 0.8) * 0.02 + pulse * 0.015;
    this.tissueMesh.scale.set(1.0, peristalsis, peristalsis);
    this.tissueMesh.material.emissiveIntensity = 0.35 + pulse * 0.3;

    // 2. Animate 1,200 Flowing, Tumbling Red Blood Cells
    for (let i = 0; i < this.rbcCount; i++) {
      const rbc = this.rbcData[i];
      rbc.x += rbc.vx * speed * delta * 2.2;
      if (rbc.x > 280) rbc.x = -160; // Loop seamlessly through vascular tract

      rbc.rotX += rbc.vRotX * delta * speed;
      rbc.rotY += rbc.vRotY * delta * speed;

      this.dummy.position.set(rbc.x, rbc.y + Math.sin(time * 2.0 + i) * 0.3, rbc.z + Math.cos(time * 1.5 + i) * 0.3);
      this.dummy.rotation.set(rbc.rotX, rbc.rotY, rbc.rotZ);
      this.dummy.scale.set(rbc.scale, rbc.scale, rbc.scale);
      this.dummy.updateMatrix();

      this.rbcMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.rbcMesh.instanceMatrix.needsUpdate = true;

    // 3. Animate White Blood Cells
    for (let i = 0; i < this.wbcData.length; i++) {
      const wbc = this.wbcData[i];
      wbc.x += wbc.vx * speed * delta * 1.8;
      if (wbc.x > 280) wbc.x = -160;

      this.dummy.position.set(wbc.x, wbc.y, wbc.z);
      this.dummy.scale.set(1.0, 1.0, 1.0);
      this.dummy.updateMatrix();
      this.wbcMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.wbcMesh.instanceMatrix.needsUpdate = true;

    // 4. Animate Action Potential Electrical Sparks along Nerve Fibers
    this.actionPotentials.forEach(ap => {
      ap.progress += ap.speed * delta * speed;
      if (ap.progress > 1.0) ap.progress = 0;

      const pos = ap.curve.getPoint(ap.progress);
      ap.mesh.position.copy(pos);
      // Spark flash intensity
      ap.mesh.scale.setScalar(0.8 + Math.sin(time * 20.0) * 0.4);
    });

    // 5. Drift Plasma Nutrients & Micro-bubbles
    const posArray = this.plasmaPoints.geometry.attributes.position.array;
    for (let i = 0; i < posArray.length; i += 3) {
      posArray[i] += 4.0 * delta * speed;
      if (posArray[i] > 280) posArray[i] = -160;
    }
    this.plasmaPoints.geometry.attributes.position.needsUpdate = true;
  }
}
