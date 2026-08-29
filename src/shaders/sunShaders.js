import * as THREE from 'three';

/**
 * GLSL Shaders for the Procedural Animated Sun Plasma Surface & Multi-Layer Corona
 */

export const SunSurfaceShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorCore: { value: new THREE.Color(0xffffff) },
    uColorMid: { value: new THREE.Color(0xffa500) },
    uColorEdge: { value: new THREE.Color(0xff3300) },
    uColorDark: { value: new THREE.Color(0x4a0a00) },
    uNoiseScale: { value: 4.2 },
    uSpeed: { value: 0.35 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vViewDir;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorCore;
    uniform vec3 uColorMid;
    uniform vec3 uColorEdge;
    uniform vec3 uColorDark;
    uniform float uNoiseScale;
    uniform float uSpeed;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vViewDir;

    // 3D Simplex Noise
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

      i = mod(i, 289.0);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    float fbm(vec3 p) {
      float total = 0.0;
      float amp = 0.5;
      float freq = 1.0;
      for(int i = 0; i < 4; i++) {
        total += snoise(p * freq) * amp;
        freq *= 2.05;
        amp *= 0.5;
      }
      return total;
    }

    void main() {
      vec3 normPos = normalize(vPosition);
      float t = uTime * uSpeed;

      // Convective Granulation Cells & Turbulent Flow
      vec3 p = normPos * uNoiseScale + vec3(0.0, t * 0.3, t * 0.2);
      float n1 = fbm(p);
      float n2 = fbm(p * 2.2 - vec3(t * 0.2, 0.0, t * 0.15));
      float plasma = n1 * 0.6 + n2 * 0.4;

      // Solar flare prominences / magnetic loops
      float flare = abs(snoise(normPos * 5.0 + vec3(0.0, t * 0.4, 0.0)));
      plasma += pow(flare, 3.5) * 0.6;

      // Rich incandescent color mapping
      vec3 col = uColorDark;
      if (plasma > -0.25) col = mix(uColorDark, uColorEdge, smoothstep(-0.25, 0.15, plasma));
      if (plasma > 0.05) col = mix(col, uColorMid, smoothstep(0.05, 0.45, plasma));
      if (plasma > 0.35) col = mix(col, uColorCore, smoothstep(0.35, 0.75, plasma));

      // Limb darkening
      float fresnel = clamp(dot(vNormal, vViewDir), 0.0, 1.0);
      float limb = pow(fresnel, 0.45);
      col *= (limb * 0.5 + 0.5);

      // Incandescent core emission
      col += uColorCore * pow(clamp(plasma, 0.0, 1.0), 2.5) * 0.6;

      gl_FragColor = vec4(col, 1.0);
    }
  `
};

/**
 * GLSL Shader for Volumetric Spherical Sun Corona Glow
 */
export const SunCoronaShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorInner: { value: new THREE.Color(0xfff3a8) },
    uColorOuter: { value: new THREE.Color(0xff5500) },
    uIntensity: { value: 1.4 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewDir;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorInner;
    uniform vec3 uColorOuter;
    uniform float uIntensity;

    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewDir;

    void main() {
      // Atmospheric Corona Fresnel Rim Glow
      float fresnel = 1.0 - abs(dot(vNormal, vViewDir));
      float corona = pow(fresnel, 2.2);

      // Subtle pulsating solar wind filaments
      vec3 norm = normalize(vPosition);
      float ray1 = sin(atan(norm.y, norm.x) * 12.0 + uTime * 1.2) * 0.5 + 0.5;
      float ray2 = sin(atan(norm.z, norm.x) * 18.0 - uTime * 1.6) * 0.5 + 0.5;
      float rayGlow = (ray1 * 0.55 + ray2 * 0.45) * 0.2;

      float alpha = clamp((corona + rayGlow * corona) * uIntensity, 0.0, 1.0);
      vec3 col = mix(uColorOuter, uColorInner, corona);

      gl_FragColor = vec4(col, alpha);
    }
  `
};
