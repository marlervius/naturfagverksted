// @vitest-environment happy-dom
// Reelt UI og felles spillflyt. Kun WebGL-scenen erstattes: disse testene verifiserer ikke rendering.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LEVELS } from '../dna/js/data.js';
import { CODE, expectedRows, mutationEffect, translationSteps } from '../dna/js/sim.js';

const capture = vi.hoisted(() => ({ ui: null, state: null }));
vi.mock('../molekyl/js/ui.js', async importOriginal => {
  const actual = await importOriginal();
  return { ...actual, createUI: options => (capture.ui = actual.createUI(options)) };
});
vi.mock('../dna/js/scene.js', () => ({
  Stage: class {
    lowQ = false;
    setView(view) { this.view = view; }
    setShift() {}
  },
  createDNAView: () => ({ setState() {} }),
}));

const find = key => document.querySelector(`[data-k="${key}"]`);
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await new Promise(r => setTimeout(r, 0)); };
async function click(key) {
  const node = find(key); expect(node, `mangler kontroll: ${key}`).toBeTruthy();
  expect(node.disabled, `kontrollen er deaktivert: ${key}`).not.toBe(true);
  node.click(); await flush();
}
async function boot({ level = 0, teacher = false, support = false, path = 'start', stars = {}, passed = {}, saved = null, fresh = false } = {}) {
  let start;
  window.claude = { hot: { ready: fn => { start = fn; }, snapshot: fn => { capture.state = fn; } } };
  window.location.hash = teacher ? '#alle' : '';
  if (saved) localStorage.setItem('dnaverkstedet.v1', JSON.stringify(saved));
  await import('../dna/js/main.js');
  await start(fresh || saved ? {} : { epoch: 1, level, unlocked: level + 1, support, path, stars, passed, helped: true });
  await flush();
  if (find('p-check')) {
    await click(`opt-${LEVELS[capture.state().level].predict.correct}`); await click('p-check'); await click('p-start');
  }
  await flush();
}
async function solve(level) {
  const g = level.goal;
  if (g.type === 'parts') for (const p of g.parts) await click('part-' + p);
  if (g.type === 'replicate') await click('open');
  for (const [r, row] of expectedRows(g).entries()) {
    for (const [i, b] of [...row].entries()) {
      const slot = find(`slot-${r}-${i}`);
      if (slot.disabled) continue; // baser som er på plass fra starten
      await click(`slot-${r}-${i}`); await click('base-' + b);
    }
  }
  if (g.type === 'translate' || g.type === 'mutation') {
    for (const c of translationSteps(g)) await click('aa-' + CODE[c]);
    if (g.type === 'mutation') await click('effect-' + mutationEffect(g.original, g.changed));
  }
}

beforeEach(() => {
  vi.resetModules(); localStorage.clear(); capture.state = null;
  document.body.innerHTML = '<div id="stage"></div><div id="ui"></div><div id="boot"><span id="boot-msg"></span></div>';
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.stubGlobal('requestAnimationFrame', callback => { callback(0); return 0; });
});
afterEach(() => { capture.ui?.destroy(); capture.ui = null; vi.unstubAllGlobals(); delete window.claude; });

describe('DNA-verkstedet fra UI-handling til lagret fremgang', () => {
  for (const [i, level] of LEVELS.entries()) {
    it(`${level.id}: oppdraget løses gjennom reelle knapper og lagrer stjerner`, async () => {
      await boot({ level: i, teacher: true });
      expect(document.querySelector('.mv-title').textContent).toBe(level.title.enkel);
      await solve(level);
      expect(find('finish').textContent).toContain('Fullfør');
      await click('finish');
      expect(document.querySelector('.mv-success-name').textContent).toBe(level.title.enkel);
      const saved = JSON.parse(localStorage.getItem('dnaverkstedet.v1'));
      expect(saved.stars[level.id]).toBe(3); expect(saved.level).toBe(i);
    });
  }
  it('gir forståelig feilfeedback, beholder ledig plass og kan deretter fullføres', async () => {
    await boot({ level: 1 });
    await click('base-C');
    expect(document.querySelector('.dn-feedback').textContent).toContain('C passer ikke til A');
    expect(find('slot-0-0').textContent).toBe('·');
    await click('base-T');
    expect(find('slot-0-0').textContent).toBe('T');
    expect(document.activeElement.dataset.k).toBe('base-T');
  });
  it('kan ikke fullføre et uferdig oppdrag', async () => {
    await boot(); await click('finish');
    expect(document.querySelector('.mv-success')).toBeNull();
    expect(document.querySelector('.dn-feedback').textContent).toContain('0 av 3');
    expect(capture.state().stars).toEqual({});
  });
  it('åpner først, og krever begge kopiene ved replikasjon', async () => {
    await boot({ level: 6, teacher: true });
    expect(find('base-A')).toBeNull(); await click('open');
    for (const b of 'TACG') await click('base-' + b);
    await click('finish'); expect(document.querySelector('.mv-success')).toBeNull();
    expect(document.querySelector('.dn-feedback').textContent).toContain('4 av 8');
    for (const b of 'ATGC') await click('base-' + b);
    await click('finish'); expect(capture.state().stars.d07).toBe(3);
  });
  it('forklarer T som distraktor ved RNA-bygging', async () => {
    await boot({ level: 10, teacher: true });
    await click('base-A'); await click('base-T');
    expect(document.querySelector('.dn-feedback').textContent).toContain('RNA bruker U');
    expect(find('slot-0-1').textContent).toBe('·');
  });
  it('vis neste steg teller som hjelp og bevarer tastaturfokus', async () => {
    await boot({ support: true });
    await click('show-next');
    expect(document.activeElement.dataset.k).toBe('show-next');
    await click('part-sukker'); await click('part-base'); await click('finish');
    expect(capture.state().stars.d01).toBe(2);
  });
  it('språkbytte oppdaterer fagord og bevarer byggingen', async () => {
    await boot(); await click('part-fosfat'); await click('lang-fag');
    expect(find('part-sukker').textContent).toBe('Deoksyribose');
    expect(find('part-fosfat').disabled).toBe(true);
    expect(capture.state().lang).toBe('fag');
    await click('lang-enkel'); expect(find('part-sukker').textContent).toBe('DNA-sukker');
  });
  it('nullstiller påbegynt bygging, uten å slette fullførte stjerner', async () => {
    await boot({ stars: { d01: 2 } }); await click('part-fosfat'); await click('m-reset');
    expect(find('part-fosfat').disabled).toBe(false); expect(capture.state().stars.d01).toBe(2);
  });
  it('gjenopptar lagret oppdrag med språk og støtte, men begynner byggingen på nytt', async () => {
    await boot({ saved: { epoch: 1, level: 2, unlocked: 3, path: 'start', lang: 'fag', support: true, helped: true, stars: { d01: 3, d02: 2 } } });
    // Gjenopptaket viser et tenk-først-spørsmål for d03.
    if (find('p-check')) { await click('opt-0'); await click('p-check'); await click('p-start'); }
    expect(capture.state().level).toBe(2); expect(capture.state().lang).toBe('fag');
    expect(find('slot-0-0').textContent).toBe('·'); expect(find('show-next')).toBeTruthy();
    expect(capture.state().stars).toEqual({ d01: 3, d02: 2 });
  });
  it('første oppstart lar eleven velge læringsløp', async () => {
    await boot({ fresh: true });
    expect(find('choose-2')).toBeTruthy(); await click('choose-2');
    if (find('help-ok')) await click('help-ok');
    expect(capture.state().support).toBe(true); expect(capture.state().path).toBe('start');
    expect(find('show-next')).toBeTruthy();
  });
  it('testsperren etter d06 åpnes før d07', async () => {
    await boot({ level: 5, stars: Object.fromEntries(LEVELS.slice(0, 5).map(l => [l.id, 3])) });
    await solve(LEVELS[5]); await click('finish');
    expect(capture.state().unlocked).toBe(6); await click('s-next');
    expect(find('q-start')).toBeTruthy(); await click('q-later');
    expect(capture.state().passed.dt1).toBeUndefined(); expect(capture.state().unlocked).toBe(6);
  });
  it('bestått kapitteltest åpner neste del og lagrer resultatet', async () => {
    await boot({ level: 5, stars: { d06: 3 } });
    // Et fullført kapittel gjenopptas direkte i testsperren.
    await click('q-start');
    for (let i = 0; i < 6; i++) {
      const question = document.querySelector('.mv-quiz .mv-predict-q').textContent;
      const q = (await import('../dna/js/data.js')).TESTS[0].questions.find(q => q.q.enkel === question);
      const correct = q.options[q.correct].enkel;
      const option = [...document.querySelectorAll('.mv-quiz .mv-option')].find(b => b.querySelector('.mv-option-text').textContent === correct);
      option.click(); await flush(); await click('q-next');
    }
    await click('q-done');
    expect(capture.state().passed.dt1).toBe(true); expect(capture.state().unlocked).toBe(7); expect(capture.state().level).toBe(6);
  });
});
