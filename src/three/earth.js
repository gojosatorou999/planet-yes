import * as THREE from 'three';
import { createAtmosphere } from './atmosphere';

// Builds a physically lit Earth: day map, normal map, ocean-only gloss, city lights on the
// night side only, drifting clouds that cast soft shadows, and a two-part atmosphere.
// Returns the generic body-model interface used by the scene:
//   { root, userRot, pick, update(dt, t, camera, sunDir), dispose() }
export function createEarth({ def, manager, maxAnisotropy }) {
  const loader = new THREE.TextureLoader(manager);
  const base = `${import.meta.env.BASE_URL}textures/`;
  const textures = [];
  const load = (file, { srgb = false, repeat = false, onLoad } = {}) => {
    const tex = loader.load(`${base}${file}`, onLoad, undefined, () =>
      console.warn(`[planet-explorer] texture failed to load: ${file}`),
    );
    if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    if (repeat) tex.wrapS = THREE.RepeatWrapping;
    tex.anisotropy = maxAnisotropy;
    textures.push(tex);
    return tex;
  };

  const sunView = new THREE.Vector3();
  const uniforms = {
    uSunView: { value: sunView },
    uCloudMap: { value: null },
    uCloudShift: { value: 0 },
  };

  const clouds = load('earth_clouds_1024.png', { srgb: true, repeat: true });
  uniforms.uCloudMap.value = clouds;

  // Falls back to a deep ocean tone if the day map cannot be fetched.
  const surface = new THREE.MeshStandardMaterial({
    color: 0x16324f,
    map: load('earth_atmos_2048.jpg', { srgb: true, onLoad: () => surface.color.set(0xffffff) }),
    normalMap: load('earth_normal_2048.jpg'),
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughness: 1,
    roughnessMap: load('earth_specular_2048.jpg'),
    metalness: 0,
    emissive: new THREE.Color(1.0, 0.78, 0.5),
    emissiveMap: load('earth_lights_2048.png', { srgb: true }),
    emissiveIntensity: 1.25,
  });

  surface.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader =
      'uniform vec3 uSunView;\nuniform sampler2D uCloudMap;\nuniform float uCloudShift;\n' +
      shader.fragmentShader
        .replace(
          '#include <map_fragment>',
          /* glsl */ `
          #include <map_fragment>
          #ifdef USE_MAP
            float cloudShadow = texture2D(uCloudMap, vec2(vMapUv.x - uCloudShift + 0.0012, vMapUv.y - 0.0008)).a;
            diffuseColor.rgb *= 1.0 - 0.4 * cloudShadow;
          #endif`,
        )
        // oceans (bright in the specular map) are glossy, land is matte
        .replace(
          '#include <roughnessmap_fragment>',
          /* glsl */ `
          float roughnessFactor = roughness;
          #ifdef USE_ROUGHNESSMAP
            roughnessFactor = mix(0.92, 0.42, texture2D(roughnessMap, vRoughnessMapUv).g);
          #endif`,
        )
        // city lights fade in only where the surface faces away from the sun
        .replace(
          '#include <emissivemap_fragment>',
          /* glsl */ `
          #ifdef USE_EMISSIVEMAP
            vec4 emissiveColor = texture2D(emissiveMap, vEmissiveMapUv);
            float night = smoothstep(0.08, -0.18, dot(normalize(normal), uSunView));
            totalEmissiveRadiance *= emissiveColor.rgb * night;
          #endif`,
        );
  };

  const cloudMat = new THREE.MeshStandardMaterial({
    map: clouds,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    roughness: 1,
    metalness: 0,
  });

  const sphere = (r, seg = 128) => new THREE.SphereGeometry(r, seg, seg);

  const root = new THREE.Group();
  const userRot = new THREE.Group();
  userRot.rotation.order = 'YXZ';
  const tilt = new THREE.Group();
  tilt.rotation.z = THREE.MathUtils.degToRad(def.model.axialTilt);
  const spin = new THREE.Group();

  const earthMesh = new THREE.Mesh(sphere(1), surface);
  const cloudMesh = new THREE.Mesh(sphere(1.006, 96), cloudMat);
  spin.add(earthMesh, cloudMesh);
  tilt.add(spin);
  userRot.add(tilt);
  root.add(userRot);

  const atmos = createAtmosphere({ color: [0.28, 0.5, 0.95], rim: 1.35, glow: 0.75 });
  root.add(atmos.group);

  let cloudAngle = 0;
  return {
    root,
    userRot,
    pick: earthMesh,
    update(dt, _t, camera, sunDir) {
      const rot = dt * def.model.spinSpeed;
      spin.rotation.y += rot;
      // clouds slip slowly relative to the ground
      const drift = dt * 0.006;
      cloudMesh.rotation.y += drift;
      cloudAngle += drift;
      uniforms.uCloudShift.value = cloudAngle / (Math.PI * 2);
      atmos.sun.copy(sunDir);
      sunView.copy(sunDir).transformDirection(camera.matrixWorldInverse);
      // clouds and surface share spin, so cloud-shadow shift only needs the relative drift
    },
    dispose() {
      root.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
      atmos.dispose();
      textures.forEach((t) => t.dispose());
    },
  };
}
