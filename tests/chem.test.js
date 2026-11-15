import { describe, it, expect, beforeEach } from 'vitest';
import { World, sigOfMolecule } from '../js/chem.js';
import { EL, MOLECULES } from '../js/data.js';

let w;
beforeEach(() => { w = new World(EL); });

const add = (...syms) => syms.map((s) => w.addAtom(s).id);
const bond = (a, b, n = 1) => { let r; for (let i = 0; i < n; i++) r = w.tryBond(a, b); return r; };
const mol = (id) => MOLECULES.find((m) => m.id === id);

describe('addAtom', () => {
  it('gir unike id-er og lagrer symbol/element', () => {
    const a = w.addAtom('H'), b = w.addAtom('H');
    expect(a.id).not.toBe(b.id);
    expect(a.sym).toBe('H');
    expect(a.el).toBe(EL.H);
    expect(w.atoms.size).toBe(2);
  });
  it('avviser ikke-byggbare og ukjente grunnstoffer', () => {
    expect(w.addAtom('Fe')).toBeNull();
    expect(w.addAtom('Zz')).toBeNull();
    expect(w.atoms.size).toBe(0);
  });
  it('tillater edelgasser (kan plasseres, men ikke bindes)', () => {
    expect(w.addAtom('He')).not.toBeNull();
  });
});

describe('kovalente bindinger', () => {
  it('H2: enkeltbinding, begge atomer fulle og stabile', () => {
    const [a, b] = add('H', 'H');
    expect(w.tryBond(a, b)).toMatchObject({ ok: true, kind: 'cov', order: 1, reason: 'cov' });
    expect(w.unpaired(a)).toBe(0);
    expect(w.unpaired(b)).toBe(0);
    expect(w.isStable([a, b])).toBe(true);
  });
  it('O2: dobbeltbinding (order øker ved gjentatt tryBond)', () => {
    const [a, b] = add('O', 'O');
    expect(w.tryBond(a, b).order).toBe(1);
    expect(w.isStable([a, b])).toBe(false);
    expect(w.tryBond(a, b).order).toBe(2);
    expect(w.isStable([a, b])).toBe(true);
    expect(w.bonds).toHaveLength(1);
  });
  it('N2: trippelbinding, og en fjerde avvises', () => {
    const [a, b] = add('N', 'N');
    expect(bond(a, b, 3).order).toBe(3);
    expect(w.isStable([a, b])).toBe(true);
    expect(w.tryBond(a, b)).toMatchObject({ ok: false, reason: 'full' });
    expect(w.bonds[0].order).toBe(3);
  });
  it('H2O: to enkeltbindinger, O stabilt med to ensomme par', () => {
    const [o, h1, h2] = add('O', 'H', 'H');
    w.tryBond(o, h1); w.tryBond(o, h2);
    expect(w.unpaired(o)).toBe(0);
    expect(w.isStable(w.component(o))).toBe(true);
    expect(w.info(o).bondCount).toBe(2);
    expect(w.lonePairs(o)).toBe(2);
  });
  it('CO2: to dobbeltbindinger', () => {
    const [c, o1, o2] = add('C', 'O', 'O');
    bond(c, o1, 2); bond(c, o2, 2);
    expect(w.isStable([c, o1, o2])).toBe(true);
    expect(w.covSum(c)).toBe(4);
  });
  it('CH4: fire enkeltbindinger', () => {
    const [c, ...hs] = add('C', 'H', 'H', 'H', 'H');
    hs.forEach((h) => w.tryBond(c, h));
    expect(w.isStable([c, ...hs])).toBe(true);
    expect(w.component(c)).toHaveLength(5);
  });
  it('ufullstendig molekyl er ikke stabilt', () => {
    const [o, h] = add('O', 'H');
    w.tryBond(o, h);
    expect(w.unpaired(o)).toBe(1);
    expect(w.isStable([o, h])).toBe(false);
  });
});

describe('ionebindinger', () => {
  it('NaCl: Na gir ett elektron til Cl', () => {
    const [na, cl] = add('Na', 'Cl');
    const r = w.tryBond(na, cl);
    expect(r).toMatchObject({ ok: true, kind: 'ion', order: 1, reason: 'ion' });
    expect(r.from.id).toBe(na);
    expect(r.to.id).toBe(cl);
    expect(w.charge(na)).toBe(1);
    expect(w.charge(cl)).toBe(-1);
    expect(w.isStable([na, cl])).toBe(true);
  });
  it('samme resultat uansett argumentrekkefølge', () => {
    const [na, cl] = add('Na', 'Cl');
    const r = w.tryBond(cl, na);
    expect(r.ok).toBe(true);
    expect(r.from.id).toBe(na);
    expect(r.to.id).toBe(cl);
    expect(w.bonds[0]).toMatchObject({ a: na, b: cl, kind: 'ion' });
  });
  it('MgCl2: Mg gir to elektroner, ett til hvert Cl', () => {
    const [mg, c1, c2] = add('Mg', 'Cl', 'Cl');
    w.tryBond(mg, c1);
    expect(w.isStable([mg, c1])).toBe(false);
    w.tryBond(mg, c2);
    expect(w.charge(mg)).toBe(2);
    expect(w.charge(c1)).toBe(-1);
    expect(w.charge(c2)).toBe(-1);
    expect(w.isStable([mg, c1, c2])).toBe(true);
  });
  it('MgO: to elektroner på samme binding (order 2)', () => {
    const [mg, o] = add('Mg', 'O');
    w.tryBond(mg, o);
    expect(w.tryBond(mg, o).order).toBe(2);
    expect(w.charge(mg)).toBe(2);
    expect(w.charge(o)).toBe(-2);
    expect(w.isStable([mg, o])).toBe(true);
  });
  it('Na2O blir stabil', () => {
    const [n1, n2, o] = add('Na', 'Na', 'O');
    w.tryBond(n1, o); w.tryBond(n2, o);
    expect(w.isStable([n1, n2, o])).toBe(true);
    expect(w.charge(o)).toBe(-2);
  });
  it('Al2O3 blir stabil', () => {
    const [al1, al2, o1, o2, o3] = add('Al', 'Al', 'O', 'O', 'O');
    [o1, o1, o2].forEach((o) => w.tryBond(al1, o));
    [o2, o3, o3].forEach((o) => w.tryBond(al2, o));
    expect(w.isStable([al1, al2, o1, o2, o3])).toBe(true);
    expect(w.charge(al1)).toBe(3);
  });
  it('metallet kan ikke gi mer enn det har', () => {
    const [na, c1, c2] = add('Na', 'Cl', 'Cl');
    w.tryBond(na, c1);
    expect(w.tryBond(na, c2)).toMatchObject({ ok: false, reason: 'full' });
  });
  it('ikke-metallet kan ikke ta imot mer enn det trenger', () => {
    const [n1, n2, cl] = add('Na', 'Na', 'Cl');
    w.tryBond(n1, cl);
    expect(w.tryBond(n2, cl)).toMatchObject({ ok: false, reason: 'full' });
  });
  it('info for ioner: Na+ har tomt ytterskall, Cl- har oktett', () => {
    const [na, cl] = add('Na', 'Cl');
    w.tryBond(na, cl);
    expect(w.info(na)).toMatchObject({ charge: 1, full: true, unpaired: 0, outer: 8, max: 8 });
    expect(w.info(cl)).toMatchObject({ charge: -1, full: true, outer: 8, max: 8, lonePairs: 4 });
  });
});

describe('avvisninger', () => {
  it('samme atom', () => {
    const [h] = add('H');
    expect(w.tryBond(h, h)).toMatchObject({ ok: false, reason: 'same' });
  });
  it('ukjent id', () => {
    const [h] = add('H');
    expect(w.tryBond(h, 999).ok).toBe(false);
  });
  it('edelgass (begge rekkefølger) gir noble og riktig atom', () => {
    const [he, h] = add('He', 'H');
    const r1 = w.tryBond(he, h);
    expect(r1).toMatchObject({ ok: false, reason: 'noble' });
    expect(r1.atom.sym).toBe('He');
    const r2 = w.tryBond(h, he);
    expect(r2).toMatchObject({ ok: false, reason: 'noble' });
    expect(r2.atom.sym).toBe('He');
    expect(w.bonds).toHaveLength(0);
  });
  it('metall-metall', () => {
    const [na, mg] = add('Na', 'Mg');
    expect(w.tryBond(na, mg)).toMatchObject({ ok: false, reason: 'metalMetal' });
    expect(w.bonds).toHaveLength(0);
  });
  it('fullt atom (kovalent)', () => {
    const [h1, h2, h3] = add('H', 'H', 'H');
    w.tryBond(h1, h2);
    expect(w.tryBond(h1, h3)).toMatchObject({ ok: false, reason: 'full' });
    expect(w.tryBond(h3, h1)).toMatchObject({ ok: false, reason: 'full' });
  });
  it('avvist forsøk endrer ikke tilstanden', () => {
    const [h1, h2, h3] = add('H', 'H', 'H');
    w.tryBond(h1, h2);
    const before = JSON.stringify(w.bonds);
    w.tryBond(h1, h3);
    expect(JSON.stringify(w.bonds)).toBe(before);
  });
});

describe('removeBond / removeAtom', () => {
  it('removeBond reduserer orden ett trinn og fjerner ved 0', () => {
    const [a, b] = add('O', 'O');
    bond(a, b, 2);
    expect(w.removeBond(a, b)).toBe(true);
    expect(w.bonds[0].order).toBe(1);
    expect(w.removeBond(b, a)).toBe(true);
    expect(w.bonds).toHaveLength(0);
    expect(w.removeBond(a, b)).toBe(false);
  });
  it('removeBond på ionebinding gir elektronet tilbake', () => {
    const [mg, o] = add('Mg', 'O');
    bond(mg, o, 2);
    w.removeBond(mg, o);
    expect(w.charge(mg)).toBe(1);
    expect(w.unpaired(mg)).toBe(1);
  });
  it('removeAtom fjerner atomet og alle dets bindinger', () => {
    const [c, h1, h2] = add('C', 'H', 'H');
    w.tryBond(c, h1); w.tryBond(c, h2);
    w.removeAtom(c);
    expect(w.atoms.has(c)).toBe(false);
    expect(w.bonds).toHaveLength(0);
    expect(w.unpaired(h1)).toBe(1);
  });
  it('removeAtom lar bindinger mellom andre atomer stå', () => {
    const [a, b, c] = add('H', 'H', 'Cl');
    w.tryBond(a, b);
    w.removeAtom(c);
    expect(w.bonds).toHaveLength(1);
  });
  it('clear tømmer alt', () => {
    const [a, b] = add('H', 'H');
    w.tryBond(a, b);
    w.clear();
    expect(w.atoms.size).toBe(0);
    expect(w.bonds).toHaveLength(0);
  });
});

describe('component / components', () => {
  it('et enkeltatom er sin egen komponent', () => {
    const [a] = add('H');
    expect(w.component(a)).toEqual([a]);
  });
  it('finner sammenhengende atomer, sortert', () => {
    const [h1, o, h2, x] = add('H', 'O', 'H', 'He');
    w.tryBond(o, h1); w.tryBond(h2, o);
    expect(w.component(h2)).toEqual([h1, o, h2]);
    expect(w.component(x)).toEqual([x]);
  });
  it('components deler opp i separate molekyler', () => {
    const [a, b, c, d, e] = add('H', 'H', 'Cl', 'H', 'He');
    w.tryBond(a, b); w.tryBond(c, d);
    const comps = w.components();
    expect(comps).toHaveLength(3);
    expect(comps).toContainEqual([a, b]);
    expect(comps).toContainEqual([c, d]);
    expect(comps).toContainEqual([e]);
  });
  it('ionebindinger teller som forbindelse', () => {
    const [mg, c1, c2] = add('Mg', 'Cl', 'Cl');
    w.tryBond(mg, c1); w.tryBond(mg, c2);
    expect(w.component(c1)).toEqual([mg, c1, c2]);
  });
  it('splittes igjen etter removeBond', () => {
    const [a, b] = add('H', 'H');
    w.tryBond(a, b); w.removeBond(a, b);
    expect(w.components()).toHaveLength(2);
  });
});

describe('isStable', () => {
  it('enkeltatom er aldri stabilt (må ha > 1 atom)', () => {
    const [a] = add('He');
    expect(w.isStable([a])).toBe(false);
    expect(w.isStable([])).toBe(false);
  });
});

describe('info / neutralInfo', () => {
  it('info av ukjent id gir null', () => {
    expect(w.info(42)).toBeNull();
  });
  it('fritt H: ett uparet, ytterskall 1 av 2', () => {
    const [h] = add('H');
    expect(w.info(h)).toMatchObject({ sym: 'H', charge: 0, outer: 1, max: 2, full: false, unpaired: 1, bondCount: 0 });
  });
  it('H2O: O har 8 i ytterskallet, H har 2', () => {
    const [o, h1, h2] = add('O', 'H', 'H');
    w.tryBond(o, h1); w.tryBond(o, h2);
    expect(w.info(o)).toMatchObject({ outer: 8, max: 8, full: true, lonePairs: 2, bondCount: 2 });
    expect(w.info(h1)).toMatchObject({ outer: 2, max: 2, full: true });
  });
  it('edelgass: full, 0 uparede', () => {
    const [ne, he] = add('Ne', 'He');
    expect(w.info(ne)).toMatchObject({ full: true, unpaired: 0, outer: 8, max: 8, lonePairs: 4 });
    expect(w.info(he)).toMatchObject({ outer: 2, max: 2, lonePairs: 1 });
  });
  it('fritt metall: Na har ett uparet, Mg to', () => {
    const [na, mg] = add('Na', 'Mg');
    expect(w.info(na)).toMatchObject({ unpaired: 1, outer: 1, full: false, lonePairs: 0 });
    expect(w.info(mg)).toMatchObject({ unpaired: 2, outer: 2 });
  });
  it('neutralInfo for ikke-metall, metall og edelgass', () => {
    expect(World.neutralInfo(EL.O)).toMatchObject({ sym: 'O', charge: 0, outer: 6, max: 8, unpaired: 2, lonePairs: 2, full: false });
    expect(World.neutralInfo(EL.H)).toMatchObject({ outer: 1, max: 2, unpaired: 1, lonePairs: 0 });
    expect(World.neutralInfo(EL.Na)).toMatchObject({ outer: 1, max: 8, unpaired: 1, lonePairs: 0 });
    expect(World.neutralInfo(EL.Ne)).toMatchObject({ outer: 8, max: 8, unpaired: 0, lonePairs: 4, full: true });
    expect(World.neutralInfo(EL.He)).toMatchObject({ outer: 2, max: 2, full: true });
  });
  it('neutralInfo for ikke-byggbart grunnstoff (Fe) faller tilbake på ytterste skall', () => {
    const i = World.neutralInfo(EL.Fe);
    expect(i).toMatchObject({ sym: 'Fe', unpaired: 0, outer: 2 });
  });
});

describe('signature', () => {
  it('bygget H2O matcher sigOfMolecule for katalogoppføringen', () => {
    const [o, h1, h2] = add('O', 'H', 'H');
    w.tryBond(o, h1); w.tryBond(o, h2);
    expect(w.signature([o, h1, h2])).toBe(sigOfMolecule(mol('h2o')));
  });
  it.each([
    ['h2', ['H', 'H'], [[0, 1, 1]]],
    ['o2', ['O', 'O'], [[0, 1, 2]]],
    ['n2', ['N', 'N'], [[0, 1, 3]]],
    ['co2', ['C', 'O', 'O'], [[0, 1, 2], [0, 2, 2]]],
    ['ch4', ['C', 'H', 'H', 'H', 'H'], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]]],
  ])('bygget %s matcher katalogen', (id, atoms, bonds) => {
    const ids = add(...atoms);
    for (const [i, j, o] of bonds) bond(ids[i], ids[j], o);
    expect(w.signature(ids)).toBe(sigOfMolecule(mol(id)));
  });
  it('rekkefølgen på id-ene spiller ingen rolle', () => {
    const [h1, o, h2] = add('H', 'O', 'H');
    w.tryBond(h2, o); w.tryBond(o, h1);
    expect(w.signature([h2, o, h1])).toBe(w.signature([o, h1, h2]));
  });
  it('bindingsorden teller i signaturen', () => {
    const [a, b] = add('O', 'O');
    w.tryBond(a, b);
    const single = w.signature([a, b]);
    w.tryBond(a, b);
    expect(w.signature([a, b])).not.toBe(single);
  });
  it('bare bindinger innenfor valgt gruppe telles', () => {
    const [a, b, c] = add('H', 'H', 'H');
    w.tryBond(a, b);
    expect(w.signature([a, b])).toBe(sigOfMolecule(mol('h2')));
    expect(w.signature([a, b, c])).not.toBe(w.signature([a, b]));
  });
  it('ioniske signaturer ender på |i', () => {
    const [mg, c1, c2] = add('Mg', 'Cl', 'Cl');
    w.tryBond(mg, c1); w.tryBond(mg, c2);
    const sig = w.signature([mg, c1, c2]);
    expect(sig).toMatch(/\|i$/);
    expect(sig).toBe(sigOfMolecule(mol('mgcl2')));
  });
  it('sigOfMolecule: eksakt format', () => {
    expect(sigOfMolecule({ atoms: ['H', 'H'], bonds: [[0, 1, 1]], ionic: false })).toBe('H2|H-H:1x1');
    expect(sigOfMolecule({ atoms: ['Na', 'Cl'], bonds: [], ionic: true })).toBe('Cl1Na1|i');
  });
});
