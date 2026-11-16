import { describe, it, expect } from 'vitest';
import { LANGS } from '../molekyl/js/data.js';
import {
  ORGANELLES, ORG, CELLS, SUBSTANCES, SUB, LEVELS, TEST_DRAW, TEST_PASS, TESTS,
} from '../celle/js/data.js';
import {
  canPlace, createState, addProtein, tick, run, check, parseProtein, buildStatus, energyStatus,
} from '../celle/js/sim.js';

const dups = (arr) => arr.filter((x, i) => arr.indexOf(x) !== i);
const CELL_IDS = ['dyr', 'plante', 'bakterie'];
const builds = LEVELS.filter((l) => l.goal.type === 'build');
const energies = LEVELS.filter((l) => l.goal.type === 'energy');
const transports = LEVELS.filter((l) => l.goal.type === 'transport');

describe('organeller, celler og stoffer', () => {
  it('organell-id-ene er nøyaktig de tolv avtalte, og unike', () => {
    expect(ORGANELLES.map((o) => o.id).sort()).toEqual(
      ['arvestoff', 'cellevegg', 'er', 'flagell', 'golgi', 'kjerne', 'kloroplast', 'lysosom', 'membran', 'mitokondrie', 'ribosom', 'vakuole'],
    );
    expect(dups(ORGANELLES.map((o) => o.id))).toEqual([]);
    expect(Object.keys(ORG)).toHaveLength(12);
  });
  it('organeller har navn, jobb, fakta og gyldige celletyper', () => {
    for (const o of ORGANELLES) {
      for (const k of ['name', 'job', 'fact']) expect(o[k], `${o.id}.${k}`).toBeTruthy();
      expect(o.in.length, o.id).toBeGreaterThan(0);
      for (const c of o.in) expect(CELL_IDS, o.id).toContain(c);
    }
  });
  it('faglige fakta: ribosom i alle, membran i alle, kjerne ikke i bakterier, kloroplast bare i planter', () => {
    expect(ORG.ribosom.in.sort()).toEqual(['bakterie', 'dyr', 'plante']);
    expect(ORG.membran.in.sort()).toEqual(['bakterie', 'dyr', 'plante']);
    expect(ORG.kjerne.in).not.toContain('bakterie');
    expect(ORG.mitokondrie.in).toEqual(expect.arrayContaining(['dyr', 'plante']));
    expect(ORG.mitokondrie.in).not.toContain('bakterie');
    expect(ORG.kloroplast.in).toEqual(['plante']);
    expect(ORG.cellevegg.in.sort()).toEqual(['bakterie', 'plante']);
    expect(ORG.cellevegg.in).not.toContain('dyr');
    expect(ORG.arvestoff.in).toEqual(['bakterie']);
  });
  it('tre celletyper', () => {
    expect(CELLS.map((c) => c.id)).toEqual(CELL_IDS);
    for (const c of CELLS) { expect(c.name).toBeTruthy(); expect(c.about).toBeTruthy(); }
  });
  it('stoffer: unike id-er, gyldig pass, formel og note', () => {
    expect(dups(SUBSTANCES.map((s) => s.id))).toEqual([]);
    expect(Object.keys(SUB)).toHaveLength(SUBSTANCES.length);
    for (const id of ['o2', 'co2', 'h2o', 'glukose', 'na', 'k', 'protein', 'atp']) expect(SUB[id], id).toBeDefined();
    for (const s of SUBSTANCES) {
      expect(['fri', 'protein', 'aldri'], s.id).toContain(s.pass);
      expect(typeof s.formula, s.id).toBe('string');
      expect(s.note, s.id).toBeTruthy();
    }
  });
  it('faglig: O₂/CO₂ fri, glukose og ioner via protein, protein kommer ikke gjennom', () => {
    expect(SUB.o2.pass).toBe('fri');
    expect(SUB.co2.pass).toBe('fri');
    expect(SUB.glukose.pass).toBe('protein');
    expect(SUB.na.pass).toBe('protein');
    expect(SUB.k.pass).toBe('protein');
    expect(SUB.protein.pass).toBe('aldri');
  });
});

describe('nivåer: generelt', () => {
  it('har unike id-er og påkrevde felt', () => {
    expect(dups(LEVELS.map((l) => l.id))).toEqual([]);
    for (const l of LEVELS) {
      for (const k of ['chapter', 'title', 'brief', 'hint', 'learn']) expect(l[k], `${l.id}.${k}`).toBeTruthy();
      expect(['build', 'energy', 'transport'], l.id).toContain(l.goal?.type);
      expect(l.predict === null || typeof l.predict === 'object', l.id).toBe(true);
    }
  });
  it('16–18 nivåer i fire sammenhengende kapitler', () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(16);
    expect(LEVELS.length).toBeLessThanOrEqual(18);
    const order = [];
    for (const l of LEVELS) if (order[order.length - 1] !== l.chapter) order.push(l.chapter);
    expect(order).toHaveLength(4);
  });
  it('kapitlene har riktig type: 1 = build, 2–3 = transport, 4 = energy + transport', () => {
    const byCh = [...new Set(LEVELS.map((l) => l.chapter))].map((c) => LEVELS.filter((l) => l.chapter === c));
    expect(byCh[0].every((l) => l.goal.type === 'build')).toBe(true);
    expect(byCh[1].every((l) => l.goal.type === 'transport')).toBe(true);
    expect(byCh[2].every((l) => l.goal.type === 'transport' && l.goal.setup.osmose)).toBe(true);
    expect(byCh[3].map((l) => l.goal.type)).toEqual(['energy', 'energy', 'transport', 'transport']);
  });
  it('første nivå er enkelt: build, dyrecelle, to deler, ingen predict', () => {
    const l = LEVELS[0];
    expect(l.goal.type).toBe('build');
    expect(l.goal.cell).toBe('dyr');
    expect(l.goal.parts).toHaveLength(2);
    expect(l.goal.tray.length).toBeLessThanOrEqual(3);
    expect(l.predict).toBeNull();
  });
  it('predict har fire unike alternativer og gyldig correct', () => {
    for (const l of LEVELS) {
      if (!l.predict) continue;
      expect(l.predict.q, l.id).toBeTruthy();
      expect(l.predict.options, l.id).toHaveLength(4);
      expect(Number.isInteger(l.predict.correct), l.id).toBe(true);
      expect(l.predict.correct, l.id).toBeGreaterThanOrEqual(0);
      expect(l.predict.correct, l.id).toBeLessThan(4);
      expect(l.predict.why, l.id).toBeTruthy();
      for (const lang of LANGS) expect(dups(l.predict.options.map((o) => o[lang])), `${l.id} [${lang}]`).toEqual([]);
    }
  });
  it('det finnes både build-, energy- og transport-oppdrag', () => {
    expect(builds.length).toBeGreaterThanOrEqual(5);
    expect(energies).toHaveLength(2);
    expect(transports.length).toBeGreaterThanOrEqual(8);
  });
});

describe('build-oppdrag', () => {
  it('parts ⊆ tray, unike, og hver part finnes i celletypen', () => {
    for (const l of builds) {
      const g = l.goal;
      expect(CELL_IDS, l.id).toContain(g.cell);
      expect(dups(g.parts), l.id).toEqual([]);
      expect(dups(g.tray), l.id).toEqual([]);
      for (const p of g.parts) {
        expect(g.tray, `${l.id}: ${p}`).toContain(p);
        expect(ORG[p], `${l.id}: ${p}`).toBeDefined();
        expect(ORG[p].in, `${l.id}: ${p} i ${g.cell}`).toContain(g.cell);
      }
    }
  });
  it('1–3 distraktorer, og hver distraktor gir canPlace().ok === false', () => {
    for (const l of builds) {
      const g = l.goal;
      const distr = g.tray.filter((id) => !g.parts.includes(id));
      expect(distr.length, l.id).toBeGreaterThanOrEqual(1);
      expect(distr.length, l.id).toBeLessThanOrEqual(3);
      for (const d of distr) {
        expect(ORG[d], `${l.id}: ${d}`).toBeDefined();
        expect(canPlace(d, new Set(), g, ORG).ok, `${l.id}: ${d}`).toBe(false);
      }
      for (const p of g.parts) expect(canPlace(p, new Set(), g, ORG).ok, `${l.id}: ${p}`).toBe(true);
    }
  });
  it('oppdraget kan løses ved å sette inn alle parts', () => {
    for (const l of builds) {
      const placed = new Set();
      for (const p of l.goal.parts) placed.add(p);
      expect(buildStatus(placed, l.goal).done, l.id).toBe(true);
      expect(buildStatus(new Set(), l.goal).done, l.id).toBe(false);
    }
  });
  it('dyrecellen vokser: hvert dyre-steg inneholder forrige', () => {
    const dyr = builds.filter((l) => l.goal.cell === 'dyr');
    expect(dyr.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < dyr.length; i++) for (const p of dyr[i - 1].goal.parts) expect(dyr[i].goal.parts, dyr[i].id).toContain(p);
  });
  it('alle tre celletyper bygges', () => {
    expect(new Set(builds.map((l) => l.goal.cell))).toEqual(new Set(CELL_IDS));
  });
  it('misoppfatninger testes: kloroplast i dyrecelle og kjerne i bakterie er distraktorer', () => {
    const isDistr = (cell, id) => builds.some((l) => l.goal.cell === cell && l.goal.tray.includes(id) && !l.goal.parts.includes(id));
    expect(isDistr('dyr', 'kloroplast')).toBe(true);
    expect(isDistr('bakterie', 'kjerne')).toBe(true);
    expect(isDistr('bakterie', 'mitokondrie')).toBe(true);
    expect(isDistr('dyr', 'cellevegg')).toBe(true);
  });
  it('bakterien har ingen kjerne og ingen mitokondrie, men ribosom og cellevegg; planten har både kloroplast og mitokondrie', () => {
    const bak = builds.find((l) => l.goal.cell === 'bakterie').goal.parts;
    expect(bak).not.toContain('kjerne');
    expect(bak).not.toContain('mitokondrie');
    expect(bak).toEqual(expect.arrayContaining(['arvestoff', 'cellevegg', 'ribosom', 'flagell']));
    const pl = builds.find((l) => l.goal.cell === 'plante').goal.parts;
    expect(pl).toEqual(expect.arrayContaining(['kloroplast', 'mitokondrie', 'cellevegg', 'vakuole']));
  });
});

describe('energy-oppdrag', () => {
  it('stoffene finnes, inputs ⊆ tray, og distraktorer finnes', () => {
    for (const l of energies) {
      const g = l.goal;
      expect(['mitokondrie', 'kloroplast'], l.id).toContain(g.organelle);
      expect(ORG[g.organelle], l.id).toBeDefined();
      for (const id of [...g.inputs, ...g.outputs, ...g.tray]) expect(SUB[id], `${l.id}: ${id}`).toBeDefined();
      for (const id of g.inputs) expect(g.tray, `${l.id}: ${id}`).toContain(id);
      expect(g.tray.length, l.id).toBeGreaterThan(g.inputs.length);
      expect(dups(g.tray), l.id).toEqual([]);
    }
  });
  it('celleånding: glukose + O₂ → CO₂ + H₂O + ATP (ikke lys); fotosyntese: CO₂ + H₂O (+ lys) → glukose + O₂', () => {
    const m = energies.find((l) => l.goal.organelle === 'mitokondrie').goal;
    expect([...m.inputs].sort()).toEqual(['glukose', 'o2']);
    expect([...m.outputs].sort()).toEqual(['atp', 'co2', 'h2o']);
    expect(m.light).toBeFalsy();
    const k = energies.find((l) => l.goal.organelle === 'kloroplast').goal;
    expect([...k.inputs].sort()).toEqual(['co2', 'h2o']);
    expect([...k.outputs].sort()).toEqual(['glukose', 'o2']);
    expect(k.light).toBe(true);
  });
  it('riktig valg løser oppdraget, og feil/ manglende lys gjør det ikke', () => {
    for (const l of energies) {
      const g = l.goal;
      expect(energyStatus(new Set(g.inputs), g, true).done, l.id).toBe(true);
      expect(energyStatus(new Set(g.inputs), g, false).done, l.id).toBe(!g.light);
      for (const d of g.tray.filter((id) => !g.inputs.includes(id))) {
        expect(energyStatus(new Set([...g.inputs, d]), g, true).done, `${l.id}: ${d}`).toBe(false);
      }
      expect(energyStatus(new Set(), g, true).done, l.id).toBe(false);
    }
  });
  it('koblingen til Reaksjonsverkstedet er nevnt i learn', () => {
    for (const l of energies) expect(l.learn.enkel + l.learn.fag, l.id).toMatch(/Reaksjonsverkstedet/);
  });
});

describe('transport-oppdrag', () => {
  const PASS_OK = ['kanal', 'baerer', 'pumpe'];
  const mkState = (l, solution) => {
    const s = createState(l.goal.setup);
    if (solution) {
      for (const p of solution.proteins || []) expect(addProtein(s, p), `${l.id}: ${p}`).toBe(true);
      if (solution.outside != null) s.osmose.outside = solution.outside;
    }
    return s;
  };
  const maxHeld = (s, sec, l, dt = 0.05) => {
    let m = 0;
    for (let t = 0; t < sec - 1e-9; t += dt) { tick(s, dt, SUB, l.goal.target); m = Math.max(m, s.held); }
    return m;
  };

  it('struktur: setup, target, hold, solution', () => {
    for (const l of transports) {
      const g = l.goal;
      expect(g.setup, l.id).toBeTruthy();
      expect(Array.isArray(g.target) && g.target.length > 0, l.id).toBe(true);
      expect(g.hold, l.id).toBeGreaterThanOrEqual(1);
      expect(g.hold, l.id).toBeLessThanOrEqual(4);
      expect(g.solution, l.id).toBeTruthy();
      expect(Array.isArray(g.solution.proteins), l.id).toBe(true);
    }
  });
  it('alle stoffer i setup og target finnes (SUB), og tools/proteins er gyldige', () => {
    for (const l of transports) {
      const { setup, target } = l.goal;
      for (const s of setup.subs || []) expect(SUB[s.id], `${l.id}: ${s.id}`).toBeDefined();
      for (const str of [...(setup.tools || []), ...(setup.proteins || []), ...l.goal.solution.proteins]) {
        const p = parseProtein(str);
        expect(PASS_OK, `${l.id}: ${str}`).toContain(p.type);
        expect(SUB[p.sub], `${l.id}: ${str}`).toBeDefined();
        expect(SUB[p.sub].pass, `${l.id}: ${str} (protein-stoffer)`).toBe('protein');
        if (p.type === 'pumpe') expect(['inn', 'ut']).toContain(p.dir);
      }
      for (const c of target) {
        if (c.sub) { expect(SUB[c.sub], `${l.id}: ${c.sub}`).toBeDefined(); expect(['in', 'out']).toContain(c.side); expect(['>=', '<=']).toContain(c.op); expect(Number.isFinite(c.n)).toBe(true); }
        else if (c.equal) expect(SUB[c.equal], `${l.id}: ${c.equal}`).toBeDefined();
        else if (c.shape) { expect(['normal', 'stram', 'krympet', 'svulmet', 'sprukket']).toContain(c.shape); expect(setup.osmose, l.id).toBeTruthy(); }
        else if (c.atpMin != null) expect(c.atpMin).toBeGreaterThan(0);
        else if (c.noProtein) expect(PASS_OK).toContain(c.noProtein);
        else throw new Error(`${l.id}: ukjent vilkår ${JSON.stringify(c)}`);
      }
      const ids = (setup.subs || []).map((s) => s.id);
      expect(dups(ids), l.id).toEqual([]);
      for (const k of Object.keys(setup.inside?.use || {})) expect(ids, `${l.id}: use ${k}`).toContain(k);
      for (const k of Object.keys(setup.inside?.make || {})) if (k !== 'atp') expect(ids, `${l.id}: make ${k}`).toContain(k);
    }
  });
  it('løsningens proteiner er tilgjengelige: fra tools, maks 4 per slag', () => {
    for (const l of transports) {
      const tools = l.goal.setup.tools || [];
      const counts = {};
      for (const p of l.goal.solution.proteins) {
        expect(tools, `${l.id}: ${p}`).toContain(p);
        counts[p] = (counts[p] || 0) + 1;
        expect(counts[p], `${l.id}: ${p}`).toBeLessThanOrEqual(4);
      }
    }
  });
  it('osmose-løsninger ligger i slider-området [0,4, 2,5] og bare der slider er på', () => {
    for (const l of transports) {
      const o = l.goal.setup.osmose;
      if (l.goal.solution.outside != null) {
        expect(o && o.slider, l.id).toBe(true);
        expect(l.goal.solution.outside, l.id).toBeGreaterThanOrEqual(0.4);
        expect(l.goal.solution.outside, l.id).toBeLessThanOrEqual(2.5);
      }
      if (o && o.slider) expect(l.goal.solution.outside, l.id).toBeDefined();
      if (o) { expect(o.outside).toBeGreaterThanOrEqual(0.4); expect(o.outside).toBeLessThanOrEqual(2.5); }
    }
  });
  it('(a) uten elevhandling er målet IKKE oppfylt etter 30 s – med mindre nivået er observe', () => {
    for (const l of transports.filter((x) => !x.goal.observe)) {
      const s = mkState(l);
      expect(run(s, 30, SUB, l.goal.target).done, `${l.id} er allerede løst uten handling`).toBe(false);
      const s2 = mkState(l);
      expect(maxHeld(s2, 30, l), `${l.id}: held nådde hold uten handling`).toBeLessThan(l.goal.hold);
    }
  });
  it('(a2) observe-oppdrag løses uten handling, og er løst ved slutten', () => {
    const obs = transports.filter((x) => x.goal.observe);
    expect(obs.length).toBeGreaterThanOrEqual(3);
    for (const l of obs) {
      expect(l.goal.solution.proteins, l.id).toEqual([]);
      const s = mkState(l);
      expect(check(s, l.goal.target).done, `${l.id}: ikke løst fra start`).toBe(false);
      expect(maxHeld(s, 40, l), l.id).toBeGreaterThanOrEqual(l.goal.hold);
      expect(check(s, l.goal.target).done, l.id).toBe(true);
    }
  });
  it('(b) solution løser oppdraget innen 40 s: held ≥ hold og run() ender med done', () => {
    for (const l of transports) {
      const s = mkState(l, l.goal.solution);
      const m = maxHeld(s, 40, l);
      expect(m, `${l.id}: held ${m}`).toBeGreaterThanOrEqual(l.goal.hold);
      expect(check(s, l.goal.target).done, `${l.id}: ikke done ved slutt`).toBe(true);
      const s2 = mkState(l, l.goal.solution);
      expect(run(s2, 40, SUB, l.goal.target).done, l.id).toBe(true);
    }
  });
  it('(b2) løsningen holder også med god margin: løst før 20 s', () => {
    for (const l of transports) {
      const s = mkState(l, l.goal.solution);
      expect(maxHeld(s, 20, l), l.id).toBeGreaterThanOrEqual(l.goal.hold);
    }
  });
  it('(b3) margin: mengdemål nås med minst 1 enhet å gode (ikke bare så vidt)', () => {
    for (const l of transports) {
      const s = mkState(l, l.goal.solution);
      for (let t = 0; t < 40; t += 0.05) tick(s, 0.05, SUB, l.goal.target);
      for (const it of check(s, l.goal.target).items) {
        const c = it.cond;
        if (c.sub) {
          const slack = c.op === '>=' ? it.value - c.n : c.n - it.value;
          expect(slack, `${l.id}: ${c.sub} ${c.op} ${c.n}, verdi ${it.value}`).toBeGreaterThanOrEqual(1);
        }
        if (c.atpMin != null) expect(it.value - c.atpMin, `${l.id}: ATP ${it.value}`).toBeGreaterThanOrEqual(1);
      }
    }
  });
  it('osmose: løsningen tåler små avvik i slideren (±0,1)', () => {
    for (const l of transports.filter((x) => x.goal.solution.outside != null)) {
      for (const d of [-0.1, 0.1]) {
        const s = mkState(l, { proteins: [], outside: l.goal.solution.outside + d });
        expect(run(s, 40, SUB, l.goal.target).done, `${l.id} ${d}`).toBe(true);
      }
    }
  });
  it('osmose: feil verdier i slideren løser ikke oppdraget', () => {
    for (const l of transports.filter((x) => x.goal.solution.outside != null)) {
      for (const o of [0.4, 2.5]) {
        if (Math.abs(o - l.goal.solution.outside) < 0.3 && l.goal.target[0].shape === 'stram') continue;
        const s = mkState(l, { proteins: [], outside: o });
        const done = run(s, 40, SUB, l.goal.target).done;
        const isOk = l.goal.target[0].shape === 'stram' ? o <= 1.2 : Math.abs(o - l.goal.setup.osmose.solute) < 0.2;
        expect(done, `${l.id} outside=${o}`).toBe(isOk);
      }
    }
  });

  describe('spesifikke fagpoeng', () => {
    it('Na⁺-pumpa (c10): umulig med bare kanal (opptil 4), mulig med pumpe og ATP-en som finnes', () => {
      const l = LEVELS.find((x) => x.id === 'c10');
      for (let n = 0; n <= 4; n++) {
        const s = mkState(l, { proteins: Array(n).fill('kanal:na') });
        expect(run(s, 40, SUB, l.goal.target).done, `${n} kanaler`).toBe(false);
      }
      const s = mkState(l, l.goal.solution);
      expect(run(s, 40, SUB, l.goal.target).done).toBe(true);
      expect(s.atp, 'ATP brukes, men ikke alt').toBeGreaterThan(0);
      expect(s.atpUsed).toBeGreaterThan(0);
      // uten ATP stopper pumpa
      const dead = createState({ ...l.goal.setup, atp: 0 });
      for (const p of l.goal.solution.proteins) addProtein(dead, p);
      expect(run(dead, 40, SUB, l.goal.target).done).toBe(false);
    });
    it('ionekanal-oppdraget (c09) løses passivt, men ikke med pumpe (noProtein)', () => {
      const l = LEVELS.find((x) => x.id === 'c09');
      expect(l.goal.target.some((c) => c.noProtein === 'pumpe')).toBe(true);
      const s = mkState(l, { proteins: ['pumpe:na:inn', 'pumpe:na:inn'] });
      expect(run(s, 40, SUB, l.goal.target).done).toBe(false); // pumpe teller ikke
    });
    it('glukose (c08) kommer ikke inn uten bærer, og kanal for Na⁺ hjelper ikke', () => {
      const l = LEVELS.find((x) => x.id === 'c08');
      const s = mkState(l);
      run(s, 40, SUB, l.goal.target);
      expect(s.subs.glukose.in).toBe(0);
    });
    it('observe-nivåene er diffusjon (O₂, CO₂) og plantecelle i ferskvann', () => {
      expect(transports.filter((x) => x.goal.observe).map((x) => x.id)).toEqual(['c06', 'c07', 'c13']);
    });
    it('diffusjon stopper ved likevekt (c07): lik konsentrasjon ute og inni', () => {
      const l = LEVELS.find((x) => x.id === 'c07');
      expect(l.goal.target.some((c) => c.equal === 'co2')).toBe(true);
    });
    it('osmose: dyrecelle sprekker i svært fortynnet løsning, plantecelle gjør det ikke', () => {
      const dyr = createState({ subs: [], osmose: { solute: 1, outside: 0.4, wall: false } });
      const plante = createState({ subs: [], osmose: { solute: 1, outside: 0.4, wall: true } });
      for (let t = 0; t < 40; t += 0.05) { tick(dyr, 0.05, SUB, []); tick(plante, 0.05, SUB, []); }
      expect(dyr.burst).toBe(true);
      expect(plante.burst).toBe(false);
    });
    it('osmose-oppdragene: dyrecelle (ferskvann og saltvann) og plantecelle (turgor og plasmolyse)', () => {
      const os = transports.filter((x) => x.goal.setup.osmose);
      expect(os.map((x) => !!x.goal.setup.osmose.wall)).toEqual([false, false, true, true]);
      const fersk = os[0].goal.setup.osmose, salt = os[1].goal.setup.osmose;
      expect(fersk.outside).toBeLessThan(fersk.solute);
      expect(salt.outside).toBeGreaterThan(salt.solute);
      expect(os[3].goal.setup.osmose.outside).toBeGreaterThan(os[3].goal.setup.osmose.solute);
    });
    it('ATP-oppdragene: uten glukose-bærer stiger ikke ATP (c17, c18)', () => {
      for (const id of ['c17', 'c18']) {
        const l = LEVELS.find((x) => x.id === id);
        const s = mkState(l);
        for (let t = 0; t < 40; t += 0.05) tick(s, 0.05, SUB, l.goal.target);
        expect(s.atp, id).toBeLessThan(1);
      }
    });
    it('c18: ATP holder seg over 0 med bærer, selv om pumpa jobber hele tiden', () => {
      const l = LEVELS.find((x) => x.id === 'c18');
      const s = mkState(l, l.goal.solution);
      let min = Infinity;
      for (let t = 0; t < 40; t += 0.05) { tick(s, 0.05, SUB, l.goal.target); min = Math.min(min, s.atp); }
      expect(min).toBeGreaterThan(0.5);
      expect(s.atpUsed).toBeGreaterThan(20);
      expect(s.subs.o2.in).toBeGreaterThan(1); // O₂ tar ikke slutt
      expect(s.subs.glukose.out + s.subs.glukose.in).toBeGreaterThan(10);
    });
  });
});

describe('tester', () => {
  const levelIds = LEVELS.map((l) => l.id);
  it('TEST_DRAW og TEST_PASS', () => {
    expect(TEST_DRAW).toBe(6);
    expect(TEST_PASS).toBe(5);
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
        expect(test.title).toBeTruthy();
      });
      it('har minst 10 spørsmål', () => {
        expect(test.questions.length).toBeGreaterThanOrEqual(Math.max(10, TEST_DRAW));
      });
      it('hvert spørsmål har fire unike alternativer, gyldig correct og forklaring', () => {
        test.questions.forEach((q, i) => {
          const tag = `${test.id} q${i}`;
          expect(q.q, tag).toBeTruthy();
          expect(q.options, tag).toHaveLength(4);
          expect(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4, tag).toBe(true);
          expect(q.why, tag).toBeTruthy();
          for (const lang of LANGS) expect(dups(q.options.map((o) => o[lang])), `${tag} [${lang}]`).toEqual([]);
        });
      });
      it('ingen spørsmål er duplisert', () => {
        expect(dups(test.questions.map((q) => q.q.enkel))).toEqual([]);
      });
      it('riktig svar står ikke på samme plass mer enn tre ganger på rad', () => {
        const c = test.questions.map((q) => q.correct);
        for (let i = 3; i < c.length; i++) expect(c[i] === c[i - 1] && c[i] === c[i - 2] && c[i] === c[i - 3], `${test.id} q${i}`).toBe(false);
      });
    });
  }
  it('blokkene dekker nivåene i rekkefølge, uten hull og overlapp', () => {
    const ranges = TESTS.map((x) => [levelIds.indexOf(x.from), levelIds.indexOf(x.after)]).sort((a, b) => a[0] - b[0]);
    expect(ranges[0][0]).toBe(0);
    for (let i = 1; i < ranges.length; i++) expect(ranges[i][0]).toBe(ranges[i - 1][1] + 1);
    expect(ranges[ranges.length - 1][1]).toBe(levelIds.length - 1);
  });
  it('blokkene følger kapitlene: t1 = kap. 1, t2 = kap. 2–3, t3 = kap. 4', () => {
    const chaptersIn = (t) => [...new Set(LEVELS.slice(levelIds.indexOf(t.from), levelIds.indexOf(t.after) + 1).map((l) => l.chapter.enkel.slice(0, 10)))];
    expect(chaptersIn(TESTS[0])).toEqual(['Kapittel 1']);
    expect(chaptersIn(TESTS[1])).toEqual(['Kapittel 2', 'Kapittel 3']);
    expect(chaptersIn(TESTS[2])).toEqual(['Kapittel 4']);
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
  const all = { ORGANELLES, CELLS, SUBSTANCES, LEVELS, TESTS };
  const sentences = (s) => s.split(/(?<=[.!?])\s+/);

  it('alle tekstobjekter har ikke-tom enkel og fag', () => {
    const bad = [];
    walk(all, 'DATA', (o, path) => {
      for (const lang of LANGS) if (typeof o[lang] !== 'string' || !o[lang].trim()) bad.push(`${path}.${lang}`);
    });
    expect(bad).toEqual([]);
  });
  it('det finnes mange tekstobjekter', () => {
    let n = 0;
    walk(all, 'DATA', () => { n++; });
    expect(n).toBeGreaterThan(300);
  });
  it('ingen setning i enkel er lengre enn 28 ord', () => {
    const bad = [];
    walk(all, 'DATA', (o, path) => {
      for (const s of sentences(o.enkel)) {
        const w = s.trim().split(/\s+/).length;
        if (w > 28) bad.push(`${path}: ${w} ord`);
      }
    });
    expect(bad).toEqual([]);
  });
  it('enkel har gjennomsnittlig setningslengde under 14 ord (A2–B1)', () => {
    let words = 0, n = 0;
    walk({ LEVELS, ORGANELLES, CELLS, SUBSTANCES }, 'DATA', (o) => {
      for (const s of sentences(o.enkel)) { n++; words += s.trim().split(/\s+/).length; }
    });
    expect(words / n).toBeLessThan(14);
  });
  it('ingen riktig tekst sier at mitokondriet/cellen «lager energi» (energi overføres)', () => {
    const re = /(lager|produserer|skaper|danner)\s+(ny\s+)?energi(?!\s+av ingenting)/i;
    const bad = [];
    const scan = (o, path) => { for (const lang of LANGS) for (const s of sentences(o[lang])) if (re.test(s) && !/(ikke|kan ikke)/i.test(s)) bad.push(`${path}.${lang}: ${s}`); };
    for (const o of ORGANELLES) { scan(o.job, o.id); scan(o.fact, o.id); }
    for (const l of LEVELS) {
      for (const k of ['title', 'brief', 'hint', 'learn']) scan(l[k], `${l.id}.${k}`);
      if (l.predict) { scan(l.predict.why, `${l.id}.why`); scan(l.predict.options[l.predict.correct], `${l.id}.correct`); }
    }
    for (const t of TESTS) t.questions.forEach((q, i) => { scan(q.why, `${t.id}q${i}.why`); scan(q.options[q.correct], `${t.id}q${i}.correct`); });
    expect(bad).toEqual([]);
  });
  it('ingen riktig tekst sier at ATP «inneholder» energi som «frigjøres» ved brudd', () => {
    const bad = [];
    const re = /ATP[^.]*(inneholder|lagrer)[^.]*energi|(bryte|brudd|brekk)[^.]*ATP[^.]*(frigjør|gir ut)/i;
    const scan = (o, path) => { for (const lang of LANGS) for (const s of sentences(o[lang])) if (re.test(s)) bad.push(`${path}.${lang}: ${s}`); };
    walk({ ORGANELLES, LEVELS }, 'DATA', scan);
    for (const t of TESTS) t.questions.forEach((q, i) => { scan(q.why, `${t.id}q${i}.why`); scan(q.options[q.correct], `${t.id}q${i}.correct`); });
    expect(bad).toEqual([]);
  });
  it('misoppfatningene finnes som distraktorer, men aldri som riktig svar', () => {
    const miss = [
      /planter har ikke mitokondrier|ikke mitokondrier|bare dyr trenger mitokondrier|bare i dyreceller/i,
      /salt(et)? er tørt/i,
      /ATP.*diffusjon|diffusjon.*ATP/i,
      /alle stoffer går fritt|går rett gjennom, som O₂|Membranen er tett for alle|helt tett/i,
      /fra jorda/i,
      /to ord for det samme/i,
      /har cellekjerne|i en cellekjerne/i,
    ];
    const hits = miss.map(() => 0);
    const options = [];
    for (const l of LEVELS) if (l.predict) options.push([l.predict.options, l.predict.correct, l.id]);
    for (const t of TESTS) for (const q of t.questions) options.push([q.options, q.correct, t.id]);
    for (const [opts, correct, tag] of options) {
      opts.forEach((o, i) => miss.forEach((re, k) => {
        if (re.test(o.enkel) || re.test(o.fag)) {
          // «Ja, ... ATP» og lignende riktige svar kan inneholde ordene; vi sjekker bare at det finnes distraktorer
          hits[k]++;
          if (k === 1 || k === 4 || k === 5 || k === 6) expect(i, `${tag}: ${o.enkel}`).not.toBe(correct);
        }
      }));
    }
    for (const k of [0, 1, 3, 4, 5, 6]) expect(hits[k], `misoppfatning ${k}`).toBeGreaterThanOrEqual(1);
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
      const check1 = (options, correct) => {
        n++;
        const len = options.map((o) => o[lang].length);
        const max = Math.max(...len);
        if (len[correct] === max && len.filter((x) => x === max).length === 1) longest++;
      };
      for (const l of LEVELS) if (l.predict) check1(l.predict.options, l.predict.correct);
      for (const t of TESTS) for (const q of t.questions) check1(q.options, q.correct);
      expect(longest / n, `${lang}: ${longest} av ${n}`).toBeLessThan(0.4);
    }
  });
});
