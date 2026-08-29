import * as THREE from 'three';

/**
 * Custom GLSL Shader for Photon Wave Packets
 * Visualizes wave-particle duality with oscillating wave ripples,
 * high-energy chromatic dispersion, and luminous halo glow.
 */
export function createPhotonWaveMaterial(params = {}) {
  const uniforms = {
    uTime: { value: 0.0 },
    uColor: { value: new THREE.Color(params.color || '#facc15') },
    uGlowColor: { value: new THREE.Color(params.glowColor || '#ffffff') },
    uFrequency: { value: params.frequency || 6.0 },
    uIntensity: { value: params.intensity || 1.8 }
  };

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vLocalPosition;
    uniform float uTime;
    uniform float uFrequency;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vLocalPosition = position;

      // Photon wave packet oscillation
      vec3 pos = position;
      float wave = sin(uTime * uFrequency + position.x * 12.0) * 0.08;
      pos += normal * wave;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 uColor;
    uniform vec3 uGlowColor;
    uniform float uTime;
    uniform float uFrequency;
    uniform float uIntensity;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vLocalPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Core photon brightness
      float core = max(dot(viewDir, normal), 0.0);
      float fresnel = pow(1.0 - core, 2.0);

      // Wave packet interference rings
      float rings = sin(length(vLocalPosition) * 30.0 - uTime * uFrequency) * 0.5 + 0.5;

      vec3 col = mix(uColor, uGlowColor, pow(core, 2.0) * 0.7);
      col += uGlowColor * fresnel * uIntensity;
      col += uColor * rings * 0.4;

      gl_FragColor = vec4(col, 1.0);
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
