import * as THREE from 'three';

/**
 * Custom GLSL Shader for Sun & Coronal Solar Flares
 * Simulates core nuclear fusion radiance, solar surface granulation turbulence,
 * limb darkening, and radiant solar corona flares.
 */
export function createSunMaterial() {
  const uniforms = {
    uTime: { value: 0.0 },
    uCoreColor: { value: new THREE.Color('#ffffff') },
    uMidColor: { value: new THREE.Color('#facc15') },   // Solar yellow
    uCoronaColor: { value: new THREE.Color('#ea580c') } // Solar prominence orange
  };

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    uniform float uTime;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      
      // Solar surface turbulent convection granulation
      vec3 pos = position;
      float noise = sin(pos.x * 4.0 + uTime * 2.0) * cos(pos.y * 4.0 + uTime * 1.5) * sin(pos.z * 4.0 + uTime * 1.8);
      pos += normal * (noise * 0.04);

      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPos.xyz;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 uCoreColor;
    uniform vec3 uMidColor;
    uniform vec3 uCoronaColor;
    uniform float uTime;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Limb darkening & radial solar gradient
      float ndotv = max(dot(viewDir, normal), 0.0);
      float rim = 1.0 - ndotv;

      // Solar flare prominence turbulence
      float flare = sin(vWorldPosition.x * 8.0 + uTime * 3.0) * sin(vWorldPosition.y * 8.0 - uTime * 2.5);
      flare = smoothstep(-0.5, 0.8, flare);

      vec3 col = mix(uCoreColor, uMidColor, pow(rim, 0.8));
      col = mix(col, uCoronaColor, pow(rim, 2.2) + flare * 0.35);

      // Core incandescent glare
      col += uCoreColor * pow(ndotv, 4.0) * 0.8;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.FrontSide
  });
}
