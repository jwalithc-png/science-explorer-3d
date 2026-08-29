import * as THREE from 'three';

/**
 * Custom GLSL Shader for Chlorophyll-a / Chlorophyll-b Pigment Complexes
 * Models bioluminescent fluorescence emission, photon excitation resonance,
 * subsurface light scattering, and Fresnel edge glow.
 */
export function createChlorophyllMaterial(params = {}) {
  const uniforms = {
    uTime: { value: 0.0 },
    uBaseColor: { value: new THREE.Color(params.baseColor || '#15803d') },
    uFluorescenceColor: { value: new THREE.Color(params.fluorescenceColor || '#4ade80') },
    uExcitationPulse: { value: 0.0 },
    uExcitationSpeed: { value: params.excitationSpeed || 2.5 },
    uFresnelPower: { value: params.fresnelPower || 2.5 },
    uLightIntensity: { value: 1.0 }
  };

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    uniform float uTime;
    uniform float uExcitationSpeed;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      
      // Subtle organic molecular breathing perturbation
      vec3 pos = position;
      float breathe = sin(uTime * uExcitationSpeed + position.y * 3.0) * 0.015;
      pos += normal * breathe;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 uBaseColor;
    uniform vec3 uFluorescenceColor;
    uniform float uTime;
    uniform float uExcitationPulse;
    uniform float uFresnelPower;
    uniform float uLightIntensity;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel term for luminous edge glow
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);

      // Bioluminescent fluorescence wave across thylakoid discs
      float wave = sin(vWorldPosition.x * 2.0 + vWorldPosition.z * 2.0 - uTime * 3.0) * 0.5 + 0.5;
      float excitation = smoothstep(0.3, 0.9, wave) * uLightIntensity + uExcitationPulse;

      // Subsurface scattering approximation
      vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
      float diff = max(dot(normal, lightDir), 0.0);
      float sss = pow(max(dot(-viewDir, lightDir), 0.0), 3.0) * 0.4;

      // Color composition
      vec3 col = mix(uBaseColor, uFluorescenceColor, excitation * 0.6 + fresnel * 0.5 + sss);
      col += uFluorescenceColor * fresnel * 0.4 * uLightIntensity;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: false,
    side: THREE.FrontSide
  });
}
