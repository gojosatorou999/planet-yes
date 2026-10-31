import * as THREE from 'three';

const VERT = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vPos = position;
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

// Animated plasma: layered noise for convection cells, darker sunspots and limb darkening.
const FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vN;
  varying vec3 vV;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.02 + 11.7;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = normalize(vPos);
    float t = uTime * 0.05;
    float cells = fbm(p * 3.0 + vec3(0.0, t, t * 0.6));
    float fine = fbm(p * 11.0 - vec3(t * 2.0, 0.0, t));
    float spots = smoothstep(0.62, 0.72, fbm(p * 2.0 + 5.0 + t * 0.3));

    vec3 deep = vec3(0.86, 0.26, 0.02);
    vec3 mid = vec3(1.0, 0.58, 0.12);
    vec3 hot = vec3(1.0, 0.86, 0.5);
    vec3 col = mix(deep, mid, smoothstep(0.25, 0.65, cells));
    col = mix(col, hot, smoothstep(0.5, 0.9, fine) * 0.7);
    col *= 1.0 - spots * 0.55;

    float mu = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
    col *= 0.45 + 0.75 * pow(mu, 0.55); // limb darkening
    gl_FragColor = vec4(col * 1.25, 1.0);
  }
`;

function glowTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,230,180,1)');
  grad.addColorStop(0.18, 'rgba(255,190,110,0.55)');
  grad.addColorStop(0.45, 'rgba(255,140,60,0.16)');
  grad.addColorStop(1, 'rgba(255,120,40,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createSun({ def }) {
  const uniforms = { uTime: { value: 0 } };
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });

  const root = new THREE.Group();
  const userRot = new THREE.Group();
  userRot.rotation.order = 'YXZ';
  const tilt = new THREE.Group();
  tilt.rotation.z = THREE.MathUtils.degToRad(def.model.axialTilt);
  const spin = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), mat);
  spin.add(body);
  tilt.add(spin);
  userRot.add(tilt);
  root.add(userRot);

  // billboards for the corona; scale is in sun radii
  const tex = glowTexture();
  const sprite = (scale, opacity) => {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    s.scale.setScalar(scale);
    return s;
  };
  root.add(sprite(3.4, 0.9), sprite(9, 0.35), sprite(22, 0.12));

  return {
    root,
    userRot,
    pick: body,
    update(dt, t) {
      uniforms.uTime.value = t;
      spin.rotation.y += dt * def.model.spinSpeed;
    },
    dispose() {
      body.geometry.dispose();
      mat.dispose();
      tex.dispose();
      root.traverse((o) => o.material?.dispose());
    },
  };
}
