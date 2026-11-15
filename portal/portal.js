import { VERKSTEDER } from '../verksteder.js';

const S = (inner) => `<svg class="art" viewBox="0 0 200 120" aria-hidden="true" focusable="false">${inner}</svg>`;

// Håndlagde motiver, ett per verksted.
const ART = {
  molekyl: S(`
    <path class="s" d="M100 60 L58 36 M100 60 L142 36 M100 60 L100 98"/>
    <circle class="f" cx="100" cy="60" r="17"/><circle class="f" cx="56" cy="35" r="11"/>
    <circle class="f" cx="144" cy="35" r="11"/><circle class="f" cx="100" cy="100" r="11"/>
    <circle class="yf" cx="78" cy="48" r="3.5"/><circle class="yf" cx="122" cy="48" r="3.5"/><circle class="yf" cx="100" cy="82" r="3.5"/>`),
  reaksjon: S(`
    <path class="s" d="M44 55 L48 62"/>
    <circle class="f" cx="34" cy="48" r="12"/><circle class="f" cx="54" cy="70" r="9"/>
    <path class="s y" d="M82 60 H122 M110 48 L122 60 L110 72"/>
    <path class="s" d="M158 49 L164 55 M164 69 L157 76"/>
    <circle class="f" cx="152" cy="42" r="10"/><circle class="f" cx="172" cy="62" r="10"/><circle class="f" cx="150" cy="82" r="10"/>`),
  celle: S(`
    <ellipse class="f" cx="100" cy="60" rx="64" ry="44"/>
    <circle class="f" cx="92" cy="56" r="17"/><circle class="yf" cx="96" cy="60" r="5"/>
    <path class="s" d="M130 40 q8 4 4 12 M60 80 q10 6 18 0"/>
    <circle class="yf" cx="30" cy="26" r="3.5"/><circle class="yf" cx="20" cy="46" r="3.5"/>
    <path class="s y" d="M38 32 L50 40" stroke-dasharray="1 6"/>`),
  dna: S(`
    <path class="s y" d="M82 24 H118 M72 36 H128 M80 76 H120 M70 90 H130"/>
    <path class="s" d="M50 12 C150 30 150 42 50 60 S-10 90 50 108"/>
    <path class="s" d="M150 12 C50 30 50 42 150 60 S210 90 150 108"/>`),
  energi: S(`
    <circle class="yf" cx="34" cy="38" r="14"/>
    <path class="s y" d="M34 14 v-6 M34 62 v6 M10 38 h-6 M58 38 h6 M17 21 l-4 -4 M51 55 l4 4 M17 55 l-4 4 M51 21 l4 -4"/>
    <path class="s y" d="M70 62 H112 M102 52 L112 62 L102 72"/>
    <path class="s" d="M150 78 V90 H170 V78 C184 66 180 40 160 40 C140 40 136 66 150 78 Z M152 98 H168"/>`),
  straling: S(`
    <ellipse class="s" cx="46" cy="60" rx="32" ry="12" transform="rotate(30 46 60)"/>
    <ellipse class="s" cx="46" cy="60" rx="32" ry="12" transform="rotate(-30 46 60)"/>
    <circle class="f" cx="46" cy="60" r="10"/><circle class="yf" cx="43" cy="57" r="3.5"/><circle class="f" cx="50" cy="64" r="3.5"/>
    <path class="s y" d="M100 60 q10 -22 20 0 t20 0 t20 0 t20 0"/>`),
  okosystem: S(`
    <path class="s" d="M100 28 L50 62 M100 28 L150 62 M50 62 L34 96 M50 62 L72 96 M150 62 L128 96 M150 62 L168 96"/>
    <circle class="f" cx="100" cy="26" r="13"/><circle class="f" cx="50" cy="62" r="11"/><circle class="f" cx="150" cy="62" r="11"/>
    <circle class="yf" cx="34" cy="98" r="8"/><circle class="yf" cx="72" cy="98" r="8"/>
    <circle class="yf" cx="128" cy="98" r="8"/><circle class="yf" cx="168" cy="98" r="8"/>`),
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function readSaved(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : null;
  } catch { return null; }
}

async function loadLevels(v) {
  try {
    const mod = await import(new URL(v.data, document.baseURI).href);
    return Array.isArray(mod.LEVELS) ? mod.LEVELS : null;
  } catch { return null; }
}

function bodyHtml(v) {
  return `<div class="body"><h3>${esc(v.title)}</h3><p class="tag">${esc(v.tagline)}</p>
    <ul class="topics">${v.topics.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
}

function card(v) {
  const li = document.createElement('li');
  const art = ART[v.id] || '';
  if (v.status !== 'klar') {
    li.innerHTML = `<div class="card soon">${art}${bodyHtml(v)}<span class="badge">Kommer</span></div></div>`;
    return { li };
  }
  li.innerHTML = `<a class="card" href="${esc(v.href)}">${art}${bodyHtml(v)}
    <div class="prog"><span class="cta">Åpne</span></div></div></a>`;
  return { li, prog: li.querySelector('.prog'), v };
}

async function fillProgress({ prog, v }) {
  const saved = readSaved(v.storageKey);
  const levels = await loadLevels(v);
  const stars = saved && saved.stars && typeof saved.stars === 'object' ? saved.stars : {};
  const ids = levels ? levels.map((l) => l && l.id).filter((x) => x != null) : [];
  const earned = (id) => { const n = Number(stars[id]); return n >= 1 ? Math.min(3, Math.floor(n)) : 0; };
  const keys = ids.length ? ids : Object.keys(stars);
  const done = keys.filter((k) => earned(k) > 0).length;
  const total = levels ? levels.length : null;
  if (done === 0) {
    prog.innerHTML = '<span class="cta">Start</span>';
    return;
  }
  const sum = keys.reduce((a, k) => a + earned(k), 0);
  const label = total ? `${done} av ${total} oppdrag` : `${done} oppdrag`;
  const starTxt = total ? `${sum} av ${total * 3} stjerner` : `${sum} stjerner`;
  const pct = total ? Math.round((done / total) * 100) : 0;
  prog.innerHTML = `<div class="prog-row"><span class="n">${label}</span><span class="stars" aria-label="${starTxt}">★ ${sum}${total ? '/' + total * 3 : ''}</span></div>
    ${total ? `<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}" aria-label="Fremgang"><b style="width:${pct}%"></b></div>` : ''}
    <span class="cta">Fortsett</span>`;
}

const grid = document.getElementById('grid');
for (const v of VERKSTEDER) {
  const c = card(v);
  grid.appendChild(c.li);
  if (c.prog) fillProgress(c).catch(() => {});
}
