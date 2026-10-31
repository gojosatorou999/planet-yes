import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createStarfield } from '../three/starfield';
import { createBody } from '../three/planetRegistry';

const FOV = 40;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const HOME_RADIUS = 210; // scene units that must fit across the home view
const ZOOM = { home: [0.12, 1.5], explore: [0.5, 2.1] };
const UP = new THREE.Vector3(0, 1, 0);

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const damp = (rate, dt) => 1 - Math.exp(-rate * dt);
const lerp = THREE.MathUtils.lerp;

export default function Planet3D({ bodies, mode, focusId, onSelect, onNext, onProgress, onReady, onError }) {
  const hostRef = useRef(null);
  const labelsRef = useRef(null);
  const apiRef = useRef(null);
  const cb = useRef({});
  cb.current = { onSelect, onNext, onProgress, onReady, onError };
  const initial = useRef({ mode, focusId });

  useEffect(() => {
    const host = hostRef.current;
    const labelsEl = labelsRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch (err) {
      cb.current.onError?.('Your browser or device could not start WebGL, which is required to render the 3D scene.');
      return undefined;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x030407, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 2500);

    // The Sun is the light source: a point light with no falloff so every world is lit evenly.
    scene.add(new THREE.PointLight(0xfff1de, 3.4, 0, 0), new THREE.AmbientLight(0x4a5f88, 1.1));

    const stars = createStarfield(pixelRatio);
    scene.add(stars.group);

    const manager = new THREE.LoadingManager();
    manager.onProgress = (_u, loaded, total) => cb.current.onProgress?.(loaded / total);
    const ctx = { manager, maxAnisotropy: Math.min(renderer.capabilities.getMaxAnisotropy(), 8) };

    // ---- bodies, orbit lines, labels -----------------------------------------
    const entries = [];
    const orbitLines = [];
    const proxyGeo = new THREE.SphereGeometry(1, 8, 8);
    try {
      bodies.forEach((def) => {
        const model = createBody(def, ctx);
        scene.add(model.root);

        // invisible, enlarged pick target so small distant planets stay clickable
        const proxy = new THREE.Mesh(proxyGeo, new THREE.MeshBasicMaterial({ visible: false }));
        scene.add(proxy);

        const label = document.createElement('button');
        label.type = 'button';
        label.className = 'body-label';
        label.textContent = def.name.toUpperCase();
        label.addEventListener('click', () => cb.current.onSelect?.(def.id));
        labelsEl.appendChild(label);

        const { orbit, phase } = def.visual;
        if (orbit > 0) {
          const pts = [];
          for (let k = 0; k <= 256; k++) {
            const a = (k / 256) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(a) * orbit, 0, Math.sin(a) * orbit));
          }
          const mat = new THREE.LineBasicMaterial({ color: 0x9cb8e0, transparent: true, opacity: 0.2, depthWrite: false });
          const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat);
          scene.add(line);
          orbitLines.push(line);
        }
        entries.push({
          def,
          model,
          proxy,
          label,
          angle: phase,
          omega: orbit > 0 ? 6 / Math.pow(orbit, 1.5) : 0,
          yaw: 0,
          pitch: 0,
          detail: 0,
        });
      });
    } catch (err) {
      console.error(err);
      cb.current.onError?.('The solar system could not be created.');
      renderer.dispose();
      renderer.domElement.remove();
      return undefined;
    }
    const byId = new Map(entries.map((e) => [e.def.id, e]));

    // ---- state ---------------------------------------------------------------
    let disposed = false;
    let aspect = 1;
    let mode = initial.current.mode;
    let focus = byId.get(initial.current.focusId) ?? entries[0];
    let zoomTarget = 1;
    let zoom = 1;
    let az = 0.4;
    let el = 0.42;
    let azVel = 0;
    let elVel = 0;
    let yawVel = 0;
    let pitchVel = 0;
    let dragging = false;
    let trans = null;
    let intro = true;
    let loaded = false;
    const pointerNdc = new THREE.Vector2();
    const parallax = { x: 0, y: 0 };
    const rig = { P: new THREE.Vector3(), dir: new THREE.Vector3(0, 0, 1), dist: 1, x: 0, y: 0 };
    const goal = { P: new THREE.Vector3(), dir: new THREE.Vector3(0, 0, 1), dist: 1, x: 0, y: 0 };
    const tmp = new THREE.Vector3();
    const sunDir = new THREE.Vector3();
    const camF = new THREE.Vector3();
    const camR = new THREE.Vector3();
    const camU = new THREE.Vector3();

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      aspect = w / h;
      renderer.setSize(w, h);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    };
    resize();

    // Camera framing for the current mode: what to look at, from where, and how far.
    const computeGoal = () => {
      if (mode === 'home') {
        goal.P.set(0, 0, 0);
        goal.dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
        goal.dist = (HOME_RADIUS / (0.9 * TAN * Math.min(aspect, 2.4))) * zoom;
        goal.x = 0;
        goal.y = 0;
        return;
      }
      const { def, model } = focus;
      goal.P.copy(model.root.position);
      if (def.visual.orbit > 0) {
        // view from the sunlit side, swung round so the terminator is visible
        tmp.copy(goal.P).negate().normalize();
        const a = 0.75;
        goal.dir.set(tmp.x * Math.cos(a) + tmp.z * Math.sin(a), 0.2, -tmp.x * Math.sin(a) + tmp.z * Math.cos(a)).normalize();
      } else {
        goal.dir.set(0.25, 0.14, 1).normalize();
      }
      let fillH;
      let fillW;
      if (aspect >= 0.95) {
        fillH = 1.0;
        fillW = 0.5;
        goal.x = -0.4;
        goal.y = 0;
      } else {
        fillH = 0.36;
        fillW = 0.8;
        goal.x = 0;
        goal.y = 0.44;
      }
      const fill = Math.min(fillH, fillW * aspect);
      const size = def.visual.radius * (def.frame ?? 1);
      goal.dist = size * Math.sqrt(1 + 1 / (fill * TAN) ** 2) * zoom;
    };

    // seed the rig at its destination, with an opening dolly-in from far away
    entries.forEach((e) => {
      e.model.root.position.set(Math.cos(e.angle) * e.def.visual.orbit, 0, Math.sin(e.angle) * e.def.visual.orbit);
    });
    computeGoal();
    rig.P.copy(goal.P);
    rig.dir.copy(goal.dir);
    rig.x = goal.x;
    rig.y = goal.y;
    rig.dist = goal.dist * (mode === 'home' ? 1.6 : 2.2);
    const startTime = performance.now();

    apiRef.current = {
      setView(nextMode, id) {
        const nextFocus = byId.get(id) ?? focus;
        if (nextMode === mode && nextFocus === focus) return;
        zoomTarget = 1;
        yawVel = 0;
        pitchVel = 0;
        const from = { P: rig.P.clone(), dir: rig.dir.clone(), dist: rig.dist, x: rig.x, y: rig.y };
        mode = nextMode;
        focus = nextFocus;
        zoom = 1;
        computeGoal();
        const sep = from.P.distanceTo(goal.P);
        trans = {
          t0: performance.now(),
          dur: reduceMotion ? 500 : (nextMode === 'home' || sep < 1 ? 3200 : 2800 + Math.min(1800, sep * 10)),
          from,
          sep,
        };
        labelsEl.classList.toggle('is-hidden', mode !== 'home');
      },
    };
    labelsEl.classList.toggle('is-hidden', mode !== 'home');

    // ---- interaction ---------------------------------------------------------
    const el$ = renderer.domElement;
    el$.style.touchAction = 'none';
    const pointers = new Map();
    let pinchStart = 0;
    let downInfo = null;
    let lastMove = performance.now();
    const raycaster = new THREE.Raycaster();

    // returns the body under the pointer: any body in home, only the focused one in explore
    const pick = (e) => {
      const r = el$.getBoundingClientRect();
      pointerNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(pointerNdc, camera);
      if (mode === 'explore') return raycaster.intersectObject(focus.model.pick, false).length ? focus : null;
      const hits = raycaster.intersectObjects(entries.map((x) => x.proxy), false);
      return hits.length ? entries.find((x) => x.proxy === hits[0].object) : null;
    };

    const onDown = (e) => {
      el$.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        dragging = true;
        downInfo = { t: performance.now(), moved: 0 };
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchStart = Math.hypot(a.x - b.x, a.y - b.y);
        downInfo = null;
      }
    };

    const onMove = (e) => {
      const r = el$.getBoundingClientRect();
      parallax.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      parallax.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      const prev = pointers.get(e.pointerId);
      if (!prev) {
        el$.style.cursor = pick(e) ? 'pointer' : 'grab';
        return;
      }
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchStart > 0) zoomTarget = THREE.MathUtils.clamp(zoomTarget * (pinchStart / d), ...ZOOM[mode]);
        pinchStart = d;
        return;
      }
      if (downInfo) downInfo.moved += Math.abs(dx) + Math.abs(dy);
      const stamp = performance.now();
      const dt = Math.max((stamp - lastMove) / 1000, 1 / 240);
      lastMove = stamp;
      if (mode === 'home') {
        // drag orbits the camera around the solar system
        az -= dx * 0.005;
        el = THREE.MathUtils.clamp(el + dy * 0.004, 0.05, 1.45);
        azVel = THREE.MathUtils.clamp((-dx * 0.005) / dt, -2, 2);
        elVel = THREE.MathUtils.clamp((dy * 0.004) / dt, -1.5, 1.5);
      } else {
        // drag spins the focused body; speed scales with its apparent size
        const k = 0.0055 * Math.min(1.4, 1 / zoom);
        focus.yaw += dx * k;
        focus.pitch = THREE.MathUtils.clamp(focus.pitch + dy * k * 0.7, -0.9, 0.9);
        yawVel = THREE.MathUtils.clamp((dx * k) / dt, -4, 4);
        pitchVel = THREE.MathUtils.clamp((dy * k * 0.7) / dt, -3, 3);
      }
      el$.style.cursor = 'grabbing';
    };

    const onUp = (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) dragging = false;
      if (downInfo && e.type === 'pointerup') {
        const quick = performance.now() - downInfo.t < 400;
        if (quick && downInfo.moved < 6) {
          const hit = pick(e);
          if (hit) {
            if (mode === 'home') cb.current.onSelect?.(hit.def.id);
            else if (!trans) cb.current.onNext?.();
          }
        }
      }
      downInfo = null;
      pinchStart = 0;
      el$.style.cursor = pick(e) ? 'pointer' : 'grab';
    };

    const onWheel = (e) => {
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 33 : 1;
      zoomTarget = THREE.MathUtils.clamp(zoomTarget * Math.exp(e.deltaY * unit * 0.0012), ...ZOOM[mode]);
    };
    const onContextLost = (e) => e.preventDefault();

    el$.style.cursor = 'grab';
    el$.addEventListener('pointerdown', onDown);
    el$.addEventListener('pointermove', onMove);
    el$.addEventListener('pointerup', onUp);
    el$.addEventListener('pointercancel', onUp);
    el$.addEventListener('wheel', onWheel, { passive: false });
    el$.addEventListener('webglcontextlost', onContextLost);

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    manager.onLoad = () => {
      loaded = true;
    };

    // ---- render loop ---------------------------------------------------------
    const clock = new THREE.Clock();
    let readyFired = false;
    const proj = new THREE.Vector3();

    renderer.setAnimationLoop(() => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const now = performance.now();
      const vh = host.clientHeight || 1;
      const vw = host.clientWidth || 1;

      // orbital motion
      entries.forEach((e) => {
        if (e.omega) {
          e.angle += e.omega * dt;
          const o = e.def.visual.orbit;
          e.model.root.position.set(Math.cos(e.angle) * o, 0, Math.sin(e.angle) * o);
        }
      });

      zoom += (zoomTarget - zoom) * damp(7, dt);
      if (mode === 'home' && !dragging) {
        // slow idle drift and inertia for the orbiting camera
        az += azVel * dt;
        el = THREE.MathUtils.clamp(el + elVel * dt, 0.05, 1.45);
        const idle = reduceMotion ? 0 : 0.012;
        azVel += (idle - azVel) * damp(1.1, dt);
        elVel *= Math.exp(-dt * 3);
      }
      computeGoal();

      if (trans) {
        const p = Math.min((now - trans.t0) / trans.dur, 1);
        const e = ease(p);
        rig.P.lerpVectors(trans.from.P, goal.P, e);
        rig.dir.lerpVectors(trans.from.dir, goal.dir, e).normalize();
        // distance blends in log space (constant zoom rate) and pulls back during long hops
        const lift = 1 + 0.5 * Math.min(1, trans.sep / 120) * Math.sin(Math.PI * e);
        rig.dist = Math.exp(lerp(Math.log(trans.from.dist), Math.log(goal.dist), e)) * lift;
        rig.x = lerp(trans.from.x, goal.x, e);
        rig.y = lerp(trans.from.y, goal.y, e);
        if (p >= 1) trans = null;
      } else {
        if (intro && now - startTime > 3200) intro = false;
        const f = damp(intro ? 1.5 : 6, dt);
        rig.P.copy(goal.P); // planets move; stay locked on
        rig.dir.lerp(goal.dir, f).normalize();
        rig.dist += (goal.dist - rig.dist) * f;
        rig.x += (goal.x - rig.x) * f;
        rig.y += (goal.y - rig.y) * f;
      }

      // place the camera so the focus point lands at the requested spot on screen
      camF.copy(rig.dir).negate();
      camR.crossVectors(camF, UP).normalize();
      camU.crossVectors(camR, camF);
      const halfH = TAN * rig.dist;
      camera.position
        .copy(rig.P)
        .addScaledVector(rig.dir, rig.dist)
        .addScaledVector(camR, -rig.x * halfH * aspect)
        .addScaledVector(camU, -rig.y * halfH);
      camera.up.copy(UP);
      camera.lookAt(tmp.copy(camera.position).add(camF));
      camera.updateMatrixWorld();

      // focused body: drag inertia, relax pitch; others settle back to rest
      if (mode === 'explore' && !dragging) {
        focus.yaw += yawVel * dt;
        focus.pitch += pitchVel * dt;
        yawVel *= Math.exp(-dt * 1.6);
        pitchVel *= Math.exp(-dt * 3);
        focus.pitch -= focus.pitch * damp(0.25, dt);
      }

      const pxPerUnitAt = (d) => vh / (2 * TAN * d);
      entries.forEach((e) => {
        const { def, model, proxy, label } = e;
        const isFocus = mode === 'explore' && e === focus;
        if (!isFocus) {
          e.yaw -= e.yaw * damp(1.5, dt);
          e.pitch -= e.pitch * damp(1.5, dt);
        }
        model.userRot.rotation.set(e.pitch, e.yaw, 0);

        const pos = model.root.position;
        const dist = camera.position.distanceTo(pos);
        const size = def.visual.radius * (def.frame ?? 1);
        const ratio = dist / size;
        e.detail = 1 - THREE.MathUtils.smoothstep(ratio, 5, 12);
        if (pos.lengthSq() > 1e-4) sunDir.copy(pos).negate().normalize();
        else sunDir.set(0, 0, 1);
        model.update(dt, t, camera, sunDir, e.detail);

        const ppu = pxPerUnitAt(dist);
        proxy.position.copy(pos);
        proxy.scale.setScalar(Math.max(def.visual.radius, 16 / ppu));
        proxy.visible = false;

        // HTML label under the body (home view only)
        proj.copy(pos).project(camera);
        const behind = proj.z > 1;
        label.style.opacity = behind ? '0' : '';
        label.style.transform = `translate3d(${((proj.x * 0.5 + 0.5) * vw).toFixed(1)}px, ${((-proj.y * 0.5 + 0.5) * vh + def.visual.radius * ppu + 12).toFixed(1)}px, 0) translateX(-50%)`;
      });

      const orbitOpacity = mode === 'home' ? 0.2 : 0.035;
      orbitLines.forEach((l) => {
        l.material.opacity += (orbitOpacity - l.material.opacity) * damp(2, dt);
      });

      stars.group.position.copy(camera.position);
      stars.update(dt, t, parallax.x, parallax.y, mode === 'home' ? azVel * 4 : yawVel);

      renderer.render(scene, camera);

      if (loaded && !readyFired) {
        readyFired = true;
        cb.current.onReady?.();
      }
    });

    return () => {
      disposed = true;
      apiRef.current = null;
      renderer.setAnimationLoop(null);
      ro.disconnect();
      el$.removeEventListener('pointerdown', onDown);
      el$.removeEventListener('pointermove', onMove);
      el$.removeEventListener('pointerup', onUp);
      el$.removeEventListener('pointercancel', onUp);
      el$.removeEventListener('wheel', onWheel);
      el$.removeEventListener('webglcontextlost', onContextLost);
      entries.forEach((e) => {
        e.model.dispose();
        e.proxy.material.dispose();
        e.label.remove();
      });
      orbitLines.forEach((l) => {
        l.geometry.dispose();
        l.material.dispose();
      });
      proxyGeo.dispose();
      stars.dispose();
      renderer.dispose();
      el$.remove();
    };
  }, [bodies]);

  useEffect(() => {
    apiRef.current?.setView(mode, focusId);
  }, [mode, focusId]);

  return (
    <>
      <div className="stage" ref={hostRef} role="img" aria-label="Interactive 3D model of the solar system" />
      <div className="labels" ref={labelsRef} />
    </>
  );
}
