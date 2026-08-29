import * as THREE from 'three';

/**
 * GLSL Shader for Earth Surface with Dynamic Day/Night Transition,
 * Specular Ocean Glint, and Night-Side City Lights.
 */
export function createEarthSurfaceMaterial({ dayTexture, nightTexture, specularTexture, sunPosition }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDayTexture: { value: dayTexture },
      uNightTexture: { value: nightTexture },
      uSpecularTexture: { value: specularTexture },
      uSunPosition: { value: sunPosition || new THREE.Vector3(0, 0, 0) },
      uNightLightsIntensity: { value: 1.6 },
      uAtmosphereColor: { value: new THREE.Color(0x38bdf8) }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uDayTexture;
      uniform sampler2D uNightTexture;
      uniform sampler2D uSpecularTexture;
      uniform vec3 uSunPosition;
      uniform float uNightLightsIntensity;
      uniform vec3 uAtmosphereColor;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;

      void main() {
        vec3 dayColor = texture2D(uDayTexture, vUv).rgb;
        vec3 nightColor = texture2D(uNightTexture, vUv).rgb;
        float specValue = texture2D(uSpecularTexture, vUv).r;

        vec3 sunDir = normalize(uSunPosition - vWorldPosition);
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);

        // Diffuse illumination from Sun
        float sunDot = dot(vWorldNormal, sunDir);
        float dayFactor = smoothstep(-0.15, 0.25, sunDot);

        // Specular Sun Reflection on Oceans (Day side only)
        vec3 halfVector = normalize(sunDir + viewDir);
        float NdotH = max(0.0, dot(vWorldNormal, halfVector));
        float specular = pow(NdotH, 48.0) * specValue * max(0.0, sunDot) * 1.5;

        // Ambient deep space starlight
        vec3 ambient = dayColor * 0.04;

        // Illuminated Day Surface + Ocean Glint
        vec3 illuminatedDay = dayColor * max(0.0, sunDot) + vec3(specular);

        // Night side city lights (amber/gold city clusters)
        float nightFactor = 1.0 - smoothstep(-0.25, 0.1, sunDot);
        vec3 nightLights = nightColor * nightFactor * uNightLightsIntensity;

        // Final blended surface
        vec3 finalColor = mix(nightLights + ambient, illuminatedDay, dayFactor);

        // Subtle atmospheric Rayleigh blue tint near the limb
        float fresnel = 1.0 - clamp(dot(vWorldNormal, viewDir), 0.0, 1.0);
        finalColor += uAtmosphereColor * pow(fresnel, 4.0) * 0.3 * max(0.0, sunDot);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  });
}
