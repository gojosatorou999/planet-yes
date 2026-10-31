import * as THREE from 'three';

const VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vWN;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWN = normalize(mat3(modelMatrix) * normal);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-(viewMatrix * wp).xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

// Thin rim of scattered light hugging the limb, strongest on the sunlit side.
const RIM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSun;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vWN;
  void main() {
    float f = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), uPower);
    float s = dot(normalize(vWN), uSun);
    float lit = smoothstep(-0.4, 0.55, s);
    float twilight = clamp(1.0 - abs(s) * 3.5, 0.0, 1.0);
    vec3 col = mix(uColor, vec3(1.0, 0.6, 0.38), twilight * 0.35);
    gl_FragColor = vec4(col * f * uIntensity * mix(0.1, 1.0, lit), 1.0);
  }
`;

// Soft halo beyond the limb (rendered on the back faces of a larger shell).
const GLOW_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSun;
  uniform float uPower;
  uniform float uIntensity;
  uniform float uLimb;
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vWN;
  void main() {
    float a = max(-dot(normalize(vN), normalize(vV)), 0.0);
    float g = pow(smoothstep(0.0, uLimb, a), uPower);
    float s = dot(normalize(vWN), uSun);
    float lit = smoothstep(-0.6, 0.5, s);
    gl_FragColor = vec4(uColor * g * uIntensity * mix(0.08, 1.0, lit), 1.0);
  }
`;

const material = (frag, uniforms, side) =>
  new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: frag,
    uniforms,
    side,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

// Two-part atmosphere for a unit-radius planet. `sun` is a Vector3 (world-space direction
// towards the Sun) that the owner updates every frame.
export function createAtmosphere({ color, rim = 1.35, glow = 0.75, rimPower = 3.2, glowPower = 2.6 }) {
  const sun = new THREE.Vector3(0, 0, 1);
  const c = new THREE.Color(color[0], color[1], color[2]);
  const rimScale = 1.018;
  const glowScale = 1.13;
  const sphere = (r) => new THREE.SphereGeometry(r, 96, 96);

  const rimMesh = new THREE.Mesh(
    sphere(rimScale),
    material(RIM_FRAG, { uColor: { value: c }, uSun: { value: sun }, uPower: { value: rimPower }, uIntensity: { value: rim } }, THREE.FrontSide),
  );
  const glowMesh = new THREE.Mesh(
    sphere(glowScale),
    material(
      GLOW_FRAG,
      {
        uColor: { value: c.clone().multiplyScalar(0.8) },
        uSun: { value: sun },
        uPower: { value: glowPower },
        uIntensity: { value: glow },
        uLimb: { value: Math.sqrt(1 - 1 / (glowScale * glowScale)) },
      },
      THREE.BackSide,
    ),
  );
  const group = new THREE.Group();
  group.add(rimMesh, glowMesh);

  return {
    group,
    sun,
    dispose() {
      group.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
    },
  };
}
