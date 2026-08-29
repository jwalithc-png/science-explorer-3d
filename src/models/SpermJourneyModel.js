import * as THREE from 'three';

/**
 * Stage 1: Sperm Journey & Chemotaxis Model
 * Simulates hundreds of swimming human spermatozoa through the Fallopian tube / uterine canal
 * with dynamic undulating flagellar wave mechanics, mitochondrial ATP glow, and mucosal tissue.
 */
export class SpermJourneyModel {
  constructor(position = { x: -120, y: 0, z: 0 }) {
    this.group = new THREE.Group();
    this.group.position.set(position.x, position.y, position.z);

    // Dedicated 360° inspectable rotation pivot
    this.inspectPivot = new THREE.Group();
    this.group.add(this.inspectPivot);

    this.spermCount = 180;
    this.spermData = [];

    this.initMucosalCanal();
    this.initLeadSperm();
    this.initSpermSwarm();
    this.initChemotaxisParticles();
  }

  initMucosalCanal() {
    // Curving anatomical mucosal canal (Fallopian tube lumen)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-18, -3, -5),
      new THREE.Vector3(-6, 0, 0),
      new THREE.Vector3(6, 2, 4),
      new THREE.Vector3(18, 0, 0)
    ]);

    const tubeGeo = new THREE.TubeGeometry(curve, 32, 7.5, 24, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x9f1239,
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.35,
      wireframe: false
    });

    this.mucosaMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.inspectPivot.add(this.mucosaMesh);

    // Ciliated epithelial micro-ridges
    const ringCount = 14;
    for (let i = 0; i < ringCount; i++) {
      const t = i / ringCount;
      const pt = curve.getPoint(t);
      const ringGeo = new THREE.TorusGeometry(7.2, 0.25, 8, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xbe123c,
        roughness: 0.6,
        transparent: true,
        opacity: 0.4
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pt);
      ring.lookAt(curve.getPoint(Math.min(1.0, t + 0.05)));
      this.inspectPivot.add(ring);
    }
  }

  initLeadSperm() {
    // High-fidelity featured Spermatozoon in the center for 360° close-up inspection
    this.leadSpermGroup = new THREE.Group();
    this.leadSpermGroup.position.set(0, 0.5, 0);

    // 1. Sperm Head (Condensed Chromatin + Acrosomal Cap) - Oval flattened shape
    const headGeo = new THREE.SphereGeometry(0.55, 32, 24);
    headGeo.scale(1.4, 0.95, 0.65); // Realistic flattened ellipsoid
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.25,
      metalness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2
    });
    this.leadHead = new THREE.Mesh(headGeo, headMat);
    this.leadHead.position.set(0.6, 0, 0);
    this.leadSpermGroup.add(this.leadHead);

    // Acrosome Cap (Anterior 2/3 of head)
    const acroGeo = new THREE.SphereGeometry(0.56, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    acroGeo.scale(1.42, 0.96, 0.66);
    const acroMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.3,
      transparent: true,
      opacity: 0.7,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.4
    });
    this.leadAcrosome = new THREE.Mesh(acroGeo, acroMat);
    this.leadAcrosome.rotation.z = -Math.PI * 0.5;
    this.leadAcrosome.position.set(0.62, 0, 0);
    this.leadSpermGroup.add(this.leadAcrosome);

    // 2. Mitochondrial Midpiece (Energy powerhouse packed with ATP-generating mitochondria)
    const midGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.9, 16);
    const midMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6,
      roughness: 0.4
    });
    this.leadMidpiece = new THREE.Mesh(midGeo, midMat);
    this.leadMidpiece.rotation.z = Math.PI * 0.5;
    this.leadMidpiece.position.set(-0.35, 0, 0);
    this.leadSpermGroup.add(this.leadMidpiece);

    // Mitochondrial spiral wrapping around axoneme
    const spiralCurve = new THREE.CatmullRomCurve3(
      Array.from({ length: 20 }, (_, i) => {
        const angle = i * 0.8;
        const x = -0.7 + i * 0.04;
        return new THREE.Vector3(x, Math.sin(angle) * 0.22, Math.cos(angle) * 0.22);
      })
    );
    const spiralGeo = new THREE.TubeGeometry(spiralCurve, 24, 0.04, 8, false);
    const spiralMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8
    });
    const spiralMesh = new THREE.Mesh(spiralGeo, spiralMat);
    this.leadSpermGroup.add(spiralMesh);

    // 3. Flagellar Tail (9+2 Microtubule Axoneme with active sine-wave deformation)
    this.tailSegments = 28;
    this.tailLength = 6.5;
    const tailPoints = [];
    for (let i = 0; i <= this.tailSegments; i++) {
      tailPoints.push(new THREE.Vector3(-0.8 - (i / this.tailSegments) * this.tailLength, 0, 0));
    }
    this.tailGeo = new THREE.BufferGeometry().setFromPoints(tailPoints);
    const tailMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 3,
      transparent: true,
      opacity: 0.9
    });
    this.leadTail = new THREE.Line(this.tailGeo, tailMat);
    this.leadSpermGroup.add(this.leadTail);

    this.inspectPivot.add(this.leadSpermGroup);
  }

  initSpermSwarm() {
    // Instanced swimming sperm swarm with dynamic positions & sine waves
    const headGeo = new THREE.SphereGeometry(0.35, 12, 10);
    headGeo.scale(1.4, 0.9, 0.6);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3,
      roughness: 0.3
    });

    this.swarmHeadMesh = new THREE.InstancedMesh(headGeo, headMat, this.spermCount);
    this.swarmHeadMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.inspectPivot.add(this.swarmHeadMesh);

    this.dummy = new THREE.Object3D();

    for (let i = 0; i < this.spermCount; i++) {
      this.spermData.push({
        x: (Math.random() - 0.5) * 32,
        y: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 8,
        speed: 4.5 + Math.random() * 3.5,
        freq: 8.0 + Math.random() * 4.0,
        phase: Math.random() * Math.PI * 2,
        amplitude: 0.4 + Math.random() * 0.3
      });
    }
  }

  initChemotaxisParticles() {
    // Progesterone and chemo-attractant micro-molecules drifting towards sperm
    const partCount = 400;
    const partGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(partCount * 3);
    const colors = new Float32Array(partCount * 3);

    for (let i = 0; i < partCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Golden chemo-attractant glow
      colors[i * 3] = 0.98;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 0.2;
    }

    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const partMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.chemotaxisPoints = new THREE.Points(partGeo, partMat);
    this.inspectPivot.add(this.chemotaxisPoints);
  }

  update(delta, params = {}) {
    const time = performance.now() * 0.001;
    const speedMult = (params.simSpeed || 1.0) * (params.spermMotilitySpeed || 1.0);

    // 1. Auto 360° Turntable Rotation if enabled
    if (params.autoRotate360) {
      this.inspectPivot.rotation.y += delta * (params.rotationSpeed360 || 0.5);
    }

    // 2. Animate Lead Sperm Head & Tail Sine Wave
    const leadFreq = 12.0 * speedMult;
    const leadAmp = 0.55;
    const posAttr = this.leadTail.geometry.attributes.position;

    for (let i = 0; i <= this.tailSegments; i++) {
      const frac = i / this.tailSegments;
      const x = -0.8 - frac * this.tailLength;
      // Propagating wave: amplitude increases toward the flagellum tip
      const y = Math.sin(time * leadFreq - frac * 8.0) * (leadAmp * frac * frac * 1.8);
      const z = Math.cos(time * leadFreq - frac * 8.0) * (leadAmp * frac * 0.8);
      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;

    // Slight head yaw/pitch oscillation due to flagellar reaction forces
    this.leadHead.rotation.y = Math.sin(time * leadFreq) * 0.15;
    this.leadHead.rotation.z = Math.cos(time * leadFreq) * 0.1;

    // 3. Animate Instanced Swarm
    for (let i = 0; i < this.spermCount; i++) {
      const s = this.spermData[i];
      s.x += s.speed * speedMult * delta;
      if (s.x > 18) s.x = -18; // Wrap around tube

      const wave = Math.sin(time * s.freq * speedMult + s.phase) * s.amplitude;

      this.dummy.position.set(s.x, s.y + wave * 0.5, s.z + Math.cos(time * s.freq) * 0.2);
      this.dummy.rotation.set(0, 0, Math.cos(time * s.freq * speedMult) * 0.2);
      this.dummy.scale.set(0.8, 0.8, 0.8);
      this.dummy.updateMatrix();

      this.swarmHeadMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.swarmHeadMesh.instanceMatrix.needsUpdate = true;

    // 4. Drift Chemotaxis Particles
    const pos = this.chemotaxisPoints.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i] -= 1.5 * delta * speedMult; // Drift towards approaching sperm
      if (pos[i] < -18) pos[i] = 18;
    }
    this.chemotaxisPoints.geometry.attributes.position.needsUpdate = true;
  }
}
