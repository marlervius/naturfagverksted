// Kobler data, logikk, 3D-motor og UI.
import * as data from './data.js';
import { createUI } from './ui.js';
import { World, sigOfMolecule } from './chem.js';

const { EL, ELEMENTS, MOLECULES, LEVELS, STRINGS, TESTS, TEST_DRAW, TEST_PASS, t } = data;
// Ny nøkkel og ny epoke = all gammel fremgang er nullstilt (bevisst, 12.11.2026). Øk EPOCH for å nullstille igjen.
const KEY = 'molekylverkstedet.v2', OLD_KEYS = ['molekylverkstedet.v1'], EPOCH = 2;
const MAX_ATOMS = 14, MAX_Z = 20;
const FIRST = Math.max(0, LEVELS.findIndex((l) => l.goal.type !== 'atom')); // første nivå etter kapittel 0
const TEACHER = location.hash === '#alle';
const boot = document.getElementById('boot'), bootMsg = document.getElementById('boot-msg');

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; } };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* uten lagring virker spillet likevel */ } };
let state;

function start(hot) {
  for (const k of OLD_KEYS) { try { localStorage.removeItem(k); } catch (_) { /* ok */ } }
  const stored = load();
  // Åpne faner som får den nye versjonen, tar med seg tilstanden sin. Den godtas bare fra samme epoke.
  const saved = Object.assign(stored.epoch === EPOCH ? stored : {}, hot && hot.epoch === EPOCH ? hot : {});
  state = {
    epoch: EPOCH, lang: saved.lang === 'fag' ? 'fag' : 'enkel', passed: saved.passed || {},
    path: saved.path === 'teori' || saved.path === 'start' ? saved.path : null,
    stars: saved.stars || {}, unlocked: Math.max(1, saved.unlocked || 1),
    support: !!saved.support, collection: saved.collection || [], level: Number.isInteger(saved.level) ? saved.level : null, helped: !!saved.helped,
  };
  if (TEACHER) state.unlocked = LEVELS.length; // lærersnarvei: alle nivåer åpne, ingen testsperre
  window.claude?.hot?.snapshot?.(() => state);
  init().catch(fail);
}

function fail(err) {
  console.error(err);
  boot.classList.remove('gone');
  bootMsg.textContent = 'Spillet kunne ikke starte. 3D-biblioteket ble ikke lastet, eller nettleseren mangler WebGL. Prøv å laste siden på nytt i Chrome eller Edge.';
}

async function init() {
  const world = new World(EL);
  const catalog = new Map(MOLECULES.map((m) => [sigOfMolecule(m), m]));
  const { Engine } = await import('./engine.js');
  const root = document.getElementById('ui');

  let current = -1, level = null, token = 0, busy = false, hintUsed = false, predictRight = true, inspected = null, bz = 0;
  const reported = new Set();
  const fillStr = (s, vars) => {
    let out = String(s ?? ''); for (const k in vars || {}) out = out.split('{' + k + '}').join(vars[k]);
    return out.charAt(0).toUpperCase() + out.slice(1);
  };
  const L = (key, vars) => fillStr(t(STRINGS[key], state.lang), vars);
  const fillObj = (obj, vars) => ({ enkel: fillStr(obj.enkel, vars), fag: fillStr(obj.fag, vars) });
  const progress = () => ({ index: current, total: LEVELS.length, stars: state.stars, unlocked: state.unlocked });
  const inBuilder = () => !!level && level.goal.type === 'atom';
  const inspect = (id) => {
    if (inBuilder()) return ui.setInspector(bz ? World.neutralInfo(ELEMENTS[bz - 1]) : null);
    inspected = id; ui.setInspector(id != null && world.atoms.has(id) ? world.info(id) : null);
  };

  // ---------- tester ----------
  const idxOf = (id) => LEVELS.findIndex((l) => l.id === id);
  const blocks = (TESTS || []).map((x, n) => ({ ...x, n: n + 1, a: idxOf(x.from), b: idxOf(x.after) }));
  const cap = () => { if (TEACHER) return LEVELS.length; const g = blocks.find((x) => !state.passed[x.id]); return g ? g.b + 1 : LEVELS.length; };
  const pendingTest = () => TEACHER ? null : blocks.find((x) => !state.passed[x.id] && state.stars[LEVELS[x.b].id]) || null;
  const testLabel = (x) => fillObj(STRINGS['ui.testTake'], { n: x.n });
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const unlockTo = (n) => { state.unlocked = Math.max(1, Math.min(LEVELS.length, cap(), n)); };

  const ui = createUI({
    root, data, lang: state.lang, home: { href: '../', label: { enkel: 'Alle verksteder', fag: 'Alle verksteder' } },
    handlers: {
      onPick(sym) {
        if (busy || inBuilder()) return;
        if (world.atoms.size >= MAX_ATOMS) return ui.toast(L('fb.maxAtoms'), 'warn');
        const atom = world.addAtom(sym); if (!atom) return;
        engine.addAtom(atom); engine.sync(); inspect(atom.id); updateCoach();
      },
      onLang(lang) { state.lang = lang === 'fag' ? 'fag' : 'enkel'; save(); ui.setLang(state.lang); renderBuilder(); updateCoach(); },
      onSupport() { if (!demoing) setSupportMode(!state.support, true); },
      onHint() { if (!level) return; hintUsed = true; ui.showHint(t(level.hint, state.lang)); },
      onReset() { if (inBuilder()) setZ(level.startZ, true); else clearBench(); },
      onLevel(id) { const i = LEVELS.findIndex((l) => l.id === id); if (i >= 0 && i < state.unlocked) startLevel(i); },
      onSandbox() { startSandbox(); },
      onPath() { if (!busy) choosePath(); },
      onTest() { const p = pendingTest(); if (p && !busy) runTest(p); },
      onHover(sym) { if (sym && EL[sym]) ui.setInspector(World.neutralInfo(EL[sym])); else inspect(engine.selected ?? engine.hover); },
    },
  });

  const engine = new Engine(document.getElementById('stage'), world, {
    onHover: (id) => inspect(id),
    onBond(a, b) {
      if (busy) return;
      const res = world.tryBond(a, b);
      if (!res.ok) {
        if (res.reason === 'same') return;
        engine.shake(res.atom.id);
        const key = res.reason === 'noble' ? 'fb.noble' : res.reason === 'metalMetal' ? 'fb.metalMetal' : 'fb.full';
        const vars = { name: res.atom.el.name, a: res.atom.el.name, b: res.other ? res.other.el.name : '' };
        ui.toast(L(key, vars), 'warn');
        if (level && level.goal.type === 'event' && level.goal.reason === res.reason) {
          complete({ id: '_' + level.id, formula: res.atom.sym, name: res.atom.el.name, shape: null, fact: fillObj(STRINGS[key], vars) }, STRINGS['ui.eventDone']);
        }
        return;
      }
      engine.sync();
      if (res.kind === 'cov') ui.toast(L(res.order === 1 ? 'fb.cov' : res.order === 2 ? 'fb.cov2' : 'fb.cov3', { a: res.a.el.name, b: res.b.el.name }), 'info');
      else ui.toast(L('fb.ion', { a: res.from.el.name, b: res.to.el.name }), 'info');
      inspect(inspected); checkStable(); updateCoach();
    },
    onUnbond(a, b) {
      if (busy) return;
      if (world.removeBond(a, b)) { engine.sync(); ui.toast(L('fb.removed'), 'info'); pruneReported(); inspect(inspected); updateCoach(); }
    },
    onRemove(id) { if (busy) return; world.removeAtom(id); engine.removeAtom(id); pruneReported(); inspect(null); checkStable(); updateCoach(); },
  });

  engine.preferBonds = true; // bindingene ligger inne i skallene; klikk på en binding skal bryte den

  // ---------- kapittel 0: bygg atomet ----------
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const panel = el('section', 'mv-panel mv-builder'); panel.hidden = true; panel.setAttribute('aria-live', 'polite');
  const bSym = el('span', 'mv-builder-sym'), bName = el('div', 'mv-builder-name'), bZ = el('div', 'mv-builder-z'), bShells = el('div', 'mv-builder-shells');
  const bMinus = el('button', 'mv-btn mv-btn--ghost'), bPlus = el('button', 'mv-btn mv-btn--primary'), bNote = el('p', 'mv-builder-note');
  bMinus.type = bPlus.type = 'button'; bMinus.id = 'mv-builder-minus'; bPlus.id = 'mv-builder-plus';
  const now = el('div', 'mv-builder-now'), nowText = el('div'); nowText.append(bName, bZ); now.append(bSym, nowText);
  const row = el('div', 'mv-builder-row'); row.append(bMinus, bPlus); panel.append(now, bShells, row, bNote); root.append(panel);
  bPlus.addEventListener('click', () => { if (!busy) setZ(bz + 1); });
  bMinus.addEventListener('click', () => { if (!busy) setZ(bz - 1); });

  // ---------- ekstra støtte: trinnpanel, demonstrasjon og opplesing ----------
  let demoing = false, voice = null;
  const coach = el('section', 'mv-panel mv-coach'); coach.hidden = true; coach.setAttribute('aria-label', t(STRINGS['co.title'], 'enkel')); root.append(coach);
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced() ? ms * 0.5 : ms));
  const target = () => (level && level.goal.type === 'molecule' ? MOLECULES.find((m) => m.id === level.goal.id) || null : null);
  function needed() {
    if (!level) return null;
    const m = target(), out = {};
    if (m) { for (const sym of m.atoms) out[sym] = (out[sym] || 0) + 1; return out; }
    if (level.goal.type === 'event' && level.palette) { for (const sym of level.palette) out[sym] = 1; return out; }
    return null;
  }
  function applyPalette() {
    if (!level) return ui.setPalette(null);
    if (inBuilder()) return ui.setPalette(['-']);
    const need = state.support ? needed() : null;
    ui.setPalette(need ? Object.keys(need) : level.palette || null);
  }
  function coachSteps() {
    const need = needed(); if (!need) return null;
    const have = {}; for (const a of world.atoms.values()) have[a.sym] = (have[a.sym] || 0) + 1;
    const steps = Object.entries(need).map(([sym, n]) => ({
      text: L('co.get', { n, name: EL[sym].name }), count: `${Math.min(have[sym] || 0, n)}/${n}`, done: (have[sym] || 0) >= n, sym }));
    const m = target();
    if (m) {
      let total = 0, cur = 0;
      if (m.ionic) { m.atoms.forEach((sym) => { if (EL[sym].role === 'metal') total += EL[sym].bonds; }); world.bonds.forEach((b) => { if (b.kind === 'ion') cur += b.order; }); }
      else { m.bonds.forEach((b) => { total += b[2]; }); world.bonds.forEach((b) => { if (b.kind === 'cov') cur += b.order; }); }
      steps.push({ text: L(m.ionic ? 'co.ion' : 'co.bond'), sub: L('co.how'), count: `${Math.min(cur, total)}/${total}`, done: cur >= total && steps.every((x) => x.done) });
    } else steps.push({ text: L('co.tryBond'), sub: L('co.how'), done: false });
    const extra = Object.keys(have).some((sym) => have[sym] > (need[sym] || 0));
    const metal = Object.keys(need).some((sym) => EL[sym].role === 'metal');
    return { steps, extra, metal, need, have };
  }
  function markNeed(info) {
    root.querySelectorAll('.mv-cell.is-need').forEach((c) => c.classList.remove('is-need'));
    if (!info || demoing) return;
    for (const x of info.steps) if (x.sym && !x.done) root.querySelector(`.mv-cell[data-sym="${x.sym}"]`)?.classList.add('is-need');
  }
  function updateCoach() {
    const info = state.support && !inBuilder() ? coachSteps() : null;
    coach.hidden = !info; markNeed(info);
    if (!info) return;
    if (coach.parentNode !== root) root.append(coach);
    const now = info.steps.findIndex((x) => !x.done);
    const head = el('div', 'mv-coach-head'); head.append(el('h2', 'mv-coach-title', L('co.title')));
    const list = el('ol', 'mv-coach-steps');
    info.steps.forEach((x, k) => {
      const li = el('li', 'mv-coach-step' + (x.done ? ' is-done' : k === now ? ' is-now' : ''));
      const n = el('span', 'mv-coach-n', x.done ? '\u2713' : String(k + 1)); n.setAttribute('aria-hidden', 'true');
      const body = el('span', 'mv-coach-t', x.text);
      if (x.count) body.append(el('span', 'mv-coach-count', x.count));
      if (x.sub && k === now) body.append(el('span', 'mv-coach-sub', x.sub));
      li.append(n, body); list.append(li);
    });
    const notes = [];
    if (info.extra) notes.push(el('p', 'mv-coach-note is-warn', L('co.extra')));
    notes.push(el('p', 'mv-coach-note', L('co.badge')));
    if (info.metal) notes.push(el('p', 'mv-coach-note', L('co.badgeMetal')));
    const row = el('div', 'mv-coach-row');
    if (target()) {
      const show = el('button', 'mv-btn mv-btn--primary', L('co.show')); show.type = 'button'; show.id = 'mv-coach-show'; show.disabled = busy;
      show.addEventListener('click', () => demo()); row.append(show);
    }
    if (voice) {
      const read = el('button', 'mv-btn', L('co.read')); read.type = 'button'; read.id = 'mv-coach-read';
      read.addEventListener('click', () => speak([t(level.brief, state.lang), ...info.steps.filter((x) => !x.done).slice(0, 1).map((x) => x.text + '. ' + (x.sub || ''))].join(' ')));
      row.append(read);
    }
    const kids = [head, list, ...notes]; if (row.childNodes.length) kids.push(row);
    coach.replaceChildren(...kids);
  }
  function setSupportMode(on, announce) {
    state.support = !!on; save(); ui.setSupport(state.support); engine.setSupport(state.support);
    if (state.support && state.lang !== 'enkel') { state.lang = 'enkel'; save(); ui.setLang('enkel'); renderBuilder(); }
    applyPalette(); updateCoach();
    if (announce) ui.toast(L(state.support ? 'ui.supportOnToast' : 'ui.supportOffToast'), state.support ? 'good' : 'info');
  }
  // «Vis meg hvordan»: spillet bygger molekylet steg for steg, rydder bordet og gir eleven turen
  async function demo() {
    const m = target(); if (!m || busy) return;
    const my = token; busy = true; demoing = true; hintUsed = true;
    clearBench(); updateCoach(); ui.toast(L('co.demoGet'), 'info');
    const ids = [];
    for (const sym of m.atoms) {
      if (my !== token) return;
      const a = world.addAtom(sym); engine.addAtom(a); engine.sync(); ids.push(a.id); updateCoach(); await wait(600);
    }
    await wait(900);
    const step = async (a, b) => {
      if (my !== token) return false;
      const res = world.tryBond(a, b); if (!res.ok) return true;
      engine.sync(); updateCoach();
      const A = world.atoms.get(a).el.name, B = world.atoms.get(b).el.name;
      ui.toast(res.kind === 'ion' ? L('co.demoIon', { a: res.from.el.name, b: res.to.el.name }) : L('co.demoBond', { a: A, b: B }), 'info');
      await wait(1600); return true;
    };
    if (m.ionic) {
      for (const a of ids) {
        if (world.atoms.get(a).el.role !== 'metal') continue;
        while (world.unpaired(a) > 0) {
          const b = ids.find((x) => world.atoms.get(x).el.role === 'nonmetal' && world.unpaired(x) > 0);
          if (b == null || !(await step(a, b))) break;
        }
      }
    } else for (const [i, j, o] of m.bonds) for (let k = 0; k < o; k++) if (!(await step(ids[i], ids[j]))) return;
    if (my !== token) return;
    engine.celebrate(ids); await wait(2400);
    if (my !== token) return;
    clearBench(); demoing = false; busy = false; updateCoach(); ui.toast(L('co.yourTurn'), 'good');
  }
  function speak(text) {
    try {
      const synth = window.speechSynthesis; synth.cancel();
      const u = new SpeechSynthesisUtterance(text); u.voice = voice; u.lang = voice.lang; u.rate = 0.9; synth.speak(u);
    } catch (_) { /* opplesing er et tillegg */ }
  }
  try {
    const synth = window.speechSynthesis;
    const pick = () => { voice = synth.getVoices().find((v) => /^(nb|no|nn)([-_]|$)/i.test(v.lang)) || null; updateCoach(); };
    if (synth) { synth.addEventListener('voiceschanged', pick); setTimeout(pick, 0); }
  } catch (_) { voice = null; }

  function markTable() {
    root.querySelectorAll('.mv-cell.is-here, .mv-cell.is-seen').forEach((c) => c.classList.remove('is-here', 'is-seen'));
    if (!inBuilder()) return;
    for (let z = 1; z <= bz; z++) { const c = root.querySelector(`.mv-cell[data-sym="${ELEMENTS[z - 1].sym}"]`); if (c) c.classList.add(z === bz ? 'is-here' : 'is-seen'); }
  }
  function renderBuilder() {
    panel.hidden = !inBuilder(); if (!inBuilder()) return markTable();
    if (panel.parentNode !== root) root.append(panel);
    const e = ELEMENTS[bz - 1];
    bSym.textContent = e.sym; bName.textContent = e.name.charAt(0).toUpperCase() + e.name.slice(1);
    bZ.textContent = L('ui.z') + ' ' + e.z; bShells.textContent = e.shells.join(' · ');
    bPlus.textContent = L('ui.plus'); bMinus.textContent = L('ui.minus'); bNote.textContent = L('ui.builderNote');
    bPlus.disabled = bz >= MAX_Z; bMinus.disabled = bz <= 1; markTable();
  }
  function setZ(z, silent) {
    z = Math.max(1, Math.min(MAX_Z, z)); const prev = bz ? ELEMENTS[bz - 1] : null, e = ELEMENTS[z - 1]; bz = z;
    engine.setBuilder(e); renderBuilder(); inspect(null);
    if (silent || !prev) return;
    if (z > prev.z && e.shells.length > prev.shells.length) ui.toast(L('ui.newShell'), 'info');
    else if (z > prev.z && e.role === 'noble') ui.toast(L('ui.shellFull'), 'good');
    const g = level.goal;
    if ((g.z && g.z === z) || (g.valence && e.valence === g.valence && e.shells.length > 1)) {
      complete({ id: '_' + level.id, formula: e.sym, name: e.name, shape: null, fact: { enkel: e.shells.join(' · '), fag: e.shells.join(' · ') } }, STRINGS['ui.atomDone']);
    }
  }
  window.__game = { world, engine, ui, state, setZ }; // for testing

  function clearBench() { world.clear(); engine.clear(); reported.clear(); inspect(null); updateCoach(); }
  function pruneReported() {
    const live = new Set(world.components().filter((c) => world.isStable(c)).map((c) => c.join(',')));
    for (const k of [...reported]) if (!live.has(k)) reported.delete(k);
  }
  function collect(mol) {
    if (!state.collection.includes(mol.id)) { state.collection.push(mol.id); save(); ui.setCollection(state.collection); return true; }
    return false;
  }

  function checkStable() {
    for (const comp of world.components()) {
      if (!world.isStable(comp)) continue;
      const key = comp.join(','); if (reported.has(key)) continue; reported.add(key);
      const mol = catalog.get(world.signature(comp));
      if (!mol) { ui.toast(L('fb.unknown'), 'info'); continue; }
      engine.celebrate(comp);
      const fresh = collect(mol);
      if (level && level.goal.type === 'molecule') {
        if (mol.id === level.goal.id) complete(mol);
        else ui.toast(L('fb.wrongMolecule', { name: t(mol.name, state.lang) }), 'info');
      } else if (!level) {
        if (fresh) ui.found(mol); else ui.toast(L('ui.found', { name: t(mol.name, state.lang) }), 'good');
      }
    }
  }

  async function complete(mol, headline) {
    if (busy) return; busy = true; const my = token, lv = level, idx = current;
    const stars = 1 + (predictRight ? 1 : 0) + (hintUsed ? 0 : 1);
    state.stars[lv.id] = Math.max(state.stars[lv.id] || 0, stars);
    unlockTo(Math.max(state.unlocked, idx + 2)); save();
    ui.setLevel(lv, progress()); renderBuilder(); refreshTest();
    const gate = TEACHER ? null : blocks.find((x) => x.b === idx && !state.passed[x.id]);
    const choice = await ui.success({ level: lv, molecule: mol, stars, headline, nextLabel: gate ? testLabel(gate) : null });
    if (my !== token) return;
    busy = false;
    if (choice === 'next' && gate) return runTest(gate);
    if (choice === 'next') {
      if (idx + 1 < LEVELS.length) startLevel(idx + 1);
      else { startSandbox(); ui.toast(L('ui.done'), 'good'); }
    }
  }

  const firstOfChapter = (i) => i === 0 || t(LEVELS[i - 1].chapter, 'fag') !== t(LEVELS[i].chapter, 'fag');

  function refreshTest() { const p = pendingTest(); ui.setTest(p ? testLabel(p) : null); }

  async function runTest(x) {
    if (busy) return; const my = ++token; busy = true;
    const questions = shuffle(x.questions.slice()).slice(0, TEST_DRAW).map((q) => {
      const order = shuffle(q.options.map((_, k) => k));
      // ekstra støtte: ett feil alternativ fjernes (tre i stedet for fire)
      if (state.support) { const wrong = order.filter((k) => k !== q.correct); order.splice(order.indexOf(wrong[Math.floor(Math.random() * wrong.length)]), 1); }
      return { q: q.q, why: q.why, options: order.map((k) => q.options[k]), correct: order.indexOf(q.correct) };
    });
    const res = await ui.quiz({ title: x.title, questions, need: Math.min(TEST_PASS, questions.length), offer: state.support ? null : STRINGS['ui.testSupport'] });
    if (my !== token) return;
    busy = false;
    if (!res) return refreshTest();
    if (res.passed) {
      state.passed[x.id] = true; unlockTo(Math.max(state.unlocked, x.b + 2)); save(); refreshTest();
      if (x.b + 1 < LEVELS.length) startLevel(x.b + 1); else startSandbox();
    } else {
      // stryk: de fem modulene må tas på nytt, fra den første
      if (res.support) setSupportMode(true, true);
      for (let k = x.a; k <= x.b; k++) delete state.stars[LEVELS[k].id];
      state.unlocked = x.a + 1; save(); refreshTest(); startLevel(x.a);
    }
  }

  async function startLevel(i, quiet) {
    const my = ++token; current = i; level = LEVELS[i]; state.level = i; save(); demoing = false;
    clearBench(); hintUsed = false; predictRight = true; busy = true;
    ui.setLevel(level, progress()); applyPalette(); updateCoach();
    if (inBuilder()) { bz = 0; setZ(level.startZ, true); } else { engine.setBuilder(null); renderBuilder(); }
    // «Vi starter her»: første oppdrag i hvert kapittel er prøv-og-se; senere spørsmål er gjetting uten stjernetap
    const explore = state.path !== 'teori';
    const right = quiet || (explore && firstOfChapter(i)) ? true : await ui.predict(state.support ? easier(level) : level, { guess: explore || state.support });
    if (my !== token) return;
    predictRight = explore || state.support ? true : right !== false; busy = false; updateCoach();
    if (!quiet && !state.helped && !inBuilder()) { state.helped = true; save(); ui.showHelp && ui.showHelp(); }
  }

  // ekstra støtte: tenk-først-spørsmålet får tre alternativer i stedet for fire
  function easier(lv) {
    const p = lv.predict; if (!p || p.options.length <= 3) return lv;
    const wrong = p.options.map((_, k) => k).filter((k) => k !== p.correct);
    const drop = wrong[(lv.id.charCodeAt(lv.id.length - 1) + p.options.length) % wrong.length];
    const keep = p.options.map((_, k) => k).filter((k) => k !== drop);
    return { ...lv, predict: { ...p, options: keep.map((k) => p.options[k]), correct: keep.indexOf(p.correct) } };
  }

  function startSandbox() {
    ++token; current = -1; level = null; busy = false; demoing = false; state.level = -1; save();
    engine.setBuilder(null); clearBench(); ui.setLevel(null, progress()); ui.setPalette(null); renderBuilder(); updateCoach();
  }

  async function choosePath() {
    const my = ++token; busy = true;
    const pick = await ui.choose({ title: STRINGS['ui.pathTitle'], options: [
      { title: STRINGS['ui.pathStart'], desc: STRINGS['ui.pathStartDesc'] },
      { title: STRINGS['ui.pathTheory'], desc: STRINGS['ui.pathTheoryDesc'] },
      { title: STRINGS['ui.pathSupport'], desc: STRINGS['ui.pathSupportDesc'] }] });
    if (my !== token) return;
    busy = false;
    if (pick < 0 && state.path) return resume();
    state.path = pick === 1 ? 'teori' : 'start';
    if (pick === 2) setSupportMode(true, false);
    if (state.path === 'teori') unlockTo(Math.max(state.unlocked, FIRST + 1));
    save(); startLevel(state.path === 'teori' ? Math.max(FIRST, lastOpen()) : lastOpen());
  }
  // det nivået eleven er kommet til (første uten stjerner blant de åpne)
  function lastOpen() { const i = LEVELS.findIndex((l, k) => k < state.unlocked && !state.stars[l.id]); return i < 0 ? 0 : i; }
  function resume() {
    const p = pendingTest();
    if (p) { startLevel(p.b, true).then(() => runTest(p)); return; }
    if (state.level === -1) startSandbox();
    else startLevel(Number.isInteger(state.level) && state.level >= 0 && state.level < Math.min(LEVELS.length, state.unlocked) ? state.level : 0);
  }

  window.__game.go = startLevel; window.__game.sandbox = startSandbox; window.__game.runTest = runTest; window.__game.blocks = blocks; window.__game.demo = demo; window.__game.setSupportMode = setSupportMode;
  ui.setCollection(state.collection); refreshTest(); ui.setSupport(state.support); engine.setSupport(state.support);
  ui.setLevel(LEVELS[0], progress());
  boot.classList.add('gone');
  if (!state.path) choosePath(); else resume();
}

if (window.claude?.hot?.ready) window.claude.hot.ready(start); else start(window.claude?.hot?.data ?? {});
