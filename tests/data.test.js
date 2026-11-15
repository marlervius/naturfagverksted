import { describe, it, expect } from 'vitest';
import { World, sigOfMolecule } from '../js/chem.js';
import {
  LANGS, ELEMENTS, EL, MOLECULES, LEVELS, TEST_DRAW, TEST_PASS, TESTS, STRINGS, t,
} from '../js/data.js';

const dups = (arr) => arr.filter((x, i) => arr.indexOf(x) !== i);

/** Bygg et katalogmolekyl i en ny World ved å spille av atoms/bonds. */
function build(mol) {
  const w = new World(EL);
  const ids = mol.atoms.map((s) => w.addAtom(s)?.id);
  const log = [];
  if (!mol.ionic) {
    for (const [i, j, o] of mol.bonds) for (let k = 0; k < o; k++) log.push(w.tryBond(ids[i], ids[j]));
  } else {
    // Grådig fordeling: hvert metall gir til ikke-metaller som fortsatt trenger elektroner.
    mol.atoms.forEach((s, i) => {
      if (EL[s].role !== 'metal') return;
      for (let k = 0; k < EL[s].bonds; k++) {
        const target = ids.find((id, j) => EL[mol.atoms[j]].role === 'nonmetal' && w.unpaired(id) > 0);
        if (target === undefined) break;
        log.push(w.tryBond(ids[i], target));
      }
    });
  }
  return { w, ids, log };
}

describe('grunnstoffer', () => {
  it('z = 1..36 i rekkefølge, symboler unike, EL indeksert på symbol', () => {
    expect(ELEMENTS).toHaveLength(36);
    ELEMENTS.forEach((e, i) => expect(e.z).toBe(i + 1));
    expect(dups(ELEMENTS.map((e) => e.sym))).toEqual([]);
    for (const e of ELEMENTS) expect(EL[e.sym]).toBe(e);
  });
  it('skallene summerer til atomnummeret', () => {
    for (const e of ELEMENTS) expect(e.shells.reduce((a, b) => a + b, 0), e.sym).toBe(e.z);
  });
  it('byggbare grunnstoffer har rolle og bonds; andre har null', () => {
    for (const e of ELEMENTS) {
      if (e.buildable) {
        expect(['nonmetal', 'metal', 'noble'], e.sym).toContain(e.role);
        expect(Number.isInteger(e.bonds), e.sym).toBe(true);
      } else {
        expect(e.role, e.sym).toBeNull();
        expect(e.bonds, e.sym).toBeNull();
      }
    }
  });
  it('byggbare: bonds er konsistent med valenselektroner', () => {
    for (const e of ELEMENTS.filter((x) => x.buildable)) {
      if (e.role === 'noble') expect(e.bonds, e.sym).toBe(0);
      else if (e.role === 'metal') expect(e.bonds, e.sym).toBe(e.valence);
      else expect(e.bonds, e.sym).toBe((e.sym === 'H' ? 2 : 8) - e.valence);
    }
  });
  it('edelgasser har null elektronegativitet, andre har tall', () => {
    for (const e of ELEMENTS) {
      if (e.category === 'edelgass') expect(e.en).toBeNull();
      else expect(typeof e.en, e.sym).toBe('number');
    }
  });
});

describe('molekyler: struktur', () => {
  it('har unike id-er og unike formler', () => {
    expect(dups(MOLECULES.map((m) => m.id))).toEqual([]);
    expect(dups(MOLECULES.map((m) => m.formula))).toEqual([]);
  });
  it('har de forventede feltene', () => {
    for (const m of MOLECULES) {
      expect(typeof m.id, m.id).toBe('string');
      expect(typeof m.formula, m.id).toBe('string');
      expect(Array.isArray(m.atoms), m.id).toBe(true);
      expect(Array.isArray(m.bonds), m.id).toBe(true);
      expect(typeof m.ionic, m.id).toBe('boolean');
      expect(m.name, m.id).toBeTruthy();
      if (m.ionic) expect(m.shape == null, m.id).toBe(true); // ioneforbindelser har ingen molekylform
      else expect(m.shape, m.id).toBeTruthy();
      expect(m.fact, m.id).toBeTruthy();
    }
  });
  it('alle atomsymboler finnes i EL og er byggbare', () => {
    for (const m of MOLECULES) {
      for (const s of m.atoms) {
        expect(EL[s], `${m.id}: ${s}`).toBeDefined();
        expect(EL[s].buildable, `${m.id}: ${s}`).toBe(true);
      }
    }
  });
  it('formelen stemmer med atomlisten', () => {
    for (const m of MOLECULES) {
      const fromFormula = {};
      for (const [, s, n] of m.formula.matchAll(/([A-Z][a-z]?)(\d*)/g)) fromFormula[s] = (fromFormula[s] || 0) + (n ? +n : 1);
      const fromAtoms = {};
      m.atoms.forEach((s) => { fromAtoms[s] = (fromAtoms[s] || 0) + 1; });
      expect(fromFormula, m.id).toEqual(fromAtoms);
    }
  });
  it('bindingsindekser er gyldige, ordener 1-3, ingen selvbindinger eller duplikater', () => {
    for (const m of MOLECULES) {
      for (const [i, j, o] of m.bonds) {
        expect(Number.isInteger(i) && i >= 0 && i < m.atoms.length, `${m.id} i=${i}`).toBe(true);
        expect(Number.isInteger(j) && j >= 0 && j < m.atoms.length, `${m.id} j=${j}`).toBe(true);
        expect(i, m.id).not.toBe(j);
        expect([1, 2, 3], m.id).toContain(o);
      }
      const pairs = m.bonds.map(([i, j]) => [Math.min(i, j), Math.max(i, j)].join('-'));
      expect(dups(pairs), `${m.id}: dupliserte bindingspar`).toEqual([]);
    }
  });
  it('ioniske har tom bindingsliste, kovalente har bindinger', () => {
    for (const m of MOLECULES) {
      if (m.ionic) expect(m.bonds, m.id).toEqual([]);
      else expect(m.bonds.length, m.id).toBeGreaterThan(0);
    }
  });
  it('ionisk = metall + ikke-metall; kovalent = bare ikke-metaller', () => {
    for (const m of MOLECULES) {
      const roles = m.atoms.map((s) => EL[s].role);
      if (m.ionic) {
        expect(roles, m.id).toContain('metal');
        expect(roles, m.id).toContain('nonmetal');
      } else {
        expect(roles.every((r) => r === 'nonmetal'), m.id).toBe(true);
      }
    }
  });
  it('kovalente molekyler er sammenhengende', () => {
    for (const m of MOLECULES.filter((x) => !x.ionic)) {
      const { w, ids } = build(m);
      expect(w.component(ids[0]), m.id).toHaveLength(ids.length);
    }
  });
  it('ioniske: metallenes gitte elektroner = ikke-metallenes mottatte', () => {
    for (const m of MOLECULES.filter((x) => x.ionic)) {
      const give = m.atoms.filter((s) => EL[s].role === 'metal').reduce((a, s) => a + EL[s].bonds, 0);
      const take = m.atoms.filter((s) => EL[s].role === 'nonmetal').reduce((a, s) => a + EL[s].bonds, 0);
      expect(give, m.id).toBe(take);
    }
  });
});

describe('molekyler: byggbarhet', () => {
  for (const m of MOLECULES) {
    it(`${m.id} (${m.formula}) bygges, er stabilt og har riktig signatur`, () => {
      const { w, ids, log } = build(m);
      expect(ids.every((x) => x !== undefined)).toBe(true);
      for (const r of log) expect(r.ok, JSON.stringify(r)).toBe(true);
      expect(w.isStable(ids)).toBe(true);
      expect(w.signature(ids)).toBe(sigOfMolecule(m));
      if (m.ionic) {
        expect(ids.reduce((s, id) => s + w.charge(id), 0)).toBe(0);
        for (const id of ids) {
          const metal = w.atoms.get(id).el.role === 'metal';
          expect(metal ? w.charge(id) > 0 : w.charge(id) < 0).toBe(true);
        }
      } else {
        expect(w.bonds.every((b) => b.kind === 'cov')).toBe(true);
      }
    });
  }
  it('ingen to molekyler deler signatur', () => {
    const bySig = {};
    for (const m of MOLECULES) (bySig[sigOfMolecule(m)] ??= []).push(m.id);
    expect(Object.entries(bySig).filter(([, v]) => v.length > 1)).toEqual([]);
  });
});

describe('nivåer', () => {
  it('har unike id-er og påkrevde felt', () => {
    expect(dups(LEVELS.map((l) => l.id))).toEqual([]);
    for (const l of LEVELS) {
      expect(l.chapter, l.id).toBeTruthy();
      expect(l.title, l.id).toBeTruthy();
      expect(l.brief, l.id).toBeTruthy();
      expect(l.hint, l.id).toBeTruthy();
      expect(l.learn, l.id).toBeTruthy();
      expect(l.goal?.type, l.id).toBeTruthy();
    }
  });
  it('alle måltyper er kjente', () => {
    for (const l of LEVELS) expect(['atom', 'molecule', 'event'], l.id).toContain(l.goal.type);
  });
  it('paletten består av byggbare symboler (null = alle)', () => {
    for (const l of LEVELS) {
      if (l.palette == null) continue;
      expect(Array.isArray(l.palette), l.id).toBe(true);
      for (const s of l.palette) expect(EL[s]?.buildable, `${l.id}: ${s}`).toBe(true);
    }
  });
  it('startZ (der det finnes) er et gyldig atomnummer', () => {
    for (const l of LEVELS) {
      if (l.startZ !== undefined) expect(ELEMENTS.some((e) => e.z === l.startZ), l.id).toBe(true);
    }
  });
  it('atom-mål peker på et grunnstoff som finnes', () => {
    for (const l of LEVELS.filter((x) => x.goal.type === 'atom')) {
      expect(l.goal.z !== undefined || l.goal.valence !== undefined, l.id).toBe(true);
      if (l.goal.z !== undefined) expect(ELEMENTS.some((e) => e.z === l.goal.z), l.id).toBe(true);
      if (l.goal.valence !== undefined) expect(ELEMENTS.some((e) => e.valence === l.goal.valence), l.id).toBe(true);
    }
  });
  it('molekyl-mål finnes i katalogen og kan bygges med nivåets palett', () => {
    for (const l of LEVELS.filter((x) => x.goal.type === 'molecule')) {
      const mol = MOLECULES.find((m) => m.id === l.goal.id);
      expect(mol, `${l.id}: ${l.goal.id}`).toBeDefined();
      if (l.palette) {
        for (const s of new Set(mol.atoms)) expect(l.palette, `${l.id} mangler ${s} i paletten`).toContain(s);
      }
    }
  });
  it('event-mål "noble": paletten har edelgass + annet atom, og binding avvises med noble', () => {
    for (const l of LEVELS.filter((x) => x.goal.type === 'event')) {
      expect(l.goal.reason).toBe('noble');
      const noble = l.palette.find((s) => EL[s].role === 'noble');
      const other = l.palette.find((s) => EL[s].role !== 'noble');
      expect(noble).toBeDefined();
      expect(other).toBeDefined();
      const w = new World(EL);
      expect(w.tryBond(w.addAtom(noble).id, w.addAtom(other).id)).toMatchObject({ ok: false, reason: l.goal.reason });
    }
  });
  it('predict (der det finnes) har gyldig correct', () => {
    for (const l of LEVELS) {
      if (!l.predict) continue;
      expect(l.predict.options.length, l.id).toBeGreaterThanOrEqual(2);
      expect(l.predict.correct, l.id).toBeGreaterThanOrEqual(0);
      expect(l.predict.correct, l.id).toBeLessThan(l.predict.options.length);
    }
  });
});

describe('tester', () => {
  const levelIds = LEVELS.map((l) => l.id);
  it('TEST_DRAW og TEST_PASS er fornuftige', () => {
    expect(TEST_DRAW).toBeGreaterThan(0);
    expect(TEST_PASS).toBeGreaterThan(0);
    expect(TEST_PASS).toBeLessThanOrEqual(TEST_DRAW);
  });
  it('unike id-er', () => {
    expect(dups(TESTS.map((x) => x.id))).toEqual([]);
  });
  for (const test of TESTS) {
    describe(test.id, () => {
      it('from/after peker på eksisterende nivåer i riktig rekkefølge', () => {
        expect(levelIds).toContain(test.from);
        expect(levelIds).toContain(test.after);
        expect(levelIds.indexOf(test.from)).toBeLessThanOrEqual(levelIds.indexOf(test.after));
      });
      it('har minst TEST_DRAW spørsmål', () => {
        expect(test.questions.length).toBeGreaterThanOrEqual(TEST_DRAW);
      });
      it('hvert spørsmål har gyldig correct, unike alternativer og forklaring', () => {
        test.questions.forEach((q, i) => {
          const tag = `${test.id} q${i}`;
          expect(Number.isInteger(q.correct), tag).toBe(true);
          expect(q.correct, tag).toBeGreaterThanOrEqual(0);
          expect(q.correct, tag).toBeLessThan(q.options.length);
          expect(q.options.length, tag).toBeGreaterThanOrEqual(2);
          expect(q.why, tag).toBeTruthy();
          for (const lang of LANGS) {
            expect(dups(q.options.map((o) => o[lang])), `${tag} [${lang}] dupliserte alternativer`).toEqual([]);
          }
        });
      });
    });
  }
  it('testblokkene overlapper ikke', () => {
    const ranges = TESTS.map((x) => [levelIds.indexOf(x.from), levelIds.indexOf(x.after)]).sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < ranges.length; i++) expect(ranges[i][0]).toBeGreaterThan(ranges[i - 1][1]);
  });
});

describe('tekstobjekter {enkel, fag}', () => {
  const isText = (o) => o && typeof o === 'object' && !Array.isArray(o) && ('enkel' in o || 'fag' in o);
  const walk = (o, path, visit) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${path}[${i}]`, visit));
    if (!o || typeof o !== 'object') return;
    if (isText(o)) return visit(o, path);
    for (const [k, v] of Object.entries(o)) walk(v, `${path}.${k}`, visit);
  };
  const all = { MOLECULES, LEVELS, TESTS, STRINGS };

  it('alle tekstobjekter har ikke-tom enkel og fag', () => {
    const bad = [];
    walk(all, 'DATA', (o, path) => {
      for (const lang of LANGS) if (typeof o[lang] !== 'string' || !o[lang].trim()) bad.push(`${path}.${lang}`);
    });
    expect(bad).toEqual([]);
  });
  it('sanity: det finnes mange tekstobjekter', () => {
    let n = 0;
    walk(all, 'DATA', () => { n++; });
    expect(n).toBeGreaterThan(500);
  });
  it('alle STRINGS-verdier er tekstobjekter', () => {
    for (const [k, v] of Object.entries(STRINGS)) expect(isText(v), k).toBe(true);
  });
  it('plassholdere {x} er like i enkel og fag', () => {
    const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join(',');
    const bad = [];
    walk(all, 'DATA', (o, path) => { if (ph(o.enkel) !== ph(o.fag)) bad.push(path); });
    expect(bad).toEqual([]);
  });
});

describe('t()', () => {
  it('slår opp STRINGS-nøkkel', () => {
    const k = Object.keys(STRINGS)[0];
    expect(t(k, 'enkel')).toBe(STRINGS[k].enkel);
    expect(t(k, 'fag')).toBe(STRINGS[k].fag);
  });
  it('ukjent streng returneres uendret', () => {
    expect(t('Hallo verden', 'enkel')).toBe('Hallo verden');
  });
  it('objekt velger riktig språk og faller tilbake', () => {
    expect(t({ enkel: 'a', fag: 'b' }, 'enkel')).toBe('a');
    expect(t({ enkel: 'a', fag: 'b' }, 'fag')).toBe('b');
    expect(t({ enkel: 'a', fag: 'b' }, 'xx')).toBe('a');
    expect(t({ fag: 'b' }, 'enkel')).toBe('b');
    expect(t({}, 'enkel')).toBe('');
  });
  it('null/undefined gir tom streng', () => {
    expect(t(null, 'enkel')).toBe('');
    expect(t(undefined, 'fag')).toBe('');
  });
  it('tall konverteres til streng', () => {
    expect(t(5, 'enkel')).toBe('5');
  });
  it('vars fylles inn, ukjente plassholdere beholdes, 0 er gyldig', () => {
    expect(t('Hent {n} {name}', 'enkel', { n: 2, name: 'H' })).toBe('Hent 2 H');
    expect(t('{a} og {b}', 'enkel', { a: 1 })).toBe('1 og {b}');
    expect(t('{n} stk', 'enkel', { n: 0 })).toBe('0 stk');
    expect(t({ enkel: '{x}!', fag: '{x}?' }, 'fag', { x: 'ja' })).toBe('ja?');
  });
  it('vars virker via STRINGS-nøkkel', () => {
    expect(t('co.get', 'enkel', { n: 3, name: 'O' })).toBe('Hent 3 O');
  });
  it('vars på null gir tom streng', () => {
    expect(t(null, 'enkel', { n: 1 })).toBe('');
  });
});
