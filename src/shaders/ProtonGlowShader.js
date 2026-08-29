import * as THREE from 'three';

/**
 * Custom GLSL Shader for Hydrogen Ions (H⁺ / Protons) & Electrochemical Potential
 * High-frequency electric field oscillation with intense core and radiant halo.
 */
export function createProtonGlowMaterial(params = {}) {
  const uniforms = {
    uTime: { value: 0.0 },
    uColor: { value: new THREE.Color(params.color || '#06b6d4') },
    uHaloColor: { value: new THREE.Color(params.haloColor || '#67e8f9') },
    uSpeed: { value: params.speed || 8.0 }
  };

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform float uTime;
    uniform float uSpeed;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      
      // High-energy quantum jitter
      vec3 pos = position;
      float jitter = sin(uTime * uSpeed + position.y * 20.0) * 0.04;
      pos += normal * jitter;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    uniform vec3 uHaloColor;
    uniform float uTime;

    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      float ndotv = max(dot(viewDir, normal), 0.0);
      float rim = pow(1.0 - ndotv, 2.5);

      vec3 col = mix(uHaloColor, vec3(1.0), pow(ndotv, 3.0));
      col += uColor * rim * 1.5;

      gl_FragColor = vec4(col, 0.95);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}
