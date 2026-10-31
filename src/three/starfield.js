import * as THREE from 'three';

const STAR_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    float tw = 0.78 + 0.22 * sin(uTime * (0.5 + aPhase * 1.5) + aPhase * 60.0);
    gl_PointSize = aSize * uPixelRatio * (0.85 + 0.15 * tw);
    vColor = aColor;
    vAlpha = tw * uAlpha;
  }
`;

const STAR_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 1.8);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

const COLORS = [
  new THREE.Color('#9db4ff'),
  new THREE.Color('#d6e0ff'),
  new THREE.Color('#ffffff'),
  new THREE.Color('#fff1dc'),
  new THREE.Color('#ffd2a1'),
];

function randomOnSphere(radius, out, i, bandAxis, bandWidth) {
  let x, y, z;
  do {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
    z = Math.random() * 2 - 1;
  } while (x * x + y * y + z * z > 1 || x * x + y * y + z * z < 0.01);
  const l = Math.hypot(x, y, z);
  x /= l; y /= l; z /= l;
  if (bandAxis) {
    // pull the point towards a great circle to suggest a faint galactic band
    const d = x * bandAxis.x + y * bandAxis.y + z * bandAxis.z;
    const k = d * (1 - bandWidth);
    x -= bandAxis.x * k;
    y -= bandAxis.y * k;
    z -= bandAxis.z * k;
    const m = Math.hypot(x, y, z);
    x /= m; y /= m; z /= m;
  }
  out[i * 3] = x * radius;
  out[i * 3 + 1] = y * radius;
  out[i * 3 + 2] = z * radius;
}

function makeLayer({ count, radius, size, sizeJitter, alpha, band, pixelRatio }) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const bandAxis = new THREE.Vector3(0.35, 0.8, -0.5).normalize();
  for (let i = 0; i < count; i++) {
    const inBand = band && Math.random() < band;
    randomOnSphere(radius, pos, i, inBand ? bandAxis : null, 0.12);
    const c = COLORS[(Math.random() * COLORS.length) | 0];
    const dim = 0.55 + Math.random() * 0.45;
    col[i * 3] = c.r * dim; col[i * 3 + 1] = c.g * dim; col[i * 3 + 2] = c.b * dim;
    sizes[i] = size + Math.pow(Math.random(), 3) * sizeJitter;
    phases[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uAlpha: { value: alpha },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return points;
}

// Three depth layers of stars plus a few very faint drifting dust motes.
// Layers react to the pointer at different rates to create parallax.
export function createStarfield(pixelRatio) {
  const group = new THREE.Group();
  const layers = [
    { depth: 0.012, obj: makeLayer({ count: 5200, radius: 600, size: 1.1, sizeJitter: 1.2, alpha: 0.75, band: 0.4, pixelRatio }) },
    { depth: 0.03, obj: makeLayer({ count: 900, radius: 420, size: 1.8, sizeJitter: 1.8, alpha: 0.85, band: 0.15, pixelRatio }) },
    { depth: 0.06, obj: makeLayer({ count: 110, radius: 300, size: 2.8, sizeJitter: 2.6, alpha: 0.9, band: 0, pixelRatio }) },
  ];
  layers.forEach((l) => group.add(l.obj));

  const dust = makeLayer({ count: 260, radius: 90, size: 5, sizeJitter: 6, alpha: 0.05, band: 0, pixelRatio });
  group.add(dust);

  const pointer = new THREE.Vector2();
  const smooth = new THREE.Vector2();
  let drift = 0;

  return {
    group,
    // px, py in [-1, 1]; spin is the planet's current angular velocity for a hint of motion
    update(dt, t, px, py, spin) {
      pointer.set(px, py);
      smooth.lerp(pointer, 1 - Math.exp(-dt * 2));
      drift += dt * (0.004 + Math.abs(spin) * 0.004);
      layers.forEach(({ depth, obj }) => {
        obj.material.uniforms.uTime.value = t;
        obj.rotation.y = drift * (depth * 20) + smooth.x * depth;
        obj.rotation.x = -smooth.y * depth * 0.6;
      });
      dust.material.uniforms.uTime.value = t;
      dust.rotation.y = drift * 2;
    },
    setPixelRatio(pr) {
      layers.forEach(({ obj }) => (obj.material.uniforms.uPixelRatio.value = pr));
      dust.material.uniforms.uPixelRatio.value = pr;
    },
    dispose() {
      group.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
    },
  };
}
