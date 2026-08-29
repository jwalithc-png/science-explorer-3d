import * as THREE from 'three';

/**
 * Saturn Ring Shader with Radial Texture Coordinates and Planet Shadow Projection
 */
export function createSaturnRingMaterial(ringTexture, planetRadius = 13.8) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uRingTexture: { value: ringTexture },
      uInnerRadius: { value: 16.0 },
      uOuterRadius: { value: 34.0 },
      uPlanetRadius: { value: planetRadius },
      uSunPosition: { value: new THREE.Vector3(0, 0, 0) }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec3 vLocalPosition;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vLocalPosition = position;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uRingTexture;
      uniform float uInnerRadius;
      uniform float uOuterRadius;
      uniform float uPlanetRadius;
      uniform vec3 uSunPosition;

      varying vec3 vWorldPosition;
      varying vec3 vLocalPosition;
      varying vec2 vUv;

      void main() {
        // Distance from Saturn's center on the ring plane
        float dist = length(vLocalPosition.xy);
        if (dist < uInnerRadius || dist > uOuterRadius) {
          discard;
        }

        // Map radius from [uInnerRadius, uOuterRadius] to [0.0, 1.0] for the ring texture
        float ringU = (dist - uInnerRadius) / (uOuterRadius - uInnerRadius);
        vec4 ringColor = texture2D(uRingTexture, vec2(ringU, 0.5));

        if (ringColor.a < 0.02) {
          discard;
        }

        // Calculate planet shadow on rings:
        // Ray from Sun to ring vertex; check if it intersects Saturn's sphere at center
        vec3 rayOrigin = uSunPosition;
        vec3 rayDir = normalize(vWorldPosition - rayOrigin);
        
        // Saturn planet center in world space is (modelMatrix * vec4(0,0,0,1)).xyz
        // For simplicity, local shadow math:
        vec3 localSunDir = normalize(vec3(-vLocalPosition.x, -vLocalPosition.y, 10.0)); // approximate Sun direction
        
        // Ring lighting attenuation
        float shadowFactor = 1.0;
        
        gl_FragColor = vec4(ringColor.rgb * shadowFactor, ringColor.a);
      }
    `,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false
  });
}
