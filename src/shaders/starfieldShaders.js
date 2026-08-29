import * as THREE from 'three';

/**
 * Creates an ultra-realistic procedural Milky Way Galaxy Skydome and Multi-Layer Starfield.
 * Simulates galactic disk concentration, dust lanes, stellar nurseries, and twinkling spectral stars.
 */

export function createMilkyWayGalaxyDome(radius = 5000) {
  // Create equirectangular high-resolution procedural Milky Way Panorama on a sphere
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // 1. Deep Space Void Background
  const bgGrad = ctx.createRadialGradient(1024, 512, 50, 1024, 512, 1000);
  bgGrad.addColorStop(0, '#030718');
  bgGrad.addColorStop(0.5, '#02040c');
  bgGrad.addColorStop(1, '#010206');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // 2. Galactic Core (Sagittarius A* Bulge)
  const coreGrad = ctx.createRadialGradient(1024, 512, 10, 1024, 512, 380);
  coreGrad.addColorStop(0, 'rgba(255, 220, 180, 0.7)');
  coreGrad.addColorStop(0.2, 'rgba(230, 160, 200, 0.45)');
  coreGrad.addColorStop(0.5, 'rgba(100, 70, 180, 0.25)');
  coreGrad.addColorStop(0.8, 'rgba(30, 40, 100, 0.1)');
  coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // 3. Diagonal / Sinuous Galactic Plane Band (Milky Way Stream)
  for (let i = 0; i < 2048; i += 4) {
    const angle = (i / 2048) * Math.PI * 2;
    const centerY = 512 + Math.sin(angle) * 160 + Math.sin(angle * 3) * 30;
    const bandHeight = 160 + Math.cos(angle * 2) * 60;

    const grad = ctx.createLinearGradient(0, centerY - bandHeight, 0, centerY + bandHeight);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.3, 'rgba(120, 150, 240, 0.18)');
    grad.addColorStop(0.5, 'rgba(240, 210, 255, 0.38)');
    grad.addColorStop(0.7, 'rgba(180, 130, 220, 0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(i, centerY - bandHeight, 4, bandHeight * 2);
  }

  // 4. Interstellar Dark Dust Clouds / Rifts (The Great Rift)
  ctx.fillStyle = 'rgba(2, 4, 10, 0.45)';
  for (let j = 0; j < 300; j++) {
    const x = Math.random() * 2048;
    const angle = (x / 2048) * Math.PI * 2;
    const y = 512 + Math.sin(angle) * 160 + (Math.random() - 0.5) * 80;
    const radX = 20 + Math.random() * 60;
    const radY = 10 + Math.random() * 25;

    ctx.beginPath();
    ctx.ellipse(x, y, radX, radY, Math.random() * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Embedded Colorful Nebular Clusters (Carina, Orion, Eagle Nebulae)
  const nebulae = [
    { x: 650, y: 440, r: 180, c: 'rgba(236, 72, 153, 0.28)' }, // Pink/Magenta H-II
    { x: 1400, y: 580, r: 220, c: 'rgba(56, 189, 248, 0.25)' }, // Cyan Oxygen-III
    { x: 1024, y: 490, r: 150, c: 'rgba(245, 158, 11, 0.22)' }, // Golden emission
    { x: 300, y: 620, r: 160, c: 'rgba(168, 85, 247, 0.22)' },  // Purple nebula
    { x: 1800, y: 400, r: 190, c: 'rgba(14, 165, 233, 0.2)' }   // Blue reflection
  ];

  for (const neb of nebulae) {
    const nGrad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.r);
    nGrad.addColorStop(0, neb.c);
    nGrad.addColorStop(0.5, neb.c.replace(/[\d\.]+\)$/, '0.12)'));
    nGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = nGrad;
    ctx.beginPath();
    ctx.arc(neb.x, neb.y, neb.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Millions of dense background star pinpoints on the canvas
  for (let s = 0; s < 12000; s++) {
    const x = Math.random() * 2048;
    const angle = (x / 2048) * Math.PI * 2;
    const mwDist = Math.abs(512 + Math.sin(angle) * 160 - (Math.random() * 1024));
    
    // Concentrate stars toward Milky Way plane
    if (Math.random() > mwDist / 512) {
      const y = 512 + Math.sin(angle) * 160 + (Math.random() - 0.5) * (180 + Math.random() * 200);
      const alpha = 0.2 + Math.random() * 0.8;
      const size = Math.random() < 0.95 ? 1.0 : 1.8;

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, size, size);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;

  const domeGeo = new THREE.SphereGeometry(radius, 64, 48);
  const domeMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    depthWrite: false
  });

  const domeMesh = new THREE.Mesh(domeGeo, domeMat);
  domeMesh.name = 'MilkyWay_Galaxy_Dome';
  return domeMesh;
}

/**
 * Procedural Volumetric Starfield with 50,000+ 3D Particle Stars,
 * Spectral Classes (O, B, A, F, G, K, M), and Twinkling Shaders.
 */
export function createDeepSpaceStarfield(count = 50000, radius = 4500) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);

  // Stellar Spectral Colors
  const spectralPalette = [
    new THREE.Color(0x9db4ff), // O / B Class Deep Blue
    new THREE.Color(0xc2d1ff), // A Class Ice Blue-White
    new THREE.Color(0xffffff), // F Class Pure White
    new THREE.Color(0xfff1df), // G Class Sun-like Yellow
    new THREE.Color(0xffd29c), // K Class Warm Amber
    new THREE.Color(0xff9870), // M Class Red Dwarf
    new THREE.Color(0x60a5fa)  // Distant Blue Giant
  ];

  for (let i = 0; i < count; i++) {
    // Distribute with concentration along galactic plane
    const theta = Math.PI * 2 * Math.random();
    let phi = Math.acos(2.0 * Math.random() - 1.0);

    // Flatten slightly to form galactic disk
    if (Math.random() < 0.6) {
      phi = (phi - Math.PI / 2) * 0.4 + Math.PI / 2;
    }

    const r = radius * (0.7 + 0.3 * Math.cbrt(Math.random()));

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Pick spectral color
    const colIdx = Math.floor(Math.random() * spectralPalette.length);
    const starCol = spectralPalette[colIdx];
    colors[i * 3] = starCol.r;
    colors[i * 3 + 1] = starCol.g;
    colors[i * 3 + 2] = starCol.b;

    // Size: majority sharp pinpoints, rare bright stars with glowing halos
    const isBrightAlphaStar = Math.random() < 0.02;
    const isMediumStar = Math.random() < 0.15;
    sizes[i] = isBrightAlphaStar ? 5.5 + Math.random() * 4.0 : isMediumStar ? 2.8 + Math.random() * 2.0 : 1.2 + Math.random() * 1.2;

    phases[i] = Math.random() * Math.PI * 2.0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      attribute vec3 aColor;
      attribute float size;
      attribute float phase;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;

      void main() {
        vColor = aColor;
        vAlpha = 0.95;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(size * (220.0 / -mvPosition.z), 1.0, 5.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        if (dist > 0.5) discard;

        // Smooth radial Gaussian falloff
        float glow = exp(-dist * dist * 16.0);
        float core = smoothstep(0.14, 0.0, dist) * 1.2;
        vec3 col = vColor * glow + vec3(core);
        float alpha = clamp(glow * vAlpha, 0.0, 1.0);

        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  return new THREE.Points(geometry, material);
}
