import * as THREE from 'three';

function haloTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.3, 'rgba(210,225,255,0.28)');
  grad.addColorStop(1, 'rgba(180,205,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// Thin orbit lines and bright moons around a unit-radius planet. Everything fades in
// with `detail` (0..1) so moons only appear when the camera is close to their planet.
export function createMoons(defs, { manager, maxAnisotropy }) {
  const loader = new THREE.TextureLoader(manager);
  const base = `${import.meta.env.BASE_URL}textures/`;
  const textures = [];
  const load = (file, srgb) => {
    const t = loader.load(`${base}${file}`, undefined, undefined, () =>
      console.warn(`[planet-explorer] texture failed to load: ${file}`),
    );
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAnisotropy;
    textures.push(t);
    return t;
  };

  const halo = haloTexture();
  const group = new THREE.Group();
  group.visible = false;
  const items = defs.map((d, i) => {
    const pivot = new THREE.Group();
    pivot.rotation.x = d.tilt ?? 0;
    pivot.rotation.z = i * 0.35;

    const pts = [];
    for (let k = 0; k <= 180; k++) {
      const a = (k / 180) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * d.orbit, 0, Math.sin(a) * d.orbit));
    }
    const lineMat = new THREE.LineBasicMaterial({ color: 0xbcd2f2, transparent: true, opacity: 0, depthWrite: false });
    const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lineMat);

    const carrier = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: d.color ?? 0xcccccc, roughness: 0.92, metalness: 0 });
    if (d.map) {
      mat.map = load(d.map, true);
      mat.color.set(0xffffff);
      mat.emissiveMap = mat.map;
      mat.emissive.set(0xffffff);
    } else {
      mat.emissive.set(d.color ?? 0xcccccc);
    }
    mat.emissiveIntensity = 0.28; // keeps the night side of a moon readable
    if (d.bump) {
      mat.bumpMap = load(d.bump, false);
      mat.bumpScale = 1.2;
    }
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(d.radius, 48, 48), mat);
    mesh.position.x = d.orbit;
    const haloMat = new THREE.SpriteMaterial({ map: halo, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const sprite = new THREE.Sprite(haloMat);
    sprite.scale.setScalar(d.radius * 5);
    mesh.add(sprite);
    carrier.add(mesh);
    carrier.rotation.y = i * 2.1 + 0.6;

    pivot.add(line, carrier);
    group.add(pivot);
    return { d, carrier, mesh, lineMat, haloMat };
  });

  return {
    group,
    update(dt, detail) {
      group.visible = detail > 0.01;
      if (!group.visible) return;
      const e = detail * detail * (3 - 2 * detail);
      items.forEach((it) => {
        it.carrier.rotation.y += dt * it.d.speed;
        it.mesh.scale.setScalar(0.35 + 0.65 * e);
        it.lineMat.opacity = 0.42 * e;
        it.haloMat.opacity = 0.5 * e;
      });
    },
    dispose() {
      group.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
      halo.dispose();
      textures.forEach((t) => t.dispose());
    },
  };
}
