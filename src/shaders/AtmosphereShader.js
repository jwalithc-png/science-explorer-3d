import * as THREE from 'three';

/**
 * Custom GLSL Shader for Earth Atmosphere & Rayleigh Scattering Rim Glow
 */
export function createAtmosphereMaterial() {
  const uniforms = {
    uGlowColor: { value: new THREE.Color('#38bdf8') },
    uSunDirection: { value: new THREE.Vector3(-1.0, 0.2, 0.5).normalize() }
  };

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 uGlowColor;
    uniform vec3 uSunDirection;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel edge glow for thin blue atmospheric shell
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
      
      // Sun facing illumination
      float sunFacing = max(dot(normal, uSunDirection), 0.0) * 0.7 + 0.3;

      vec3 col = uGlowColor * fresnel * sunFacing * 1.8;
      gl_FragColor = vec4(col, fresnel * 0.9);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
}
