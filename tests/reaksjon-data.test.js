import { describe, it, expect } from 'vitest';
import { World } from '../molekyl/js/chem.js';
import { EL, MOLECULES, LANGS } from '../molekyl/js/data.js';
import {
  BOND_E, REACTIONS, RX, LEVELS, TEST_DRAW, TEST_PASS, TESTS,
} from '../reaksjon/js/data.js';
import {
  balanceStatus, solution, canReact, estimateDH, productStatus, loadReactants, bondKey, termAtoms, sideCounts,
} from '../reaksjon/js/react.js';

const MOL = Object.fromEntries(MOLECULES.map((m) => [m.id, m]));
const dups = (arr) => arr.filter((x, i) => arr.indexOf(x) !== i);
const TYPES = ['syntese', 'spalting', 'forbrenning', 'redoks', 'substitusjon', 'addisjon'];

const hasIonic = (rx) => [...rx.reactants, ...rx.products].some((t) => t.mol && MOL[t.mol].ionic);
const handsOn = LEVELS.filter((l) => l.goal.mode === 'react' || l.goal.mode === 'both');

describe('BOND_E', () => {
  it('nøklene har riktig format (alfabetisk rekkefølge, orden 1–3) og positive tall', () => {
    for (const [k, v] of Object.entries(BOND_E)) {
      const m = k.match(/^([A-Z][a-z]?)-([A-Z][a-z]?):([123])$/);
      expect(m, k).not.toBeNull();
      expect(bondKey(m[1], m[2], +m[3]), k).toBe(k);
      expect(EL[m[1]]?.buildable && EL[m[2]]?.buildable, k).toBe(true);
      expect(Number.isFinite(v) && v > 0, k).toBe(true);
    }
  });
  it('kjente læreboktall', () => {
    expect(BOND_E['H-H:1']).toBe(436);
    expect(BOND_E['H-O:1']).toBe(463);
    expect(BOND_E['O-O:2']).toBe(498);
    expect(BOND_E['C-O:2']).toBe(799);
    expect(BOND_E['N-N:3']).toBe(945);
  });
  it('flere bindinger mellom samme atomer er sterkere (enkelt < dobbelt < trippel)', () => {
    for (const a of ['C-C', 'N-N']) {
      const e = [1, 2, 3].map((o) => BOND_E[`${a}:${o}`]).filter((x) => x != null);
      for (let i = 1; i < e.length; i++) expect(e[i], a).toBeGreaterThan(e[i - 1]);
    }
    expect(BOND_E['O-O:2']).toBeGreaterThan(BOND_E['O-O:1']);
    expect(BOND_E['C-O:2']).toBeGreaterThan(BOND_E['C-O:1']);
  });
});

describe('reaksjoner', () => {
  it('har unike id-er, og RX er indeksert på id', () => {
    expect(dups(REACTIONS.map((r) => r.id))).toEqual([]);
    expect(Object.keys(RX)).toHaveLength(REACTIONS.length);
    for (const r of REACTIONS) expect(RX[r.id]).toBe(r);
  });
  it('har påkrevde felt og kjent type', () => {
    for (const r of REACTIONS) {
      expect(r.name, r.id).toBeTruthy();
      expect(TYPES, r.id).toContain(r.type);
      expect(r.reactants.length, r.id).toBeGreaterThan(0);
      expect(r.products.length, r.id).toBeGreaterThan(0);
      expect(Number.isFinite(r.dH) && r.dH !== 0, r.id).toBe(true);
      expect(r.fact, r.id).toBeTruthy();
    }
  });
  it('alle ledd er mol, atom eller custom, med positiv heltallig n', () => {
    for (const r of REACTIONS) {
      for (const term of [...r.reactants, ...r.products]) {
        const kinds = ['mol', 'atom', 'custom'].filter((k) => term[k] !== undefined);
        expect(kinds, r.id).toHaveLength(1);
        expect(Number.isInteger(term.n) && term.n >= 1, r.id).toBe(true);
        if (term.mol) expect(MOL[term.mol], `${r.id}: ${term.mol}`).toBeDefined();
        if (term.atom) expect(EL[term.atom]?.buildable, `${r.id}: ${term.atom}`).toBe(true);
        if (term.custom) {
          expect(term.custom.formula, r.id).toBeTruthy();
          expect(term.custom.name, r.id).toBeTruthy();
          expect(Object.keys(term.custom.atoms).length, r.id).toBeGreaterThan(0);
        }
      }
    }
  });
  it('hver reaksjon er balansert med laveste koeffisienter', () => {
    for (const r of REACTIONS) {
      const s = solution(r);
      const st = balanceStatus(r, s.left, s.right, MOL);
      expect(st.balanced, `${r.id} balansert`).toBe(true);
      expect(st.lowest, `${r.id} laveste`).toBe(true);
      expect(st.correct, r.id).toBe(true);
    }
  });
  it('ioneforbindelser har like mange avgitte og opptatte elektroner (ladningsbalanse)', () => {
    for (const r of REACTIONS) {
      for (const t of r.products.filter((x) => x.mol && MOL[x.mol].ionic)) {
        const m = MOL[t.mol];
        const give = m.atoms.filter((s) => EL[s].role === 'metal').reduce((a, s) => a + EL[s].bonds, 0);
        const take = m.atoms.filter((s) => EL[s].role === 'nonmetal').reduce((a, s) => a + EL[s].bonds, 0);
        expect(give, `${r.id}: ${t.mol}`).toBe(take);
      }
    }
  });
  it('tabellverdiene stemmer med kjente referanseverdier (±1 kJ)', () => {
    const expected = {
      hcl: -185, vann: -572, nh3: -92, 'vann-spalt': 572, h2o2: -196, eten: -136, klormetan: -100,
      karbon: -394, metan: -890, etanol: -1367, propan: -2220, nacl: -822, mgo: -1203, na2o: -828,
      al2o3: -3351, fotosyntese: 2803, celleanding: -2803,
    };
    for (const [id, dH] of Object.entries(expected)) expect(Math.abs(RX[id].dH - dH), id).toBeLessThanOrEqual(1);
    expect(Object.keys(expected).sort()).toEqual(REACTIONS.map((r) => r.id).sort());
  });
  it('omvendte reaksjoner har motsatt fortegn og samme tall (vann, fotosyntese)', () => {
    expect(RX['vann-spalt'].dH).toBe(-RX.vann.dH);
    expect(RX.celleanding.dH).toBe(-RX.fotosyntese.dH);
  });
  it('forbrenning og dannelse av oksider er eksoterme', () => {
    for (const r of REACTIONS.filter((x) => x.type === 'forbrenning' || x.type === 'redoks')) {
      if (r.id === 'fotosyntese') continue;
      expect(r.dH, r.id).toBeLessThan(0);
    }
    expect(RX['vann-spalt'].dH).toBeGreaterThan(0);
    expect(RX.fotosyntese.dH).toBeGreaterThan(0);
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
      expect(l.goal?.type, l.id).toBe('reaction');
    }
  });
  it('nivåmål peker på en eksisterende reaksjon og kjent modus', () => {
    for (const l of LEVELS) {
      expect(RX[l.goal.id], `${l.id}: ${l.goal.id}`).toBeDefined();
      expect(['balance', 'react', 'both'], l.id).toContain(l.goal.mode);
    }
  });
  it('mode react/both ⇒ canReact', () => {
    for (const l of handsOn) expect(canReact(RX[l.goal.id], MOL), `${l.id}: ${l.goal.id}`).toBe(true);
  });
  it('reaksjoner med custom-stoffer og store reaksjoner er bare balance', () => {
    for (const l of LEVELS) {
      const rx = RX[l.goal.id];
      if (rx.reactants.concat(rx.products).some((t) => t.custom)) expect(l.goal.mode, l.id).toBe('balance');
    }
    for (const id of ['propan', 'etanol', 'fotosyntese', 'celleanding']) {
      for (const l of LEVELS.filter((x) => x.goal.id === id)) expect(l.goal.mode, l.id).toBe('balance');
    }
  });
  it('første nivå er enkelt: balance, HCl, ingen predict', () => {
    expect(LEVELS[0].goal.mode).toBe('balance');
    expect(LEVELS[0].predict).toBeNull();
    expect(LEVELS[0].goal.id).toBe('hcl');
  });
  it('alle reaksjoner brukes i minst ett nivå', () => {
    const used = new Set(LEVELS.map((l) => l.goal.id));
    for (const r of REACTIONS) expect(used.has(r.id), r.id).toBe(true);
  });
  it('16–18 nivåer i fem kapitler (kapitlene er sammenhengende)', () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(16);
    expect(LEVELS.length).toBeLessThanOrEqual(18);
    const order = [];
    for (const l of LEVELS) if (order[order.length - 1] !== l.chapter) order.push(l.chapter);
    expect(order).toHaveLength(5);
  });
  it('predict har fire alternativer og gyldig correct', () => {
    for (const l of LEVELS) {
      if (!l.predict) continue;
      expect(l.predict.q, l.id).toBeTruthy();
      expect(l.predict.options, l.id).toHaveLength(4);
      expect(Number.isInteger(l.predict.correct), l.id).toBe(true);
      expect(l.predict.correct, l.id).toBeGreaterThanOrEqual(0);
      expect(l.predict.correct, l.id).toBeLessThan(4);
      expect(l.predict.why, l.id).toBeTruthy();
      for (const lang of LANGS) {
        expect(dups(l.predict.options.map((o) => o[lang])), `${l.id} [${lang}] dupliserte alternativer`).toEqual([]);
      }
    }
  });
});

describe('react/both: energi og byggbarhet', () => {
  const rxs = [...new Set(handsOn.map((l) => l.goal.id))].map((id) => RX[id]);

  it('alle kovalente bindinger i reaktanter og produkter finnes i BOND_E', () => {
    for (const rx of rxs) {
      for (const term of [...rx.reactants, ...rx.products]) {
        if (!term.mol || MOL[term.mol].ionic) continue;
        const m = MOL[term.mol];
        for (const [i, j, o] of m.bonds) {
          expect(BOND_E[bondKey(m.atoms[i], m.atoms[j], o)], `${rx.id}: ${term.mol} ${m.atoms[i]}-${m.atoms[j]}:${o}`).toBeDefined();
        }
      }
    }
  });
  it('uten ioner: estimateDH har samme fortegn som dH og er i samme størrelsesorden', () => {
    const covalent = rxs.filter((rx) => !hasIonic(rx));
    expect(covalent.length).toBeGreaterThanOrEqual(5);
    for (const rx of covalent) {
      const est = estimateDH(rx, MOL, BOND_E);
      expect(est, rx.id).not.toBeNull();
      expect(Math.sign(est), rx.id).toBe(Math.sign(rx.dH));
      expect(Math.abs(est - rx.dH) / Math.abs(rx.dH), `${rx.id}: anslag ${est} mot tabell ${rx.dH}`).toBeLessThan(0.25);
    }
  });
  it('med ioner gir estimateDH null (dH vises i stedet)', () => {
    for (const rx of rxs.filter(hasIonic)) expect(estimateDH(rx, MOL, BOND_E), rx.id).toBeNull();
  });
  it('estimateDH for vann: −482 (bindingsenergier) mot −572 (tabell, flytende vann)', () => {
    expect(estimateDH(RX.vann, MOL, BOND_E)).toBe(-482);
    expect(estimateDH(RX['vann-spalt'], MOL, BOND_E)).toBe(482);
  });
  it('reaktantene får plass på benken og er stabile molekyler eller frie atomer', () => {
    for (const rx of rxs) {
      const w = new World(EL);
      const groups = loadReactants(w, rx, MOL);
      expect(w.atoms.size, rx.id).toBeLessThanOrEqual(16);
      for (const g of groups) {
        expect(g.atoms.every(Boolean), rx.id).toBe(true);
        if (g.term.atom) expect(g.atoms, rx.id).toHaveLength(1);
        else expect(w.isStable(g.atoms.map((a) => a.id)), `${rx.id}: ${g.term.mol}`).toBe(true);
      }
    }
  });
  it('produktene KAN bygges i en World av reaktantatomene (productStatus.done)', () => {
    for (const rx of rxs) {
      const w = new World(EL);
      loadReactants(w, rx, MOL);
      expect(productStatus(w, rx, MOL).done, `${rx.id}: ferdig før start`).toBe(false);
      w.bonds.length = 0; // bryt alt
      const pool = {};
      for (const a of w.atoms.values()) (pool[a.sym] ??= []).push(a.id);
      const take = (sym) => {
        const id = pool[sym]?.shift();
        expect(id, `${rx.id}: mangler ${sym} i reaktantene`).toBeDefined();
        return id;
      };
      for (const term of rx.products) {
        const m = MOL[term.mol];
        for (let k = 0; k < term.n; k++) {
          const ids = m.atoms.map(take);
          if (!m.ionic) {
            for (const [i, j, o] of m.bonds) for (let q = 0; q < o; q++) expect(w.tryBond(ids[i], ids[j]).ok, `${rx.id}: ${term.mol}`).toBe(true);
          } else {
            m.atoms.forEach((s, i) => {
              if (EL[s].role !== 'metal') return;
              for (let q = 0; q < EL[s].bonds; q++) {
                const target = ids.find((id, j) => EL[m.atoms[j]].role === 'nonmetal' && w.unpaired(id) > 0);
                expect(target, `${rx.id}: ${term.mol}`).toBeDefined();
                expect(w.tryBond(ids[i], target).ok).toBe(true);
              }
            });
          }
        }
      }
      for (const [sym, left] of Object.entries(pool)) expect(left, `${rx.id}: atomer til overs (${sym})`).toHaveLength(0);
      const st = productStatus(w, rx, MOL);
      expect(st.done, `${rx.id}: ${JSON.stringify(st.items.map((x) => [x.term.mol, x.have, x.need]))} extra=${st.extra} loose=${st.loose}`).toBe(true);
    }
  });
  it('atomtellingen for produktene = reaktantatomene (bench-atomer = atomer i produktsiden)', () => {
    for (const rx of rxs) {
      const l = sideCounts(rx.reactants, rx.reactants.map((t) => t.n), MOL);
      const r = sideCounts(rx.products, rx.products.map((t) => t.n), MOL);
      expect(l, rx.id).toEqual(r);
      for (const term of rx.reactants) expect(Object.keys(termAtoms(term, MOL)).length, rx.id).toBeGreaterThan(0);
    }
  });
});

describe('tester', () => {
  const levelIds = LEVELS.map((l) => l.id);
  it('TEST_DRAW og TEST_PASS er fornuftige', () => {
    expect(TEST_DRAW).toBe(6);
    expect(TEST_PASS).toBe(5);
    expect(TEST_PASS).toBeLessThanOrEqual(TEST_DRAW);
  });
  it('tre blokker med unike id-er', () => {
    expect(TESTS).toHaveLength(3);
    expect(dups(TESTS.map((x) => x.id))).toEqual([]);
  });
  for (const test of TESTS) {
    describe(test.id, () => {
      it('from/after peker på eksisterende nivåer i riktig rekkefølge', () => {
        expect(levelIds).toContain(test.from);
        expect(levelIds).toContain(test.after);
        expect(levelIds.indexOf(test.from)).toBeLessThanOrEqual(levelIds.indexOf(test.after));
      });
      it('har minst 10 spørsmål (og minst TEST_DRAW)', () => {
        expect(test.questions.length).toBeGreaterThanOrEqual(Math.max(10, TEST_DRAW));
      });
      it('hvert spørsmål har fire alternativer, gyldig correct, unike alternativer og forklaring', () => {
        test.questions.forEach((q, i) => {
          const tag = `${test.id} q${i}`;
          expect(q.q, tag).toBeTruthy();
          expect(q.options, tag).toHaveLength(4);
          expect(Number.isInteger(q.correct), tag).toBe(true);
          expect(q.correct, tag).toBeGreaterThanOrEqual(0);
          expect(q.correct, tag).toBeLessThan(q.options.length);
          expect(q.why, tag).toBeTruthy();
          for (const lang of LANGS) {
            expect(dups(q.options.map((o) => o[lang])), `${tag} [${lang}] dupliserte alternativer`).toEqual([]);
          }
        });
      });
      it('ingen spørsmål er duplisert', () => {
        expect(dups(test.questions.map((q) => q.q.enkel))).toEqual([]);
      });
      it('riktig svar står ikke på samme plass mer enn tre ganger på rad', () => {
        const c = test.questions.map((q) => q.correct);
        for (let i = 3; i < c.length; i++) expect(c[i] === c[i - 1] && c[i] === c[i - 2] && c[i] === c[i - 3], `${test.id} rundt q${i}`).toBe(false);
      });
    });
  }
  it('blokkene dekker nivåene i rekkefølge og overlapper ikke', () => {
    const ranges = TESTS.map((x) => [levelIds.indexOf(x.from), levelIds.indexOf(x.after)]).sort((a, b) => a[0] - b[0]);
    expect(ranges[0][0]).toBe(0);
    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i][0]).toBeGreaterThan(ranges[i - 1][1]);
      expect(ranges[i][0]).toBe(ranges[i - 1][1] + 1); // ingen hull
    }
    expect(ranges[ranges.length - 1][1]).toBe(levelIds.length - 1);
  });
  it('blokkene følger kapitlene: t1 = kap. 1–2, t2 = kap. 3–4, t3 = kap. 5', () => {
    const chaptersIn = (t) => new Set(LEVELS.slice(levelIds.indexOf(t.from), levelIds.indexOf(t.after) + 1).map((l) => l.chapter.enkel.slice(0, 10)));
    expect([...chaptersIn(TESTS[0])]).toEqual(['Kapittel 1', 'Kapittel 2']);
    expect([...chaptersIn(TESTS[1])]).toEqual(['Kapittel 3', 'Kapittel 4']);
    expect([...chaptersIn(TESTS[2])]).toEqual(['Kapittel 5']);
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
  const all = { REACTIONS, LEVELS, TESTS };

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
    expect(n).toBeGreaterThan(300);
  });
  it('ingen setning i enkel er lengre enn 28 ord', () => {
    const bad = [];
    walk(all, 'DATA', (o, path) => {
      for (const s of o.enkel.split(/(?<=[.!?])\s+/)) {
        const words = s.trim().split(/\s+/).length;
        if (words > 28) bad.push(`${path}: ${words} ord`);
      }
    });
    expect(bad).toEqual([]);
  });
  it('enkel har gjennomsnittlig setningslengde under 14 ord (A2–B1)', () => {
    let words = 0, sentences = 0;
    walk({ LEVELS, REACTIONS }, 'DATA', (o) => {
      for (const s of o.enkel.split(/(?<=[.!?])\s+/)) { sentences++; words += s.trim().split(/\s+/).length; }
    });
    expect(words / sentences).toBeLessThan(14);
  });
  it('ingen setning sier at bindingsbrudd frigjør energi (unntatt i bevisst gale svaralternativer)', () => {
    const bad = [];
    const scan = (o, path) => {
      for (const lang of LANGS) {
        for (const s of o[lang].split(/(?<=[.!?])\s+/)) {
          if (/(bryt|brudd|brekk)/i.test(s) && /(frigjør|gir ut energi|kommer (det )?ut|energi kommer)/i.test(s)
            && !/(koster|krever|må tilføres|mer energi tilbake|først når|ikke|enn|mer )/i.test(s)) bad.push(`${path}.${lang}: ${s}`);
        }
      }
    };
    for (const r of REACTIONS) scan(r.fact, r.id);
    for (const l of LEVELS) {
      for (const k of ['title', 'brief', 'hint', 'learn']) scan(l[k], `${l.id}.${k}`);
      if (l.predict) { scan(l.predict.q, `${l.id}.q`); scan(l.predict.why, `${l.id}.why`); scan(l.predict.options[l.predict.correct], `${l.id}.correct`); }
    }
    for (const t of TESTS) t.questions.forEach((q, i) => { scan(q.q, `${t.id}q${i}`); scan(q.why, `${t.id}q${i}.why`); scan(q.options[q.correct], `${t.id}q${i}.correct`); });
    expect(bad).toEqual([]);
  });
  it('de gale «brudd frigjør energi»-alternativene finnes som distraktorer, men aldri som riktig svar', () => {
    const wrong = /(bryt|brudd|brekk)/i;
    let distractors = 0;
    for (const t of TESTS) for (const q of t.questions) {
      q.options.forEach((o, i) => {
        if (wrong.test(o.fag) && /(frigjør)/i.test(o.fag) && !/(mer|enn|krever)/i.test(o.fag)) {
          distractors++;
          expect(i, `${t.id}: ${o.fag}`).not.toBe(q.correct);
        }
      });
    }
    expect(distractors).toBeGreaterThanOrEqual(2);
  });
  it('riktig-svar-posisjonene er rimelig spredt (nivå-predict og tester samlet)', () => {
    const pos = [0, 0, 0, 0];
    for (const l of LEVELS) if (l.predict) pos[l.predict.correct]++;
    for (const t of TESTS) for (const q of t.questions) pos[q.correct]++;
    const total = pos.reduce((a, b) => a + b, 0);
    for (const p of pos) {
      expect(p / total).toBeGreaterThan(0.15);
      expect(p / total).toBeLessThan(0.35);
    }
  });
  it('riktig svar er ikke systematisk det lengste alternativet', () => {
    for (const lang of LANGS) {
      let longest = 0, n = 0;
      const check = (options, correct) => {
        n++;
        const len = options.map((o) => o[lang].length);
        const max = Math.max(...len);
        if (len[correct] === max && len.filter((x) => x === max).length === 1) longest++;
      };
      for (const l of LEVELS) if (l.predict) check(l.predict.options, l.predict.correct);
      for (const t of TESTS) for (const q of t.questions) check(q.options, q.correct);
      expect(longest / n, `${lang}: ${longest} av ${n}`).toBeLessThan(0.4);
    }
  });
});
