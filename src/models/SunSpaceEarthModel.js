import * as THREE from 'three';
import { createSunMaterial } from '../shaders/SunCoronaShader.js';
import { createAtmosphereMaterial } from '../shaders/AtmosphereShader.js';

/**
 * Sun, Interplanetary Space, and Planet Earth Model (Stage 1: Cosmic Photon Origin & Transit)
 * 
 * Features:
 * 1. Radiant Sun with coronal flares and nuclear fusion surface turbulence
 * 2. High-speed solar photon rays traveling through the vacuum of space towards Earth
 * 3. Photorealistic rotating Planet Earth with oceans, continents, swirling clouds, and blue atmosphere
 */
export class SunSpaceEarthModel {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.group.position.set(options.x || -120, options.y || 0, options.z || 0);

    this.time = 0;
    this.sunMat = null;
    this.earthGroup = null;
    this.cloudMesh = null;
    this.beamMeshes = [];

    this.buildSun();
    this.buildSpacePhotonBeams();
    this.buildEarth();
  }

  buildSun() {
    const sunGroup = new THREE.Group();
    sunGroup.position.set(0, 0, 0);

    // 1. Sun Surface Sphere
    this.sunMat = createSunMaterial();
    const sunGeo = new THREE.SphereGeometry(6.0, 32, 32);
    const sunMesh = new THREE.Mesh(sunGeo, this.sunMat);
    sunGroup.add(sunMesh);

    // 2. Outer Corona Glow Halo
    const coronaGeo = new THREE.SphereGeometry(7.2, 24, 24);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    sunGroup.add(corona);

    // 3. Solar Flares / Prominence Rings
    const flareMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const flareRing = new THREE.Mesh(new THREE.RingGeometry(6.2, 9.5, 32), flareMat);
    flareRing.rotation.x = Math.PI * 0.3;
    sunGroup.add(flareRing);

    this.group.add(sunGroup);
    this.sunGroup = sunGroup;
  }

  buildSpacePhotonBeams() {
    // Laser-like volumetric solar beam tubes streaming from Sun (x=0) to Earth (x=50)
    const beamCount = 12;
    const beamGroup = new THREE.Group();

    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2;
      const spread = 2.5;

      const curve = new THREE.LineCurve3(
        new THREE.Vector3(Math.cos(angle) * 3, Math.sin(angle) * 3, (Math.random() - 0.5) * 2),
        new THREE.Vector3(50 + Math.cos(angle) * spread, Math.sin(angle) * spread, (Math.random() - 0.5) * spread)
      );

      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.12, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(tubeGeo, tubeMat);
      beamGroup.add(beam);
      this.beamMeshes.push(beam);
    }

    // Solar Wave Front energy rings traveling along beam
    const waveRingGeo = new THREE.RingGeometry(2.0, 2.3, 24);
    const waveRingMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    this.waveRings = [];
    for (let r = 0; r < 5; r++) {
      const ring = new THREE.Mesh(waveRingGeo, waveRingMat);
      ring.rotation.y = Math.PI * 0.5;
      ring.position.set(r * 10, 0, 0);
      beamGroup.add(ring);
      this.waveRings.push(ring);
    }

    this.group.add(beamGroup);
  }

  buildEarth() {
    // Earth positioned at relative x = 50
    const earthGroup = new THREE.Group();
    earthGroup.position.set(50, 0, 0);

    // 1. Procedural Earth Texture (Oceans & Continents)
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 512;
    earthCanvas.height = 256;
    const ctx = earthCanvas.getContext('2d');

    // Deep blue ocean base
    ctx.fillStyle = '#0f3d6c';
    ctx.fillRect(0, 0, 512, 256);

    // Continents & green vegetation landmasses
    ctx.fillStyle = '#166534';
    // Draw procedural continents
    const continents = [
      { x: 120, y: 80, rx: 60, ry: 40 },  // North America
      { x: 160, y: 170, rx: 40, ry: 55 }, // South America
      { x: 270, y: 90, rx: 55, ry: 35 },  // Eurasia
      { x: 280, y: 150, rx: 45, ry: 50 }, // Africa
      { x: 400, y: 180, rx: 35, ry: 30 }  // Australia
    ];

    continents.forEach(c => {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lush green tropical rainforest belts
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(c.x, c.y + 5, c.rx * 0.7, c.ry * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#166534';
    });

    const earthTex = new THREE.CanvasTexture(earthCanvas);

    // Earth Sphere
    const earthGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.6,
      metalness: 0.1
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // 2. Swirling Atmospheric Cloud Layer
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 512;
    cloudCanvas.height = 256;
    const cCtx = cloudCanvas.getContext('2d');
    cCtx.fillStyle = 'rgba(0,0,0,0)';
    cCtx.fillRect(0, 0, 512, 256);

    cCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * 512;
      const cy = 40 + Math.random() * 176;
      cCtx.beginPath();
      cCtx.ellipse(cx, cy, 20 + Math.random() * 40, 6 + Math.random() * 12, 0, 0, Math.PI * 2);
      cCtx.fill();
    }
    const cloudTex = new THREE.CanvasTexture(cloudCanvas);

    const cloudGeo = new THREE.SphereGeometry(3.58, 28, 28);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    this.cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(this.cloudMesh);

    // 3. Rayleigh Atmospheric Rim Glow
    const atmoGeo = new THREE.SphereGeometry(3.85, 28, 28);
    const atmoMat = createAtmosphereMaterial();
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    earthGroup.add(atmosphere);

    this.group.add(earthGroup);
    this.earthGroup = earthGroup;
  }

  update(delta, simParams = {}) {
    this.time += delta * (simParams.simSpeed || 1.0);

    // Animate Sun shader
    if (this.sunMat && this.sunMat.uniforms) {
      this.sunMat.uniforms.uTime.value = this.time;
    }

    // Rotate Sun slowly
    if (this.sunGroup) {
      this.sunGroup.rotation.y = this.time * 0.1;
    }

    // Rotate Earth & Clouds
    if (this.earthGroup) {
      this.earthGroup.rotation.y = this.time * 0.2;
    }
    if (this.cloudMesh) {
      this.cloudMesh.rotation.y = this.time * 0.25;
    }

    // Animate travelling solar wave rings from Sun to Earth
    this.waveRings.forEach((ring, idx) => {
      ring.position.x = ((this.time * 18 + idx * 10) % 50);
      const progress = ring.position.x / 50;
      ring.scale.setScalar(1.0 + progress * 0.6);
      ring.material.opacity = Math.sin(progress * Math.PI) * 0.7;
    });

    // Beam pulse
    const beamPulse = Math.sin(this.time * 4.0) * 0.15 + 0.85;
    this.beamMeshes.forEach(beam => {
      beam.scale.set(1, beamPulse, beamPulse);
    });
  }
}
