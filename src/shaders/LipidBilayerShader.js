import * as THREE from 'three';

/**
 * Custom GLSL Shader for Thylakoid Phospholipid Bilayer Membrane
 * Semi-translucent lipid bilayer with subsurface scattering, fluid membrane wobble,
 * hydrophobic core depth darkening, and lumenal/stromal polarity.
 */
export function createLipidBilayerMaterial(params = {}) {
  const uniforms = {
    uTime: { value: 0.0 },
    uHeadColor: { value: new THREE.Color(params.headColor || '#0284c7') },       // Hydrophilic heads (cyan/blue)
    uTailColor: { value: new THREE.Color(params.tailColor || '#0f172a') },       // Hydrophobic core (dark slate)
    uSubsurfaceColor: { value: new THREE.Color(params.sssColor || '#38bdf8') }, // Subsurface light
    uOpacity: { value: params.opacity || 0.88 },
    uRoughness: { value: 0.3 }
  };

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    uniform float uTime;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);

      // Fluid mosaic membrane surface ripples
      vec3 pos = position;
      float ripple = sin(pos.x * 3.0 + uTime * 1.5) * cos(pos.z * 3.0 + uTime * 1.2) * 0.04;
      pos.y += ripple;

      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPos.xyz;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 uHeadColor;
    uniform vec3 uTailColor;
    uniform vec3 uSubsurfaceColor;
    uniform float uOpacity;
    uniform float uTime;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Subsurface scattering & Fresnel transmission
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
      
      // Phospholipid polar head vs hydrophobic tail gradient along Y
      float headGradient = smoothstep(0.0, 0.45, abs(vNormal.y));

      // Internal lipid density noise pattern
      float pattern = sin(vWorldPosition.x * 20.0) * sin(vWorldPosition.z * 20.0) * 0.15;

      vec3 baseCol = mix(uTailColor, uHeadColor, headGradient + pattern);
      vec3 finalCol = mix(baseCol, uSubsurfaceColor, fresnel * 0.6);

      // Add soft rim glow
      finalCol += uSubsurfaceColor * fresnel * 0.5;

      gl_FragColor = vec4(finalCol, uOpacity);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });
}
