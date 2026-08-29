import * as THREE from 'three';

/**
 * Zona Pellucida & Oocyte Subsurface Scattering Shader
 * Photorealistic translucent glycoprotein matrix with Fresnel rim glow and internal yolk granules
 */
export const ZonaPellucidaShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorInner: { value: new THREE.Color(0xfb7185) },
    uColorOuter: { value: new THREE.Color(0xffe4e6) },
    uGlowColor: { value: new THREE.Color(0xf43f5e) },
    uFresnelPower: { value: 2.5 },
    uSubsurfacePower: { value: 1.8 },
    uOpacity: { value: 0.65 },
    uCutaway: { value: 0.0 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorInner;
    uniform vec3 uColorOuter;
    uniform vec3 uGlowColor;
    uniform float uFresnelPower;
    uniform float uSubsurfacePower;
    uniform float uOpacity;
    uniform float uCutaway;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    void main() {
      // Cutaway inspection support: if cutaway > 0.5, discard front-right quadrant
      if (uCutaway > 0.5 && vWorldPosition.x > 0.0 && vWorldPosition.z > 0.0) {
        discard;
      }

      vec3 viewDir = normalize(vViewPosition);
      vec3 normal = normalize(vNormal);

      // Fresnel rim lighting for gelatinous glycoprotein matrix
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);

      // Organic subtle undulating surface sheen
      float noise = sin(vUv.x * 30.0 + uTime * 1.5) * cos(vUv.y * 30.0 + uTime * 1.2) * 0.08;
      
      // Subsurface scattering glow approximation
      float sss = pow(max(dot(viewDir, -normal), 0.0), uSubsurfacePower);

      vec3 baseColor = mix(uColorInner, uColorOuter, fresnel * 0.7 + noise);
      vec3 finalColor = baseColor + uGlowColor * (fresnel * 0.8 + sss * 0.4);

      float alpha = clamp(uOpacity + fresnel * 0.45, 0.0, 0.95);
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

export function createZonaPellucidaMaterial(options = {}) {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(ZonaPellucidaShader.uniforms),
    vertexShader: ZonaPellucidaShader.vertexShader,
    fragmentShader: ZonaPellucidaShader.fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    ...options
  });
}
