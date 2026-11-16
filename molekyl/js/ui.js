// Molekylverkstedet – DOM-overlegg (UI).
// Kontrakt: se ARCHITECTURE.md, «js/ui.js – kontrakt». Ingen import, ingen lagring, ingen kall til engine.
// Alle klasser er prefikset `mv-` slik at main.js ikke trenger å kjenne noen av dem.

const SVGNS = 'http://www.w3.org/2000/svg';

// Reservetekster for de få etikettene kontrakten ikke har nøkler for.
// Hvis data.STRINGS får disse nøklene, brukes de i stedet.
const FALLBACK = {
  'ui.table':          { enkel: 'Periodesystemet', fag: 'Periodesystemet' },
  'ui.showTable':      { enkel: 'Vis tabellen', fag: 'Vis periodesystemet' },
  'ui.hideTable':      { enkel: 'Skjul tabellen', fag: 'Skjul periodesystemet' },
  'ui.language':       { enkel: 'Språk', fag: 'Språk' },
  'ui.locked':         { enkel: 'Låst', fag: 'Låst' },
  'ui.learned':        { enkel: 'Dette lærte du', fag: 'Dette lærte du' },
  'ui.collectionEmpty':{ enkel: 'Du har ikke laget noe stoff ennå.', fag: 'Samlingen er tom ennå.' },
};

// ---------- små hjelpere ----------

function h(tag, props, ...kids) {
  const n = document.createElement(tag);
  setProps(n, props);
  append(n, kids);
  return n;
}
function s(tag, props, ...kids) {
  const n = document.createElementNS(SVGNS, tag);
  setProps(n, props);
  append(n, kids);
  return n;
}
function setProps(n, props) {
  if (!props) return;
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.setAttribute('class', v);
    else if (k === 'text') n.textContent = v;
    else if (k === 'style') n.style.cssText = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : String(v));
  }
}
function append(n, kids) {
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    n.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
}
const fmt = (str, vars) => String(str).replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars ? vars[k] : m));
const cap = (str) => (str ? str.charAt(0).toLocaleUpperCase('nb') + str.slice(1) : str);
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
function chargeSup(c) {
  if (!c) return '';
  const a = Math.abs(c);
  return (a > 1 ? String(a).split('').map((d) => SUP[+d]).join('') : '') + (c > 0 ? '⁺' : '⁻');
}
const signed = (c) => (c > 0 ? '+' + c : '−' + Math.abs(c));
const numNO = (x, dec) => (x == null ? '–' : Number(x).toLocaleString('nb-NO', { minimumFractionDigits: dec, maximumFractionDigits: dec }));

function formulaNode(f, cls = 'mv-formula') {
  const span = h('span', { class: cls });
  for (const part of String(f || '').split(/(\d+)/)) {
    if (!part) continue;
    if (/^\d+$/.test(part)) span.append(h('sub', { text: part }));
    else span.append(part);
  }
  return span;
}

// Ikoner: enkle strek-ikoner, 24×24.
const ICON = {
  hint: 'M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.7 10.7c.7.6 1.2 1.4 1.2 2.3h5c0-.9.5-1.7 1.2-2.3A6 6 0 0 0 12 3z',
  reset: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.8h3.8',
  levels: 'M5 6h14M5 12h14M5 18h9',
  help: 'M9.2 9.3a2.9 2.9 0 1 1 4 2.6c-.7.3-1.2 1-1.2 1.8v.6M12 17.3v.2',
  close: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  check: 'M5 12.5l4.3 4.3L19 7.2',
  cross: 'M7 7l10 10M17 7L7 17',
  chevUp: 'M6.5 14.5L12 9l5.5 5.5',
  chevDown: 'M6.5 9.5L12 15l5.5-5.5',
  arrow: 'M5 12h13M13 6.5l5.5 5.5-5.5 5.5',
  home: 'M4 11.5L12 5l8 6.5M6.5 9.8V19h11V9.8',
};
function icon(name, cls = 'mv-ico') {
  const svg = s('svg', { class: cls, viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' });
  if (name === 'help') svg.append(s('circle', { cx: 12, cy: 12, r: 9 }));
  if (name === 'lock') {
    svg.append(s('rect', { x: 5.5, y: 10.5, width: 13, height: 9.5, rx: 2 }), s('path', { d: 'M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5' }));
    return svg;
  }
  if (name === 'support') {
    svg.append(s('circle', { cx: 12, cy: 12, r: 8.5 }), s('circle', { cx: 12, cy: 12, r: 3.6 }),
      s('path', { d: 'M5.99 5.99l3.46 3.46M14.55 14.55l3.46 3.46M18.01 5.99l-3.46 3.46M9.45 14.55l-3.46 3.46' }));
    return svg;
  }
  if (name === 'molecule') {
    svg.append(
      s('path', { d: 'M8 8.5l7.5 1.8M8.6 9.6l2.2 6.2M16.2 11.4l-4.4 5' }),
      s('circle', { cx: 7, cy: 7.5, r: 2.6 }), s('circle', { cx: 17.5, cy: 10.6, r: 2.6 }), s('circle', { cx: 11, cy: 17.6, r: 2.6 }),
    );
    return svg;
  }
  svg.append(s('path', { d: ICON[name] }));
  return svg;
}
function starSvg(filled, cls) {
  return s('svg', { class: cls + (filled ? ' is-on' : ''), viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    s('path', { d: 'M12 2.8l2.83 5.74 6.33.92-4.58 4.47 1.08 6.3L12 17.25l-5.66 2.98 1.08-6.3L2.84 9.46l6.33-.92z' }));
}
function starsNode(n, cls = 'mv-stars', label) {
  const k = Math.max(0, Math.min(3, n | 0));
  return h('span', { class: cls, role: 'img', 'aria-label': (label ? label + ': ' : '') + k + ' / 3' },
    [0, 1, 2].map((i) => starSvg(i < k, 'mv-star')));
}
// Liten atom-glyf til merkevaren: kjerne, bane og ett elektron (elektronet er gult).
function brandGlyph() {
  return s('svg', { class: 'mv-glyph', viewBox: '0 0 32 32', 'aria-hidden': 'true' },
    s('ellipse', { cx: 16, cy: 16, rx: 13, ry: 5.5, transform: 'rotate(-28 16 16)', class: 'mv-glyph-orbit' }),
    s('ellipse', { cx: 16, cy: 16, rx: 13, ry: 5.5, transform: 'rotate(28 16 16)', class: 'mv-glyph-orbit' }),
    s('circle', { cx: 16, cy: 16, r: 3.2, class: 'mv-glyph-core' }),
    s('circle', { cx: 27.2, cy: 10, r: 2.1, class: 'mv-glyph-e' }));
}

// Lewis-plassering: de fire første elektronene sitter alene (topp, høyre, bunn, venstre), resten parer seg.
function lewisSides(n) {
  const c = [0, 0, 0, 0];
  for (let i = 0; i < n; i++) c[i % 4]++;
  return c;
}
function lewisPoints(n, cx, cy, dx, dy, spread) {
  const sides = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const counts = lewisSides(n);
  const pts = [];
  sides.forEach(([sx, sy], i) => {
    const bx = cx + sx * dx, by = cy + sy * dy;
    if (counts[i] === 1) pts.push([bx, by]);
    else if (counts[i] === 2) {
      const px = -sy * spread, py = sx * spread;
      pts.push([bx + px, by + py], [bx - px, by - py]);
    }
  });
  return pts;
}

// =====================================================================

// Valgfrie opsjoner (alle bakoverkompatible):
//   home: { href, label }  – diskret lenke «Alle verksteder» i toppfeltet (label: tekst eller {enkel,fag})
//   table: false           – ingen periodesystem-dokk (toasten vises fortsatt)
//   sandbox: false         – ingen «Fri bygging»-knapp
//   collection: false      – ingen samlingsknapp
//   inspector: false       – ingen atom-inspektør (verksteder uten atomer)
//   glyph: () => svg       – eget merkeikon i oppdragskortet og hjelpen (standard: atom-glyfen)
//   helpArt: (i) => svg    – egne tegninger til de fire hjelpestegene (standard: atom-tegningene)
export function createUI({ root, data, lang, handlers, home = null, table = true, sandbox = true, collection = true, inspector: showInspector = true, glyph = null, helpArt: customHelpArt = null }) {
  const H = Object.assign(
    { onPick() {}, onLang() {}, onHint() {}, onReset() {}, onLevel() {}, onSandbox() {}, onHover() {} },
    handlers || {},
  );
  const ELEMENTS = data.ELEMENTS || [];
  const EL = data.EL || Object.fromEntries(ELEMENTS.map((e) => [e.sym, e]));
  const LEVELS = data.LEVELS || [];
  const MOLECULES = data.MOLECULES || [];
  const MOL = Object.fromEntries(MOLECULES.map((m) => [m.id, m]));

  const st = {
    lang: lang || (data.LANGS && data.LANGS[0]) || 'enkel',
    level: undefined,             // undefined = ikke satt ennå, null = fri bygging
    progress: { index: 0, total: LEVELS.length, stars: {}, unlocked: 1 },
    palette: null,
    info: null,
    hint: null,
    collection: [],
    collapsed: false,
  };

  const tx = (x) => (x == null ? '' : data.t(x, st.lang));
  const T = (key, vars) => {
    const v = data.STRINGS && data.STRINGS[key] != null ? data.STRINGS[key] : FALLBACK[key];
    const str = v == null ? key : tx(v);
    return vars ? fmt(str, vars) : str;
  };

  // ---------- skjelett ----------
  root.classList.add('mv-ui');
  root.replaceChildren();

  const mission = h('section', { class: 'mv-panel mv-mission' });
  const topbar = h('div', { class: 'mv-topbar' });
  const inspector = h('aside', { class: 'mv-panel mv-inspector' });
  const dock = h('div', { class: 'mv-dock' });
  const collBtnWrap = h('div', { class: 'mv-collection' });
  const foundBox = h('div', { class: 'mv-found', role: 'status', 'aria-live': 'polite' });
  const layer = h('div', { class: 'mv-layer' });
  root.append(...[mission, topbar, showInspector ? inspector : null, dock, foundBox, collBtnWrap, layer].filter(Boolean));
  const brandMark = () => (glyph ? glyph() : brandGlyph());

  // =================================================================
  // Periodesystemet
  // =================================================================
  const toastBox = h('div', { class: 'mv-toast', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const dockTab = h('button', { class: 'mv-dock-tab', type: 'button', 'data-k': 'dock-tab', 'aria-expanded': 'true',
    onclick: () => setCollapsed(!st.collapsed) });
  const tablePanel = h('section', { class: 'mv-panel mv-table' });
  const grid = h('div', { class: 'mv-grid' });
  const strip = h('div', { class: 'mv-strip' });
  const tip = h('div', { class: 'mv-tip', role: 'tooltip', id: 'mv-tip', hidden: true });
  tablePanel.append(grid, strip, tip);
  dock.append(...(table ? [toastBox, dockTab, tablePanel] : [toastBox]));

  const cells = new Map();
  const valenceLabel = h('span', { class: 'mv-vrow-text' });

  function buildGrid() {
    const MAIN = [1, 2, 13, 14, 15, 16, 17, 18];
    // rad 1: valenselektroner som Lewis-prikker
    for (const g of MAIN) {
      const n = g <= 2 ? g : g - 10;
      const svg = s('svg', { class: 'mv-vdots', viewBox: '0 0 38 30', 'aria-hidden': 'true' });
      svg.append(s('text', { x: 19, y: 15, class: 'mv-vnum', 'dominant-baseline': 'central', 'text-anchor': 'middle' }, String(n)));
      for (const [x, y] of lewisPoints(n, 19, 15, 12.5, 10.5, 3.1)) svg.append(s('circle', { cx: x, cy: y, r: 2.15, class: 'mv-edot' }));
      grid.append(h('div', { class: 'mv-vcell', style: `grid-column:${g + 1};grid-row:1`, title: String(n) }, svg));
    }
    grid.append(h('div', { class: 'mv-vrow-label', style: 'grid-column:4 / 14;grid-row:1' },
      h('span', { class: 'mv-vrow-line is-left', 'aria-hidden': 'true' }), valenceLabel,
      h('span', { class: 'mv-vrow-line is-right', 'aria-hidden': 'true' })));
    // rad 2: gruppenummer
    for (let g = 1; g <= 18; g++) {
      grid.append(h('div', { class: 'mv-gnum' + (MAIN.includes(g) ? ' is-main' : ''), style: `grid-column:${g + 1};grid-row:2`, text: String(g) }));
    }
    // periodenummer
    for (let p = 1; p <= 4; p++) grid.append(h('div', { class: 'mv-pnum', style: `grid-column:1;grid-row:${p + 2}`, text: String(p) }));
    // celler
    for (const e of ELEMENTS) {
      if (!e || e.period > 4) continue;
      const b = h('button', {
        class: 'mv-cell', type: 'button', 'data-sym': e.sym, 'data-cat': e.category || 'metall',
        'data-k': 'cell-' + e.sym, 'aria-describedby': 'mv-tip',
        style: `grid-column:${e.group + 1};grid-row:${e.period + 2}`,
      }, h('span', { class: 'mv-cell-z', text: String(e.z) }), h('span', { class: 'mv-cell-sym', text: e.sym }));
      wireCell(b, e);
      cells.set(e.sym, b);
      grid.append(b);
    }
  }

  function isActive(e) {
    return !!e.buildable && (st.palette == null || st.palette.includes(e.sym));
  }
  function wireCell(b, e) {
    b.addEventListener('click', () => {
      if (!e.buildable) toast(cap(T('ui.notBuildable', { name: cap(e.name) })), 'warn');
      else if (isActive(e)) H.onPick(e.sym);
    });
    b.addEventListener('pointerenter', () => { showTip(b, e); H.onHover(e.sym); });
    b.addEventListener('focus', () => { showTip(b, e); H.onHover(e.sym); });
    b.addEventListener('blur', () => { hideTip(); H.onHover(null); });
  }
  tablePanel.addEventListener('pointerleave', () => { hideTip(); H.onHover(null); });

  function showTip(cell, e) {
    tip.replaceChildren(
      h('span', { class: 'mv-tip-name', text: cap(e.name) }),
      h('span', { class: 'mv-tip-shells' }, (e.shells || []).join(' · ')),
    );
    tip.hidden = false;
    const pr = tablePanel.getBoundingClientRect(), cr = cell.getBoundingClientRect();
    const w = tip.offsetWidth;
    let x = cr.left - pr.left + cr.width / 2 - w / 2;
    x = Math.max(4, Math.min(pr.width - w - 4, x));
    tip.style.left = x + 'px';
    tip.style.top = (cr.top - pr.top - tip.offsetHeight - 6) + 'px';
  }
  function hideTip() { tip.hidden = true; }

  function applyPalette() {
    for (const e of ELEMENTS) {
      const b = cells.get(e.sym);
      if (!b) continue;
      const active = isActive(e);
      b.classList.toggle('is-active', active);
      b.classList.toggle('is-off', !active && !!e.buildable);
      b.classList.toggle('is-nb', !e.buildable);
      if (active) b.removeAttribute('aria-disabled'); else b.setAttribute('aria-disabled', 'true');
      b.setAttribute('aria-label', `${cap(e.name)}, ${e.sym}, ${T('ui.z').toLocaleLowerCase('nb')} ${e.z}`);
    }
    // sammenslått stripe: bare aktive grunnstoffer
    strip.replaceChildren();
    for (const e of ELEMENTS) {
      if (!isActive(e)) continue;
      const v = e.valence || 0;
      const chip = h('button', { class: 'mv-chip', type: 'button', 'data-cat': e.category || 'metall', 'data-k': 'chip-' + e.sym,
        'aria-label': `${cap(e.name)}, ${e.sym}`, 'aria-describedby': 'mv-tip' },
        h('span', { class: 'mv-chip-sym', text: e.sym }),
        h('span', { class: 'mv-chip-dots', 'aria-hidden': 'true' }, Array.from({ length: v }, () => h('i'))));
      wireCell(chip, e);
      strip.append(chip);
    }
  }

  function setCollapsed(c) {
    st.collapsed = c;
    tablePanel.classList.toggle('is-collapsed', c);
    hideTip();
    renderDockTab();
  }
  function renderDockTab() {
    dockTab.setAttribute('aria-expanded', String(!st.collapsed));
    dockTab.replaceChildren(
      h('span', { class: 'mv-dock-tab-label', text: T('ui.table') }),
      h('span', { class: 'mv-dock-tab-act' }, T(st.collapsed ? 'ui.showTable' : 'ui.hideTable'), icon(st.collapsed ? 'chevUp' : 'chevDown')),
    );
  }

  // Hold mission-kortets makshøyde klar av tabellen.
  const ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => root.style.setProperty('--dock-h', dock.offsetHeight + 'px'))
    : null;
  ro && ro.observe(dock);

  // =================================================================
  // Toppfelt
  // =================================================================
  function renderTopbar() {
    const langs = data.LANGS || ['enkel', 'fag'];
    const seg = h('div', { class: 'mv-seg', role: 'group', 'aria-label': T('ui.language') },
      langs.map((l) => h('button', {
        type: 'button', class: 'mv-seg-btn', 'data-k': 'lang-' + l, 'aria-pressed': String(l === st.lang),
        onclick: () => {
          if (l === st.lang) return;
          H.onLang(l);
          if (st.lang !== l) setLang(l);
        },
      }, T('ui.lang.' + l))));
    const levelsBtn = h('button', { type: 'button', class: 'mv-btn', 'data-k': 'top-levels', 'aria-haspopup': 'dialog',
      onclick: () => toggleLevels(levelsBtn) }, icon('levels'), T('ui.levels'));
    const sandBtn = sandbox && h('button', { type: 'button', class: 'mv-btn', 'data-k': 'top-sandbox', 'aria-pressed': String(st.level === null),
      onclick: () => H.onSandbox() }, icon('molecule'), T('ui.sandbox'));
    const helpBtn = h('button', { type: 'button', class: 'mv-btn mv-btn--icon', 'data-k': 'top-help', 'aria-label': T('ui.help'), title: T('ui.help'),
      onclick: () => showHelp() }, icon('help'));
    const pathBtn = H.onPath ? h('button', { type: 'button', class: 'mv-btn', 'data-k': 'top-path', onclick: () => H.onPath() }, T('ui.path')) : null;
    const testBtn = st.test && H.onTest ? h('button', { type: 'button', class: 'mv-btn mv-btn--primary mv-testbtn', 'data-k': 'top-test', onclick: () => H.onTest() }, tx(st.test)) : null;
    const supBtn = H.onSupport ? h('button', { type: 'button', class: 'mv-btn mv-supbtn' + (st.support ? ' is-on' : ''), 'data-k': 'top-support',
      'aria-pressed': String(!!st.support), onclick: () => H.onSupport() }, icon('support'), T('ui.support'), h('span', { class: 'mv-supbtn-state', 'aria-hidden': 'true' })) : null;
    const homeLink = home && home.href ? h('a', { class: 'mv-btn mv-btn--ghost mv-home', href: home.href, 'data-k': 'top-home', style: 'text-decoration:none' },
      icon('home'), typeof home.label === 'string' ? home.label : tx(home.label)) : null;
    topbar.replaceChildren(...[testBtn, supBtn, seg, levelsBtn, sandBtn, pathBtn, helpBtn, homeLink].filter(Boolean));
  }

  // =================================================================
  // Oppdragskort
  // =================================================================
  function renderMission() {
    const lv = st.level;
    const idx = lv ? LEVELS.findIndex((l) => l.id === lv.id) : -1;
    const total = st.progress.total || LEVELS.length;
    const brand = h('div', { class: 'mv-brand' }, brandMark(), h('span', { class: 'mv-brand-name', text: T('ui.title') }),
      lv ? h('span', { class: 'mv-count', 'aria-label': `${T('ui.levels')}: ${idx + 1} / ${total}` },
        h('b', { text: String(idx + 1) }), h('span', { text: ' / ' + total })) : null);

    const body = [];
    if (lv) {
      body.push(h('p', { class: 'mv-eyebrow', text: tx(lv.chapter) }));
      body.push(h('h1', { class: 'mv-title', text: tx(lv.title) }));
      body.push(h('p', { class: 'mv-label', text: T('ui.mission') }));
      body.push(h('p', { class: 'mv-brief', text: tx(lv.brief) }));
    } else if (lv === null) {
      body.push(h('h1', { class: 'mv-title', text: T('ui.sandbox') }));
      body.push(h('p', { class: 'mv-brief', text: T('ui.sandboxBrief') }));
    } else {
      body.push(h('p', { class: 'mv-brief', text: T('ui.tagline') }));
    }
    const hintBox = h('div', { class: 'mv-hint', 'aria-live': 'polite' },
      st.hint ? [icon('hint'), h('p', { text: st.hint })] : null);
    if (!st.hint) hintBox.hidden = true;

    const actions = h('div', { class: 'mv-mission-actions' },
      lv ? h('button', { type: 'button', class: 'mv-btn mv-btn--ghost', 'data-k': 'm-hint', onclick: () => H.onHint() }, icon('hint'), T('ui.hint')) : null,
      h('button', { type: 'button', class: 'mv-btn mv-btn--ghost', 'data-k': 'm-reset', onclick: () => H.onReset() }, icon('reset'), T('ui.reset')));
    const foot = h('div', { class: 'mv-mission-foot' },
      lv ? starsNode(st.progress.stars?.[lv.id] || 0, 'mv-stars', T('ui.stars')) : h('span'),
      actions);

    mission.replaceChildren(brand, h('div', { class: 'mv-mission-body' }, body), hintBox, foot);
  }

  // =================================================================
  // Inspektør
  // =================================================================
  function ionShells(shells, charge) {
    const sh = shells.slice();
    if (!charge || !sh.length) return sh;
    if (charge > 0) {
      sh[sh.length - 1] -= charge;
      if (sh[sh.length - 1] <= 0) sh.pop();
    } else sh[sh.length - 1] += -charge;
    return sh;
  }
  function bohr(shells, color) {
    const R0 = 17, STEP = 11.5;
    const n = shells.length;
    const ext = R0 + STEP * Math.max(n - 1, 0) + 5;
    const svg = s('svg', { class: 'mv-bohr', viewBox: `${-ext} ${-ext} ${ext * 2} ${ext * 2}`, 'aria-hidden': 'true' });
    shells.forEach((count, i) => {
      const r = R0 + STEP * i;
      const outer = i === n - 1;
      svg.append(s('circle', { r, class: 'mv-bohr-ring' + (outer ? ' is-outer' : '') }));
      let angles = [];
      if (outer && i > 0 && count <= 8) {
        // ytterskall: Lewis-plassering (alene først, så par)
        const base = [-90, 0, 90, 180];
        lewisSides(count).forEach((c, k) => {
          if (c === 1) angles.push(base[k]);
          else if (c === 2) angles.push(base[k] - 13, base[k] + 13);
        });
      } else if (i === 0 && count === 2) angles = outer ? [-90 - 16, -90 + 16] : [180, 0];
      else for (let k = 0; k < count; k++) angles.push(-90 + (360 / count) * k + (i % 2 ? 180 / count : 0));
      for (const a of angles) {
        const rad = (a * Math.PI) / 180;
        svg.append(s('circle', { cx: (r * Math.cos(rad)).toFixed(2), cy: (r * Math.sin(rad)).toFixed(2), r: outer ? 2.9 : 2.1,
          class: outer ? 'mv-edot' : 'mv-bohr-inner' }));
      }
    });
    svg.append(s('circle', { r: 7.5, class: 'mv-bohr-core', style: color ? `fill:${color}` : null }));
    return svg;
  }

  function renderInspector() {
    const info = st.info;
    const e = info && EL[info.sym];
    if (!e) {
      inspector.classList.add('is-empty');
      inspector.replaceChildren(
        h('div', { class: 'mv-insp-empty' },
          s('svg', { class: 'mv-insp-ghost', viewBox: '-30 -30 60 60', 'aria-hidden': 'true' },
            s('circle', { r: 26 }), s('circle', { r: 15 }), s('circle', { r: 4, class: 'is-core' })),
          h('p', { text: T('ui.inspector.empty') })));
      return;
    }
    inspector.classList.remove('is-empty');
    const charge = info.charge || 0;
    const shells = ionShells(e.shells || [], charge);
    const head = h('div', { class: 'mv-insp-head' },
      h('div', { class: 'mv-insp-sym' }, e.sym, charge ? h('span', { class: 'mv-insp-charge', text: chargeSup(charge) }) : null),
      h('div', { class: 'mv-insp-id' },
        h('h2', { class: 'mv-insp-name' }, h('i', { class: 'mv-swatch', style: `background:${e.color || '#8fb0b3'}`, 'aria-hidden': 'true' }), cap(e.name)),
        e.category ? h('span', { class: 'mv-cat-chip', 'data-cat': e.category, text: T('cat.' + e.category) }) : null));

    const facts = [
      [T('ui.z'), e.z],
      [T('ui.group'), e.group],
      [T('ui.period'), e.period],
    ];
    if (e.valence != null) facts.push([T('ui.valence'), e.valence]);
    if (charge) facts.push([T('ui.charge'), signed(charge)]);
    const dl = h('dl', { class: 'mv-facts' }, facts.map(([k, v]) => h('div', null, h('dt', { text: k }), h('dd', { text: String(v) }))));

    const mid = h('div', { class: 'mv-insp-mid' },
      h('figure', { class: 'mv-insp-model' }, bohr(shells, e.color),
        h('figcaption', null, h('span', { class: 'mv-mini-label', text: T('ui.shells') }), h('span', { class: 'mv-shells-text', text: shells.join(' · ') }))),
      dl);

    const small = h('dl', { class: 'mv-facts mv-facts--small' },
      h('div', null, h('dt', { text: T('ui.en') }), h('dd', { text: numNO(e.en, 2) })),
      h('div', null, h('dt', { text: T('ui.mass') }), h('dd', { text: numNO(e.mass, e.mass != null && e.mass >= 100 ? 1 : 2) })));

    let meter = null;
    if (info.max) {
      const max = info.max, outer = Math.max(0, Math.min(max, info.outer || 0));
      meter = h('div', { class: 'mv-meter' + (info.full ? ' is-full' : '') },
        h('div', { class: 'mv-meter-top' },
          h('span', { class: 'mv-meter-label', text: T('ui.outer', { n: outer, max }) }),
          info.full ? h('span', { class: 'mv-full' }, icon('check'), T('ui.fullShell')) : null),
        h('div', { class: 'mv-slots', 'data-max': String(max), role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': String(max), 'aria-valuenow': String(outer),
          'aria-label': T('ui.outer', { n: outer, max }) },
          Array.from({ length: max }, (_, i) => h('i', { class: i < outer ? 'is-on' : '' }))));
    }
    inspector.replaceChildren(head, mid, small, meter);
  }

  // =================================================================
  // Toast
  // =================================================================
  let toastTimer = 0;
  function toast(text, kind = 'info') {
    clearTimeout(toastTimer);
    const k = ['info', 'good', 'warn'].includes(kind) ? kind : 'info';
    toastBox.dataset.kind = k;
    toastBox.classList.remove('is-show');
    void toastBox.offsetWidth;
    toastBox.replaceChildren(
      h('span', { class: 'mv-toast-mark', 'aria-hidden': 'true' }, k === 'good' ? icon('check') : k === 'warn' ? icon('cross') : h('i')),
      h('span', { class: 'mv-toast-text', text: String(text) }));
    toastBox.classList.add('is-show');
    toastTimer = setTimeout(() => toastBox.classList.remove('is-show'), 4200);
  }

  function showHint(text) {
    st.hint = text == null ? null : String(text);
    renderMission();
  }

  // =================================================================
  // Samling
  // =================================================================
  let collBtn = null;
  function renderCollection() {
    if (!collection) return;
    const n = st.collection.length, total = MOLECULES.length;
    collBtn = h('button', { type: 'button', class: 'mv-panel mv-coll-btn', 'data-k': 'coll', 'aria-haspopup': 'dialog',
      onclick: () => toggleCollection() },
      icon('molecule', 'mv-ico mv-coll-ico'),
      h('span', { class: 'mv-coll-label', text: T('ui.collection') }),
      h('span', { class: 'mv-coll-count' }, h('b', { text: String(n) }), h('span', { text: ' / ' + total })),
      icon('chevUp'));
    collBtnWrap.replaceChildren(collBtn);
  }
  function setCollection(ids) {
    st.collection = Array.from(new Set(ids || []));
    renderCollection();
    rerenderOpen('collection');
  }

  let foundTimer = 0;
  function found(molecule) {
    if (!molecule) return;
    if (!st.collection.includes(molecule.id)) st.collection.push(molecule.id);
    renderCollection();
    rerenderOpen('collection');
    clearTimeout(foundTimer);
    foundBox.classList.remove('is-show');
    void foundBox.offsetWidth;
    foundBox.replaceChildren(h('div', { class: 'mv-panel mv-found-card' },
      h('span', { class: 'mv-found-orbit', 'aria-hidden': 'true' }, h('i')),
      h('div', null,
        h('p', { class: 'mv-found-title', text: cap(T('ui.found', { name: tx(molecule.name) })) }),
        formulaNode(molecule.formula, 'mv-formula mv-found-formula'))));
    foundBox.classList.add('is-show');
    collBtn && collBtn.classList.add('is-bump');
    setTimeout(() => collBtn && collBtn.classList.remove('is-bump'), 700);
    foundTimer = setTimeout(() => foundBox.classList.remove('is-show'), 4500);
  }

  // =================================================================
  // Dialogsystem
  // =================================================================
  const stack = [];
  function openOverlay({ kind, modal, className, labelId, render, onEscape, trigger, dismissOutside, focus }) {
    const prev = document.activeElement;
    const box = h('div', { class: 'mv-panel mv-dialog ' + (className || ''), role: 'dialog', 'aria-modal': modal ? 'true' : null, 'aria-labelledby': labelId });
    const wrap = modal ? h('div', { class: 'mv-scrim' }, box) : box;
    const entry = { kind, modal, el: box, wrap, prev, trigger, dismissOutside, onEscape, render: () => box.replaceChildren(...render().flat(Infinity).filter((x) => x != null && x !== false)) };
    entry.render();
    layer.append(wrap);
    stack.push(entry);
    requestAnimationFrame(() => {
      const target = (focus && box.querySelector(focus)) || box.querySelector('button:not([disabled])');
      target && target.focus({ preventScroll: true });
    });
    return entry;
  }
  function closeOverlay(entry) {
    const i = stack.indexOf(entry);
    if (i < 0) return;
    stack.splice(i, 1);
    entry.wrap.remove();
    const back = entry.trigger && entry.trigger.isConnected ? entry.trigger : entry.prev;
    if (back && back.isConnected && typeof back.focus === 'function') back.focus({ preventScroll: true });
  }
  const findOpen = (kind) => stack.find((e) => e.kind === kind);
  function rerenderOpen(kind) {
    const e = findOpen(kind);
    if (e) e.render();
  }

  function onKey(e) {
    const top = stack[stack.length - 1];
    if (!top) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      top.onEscape();
    } else if (e.key === 'Tab' && top.modal) {
      const f = [...top.el.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (!top.el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  function onPointerDown(e) {
    for (const entry of [...stack]) {
      if (!entry.dismissOutside) continue;
      if (entry.el.contains(e.target)) continue;
      if (entry.trigger && entry.trigger.contains(e.target)) continue;
      closeOverlay(entry);
    }
  }
  document.addEventListener('keydown', onKey);
  document.addEventListener('pointerdown', onPointerDown, true);

  const closeBtn = (fn, k) => h('button', { type: 'button', class: 'mv-btn mv-btn--icon mv-close', 'data-k': k, 'aria-label': T('ui.close'), title: T('ui.close'), onclick: fn }, icon('close'));

  // ---------- nivåmeny ----------
  function toggleLevels(trigger) {
    const open = findOpen('levels');
    if (open) { closeOverlay(open); return; }
    const entry = openOverlay({
      kind: 'levels', className: 'mv-levels', labelId: 'mv-levels-title', trigger, dismissOutside: true,
      focus: '.mv-lvl.is-current, .mv-lvl:not([aria-disabled])',
      onEscape: () => closeOverlay(entry),
      render: () => {
        const pr = st.progress;
        const unlocked = pr.unlocked == null ? LEVELS.length : pr.unlocked;
        const allDone = LEVELS.length > 0 && LEVELS.every((l) => (pr.stars?.[l.id] || 0) > 0);
        const groups = [];
        LEVELS.forEach((l, i) => {
          const ch = tx(l.chapter);
          if (!groups.length || groups[groups.length - 1].ch !== ch) groups.push({ ch, items: [] });
          groups[groups.length - 1].items.push([l, i]);
        });
        return [
          h('header', { class: 'mv-dialog-head' },
            h('h2', { class: 'mv-dialog-title', id: 'mv-levels-title', text: T('ui.levels') }),
            closeBtn(() => closeOverlay(entry), 'lv-close')),
          allDone ? h('p', { class: 'mv-done' }, icon('check'), T('ui.done')) : null,
          h('div', { class: 'mv-levels-scroll' }, groups.map((g, gi) => h('section', { class: 'mv-lv-group' },
            h('h3', { class: 'mv-lv-chapter' }, h('span', { class: 'mv-lv-chnum', text: String(gi + 1).padStart(2, '0') }), g.ch),
            h('ol', { class: 'mv-lv-list' }, g.items.map(([l, i]) => {
              const locked = i >= unlocked;
              const current = st.level && st.level.id === l.id;
              const stars = pr.stars?.[l.id] || 0;
              return h('li', null, h('button', {
                type: 'button', class: 'mv-lvl' + (current ? ' is-current' : '') + (locked ? ' is-locked' : ''),
                'data-k': 'lvl-' + l.id, 'aria-disabled': locked ? 'true' : null, 'aria-current': current ? 'true' : null,
                onclick: () => { if (locked) return; closeOverlay(entry); H.onLevel(l.id); },
              },
              h('span', { class: 'mv-lvl-num', text: String(i + 1) }),
              h('span', { class: 'mv-lvl-title', text: tx(l.title) }),
              locked ? h('span', { class: 'mv-lvl-lock' }, icon('lock'), h('span', { class: 'mv-sr', text: T('ui.locked') }))
                : starsNode(stars, 'mv-stars mv-stars--sm', T('ui.stars'))));
            }))))),
        ];
      },
    });
  }

  // ---------- samlingsliste ----------
  function toggleCollection() {
    const open = findOpen('collection');
    if (open) { closeOverlay(open); return; }
    const entry = openOverlay({
      kind: 'collection', className: 'mv-coll-list', labelId: 'mv-coll-title', trigger: collBtn, dismissOutside: true,
      onEscape: () => closeOverlay(entry),
      render: () => {
        const mols = MOLECULES.filter((m) => st.collection.includes(m.id));
        return [
          h('header', { class: 'mv-dialog-head' },
            h('h2', { class: 'mv-dialog-title', id: 'mv-coll-title' }, T('ui.collection'),
              h('span', { class: 'mv-dialog-count', text: ` ${mols.length} / ${MOLECULES.length}` })),
            closeBtn(() => closeOverlay(entry), 'coll-close')),
          mols.length
            ? h('ul', { class: 'mv-coll-items' }, mols.map((m) => h('li', null,
              formulaNode(m.formula, 'mv-formula mv-coll-formula'), h('span', { class: 'mv-coll-name', text: cap(tx(m.name)) }))))
            : h('p', { class: 'mv-muted', text: T('ui.collectionEmpty') }),
        ];
      },
    });
  }

  // ---------- hjelp ----------
  function helpArt(i) {
    const svg = s('svg', { class: 'mv-help-art', viewBox: '0 0 64 48', 'aria-hidden': 'true' });
    if (i === 0) { // klikk i tabellen
      for (let c = 0; c < 4; c++) svg.append(s('rect', { x: 6 + c * 13, y: 10, width: 11, height: 11, rx: 2.5, class: c === 2 ? 'a-hot' : 'a-cell' }));
      svg.append(s('path', { class: 'a-cursor', d: 'M36 18l0 20 5-5 4 8 3-1.5-4-8 7 0z' }));
    } else if (i === 1) { // dra fra atom til atom
      svg.append(s('circle', { cx: 14, cy: 26, r: 9, class: 'a-atom' }), s('circle', { cx: 50, cy: 26, r: 9, class: 'a-atom' }),
        s('path', { class: 'a-drag', d: 'M24 26h14' }), s('path', { class: 'a-line', d: 'M34.5 22l4 4-4 4' }),
        s('circle', { cx: 29, cy: 26, r: 2.6, class: 'mv-edot' }));
    } else if (i === 2) { // klikk binding / høyreklikk atom
      svg.append(s('circle', { cx: 14, cy: 26, r: 9, class: 'a-atom' }), s('circle', { cx: 50, cy: 26, r: 9, class: 'a-atom is-dim' }),
        s('path', { class: 'a-line', d: 'M23 26h6M35 26h6' }), s('path', { class: 'a-cut', d: 'M29 20l6 12M35 20l-6 12' }));
    } else { // snu og zoom
      svg.append(s('path', { class: 'a-line', d: 'M14 30a18 10 0 1 0 6-14' }), s('path', { class: 'a-line', d: 'M15 10l5.5 6-7 2.5' }),
        s('rect', { x: 42, y: 12, width: 14, height: 24, rx: 7, class: 'a-atom' }), s('path', { class: 'a-line', d: 'M49 17v5' }));
    }
    return svg;
  }
  function showHelp() {
    const open = findOpen('help');
    if (open) return;
    const entry = openOverlay({
      kind: 'help', modal: true, className: 'mv-help', labelId: 'mv-help-title', focus: '.mv-btn--primary',
      onEscape: () => closeOverlay(entry),
      render: () => [
        h('header', { class: 'mv-help-head' },
          h('div', { class: 'mv-brand' }, brandMark(), h('span', { class: 'mv-brand-name', text: T('ui.title') })),
          closeBtn(() => closeOverlay(entry), 'help-x')),
        h('h2', { class: 'mv-dialog-title mv-help-title', id: 'mv-help-title', text: T('ui.help') }),
        h('p', { class: 'mv-help-tag', text: T('ui.tagline') }),
        h('ol', { class: 'mv-help-steps' }, [1, 2, 3, 4].map((n, i) => h('li', null,
          h('span', { class: 'mv-help-n', text: String(n) }), customHelpArt ? customHelpArt(i) : helpArt(i), h('p', { text: T('ui.howto' + n) })))),
        h('div', { class: 'mv-dialog-foot' },
          h('button', { type: 'button', class: 'mv-btn mv-btn--primary', 'data-k': 'help-ok', onclick: () => closeOverlay(entry) }, T('ui.close'))),
      ],
    });
  }

  // ---------- valg mellom to–tre alternativer (f.eks. læringsløp) ----------
  function choose({ title, options }) {
    return new Promise((resolve) => {
      let entry = null;
      const done = (i) => { closeOverlay(entry); resolve(i); };
      entry = openOverlay({
        kind: 'choose', modal: true, className: 'mv-choose', labelId: 'mv-choose-t', onEscape: () => done(-1),
        render: () => [
          h('h2', { class: 'mv-dialog-title', id: 'mv-choose-t', text: tx(title) }),
          h('div', { class: 'mv-choose-opts' }, options.map((o, i) =>
            h('button', { type: 'button', class: 'mv-choose-opt', 'data-k': 'choose-' + i, onclick: () => done(i) },
              h('strong', { text: tx(o.title) }), h('span', { text: tx(o.desc) })))),
        ],
      });
    });
  }

  // ---------- test etter hver femte modul ----------
  // questions: [{ q, options: [{enkel,fag}], correct, why }]. Løses med null («Ikke nå») eller { score, total, passed }.
  function quiz({ title, questions, need, offer }) {
    const fmt = (key, vars) => { let out = T(key); for (const k in vars) out = out.split('{' + k + '}').join(vars[k]); return out; };
    return new Promise((resolve) => {
      const total = questions.length, picks = new Array(total).fill(null), LET = 'ABCD';
      let phase = 'intro', i = 0, entry = null, score = 0;
      const finish = (v) => { closeOverlay(entry); resolve(v); };
      const focusFirst = () => requestAnimationFrame(() => entry.el.querySelector('.mv-option, [data-k^="q-"]')?.focus({ preventScroll: true }));
      entry = openOverlay({
        kind: 'quiz', modal: true, className: 'mv-predict mv-quiz', labelId: 'mv-quiz-t',
        onEscape: () => { if (phase === 'intro') finish(null); },
        render: () => {
          const head = h('p', { class: 'mv-eyebrow mv-predict-eyebrow' }, h('span', { class: 'mv-pulse', 'aria-hidden': 'true' }), tx(title),
            phase === 'q' ? h('span', { class: 'mv-predict-lvl', text: fmt('ui.testQ', { i: i + 1, total }) }) : null);
          if (phase === 'intro') return [head,
            h('h2', { class: 'mv-predict-q', id: 'mv-quiz-t', text: tx(title) }),
            h('p', { class: 'mv-quiz-text', text: fmt('ui.testIntro', { total, need }) }),
            h('div', { class: 'mv-dialog-foot' },
              h('button', { type: 'button', class: 'mv-btn mv-btn--ghost', 'data-k': 'q-later', onclick: () => finish(null) }, T('ui.testLater')),
              h('button', { type: 'button', class: 'mv-btn mv-btn--primary mv-btn--lg', 'data-k': 'q-start',
                onclick: () => { phase = 'q'; entry.render(); focusFirst(); } }, T('ui.testStart'), icon('arrow')))];
          if (phase === 'q') {
            const qq = questions[i], last = i === total - 1;
            return [head,
              h('div', { class: 'mv-quiz-bar', 'aria-hidden': 'true' }, questions.map((_, k) => h('span', { class: k < i ? 'is-done' : k === i ? 'is-now' : '' }))),
              h('h2', { class: 'mv-predict-q', id: 'mv-quiz-t', text: tx(qq.q) }),
              h('div', { class: 'mv-options', role: 'group', 'aria-labelledby': 'mv-quiz-t' }, qq.options.map((o, k) =>
                h('button', { type: 'button', class: 'mv-option' + (picks[i] === k ? ' is-chosen' : ''), 'data-k': 'opt-' + k, 'aria-pressed': String(picks[i] === k),
                  onclick: () => { picks[i] = k; entry.render(); entry.el.querySelector(`[data-k="opt-${k}"]`)?.focus(); } },
                h('span', { class: 'mv-option-key', text: LET[k] }), h('span', { class: 'mv-option-text', text: tx(o) })))),
              h('div', { class: 'mv-dialog-foot' },
                h('button', { type: 'button', class: 'mv-btn mv-btn--primary mv-btn--lg', 'data-k': 'q-next', disabled: picks[i] == null,
                  onclick: () => {
                    if (!last) { i++; entry.render(); focusFirst(); return; }
                    score = questions.reduce((n, x, k) => n + (picks[k] === x.correct ? 1 : 0), 0);
                    phase = 'result'; entry.render(); requestAnimationFrame(() => entry.el.querySelector('[data-k="q-done"]')?.focus({ preventScroll: true }));
                  } }, T(last ? 'ui.testFinish' : 'ui.testNext'), icon('arrow')))];
          }
          const passed = score >= need, wrong = questions.map((x, k) => [x, k]).filter(([x, k]) => picks[k] !== x.correct);
          return [head,
            h('div', { class: 'mv-quiz-score ' + (passed ? 'is-right' : 'is-wrong'), role: 'status' },
              h('p', { class: 'mv-quiz-big', id: 'mv-quiz-t' }, icon(passed ? 'check' : 'cross'), fmt('ui.testScore', { score, total })),
              h('p', { class: 'mv-quiz-text', text: T(passed ? 'ui.testPassed' : 'ui.testFailed') })),
            wrong.length ? h('div', { class: 'mv-quiz-review' },
              h('p', { class: 'mv-label', text: T('ui.testReview') }),
              wrong.map(([x, k]) => h('div', { class: 'mv-quiz-item' },
                h('p', { class: 'mv-quiz-iq', text: tx(x.q) }),
                h('p', { class: 'mv-quiz-your' }, h('span', { text: T('ui.testYour') + ': ' }), h('s', { text: tx(x.options[picks[k]]) })),
                h('p', { class: 'mv-quiz-right' }, h('span', { text: T('ui.testRight') + ': ' }), h('strong', { text: tx(x.options[x.correct]) })),
                h('p', { class: 'mv-quiz-why', text: tx(x.why) })))) : null,
            h('div', { class: 'mv-dialog-foot' },
              !passed && offer ? h('button', { type: 'button', class: 'mv-btn mv-supbtn', 'data-k': 'q-support',
                onclick: () => finish({ score, total, passed, support: true }) }, icon('support'), tx(offer)) : null,
              h('button', { type: 'button', class: 'mv-btn mv-btn--primary mv-btn--lg', 'data-k': 'q-done',
                onclick: () => finish({ score, total, passed }) }, T(passed ? 'ui.testGo' : 'ui.testRedo'), icon('arrow')))];
        },
      });
    });
  }
  function setTest(label) { st.test = label || null; renderTopbar(); }
  function setSupport(on) { st.support = !!on; renderTopbar(); }

  // ---------- predict ----------
  function predict(level, opts) {
    if (!level || !level.predict) return Promise.resolve(true);
    return new Promise((resolve) => {
      const p = level.predict;
      let chosen = null, answered = false, entry = null;
      const finish = (val) => { closeOverlay(entry); resolve(val); };
      const LET = 'ABCD';
      entry = openOverlay({
        kind: 'predict', modal: true, className: 'mv-predict', labelId: 'mv-predict-q',
        onEscape: () => finish(answered ? chosen === p.correct : false),
        render: () => {
          const right = answered && chosen === p.correct;
          return [
            h('p', { class: 'mv-eyebrow mv-predict-eyebrow' }, h('span', { class: 'mv-pulse', 'aria-hidden': 'true' }), T(opts && opts.guess ? 'ui.guessTitle' : 'ui.predictTitle'),
              h('span', { class: 'mv-predict-lvl', text: tx(level.title) })),
            h('h2', { class: 'mv-predict-q', id: 'mv-predict-q', text: tx(p.q) }),
            h('div', { class: 'mv-options', role: 'group', 'aria-labelledby': 'mv-predict-q' }, p.options.map((o, i) => {
              let cls = 'mv-option', mark = h('span', { class: 'mv-option-key', text: LET[i] || String(i + 1) });
              if (answered) {
                if (i === p.correct) { cls += ' is-correct'; mark = h('span', { class: 'mv-option-key' }, icon('check')); }
                else if (i === chosen) { cls += ' is-wrong'; mark = h('span', { class: 'mv-option-key' }, icon('cross')); }
                else cls += ' is-dim';
              } else if (i === chosen) cls += ' is-chosen';
              return h('button', {
                type: 'button', class: cls, 'data-k': 'opt-' + i, 'aria-pressed': String(i === chosen),
                'aria-disabled': answered ? 'true' : null,
                onclick: () => {
                  if (answered) return;
                  chosen = i;
                  entry.render();
                  entry.el.querySelector(`[data-k="opt-${i}"]`)?.focus();
                },
              }, mark, h('span', { class: 'mv-option-text', text: tx(o) }));
            })),
            answered ? h('div', { class: 'mv-verdict ' + (right ? 'is-right' : 'is-wrong'), role: 'status' },
              h('p', { class: 'mv-verdict-head' }, icon(right ? 'check' : 'cross'), T(right ? 'ui.predictRight' : 'ui.predictWrong')),
              h('p', { class: 'mv-verdict-why', text: tx(p.why) })) : null,
            h('div', { class: 'mv-dialog-foot' },
              answered
                ? h('button', { type: 'button', class: 'mv-btn mv-btn--primary mv-btn--lg', 'data-k': 'p-start', onclick: () => finish(chosen === p.correct) },
                  T('ui.start'), icon('arrow'))
                : h('button', { type: 'button', class: 'mv-btn mv-btn--primary mv-btn--lg', 'data-k': 'p-check', disabled: chosen == null,
                  onclick: () => { answered = true; entry.render(); entry.el.querySelector('[data-k="p-start"]')?.focus(); } },
                T('ui.check'))),
          ];
        },
      });
    });
  }

  // ---------- success ----------
  // extra (valgfri): DOM-node(r) som settes inn etter faktaen. molecule.formula kan også være en ferdig DOM-node.
  function success({ level, molecule, stars, headline, nextLabel, extra } = {}) {
    return new Promise((resolve) => {
      let entry = null;
      const finish = (v) => { closeOverlay(entry); resolve(v); };
      const k = Math.max(0, Math.min(3, stars | 0));
      entry = openOverlay({
        kind: 'success', className: 'mv-success', labelId: 'mv-success-name', focus: '[data-k="s-next"]',
        onEscape: () => finish('stay'),
        render: () => {
          const m = molecule || {};
          const burst = s('svg', { class: 'mv-burst', viewBox: '-60 -60 120 120', 'aria-hidden': 'true' },
            s('circle', { r: 50, class: 'mv-burst-ring r3' }), s('circle', { r: 36, class: 'mv-burst-ring r2' }), s('circle', { r: 22, class: 'mv-burst-ring r1' }),
            s('g', { class: 'mv-burst-spin' },
              s('circle', { cx: 0, cy: -36, r: 3.4, class: 'mv-edot' }), s('circle', { cx: 0, cy: 36, r: 3.4, class: 'mv-edot' }),
              s('circle', { cx: 50, cy: 0, r: 3, class: 'mv-edot' }), s('circle', { cx: -50, cy: 0, r: 3, class: 'mv-edot' })));
          return [
            h('div', { class: 'mv-success-top' },
              burst,
              h('div', { class: 'mv-success-titles' },
                h('p', { class: 'mv-eyebrow mv-success-eyebrow', text: headline ? tx(headline) : T('ui.success') }),
                h('h2', { class: 'mv-success-name', id: 'mv-success-name', text: cap(tx(m.name)) }),
                m.formula && m.formula.nodeType ? m.formula : formulaNode(m.formula, 'mv-formula mv-success-formula'))),
            h('div', { class: 'mv-success-stars', role: 'img', 'aria-label': `${T('ui.stars')}: ${k} / 3` },
              [0, 1, 2].map((i) => starSvg(i < k, 'mv-star mv-star--lg s' + i))),
            m.shape ? h('dl', { class: 'mv-success-shape' }, h('dt', { text: T('ui.shape') }), h('dd', { text: tx(m.shape) })) : null,
            m.fact ? h('p', { class: 'mv-success-fact', text: tx(m.fact) }) : null,
            typeof extra === 'function' ? extra() : extra || null,
            level && level.learn ? h('div', { class: 'mv-learn' },
              h('p', { class: 'mv-label', text: T('ui.learned') }), h('p', { class: 'mv-learn-text', text: tx(level.learn) })) : null,
            h('div', { class: 'mv-dialog-foot mv-success-foot' },
              h('button', { type: 'button', class: 'mv-btn mv-btn--ghost', 'data-k': 's-stay', onclick: () => finish('stay') }, T('ui.stay')),
              h('button', { type: 'button', class: 'mv-btn mv-btn--primary mv-btn--lg', 'data-k': 's-next', onclick: () => finish('next') }, nextLabel ? tx(nextLabel) : T('ui.next'), icon('arrow'))),
          ];
        },
      });
    });
  }

  // =================================================================
  // Offentlig API
  // =================================================================
  function renderAll() {
    renderTopbar();
    renderMission();
    renderInspector();
    renderCollection();
    renderDockTab();
    valenceLabel.textContent = T('ui.valenceRow');
    applyPalette();
    for (const e of stack) e.render();
  }

  function setLang(l) {
    st.lang = l;
    document.documentElement.lang = 'nb';
    const k = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.k : null;
    renderAll();
    if (k) {
      const again = root.querySelector(`[data-k="${CSS.escape(k)}"]`);
      again && again.focus({ preventScroll: true });
    }
  }
  function setLevel(level, progress) {
    st.level = level;
    st.hint = null;
    if (progress) st.progress = Object.assign({}, st.progress, progress, { stars: Object.assign({}, progress.stars || {}) });
    renderTopbar();
    renderMission();
    rerenderOpen('levels');
  }
  function setPalette(syms) {
    st.palette = syms == null ? null : [...syms];
    applyPalette();
  }
  function setInspector(info) {
    st.info = info || null;
    renderInspector();
  }
  function destroy() {
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('pointerdown', onPointerDown, true);
    ro && ro.disconnect();
    clearTimeout(toastTimer); clearTimeout(foundTimer);
    root.replaceChildren();
    root.classList.remove('mv-ui');
  }

  buildGrid();
  renderAll();

  return {
    setLang, setLevel, setPalette, setInspector, toast, showHint, predict, success, found, setCollection,
    showHelp, choose, quiz, setTest, setSupport,
    destroy,
  };
}
