import * as THREE from 'three';

/**
 * Calcium Wave & Zinc Spark Shockwave Shader
 * Expanding bioluminescent ripples propagating across the oocyte cortex upon sperm penetration
 */
export const CalciumWaveShader = {
  uniforms: {
    uTime: { value: 0 },
    uWaveOrigin: { value: new THREE.Vector3(1, 0, 0) },
    uWaveRadius: { value: 0.0 },
    uWaveWidth: { value: 0.4 },
    uColorWave: { value: new THREE.Color(0xa855f7) }, // Bioluminescent purple/cyan Ca2+
    uColorSpark: { value: new THREE.Color(0xfacc15) }, // Zinc spark gold
    uIntensity: { value: 1.0 }
  },
  vertexShader: `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uWaveOrigin;
    uniform float uWaveRadius;
    uniform float uWaveWidth;
    uniform vec3 uColorWave;
    uniform vec3 uColorSpark;
    uniform float uIntensity;

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      // Distance from the sperm entry point along the sphere surface
      float dist = length(normalize(vPosition) - normalize(uWaveOrigin));

      // Propagating ripple wave
      float waveDist = abs(dist - uWaveRadius);
      float wavePulse = smoothstep(uWaveWidth, 0.0, waveDist);

      // Multi-frequency harmonic ripple ripples
      float microRipples = sin(dist * 24.0 - uTime * 6.0) * 0.5 + 0.5;
      float sparkNoise = sin(vUv.x * 60.0 + uTime * 4.0) * cos(vUv.y * 60.0 - uTime * 3.0);

      // Zinc spark bursts near wave front
      float sparkGlow = pow(wavePulse, 3.0) * (sparkNoise * 0.5 + 0.5);

      vec3 finalColor = mix(uColorWave, uColorSpark, sparkGlow * 0.8) * (wavePulse * 2.5 + microRipples * wavePulse) * uIntensity;
      float alpha = clamp(wavePulse * 0.85 * uIntensity, 0.0, 0.95);

      if (alpha < 0.01) discard;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

export function createCalciumWaveMaterial(options = {}) {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(CalciumWaveShader.uniforms),
    vertexShader: CalciumWaveShader.vertexShader,
    fragmentShader: CalciumWaveShader.fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    ...options
  });
}
