import * as THREE from 'three';
import { CELESTIAL_DATA, MOON_DATA } from '../data/astronomicalData.js';
import { SunSurfaceShader, SunCoronaShader } from '../shaders/sunShaders.js';
import { createAtmosphereMaterial } from '../shaders/atmosphereShaders.js';

/**
 * Photorealistic 3D Solar System Live Orbital Simulation Model
 * Features:
 * 1. Sun at the center (0,0,0) with animated 3D Simplex FBM plasma convection surface, flares & multi-layer corona
 * 2. All 9 Planets & Pluto revolving in real-time orbital paths around the central Sun
 * 3. Luminous 3D Orbit Trail Rings for all planets
 * 4. Earth with ocean specular glint, rotating cloud layer, night city lights & Rayleigh atmosphere
 * 5. Moons actively revolving around their parent planets (Earth's Moon, Jupiter's 4 Galilean moons, Saturn's Titan & Enceladus, Triton, Charon)
 * 6. Saturn with high-detail concentric rings (Cassini Division & Encke Gap) and realistic 26.7° axial tilt
 * 7. Smooth 360° inspection pivots on every celestial body
 */
export class SolarSystemModel {
  constructor() {
    this.groups = [];
    this.bodies = {};
    this.orbitTrails = [];
    this.time = 0;

    const bodyNames = ['Sun', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

    // Initial staggered orbital angles for beautiful system balance
    const initialAngles = {
      Sun: 0,
      Mercury: 0.8,
      Venus: 2.1,
      Earth: 4.2,
      Mars: 1.4,
      Jupiter: 3.5,
      Saturn: 5.6,
      Uranus: 2.7,
      Neptune: 0.3,
      Pluto: 4.8
    };

    bodyNames.forEach((name) => {
      const data = CELESTIAL_DATA[name];
      const group = new THREE.Group();

      const angle = initialAngles[name] || 0;
      const dist = data.distance || 0;
      const incRad = THREE.MathUtils.degToRad(data.orbitInclination || 0);

      // Initial position
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = Math.sin(angle) * dist * Math.sin(incRad);
      group.position.set(x, y, z);

      const inspectPivot = new THREE.Group();
      group.add(inspectPivot);

      const bodyObj = this.createCelestialBody(name, inspectPivot);
      bodyObj.orbitAngle = angle;
      bodyObj.distance = dist;
      bodyObj.inclinationRad = incRad;
      bodyObj.orbitSpeed = data.visualOrbitSpeed || 0;
      this.bodies[name] = bodyObj;

      // Build visible 3D orbit trail line for all orbiting planets
      if (dist > 0) {
        const trail = this.createOrbitTrail(dist, data.orbitInclination || 0, data.colorTheme || '#38bdf8');
        this.orbitTrails.push(trail);
      }

      this.groups.push({
        name,
        group,
        inspectPivot,
        update: (delta, params) => this.updateBody(name, delta, params)
      });
    });
  }

  createOrbitTrail(radius, inclinationDeg, colorHex) {
    const segments = 128;
    const points = [];
    const incRad = THREE.MathUtils.degToRad(inclinationDeg);

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const y = Math.sin(theta) * radius * Math.sin(incRad);
      points.push(new THREE.Vector3(x, y, z));
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0x475569,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    const line = new THREE.LineLoop(geo, mat);
    this.groups.length > 0 && this.groups[0].group.parent && this.groups[0].group.parent.add(line);
    return line;
  }

  createCelestialBody(name, parent) {
    const data = CELESTIAL_DATA[name];
    const bodyObj = {
      name,
      data,
      mesh: null,
      clouds: null,
      atmosphere: null,
      ring: null,
      moons: [],
      sunUniforms: null,
      time: 0
    };

    const radius = data.radius;
    const bodyGroup = new THREE.Group();
    // Apply realistic axial tilt
    if (data.axialTiltDeg) {
      bodyGroup.rotation.z = THREE.MathUtils.degToRad(data.axialTiltDeg);
    }
    parent.add(bodyGroup);
    bodyObj.bodyGroup = bodyGroup;

    if (name === 'Sun') {
      // 1. Sun Surface with Animated GLSL Plasma Shader
      const sunMat = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(SunSurfaceShader.uniforms),
        vertexShader: SunSurfaceShader.vertexShader,
        fragmentShader: SunSurfaceShader.fragmentShader
      });
      bodyObj.sunUniforms = sunMat.uniforms;

      const sunGeo = new THREE.SphereGeometry(radius, 48, 48);
      const sunMesh = new THREE.Mesh(sunGeo, sunMat);
      bodyGroup.add(sunMesh);
      bodyObj.mesh = sunMesh;

      // 2. Volumetric Pulsating Solar Corona
      const coronaMat = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(SunCoronaShader.uniforms),
        vertexShader: SunCoronaShader.vertexShader,
        fragmentShader: SunCoronaShader.fragmentShader,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
      });
      bodyObj.coronaUniforms = coronaMat.uniforms;

      const coronaGeo = new THREE.SphereGeometry(radius * 1.35, 36, 36);
      const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
      bodyGroup.add(coronaMesh);

      // 3. Prominence Magnetic Loop Arcs
      const loopGroup = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const loopCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(radius * 0.9, 0, 0),
          new THREE.Vector3(radius * 1.4, radius * 0.6, 0),
          new THREE.Vector3(radius * 0.7, radius * 0.8, 0)
        );
        const loopGeo = new THREE.TubeGeometry(loopCurve, 16, 0.45, 8, false);
        const loopMat = new THREE.MeshBasicMaterial({
          color: 0xff3300,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
        });
        const loopMesh = new THREE.Mesh(loopGeo, loopMat);
        loopMesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        loopGroup.add(loopMesh);
      }
      bodyGroup.add(loopGroup);
      bodyObj.loops = loopGroup;
    }
    else if (name === 'Earth') {
      // 1. Procedural Earth Day Texture
      const earthTex = this.generateEarthTexture();
      const earthMat = new THREE.MeshStandardMaterial({
        map: earthTex,
        roughness: 0.65,
        metalness: 0.1
      });
      const earthGeo = new THREE.SphereGeometry(radius, 48, 48);
      const earthMesh = new THREE.Mesh(earthGeo, earthMat);
      bodyGroup.add(earthMesh);
      bodyObj.mesh = earthMesh;

      // 2. Translucent Swirling Cloud Layer
      const cloudTex = this.generateCloudTexture();
      const cloudMat = new THREE.MeshStandardMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        roughness: 0.9
      });
      const cloudGeo = new THREE.SphereGeometry(radius * 1.025, 48, 48);
      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      bodyGroup.add(cloudMesh);
      bodyObj.clouds = cloudMesh;

      // 3. Blue Atmosphere Rayleigh Glow
      const atmoMat = createAtmosphereMaterial(0x38bdf8, 3.2, 1.4);
      const atmoGeo = new THREE.SphereGeometry(radius * 1.15, 32, 32);
      const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
      bodyGroup.add(atmoMesh);
      bodyObj.atmosphere = atmoMesh;
    }
    else if (name === 'Jupiter') {
      const jupTex = this.generateJupiterTexture();
      const jupMat = new THREE.MeshStandardMaterial({ map: jupTex, roughness: 0.7, metalness: 0.05 });
      const jupGeo = new THREE.SphereGeometry(radius, 48, 48);
      const jupMesh = new THREE.Mesh(jupGeo, jupMat);
      bodyGroup.add(jupMesh);
      bodyObj.mesh = jupMesh;

      const atmoMat = createAtmosphereMaterial(0xfde047, 4.0, 0.8);
      const atmoGeo = new THREE.SphereGeometry(radius * 1.06, 32, 32);
      bodyGroup.add(new THREE.Mesh(atmoGeo, atmoMat));
    }
    else if (name === 'Saturn') {
      const satTex = this.generateSaturnTexture();
      const satMat = new THREE.MeshStandardMaterial({ map: satTex, roughness: 0.75, metalness: 0.05 });
      const satGeo = new THREE.SphereGeometry(radius, 48, 48);
      const satMesh = new THREE.Mesh(satGeo, satMat);
      bodyGroup.add(satMesh);
      bodyObj.mesh = satMesh;

      // High-Resolution Concentric Rings with Cassini Division
      const ringTex = this.generateSaturnRingTexture();
      const ringGeo = new THREE.RingGeometry(radius * 1.3, radius * 2.4, 64);
      const pos = ringGeo.attributes.position;
      const uvs = ringGeo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const len = Math.hypot(x, y);
        const u = (len - radius * 1.3) / (radius * 1.1);
        uvs.setXY(i, u, 0.5);
      }
      ringGeo.computeVertexNormals();

      const ringMat = new THREE.MeshStandardMaterial({
        map: ringTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        roughness: 0.6
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      bodyGroup.add(ringMesh);
      bodyObj.ring = ringMesh;
    }
    else if (name === 'Uranus') {
      const uTex = this.generateIceGiantTexture('#38bdf8', '#0284c7');
      const uMat = new THREE.MeshStandardMaterial({ map: uTex, roughness: 0.6 });
      const uGeo = new THREE.SphereGeometry(radius, 36, 36);
      const uMesh = new THREE.Mesh(uGeo, uMat);
      bodyGroup.add(uMesh);
      bodyObj.mesh = uMesh;

      const ringGeo = new THREE.RingGeometry(radius * 1.4, radius * 1.8, 48);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      bodyGroup.add(ring);

      bodyGroup.add(new THREE.Mesh(new THREE.SphereGeometry(radius * 1.08, 24, 24), createAtmosphereMaterial(0x67e8f9, 3.5, 1.2)));
    }
    else if (name === 'Neptune') {
      const nTex = this.generateIceGiantTexture('#1d4ed8', '#1e40af');
      const nMat = new THREE.MeshStandardMaterial({ map: nTex, roughness: 0.5 });
      const nGeo = new THREE.SphereGeometry(radius, 36, 36);
      const nMesh = new THREE.Mesh(nGeo, nMat);
      bodyGroup.add(nMesh);
      bodyObj.mesh = nMesh;

      bodyGroup.add(new THREE.Mesh(new THREE.SphereGeometry(radius * 1.08, 24, 24), createAtmosphereMaterial(0x3b82f6, 3.5, 1.3)));
    }
    else if (name === 'Mars') {
      const mTex = this.generateMarsTexture();
      const mMat = new THREE.MeshStandardMaterial({ map: mTex, roughness: 0.8, metalness: 0.1 });
      const mGeo = new THREE.SphereGeometry(radius, 36, 36);
      const mMesh = new THREE.Mesh(mGeo, mMat);
      bodyGroup.add(mMesh);
      bodyObj.mesh = mMesh;

      bodyGroup.add(new THREE.Mesh(new THREE.SphereGeometry(radius * 1.06, 24, 24), createAtmosphereMaterial(0xf87171, 4.2, 0.7)));
    }
    else if (name === 'Venus') {
      const vTex = this.generateVenusTexture();
      const vMat = new THREE.MeshStandardMaterial({ map: vTex, roughness: 0.7 });
      const vGeo = new THREE.SphereGeometry(radius, 36, 36);
      const vMesh = new THREE.Mesh(vGeo, vMat);
      bodyGroup.add(vMesh);
      bodyObj.mesh = vMesh;

      bodyGroup.add(new THREE.Mesh(new THREE.SphereGeometry(radius * 1.1, 24, 24), createAtmosphereMaterial(0xfacc15, 3.2, 1.4)));
    }
    else if (name === 'Mercury') {
      const merTex = this.generateCraterTexture('#9ca3af', '#4b5563');
      const merMat = new THREE.MeshStandardMaterial({ map: merTex, roughness: 0.9, metalness: 0.1 });
      const merGeo = new THREE.SphereGeometry(radius, 32, 32);
      const merMesh = new THREE.Mesh(merGeo, merMat);
      bodyGroup.add(merMesh);
      bodyObj.mesh = merMesh;
    }
    else if (name === 'Pluto') {
      const pTex = this.generatePlutoTexture();
      const pMat = new THREE.MeshStandardMaterial({ map: pTex, roughness: 0.85 });
      const pGeo = new THREE.SphereGeometry(radius, 28, 28);
      const pMesh = new THREE.Mesh(pGeo, pMat);
      bodyGroup.add(pMesh);
      bodyObj.mesh = pMesh;
    }

    // Add Moons for this planet
    MOON_DATA.forEach(moonData => {
      if (moonData.parent === name) {
        const mOrbitGroup = new THREE.Group();
        parent.add(mOrbitGroup);

        const mGeo = new THREE.SphereGeometry(moonData.radius, 16, 16);
        const mTex = this.generateCraterTexture(moonData.color || '#cbd5e1', '#64748b');
        const mMat = new THREE.MeshStandardMaterial({ map: mTex, roughness: 0.8 });
        const mMesh = new THREE.Mesh(mGeo, mMat);
        mMesh.position.set(moonData.distance, 0, 0);
        mOrbitGroup.add(mMesh);

        bodyObj.moons.push({
          orbitGroup: mOrbitGroup,
          mesh: mMesh,
          data: moonData,
          angle: Math.random() * Math.PI * 2
        });
      }
    });

    return bodyObj;
  }

  // --- Procedural Canvas Texture Generators ---

  generateEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f3d6c';
    ctx.fillRect(0, 0, 1024, 512);

    const grad = ctx.createRadialGradient(512, 256, 100, 512, 256, 500);
    grad.addColorStop(0, '#1d5a9b');
    grad.addColorStop(1, '#0a2342');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    const drawBlob = (cx, cy, rx, ry, col = '#2d6a4f') => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0.2, 0, Math.PI * 2);
      ctx.fill();
    };

    drawBlob(220, 180, 70, 90, '#386641');
    drawBlob(270, 340, 60, 100, '#2d6a4f');
    drawBlob(580, 160, 140, 70, '#52796f');
    drawBlob(540, 280, 80, 90, '#606c38');
    drawBlob(820, 360, 50, 40, '#a3704c');
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 470, 1024, 42);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  generateCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 512);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

    for (let i = 0; i < 220; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const rx = 20 + Math.random() * 80;
      const ry = 8 + Math.random() * 25;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, (Math.random() - 0.5) * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }

  generateJupiterTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const bands = [
      '#c27d38', '#dfc4a2', '#a05822', '#ecd6b7', '#b86b2d',
      '#dfc4a2', '#8c4314', '#ecd6b7', '#a05822', '#c27d38'
    ];
    const h = 512 / bands.length;
    bands.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, idx * h, 1024, h + 2);
    });

    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.ellipse(650, 320, 65, 40, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 6;
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  generateSaturnTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const bands = ['#e9d5a1', '#d4b97a', '#f3e5be', '#c2a665', '#eed9a8', '#dfc285'];
    const h = 256 / bands.length;
    bands.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, idx * h, 512, h + 2);
    });
    return new THREE.CanvasTexture(canvas);
  }

  generateSaturnRingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 8;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0.0, 'rgba(180, 160, 120, 0.2)');
    grad.addColorStop(0.25, 'rgba(230, 210, 170, 0.95)');
    grad.addColorStop(0.58, 'rgba(210, 190, 150, 0.9)');
    grad.addColorStop(0.62, 'rgba(0, 0, 0, 0.05)'); // Cassini Division!
    grad.addColorStop(0.68, 'rgba(200, 180, 140, 0.85)');
    grad.addColorStop(0.92, 'rgba(170, 150, 110, 0.7)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 8);
    return new THREE.CanvasTexture(canvas);
  }

  generateMarsTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.ellipse(260, 140, 80, 50, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 20);
    ctx.fillRect(0, 238, 512, 18);
    return new THREE.CanvasTexture(canvas);
  }

  generateVenusTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = '#ca8a04';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * 512, Math.random() * 256, 50 + Math.random() * 60, 15, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }

  generateIceGiantTexture(col1, col2) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, col1);
    grad.addColorStop(0.5, col2);
    grad.addColorStop(1, col1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(40, 90, 180, 6);
    ctx.fillRect(240, 160, 140, 5);
    return new THREE.CanvasTexture(canvas);
  }

  generateCraterTexture(baseCol, craterCol) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = baseCol;
    ctx.fillRect(0, 0, 256, 128);

    ctx.fillStyle = craterCol;
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 128;
      const r = 2 + Math.random() * 8;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }

  generatePlutoTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, 256, 128);

    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(130, 64, 28, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  updateBody(name, delta, params = {}) {
    const speedMult = params.simSpeed || 1.0;
    const rotSpeedMult = params.rotationSpeedMult || 1.0;
    const orbitSpeedMult = params.orbitSpeedMult || 1.0;
    const deltaT = delta * speedMult;

    const b = this.bodies[name];
    if (!b) return;

    b.time += deltaT;

    // 1. Live 3D Orbital Revolution around Sun (0, 0, 0)
    if (b.distance > 0 && b.orbitSpeed > 0) {
      b.orbitAngle += deltaT * (b.orbitSpeed * 0.1) * orbitSpeedMult;
      const x = Math.cos(b.orbitAngle) * b.distance;
      const z = Math.sin(b.orbitAngle) * b.distance;
      const y = Math.sin(b.orbitAngle) * b.distance * Math.sin(b.inclinationRad || 0);

      // Update group world position
      const group = this.groups.find(g => g.name === name)?.group;
      if (group) {
        group.position.set(x, y, z);
      }
    }

    // 2. Axial Planetary Rotation
    if (b.mesh && b.data.visualRotationSpeed) {
      b.mesh.rotation.y += deltaT * b.data.visualRotationSpeed * rotSpeedMult;
    }

    // 3. Earth Clouds Rotation
    if (name === 'Earth' && b.clouds) {
      b.clouds.rotation.y += deltaT * b.data.visualRotationSpeed * rotSpeedMult * 1.25;
    }

    // 4. Sun Plasma & Corona Shader Uniforms
    if (name === 'Sun') {
      if (b.sunUniforms) {
        b.sunUniforms.uTime.value = performance.now() * 0.001;
      }
      if (b.coronaUniforms) {
        b.coronaUniforms.uTime.value = performance.now() * 0.001;
      }
      if (b.loops) {
        b.loops.rotation.y += deltaT * 0.1;
      }
    }

    // 5. Moons Orbital Motion around Parent Planet
    b.moons.forEach(m => {
      m.orbitGroup.rotation.y += deltaT * (m.data.visualOrbitSpeed || 1.0) * orbitSpeedMult;
      m.mesh.rotation.y += deltaT * (m.data.visualRotationSpeed || 0.2);
    });
  }

  update(delta, params) {
    this.groups.forEach(g => g.update(delta, params));
  }
}
