import { startFlyt } from '../../felles/flyt.js';
import { createUI } from '../../molekyl/js/ui.js';
import { STRINGS as COMMON, t } from '../../molekyl/js/data.js';
import * as data from './data.js';
import * as sim from './sim.js';
import { STRINGS as TEXT } from './strings.js';

const STRINGS = { ...COMMON, ...TEXT };
startFlyt({
  key: 'dnaverkstedet.v1', epoch: 1,
  data: async () => ({ ...data, STRINGS, t }), setup,
});

async function setup(flyt) {
  const { Stage, createDNAView } = await import('./scene.js');
  const root = document.getElementById('ui'), { L, tx } = flyt;
  const el = (tag, cls, text) => {
    const node = document.createElement(tag); if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text; return node;
  };
  const button = (text, key, onClick, cls = '') => {
    const b = el('button', 'mv-btn dn-button ' + cls, text); b.type = 'button'; b.dataset.k = key;
    b.addEventListener('click', onClick); return b;
  };
  const glyph = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 32 32'); svg.setAttribute('aria-hidden', 'true'); svg.classList.add('mv-glyph', 'dn-glyph');
    svg.innerHTML = '<path d="M8 3C27 9 24 15 8 20s-5 7 0 9M24 3C5 9 8 15 24 20s5 7 0 9"/><path class="dn-rungs" d="M10 5h12M9 12h14M12 18h8M8 25h16"/>';
    return svg;
  };
  const helpArt = (i) => {
    const mark = glyph(); mark.classList.add('mv-help-art');
    if (i === 2) mark.setAttribute('aria-label', 'AUG → Met'); return mark;
  };
  const ui = createUI({ root, data: { ...data, STRINGS, t, MOLECULES: [] }, lang: flyt.state.lang,
    home: { href: '../', label: { enkel: 'Alle verksteder', fag: 'Alle verksteder' } },
    table: false, sandbox: false, collection: false, inspector: false, glyph, helpArt,
    handlers: { ...flyt.handlers },
  });
  root.classList.add('dn-ui');
  const bottom = el('div', 'dn-bottom'), work = el('section', 'mv-panel dn-work');
  const side = el('aside', 'mv-panel dn-side'); bottom.append(work, side); root.append(bottom);
  work.setAttribute('aria-label', L('dn.workspace'));
  const live = el('p', 'mv-sr'); live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); root.append(live);
  let goal, level, state, view, message = '', messageKind = '', lastLive = '';
  const stage = new Stage(document.getElementById('stage'), {
    onPick(id) {
      if (flyt.busy || !state || !state.opened) return;
      const [r, i] = id.split(':').map(Number);
      if (!state.rows[r]?.[i]) { state.activeRow = r; state.active = i; render(); }
    },
  });
  function fitStage() {
    const m = root.querySelector('.mv-mission')?.getBoundingClientRect(), b = bottom.getBoundingClientRect();
    const sideCard = m && m.left < 40 && m.right < innerWidth * 0.45 && m.bottom > innerHeight * 0.3;
    const top = sideCard ? 60 : m?.bottom || 60, bh = b.height ? innerHeight - b.top : 0;
    root.style.setProperty('--dn-bottom-h', Math.round(bh) + 'px');
    stage.setShift(sideCard ? m.right / 2 : 0, (bh - top) / 2);
  }
  addEventListener('resize', fitStage);
  const observer = new ResizeObserver(() => requestAnimationFrame(fitStage));
  observer.observe(bottom); observer.observe(root.querySelector('.mv-mission'));
  const sceneText = (key, vars) => key.startsWith('part.') ? tx(data.PARTS[key.slice(5)]) : L(key, vars);
  function firstEmpty() {
    for (let r = 0; r < state.rows.length; r++) {
      const i = state.rows[r].indexOf('');
      if (i >= 0) { state.activeRow = r; state.active = i; return; }
    }
    state.active = -1;
  }
  function announce(text, kind = 'info') {
    message = text; messageKind = kind;
    if (text !== lastLive) { live.textContent = text; lastLive = text; }
  }
  function enterLevel(lv) {
    level = lv; goal = lv.goal; state = sim.createState(goal); message = ''; messageKind = ''; firstEmpty();
    view = createDNAView(goal, state, sceneText, stage.lowQ); stage.setView(view);
  }
  function reset() {
    state = sim.createState(goal); firstEmpty(); message = ''; messageKind = ''; render();
  }
  function action(fn, key) {
    if (flyt.busy || !state || sim.status(state, goal).done) return;
    fn(); render();
    // Rendering replaces the controls. Preserve keyboard position after each action.
    const target = key && root.querySelector(`[data-k="${key}"]:not(:disabled)`);
    const fallback = work.querySelector('[data-k="finish"]:not(:disabled), [data-k="base-A"]:not(:disabled), [data-k^="aa-"]:not(:disabled), [data-k^="effect-"]:not(:disabled), [data-k="open"]:not(:disabled), [data-k^="part-"]:not(:disabled)');
    (target || fallback)?.focus({ preventScroll: true });
  }
  function pickPart(id) {
    if (state.parts.includes(id)) return;
    if (!goal.parts.includes(id)) { announce(L('dn.partWrong', { name: tx(data.PARTS[id]) }), 'warn'); return; }
    state.parts.push(id); announce(L('dn.partPlaced', { name: tx(data.PARTS[id]) }), 'good');
  }
  function pickBase(base) {
    const result = sim.placeBase(state, goal, state.activeRow, state.active, base);
    if (!result.ok) {
      const rule = goal.type === 'transcribe' ? 'A–U, T–A og C–G' : 'A–T og C–G';
      announce(goal.type === 'transcribe' && base === 'T' ? L('dn.rnaWrong') : L('dn.pairWrong', { base, template: result.template || '', rule }), 'warn'); return;
    }
    firstEmpty(); announce(L('dn.basePlaced', { base }), 'good');
  }
  function pickAmino(amino) {
    const result = sim.addAmino(state, goal, amino);
    if (!result.ok) { announce(L('dn.aminoWrong', { codon: result.codon, name: tx(data.AMINO[amino]) }), 'warn'); return; }
    announce(amino === 'STOP' ? L('dn.stopPlaced') : L('dn.aminoPlaced', { name: tx(data.AMINO[amino]) }), 'good');
  }
  function pickEffect(effect) {
    if (effect !== sim.mutationEffect(goal.original, goal.changed)) { announce(L('dn.effectWrong'), 'warn'); return; }
    state.effect = effect; announce(L('dn.effectRight'), 'good');
  }
  function showNext() {
    action(() => {
      flyt.useHint();
      if (goal.type === 'parts') pickPart(goal.parts.find(p => !state.parts.includes(p)));
      else if (!state.opened) { state.opened = true; announce(L('dn.opened'), 'good'); }
      else if (state.rows.length) pickBase(sim.expectedRows(goal)[state.activeRow][state.active]);
      else if (!state.stopped) pickAmino(sim.CODE[sim.translationSteps(goal)[state.peptide.length]]);
      else pickEffect(sim.mutationEffect(goal.original, goal.changed));
    }, 'show-next');
  }
  function supportText() {
    if (goal.type === 'parts') return L('dn.partReady');
    if (!state.opened) return L('dn.openFirst');
    if (state.rows.length) {
      const r = state.activeRow, i = state.active;
      if (i < 0) return L('dn.allFilled');
      const template = goal.type === 'replicate' && r === 1 ? sim.complement(goal.template)[i] : goal.template[i];
      return `${L('dn.position', { n: i + 1, base: template })}. ${goal.type === 'transcribe' ? 'T → A · A → U · C → G · G → C' : 'A ↔ T · C ↔ G'}`;
    }
    if (!state.stopped) return L('dn.codon', { codon: sim.translationSteps(goal)[state.peptide.length] });
    return L('dn.compare');
  }
  function heading(text) { return el('h2', 'mv-label dn-heading', text); }
  function sequence(parent, name, bases, from, to, options = {}) {
    const row = el('div', 'dn-sequence'); row.append(el('p', 'dn-seq-name', name));
    const track = el('div', 'dn-track'); track.setAttribute('aria-label', `${name}. ${L('dn.direction', { from, to })}`);
    track.append(el('span', 'dn-end', from));
    [...bases].forEach((b, i) => {
      const isSlot = options.row !== undefined;
      const active = isSlot && state.activeRow === options.row && state.active === i && !b;
      const node = isSlot ? button(b || '·', `slot-${options.row}-${i}`, () => {
        if (flyt.busy || b || !state.opened) return;
        state.activeRow = options.row; state.active = i; render();
        work.querySelector(`[data-k="slot-${options.row}-${i}"]`)?.focus({ preventScroll: true });
      }, 'dn-base dn-slot' + (active ? ' is-active' : '')) : el('span', 'dn-base', b);
      if (b) node.dataset.base = b;
      if (options.mutations?.includes(i)) node.classList.add('is-mutated');
      if (options.current !== undefined && Math.floor(i / 3) === options.current) node.classList.add('is-reading');
      if (isSlot) {
        node.disabled = !!b || flyt.busy || !state.opened;
        node.setAttribute('aria-pressed', String(active));
        node.setAttribute('aria-label', L('dn.position', { n: i + 1, base: b || L('dn.blank') }));
      }
      track.append(node);
      if (options.codons && i % 3 === 2 && i < bases.length - 1) track.append(el('span', 'dn-codon-gap'));
    });
    track.append(el('span', 'dn-end', to)); row.append(track); parent.append(row);
  }
  function renderRows() {
    if (goal.type === 'replicate' && !state.opened) {
      work.append(el('p', 'dn-note', L('dn.openFirst')),
        button(L('dn.open'), 'open', () => action(() => { state.opened = true; announce(L('dn.opened'), 'good'); }, 'base-A'), 'mv-btn--primary'));
      return;
    }
    const rows = sim.expectedRows(goal);
    for (let r = 0; r < rows.length; r++) {
      const box = el('div', 'dn-duplex');
      if (goal.type === 'replicate') box.append(el('h3', 'dn-copy-title', L('dn.copy', { n: r + 1 })));
      const reverse = goal.type === 'transcribe' || (goal.type === 'replicate' && r === 1);
      const template = goal.type === 'replicate' && r === 1 ? sim.complement(goal.template) : goal.template;
      sequence(box, L(goal.type === 'transcribe' ? 'dn.template' : goal.type === 'replicate' ? 'dn.old' : 'dn.dna'), template, reverse ? '3′' : '5′', reverse ? '5′' : '3′');
      sequence(box, L(goal.type === 'transcribe' ? 'dn.rna' : 'dn.new'), state.rows[r], reverse ? '5′' : '3′', reverse ? '3′' : '5′', { row: r });
      work.append(box);
    }
    work.append(heading(L('dn.bases')));
    const tray = el('div', 'dn-tray');
    // T remains as a distractor during transcription, with a specific explanation.
    for (const b of goal.type === 'transcribe' ? ['A', 'U', 'C', 'G', 'T'] : sim.DNA) {
      const choice = button('', `base-${b}`, () => action(() => pickBase(b), `base-${b}`), 'dn-base-choice');
      const letter = el('span', 'dn-base', b); letter.dataset.base = b;
      choice.append(letter, el('span', 'dn-choice-name', tx(data.BASES[b].name))); choice.disabled = flyt.busy || state.active < 0;
      tray.append(choice);
    }
    work.append(tray);
  }
  function renderProtein() {
    let rna = goal.rna;
    if (goal.type === 'mutation') {
      const changes = [...goal.changed].map((b, i) => b !== goal.original[i] ? i : -1).filter(i => i >= 0);
      sequence(work, L('dn.original') + ' · ' + L('dn.coding'), goal.original, '5′', '3′', { codons: true });
      sequence(work, L('dn.changed') + ' · ' + L('dn.coding'), goal.changed, '5′', '3′', { codons: true, mutations: changes });
      const old = el('p', 'dn-old-chain', `${L('dn.oldChain')}: ${sim.translate(sim.codingToRNA(goal.original)).peptide.join(' — ')} · ${tx(data.AMINO.STOP)}`);
      work.append(old); rna = sim.codingToRNA(goal.changed);
    }
    sequence(work, L('dn.rna'), rna, '5′', '3′', { codons: true, current: state.stopped ? -1 : state.peptide.length });
    work.append(heading(L('dn.chain')));
    const chain = el('div', 'dn-chain'); chain.setAttribute('aria-label', L('dn.chain'));
    state.peptide.forEach((aa, i) => {
      if (i) chain.append(el('span', 'dn-chain-link', '—'));
      chain.append(el('span', 'dn-amino-bead', aa));
    });
    if (state.stopped) chain.append(el('span', 'dn-stop', L('dn.stopPlaced').split('!')[0]));
    if (!state.peptide.length) chain.append(el('p', 'dn-note', L('dn.emptyChain')));
    work.append(chain);
    if (!state.stopped) {
      work.append(el('p', 'dn-reading', L('dn.codon', { codon: sim.translationSteps(goal)[state.peptide.length] })));
      const tray = el('div', 'dn-tray dn-aa-tray');
      for (const aa of goal.tray) {
        const b = button(tx(data.AMINO[aa]), `aa-${aa}`, () => action(() => pickAmino(aa), `aa-${aa}`), aa === 'STOP' ? 'dn-stop-choice' : '');
        b.disabled = flyt.busy; tray.append(b);
      }
      work.append(tray);
    } else if (goal.type === 'mutation') {
      work.append(heading(L('dn.compare')));
      const tray = el('div', 'dn-effect-tray');
      for (const [key, text] of Object.entries(data.EFFECTS)) {
        const b = button(tx(text), `effect-${key}`, () => action(() => pickEffect(key), `effect-${key}`));
        b.disabled = flyt.busy || !!state.effect; b.classList.toggle('is-correct', state.effect === key); tray.append(b);
      }
      work.append(tray);
    }
  }
  function renderSide() {
    side.replaceChildren();
    if (goal.type === 'translate' || goal.type === 'mutation') {
      side.append(heading(L('dn.codonCard')), el('p', 'dn-note', L('dn.codonNote')));
      const rna = goal.type === 'mutation' ? sim.codingToRNA(goal.changed) : goal.rna;
      const all = new Set(sim.codons(rna));
      if (goal.type === 'mutation') sim.codons(sim.codingToRNA(goal.original)).forEach(c => all.add(c));
      const table = el('dl', 'dn-code');
      for (const c of all) {
        const row = el('div', 'dn-code-row');
        if (!state.stopped && c === sim.translationSteps(goal)[state.peptide.length]) row.classList.add('is-current');
        row.append(el('dt', '', c), el('dd', '', tx(data.AMINO[sim.CODE[c]]))); table.append(row);
      }
      side.append(table);
    } else {
      side.append(heading(goal.type === 'parts' ? L('dn.parts') : L('dn.bases')));
      const legend = el('div', 'dn-legend');
      for (const b of (goal.type === 'transcribe' ? sim.RNA : sim.DNA)) {
        const line = el('div', 'dn-legend-item'), letter = el('span', 'dn-base', b); letter.dataset.base = b;
        line.append(letter, el('span', '', tx(data.BASES[b].name))); legend.append(line);
      }
      side.append(legend);
      if (goal.type !== 'parts') side.append(el('p', 'dn-rule', goal.type === 'transcribe' ? 'DNA → RNA\nA → U · T → A\nC → G · G → C' : 'A ↔ T   ·   C ↔ G'));
    }
    if (flyt.state.support && !sim.status(state, goal).done) {
      const support = el('div', 'dn-support'); support.append(heading(L('dn.support')), el('p', 'dn-note', supportText()));
      const b = button(L('dn.show'), 'show-next', showNext); b.disabled = flyt.busy; support.append(b); side.append(support);
    }
    const model = el('details', 'dn-model');
    model.append(el('summary', '', L('dn.model')), el('p', 'dn-note', L('dn.modelNote')));
    if (goal.type === 'replicate') model.append(el('p', 'dn-note', L('dn.replicationNote')));
    const sources = el('div', 'dn-sources'); sources.append(el('p', 'mv-label', L('dn.sources')));
    for (const source of data.SOURCES) {
      const a = el('a', '', source.title); a.href = source.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; sources.append(a);
    }
    model.append(sources); side.append(model);
  }
  function render() {
    if (!state) return;
    const progress = sim.status(state, goal); work.replaceChildren();
    const header = el('div', 'dn-work-head'); header.append(heading(L('dn.workspace')), el('span', 'dn-progress', L('dn.progress', progress))); work.append(header);
    if (goal.type === 'parts') {
      const tray = el('div', 'dn-tray dn-parts-tray');
      for (const p of goal.tray) {
        const b = button((state.parts.includes(p) ? '✓ ' : '') + tx(data.PARTS[p]), `part-${p}`, () => action(() => pickPart(p), `part-${p}`), state.parts.includes(p) ? 'is-correct' : '');
        b.disabled = flyt.busy || state.parts.includes(p); tray.append(b);
      }
      work.append(tray);
    } else if (state.rows.length) renderRows();
    else renderProtein();
    const note = el('p', 'dn-feedback' + (messageKind ? ' is-' + messageKind : ''), message || supportText());
    work.append(note);
    const footer = el('div', 'dn-work-foot');
    const finish = button(L(progress.done ? 'dn.finish' : 'dn.check'), 'finish', () => {
      if (flyt.busy) return;
      const s = sim.status(state, goal);
      if (!s.done) { announce(L('dn.more', s), 'warn'); render(); work.querySelector('[data-k="finish"]')?.focus({ preventScroll: true }); return; }
      flyt.complete({ headline: TEXT['dn.done'], molecule: { name: level.title, formula: goal.type === 'translate' || goal.type === 'mutation' ? state.peptide.join(' — ') : 'DNA', fact: null } });
    }, progress.done ? 'mv-btn--primary' : 'mv-btn--ghost'); finish.disabled = flyt.busy;
    footer.append(finish); work.append(footer); renderSide(); view?.setState(state);
    work.setAttribute('aria-label', L('dn.workspace'));
    requestAnimationFrame(fitStage);
  }
  return { ui, enterLevel, reset, render, play: render, leaveLevel() { message = ''; } };
}
