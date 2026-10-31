import { createEarth } from './earth';
import { createWorld } from './world';
import { createSun } from './sun';
import { createMoons } from './moons';

// Maps `body.model.type` to a builder. Each builder returns a unit-radius model:
//   { root, userRot, pick, update(dt, t, camera, sunDir), dispose() }
// root is positioned and scaled by the scene; userRot receives drag rotation;
// pick is the mesh used for click and hover ray tests.
// To add a new kind of body, write a builder and register it here.
const BUILDERS = {
  earth: createEarth,
  world: createWorld,
  sun: createSun,
};

// Builds a body: its model, scaled to its visual radius, plus orbit lines and moons.
export function createBody(def, ctx) {
  const build = BUILDERS[def.model?.type];
  if (!build) throw new Error(`No 3D model registered for "${def.id}"`);
  const model = build({ def, ...ctx });
  model.root.scale.setScalar(def.visual.radius);
  const moons = def.moons?.length ? createMoons(def.moons, ctx) : null;
  if (moons) model.root.add(moons.group);

  return {
    ...model,
    update(dt, t, camera, sunDir, detail) {
      model.update(dt, t, camera, sunDir);
      moons?.update(dt, detail);
    },
    dispose() {
      model.dispose();
      moons?.dispose();
    },
  };
}
