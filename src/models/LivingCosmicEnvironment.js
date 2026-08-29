import * as THREE from 'three';
import { createMilkyWayGalaxyDome, createDeepSpaceStarfield } from '../shaders/starfieldShaders.js';
import { ASTEROID_BELT_CONFIG } from '../data/astronomicalData.js';

/**
 * Living Deep Space & Cosmic Orbital Simulation Environment
 * Features:
 * 1. Procedural 2048x1024 Milky Way Galaxy Skydome (Galactic core, dust rifts, nebulae, 12,000 stars)
 * 2. 50,000+ Deep Space Twinkling Starfield with 7 Spectral Classes
 * 3. 360° Omnidirectional Solar Wind Plasma Storm: 2,000+ luminous plasma ions streaming outward from the central Sun (0,0,0)
 * 4. Procedural Asteroid Belt: 3,500+ tumbling, rotating rocky asteroids orbiting the central Sun in real-time
 * 5. Volumetric Nebulae & Cosmic Shimmer
 * 6. Dynamic Cometary Dust with Glowing Ion Tails
 */
export class LivingCosmicEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.initGalaxyDome();
    this.initStarfield();
    this.initSolarWindParticles();
    this.initAsteroidBelt();
    this.initComets();
    this.initNebulaClouds();
    this.initCosmicDust();
  }

  initGalaxyDome() {
    this.galaxyDome = createMilkyWayGalaxyDome(4800);
    this.group.add(this.galaxyDome);
  }

  initStarfield() {
    this.starfield = createDeepSpaceStarfield(45000, 4200);
    this.group.add(this.starfield);
  }

  initSolarWindParticles() {
    // 2,000+ solar wind ions streaming radially outward in 360° from the central Sun (0, 0, 0)
    this.solarWindCount = 2000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.solarWindCount * 3);
    const velocities = new Float32Array(this.solarWindCount * 3);
    const colors = new Float32Array(this.solarWindCount * 3);

    for (let i = 0; i < this.solarWindCount; i++) {
      const radius = 25.0 + Math.random() * 750.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2.0 * Math.random() - 1.0);

      const dirX = Math.sin(phi) * Math.cos(theta);
      const dirY = (Math.sin(phi) * Math.sin(theta)) * 0.25; // Concentrate in ecliptic plane
      const dirZ = Math.cos(phi);

      positions[i * 3] = dirX * radius;
      positions[i * 3 + 1] = dirY * radius;
      positions[i * 3 + 2] = dirZ * radius;

      const speed = 40.0 + Math.random() * 60.0;
      velocities[i * 3] = dirX * speed;
      velocities[i * 3 + 1] = dirY * speed;
      velocities[i * 3 + 2] = dirZ * speed;

      // Solar golden, amber & turquoise plasma glow
      const isGold = Math.random() > 0.35;
      if (isGold) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
        colors[i * 3 + 2] = 0.2 + Math.random() * 0.3;
      } else {
        colors[i * 3] = 0.3;
        colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
        colors[i * 3 + 2] = 1.0;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.solarWind = new THREE.Points(geo, mat);
    this.solarWindVelocities = velocities;
    this.group.add(this.solarWind);
  }

  initAsteroidBelt() {
    // 3,500+ rotating asteroids forming the main belt between Mars and Jupiter orbiting (0,0,0)
    const count = ASTEROID_BELT_CONFIG.count || 3500;
    const innerR = ASTEROID_BELT_CONFIG.innerRadius || 225;
    const outerR = ASTEROID_BELT_CONFIG.outerRadius || 275;

    const geo = new THREE.DodecahedronGeometry(0.75, 0);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i) * (0.65 + Math.random() * 0.7);
      const vy = pos.getY(i) * (0.65 + Math.random() * 0.7);
      const vz = pos.getZ(i) * (0.65 + Math.random() * 0.7);
      pos.setXYZ(i, vx, vy, vz);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x8d837a,
      roughness: 0.85,
      metalness: 0.2
    });

    this.asteroidMesh = new THREE.InstancedMesh(geo, mat, count);
    this.asteroidMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.asteroidData = [];

    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerR + Math.random() * (outerR - innerR);
      const y = (Math.random() - 0.5) * (ASTEROID_BELT_CONFIG.heightSpread || 10.0);

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.35 + Math.random() * 0.9;

      const rotX = Math.random() * Math.PI * 2;
      const rotY = Math.random() * Math.PI * 2;
      const rotZ = Math.random() * Math.PI * 2;

      this.asteroidData.push({
        angle,
        radius,
        y,
        scale,
        rotX,
        rotY,
        rotZ,
        orbitSpeed: (0.04 + (1.0 / Math.sqrt(radius)) * 0.12),
        spinSpeedX: (Math.random() - 0.5) * 2.5,
        spinSpeedY: (Math.random() - 0.5) * 2.5
      });

      dummy.position.set(x, y, z);
      dummy.rotation.set(rotX, rotY, rotZ);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      this.asteroidMesh.setMatrixAt(i, dummy.matrix);
    }

    this.asteroidMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.asteroidMesh);
  }

  initComets() {
    // 2 active comets with glowing ion gas tails on high-eccentricity orbits
    this.comets = [];
    for (let c = 0; c < 2; c++) {
      const cometGroup = new THREE.Group();

      const nucleusMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, emissive: 0x38bdf8, emissiveIntensity: 0.6 });
      const nucleus = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), nucleusMat);
      cometGroup.add(nucleus);

      // Tail cone pointing away from Sun
      const tailGeo = new THREE.ConeGeometry(3.5, 35, 16, 1, true);
      tailGeo.rotateX(Math.PI / 2);
      const tailMat = new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.z = 18;
      cometGroup.add(tail);

      this.group.add(cometGroup);
      this.comets.push({
        group: cometGroup,
        angle: c * Math.PI + 0.5,
        a: 380, // semi-major axis
        b: 140, // semi-minor axis
        speed: 0.08 + c * 0.04
      });
    }
  }

  initNebulaClouds() {
    this.nebulaGroup = new THREE.Group();
    const nebulae = [
      { x: 0, y: 300, z: -600, color: 0xec4899, size: 450 },
      { x: 500, y: -200, z: -500, color: 0x06b6d4, size: 500 },
      { x: -550, y: 250, z: 400, color: 0xa855f7, size: 480 },
      { x: -400, y: -200, z: -450, color: 0xf59e0b, size: 400 }
    ];

    nebulae.forEach(neb => {
      const geo = new THREE.SphereGeometry(neb.size, 16, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: neb.color,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(neb.x, neb.y, neb.z);
      this.nebulaGroup.add(mesh);
    });

    this.group.add(this.nebulaGroup);
  }

  initCosmicDust() {
    const count = 3000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 900;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = Math.sin(a) * r;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xcfd8dc,
      size: 0.75,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    this.cosmicDust = new THREE.Points(geo, mat);
    this.group.add(this.cosmicDust);
  }

  update(delta, params = {}) {
    const time = performance.now() * 0.001;
    const speedMult = params.simSpeed || 1.0;
    const deltaT = delta * speedMult;

    // 1. Galaxy dome & starfield rotation
    if (this.galaxyDome) {
      this.galaxyDome.rotation.y += deltaT * 0.001;
    }
    if (this.starfield && this.starfield.material.uniforms) {
      this.starfield.material.uniforms.uTime.value = time;
      this.starfield.rotation.y += deltaT * 0.0015;
    }

    // 2. Solar Wind Stream Outward Flow from (0,0,0)
    if (this.solarWind) {
      const pos = this.solarWind.geometry.attributes.position.array;
      const vels = this.solarWindVelocities;

      for (let i = 0; i < this.solarWindCount; i++) {
        pos[i * 3] += vels[i * 3] * deltaT;
        pos[i * 3 + 1] += vels[i * 3 + 1] * deltaT;
        pos[i * 3 + 2] += vels[i * 3 + 2] * deltaT;

        const distSq = pos[i * 3] * pos[i * 3] + pos[i * 3 + 1] * pos[i * 3 + 1] + pos[i * 3 + 2] * pos[i * 3 + 2];
        if (distSq > 850.0 * 850.0) {
          // Reset near Sun
          const theta = Math.random() * Math.PI * 2;
          const r = 25.0 + Math.random() * 10.0;
          pos[i * 3] = Math.cos(theta) * r;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 4.0;
          pos[i * 3 + 2] = Math.sin(theta) * r;
        }
      }
      this.solarWind.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Orbit & Tumbling of 3,500 Asteroids around Sun (0,0,0)
    if (this.asteroidMesh) {
      const dummy = new THREE.Object3D();
      const orbitMult = params.orbitSpeedMult || 1.0;

      for (let i = 0; i < this.asteroidData.length; i++) {
        const ast = this.asteroidData[i];
        ast.angle += ast.orbitSpeed * deltaT * orbitMult;
        ast.rotX += ast.spinSpeedX * deltaT;
        ast.rotY += ast.spinSpeedY * deltaT;

        const x = Math.cos(ast.angle) * ast.radius;
        const z = Math.sin(ast.angle) * ast.radius;

        dummy.position.set(x, ast.y, z);
        dummy.rotation.set(ast.rotX, ast.rotY, ast.rotZ);
        dummy.scale.set(ast.scale, ast.scale, ast.scale);
        dummy.updateMatrix();

        this.asteroidMesh.setMatrixAt(i, dummy.matrix);
      }
      this.asteroidMesh.instanceMatrix.needsUpdate = true;
    }

    // 4. Orbiting Comets with Tails Orienting Away from Sun
    this.comets.forEach(comet => {
      comet.angle += comet.speed * deltaT * (params.orbitSpeedMult || 1.0);
      const x = Math.cos(comet.angle) * comet.a;
      const z = Math.sin(comet.angle) * comet.b;
      const y = Math.sin(comet.angle * 2.0) * 15.0;

      comet.group.position.set(x, y, z);
      // Orient tail directly away from Sun at (0,0,0)
      comet.group.lookAt(x * 2.0, y * 2.0, z * 2.0);
    });

    // 5. Cosmic Dust Drifting
    if (this.cosmicDust) {
      this.cosmicDust.rotation.y += deltaT * 0.005;
    }
  }
}
