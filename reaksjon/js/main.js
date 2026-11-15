// Reaksjonsverkstedet – kobler reaksjonsdata, reaksjonslogikk, 3D-motoren og UI fra Molekylverkstedet.
// Flyt per oppdrag: tenk først → balanser likningen → gjør reaksjonen på benken → suksesskort.
import * as mdata from '../../molekyl/js/data.js';
import { createUI } from '../../molekyl/js/ui.js';
import { World, sigOfMolecule } from '../../molekyl/js/chem.js';
import { STRINGS as RSTRINGS } from './strings.js';
import {
  balanceStatus, solution, canReact, loadReactants, snapshot, energy, estimateDH, productStatus, termFormula, MAX_COEF,
} from './react.js';

const { EL, MOLECULES, t } = mdata;
const STRINGS = { ...mdata.STRINGS, ...RSTRINGS };
const MOL = Object.fromEntries(MOLECULES.map((m) => [m.id, m]));
const KEY = 'reaksjonsverkstedet.v1';
const VIS_MAX = 40; // maks atomer i balanseringsbildet (venstre + høyre)
const TEACHER = location.hash === '#alle';
const boot = document.getElementById('boot'), bootMsg = document.getElementById('boot-msg');

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; } };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* uten lagring virker spillet likevel */ } };
let state;

function start(hot) {
  const saved = Object.assign(load(), hot || {});
  state = {
    lang: saved.lang === 'fag' ? 'fag' : 'enkel', passed: saved.passed || {},
    path: saved.path === 'teori' || saved.path === 'start' ? saved.path : null,
    stars: saved.stars || {}, unlocked: Math.max(1, saved.unlocked || 1),
    support: !!saved.support, level: Number.isInteger(saved.level) ? saved.level : null, helped: !!saved.helped,
    made: Array.isArray(saved.made) ? saved.made : [],
  };
  window.claude?.hot?.snapshot?.(() => state);
  init().catch(fail);
}

function fail(err) {
  console.error(err);
  boot.classList.remove('gone');
  bootMsg.textContent = 'Spillet kunne ikke starte. 3D-biblioteket ble ikke lastet, eller nettleseren mangler WebGL. Prøv å laste siden på nytt i Chrome eller Edge.';
}

async function init() {
  const { BOND_E, RX, LEVELS, TESTS, TEST_DRAW, TEST_PASS } = await import('./data.js');
  if (TEACHER) state.unlocked = LEVELS.length; // lærersnarvei: alle nivåer åpne, ingen testsperre
  const data = { ...mdata, LEVELS, TESTS, STRINGS };
  const world = new World(EL);
  const catalog = new Map(MOLECULES.map((m) => [sigOfMolecule(m), m]));
  const { Engine } = await import('../../molekyl/js/engine.js');
  const root = document.getElementById('ui');

  // oppdragstilstand
  let current = -1, level = null, rx = null, token = 0, busy = false, hintUsed = false, predictRight = true, inspected = null;
  let phase = 'idle', doBalance = true, doReact = false, coefL = [], coefR = [], startSnap = null, changes = 0, nudged = {};
  let visual = { ok: false, L: [], R: [] };
  const reported = new Set();

  // ---------- tekst ----------
  const fillStr = (s, vars) => {
    let out = String(s ?? ''); for (const k in vars || {}) out = out.split('{' + k + '}').join(vars[k]);
    return out.charAt(0).toUpperCase() + out.slice(1);
  };
  const L = (key, vars) => fillStr(t(STRINGS[key], state.lang), vars);
  const tx = (x) => t(x, state.lang);
  const progress = () => ({ index: current, total: LEVELS.length, stars: state.stars, unlocked: state.unlocked });
  const num = (x) => Math.abs(Math.round(x)).toLocaleString('nb-NO');
  const signed = (x) => (x < 0 ? '−' : x > 0 ? '+' : '') + num(x);
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced() ? ms * 0.4 : ms));
  const ionic = (r) => [...r.reactants, ...r.products].some((x) => (x.atom && EL[x.atom]?.role === 'metal') || (x.mol && MOL[x.mol]?.ionic));
  const termName = (term) => term.atom ? EL[term.atom].name : term.custom ? tx(term.custom.name) : tx(MOL[term.mol].name);

  // ---------- små DOM-hjelpere ----------
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const btn = (cls, text, k, onClick) => { const b = el('button', cls, text); b.type = 'button'; if (k) b.dataset.k = k; b.addEventListener('click', onClick); return b; };
  function formulaEl(f, cls = 'mv-formula') {
    const span = el('span', cls);
    for (const part of String(f || '').split(/(\d+)/)) { if (!part) continue; if (/^\d+$/.test(part)) span.append(el('sub', null, part)); else span.append(part); }
    return span;
  }
  // likningen som tekst med senkede indekser; koeffisient 1 skrives ikke
  function equationEl(r, cl, cr, cls) {
    const box = el('span', 'mv-formula rx-eq' + (cls ? ' ' + cls : ''));
    const side = (terms, k) => terms.forEach((term, i) => {
      if (i) box.append(el('span', 'rx-eq-op', ' + '));
      if (k[i] !== 1) box.append(el('span', 'rx-eq-k', String(k[i])));
      box.append(formulaEl(termFormula(term, MOL), 'rx-eq-f'));
    });
    side(r.reactants, cl); box.append(el('span', 'rx-eq-arrow', ' → ')); side(r.products, cr);
    return box;
  }

  const ui = createUI({
    root, data, lang: state.lang, home: { href: '../', label: { enkel: 'Alle verksteder', fag: 'Alle verksteder' } },
    table: false, sandbox: false, collection: false,
    handlers: {
      onPick() { ui.toast(L('rx.noAdd'), 'warn'); },
      onLang(lang) { state.lang = lang === 'fag' ? 'fag' : 'enkel'; save(); ui.setLang(state.lang); render(); },
      onSupport() { setSupportMode(!state.support, true); },
      onHint() { if (!level) return; hintUsed = true; ui.showHint(tx(level.hint)); },
      onReset() { resetPhase(); },
      onLevel(id) { const i = LEVELS.findIndex((l) => l.id === id); if (i >= 0 && i < state.unlocked) startLevel(i); },
      onPath() { if (!busy) choosePath(); },
      onTest() { const p = pendingTest(); if (p && !busy) runTest(p); },
      onHover() { inspect(engine.selected ?? engine.hover); },
    },
  });
  root.classList.add('rx-ui');

  // ---------- benken: bindinger brytes og lages, atomer verken forsvinner eller oppstår ----------
  function onBond(a, b) {
    if (busy) return;
    if (phase !== 'react') return ui.toast(L(phase === 'balance' ? 'rx.notNow' : 'rx.done'), 'info');
    const res = world.tryBond(a, b);
    if (!res.ok) {
      if (res.reason === 'same') return;
      engine.shake(res.atom.id);
      const key = res.reason === 'noble' ? 'fb.noble' : res.reason === 'metalMetal' ? 'fb.metalMetal' : 'rx.full';
      return ui.toast(L(key, { name: res.atom.el.name, a: res.atom.el.name, b: res.other ? res.other.el.name : '' }), 'warn');
    }
    engine.sync();
    if (res.kind === 'cov') ui.toast(L('rx.made', { a: res.a.el.name, b: res.b.el.name }), 'info');
    else ui.toast(L('fb.ion', { a: res.from.el.name, b: res.to.el.name }), 'info');
    inspect(inspected); afterChange();
  }
  function onUnbond(a, b) {
    if (busy) return;
    if (phase !== 'react') return ui.toast(L(phase === 'balance' ? 'rx.notNow' : 'rx.done'), 'info');
    if (world.removeBond(a, b)) { engine.sync(); ui.toast(L('rx.broke'), 'info'); pruneReported(); inspect(inspected); afterChange(); }
  }
  function onRemove(id) { if (busy) return; if (id != null) engine.shake(id); ui.toast(L('rx.noRemove'), 'warn'); }

  const engine = new Engine(document.getElementById('stage'), world, { onHover: (id) => inspect(id), onBond, onUnbond, onRemove });
  // Oppdragskortet står til venstre på brede skjermer: flytt scenen ut fra det, så ingen molekyler havner bak kortet.
  const fitStage = () => {
    const r = root.querySelector('.mv-mission')?.getBoundingClientRect();
    const side = r && r.width && r.left < 40 && r.right < innerWidth * 0.45 && r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.3;
    const shift = side ? Math.round(r.right / 2) : 0;
    if (shift !== (engine.viewShiftX || 0)) { engine.viewShiftX = shift; engine._resize(); }
  };
  addEventListener('resize', fitStage); setTimeout(fitStage, 0); setTimeout(fitStage, 600);
  engine.preferBonds = true; // bindingene ligger inne i skallene; her må de være lette å klikke på
  const inspect = (id) => { inspected = id; ui.setInspector(id != null && world.atoms.has(id) ? world.info(id) : null); };

  function clearBench() { world.clear(); engine.clear(); reported.clear(); visual = { ok: visual.ok, L: [], R: [] }; inspect(null); }
  function pruneReported() {
    const live = new Set(world.components().filter((c) => world.isStable(c)).map((c) => c.join(',')));
    for (const k of [...reported]) if (!live.has(k)) reported.delete(k);
  }

  // Ett molekyl (eller fritt atom) av et ledd, plassert rundt et punkt. Bruker loadReactants for ett eksemplar.
  function placeGroup(term, at, anchor) {
    const [g] = loadReactants(world, { reactants: [{ ...term, n: 1 }] }, MOL);
    g.atoms.forEach((a, k) => {
      const ang = k * 2.4 + Math.random() * 0.3, r = k ? 0.75 : 0;
      engine.addAtom(a, { x: at.x + Math.cos(ang) * r, y: at.y + Math.sin(ang * 1.3) * r * 0.6, z: at.z + Math.sin(ang) * r });
      if (anchor) engine.setAnchor(a.id, anchor);
    });
    return g.atoms.map((a) => a.id);
  }

  // Balansering: venstre side (reaktanter) og høyre side (produkter) vises som molekyler, i takt med tallene.
  const sideX = () => (innerWidth / Math.max(1, innerHeight) < 0.9 ? 1.2 : 3.4);
  function syncVisual() {
    if (!visual.ok || phase !== 'balance') return;
    const st = balanceStatus(rx, coefL, coefR, MOL);
    const total = [st.left, st.right].reduce((s, c) => s + Object.values(c).reduce((a, b) => a + b, 0), 0);
    if (total > VIS_MAX) { if (world.atoms.size) clearBench(); return; }
    for (const side of ['L', 'R']) {
      const terms = side === 'L' ? rx.reactants : rx.products, k = side === 'L' ? coefL : coefR;
      const anchor = { x: side === 'L' ? -sideX() : sideX(), y: 0.6, z: 0 };
      terms.forEach((term, i) => {
        const list = visual[side][i] || (visual[side][i] = []);
        while (list.length < k[i]) list.push(placeGroup(term, { x: anchor.x + (Math.random() - 0.5), y: 0.6 + (Math.random() - 0.5) * 2, z: (Math.random() - 0.5) * 2 }, anchor));
        while (list.length > k[i]) for (const id of list.pop()) { world.removeAtom(id); engine.removeAtom(id); }
      });
    }
    engine.sync(); if (inspected != null && !world.atoms.has(inspected)) inspect(null);
  }

  // Reaksjon: reaktantene med riktige koeffisienter, hvert molekyl samlet og molekylene spredt.
  function loadBench() {
    clearBench();
    const groups = loadReactants(world, rx, MOL), n = groups.length;
    groups.forEach((g, i) => {
      const a = (i / n) * Math.PI * 2 + 0.5, rad = n > 1 ? (1.6 + n * 0.3) * (innerWidth < innerHeight ? 0.55 : 1) : 0;
      const c = { x: Math.cos(a) * rad, y: 0.6 + Math.sin(a * 2) * 0.5, z: Math.sin(a) * rad * 0.6 };
      g.atoms.forEach((atom, k) => {
        const ang = k * 2.4, r = k ? 0.75 : 0;
        engine.addAtom(atom, { x: c.x + Math.cos(ang) * r, y: c.y + Math.sin(ang * 1.3) * r * 0.6, z: c.z + Math.sin(ang) * r });
      });
    });
    engine.sync(); startSnap = snapshot(world);
    for (const comp of world.components()) if (world.isStable(comp)) reported.add(comp.join(','));
  }

  // Hva er denne stabile komponenten? Ioneforbindelser normaliseres til forholdsformel (Mg2O2 → MgO).
  function molOf(comp) {
    let sig = world.signature(comp);
    if (sig.endsWith('|i')) {
      const c = {}; for (const id of comp) { const s = world.atoms.get(id).sym; c[s] = (c[s] || 0) + 1; }
      const g = Object.values(c).reduce((a, b) => { while (b) [a, b] = [b, a % b]; return a; });
      sig = Object.keys(c).sort().map((s) => s + c[s] / g).join('') + '|i';
    }
    return catalog.get(sig) || null;
  }
  function afterChange() {
    for (const comp of world.components()) {
      if (!world.isStable(comp)) continue;
      const key = comp.join(','); if (reported.has(key)) continue; reported.add(key);
      const mol = molOf(comp); if (!mol) continue;
      if (rx.products.some((x) => x.mol === mol.id)) { engine.celebrate(comp); ui.toast(L('rx.productMade', { name: tx(mol.name) }), 'good'); }
      else if (!rx.reactants.some((x) => x.mol === mol.id)) ui.toast(L('rx.wrongProduct', { name: tx(mol.name) }), 'info');
    }
    render();
    if (productStatus(world, rx, MOL).done) finishReact();
  }
  async function finishReact() {
    if (busy) return; const my = token; busy = true; phase = 'done';
    engine.celebrate([...world.atoms.keys()]); render();
    await wait(1100);
    if (my !== token) return;
    busy = false; complete();
  }

  // ---------- balansering ----------
  function setCoef(side, i, k, silent) {
    if (busy || phase !== 'balance') return;
    const arr = side === 'L' ? coefL : coefR; k = Math.max(1, Math.min(MAX_COEF, k | 0));
    if (arr[i] === k) return;
    arr[i] = k; if (!silent) changes++;
    syncVisual();
    const st = balanceStatus(rx, coefL, coefR, MOL);
    if (st.correct) return balanceDone();
    if (st.balanced && !st.lowest && !nudged.low) { nudged.low = true; ui.toast(L('rx.lowToast'), 'info'); }
    else if (changes >= 14 && !nudged.stuck) { nudged.stuck = true; ui.toast(L('rx.stuck'), 'info'); }
    render();
  }
  async function balanceDone() {
    const my = token; busy = true; render();
    engine.celebrate([...world.atoms.keys()]);
    if (!doReact) { phase = 'done'; render(); await wait(700); if (my !== token) return; busy = false; return complete(); }
    ui.toast(L('rx.balanceDone'), 'good');
    await wait(1500);
    if (my !== token) return;
    busy = false; phase = 'react'; loadBench(); render();
  }
  // ekstra støtte: sett én koeffisient til riktig verdi
  function stepHint() {
    if (busy || phase !== 'balance') return;
    const sol = solution(rx);
    const hit = coefL.findIndex((k, i) => k !== sol.left[i]);
    const side = hit >= 0 ? 'L' : 'R', i = hit >= 0 ? hit : coefR.findIndex((k, j) => k !== sol.right[j]);
    if (i < 0) return;
    hintUsed = true;
    const term = (side === 'L' ? rx.reactants : rx.products)[i], k = (side === 'L' ? sol.left : sol.right)[i];
    ui.toast(L('co.rxStepDone', { f: termFormula(term, MOL), k }), 'info');
    setCoef(side, i, k, true);
  }

  // ---------- paneler ----------
  const bottom = el('div', 'rx-bottom');
  const eqPanel = el('section', 'mv-panel rx-panel rx-eqpanel'); eqPanel.setAttribute('aria-label', t(STRINGS['rx.onlyBalance'], 'enkel'));
  const rxPanel = el('section', 'mv-panel rx-panel rx-react'); rxPanel.setAttribute('aria-label', t(STRINGS['rx.energy'], 'enkel'));
  bottom.append(eqPanel, rxPanel); root.append(bottom);
  const status = el('p', 'rx-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const net = el('p', 'rx-net'); net.setAttribute('role', 'status'); net.setAttribute('aria-live', 'polite');
  // høyden på bunnpanelene styrer toast og oppdragskortets makshøyde
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => root.style.setProperty('--rx-bottom-h', bottom.offsetHeight + 'px')).observe(bottom);

  function render() { renderEq(); renderReact(); }

  function phaseTitle() {
    if (phase === 'done') return L('rx.finished');
    if (phase === 'balance') return L(doReact ? 'rx.stepBalance' : 'rx.onlyBalance');
    return L(doBalance ? 'rx.stepReact' : 'rx.onlyReact');
  }

  function renderEq() {
    if (!rx) { eqPanel.hidden = true; return; }
    eqPanel.hidden = false;
    const focusK = document.activeElement && eqPanel.contains(document.activeElement) ? document.activeElement.dataset.k : null;
    const editing = phase === 'balance';
    const kids = [el('p', 'mv-label rx-phase', phaseTitle())];
    eqPanel.classList.toggle('is-static', !editing);
    if (!editing) {
      const sol = phase === 'idle' ? { left: coefL, right: coefR } : solution(rx);
      kids.push(equationEl(rx, sol.left, sol.right, 'rx-eq--big'));
      if (phase === 'react') kids.push(el('p', 'rx-task', L('rx.reactTask')));
      eqPanel.replaceChildren(...kids); return;
    }
    const st = balanceStatus(rx, coefL, coefR, MOL);
    const focusSym = state.support ? (st.perElement.find((e) => !e.ok) || {}).sym : null;
    const row = el('div', 'rx-eqrow');
    const termEl = (side, i, term) => {
      const k = (side === 'L' ? coefL : coefR)[i], f = termFormula(term, MOL), id = side + i;
      const box = el('div', 'rx-term');
      const step = el('div', 'rx-stepper'); step.setAttribute('role', 'group'); step.setAttribute('aria-label', L('rx.count', { f, k }));
      const minus = btn('rx-step', '−', 'k-' + id + '-m', () => setCoef(side, i, k - 1));
      const plus = btn('rx-step', '+', 'k-' + id + '-p', () => setCoef(side, i, k + 1));
      minus.setAttribute('aria-label', L('rx.less', { f })); plus.setAttribute('aria-label', L('rx.more', { f }));
      minus.disabled = busy || k <= 1; plus.disabled = busy || k >= MAX_COEF;
      const out = el('span', 'rx-k', String(k)); out.setAttribute('aria-hidden', 'true');
      step.append(minus, out, plus);
      const form = formulaEl(f, 'mv-formula rx-f');
      form.title = L('rx.indexLocked');
      form.addEventListener('click', () => ui.toast(L('rx.indexLocked'), 'info'));
      const has = focusSym && Object.prototype.hasOwnProperty.call(sideAtoms(term), focusSym);
      if (has) box.classList.add('is-focus');
      box.append(step, form); return box;
    };
    rx.reactants.forEach((term, i) => { if (i) row.append(el('span', 'rx-op', '+')); row.append(termEl('L', i, term)); });
    row.append(el('span', 'rx-op rx-arrow', '→'));
    rx.products.forEach((term, i) => { if (i) row.append(el('span', 'rx-op', '+')); row.append(termEl('R', i, term)); });

    const ledger = el('div', 'rx-ledger');
    for (const e of st.perElement) {
      const chip = el('div', 'rx-atom' + (e.ok ? ' is-ok' : ' is-off') + (e.sym === focusSym ? ' is-focus' : ''));
      chip.setAttribute('aria-label', L('rx.atomRow', { sym: e.sym, l: e.left, r: e.right }));
      chip.append(el('span', 'rx-atom-sym', e.sym), el('span', 'rx-atom-n', String(e.left)), el('span', 'rx-atom-rel', e.ok ? '=' : '≠'),
        el('span', 'rx-atom-n', String(e.right)), el('span', 'rx-atom-mark', e.ok ? '✓' : '✗'));
      chip.setAttribute('role', 'img');
      ledger.append(chip);
    }
    const okN = st.perElement.filter((e) => e.ok).length;
    let gcd = 1; if (st.balanced && !st.lowest) gcd = [...coefL, ...coefR].reduce((a, b) => { while (b) [a, b] = [b, a % b]; return a; });
    status.textContent = st.correct ? L('rx.statusOk') : st.balanced ? L('rx.statusLow', { g: gcd }) : L('rx.statusN', { n: okN, total: st.perElement.length });
    status.className = 'rx-status' + (st.correct ? ' is-ok' : st.balanced ? ' is-near' : '');
    kids.push(row, el('p', 'mv-label rx-ledger-label', L('rx.ledger')), ledger, status);
    // likningen kan allerede stemme med bare enere (f.eks. substitusjon): da bekrefter eleven selv
    if (st.correct && !busy) kids.push(btn('mv-btn mv-btn--primary rx-confirm', L('rx.confirm'), 'rx-confirm', () => { if (!busy && phase === 'balance') balanceDone(); }));

    if (state.support) {
      const steps = st.perElement.map((e) => ({
        text: L('rx.atomRow', { sym: e.sym, l: e.left, r: e.right }), done: e.ok,
        sub: L(e.left < e.right ? 'co.rxMoreLeft' : 'co.rxMoreRight', { sym: e.sym }),
      }));
      steps.push({ text: L('co.rxLowest'), sub: L('co.rxLowestSub'), done: st.correct });
      const extra = [el('p', 'mv-coach-note', L('co.rxIndex'))];
      const show = btn('mv-btn', L('co.rxStep'), 'co-step', stepHint); show.disabled = busy;
      kids.push(coachBox(steps, extra, show));
    }
    eqPanel.replaceChildren(...kids);
    if (focusK) {
      // knappen kan ha blitt deaktivert (1 eller MAX_COEF): flytt fokus til nabo-knappen
      let f = eqPanel.querySelector(`[data-k="${focusK}"]`);
      if (f && f.disabled) f = f.parentNode.querySelector('button:not([disabled])');
      f?.focus({ preventScroll: true });
    }
  }
  const sideAtoms = (term) => term.atom ? { [term.atom]: 1 } : term.custom ? term.custom.atoms : MOL[term.mol].atoms.reduce((o, s) => { o[s] = 1; return o; }, {});

  function coachBox(steps, notes, button) {
    const box = el('div', 'rx-coach'); box.setAttribute('aria-label', L('co.title'));
    const now = steps.findIndex((x) => !x.done);
    const list = el('ol', 'mv-coach-steps');
    steps.forEach((x, k) => {
      const li = el('li', 'mv-coach-step' + (x.done ? ' is-done' : k === now ? ' is-now' : ''));
      const n = el('span', 'mv-coach-n', x.done ? '✓' : String(k + 1)); n.setAttribute('aria-hidden', 'true');
      const body = el('span', 'mv-coach-t', x.text);
      if (x.count) body.append(el('span', 'mv-coach-count', x.count));
      if (x.sub && k === now) body.append(el('span', 'mv-coach-sub', x.sub));
      li.append(n, body); list.append(li);
    });
    box.append(el('p', 'mv-label', L('co.title')), list, ...notes);
    if (button) { const r = el('div', 'mv-coach-row'); r.append(button); box.append(r); }
    return box;
  }

  function renderReact() {
    const show = rx && doReact && (phase === 'react' || (phase === 'done' && startSnap));
    rxPanel.hidden = !show; if (!show) return;
    const e = energy(startSnap, world, BOND_E), ps = productStatus(world, rx, MOL);
    // fast skala: total bindingsenergi i reaktantene eller produktene
    const all = energy(startSnap, { bonds: [], atoms: world.atoms }, BOND_E).broken;
    const dEst = estimateDH(rx, MOL, BOND_E);
    const scale = Math.max(1, all, dEst == null ? 0 : all - dEst, e.broken, e.formed);
    const bar = (cls, label, value, sign) => {
      const row = el('div', 'rx-bar ' + cls);
      const track = el('span', 'rx-bar-track'); const fill = el('i'); fill.style.width = Math.min(100, (value / scale) * 100) + '%'; track.append(fill);
      row.append(el('span', 'rx-bar-name', label), el('span', 'rx-bar-val', (value ? sign : '') + num(value) + ' kJ'), track);
      return row;
    };
    net.textContent = L('rx.net') + ': ' + (e.net < 0 ? L('rx.netOut', { e: num(e.net) }) : e.net > 0 ? L('rx.netIn', { e: num(e.net) }) : L('rx.netZero'));
    net.className = 'rx-net' + (e.net < 0 ? ' is-out' : e.net > 0 ? ' is-in' : '');
    const kids = [el('p', 'mv-label', L('rx.energy')), bar('is-in', '↑ ' + L('rx.broken'), e.broken, '+'), bar('is-out', '↓ ' + L('rx.formed'), e.formed, '−'), net];
    if (!e.known) kids.push(el('p', 'rx-note', L('rx.unknownE')));
    if (ionic(rx)) kids.push(el('p', 'rx-note', L('rx.ionLive')));
    const list = el('ul', 'rx-products');
    for (const it of ps.items) {
      const ok = it.have === it.need;
      const li = el('li', ok ? 'is-ok' : it.have > it.need ? 'is-over' : '');
      li.append(el('span', 'rx-mark', ok ? '✓' : '○'), formulaEl(termFormula(it.term, MOL), 'mv-formula rx-pf'), el('span', 'rx-pcount', `${it.have}/${it.need}`));
      li.setAttribute('aria-label', `${termName(it.term)}: ${it.have} / ${it.need}`);
      list.append(li);
    }
    kids.push(el('p', 'mv-label rx-products-label', L('rx.products')), list);
    if (ps.loose) kids.push(el('p', 'rx-note', L('rx.loose', { n: countLoose() })));
    if (ps.extra && !ps.loose && e.brokenList.length) kids.push(el('p', 'rx-note', L('rx.extra', { n: ps.extra })));
    if (state.support && phase === 'react') {
      const steps = [{ text: L('co.rxBreak'), sub: L('co.rxBreakSub'), done: e.brokenList.length > 0 || ps.items.some((x) => x.have > 0) }];
      for (const it of ps.items) steps.push({ text: L('co.rxMake', { n: it.need, f: termFormula(it.term, MOL) }), sub: L('co.rxMakeSub'), count: `${Math.min(it.have, it.need)}/${it.need}`, done: it.have >= it.need });
      kids.push(coachBox(steps, [el('p', 'mv-coach-note', L('co.rxBadge'))]));
    }
    rxPanel.replaceChildren(...kids);
  }
  const countLoose = () => world.components().filter((c) => !world.isStable(c)).reduce((s, c) => s + c.length, 0);

  // ---------- energidiagram til suksesskortet ----------
  const SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, text) { const n = document.createElementNS(SVGNS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (text != null) n.textContent = text; return n; }
  function diagram(dH) {
    const exo = dH < 0, yR = exo ? 46 : 96, yP = exo ? 96 : 46;
    const svg = svgEl('svg', { class: 'rx-diagram', viewBox: '0 0 260 124', role: 'img', 'aria-label': L(exo ? 'rx.exo' : 'rx.endo') + ' ' + L('rx.dH', { dh: signed(dH) }) });
    svg.append(
      svgEl('path', { class: 'rx-d-axis', d: 'M8 8V116H252' }),
      svgEl('text', { class: 'rx-d-lbl', x: 12, y: 14 }, L('rx.diagE')),
      svgEl('path', { class: 'rx-d-curve', d: `M18 ${yR}H70C96 ${yR} 100 20 124 20S152 ${yP} 178 ${yP}H244` }),
      svgEl('path', { class: 'rx-d-level', d: `M18 ${yR}H70M178 ${yP}H244` }),
      svgEl('text', { class: 'rx-d-lbl', x: 20, y: yR + 14 }, L('rx.diagR')),
      svgEl('text', { class: 'rx-d-lbl', x: 180, y: yP + 14 }, L('rx.diagP')),
      svgEl('path', { class: 'rx-d-arrow ' + (exo ? 'is-out' : 'is-in'), d: `M232 ${yR}V${yP + (exo ? -6 : 6)}M226 ${yP + (exo ? -9 : 9)}L232 ${yP}L238 ${yP + (exo ? -9 : 9)}` }),
      svgEl('text', { class: 'rx-d-val', x: 226, y: (yR + yP) / 2 + 4, 'text-anchor': 'end' }, signed(dH) + ' kJ'),
    );
    return svg;
  }
  function successExtra(liveNet, liveKnown) {
    return () => {
      const box = el('div', 'rx-result');
      const exo = rx.dH < 0;
      const v = el('p', 'rx-verdict ' + (exo ? 'is-out' : 'is-in'));
      v.append(el('span', 'rx-verdict-mark', exo ? '↓' : '↑'), el('span', null, L(exo ? 'rx.exo' : 'rx.endo') + ' ' + L('rx.dH', { dh: signed(rx.dH) })));
      box.append(v, diagram(rx.dH));
      if (doReact && ionic(rx)) box.append(el('p', 'rx-note', L('rx.ionNote', { dh: signed(rx.dH) })));
      else if (doReact && liveKnown) box.append(el('p', 'rx-note', L('rx.yours', { net: signed(liveNet), dh: signed(rx.dH) })));
      return box;
    };
  }

  // ---------- fullføring, tester og nivåer (som i Molekylverkstedet) ----------
  const idxOf = (id) => LEVELS.findIndex((l) => l.id === id);
  const blocks = (TESTS || []).map((x, n) => ({ ...x, n: n + 1, a: idxOf(x.from), b: idxOf(x.after) }));
  const cap = () => { if (TEACHER) return LEVELS.length; const g = blocks.find((x) => !state.passed[x.id]); return g ? g.b + 1 : LEVELS.length; };
  const pendingTest = () => TEACHER ? null : blocks.find((x) => !state.passed[x.id] && state.stars[LEVELS[x.b].id]) || null;
  const testLabel = (x) => ({ enkel: fillStr(t(STRINGS['ui.testTake'], 'enkel'), { n: x.n }), fag: fillStr(t(STRINGS['ui.testTake'], 'fag'), { n: x.n }) });
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const unlockTo = (n) => { state.unlocked = Math.max(1, Math.min(LEVELS.length, cap(), n)); };
  const firstOfChapter = (i) => i === 0 || t(LEVELS[i - 1].chapter, 'fag') !== t(LEVELS[i].chapter, 'fag');
  function refreshTest() { const p = pendingTest(); ui.setTest(p ? testLabel(p) : null); }

  async function complete() {
    if (busy) return; busy = true; phase = 'done'; const my = token, lv = level, idx = current;
    const stars = 1 + (predictRight ? 1 : 0) + (hintUsed ? 0 : 1);
    state.stars[lv.id] = Math.max(state.stars[lv.id] || 0, stars);
    if (!state.made.includes(rx.id)) state.made.push(rx.id);
    unlockTo(Math.max(state.unlocked, idx + 2)); save();
    ui.setLevel(lv, progress()); refreshTest(); render();
    const e = doReact && startSnap ? energy(startSnap, world, BOND_E) : null;
    const sol = solution(rx);
    const gate = TEACHER ? null : blocks.find((x) => x.b === idx && !state.passed[x.id]);
    const choice = await ui.success({
      level: lv, stars, headline: STRINGS[doReact ? 'rx.done' : 'rx.balanceOnlyDone'], nextLabel: gate ? testLabel(gate) : null,
      molecule: { name: rx.name, formula: equationEl(rx, sol.left, sol.right, 'mv-success-formula'), fact: rx.fact },
      extra: successExtra(e ? e.net : 0, !!(e && e.known)),
    });
    if (my !== token) return;
    busy = false;
    if (choice === 'next' && gate) return runTest(gate);
    if (choice === 'next') {
      if (idx + 1 < LEVELS.length) startLevel(idx + 1);
      else ui.toast(L('ui.done'), 'good');
    }
  }

  async function runTest(x) {
    if (busy) return; const my = ++token; busy = true;
    const questions = shuffle(x.questions.slice()).slice(0, TEST_DRAW).map((q) => {
      const order = shuffle(q.options.map((_, k) => k));
      // ekstra støtte: ett feil alternativ fjernes
      if (state.support && order.length > 3) { const wrong = order.filter((k) => k !== q.correct); order.splice(order.indexOf(wrong[Math.floor(Math.random() * wrong.length)]), 1); }
      return { q: q.q, why: q.why, options: order.map((k) => q.options[k]), correct: order.indexOf(q.correct) };
    });
    const res = await ui.quiz({ title: x.title, questions, need: Math.min(TEST_PASS, questions.length), offer: state.support ? null : STRINGS['ui.testSupport'] });
    if (my !== token) return;
    busy = false;
    if (!res) return refreshTest();
    if (res.passed) {
      state.passed[x.id] = true; unlockTo(Math.max(state.unlocked, x.b + 2)); save(); refreshTest();
      if (x.b + 1 < LEVELS.length) startLevel(x.b + 1); else ui.toast(L('ui.done'), 'good');
    } else {
      if (res.support) setSupportMode(true, true);
      for (let k = x.a; k <= x.b; k++) delete state.stars[LEVELS[k].id];
      state.unlocked = x.a + 1; save(); refreshTest(); startLevel(x.a);
    }
  }

  function beginPhase() {
    nudged = {}; changes = 0; startSnap = null;
    coefL = rx.reactants.map(() => 1); coefR = rx.products.map(() => 1);
    clearBench();
    if (doBalance) { phase = 'balance'; syncVisual(); }
    else { phase = 'react'; const s = solution(rx); coefL = s.left; coefR = s.right; loadBench(); }
    render();
  }
  function resetPhase() {
    if (busy || !rx) return;
    if (phase === 'react') { loadBench(); render(); }
    else beginPhase();
  }

  async function startLevel(i, quiet) {
    const my = ++token; current = i; level = LEVELS[i]; state.level = i; save();
    rx = RX[level.goal.id];
    if (!rx) { console.error('Ukjent reaksjon i nivå', level.id, level.goal.id); return; }
    const mode = level.goal.mode || 'balance', able = canReact(rx, MOL);
    doReact = (mode === 'react' || mode === 'both') && able; doBalance = !doReact || mode === 'both';
    visual = { ok: [...rx.reactants, ...rx.products].every((x) => x.atom || (x.mol && MOL[x.mol] && !MOL[x.mol].ionic)), L: [], R: [] };
    hintUsed = false; predictRight = true; busy = true;
    ui.setLevel(level, progress());
    beginPhase();
    // «Vi starter her»: første oppdrag i hvert kapittel er prøv-og-se; senere spørsmål er gjetting uten stjernetap
    const explore = state.path !== 'teori';
    const right = quiet || (explore && firstOfChapter(i)) ? true : await ui.predict(state.support ? easier(level) : level, { guess: explore || state.support });
    if (my !== token) return;
    predictRight = explore || state.support ? true : right !== false; busy = false; render();
    if (!quiet && !state.helped) { state.helped = true; save(); ui.showHelp(); }
  }

  // ekstra støtte: tenk-først-spørsmålet får tre alternativer i stedet for fire
  function easier(lv) {
    const p = lv.predict; if (!p || p.options.length <= 3) return lv;
    const wrong = p.options.map((_, k) => k).filter((k) => k !== p.correct);
    const drop = wrong[(lv.id.charCodeAt(lv.id.length - 1) + p.options.length) % wrong.length];
    const keep = p.options.map((_, k) => k).filter((k) => k !== drop);
    return { ...lv, predict: { ...p, options: keep.map((k) => p.options[k]), correct: keep.indexOf(p.correct) } };
  }

  function setSupportMode(on, announce) {
    state.support = !!on; save(); ui.setSupport(state.support); engine.setSupport(state.support);
    if (state.support && state.lang !== 'enkel') { state.lang = 'enkel'; save(); ui.setLang('enkel'); }
    render();
    if (announce) ui.toast(L(state.support ? 'ui.supportOnToast' : 'ui.supportOffToast'), state.support ? 'good' : 'info');
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
    save(); startLevel(lastOpen());
  }
  // det nivået eleven er kommet til (første uten stjerner blant de åpne)
  function lastOpen() { const i = LEVELS.findIndex((l, k) => k < state.unlocked && !state.stars[l.id]); return i < 0 ? 0 : i; }
  function resume() {
    const p = pendingTest();
    if (p) { startLevel(p.b, true).then(() => runTest(p)); return; }
    startLevel(Number.isInteger(state.level) && state.level >= 0 && state.level < Math.min(LEVELS.length, state.unlocked) ? state.level : lastOpen());
  }

  // for testing
  window.__game = {
    world, engine, ui, state, go: startLevel, runTest, blocks, setSupportMode, setCoef, stepHint, bond: onBond, unbond: onUnbond,
    solve() { const s = solution(rx); s.left.forEach((k, i) => setCoef('L', i, k, true)); s.right.forEach((k, i) => setCoef('R', i, k, true)); },
    get phase() { return phase; }, get rx() { return rx; }, get level() { return level; },
    energy: () => startSnap && energy(startSnap, world, BOND_E), products: () => rx && productStatus(world, rx, MOL),
  };
  refreshTest(); ui.setSupport(state.support); engine.setSupport(state.support);
  ui.setLevel(LEVELS[0], progress());
  boot.classList.add('gone');
  if (!state.path) choosePath(); else resume();
}

if (window.claude?.hot?.ready) window.claude.hot.ready(start); else start(window.claude?.hot?.data ?? {});
