import * as THREE from 'three';

/**
 * Living Photosynthesis Biosphere & Plant Micro-Environment
 * Features:
 * 1. Sprawling 3D Ancient Forest Canopy & Cellular Biosphere spanning X: -160 to +280
 * 2. Volumetric God Rays (Sunlight Shafts) streaming through the humid canopy air
 * 3. 2,000+ Quantum Solar Photons (hν golden wave packets) traveling from Sun to leaves
 * 4. Atmospheric Molecular Gas Currents:
 *    - CO2 (Carbon Dioxide) gray-pearl molecules drifting toward stomata
 *    - H2O (Water) cyan molecules ascending xylem vessels
 *    - O2 (Molecular Oxygen) vibrant red bubbles released into the forest atmosphere
 * 5. High-speed Cytoplasmic Streaming (Cyclosis) currents inside plant cells
 * 6. Bio-Energetic Sparkles: ATP energy pulses and Proton (H+) glowing electric ion streams
 */
export class LivingPhotosynthesisEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.time = 0;

    this.initForestBiosphere();
    this.initVolumetricSunbeams();
    this.initStreamingPhotons();
    this.initMolecularGasFlow();
    this.initCytoplasmicStreaming();
    this.initBioEnergySparks();
  }

  initForestBiosphere() {
    // Curving organic canopy ceiling and lush green biome spanning X: -160 to +280
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-160, -6, -10),
      new THREE.Vector3(-80, 2, 8),
      new THREE.Vector3(0, -2, -6),
      new THREE.Vector3(80, 4, 6),
      new THREE.Vector3(160, -1, -4),
      new THREE.Vector3(240, 3, 5),
      new THREE.Vector3(290, 0, 0)
    ]);

    const tubeGeo = new THREE.TubeGeometry(curve, 64, 30, 32, false);
    // Add organic undulating leaf cell wall texture
    const pos = tubeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const wave = Math.sin(x * 0.15 + y * 0.25) * Math.cos(z * 0.2) * 2.2;
      pos.setXYZ(i, x, y + wave * 0.4, z + wave * 0.4);
    }
    tubeGeo.computeVertexNormals();

    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x052e16,       // Deep rich photosynthetic chlorophyll green
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.BackSide,  // Interior biome view
      emissive: 0x022c22,
      emissiveIntensity: 0.5
    });

    this.biosphereMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.group.add(this.biosphereMesh);

    // Forest floor terrain with moss & grass hills
    const floorGeo = new THREE.PlaneGeometry(460, 60, 40, 10);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.85
    });
    this.floorMesh = new THREE.Mesh(floorGeo, floorMat);
    this.floorMesh.position.set(60, -14, 0);
    this.group.add(this.floorMesh);
  }

  initVolumetricSunbeams() {
    // Volumetric diagonal light shafts (God Rays) pouring down through foliage
    this.godRayGroup = new THREE.Group();
    const rayCount = 14;

    for (let i = 0; i < rayCount; i++) {
      const x = -140 + (i / rayCount) * 420;
      const angle = 0.25 + (Math.random() - 0.5) * 0.15;
      const height = 35 + Math.random() * 15;
      const radiusTop = 0.6 + Math.random() * 0.8;
      const radiusBottom = 4.0 + Math.random() * 3.5;

      const coneGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.12 + Math.random() * 0.08,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const ray = new THREE.Mesh(coneGeo, coneMat);
      ray.position.set(x, 10, (Math.random() - 0.5) * 16);
      ray.rotation.z = angle;
      ray.rotation.x = (Math.random() - 0.5) * 0.2;
      this.godRayGroup.add(ray);
    }

    this.group.add(this.godRayGroup);
  }

  initStreamingPhotons() {
    // 2,000 high-speed golden photon wave packets (hν) streaming continuously
    this.photonCount = 2000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.photonCount * 3);
    const velocities = new Float32Array(this.photonCount * 3);
    const colors = new Float32Array(this.photonCount * 3);

    for (let i = 0; i < this.photonCount; i++) {
      positions[i * 3] = -150 + Math.random() * 440;
      positions[i * 3 + 1] = -10 + Math.random() * 32;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 34;

      // Downward and forward photon trajectory
      velocities[i * 3] = 12.0 + Math.random() * 18.0;
      velocities[i * 3 + 1] = -2.0 - Math.random() * 4.0;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 3.0;

      // Radiant photon wavelengths: 680nm red, 430nm blue, 550nm gold
      const pType = Math.random();
      if (pType < 0.6) {
        colors[i * 3] = 0.98; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.15; // Sunlight Gold
      } else if (pType < 0.85) {
        colors[i * 3] = 0.22; colors[i * 3 + 1] = 0.74; colors[i * 3 + 2] = 0.97; // Blue 430nm
      } else {
        colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.25; colors[i * 3 + 2] = 0.25; // Red 680nm
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });

    this.photonParticles = new THREE.Points(geo, mat);
    this.photonVelocities = velocities;
    this.group.add(this.photonParticles);
  }

  initMolecularGasFlow() {
    // 1,800 total molecules: CO2 (gray-pearl), H2O (cyan), O2 (red)
    this.gasCount = 1800;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.gasCount * 3);
    const velocities = new Float32Array(this.gasCount * 3);
    const colors = new Float32Array(this.gasCount * 3);

    for (let i = 0; i < this.gasCount; i++) {
      positions[i * 3] = -150 + Math.random() * 440;
      positions[i * 3 + 1] = -12 + Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 32;

      const type = i % 3;
      if (type === 0) {
        // CO2: drifting horizontally into stomata
        velocities[i * 3] = 2.5 + Math.random() * 3.0;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
        colors[i * 3] = 0.65; colors[i * 3 + 1] = 0.72; colors[i * 3 + 2] = 0.80; // Gray-pearl
      } else if (type === 1) {
        // H2O: rising upward through vascular conduits
        velocities[i * 3] = 3.0 + Math.random() * 4.0;
        velocities[i * 3 + 1] = 2.0 + Math.random() * 2.5;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
        colors[i * 3] = 0.22; colors[i * 3 + 1] = 0.74; colors[i * 3 + 2] = 0.97; // Cyan H2O
      } else {
        // O2: evolving from leaves and drifting out
        velocities[i * 3] = 3.5 + Math.random() * 3.5;
        velocities[i * 3 + 1] = 3.0 + Math.random() * 3.0;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
        colors[i * 3] = 0.94; colors[i * 3 + 1] = 0.27; colors[i * 3 + 2] = 0.27; // Coral Red O2
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.38,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending
    });

    this.gasParticles = new THREE.Points(geo, mat);
    this.gasVelocities = velocities;
    this.group.add(this.gasParticles);
  }

  initCytoplasmicStreaming() {
    // 800 glowing cyclosis particles circulating in elliptical cytoplasmic loops
    this.cyclosisCount = 800;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.cyclosisCount * 3);
    const colors = new Float32Array(this.cyclosisCount * 3);
    this.cyclosisAngles = new Float32Array(this.cyclosisCount);
    this.cyclosisRadii = new Float32Array(this.cyclosisCount);
    this.cyclosisCentersX = new Float32Array(this.cyclosisCount);

    for (let i = 0; i < this.cyclosisCount; i++) {
      this.cyclosisAngles[i] = Math.random() * Math.PI * 2;
      this.cyclosisRadii[i] = 4.0 + Math.random() * 8.0;
      this.cyclosisCentersX[i] = -80 + (i / this.cyclosisCount) * 360;

      positions[i * 3] = this.cyclosisCentersX[i] + Math.cos(this.cyclosisAngles[i]) * this.cyclosisRadii[i];
      positions[i * 3 + 1] = Math.sin(this.cyclosisAngles[i]) * (this.cyclosisRadii[i] * 0.6);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      // Vivid emerald & lime cyclosis colors
      colors[i * 3] = 0.15 + Math.random() * 0.3;
      colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
      colors[i * 3 + 2] = 0.35 + Math.random() * 0.3;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.cyclosisParticles = new THREE.Points(geo, mat);
    this.group.add(this.cyclosisParticles);
  }

  initBioEnergySparks() {
    // 500 electric high-energy electron sparks & ATP crystals
    const count = 500;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = -150 + Math.random() * 440;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xf97316, // Glowing ATP orange
      size: 0.45,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.energySparks = new THREE.Points(geo, mat);
    this.group.add(this.energySparks);
  }

  update(delta, params = {}) {
    const time = performance.now() * 0.001;
    const speedMult = params.simSpeed || 1.0;
    const deltaT = delta * speedMult;

    // 1. Volumetric God Ray shimmering & swaying
    if (this.godRayGroup) {
      this.godRayGroup.children.forEach((ray, idx) => {
        ray.material.opacity = 0.12 + Math.sin(time * 1.5 + idx) * 0.05;
        ray.rotation.z += Math.sin(time * 0.8 + idx) * 0.001 * deltaT;
      });
    }

    // 2. Stream Quantum Solar Photons
    if (this.photonParticles) {
      const pos = this.photonParticles.geometry.attributes.position.array;
      const vel = this.photonVelocities;

      for (let i = 0; i < this.photonCount; i++) {
        pos[i * 3] += vel[i * 3] * deltaT;
        pos[i * 3 + 1] += vel[i * 3 + 1] * deltaT;
        pos[i * 3 + 2] += vel[i * 3 + 2] * deltaT;

        if (pos[i * 3] > 290 || pos[i * 3 + 1] < -12) {
          pos[i * 3] = -160;
          pos[i * 3 + 1] = 6 + Math.random() * 18;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 34;
        }
      }
      this.photonParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Flow Gas Molecules (CO2, H2O, O2)
    if (this.gasParticles) {
      const pos = this.gasParticles.geometry.attributes.position.array;
      const vel = this.gasVelocities;

      for (let i = 0; i < this.gasCount; i++) {
        pos[i * 3] += vel[i * 3] * deltaT;
        pos[i * 3 + 1] += vel[i * 3 + 1] * deltaT;
        pos[i * 3 + 2] += vel[i * 3 + 2] * deltaT;

        if (pos[i * 3] > 290) pos[i * 3] = -150;
        if (pos[i * 3 + 1] > 22) pos[i * 3 + 1] = -12;
      }
      this.gasParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Cytoplasmic Streaming (Cyclosis)
    if (this.cyclosisParticles) {
      const pos = this.cyclosisParticles.geometry.attributes.position.array;
      for (let i = 0; i < this.cyclosisCount; i++) {
        this.cyclosisAngles[i] += 1.8 * deltaT;
        pos[i * 3] = this.cyclosisCentersX[i] + Math.cos(this.cyclosisAngles[i]) * this.cyclosisRadii[i];
        pos[i * 3 + 1] = Math.sin(this.cyclosisAngles[i]) * (this.cyclosisRadii[i] * 0.6);
      }
      this.cyclosisParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Bio-Energy ATP Sparks Pulsing
    if (this.energySparks) {
      const pos = this.energySparks.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i] += 5.0 * deltaT;
        pos[i + 1] += Math.sin(time * 4.0 + i) * 0.1;
        if (pos[i] > 290) pos[i] = -150;
      }
      this.energySparks.geometry.attributes.position.needsUpdate = true;
    }
  }
}
