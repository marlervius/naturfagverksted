// Celleverkstedet – små håndtegnede SVG-ikoner til brett, merkevare og hjelp. Navnet står alltid ved siden av.
const NS = 'http://www.w3.org/2000/svg';
export function svg(inner, cls = 'ce-ico', box = '0 0 40 40') {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', box); s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
  s.innerHTML = inner; return s;
}

const ORG = {
  membran: '<ellipse cx="20" cy="20" rx="16" ry="13" class="o-line" stroke-dasharray="3 2.2"/><ellipse cx="20" cy="20" rx="13" ry="10" class="o-line o-faint"/>',
  kjerne: '<circle cx="20" cy="20" r="13" class="o-fill" style="--c:#7f78e6"/><circle cx="23" cy="18" r="4.6" class="o-solid" style="--c:#4b3fa8"/><circle cx="9" cy="16" r="1.4" class="o-dot"/><circle cx="14" cy="31" r="1.4" class="o-dot"/><circle cx="31" cy="27" r="1.4" class="o-dot"/>',
  mitokondrie: '<rect x="5" y="12" width="30" height="16" rx="8" class="o-fill" style="--c:#ff9a6b"/><path d="M10 28V19M15 12v9M20 28v-9M25 12v9M30 28v-9" class="o-line" style="--c:#ffcfb0"/>',
  ribosom: '<circle cx="12" cy="14" r="3" class="o-solid" style="--c:#e9f5b0"/><circle cx="25" cy="11" r="3" class="o-solid" style="--c:#e9f5b0"/><circle cx="18" cy="24" r="3" class="o-solid" style="--c:#e9f5b0"/><circle cx="29" cy="27" r="3" class="o-solid" style="--c:#e9f5b0"/><circle cx="10" cy="31" r="2.4" class="o-solid" style="--c:#e9f5b0"/>',
  er: '<path d="M6 30c3-14 9-21 24-23M9 33c3-12 9-19 23-21M12 36c3-10 9-16 22-18" class="o-line" style="--c:#56c4b2"/><circle cx="14" cy="21" r="1.3" class="o-dot"/><circle cx="20" cy="15" r="1.3" class="o-dot"/><circle cx="27" cy="11" r="1.3" class="o-dot"/>',
  golgi: '<path d="M7 13q13 6 26 0M8 19q12 6 24 0M9 25q11 6 22 0M11 31q9 5 18 0" class="o-line o-thick" style="--c:#f0a3d0"/><circle cx="35" cy="9" r="2" class="o-solid" style="--c:#f7c4e2"/><circle cx="5" cy="9" r="1.6" class="o-solid" style="--c:#f7c4e2"/>',
  lysosom: '<circle cx="20" cy="20" r="11" class="o-fill" style="--c:#c38bff"/><path d="M15 17l2 2M22 14l1 2M24 23l2 1M16 24l1 2M20 20l1 1" class="o-line o-thick" style="--c:#7a3fd1"/>',
  cellevegg: '<rect x="4" y="6" width="32" height="28" rx="5" class="o-line o-thick" style="--c:#a6e07a"/><rect x="8" y="10" width="24" height="20" rx="3" class="o-line o-faint"/>',
  kloroplast: '<ellipse cx="20" cy="20" rx="16" ry="9" class="o-fill" style="--c:#4fbf63"/><path d="M11 17v6M13 17v6M19 16v8M21 16v8M27 17v6M29 17v6" class="o-line" style="--c:#2f9c48"/><path d="M13 20h6M21 20h6" class="o-line o-faint"/>',
  vakuole: '<path d="M8 21c0-9 7-14 14-13s12 6 11 13-6 12-14 12S8 29 8 21z" class="o-fill" style="--c:#6fb6ff"/><path d="M14 18c2-3 5-4 8-4" class="o-line o-faint"/>',
  arvestoff: '<path d="M9 22c0-8 8-12 13-10s9 8 4 13-13 6-14 0 6-10 11-7 3 9-2 9" class="o-line o-thick" style="--c:#ffae8a"/>',
  flagell: '<rect x="3" y="15" width="16" height="10" rx="5" class="o-fill" style="--c:#9fe6ea"/><path d="M19 20c3-5 5 5 8 0s5 5 8 0" class="o-line o-thick" style="--c:#cfe7a8"/>',
};
export const organelleIcon = (id) => svg(ORG[id] || '<circle cx="20" cy="20" r="10" class="o-fill"/>');

// stoffene: samme former som i 3D (to kuler, tre på rad, V, sekskant, ion …)
const SUBI = {
  o2: '<circle cx="15" cy="20" r="6.5" class="o-solid" style="--c:#ff8a80"/><circle cx="25" cy="20" r="6.5" class="o-solid" style="--c:#ff8a80"/>',
  co2: '<circle cx="9" cy="20" r="5" class="o-solid" style="--c:#ff8a80"/><circle cx="20" cy="20" r="6" class="o-solid" style="--c:#56636a"/><circle cx="31" cy="20" r="5" class="o-solid" style="--c:#ff8a80"/>',
  h2o: '<circle cx="20" cy="17" r="7" class="o-solid" style="--c:#4fa8ff"/><circle cx="12" cy="25" r="4" class="o-solid" style="--c:#f2fbff"/><circle cx="28" cy="25" r="4" class="o-solid" style="--c:#f2fbff"/>',
  glukose: '<path d="M20 8l10 6v12l-10 6-10-6V14z" class="o-line o-thick" style="--c:#ffc59a"/>',
  na: '<path d="M20 9l10 7-4 12H14l-4-12z" class="o-solid" style="--c:#b49cff"/><path d="M20 15v8M16 19h8" class="o-line" style="--c:#06141b"/>',
  k: '<path d="M20 6l12 14-12 14L8 20z" class="o-solid" style="--c:#ff9ad5"/><path d="M20 16v8M16 20h8" class="o-line" style="--c:#06141b"/>',
  protein: '<path d="M10 22c-2-8 6-14 12-12s10 4 8 11-4 11-11 10-8-3-9-9z" class="o-solid" style="--c:#6fd6b0"/>',
  atp: '<circle cx="11" cy="20" r="5" class="o-solid" style="--c:#ffd76a"/><circle cx="20" cy="20" r="3" class="o-solid" style="--c:#ffd76a"/><circle cx="26" cy="20" r="3" class="o-solid" style="--c:#ffd76a"/><circle cx="32" cy="20" r="3" class="o-solid" style="--c:#ffd76a"/>',
};
export const substanceIcon = (id) => svg(SUBI[id] || '<circle cx="20" cy="20" r="7" class="o-solid"/>');
export const sunIcon = () => svg('<circle cx="20" cy="20" r="7" class="o-solid" style="--c:#ffd76a"/><path d="M20 4v5M20 31v5M4 20h5M31 20h5M8.7 8.7l3.5 3.5M27.8 27.8l3.5 3.5M8.7 31.3l3.5-3.5M27.8 12.2l3.5-3.5" class="o-line o-thick" style="--c:#ffd76a"/>');
const PROT = {
  kanal: '<rect x="11" y="6" width="5" height="28" rx="2.5" class="o-solid" style="--c:#8d7fe8"/><rect x="24" y="6" width="5" height="28" rx="2.5" class="o-solid" style="--c:#8d7fe8"/><path d="M20 9v22" class="o-line" stroke-dasharray="2 3"/>',
  baerer: '<path d="M8 8c6 0 10 4 10 12s-4 12-10 12z" class="o-solid" style="--c:#8d7fe8"/><path d="M32 8c-6 0-10 4-10 12s4 12 10 12z" class="o-solid" style="--c:#8d7fe8"/>',
  pumpe: '<rect x="10" y="7" width="20" height="26" rx="6" class="o-solid" style="--c:#8d7fe8"/><circle cx="20" cy="29" r="3" class="o-solid" style="--c:#ffd76a"/>',
};
export const proteinIcon = (p) => {
  const s = svg(PROT[p.type] || PROT.kanal);
  if (p.type === 'pumpe') s.insertAdjacentHTML('beforeend', p.dir === 'ut' ? '<path d="M20 22V12M16 15l4-4 4 4" class="o-line o-thick" style="--c:#06141b"/>' : '<path d="M20 11v10M16 18l4 4 4-4" class="o-line o-thick" style="--c:#06141b"/>');
  return s;
};

/** Merkevare: en celle med kjerne (erstatter atom-glyfen). */
export const glyph = () => svg('<ellipse cx="16" cy="16" rx="13" ry="10.5" class="g-cell"/><circle cx="13.5" cy="15" r="4.5" class="g-core"/><circle cx="23.5" cy="20" r="1.8" class="g-dot"/>', 'mv-glyph ce-glyph', '0 0 32 32');

/** Fire tegninger til hjelpen (samme rekkefølge som ui.howto1–4). */
export function helpArt(i) {
  const art = [
    '<rect x="4" y="30" width="56" height="14" rx="3" class="a-cell"/><rect x="8" y="33" width="12" height="8" rx="2" class="a-hot"/><rect x="24" y="33" width="12" height="8" rx="2" class="a-cell"/><path class="a-cursor" d="M14 18l0 18 4.5-4.5 3.6 7.2 2.7-1.4-3.6-7.2 6.3 0z"/>',
    '<ellipse cx="30" cy="24" rx="24" ry="17" class="a-atom"/><circle cx="24" cy="22" r="7" class="a-hot"/><path class="a-cursor" d="M36 26l0 16 4-4 3.2 6.4 2.4-1.2-3.2-6.4 5.6 0z"/>',
    '<path class="a-line" d="M8 14l4 4 7-8M8 32l4 4 7-8"/><path class="a-line" d="M26 14h30M26 32h22"/>',
    '<path class="a-line" d="M14 30a18 10 0 1 0 6-14"/><path class="a-line" d="M15 10l5.5 6-7 2.5"/><rect x="42" y="12" width="14" height="24" rx="7" class="a-atom"/><path class="a-line" d="M49 17v5"/>',
  ][i] || '';
  return svg(art, 'mv-help-art', '0 0 64 48');
}
