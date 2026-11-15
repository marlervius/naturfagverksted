import { describe, it, expect, beforeEach } from 'vitest';
import { World } from '../molekyl/js/chem.js';
import { EL, MOLECULES } from '../molekyl/js/data.js';
import { BOND_E, RX } from '../reaksjon/js/data.js';
import {
  MAX_BENCH_ATOMS, termAtoms, termFormula, sideCounts, elementsOf, balanceStatus, solution, benchAtoms,
  canReact, loadReactants, bondKey, snapshot, energy, estimateDH, productStatus,
} from '../reaksjon/js/react.js';

const MOL = Object.fromEntries(MOLECULES.map((m) => [m.id, m]));

const GLUCOSE = { custom: { formula: 'C6H12O6', name: { enkel: 'glukose', fag: 'glukose' }, atoms: { C: 6, H: 12, O: 6 } }, n: 1 };

describe('termAtoms / termFormula / sideCounts / elementsOf', () => {
  it('molekyl, fritt atom og custom', () => {
    expect(termAtoms({ mol: 'h2o' }, MOL)).toEqual({ H: 2, O: 1 });
    expect(termAtoms({ mol: 'al2o3' }, MOL)).toEqual({ Al: 2, O: 3 });
    expect(termAtoms({ atom: 'Na' }, MOL)).toEqual({ Na: 1 });
    expect(termAtoms(GLUCOSE, MOL)).toEqual({ C: 6, H: 12, O: 6 });
  });
  it('custom returnerer en kopi (muterer ikke dataene)', () => {
    const a = termAtoms(GLUCOSE, MOL);
    a.C = 99;
    expect(GLUCOSE.custom.atoms.C).toBe(6);
  });
  it('ukjent molekyl kaster', () => {
    expect(() => termAtoms({ mol: 'xyz' }, MOL)).toThrow(/xyz/);
  });
  it('termFormula', () => {
    expect(termFormula({ mol: 'h2o' }, MOL)).toBe('H2O');
    expect(termFormula({ atom: 'Mg' }, MOL)).toBe('Mg');
    expect(termFormula(GLUCOSE, MOL)).toBe('C6H12O6');
  });
  it('sideCounts multipliserer med koeffisient (0 og manglende gir 0 atomer)', () => {
    const terms = [{ mol: 'h2' }, { mol: 'o2' }];
    expect(sideCounts(terms, [2, 1], MOL)).toEqual({ H: 4, O: 2 });
    expect(sideCounts(terms, [0, 1], MOL)).toEqual({ H: 0, O: 2 });
    expect(sideCounts(terms, [3], MOL)).toEqual({ H: 6, O: 0 });
  });
  it('elementsOf: først C, H, O, så alfabetisk', () => {
    expect(elementsOf(RX.metan, MOL)).toEqual(['C', 'H', 'O']);
    expect(elementsOf(RX.klormetan, MOL)).toEqual(['C', 'H', 'Cl']);
    expect(elementsOf(RX.al2o3, MOL)).toEqual(['O', 'Al']);
    expect(elementsOf(RX.nh3, MOL)).toEqual(['H', 'N']);
  });
});

describe('balanceStatus', () => {
  const rx = RX.vann; // H2 + O2 → H2O  (riktig: 2, 1, 2)
  it('riktig løsning er balansert, laveste og correct', () => {
    const st = balanceStatus(rx, [2, 1], [2], MOL);
    expect(st).toMatchObject({ balanced: true, lowest: true, correct: true });
    expect(st.left).toEqual({ H: 4, O: 2 });
    expect(st.right).toEqual({ H: 4, O: 2 });
    expect(st.perElement).toEqual([{ sym: 'H', left: 4, right: 4, ok: true }, { sym: 'O', left: 2, right: 2, ok: true }]);
  });
  it('ubalansert (H₂ + O₂ → H₂O): perElement viser at O ikke går opp', () => {
    const st = balanceStatus(rx, [1, 1], [1], MOL);
    expect(st.balanced).toBe(false);
    expect(st.correct).toBe(false);
    expect(st.perElement.find((e) => e.sym === 'H').ok).toBe(true);
    expect(st.perElement.find((e) => e.sym === 'O').ok).toBe(false);
    expect(st.perElement.find((e) => e.sym === 'O')).toMatchObject({ left: 2, right: 1 });
  });
  it('H₂ + O₂ → 2 H₂O: O går opp, men H gjør det ikke', () => {
    const st = balanceStatus(rx, [1, 1], [2], MOL);
    expect(st.perElement.map((e) => e.ok)).toEqual([false, true]);
    const st2 = balanceStatus(rx, [2, 2], [2], MOL);
    expect(st2.balanced).toBe(false);
  });
  it('balansert, men ikke laveste koeffisienter: 4, 2, 4', () => {
    const st = balanceStatus(rx, [4, 2], [4], MOL);
    expect(st.balanced).toBe(true);
    expect(st.lowest).toBe(false);
    expect(st.correct).toBe(false);
  });
  it('koeffisient 0 gir aldri balansert, selv om atomtellingen «går opp»', () => {
    const empty = { reactants: [{ mol: 'h2o', n: 1 }], products: [{ mol: 'h2o', n: 1 }] };
    expect(balanceStatus(empty, [0], [0], MOL)).toMatchObject({ balanced: false, lowest: false, correct: false });
    expect(balanceStatus(rx, [0, 0], [0], MOL).balanced).toBe(false);
    expect(balanceStatus(rx, [2, 1], [0], MOL).balanced).toBe(false);
  });
  it('manglende, ikke-heltallige og negative koeffisienter teller som ufylt', () => {
    expect(balanceStatus(rx, [2, 1], [], MOL).balanced).toBe(false);
    expect(balanceStatus(rx, [2, 1], [undefined], MOL).balanced).toBe(false);
    expect(balanceStatus(rx, [2, 1], [2.0], MOL).balanced).toBe(true);
    expect(balanceStatus(rx, [2, 1.5], [2], MOL).balanced).toBe(false);
    expect(balanceStatus(rx, [-2, -1], [-2], MOL).balanced).toBe(false);
  });
  it('gcd: 6/3/2-sett uten felles faktor er laveste', () => {
    const st = balanceStatus(RX.fotosyntese, [6, 6], [1, 6], MOL);
    expect(st.correct).toBe(true);
    const st2 = balanceStatus(RX.nh3, [1, 3], [2], MOL);
    expect(st2.correct).toBe(true);
    const st3 = balanceStatus(RX.nh3, [2, 6], [4], MOL);
    expect(st3).toMatchObject({ balanced: true, lowest: false, correct: false });
  });
  it('fungerer med custom (glukose) og frie atomer', () => {
    expect(balanceStatus(RX.fotosyntese, [6, 6], [1, 6], MOL).correct).toBe(true);
    expect(balanceStatus(RX.fotosyntese, [1, 1], [1, 1], MOL).balanced).toBe(false);
    expect(balanceStatus(RX.nacl, [2, 1], [2], MOL).correct).toBe(true);
    expect(balanceStatus(RX.nacl, [1, 1], [1], MOL).balanced).toBe(false);
  });
  it('solution() gir riktige koeffisienter som består balanceStatus for alle reaksjoner', () => {
    for (const id of Object.keys(RX)) {
      const s = solution(RX[id]);
      expect(balanceStatus(RX[id], s.left, s.right, MOL).correct, id).toBe(true);
    }
    expect(solution(RX.vann)).toEqual({ left: [2, 1], right: [2] });
  });
});

describe('benchAtoms / canReact', () => {
  it('benchAtoms teller atomene i reaktantene med riktige koeffisienter', () => {
    expect(benchAtoms(RX.vann, MOL)).toBe(6);
    expect(benchAtoms(RX.nacl, MOL)).toBe(4);
    expect(benchAtoms(RX.al2o3, MOL)).toBe(10);
    expect(benchAtoms(RX.propan, MOL)).toBe(21);
  });
  it('kan reageres: kovalente molekyler og frie atomer', () => {
    expect(canReact(RX.vann, MOL)).toBe(true);
    expect(canReact(RX.nacl, MOL)).toBe(true); // frie Na-atomer + Cl2, ionisk produkt er greit
    expect(canReact(RX.karbon, MOL)).toBe(true);
  });
  it('custom-stoffer gir false (reaktant og produkt)', () => {
    expect(canReact(RX.fotosyntese, MOL)).toBe(false);
    expect(canReact(RX.celleanding, MOL)).toBe(false);
  });
  it('for stor reaksjon gir false', () => {
    expect(benchAtoms(RX.propan, MOL)).toBeGreaterThan(MAX_BENCH_ATOMS);
    expect(canReact(RX.propan, MOL)).toBe(false);
  });
  it('grensen er MAX_BENCH_ATOMS (16 er ok, 17 er ikke)', () => {
    const mk = (n) => ({ reactants: [{ mol: 'h2', n }], products: [{ mol: 'h2', n }] });
    expect(canReact(mk(8), MOL)).toBe(true); // 16 atomer
    expect(canReact(mk(9), MOL)).toBe(false); // 18 atomer
  });
  it('ioniske reaktanter gir false', () => {
    const rx = { reactants: [{ mol: 'nacl', n: 1 }], products: [{ atom: 'Na', n: 1 }, { mol: 'cl2', n: 1 }] };
    expect(canReact(rx, MOL)).toBe(false);
    expect(canReact({ reactants: [{ mol: 'nacl', n: 1 }], products: [{ mol: 'nacl', n: 1 }] }, MOL)).toBe(false);
  });
  it('frie atomer som produkt gir false', () => {
    expect(canReact({ reactants: [{ mol: 'h2', n: 1 }], products: [{ atom: 'H', n: 2 }] }, MOL)).toBe(false);
  });
});

describe('loadReactants', () => {
  let w;
  beforeEach(() => { w = new World(EL); });

  it('lager én gruppe per molekyl, ferdig bundet', () => {
    const groups = loadReactants(w, RX.vann, MOL);
    expect(groups).toHaveLength(3); // 2 H2 + 1 O2
    expect(groups.map((g) => g.atoms.length)).toEqual([2, 2, 2]);
    expect(w.atoms.size).toBe(6);
    expect(w.components()).toHaveLength(3);
    expect(w.components().every((c) => w.isStable(c))).toBe(true);
  });
  it('dobbelt- og trippelbindinger blir riktig bindingsorden', () => {
    loadReactants(w, RX.vann, MOL);
    const o2 = w.bonds.find((b) => w.atoms.get(b.a).sym === 'O');
    expect(o2.order).toBe(2);
    const w2 = new World(EL);
    loadReactants(w2, RX.nh3, MOL);
    expect(w2.bonds.some((b) => b.order === 3)).toBe(true);
  });
  it('frie atomer er enkeltatomer uten bindinger', () => {
    const groups = loadReactants(w, RX.nacl, MOL);
    expect(groups).toHaveLength(3); // 2 Na + 1 Cl2
    expect(groups.filter((g) => g.term.atom)).toHaveLength(2);
    expect(groups.filter((g) => g.term.atom).every((g) => g.atoms.length === 1)).toBe(true);
    expect(w.bonds).toHaveLength(1); // bare Cl–Cl
    expect(w.isStable([groups[0].atoms[0].id])).toBe(false);
  });
  it('gruppene peker på riktig term og atomer finnes i World', () => {
    const groups = loadReactants(w, RX.metan, MOL);
    expect(groups[0].term).toBe(RX.metan.reactants[0]);
    expect(groups).toHaveLength(3);
    for (const g of groups) for (const a of g.atoms) expect(w.atoms.get(a.id)).toBe(a);
  });
  it('atomtellingen i World stemmer med sideCounts for reaktantene', () => {
    for (const rx of [RX.vann, RX.klormetan, RX.al2o3, RX.h2o2]) {
      const ww = new World(EL);
      loadReactants(ww, rx, MOL);
      const c = {};
      for (const a of ww.atoms.values()) c[a.sym] = (c[a.sym] || 0) + 1;
      expect(c, rx.id).toEqual(sideCounts(rx.reactants, rx.reactants.map((t) => t.n), MOL));
    }
  });
});

describe('bondKey', () => {
  it('sorterer symbolene alfabetisk', () => {
    expect(bondKey('O', 'H', 1)).toBe('H-O:1');
    expect(bondKey('H', 'O', 1)).toBe('H-O:1');
    expect(bondKey('O', 'O', 2)).toBe('O-O:2');
    expect(bondKey('H', 'Cl', 1)).toBe('Cl-H:1');
    expect(bondKey('Cl', 'C', 1)).toBe('C-Cl:1');
  });
});

describe('snapshot / energy (tilstandsbasert)', () => {
  let w, groups, start;
  const load = (rx) => { w = new World(EL); groups = loadReactants(w, rx, MOL); start = snapshot(w); };
  const [H1, H2] = [0, 1];

  it('snapshot har én oppføring per bindingspar med nøkkel og orden', () => {
    load(RX.vann);
    expect(start.size).toBe(3);
    const keys = [...start.values()].map((b) => b.key).sort();
    expect(keys).toEqual(['H-H:1', 'H-H:1', 'O-O:2']);
    expect([...start.values()].every((b) => b.kind === 'cov')).toBe(true);
  });
  it('snapshot er uavhengig av world etterpå (kopi)', () => {
    load(RX.vann);
    const [a, b] = groups[0].atoms;
    w.removeBond(a.id, b.id);
    expect(start.size).toBe(3);
    expect(snapshot(w).size).toBe(2);
  });
  it('uendret bilde gir null energi', () => {
    load(RX.vann);
    expect(energy(start, w, BOND_E)).toMatchObject({ broken: 0, formed: 0, net: 0, known: true, brokenList: [], formedList: [] });
  });
  it('å bryte H–H koster 436 kJ', () => {
    load(RX.vann);
    const [a, b] = groups[H1].atoms;
    w.removeBond(a.id, b.id);
    const e = energy(start, w, BOND_E);
    expect(e).toMatchObject({ broken: 436, formed: 0, net: 436, known: true });
    expect(e.brokenList).toEqual([{ key: 'H-H:1', n: 1, e: 436 }]);
  });
  it('å bryte og lage samme binding igjen gir null (tilstandsbasert)', () => {
    load(RX.vann);
    const [a, b] = groups[H1].atoms;
    w.removeBond(a.id, b.id);
    w.tryBond(a.id, b.id);
    expect(energy(start, w, BOND_E)).toMatchObject({ broken: 0, formed: 0, net: 0 });
    w.removeBond(a.id, b.id); w.tryBond(a.id, b.id); w.removeBond(a.id, b.id); w.tryBond(a.id, b.id);
    expect(energy(start, w, BOND_E).net).toBe(0);
  });
  it('å lage en ny binding gir energi tilbake (formed)', () => {
    load(RX.vann);
    // bryt H–H, H–H og O=O fullstendig, lag så to O–H
    for (const g of groups) { const [a, b] = g.atoms; while (w.removeBond(a.id, b.id)); }
    const o1 = groups[2].atoms[0], h1 = groups[0].atoms[0];
    w.tryBond(o1.id, h1.id);
    const e = energy(start, w, BOND_E);
    expect(e.broken).toBe(436 + 436 + 498);
    expect(e.formed).toBe(463);
    expect(e.net).toBe(436 + 436 + 498 - 463);
    expect(e.formedList).toEqual([{ key: 'H-O:1', n: 1, e: 463 }]);
  });
  it('full vannsyntese: net = −482 kJ (bryt 1370, lag 1852)', () => {
    load(RX.vann);
    for (const g of groups) { const [a, b] = g.atoms; while (w.removeBond(a.id, b.id)); }
    const [h1, h2] = groups[0].atoms, [h3, h4] = groups[1].atoms, [o1, o2] = groups[2].atoms;
    for (const [o, h] of [[o1, h1], [o1, h2], [o2, h3], [o2, h4]]) w.tryBond(o.id, h.id);
    const e = energy(start, w, BOND_E);
    expect(e).toMatchObject({ broken: 1370, formed: 1852, net: -482, known: true });
    expect(e.formedList).toEqual([{ key: 'H-O:1', n: 4, e: 463 }]);
    expect(e.net).toBe(estimateDH(RX.vann, MOL, BOND_E));
    expect(productStatus(w, RX.vann, MOL).done).toBe(true);
  });
  it('orden som endres teller som brudd av den gamle og dannelse av den nye (O=O → O–O)', () => {
    load(RX.vann);
    const [o1, o2] = groups[2].atoms;
    w.removeBond(o1.id, o2.id); // O=O → O–O
    const e = energy(start, w, BOND_E);
    expect(e.brokenList).toEqual([{ key: 'O-O:2', n: 1, e: 498 }]);
    expect(e.formedList).toEqual([{ key: 'O-O:1', n: 1, e: 146 }]);
    expect(e.net).toBe(498 - 146);
  });
  it('known = false når en binding mangler i BOND_E; listene hopper over den', () => {
    load(RX.vann);
    const [a, b] = groups[H1].atoms;
    w.removeBond(a.id, b.id);
    const e = energy(start, w, {});
    expect(e.known).toBe(false);
    expect(e.broken).toBe(0);
  });
  it('ioneoverføringer teller ikke med', () => {
    load(RX.nacl);
    const [na] = groups[0].atoms, [cl1, cl2] = groups[2].atoms;
    while (w.removeBond(cl1.id, cl2.id));
    w.tryBond(na.id, cl1.id); // ion-binding
    const e = energy(start, w, BOND_E);
    expect(e.broken).toBe(243);
    expect(e.formed).toBe(0);
    expect(e.known).toBe(true);
  });
  it('fjernede atomer teller som brutte bindinger', () => {
    load(RX.vann);
    w.removeAtom(groups[0].atoms[0].id);
    expect(energy(start, w, BOND_E).broken).toBe(436);
  });
});

describe('estimateDH', () => {
  it('H₂ + Cl₂ → 2 HCl: 436 + 243 − 2·431 = −183', () => {
    expect(estimateDH(RX.hcl, MOL, BOND_E)).toBe(-183);
  });
  it('N₂ + 3 H₂ → 2 NH₃: −93', () => {
    expect(estimateDH(RX.nh3, MOL, BOND_E)).toBe(945 + 3 * 436 - 6 * 391);
  });
  it('CH₄ + 2 O₂ → CO₂ + 2 H₂O: −802', () => {
    expect(estimateDH(RX.metan, MOL, BOND_E)).toBe(4 * 413 + 2 * 498 - 2 * 799 - 4 * 463);
  });
  it('frie atomer teller ikke (ingen bindinger i dem)', () => {
    // C + O2 → CO2: bare O=O brytes og 2 C=O dannes
    expect(estimateDH(RX.karbon, MOL, BOND_E)).toBe(498 - 2 * 799);
  });
  it('null for ioneforbindelser, custom-stoffer og manglende bindingsenergi', () => {
    expect(estimateDH(RX.mgo, MOL, BOND_E)).toBeNull();
    expect(estimateDH(RX.fotosyntese, MOL, BOND_E)).toBeNull();
    expect(estimateDH(RX.vann, MOL, { 'H-H:1': 436 })).toBeNull();
  });
  it('omvendt reaksjon har motsatt fortegn og samme tall', () => {
    expect(estimateDH(RX['vann-spalt'], MOL, BOND_E)).toBe(-estimateDH(RX.vann, MOL, BOND_E));
  });
});

describe('productStatus', () => {
  let w;
  beforeEach(() => { w = new World(EL); });
  const buildWater = (o, h1, h2) => { w.tryBond(o, h1); w.tryBond(o, h2); };

  it('urørte reaktanter: ingenting laget, alt regnes som extra', () => {
    loadReactants(w, RX.vann, MOL);
    const st = productStatus(w, RX.vann, MOL);
    expect(st.done).toBe(false);
    expect(st.items).toHaveLength(1);
    expect(st.items[0]).toMatchObject({ have: 0, need: 2 });
    expect(st.extra).toBe(3); // 2 H2 + 1 O2 er stabile komponenter som ikke er produkter
    expect(st.loose).toBe(0);
  });
  it('urørte reaktanter som også er produkter (spalting av vann baklengs) telles som laget', () => {
    loadReactants(w, RX['vann-spalt'], MOL);
    const st = productStatus(w, RX['vann-spalt'], MOL);
    expect(st.done).toBe(false);
    expect(st.extra).toBe(2); // 2 H2O er ikke produkter her
  });
  it('løse atomer teller som loose, ikke extra', () => {
    const [o, h1, h2] = ['O', 'H', 'H'].map((s) => w.addAtom(s).id);
    buildWater(o, h1, h2);
    w.addAtom('H'); w.addAtom('H');
    const st = productStatus(w, RX.vann, MOL);
    expect(st.items[0]).toMatchObject({ have: 1, need: 2 });
    expect(st.loose).toBe(2);
    expect(st.done).toBe(false);
  });
  it('delvis og helt ferdig', () => {
    const ids = ['O', 'H', 'H', 'O', 'H', 'H'].map((s) => w.addAtom(s).id);
    buildWater(ids[0], ids[1], ids[2]);
    let st = productStatus(w, RX.vann, MOL);
    expect(st.items[0].have).toBe(1);
    expect(st.done).toBe(false);
    buildWater(ids[3], ids[4], ids[5]);
    st = productStatus(w, RX.vann, MOL);
    expect(st).toMatchObject({ done: true, extra: 0, loose: 0 });
    expect(st.items[0]).toMatchObject({ have: 2, need: 2 });
  });
  it('flere enn nødvendig av et produkt er ikke «done»', () => {
    const ids = ['O', 'H', 'H', 'O', 'H', 'H', 'O', 'H', 'H'].map((s) => w.addAtom(s).id);
    for (let i = 0; i < 9; i += 3) buildWater(ids[i], ids[i + 1], ids[i + 2]);
    const st = productStatus(w, RX.vann, MOL);
    expect(st.items[0].have).toBe(3);
    expect(st.done).toBe(false);
  });
  it('en Mg₂O₂-komponent teller som 2 MgO', () => {
    const [m1, m2, o1, o2] = ['Mg', 'Mg', 'O', 'O'].map((s) => w.addAtom(s).id);
    // hvert Mg gir ett elektron til hvert O: én sammenhengende komponent
    w.tryBond(m1, o1); w.tryBond(m1, o2); w.tryBond(m2, o1); w.tryBond(m2, o2);
    expect(w.components()).toHaveLength(1);
    const st = productStatus(w, RX.mgo, MOL);
    expect(st.items[0]).toMatchObject({ have: 2, need: 2 });
    expect(st).toMatchObject({ done: true, extra: 0, loose: 0 });
  });
  it('to separate MgO gir også done', () => {
    const [m1, m2, o1, o2] = ['Mg', 'Mg', 'O', 'O'].map((s) => w.addAtom(s).id);
    w.tryBond(m1, o1); w.tryBond(m1, o1); w.tryBond(m2, o2); w.tryBond(m2, o2);
    expect(w.components()).toHaveLength(2);
    expect(productStatus(w, RX.mgo, MOL).done).toBe(true);
  });
  it('Na₄O₂ teller som 2 Na₂O, og Al₄O₆ som 2 Al₂O₃', () => {
    const w1 = new World(EL);
    const na = [1, 2, 3, 4].map(() => w1.addAtom('Na').id), o = [1, 2].map(() => w1.addAtom('O').id);
    w1.tryBond(na[0], o[0]); w1.tryBond(na[1], o[1]); w1.tryBond(na[2], o[0]); w1.tryBond(na[3], o[1]);
    expect(w1.components()).toHaveLength(2);
    expect(productStatus(w1, RX.na2o, MOL).done).toBe(true);
    const w2 = new World(EL);
    const al = [1, 2, 3, 4].map(() => w2.addAtom('Al').id), ox = [1, 2, 3, 4, 5, 6].map(() => w2.addAtom('O').id);
    // Al1+Al2 → O1,O2,O3  og  Al3+Al4 → O4,O5,O6
    [[al[0], ox[0]], [al[0], ox[1]], [al[0], ox[2]], [al[1], ox[0]], [al[1], ox[1]], [al[1], ox[2]],
     [al[2], ox[3]], [al[2], ox[4]], [al[2], ox[5]], [al[3], ox[3]], [al[3], ox[4]], [al[3], ox[5]]].forEach(([a, b]) => w2.tryBond(a, b));
    expect(productStatus(w2, RX.al2o3, MOL).done).toBe(true);
  });
  it('ioneforbindelse som ikke er et produkt telles som extra (NaCl ved MgO-reaksjon)', () => {
    const [na, cl] = ['Na', 'Cl'].map((s) => w.addAtom(s).id);
    w.tryBond(na, cl);
    const st = productStatus(w, RX.mgo, MOL);
    expect(st.extra).toBe(1);
    expect(st.done).toBe(false);
  });
  it('flere produkter: alle må være laget (klormetan + HCl)', () => {
    const [c, h1, h2, h3, cl1, cl2, h4] = ['C', 'H', 'H', 'H', 'Cl', 'Cl', 'H'].map((s) => w.addAtom(s).id);
    for (const h of [h1, h2, h3]) w.tryBond(c, h);
    w.tryBond(c, cl1);
    let st = productStatus(w, RX.klormetan, MOL);
    expect(st.items.find((x) => x.term.mol === 'ch3cl').have).toBe(1);
    expect(st.done).toBe(false); // løse atomer: Cl og H
    w.tryBond(h4, cl2);
    st = productStatus(w, RX.klormetan, MOL);
    expect(st).toMatchObject({ done: true, extra: 0, loose: 0 });
  });
  it('feil molekyl med riktige atomer (isomer-lignende) godtas ikke: CH₃OH er ikke produkt av eten + H₂', () => {
    // sanity: ukjent signatur teller som extra
    const ids = ['C', 'O', 'H', 'H', 'H', 'H'].map((s) => w.addAtom(s).id);
    w.tryBond(ids[0], ids[1]); w.tryBond(ids[0], ids[2]); w.tryBond(ids[0], ids[3]); w.tryBond(ids[0], ids[4]); w.tryBond(ids[1], ids[5]);
    const st = productStatus(w, RX.eten, MOL);
    expect(st.extra).toBe(1);
    expect(st.done).toBe(false);
  });
});
