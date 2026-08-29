import * as THREE from 'three';

/**
 * GLSL Atmosphere Scattering Shader (Rayleigh & Mie Scattering Approximation)
 * Used for Earth, Venus, Mars, Uranus, and Neptune
 */
export function createAtmosphereMaterial(colorHex = 0x38bdf8, glowPower = 3.5, multiplier = 1.2) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) },
      uGlowPower: { value: glowPower },
      uMultiplier: { value: multiplier },
      uSunPosition: { value: new THREE.Vector3(0, 0, 0) } // World sun position
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uGlowPower;
      uniform float uMultiplier;
      uniform vec3 uSunPosition;

      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 sunDir = normalize(uSunPosition - vWorldPosition);

        // Fresnel atmospheric rim
        float fresnel = 1.0 - clamp(dot(vNormal, viewDir), 0.0, 1.0);
        float atmosphere = pow(fresnel, uGlowPower) * uMultiplier;

        // Sun directional illumination factor on the atmosphere
        float sunDot = dot(vWorldNormal, sunDir);
        float sunScatter = smoothstep(-0.2, 0.5, sunDot);

        // Sunset/Sunrise scattering reddening on day-night rim
        vec3 rimColor = mix(uColor * 1.3 + vec3(0.2, 0.05, 0.0), uColor, smoothstep(0.0, 0.6, sunDot));

        float alpha = atmosphere * (sunScatter * 0.85 + 0.15);
        gl_FragColor = vec4(rimColor, clamp(alpha, 0.0, 0.95));
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false
  });
}
