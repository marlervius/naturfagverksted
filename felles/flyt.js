// Naturfagverkstedet – felles spillflyt for verkstedene (lagring, læringsløp, tenk-først, stjerner,
// opplåsing, testsperrer, gjenopptak, lærersnarvei og hot-reload). Samme flyt som i reaksjon/js/main.js,
// trukket ut slik at et verksted bare leverer data, UI og tre kroker.
//
// Bruk:
//   startFlyt({
//     key: 'celleverkstedet.v1', epoch: 1,
//     data: async () => ({ LEVELS, TESTS, TEST_DRAW, TEST_PASS, STRINGS, t }),
//     setup: async (flyt) => ({ ui, enterLevel(level, i) {}, leaveLevel(level) {}, reset() {} }),
//   });
// ui lages i setup med createUI({ …, handlers: { ...flyt.handlers, …egne } }).
// Valgfrie kroker i tillegg: render() (etter språk-/støttebytte), play(level) (etter tenk-først),
// onSupport(on), hint(level) → tekst, extraState(saved) → egne lagrede felt.
// Verkstedet melder fra med flyt.complete({ headline, molecule, extra }) når oppdraget er løst,
// og med flyt.useHint() når eleven har fått hjelp som skal koste en stjerne.

const reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

export function startFlyt(cfg) {
  const go = (hot) => boot(cfg, hot || {});
  if (window.claude?.hot?.ready) window.claude.hot.ready(go); else go(window.claude?.hot?.data ?? {});
}

async function boot(cfg, hot) {
  const { key, epoch = 1, oldKeys = [] } = cfg;
  const TEACHER = location.hash === '#alle';
  const bootEl = document.getElementById('boot'), bootMsg = document.getElementById('boot-msg');
  const fail = (err) => {
    console.error(err);
    if (bootEl) bootEl.classList.remove('gone');
    if (bootMsg) bootMsg.textContent = cfg.failText || 'Spillet kunne ikke starte. 3D-biblioteket ble ikke lastet, eller nettleseren mangler WebGL. Prøv å laste siden på nytt i Chrome eller Edge.';
  };

  // ---------- lagring ----------
  const load = () => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (_) { return {}; } };
  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) { /* uten lagring virker spillet likevel */ } };
  for (const k of oldKeys) { try { localStorage.removeItem(k); } catch (_) { /* ok */ } }
  const stored = load();
  // Ny epoke = gammel fremgang gjelder ikke. Hot-reload tar med tilstanden fra samme epoke.
  const saved = Object.assign(stored.epoch === epoch ? stored : {}, hot && hot.epoch === epoch ? hot : {});
  const state = {
    epoch, lang: saved.lang === 'fag' ? 'fag' : 'enkel', passed: saved.passed || {},
    path: saved.path === 'teori' || saved.path === 'start' ? saved.path : null,
    stars: saved.stars || {}, unlocked: Math.max(1, saved.unlocked || 1),
    support: !!saved.support, level: Number.isInteger(saved.level) ? saved.level : null, helped: !!saved.helped,
    ...(cfg.extraState ? cfg.extraState(saved) : {}),
  };
  window.claude?.hot?.snapshot?.(() => state);

  let D, hooks;
  try { D = await cfg.data(); } catch (err) { return fail(err); }
  const { LEVELS, TESTS = [], TEST_DRAW = 6, TEST_PASS = 5, STRINGS, t } = D;
  if (TEACHER) state.unlocked = LEVELS.length; // lærersnarvei: alle nivåer åpne, ingen testsperre

  // ---------- tekst ----------
  const fillStr = (s, vars) => {
    let out = String(s ?? ''); for (const k in vars || {}) out = out.split('{' + k + '}').join(vars[k]);
    return out.charAt(0).toUpperCase() + out.slice(1);
  };
  const L = (k, vars) => fillStr(t(STRINGS[k], state.lang), vars);
  const tx = (x) => t(x, state.lang);

  // ---------- oppdragstilstand ----------
  let current = -1, level = null, token = 0, busy = false, hintUsed = false, predictRight = true;
  const progress = () => ({ index: current, total: LEVELS.length, stars: state.stars, unlocked: state.unlocked });

  const idxOf = (id) => LEVELS.findIndex((l) => l.id === id);
  const blocks = TESTS.map((x, n) => ({ ...x, n: n + 1, a: idxOf(x.from), b: idxOf(x.after) })).filter((x) => x.a >= 0 && x.b >= 0);
  const cap = () => { if (TEACHER) return LEVELS.length; const g = blocks.find((x) => !state.passed[x.id]); return g ? g.b + 1 : LEVELS.length; };
  const pendingTest = () => TEACHER ? null : blocks.find((x) => !state.passed[x.id] && state.stars[LEVELS[x.b].id]) || null;
  const testLabel = (x) => ({ enkel: fillStr(t(STRINGS['ui.testTake'], 'enkel'), { n: x.n }), fag: fillStr(t(STRINGS['ui.testTake'], 'fag'), { n: x.n }) });
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const unlockTo = (n) => { state.unlocked = Math.max(1, Math.min(LEVELS.length, cap(), n)); };
  const firstOfChapter = (i) => i === 0 || t(LEVELS[i - 1].chapter, 'fag') !== t(LEVELS[i].chapter, 'fag');
  const refreshTest = () => { const p = pendingTest(); flyt.ui.setTest(p ? testLabel(p) : null); };
  const render = () => hooks && hooks.render && hooks.render();

  // ---------- tenk-først: ekstra støtte gir tre alternativer i stedet for fire ----------
  function easier(lv) {
    const p = lv.predict; if (!p || p.options.length <= 3) return lv;
    const wrong = p.options.map((_, k) => k).filter((k) => k !== p.correct);
    const drop = wrong[(lv.id.charCodeAt(lv.id.length - 1) + p.options.length) % wrong.length];
    const keep = p.options.map((_, k) => k).filter((k) => k !== drop);
    return { ...lv, predict: { ...p, options: keep.map((k) => p.options[k]), correct: keep.indexOf(p.correct) } };
  }

  async function startLevel(i, quiet) {
    if (i < 0 || i >= LEVELS.length) return;
    const my = ++token;
    if (level && hooks.leaveLevel) hooks.leaveLevel(level);
    current = i; level = LEVELS[i]; state.level = i; save();
    hintUsed = false; predictRight = true; busy = true;
    flyt.ui.setLevel(level, progress());
    hooks.enterLevel(level, i);
    render();
    // «Vi starter her»: første oppdrag i hvert kapittel er prøv-og-se; senere spørsmål er gjetting uten stjernetap
    const explore = state.path !== 'teori';
    const right = quiet || (explore && firstOfChapter(i)) ? true : await flyt.ui.predict(state.support ? easier(level) : level, { guess: explore || state.support });
    if (my !== token) return;
    predictRight = explore || state.support ? true : right !== false; busy = false;
    render();
    if (hooks.play) hooks.play(level);
    if (!quiet && !state.helped) { state.helped = true; save(); flyt.ui.showHelp(); }
  }

  async function complete({ headline, molecule, extra, nextLabel } = {}) {
    if (busy || !level) return;
    busy = true; const my = token, lv = level, idx = current;
    const stars = 1 + (predictRight ? 1 : 0) + (hintUsed ? 0 : 1);
    state.stars[lv.id] = Math.max(state.stars[lv.id] || 0, stars);
    unlockTo(Math.max(state.unlocked, idx + 2)); save();
    flyt.ui.setLevel(lv, progress()); refreshTest(); render();
    const gate = TEACHER ? null : blocks.find((x) => x.b === idx && !state.passed[x.id]);
    const choice = await flyt.ui.success({ level: lv, stars, headline, molecule, extra, nextLabel: gate ? testLabel(gate) : nextLabel || null });
    if (my !== token) return;
    busy = false; render();
    if (choice === 'next' && gate) return runTest(gate);
    if (choice === 'next') {
      if (idx + 1 < LEVELS.length) startLevel(idx + 1);
      else flyt.ui.toast(L('ui.done'), 'good');
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
    const res = await flyt.ui.quiz({ title: x.title, questions, need: Math.min(TEST_PASS, questions.length), offer: state.support ? null : STRINGS['ui.testSupport'] });
    if (my !== token) return;
    busy = false;
    if (!res) { refreshTest(); render(); return; }
    if (res.passed) {
      state.passed[x.id] = true; unlockTo(Math.max(state.unlocked, x.b + 2)); save(); refreshTest();
      if (x.b + 1 < LEVELS.length) startLevel(x.b + 1); else flyt.ui.toast(L('ui.done'), 'good');
    } else {
      if (res.support) setSupportMode(true, true);
      for (let k = x.a; k <= x.b; k++) delete state.stars[LEVELS[k].id];
      state.unlocked = x.a + 1; save(); refreshTest(); startLevel(x.a);
    }
  }

  function setSupportMode(on, announce) {
    state.support = !!on; save(); flyt.ui.setSupport(state.support);
    if (state.support && state.lang !== 'enkel') { state.lang = 'enkel'; save(); flyt.ui.setLang('enkel'); }
    if (hooks.onSupport) hooks.onSupport(state.support);
    render();
    if (announce) flyt.ui.toast(L(state.support ? 'ui.supportOnToast' : 'ui.supportOffToast'), state.support ? 'good' : 'info');
  }

  async function choosePath() {
    const my = ++token; busy = true;
    const pick = await flyt.ui.choose({ title: STRINGS['ui.pathTitle'], options: [
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

  // ---------- det verkstedet får ----------
  const flyt = {
    state, save, L, tx, fillStr, TEACHER, LEVELS, data: D,
    reduced: reducedMotion,
    wait: (ms) => new Promise((r) => setTimeout(r, reducedMotion() ? ms * 0.4 : ms)),
    get level() { return level; }, get index() { return current; }, get busy() { return busy; }, set busy(v) { busy = !!v; },
    get token() { return token; }, get hintUsed() { return hintUsed; }, get predictRight() { return predictRight; },
    alive: (my) => my === token,
    useHint() { hintUsed = true; },
    complete, go: startLevel, runTest, setSupportMode, choosePath, blocks, pendingTest, refreshTest,
    ui: null,
    handlers: {
      onLang(lang) { state.lang = lang === 'fag' ? 'fag' : 'enkel'; save(); flyt.ui.setLang(state.lang); render(); },
      onSupport() { setSupportMode(!state.support, true); },
      onHint() { if (!level) return; hintUsed = true; flyt.ui.showHint(hooks.hint ? hooks.hint(level) : tx(level.hint)); },
      onReset() { if (!busy && level) { hooks.reset(); render(); } },
      onLevel(id) { const i = idxOf(id); if (i >= 0 && i < state.unlocked) startLevel(i); },
      onPath() { if (!busy) choosePath(); },
      onTest() { const p = pendingTest(); if (p && !busy) runTest(p); },
    },
  };

  try {
    hooks = await cfg.setup(flyt);
    flyt.ui = hooks.ui;
  } catch (err) { return fail(err); }

  refreshTest(); flyt.ui.setSupport(state.support); if (hooks.onSupport) hooks.onSupport(state.support);
  flyt.ui.setLevel(LEVELS[0], progress());
  if (bootEl) bootEl.classList.add('gone');
  if (!state.path) choosePath(); else resume();
  return flyt;
}
