import * as THREE from 'three';

/**
 * Embryo & Fetal Translucency + Beating Vascular Perfusion Shader
 * Simulates living human tissue with subsurface scattering, microcapillary perfusion, and rhythmic cardiac pulse
 */
export const EmbryoHeartbeatShader = {
  uniforms: {
    uTime: { value: 0 },
    uHeartbeatPulse: { value: 0.0 }, // 0.0 to 1.0 systolic contraction peak
    uBaseColor: { value: new THREE.Color(0xfca5a5) }, // Soft organic pink
    uVesselColor: { value: new THREE.Color(0xdc2626) }, // Deep arterial red
    uHeartCoreColor: { value: new THREE.Color(0xef4444) }, // Glowing cardiac tube
    uFresnelPower: { value: 2.2 },
    uSubsurface: { value: 0.7 },
    uTranslucency: { value: 0.85 }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uHeartbeatPulse;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying float vPulseFactor;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);

      // Microscopic rhythmic tissue expansion around cardiac zone
      vec3 pos = position;
      float distToHeart = length(pos - vec3(0.0, 0.2, 0.2));
      float pulseExp = exp(-distToHeart * 2.5) * uHeartbeatPulse * 0.08;
      pos += normal * pulseExp;

      vPulseFactor = pulseExp;

      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPos.xyz;
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uHeartbeatPulse;
    uniform vec3 uBaseColor;
    uniform vec3 uVesselColor;
    uniform vec3 uHeartCoreColor;
    uniform float uFresnelPower;
    uniform float uSubsurface;
    uniform float uTranslucency;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying float vPulseFactor;

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      vec3 normal = normalize(vNormal);

      // Fresnel rim lighting for delicate embryonic epidermal translucency
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);

      // Procedural microvascular capillary networks
      float vNoise1 = sin(vUv.x * 40.0 + vUv.y * 30.0) * cos(vUv.y * 50.0);
      float vNoise2 = sin(vUv.x * 80.0) * cos(vUv.y * 80.0);
      float vesselPattern = smoothstep(0.35, 0.85, vNoise1 * 0.5 + vNoise2 * 0.5);

      // Subsurface scattering glow
      float sss = pow(max(dot(viewDir, -normal), 0.0), 1.5) * uSubsurface;

      // Heartbeat vascular surge
      vec3 perfusedVessel = mix(uBaseColor, uVesselColor, vesselPattern * 0.45 + uHeartbeatPulse * 0.25);
      vec3 finalColor = perfusedVessel + uHeartCoreColor * (vPulseFactor * 3.0) + (uBaseColor * sss * 0.6) + vec3(1.0, 0.9, 0.8) * (fresnel * 0.4);

      gl_FragColor = vec4(finalColor, uTranslucency);
    }
  `
};

export function createEmbryoMaterial(options = {}) {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(EmbryoHeartbeatShader.uniforms),
    vertexShader: EmbryoHeartbeatShader.vertexShader,
    fragmentShader: EmbryoHeartbeatShader.fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    ...options
  });
}
