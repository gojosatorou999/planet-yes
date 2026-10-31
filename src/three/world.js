import * as THREE from 'three';
import { createAtmosphere } from './atmosphere';

// Procedural ring texture: a 1D radial strip (u = 0 at the inner edge) with colour and alpha.
function makeRingTexture(kind) {
  const w = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = 2;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(w, 2);
  const noise = (x) => {
    const s = Math.sin(x * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  };
  for (let i = 0; i < w; i++) {
    const r = i / (w - 1);
    let d = 0;
    if (kind === 'saturn') {
      if (r < 0.14) d = 0.1 + 0.08 * r; // faint C ring
      else if (r < 0.52) d = 0.85 + 0.15 * Math.sin(r * 190); // dense B ring
      else if (r < 0.6) d = 0.04; // Cassini division
      else if (r < 0.97) d = 0.55 + 0.2 * Math.sin(r * 150) - (Math.abs(r - 0.86) < 0.012 ? 0.5 : 0); // A ring
      else d = 0;
      d *= 0.82 + 0.35 * noise(Math.floor(i / 2));
      d = Math.min(Math.max(d, 0), 1);
      const tone = 0.72 + 0.25 * noise(Math.floor(i / 6) + 7);
      for (let y = 0; y < 2; y++) {
        const o = (y * w + i) * 4;
        img.data[o] = 214 * tone;
        img.data[o + 1] = 192 * tone;
        img.data[o + 2] = 154 * tone;
        img.data[o + 3] = d * 235;
      }
    } else {
      // Uranus: a few narrow, dark, faint rings
      const lines = [0.08, 0.22, 0.34, 0.5, 0.64, 0.8, 0.96];
      d = 0;
      lines.forEach((c, k) => {
        d = Math.max(d, Math.exp(-Math.pow((r - c) / (k === 6 ? 0.025 : 0.008), 2)) * (k === 6 ? 0.45 : 0.3));
      });
      for (let y = 0; y < 2; y++) {
        const o = (y * w + i) * 4;
        img.data[o] = 175;
        img.data[o + 1] = 190;
        img.data[o + 2] = 195;
        img.data[o + 3] = d * 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeRings({ kind, inner, outer }) {
  const geo = new THREE.RingGeometry(inner, outer, 192, 1);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getY(i));
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }
  const map = makeRingTexture(kind);
  const mat = new THREE.MeshStandardMaterial({
    map,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    roughness: 1,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

// Generic textured world (Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune).
export function createWorld({ def, manager, maxAnisotropy }) {
  const m = def.model;
  const loader = new THREE.TextureLoader(manager);
  const base = `${import.meta.env.BASE_URL}textures/`;
  const textures = [];
  const load = (file, srgb, onLoad) => {
    const tex = loader.load(`${base}${file}`, onLoad, undefined, () =>
      console.warn(`[planet-explorer] texture failed to load: ${file}`),
    );
    if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    textures.push(tex);
    return tex;
  };

  const mat = new THREE.MeshStandardMaterial({
    color: m.fallback ?? 0x888888,
    roughness: m.roughness ?? 0.9,
    metalness: 0,
  });
  // swap the fallback colour for the (optional) tint once the texture is ready
  mat.map = load(m.map, true, () => {
    mat.color.set(m.tint ?? 0xffffff);
  });
  if (m.bump) {
    mat.bumpMap = load(m.bump, false);
    mat.bumpScale = m.bumpScale ?? 1;
  }

  const root = new THREE.Group();
  const userRot = new THREE.Group();
  userRot.rotation.order = 'YXZ';
  const tilt = new THREE.Group();
  tilt.rotation.z = THREE.MathUtils.degToRad(m.axialTilt ?? 0);
  const spin = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), mat);
  spin.add(body);
  tilt.add(spin);
  userRot.add(tilt);
  root.add(userRot);

  let atmos = null;
  if (m.atmosphere) {
    atmos = createAtmosphere({ color: m.atmosphere.color, rim: m.atmosphere.rim, glow: m.atmosphere.glow });
    root.add(atmos.group);
  }
  if (m.rings) tilt.add(makeRings(m.rings));

  return {
    root,
    userRot,
    pick: body,
    update(dt, _t, _camera, sunDir) {
      spin.rotation.y += dt * m.spinSpeed;
      atmos?.sun.copy(sunDir);
    },
    dispose() {
      root.traverse((o) => {
        o.geometry?.dispose();
        o.material?.map?.dispose();
        o.material?.dispose();
      });
      atmos?.dispose();
      textures.forEach((t) => t.dispose());
    },
  };
}
