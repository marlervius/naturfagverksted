// Celleverkstedet – kobler celledata, logikken i sim.js, 3D-visningene og UI fra Molekylverkstedet.
// Spillflyten (stier, tenk-først, stjerner, tester, lagring) ligger i felles/flyt.js.
// Tre oppdragstyper: build (bygg cellen), transport (gjennom membranen / osmose), energy (energi i cellen).
import { startFlyt } from '../../felles/flyt.js';
import * as mdata from '../../molekyl/js/data.js';
import { createUI } from '../../molekyl/js/ui.js';
import { STRINGS as CSTRINGS } from './strings.js';
import * as sim from './sim.js';
import { organelleIcon, substanceIcon, proteinIcon, sunIcon, glyph, helpArt } from './ikoner.js';

const STRINGS = { ...mdata.STRINGS, ...CSTRINGS };
const DT = 0.05; // fast tidssteg for simuleringen

startFlyt({
  key: 'celleverkstedet.v1', epoch: 1,
  data: async () => ({ ...(await import('./data.js')), STRINGS, t: mdata.t }),
  setup,
});

async function setup(flyt) {
  const { ORG, CELLS, SUB, LEVELS, TESTS } = flyt.data;
  const CELL = Object.fromEntries(CELLS.map((c) => [c.id, c]));
  const { state, L, tx } = flyt;
  const [{ Stage }, { createCellView }, { createMembraneView, createOsmoseView }, { createEnergyView }] = await Promise.all([
    import('./scene.js'), import('./celle3d.js'), import('./membran3d.js'), import('./energi3d.js')]);
  const root = document.getElementById('ui');

  // ---------- tekst ----------
  const raw = (k) => tx(STRINGS[k]);                              // uten stor forbokstav (til innfelte ord)
  const cap = (s) => (s ? s.charAt(0).toLocaleUpperCase('nb') + s.slice(1) : s);
  const SUBN = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
  const prettyF = (f) => String(f || '').replace(/(\d+)/g, (d) => d.split('').map((x) => SUBN[x]).join('')).replace(/\+$/, '⁺').replace(/-$/, '⁻');
  const fOf = (id) => (SUB[id] && SUB[id].formula ? prettyF(SUB[id].formula) : SUB[id] ? tx(SUB[id].name) : id);
  const nameOf = (id) => (SUB[id] ? tx(SUB[id].name) : id);
  const orgName = (id) => (ORG[id] ? tx(ORG[id].name) : id);
  const cellName = (id) => (CELL[id] ? tx(CELL[id].name).replace(/\s*\(.*\)$/, '') : id);
  const num = (x, d = 0) => Number(x).toLocaleString('nb-NO', { maximumFractionDigits: d });
  const vars = (o) => { const out = { ...o }; for (const k in o) if (typeof o[k] === 'string') out[cap(k)] = cap(o[k]); return out; };
  const LV = (k, o) => L(k, vars(o || {}));
  const pName = (p, k = 'ce.p.') => {
    p = typeof p === 'string' ? sim.parseProtein(p) : p;
    return fillRaw(raw(k + p.type + (p.type === 'pumpe' ? '.' + p.dir : '')), { f: fOf(p.sub) });
  };
  const fillRaw = (s, o) => { let out = String(s); for (const k in o) out = out.split('{' + k + '}').join(o[k]); return out; };
  const joinAnd = (list) => list.length < 2 ? list.join('') : list.slice(0, -1).join(', ') + ' ' + raw('ce.and') + ' ' + list[list.length - 1];

  // ---------- små DOM-hjelpere ----------
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const btn = (cls, kids, k, onClick, label) => {
    const b = el('button', cls); b.type = 'button'; if (k) b.dataset.k = k; b.append(...[].concat(kids).filter((x) => x != null));
    if (label) b.setAttribute('aria-label', label); b.addEventListener('click', onClick); return b;
  };
  function formulaEl(f, cls = 'mv-formula') {
    const span = el('span', cls), s = String(f || '');
    for (const part of s.split(/(\d+|[+-]$)/)) {
      if (!part) continue;
      if (/^\d+$/.test(part)) span.append(el('sub', null, part)); else if (/^[+-]$/.test(part) && s.endsWith(part)) span.append(el('sup', null, part === '+' ? '+' : '−')); else span.append(part);
    }
    return span;
  }
  const subLabel = (id) => (SUB[id] && SUB[id].formula ? formulaEl(SUB[id].formula, 'mv-formula ce-f') : el('span', 'ce-f', nameOf(id)));

  // ---------- UI ----------
  const ui = createUI({
    root, data: { ...mdata, LEVELS, TESTS, STRINGS, MOLECULES: [] }, lang: state.lang,
    home: { href: '../', label: { enkel: 'Alle verksteder', fag: 'Alle verksteder' } },
    table: false, sandbox: false, collection: false, inspector: false, glyph, helpArt,
    handlers: { ...flyt.handlers, onPick() {} },
  });
  root.classList.add('ce-ui');

  const bottom = el('div', 'ce-bottom');
  const work = el('section', 'mv-panel ce-panel ce-work');
  const side = el('section', 'mv-panel ce-panel ce-side');
  bottom.append(work, side); root.append(bottom);
  const info = el('aside', 'mv-panel ce-info'); info.hidden = true; root.append(info);
  const live = el('p', 'mv-sr'); live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); root.append(live);
  let lastLive = '';
  const say = (text) => { if (text && text !== lastLive) { lastLive = text; live.textContent = text; } };

  // ---------- 3D ----------
  let hovered = null;
  const stage = new Stage(document.getElementById('stage'), {
    onPick: (id) => { if (mode === 'build' && id) showInfo(id); },
    onHover: (id) => { hovered = id; if (mode === 'build' && view && view.select) view.select(id || (infoId || null)); },
  });
  // Paneler: oppdragskortet (venstre eller topp) og bunnpanelene. Scenen flyttes til det ledige feltet.
  function fitStage() {
    const m = root.querySelector('.mv-mission')?.getBoundingClientRect(), b = bottom.getBoundingClientRect();
    const h = innerHeight, sideCard = m && m.width && m.left < 40 && m.right < innerWidth * 0.45 && m.bottom > h * 0.3;
    const top = sideCard ? 60 : m ? m.bottom : 60, bh = b.height ? h - b.top : 0;
    root.style.setProperty('--ce-bottom-h', Math.round(bh) + 'px');
    stage.setShift(sideCard ? m.right / 2 : 0, (bh - top) / 2);
  }
  addEventListener('resize', fitStage);
  if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(() => setTimeout(fitStage, 0)); ro.observe(bottom); const mm = root.querySelector('.mv-mission'); if (mm) ro.observe(mm); }

  // ---------- oppdragstilstand ----------
  let mode = null, level = null, goal = null, view = null, my = 0, played = false;
  // build
  let placed = new Set(), infoId = null;
  // transport
  let ts = null, paused = false, acc = 0, status = null, finishing = false, sinceRender = 0, warned = {}, shown = { flow: null };
  // energy
  let chosen = new Set(), light = false, eTimer = 0;

  function enterLevel(lv) {
    my++; level = lv; goal = lv.goal; mode = goal.type; played = false; finishing = false;
    placed = new Set(); infoId = null; chosen = new Set(); light = false; paused = false; acc = 0; warned = {}; shown = { flow: null };
    clearTimeout(eTimer); showInfo(null); lastLive = '';
    const lowQ = stage.lowQ;
    if (mode === 'build') view = createCellView(goal.cell, { lowQ, labelOf: (id) => cap(orgName(id)) });
    else if (mode === 'energy') {
      view = createEnergyView({ organelle: goal.organelle, light: !!goal.light, lowQ, labelOf: fOf, labels: { in: raw('ce.lblIn3d'), out: raw('ce.lblOut3d'), sun: cap(raw('ce.sun')) } });
    } else if (mode === 'transport') {
      ts = sim.createState(goal.setup);
      view = goal.setup.osmose
        ? createOsmoseView({ wall: !!goal.setup.osmose.wall, lowQ, labels: { cell: cap(raw('ce.lblCell')), solute: raw('ce.lblSolute') } })
        : createMembraneView({ subs: (goal.setup.subs || []).map((s) => ({ id: s.id, label: fOf(s.id) })), lowQ,
          labels: { out: raw('ce.lblOut'), in: raw('ce.lblIn'), protein: (p) => pName(p, 'ce.p3d.') } });
      status = sim.check(ts, goal.target);
      view.sync(ts);
    }
    stage.setView(view);
    stage.controls.autoRotate = false;
    renderAll(true);
    setTimeout(fitStage, 0); setTimeout(() => { fitStage(); stage.refit(); }, 300);
  }
  function leaveLevel() { my++; clearTimeout(eTimer); showInfo(null); }
  function reset() {
    if (mode === 'transport') { ts = sim.createState(goal.setup); status = sim.check(ts, goal.target); finishing = false; paused = false; warned = {}; view.sync(ts); ui.toast(L('ce.restartDone'), 'info'); }
    else enterLevel(level);
    renderAll(true);
  }
  function play() { played = true; renderAll(); if (mode === 'transport' && goal.observe) say(L('ce.observe')); }

  // ---------- simulering per bilde ----------
  stage.onStep = (dt) => {
    if (mode !== 'transport' || !ts) return;
    if (played && !paused && !flyt.busy && !finishing) {
      acc += dt;
      while (acc >= DT) {
        const r = sim.tick(ts, DT, SUB, goal.target); acc -= DT;
        if (view.events) view.events(r.events);
        status = r.status;
      }
      if (ts.held >= (goal.hold ?? 2)) finishTransport();
    }
    view.sync(ts);
    sinceRender += dt;
    if (sinceRender > 0.25) { sinceRender = 0; renderSide(); }
  };

  // ---------- paneler ----------
  function keepFocus(panel, fn) {
    const k = document.activeElement && panel.contains(document.activeElement) ? document.activeElement.dataset.k : null;
    fn();
    if (k) { const f = panel.querySelector(`[data-k="${CSS.escape(k)}"]`); if (f && !f.disabled) f.focus({ preventScroll: true }); }
  }
  function renderAll(full) { renderWork(); renderSide(); if (full) fitStage(); }
  const render = () => { renderAll(); if (infoId) showInfo(infoId); };

  function renderWork() {
    keepFocus(work, () => {
      if (!level) { work.replaceChildren(); return; }
      if (mode === 'build') work.replaceChildren(...buildWork());
      else if (mode === 'energy') work.replaceChildren(...energyWork());
      else if (ts && ts.osmose) work.replaceChildren(...osmoseWork());
      else work.replaceChildren(...transportWork());
    });
  }
  function renderSide() {
    if (!level) { side.hidden = true; return; }
    keepFocus(side, () => {
      const kids = mode === 'build' ? buildSide() : mode === 'energy' ? energySide() : ts && ts.osmose ? osmoseSide() : transportSide();
      side.hidden = !kids.length; side.replaceChildren(...kids);
    });
  }

  function coachBox(steps, notes = [], button = null) {
    const box = el('div', 'ce-coach'); box.setAttribute('aria-label', L('co.title'));
    const now = steps.findIndex((x) => !x.done), list = el('ol', 'mv-coach-steps');
    steps.forEach((x, k) => {
      const li = el('li', 'mv-coach-step' + (x.done ? ' is-done' : k === now ? ' is-now' : ''));
      const n = el('span', 'mv-coach-n', x.done ? '✓' : String(k + 1)); n.setAttribute('aria-hidden', 'true');
      const body = el('span', 'mv-coach-t', x.text); if (x.sub && k === now) body.append(el('span', 'mv-coach-sub', x.sub));
      li.append(n, body); list.append(li);
    });
    box.append(el('p', 'mv-label', L('co.title')), list, ...notes);
    if (button) { const r = el('div', 'mv-coach-row'); r.append(button); box.append(r); }
    return box;
  }

  // =====================================================================
  // 1. BUILD
  // =====================================================================
  function buildWork() {
    const st = sim.buildStatus(placed, goal);
    const head = el('div', 'ce-row ce-head');
    const prog = el('p', 'ce-progress'); prog.append(el('b', null, String(st.have)), ' / ' + st.need + ' ');
    prog.setAttribute('aria-label', L('ce.parts', { have: st.have, need: st.need }));
    const dots = el('span', 'ce-dots'); dots.setAttribute('aria-hidden', 'true'); for (let i = 0; i < st.need; i++) dots.append(el('i', i < st.have ? 'is-on' : ''));
    head.append(el('p', 'mv-label', L('ce.tray')), prog, dots);
    const tray = el('div', 'ce-tray'); tray.setAttribute('role', 'group'); tray.setAttribute('aria-label', L('ce.tray'));
    for (const id of goal.tray) {
      const on = placed.has(id);
      const b = btn('ce-item' + (on ? ' is-on' : ''), [organelleIcon(id), el('span', 'ce-item-name', cap(orgName(id))), on ? el('span', 'ce-item-state', '✓ ' + raw('ce.isPlaced')) : null], 'org-' + id, (e) => tryPlace(id, e.currentTarget));
      b.setAttribute('aria-label', cap(orgName(id)) + (on ? ', ' + raw('ce.isPlaced') : ''));
      tray.append(b);
    }
    return [head, tray];
  }
  function buildSide() {
    if (!state.support) return [];
    const steps = goal.parts.map((id) => ({ text: L('co.buildFind', { name: orgName(id) }), sub: tx(ORG[id]?.job), done: placed.has(id) }));
    const show = btn('mv-btn', L('co.buildShow'), 'co-build', () => { const id = goal.parts.find((x) => !placed.has(x)); if (id && !flyt.busy) { flyt.useHint(); tryPlace(id, null, true); } });
    show.disabled = flyt.busy || !played;
    return [coachBox(steps, [el('p', 'mv-coach-note', L('co.buildNote'))], show)];
  }
  // startpunkt for flyturen: under knappen eleven trykket på, foran kameraet
  function launchPoint(button) {
    const r = button ? button.getBoundingClientRect() : { left: innerWidth / 2, width: 0 };
    const cv = stage.renderer.domElement.getBoundingClientRect();
    const x = ((r.left + r.width / 2 - cv.left) / cv.width) * 2 - 1;
    const v = stage.camera.position.clone(), dir = stage.controls.target.clone().sub(v).normalize();
    const p = v.clone().addScaledVector(dir, 3).project(stage.camera); p.x = x; p.y = -0.85;
    return p.unproject(stage.camera);
  }
  function tryPlace(id, button, auto) {
    if (flyt.busy || mode !== 'build') return;
    const res = sim.canPlace(id, placed, goal, ORG);
    if (!res.ok) {
      const cell = cellName(goal.cell), name = orgName(id);
      if (res.reason === 'already') { showInfo(id); return ui.toast(LV('ce.already', { name }), 'info'); }
      if (res.reason === 'notNeeded') return ui.toast(LV('ce.notNeeded', { name, cell }), 'warn');
      const where = joinAnd((ORG[id]?.in || []).map(cellName));
      return ui.toast(LV('ce.wrongCell', { name, cell, where }), 'warn');
    }
    placed.add(id); view.place(id, launchPoint(button));
    ui.toast(LV(auto ? 'co.buildShowed' : 'ce.placed', { name: orgName(id), job: tx(ORG[id]?.job) }), 'good');
    if (innerWidth > 760) showInfo(id); // på mobil holder toasten; infoboksen åpnes ved trykk
    renderAll();
    if (sim.buildStatus(placed, goal).done) finishBuild();
  }
  async function finishBuild() {
    const mine = my; flyt.busy = true;
    stage.controls.autoRotate = !flyt.reduced(); say(L('ce.buildDone'));
    await flyt.wait(1500); if (mine !== my) return;
    stage.controls.autoRotate = false; flyt.busy = false;
    flyt.complete({
      headline: STRINGS['ce.buildDone'],
      molecule: { name: CELL[goal.cell]?.name || goal.cell, formula: el('span', 'ce-success-sub', L('ce.parts', { have: goal.parts.length, need: goal.parts.length })), fact: CELL[goal.cell]?.about },
      extra: () => { const box = el('div', 'ce-result'); box.append(el('p', 'mv-label', L('ce.summaryParts'))); const ul = el('ul', 'ce-chips'); goal.parts.forEach((id) => { const li = el('li'); li.append(organelleIcon(id), cap(orgName(id))); ul.append(li); }); box.append(ul); return box; },
    });
  }
  function showInfo(id) {
    infoId = id && ORG[id] ? id : null;
    if (mode === 'build' && view && view.select) view.select(hovered || infoId);
    if (!infoId) { info.hidden = true; info.replaceChildren(); return; }
    const o = ORG[infoId];
    const head = el('div', 'ce-info-head');
    head.append(organelleIcon(infoId), el('h2', 'ce-info-name', cap(tx(o.name))),
      btn('mv-btn mv-btn--icon mv-close', '✕', 'info-x', () => showInfo(null), L('ce.close')));
    info.replaceChildren(head, el('p', 'mv-label', L('ce.infoJob')), el('p', 'ce-info-text', tx(o.job)), el('p', 'mv-label', L('ce.infoFact')), el('p', 'ce-info-text ce-info-fact', tx(o.fact)));
    info.hidden = false;
  }

  // =====================================================================
  // 2. TRANSPORT
  // =====================================================================
  const countOf = (p) => ts.proteins.filter((x) => x.type === p.type && x.sub === p.sub && x.dir === p.dir).length;
  const vis = (id) => { const s = ts.subs[id]; const vin = Math.floor(s.in + 1e-6); return { in: vin, out: Math.max(0, Math.round(s.in + s.out) - vin) }; };
  function transportWork() {
    const kids = [];
    const tools = goal.setup.tools || [];
    const head = el('div', 'ce-row ce-head'); head.append(el('p', 'mv-label', L('ce.tools')));
    const pause = btn('mv-btn mv-btn--ghost ce-pause', paused ? '▶ ' + L('ce.play') : '❚❚ ' + L('ce.pause'), 'pause', () => { paused = !paused; say(paused ? L('ce.paused') : ''); renderWork(); });
    pause.setAttribute('aria-pressed', String(paused)); head.append(pause); kids.push(head);
    if (!tools.length) kids.push(el('p', 'ce-note', L(goal.observe ? 'ce.observe' : 'ce.noTools')));
    const list = el('div', 'ce-tools');
    for (const str of tools) {
      const p = sim.parseProtein(str), n = countOf(p), name = pName(p);
      const row = el('div', 'ce-tool'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', cap(name) + ': ' + n);
      const minus = btn('ce-step', '−', 'rm-' + str, () => changeProtein(str, -1), cap(fillRaw(raw('ce.remove'), { p: name })));
      const plus = btn('ce-step', '+', 'add-' + str, () => changeProtein(str, 1), cap(fillRaw(raw('ce.add'), { p: name })));
      minus.disabled = !n || flyt.busy; plus.disabled = n >= 4 || flyt.busy;
      const lab = el('span', 'ce-tool-name'); lab.append(proteinIcon(p), el('span', null, cap(name)));
      const cnt = el('span', 'ce-tool-n', n + '/4'); cnt.setAttribute('aria-hidden', 'true');
      row.append(lab, minus, cnt, plus); list.append(row);
    }
    // proteiner som står fra start, men som eleven ikke styrer
    const fixed = (goal.setup.proteins || []).filter((s) => !tools.includes(s));
    for (const str of [...new Set(fixed)]) {
      const p = sim.parseProtein(str), row = el('div', 'ce-tool is-fixed');
      const lab = el('span', 'ce-tool-name'); lab.append(proteinIcon(p), el('span', null, cap(pName(p))));
      row.append(lab, el('span', 'ce-tool-n', '× ' + countOf(p))); list.append(row);
    }
    if (list.children.length) kids.push(list);
    return kids;
  }
  function changeProtein(str, d) {
    if (flyt.busy || !ts) return;
    const name = pName(str);
    if (d > 0) { if (!sim.addProtein(ts, str)) return ui.toast(L('ce.max'), 'warn'); ui.toast(cap(fillRaw(raw('ce.addedP'), { p: name })), 'info'); }
    else if (sim.removeProtein(ts, str)) ui.toast(cap(fillRaw(raw('ce.removedP'), { p: name })), 'info');
    view.sync(ts); renderAll();
  }
  function goalText(c) {
    if (c.sub) return L(c.op === '<=' ? 'ce.g.max' : 'ce.g.min', { n: num(c.n, 1), f: fOf(c.sub), side: raw(c.side === 'out' ? 'ce.sideOut' : 'ce.sideIn') });
    if (c.equal) return L('ce.g.equal', { f: fOf(c.equal) });
    if (c.shape) return L('ce.g.shape', { shape: raw('ce.shape.' + c.shape) });
    if (c.atpMin != null) return L('ce.g.atp', { n: num(c.atpMin, 1) });
    if (c.noProtein) return L('ce.g.noProtein', { p: raw('ce.g.noProtein.' + c.noProtein) });
    return '';
  }
  function goalList() {
    const ul = el('ul', 'ce-goals'); ul.setAttribute('aria-label', L('ce.goals'));
    for (const it of (status || sim.check(ts, goal.target)).items) {
      const li = el('li', it.ok ? 'is-ok' : ''); li.append(el('span', 'ce-mark', it.ok ? '✓' : '○'), el('span', null, goalText(it.cond)));
      li.setAttribute('aria-label', goalText(it.cond) + ': ' + (it.ok ? '✓' : '–')); ul.append(li);
    }
    const wrap = el('div', 'ce-goalbox'); wrap.append(el('p', 'mv-label', L('ce.goals')), ul);
    const held = ts.held, hold = goal.hold ?? 2;
    if (held > 0 && !finishing) {
      const bar = el('div', 'ce-hold'); const i = el('i'); i.style.width = Math.min(100, (held / hold) * 100) + '%'; bar.append(i);
      wrap.append(el('p', 'ce-note is-good', L('ce.hold')), bar);
      say(L('ce.hold'));
    }
    return wrap;
  }
  const hasAtp = () => goal.setup.atp != null || (goal.setup.inside && goal.setup.inside.make && goal.setup.inside.make.atp) || (goal.setup.tools || []).concat(goal.setup.proteins || []).some((s) => s.startsWith('pumpe'));
  function transportSide() {
    const kids = [el('p', 'mv-label', L('ce.amounts'))];
    const ids = Object.keys(ts.subs), max = Math.max(4, ...ids.map((id) => ts.subs[id].in + ts.subs[id].out));
    const table = el('div', 'ce-amounts');
    for (const id of ids) {
      const v = vis(id), row = el('div', 'ce-amt');
      const nm = el('span', 'ce-amt-name'); nm.append(substanceIcon(id), subLabel(id));
      const cell = (side, n) => { const c = el('span', 'ce-amt-cell is-' + side); const tr = el('span', 'ce-bar'); const i = el('i'); i.style.width = Math.min(100, (n / max) * 100) + '%'; tr.append(i); c.append(el('span', 'ce-amt-k', L(side === 'out' ? 'ce.out' : 'ce.in')), el('b', null, String(n)), tr); return c; };
      row.append(nm, cell('out', v.out), cell('in', v.in));
      row.setAttribute('aria-label', `${nameOf(id)}: ${L('ce.out')} ${v.out}, ${L('ce.in')} ${v.in}`); row.setAttribute('role', 'img');
      table.append(row);
    }
    kids.push(table);
    if (hasAtp()) {
      const row = el('div', 'ce-amt ce-amt--atp'), n = Math.floor(ts.atp + 1e-6);
      const nm = el('span', 'ce-amt-name'); nm.append(substanceIcon('atp'), el('span', 'ce-f', L('ce.atp')));
      const c = el('span', 'ce-amt-cell'); const tr = el('span', 'ce-bar is-atp'); const i = el('i'); i.style.width = Math.min(100, (ts.atp / 20) * 100) + '%'; tr.append(i); c.append(el('b', null, String(n)), tr);
      row.append(nm, c); row.setAttribute('role', 'img'); row.setAttribute('aria-label', 'ATP: ' + n); kids.push(row);
    }
    // forklaringer
    for (const id of ids) {
      const pass = SUB[id]?.pass;
      if (pass === 'aldri') kids.push(el('p', 'ce-note', LV('ce.never', { name: nameOf(id) })));
      if (pass === 'protein' && !ts.proteins.some((p) => p.sub === id)) kids.push(el('p', 'ce-note', LV('ce.needProtein', { name: nameOf(id) })));
    }
    if (ts.proteins.some((p) => p.type === 'pumpe') && ts.atp <= 1e-6) { kids.push(el('p', 'ce-note is-warn', L('ce.noAtp'))); if (!warned.atp) { warned.atp = true; say(L('ce.noAtp')); } }
    if (goal.setup.inside) kids.push(el('p', 'ce-note', L('ce.inside')));
    kids.push(goalList());
    if (paused) kids.push(el('p', 'ce-note', L('ce.paused')));
    if (state.support) kids.push(transportCoach());
    return kids;
  }
  function transportCoach() {
    const items = (status || sim.check(ts, goal.target)).items, steps = [];
    const sol = goal.solution || {};
    if (goal.observe) steps.push({ text: L('co.tWait'), done: items.every((x) => x.ok) });
    for (const str of [...new Set(sol.proteins || [])]) {
      const need = sol.proteins.filter((x) => x === str).length, p = sim.parseProtein(str);
      steps.push({ text: L('co.tAdd', { p: (need > 1 ? need + ' × ' : '') + pName(p) }), done: countOf(p) >= need });
    }
    if (sol.outside != null && ts.osmose) {
      const o = ts.osmose.outside, where = Math.abs(o - sol.outside) < 0.15 ? raw('ce.equalMark') : o > sol.outside ? raw('ce.fresh') : raw('ce.salt');
      steps.push({ text: L('co.tSlider', { where }), done: Math.abs(o - sol.outside) < 0.15 || items.every((x) => x.ok) });
    }
    items.forEach((it) => steps.push({ text: L('co.tGoal', { g: goalText(it.cond).replace(/^./, (c) => c.toLocaleLowerCase('nb')) }), done: it.ok }));
    steps.push({ text: L('co.tHold'), done: false });
    const show = goal.observe ? null : btn('mv-btn', L('ce.showHow'), 'co-show', showHow);
    if (show) show.disabled = flyt.busy || !played;
    return coachBox(steps, [], show);
  }
  // «Vis meg hvordan»: start på nytt og bruk løsningen fra data – ett steg om gangen, så eleven ser hva som skjer
  async function showHow() {
    if (flyt.busy || !ts) return;
    flyt.useHint(); const mine = my; const sol = goal.solution || {};
    ts = sim.createState(goal.setup); status = sim.check(ts, goal.target); view.sync(ts); renderAll();
    for (const str of sol.proteins || []) {
      if (countOf(sim.parseProtein(str)) >= (sol.proteins.filter((x) => x === str).length)) continue;
      await flyt.wait(500); if (mine !== my) return;
      sim.addProtein(ts, str); view.sync(ts); ui.toast(cap(fillRaw(raw('ce.showed'), { p: pName(str) })), 'info'); renderAll();
    }
    if (sol.outside != null && ts.osmose) { await flyt.wait(400); if (mine !== my) return; ts.osmose.outside = sol.outside; ui.toast(L('ce.showedOut', { v: num(sol.outside, 2) }), 'info'); renderAll(); }
  }
  async function finishTransport() {
    if (finishing) return; finishing = true; const mine = my;
    say(L('ce.okTransport')); renderSide();
    await flyt.wait(700); if (mine !== my) return;
    const end = { subs: JSON.parse(JSON.stringify(ts.subs)), atp: ts.atp, shape: ts.osmose ? sim.osmoseShape(ts) : null };
    flyt.complete({
      headline: STRINGS['ce.okTransport'],
      molecule: { name: level.title },
      extra: () => {
        const box = el('div', 'ce-result'); box.append(el('p', 'mv-label', L('ce.summaryEnd')));
        const ul = el('ul', 'ce-chips');
        for (const id in end.subs) { const li = el('li'); const v = { in: Math.floor(end.subs[id].in + 1e-6) }; v.out = Math.max(0, Math.round(end.subs[id].in + end.subs[id].out) - v.in); li.append(substanceIcon(id), subLabel(id), ` ${raw('ce.sideOut')} ${v.out} · ${raw('ce.sideIn')} ${v.in}`); ul.append(li); }
        if (hasAtp()) { const li = el('li'); li.append(substanceIcon('atp'), 'ATP ' + Math.floor(end.atp + 1e-6)); ul.append(li); }
        if (end.shape) { const li = el('li'); li.append(LV('ce.shapeNow', { shape: raw('ce.shape.' + end.shape) })); ul.append(li); }
        box.append(ul); return box;
      },
    });
  }

  // ---------- osmose ----------
  function osmoseWork() {
    const o = goal.setup.osmose, kids = [];
    const head = el('div', 'ce-row ce-head'); head.append(el('p', 'mv-label', L('ce.slider')));
    const pause = btn('mv-btn mv-btn--ghost ce-pause', paused ? '▶ ' + L('ce.play') : '❚❚ ' + L('ce.pause'), 'pause', () => { paused = !paused; renderWork(); });
    pause.setAttribute('aria-pressed', String(paused)); head.append(pause); kids.push(head);
    if (!o.slider) { kids.push(el('p', 'ce-note', L('ce.observe'))); kids.push(el('p', 'ce-note', L('ce.outsideVal', { v: num(ts.osmose.outside, 2) }) + ' · ' + L('ce.insideVal', { v: num(ts.osmose.solute, 2) }))); return kids; }
    const MIN = 0.4, MAX = 2.5, pct = (v) => ((v - MIN) / (MAX - MIN)) * 100;
    const wrap = el('div', 'ce-slider');
    const input = el('input'); input.type = 'range'; input.min = MIN; input.max = MAX; input.step = 0.05; input.value = ts.osmose.outside; input.dataset.k = 'slider';
    input.id = 'ce-slider'; input.setAttribute('aria-label', L('ce.slider'));
    const valText = () => L('ce.outsideVal', { v: num(ts.osmose.outside, 2) }) + ', ' + L('ce.insideVal', { v: num(ts.osmose.solute, 2) });
    input.setAttribute('aria-valuetext', valText());
    const out = el('output', 'ce-slider-val', valText()); out.setAttribute('for', 'ce-slider');
    input.addEventListener('input', () => { if (!ts || flyt.busy) return; ts.osmose.outside = Number(input.value); out.textContent = valText(); input.setAttribute('aria-valuetext', valText()); renderSide(); });
    const ends = el('div', 'ce-slider-ends'); ends.append(el('span', null, '◂ ' + L('ce.fresh')), el('span', null, L('ce.salt') + ' ▸'));
    const mark = el('span', 'ce-slider-mark'); mark.style.left = pct(o.solute) + '%'; mark.append(el('i'), el('span', null, L('ce.equalMark') + ' (' + num(o.solute, 2) + ')'));
    const track = el('div', 'ce-slider-track'); track.append(input, mark);
    wrap.append(track, ends, out); kids.push(wrap);
    return kids;
  }
  function osmoseSide() {
    const shape = sim.osmoseShape(ts), o = ts.osmose, flux = o.solute / ts.volume - o.outside;
    const kids = [el('p', 'mv-label', L('ce.size'))];
    const bar = el('div', 'ce-vol'); const i = el('i'); i.style.width = Math.min(100, (ts.volume / sim.VOLUME.burst) * 100) + '%'; bar.append(i);
    const normal = el('span', 'ce-vol-mark'); normal.style.left = (1 / sim.VOLUME.burst) * 100 + '%'; bar.append(normal);
    bar.setAttribute('role', 'img'); bar.setAttribute('aria-label', L('ce.size') + ': ' + num(ts.volume, 2));
    kids.push(bar, el('p', 'ce-shape', LV('ce.shapeNow', { shape: raw('ce.shape.' + shape) })));
    let flow;
    if (ts.burst) flow = L('ce.burst');
    else if (o.wall && shape === 'stram') flow = L('ce.flowWall');
    else flow = Math.abs(flux) < 0.04 ? L('ce.flowEven') : flux > 0 ? L('ce.flowIn') : L('ce.flowOut');
    const fl = el('p', 'ce-note' + (ts.burst ? ' is-warn' : ''), flow);
    kids.push(fl); if (flow !== shown.flow) { shown.flow = flow; say(flow); }
    if (ts.burst) kids.push(btn('mv-btn mv-btn--primary ce-retry', L('ce.tryAgain'), 'retry', () => reset()));
    if (ts.burst && !warned.burst) { warned.burst = true; ui.toast(L('ce.burst'), 'warn'); }
    kids.push(goalList());
    if (state.support) kids.push(transportCoach());
    return kids;
  }

  // =====================================================================
  // 3. ENERGY
  // =====================================================================
  const procName = () => raw('ce.proc.' + goal.organelle);
  const orgShort = () => raw('ce.orgName.' + goal.organelle);
  function energyWork() {
    const head = el('div', 'ce-row ce-head'); head.append(el('p', 'mv-label', L('ce.substances')));
    const tray = el('div', 'ce-tray ce-tray--subs'); tray.setAttribute('role', 'group'); tray.setAttribute('aria-label', L('ce.substances'));
    for (const id of goal.tray) {
      const on = chosen.has(id);
      const nm = el('span', 'ce-item-name'); nm.append(subLabel(id), el('span', 'ce-item-sub', nameOf(id)));
      const b = btn('ce-item' + (on ? ' is-on' : ''), [substanceIcon(id), nm, on ? el('span', 'ce-item-state', '✓ ' + raw('ce.isIn')) : null], 'sub-' + id, () => toggleSub(id));
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', cap(fillRaw(raw(on ? 'ce.takeOut' : 'ce.send'), { name: nameOf(id) })));
      tray.append(b);
    }
    const kids = [head, tray];
    if (goal.light) {
      const sun = btn('ce-item ce-sun' + (light ? ' is-on' : ''), [sunIcon(), el('span', 'ce-item-name', L(light ? 'ce.sunOn' : 'ce.sunOff'))], 'sun', () => toggleLight());
      sun.setAttribute('aria-pressed', String(light)); sun.setAttribute('aria-label', L('ce.sun'));
      tray.append(sun);
    }
    return kids;
  }
  function toggleSub(id) {
    if (flyt.busy || mode !== 'energy') return;
    if (chosen.has(id)) chosen.delete(id); else chosen.add(id);
    evaluateEnergy(true);
  }
  function toggleLight() { if (flyt.busy || mode !== 'energy') return; light = !light; ui.toast(L(light ? 'ce.lightOn' : 'ce.lightOff'), 'info'); evaluateEnergy(true); }
  let eMsg = { text: '', kind: 'info' };
  function evaluateEnergy(fromUser) {
    const st = sim.energyStatus(chosen, goal, light);
    view.setChosen([...chosen]); view.setLight(light);
    const proc = procName(), org = orgShort();
    if (st.done) {
      view.setRunning(true, goal.inputs, goal.outputs); view.setStopped(false);
      eMsg = { text: LV('ce.running', { org }), kind: 'good' }; say(eMsg.text);
      finishEnergy();
    } else {
      view.setRunning(false);
      if (st.wrong.length) {
        const w = st.wrong[0];
        eMsg = { text: LV(goal.outputs.includes(w) ? 'ce.wrongOut' : 'ce.wrongNo', { name: nameOf(w), proc }), kind: 'warn' };
        view.setStopped(true); if (fromUser) ui.toast(eMsg.text, 'warn');
      } else {
        view.setStopped(false);
        if (!st.missing.length && !st.lightOk) eMsg = { text: LV('ce.needLight', { proc }), kind: 'info' };
        else eMsg = { text: chosen.size ? LV('ce.missing', { org }) : LV('ce.waiting', { org }), kind: 'info' };
      }
      say(eMsg.text);
    }
    renderAll();
  }
  function equationEl() {
    const COEF = { o2: 6, co2: 6, h2o: 6 };
    const box = el('span', 'mv-formula ce-eq');
    const term = (id) => { const s = el('span', 'ce-eq-t'); if (COEF[id]) s.append(el('span', 'ce-eq-k', COEF[id] + ' ')); s.append(subLabel(id)); return s; };
    const side = (ids, extra) => { ids.forEach((id, i) => { if (i) box.append(el('span', 'ce-eq-op', ' + ')); box.append(term(id)); }); if (extra) { box.append(el('span', 'ce-eq-op', ' + ')); box.append(el('span', 'ce-eq-word' + (extra.energy ? ' is-energy' : ''), extra.text)); } };
    const isMito = goal.organelle === 'mitokondrie';
    side(goal.inputs, goal.light ? { text: raw('ce.lightWord') } : null);
    box.append(el('span', 'ce-eq-op', ' → '));
    side(goal.outputs.filter((x) => x !== 'atp'), isMito || goal.outputs.includes('atp') ? { text: raw('ce.energyWord'), energy: true } : null);
    return box;
  }
  function energySide() {
    const st = sim.energyStatus(chosen, goal, light);
    const kids = [el('p', 'ce-msg is-' + eMsg.kind, eMsg.text || LV('ce.waiting', { org: orgShort() }))];
    if (st.done) kids.push(el('p', 'mv-label', L('ce.equation')), equationEl());
    if (state.support) {
      const steps = goal.inputs.map((id) => ({ text: L('co.eSend', { name: nameOf(id) }), done: chosen.has(id) }));
      st.wrong.forEach((id) => steps.unshift({ text: L('co.eRemove', { name: nameOf(id) }), done: false }));
      if (goal.light) steps.push({ text: L('co.eLight'), done: light });
      const show = btn('mv-btn', L('co.eShow'), 'co-e', () => {
        if (flyt.busy) return; flyt.useHint();
        if (st.wrong.length) chosen.delete(st.wrong[0]);
        else if (st.missing.length) chosen.add(st.missing[0]);
        else if (!st.lightOk) light = true;
        ui.toast(L('co.eShowed'), 'info'); evaluateEnergy(false);
      });
      show.disabled = flyt.busy || !played;
      kids.push(coachBox(steps, [], show));
    }
    return kids;
  }
  async function finishEnergy() {
    const mine = my; flyt.busy = true; renderWork();
    await flyt.wait(2800); if (mine !== my) return;
    flyt.busy = false;
    flyt.complete({
      headline: { enkel: fillRaw(t2('ce.okEnergy', 'enkel'), { org: cap(raw('ce.orgName.' + goal.organelle)) }), fag: fillRaw(t2('ce.okEnergy', 'fag'), { org: cap(raw('ce.orgName.' + goal.organelle)) }) },
      molecule: { name: cap(procName()), formula: equationEl() },
      extra: () => { const box = el('div', 'ce-result'); if (goal.outputs.includes('atp')) { const p = el('p', 'ce-note'); p.prepend(substanceIcon('atp')); p.append(L('ce.atpNote')); box.append(p); } return box; },
    });
  }
  const t2 = (k, lang) => mdata.t(STRINGS[k], lang);

  // ---------- testkroker ----------
  window.__game = {
    flyt, stage, ui, state, sim,
    get mode() { return mode; }, get ts() { return ts; }, get level() { return level; }, get placed() { return placed; }, get chosen() { return chosen; },
    place: (id) => tryPlace(id, null), toggle: toggleSub, light: toggleLight, protein: changeProtein, showHow,
    setOutside(v) { if (ts && ts.osmose) { ts.osmose.outside = v; renderAll(); } },
    /** Driv bildene manuelt (når fanen er skjult og requestAnimationFrame står stille). */
    frames(n = 60, dt = 1 / 30) { for (let i = 0; i < n; i++) stage.step(dt); },
  };

  return { ui, enterLevel, leaveLevel, reset, render, play, onSupport() { renderAll(); } };
}
