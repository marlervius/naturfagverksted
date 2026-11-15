// Reaksjonsverkstedet – ren reaksjonslogikk. Ingen DOM, ingen three.
// Bygger på World fra ../../molekyl/js/chem.js og molekylkatalogen fra ../../molekyl/js/data.js.
//
// Et ledd (term) i en reaksjon er ett av:
//   { mol: 'h2o', n: 2 }                      – molekyl fra katalogen (MOLECULES-id)
//   { atom: 'Na', n: 2 }                      – frie atomer (metaller, karbon)
//   { custom: { formula, name, atoms }, n }   – stoff utenfor katalogen, bare til balansering (atoms: { C: 6, H: 12, O: 6 })
// `n` er den riktige (laveste) koeffisienten.

import { sigOfMolecule } from '../../molekyl/js/chem.js';

export const MAX_COEF = 9;
export const MAX_BENCH_ATOMS = 16;

const add = (out, sym, k) => { out[sym] = (out[sym] || 0) + k; return out; };
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/** Atomtelling for ett stoff (uten koeffisient): { H: 2, O: 1 }. */
export function termAtoms(term, MOL) {
  const out = {};
  if (term.atom) return add(out, term.atom, 1);
  if (term.custom) return { ...term.custom.atoms };
  const m = MOL[term.mol];
  if (!m) throw new Error('Ukjent molekyl: ' + term.mol);
  for (const s of m.atoms) add(out, s, 1);
  return out;
}

/** Formel for et ledd, med ASCII-tall («H2O»). Visningen kan senke tallene selv. */
export function termFormula(term, MOL) {
  if (term.atom) return term.atom;
  if (term.custom) return term.custom.formula;
  return MOL[term.mol].formula;
}

/** Atomtelling for en hel side med gitte koeffisienter. */
export function sideCounts(terms, coefs, MOL) {
  const out = {};
  terms.forEach((term, i) => {
    const k = coefs[i] || 0, a = termAtoms(term, MOL);
    for (const s in a) add(out, s, a[s] * k);
  });
  return out;
}

/** Alle grunnstoffer i reaksjonen, i fast rekkefølge (først C, H, O, så alfabetisk). */
export function elementsOf(rx, MOL) {
  const all = sideCounts([...rx.reactants, ...rx.products], [...rx.reactants, ...rx.products].map(() => 1), MOL);
  const first = ['C', 'H', 'O'];
  return Object.keys(all).sort((a, b) => {
    const ia = first.indexOf(a), ib = first.indexOf(b);
    if (ia >= 0 || ib >= 0) return (ia < 0 ? 9 : ia) - (ib < 0 ? 9 : ib);
    return a < b ? -1 : 1;
  });
}

/**
 * Status for elevens koeffisienter.
 * → { left, right, perElement: [{ sym, left, right, ok }], balanced, lowest, correct }
 * balanced = like mange av hvert atom på begge sider (og ingen koeffisient er 0)
 * lowest   = koeffisientene har ingen felles faktor
 * correct  = balanced && lowest
 */
export function balanceStatus(rx, coefL, coefR, MOL) {
  const left = sideCounts(rx.reactants, coefL, MOL), right = sideCounts(rx.products, coefR, MOL);
  const perElement = elementsOf(rx, MOL).map((sym) => ({ sym, left: left[sym] || 0, right: right[sym] || 0, ok: (left[sym] || 0) === (right[sym] || 0) }));
  const all = [...coefL, ...coefR];
  const filled = all.length === rx.reactants.length + rx.products.length && all.every((k) => Number.isInteger(k) && k >= 1);
  const balanced = filled && perElement.every((e) => e.ok);
  const lowest = filled && all.reduce(gcd) === 1;
  return { left, right, perElement, balanced, lowest, correct: balanced && lowest };
}

/** Riktige koeffisienter slik de står i dataene. */
export const solution = (rx) => ({ left: rx.reactants.map((x) => x.n), right: rx.products.map((x) => x.n) });

/** Antall atomer på benken når reaksjonen gjøres for hånd med riktige koeffisienter. */
export function benchAtoms(rx, MOL) {
  const c = sideCounts(rx.reactants, rx.reactants.map((x) => x.n), MOL);
  return Object.values(c).reduce((s, k) => s + k, 0);
}

/**
 * Kan reaksjonen gjøres for hånd på benken?
 * Krav: ingen custom-stoffer, reaktantene er kovalente molekyler eller frie atomer, og det er plass på benken.
 */
export function canReact(rx, MOL) {
  if ([...rx.reactants, ...rx.products].some((x) => x.custom)) return false;
  if (rx.reactants.some((x) => x.mol && MOL[x.mol].ionic)) return false;
  if (rx.products.some((x) => x.atom)) return false;
  return benchAtoms(rx, MOL) <= MAX_BENCH_ATOMS;
}

/**
 * Legg reaktantene i en tom World, ferdig bundet.
 * → grupper: [{ term, atoms: [atomobjekter fra world.addAtom] }] – én gruppe per molekyl/fritt atom,
 *   slik at motoren kan plassere hvert molekyl samlet.
 */
export function loadReactants(world, rx, MOL) {
  const groups = [];
  for (const term of rx.reactants) {
    for (let k = 0; k < term.n; k++) {
      if (term.atom) { groups.push({ term, atoms: [world.addAtom(term.atom)] }); continue; }
      const m = MOL[term.mol];
      const atoms = m.atoms.map((s) => world.addAtom(s));
      for (const [i, j, o] of m.bonds) for (let q = 0; q < o; q++) world.tryBond(atoms[i].id, atoms[j].id);
      groups.push({ term, atoms });
    }
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Energi: det koster energi å bryte bindinger, og det frigjøres energi når nye dannes.
// ---------------------------------------------------------------------------

/** Nøkkel i BOND_E: symbolene alfabetisk, så bindingsorden. bondKey('O', 'H', 1) → 'H-O:1' */
export const bondKey = (a, b, order) => (a <= b ? a + '-' + b : b + '-' + a) + ':' + order;

/** Øyeblikksbilde av bindingene i en World: Map fra 'idA-idB' (lavest id først) til { key, kind, order }. */
export function snapshot(world) {
  const out = new Map();
  for (const b of world.bonds) {
    const lo = Math.min(b.a, b.b), hi = Math.max(b.a, b.b);
    out.set(lo + '-' + hi, { key: bondKey(world.atoms.get(b.a).sym, world.atoms.get(b.b).sym, b.order), kind: b.kind, order: b.order });
  }
  return out;
}

/**
 * Energiregnskap fra startbildet til nå (tilstandsbasert: å bryte og lage samme binding igjen gir null).
 * → { broken, formed, net, brokenList, formedList, known }
 * broken/formed i kJ (positive tall), net = broken − formed (negativ = avgir energi, eksoterm).
 * Lister: [{ key, n, e }] for visning. known = false hvis en kovalent binding mangler i BOND_E.
 * Ioneoverføringer teller ikke med her – for dem vises reaksjonens dH i stedet.
 */
export function energy(start, world, BOND_E) {
  const now = snapshot(world);
  let known = true;
  const tally = (from, other) => {
    const list = {};
    for (const [pair, b] of from) {
      if (b.kind !== 'cov') continue;
      const o = other.get(pair);
      if (o && o.kind === 'cov' && o.order === b.order) continue; // uendret binding
      if (BOND_E[b.key] == null) { known = false; continue; }
      list[b.key] = (list[b.key] || 0) + 1;
    }
    return Object.keys(list).sort().map((key) => ({ key, n: list[key], e: BOND_E[key] }));
  };
  const brokenList = tally(start, now), formedList = tally(now, start);
  const sum = (l) => l.reduce((s, x) => s + x.n * x.e, 0);
  const broken = sum(brokenList), formed = sum(formedList);
  return { broken, formed, net: broken - formed, brokenList, formedList, known };
}

/** Bindingsenergi-anslag for hele reaksjonen (kJ, negativ = eksoterm), eller null hvis noe mangler/er ionisk. */
export function estimateDH(rx, MOL, BOND_E) {
  let ok = true;
  const side = (terms) => terms.reduce((s, term) => {
    if (term.atom) return s;
    if (term.custom || MOL[term.mol].ionic) { ok = false; return s; }
    const m = MOL[term.mol];
    for (const [i, j, o] of m.bonds) {
      const e = BOND_E[bondKey(m.atoms[i], m.atoms[j], o)];
      if (e == null) ok = false; else s += e * term.n;
    }
    return s;
  }, 0);
  const d = side(rx.reactants) - side(rx.products);
  return ok ? d : null;
}

// ---------------------------------------------------------------------------
// Er produktene laget?
// ---------------------------------------------------------------------------

/**
 * Sammenlign stabile komponenter i World med produktene.
 * → { done, items: [{ term, have, need }], extra }
 * have = antall ferdige (stabile) produktmolekyler av dette slaget, need = koeffisienten.
 * extra = antall stabile komponenter som ikke er et produkt (f.eks. urørte reaktanter).
 * done = alle produkter laget og ingen atomer til overs.
 */
export function productStatus(world, rx, MOL) {
  const want = new Map(rx.products.map((term) => [sigOfMolecule(MOL[term.mol]), { term, have: 0, need: term.n }]));
  let extra = 0, loose = 0;
  for (const comp of world.components()) {
    if (!world.isStable(comp)) { loose++; continue; }
    let sig = world.signature(comp), times = 1;
    if (sig.endsWith('|i')) {
      // Ioneforbindelser er forholdsformler: Mg2O2 teller som to MgO.
      const c = {}; for (const id of comp) add(c, world.atoms.get(id).sym, 1);
      times = Object.values(c).reduce(gcd);
      sig = Object.keys(c).sort().map((s) => s + c[s] / times).join('') + '|i';
    }
    const hit = want.get(sig);
    if (hit) hit.have += times; else extra++;
  }
  const items = [...want.values()];
  return { done: loose === 0 && extra === 0 && items.every((x) => x.have === x.need), items, extra, loose };
}
