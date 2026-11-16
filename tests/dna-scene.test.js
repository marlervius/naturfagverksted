// @vitest-environment happy-dom
// Ekte Three.js-geometri uten WebGL. Tekstrasterisering stubbes, ikke geometri eller scenelogikk.
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { Box3, Vector3 } from 'three';
import { LEVELS } from '../dna/js/data.js';
import { createDNAView } from '../dna/js/scene.js';
import { createState, expectedRows, CODE, translationSteps, addAmino, mutationEffect } from '../dna/js/sim.js';
import { disposeTree } from '../celle/js/scene.js';

beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    measureText: text => ({ width: String(text).length * 34 }), fillText() {},
  });
});
afterAll(() => vi.restoreAllMocks());
const text = (key, vars) => key === 'dn.copy' ? `Kopi ${vars.n}` : key;
function finish(goal, state) {
  state.opened = true;
  expectedRows(goal).forEach((row, r) => { state.rows[r] = [...row]; });
  if (goal.type === 'parts') state.parts = [...goal.parts];
  if (goal.type === 'translate' || goal.type === 'mutation') {
    for (const c of translationSteps(goal)) addAmino(state, goal, CODE[c]);
    if (goal.type === 'mutation') state.effect = mutationEffect(goal.original, goal.changed);
  }
}
function assertGeometry(view) {
  const bounds = new Box3().setFromObject(view.root), size = bounds.getSize(new Vector3());
  expect(bounds.isEmpty()).toBe(false);
  for (const value of [...size]) { expect(Number.isFinite(value)).toBe(true); expect(value).toBeLessThan(30); }
  let vertices = 0;
  view.root.traverse(o => {
    if (o.geometry) {
      const values = o.geometry.attributes.position.array;
      expect([...values].every(Number.isFinite), o.type).toBe(true); vertices += values.length / 3;
    }
  });
  return vertices;
}
describe('3D-modellene i DNA-verkstedet', () => {
  for (const level of LEVELS) {
    it(`${level.id}: start, bygging og ferdig modell har gyldig geometri`, () => {
      const state = createState(level.goal), view = createDNAView(level.goal, state, text);
      expect(view.radius).toBeGreaterThan(0); assertGeometry(view);
      if (level.goal.type === 'replicate') { state.opened = true; view.setState(state); assertGeometry(view); }
      finish(level.goal, state); view.setState(state); view.update(0.05, 1); assertGeometry(view);
      expect(view.pickables).toHaveLength(0); disposeTree(view.root);
    });
  }
  it('bare tomme baseplasser kan velges i 3D, med samsvarende rad og kolonne', () => {
    const goal = { type: 'replicate', template: 'ATGC' }, state = createState(goal);
    state.opened = true; state.rows[1][2] = 'G';
    const view = createDNAView(goal, state, text);
    const picks = view.pickables.map(mesh => mesh.userData.pickId);
    expect(picks).toHaveLength(7); expect(picks).toContain('0:0'); expect(picks).toContain('1:3'); expect(picks).not.toContain('1:2');
    disposeTree(view.root);
  });
  it('rydder geometri, materialer og teksturer når byggingen endres', () => {
    const goal = { type: 'pair', template: 'ATGC' }, state = createState(goal), view = createDNAView(goal, state, text);
    const geometries = new Set(), materials = new Set(), textures = new Set();
    const disposed = { geometry: 0, material: 0, texture: 0 };
    view.root.traverse(o => {
      if (o.geometry && !o.geometry.userData.shared) geometries.add(o.geometry);
      if (o.material) materials.add(o.material);
      if (o.material?.map) textures.add(o.material.map);
    });
    geometries.forEach(g => g.addEventListener('dispose', () => disposed.geometry++));
    materials.forEach(m => m.addEventListener('dispose', () => disposed.material++));
    textures.forEach(t => t.addEventListener('dispose', () => disposed.texture++));
    state.rows[0][0] = 'T'; view.setState(state);
    expect(disposed).toEqual({ geometry: geometries.size, material: materials.size, texture: textures.size });
    disposeTree(view.root);
  });
  it('bruker enklere geometri ved lav kvalitet', () => {
    const goal = { type: 'pair', template: 'ATGC' }, state = createState(goal);
    const full = createDNAView(goal, state, text, false), low = createDNAView(goal, state, text, true);
    expect(assertGeometry(low)).toBeLessThan(assertGeometry(full));
    disposeTree(full.root); disposeTree(low.root);
  });
});
