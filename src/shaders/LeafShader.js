import * as THREE from 'three';

/**
 * Custom GLSL Shader for Leaf Cuticle & Mesophyll Tissue
 * Models waxy specular sheen, chlorophyll green internal scattering,
 * vein network translucency, and sunlight light absorption.
 */
export function createLeafMaterial(params = {}) {
  const uniforms = {
    uTime: { value: 0.0 },
    uEpidermisColor: { value: new THREE.Color(params.epidermisColor || '#15803d') },
    uVeinColor: { value: new THREE.Color(params.veinColor || '#86efac') },
    uCuticleSheen: { value: new THREE.Color(params.sheenColor || '#f0fdf4') },
    uLightDirection: { value: new THREE.Vector3(0.3, 1.0, 0.4).normalize() },
    uSunIntensity: { value: 1.0 }
  };

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform vec3 uEpidermisColor;
    uniform vec3 uVeinColor;
    uniform vec3 uCuticleSheen;
    uniform vec3 uLightDirection;
    uniform float uSunIntensity;
    uniform float uTime;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      vec3 lightDir = normalize(uLightDirection);

      // Diffuse lighting
      float diff = max(dot(normal, lightDir), 0.0);

      // Waxy cuticle specular reflection
      vec3 halfVector = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfVector), 0.0), 32.0);

      // Fresnel edge transmission
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.5);

      // Procedural secondary vein pattern
      float veinPattern = sin(vUv.x * 40.0 + sin(vUv.y * 30.0)) * 0.5 + 0.5;
      veinPattern = smoothstep(0.7, 0.95, veinPattern) * 0.35;

      vec3 tissueColor = mix(uEpidermisColor, uVeinColor, veinPattern);
      vec3 finalCol = tissueColor * (diff * 0.7 + 0.3) * uSunIntensity;
      finalCol += uCuticleSheen * spec * 0.45 * uSunIntensity;
      finalCol += uVeinColor * fresnel * 0.25;

      gl_FragColor = vec4(finalCol, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide
  });
}
