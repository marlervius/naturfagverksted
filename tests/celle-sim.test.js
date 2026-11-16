import { describe, it, expect } from 'vitest';
import {
  canPlace, buildStatus, energyStatus, createState, parseProtein, addProtein, removeProtein,
  conc, step, tick, run, check, osmoseShape, RATE, VOLUME,
} from '../celle/js/sim.js';

const SUB = {
  o2: { pass: 'fri' }, co2: { pass: 'fri' }, glukose: { pass: 'protein' }, na: { pass: 'protein' }, protein: { pass: 'aldri' },
};
const ORG = {
  membran: { in: ['dyr', 'plante', 'bakterie'] },
  kjerne: { in: ['dyr', 'plante'] },
  kloroplast: { in: ['plante'] },
  mito: { in: ['dyr', 'plante'] },
};
const total = (s, id) => s.subs[id].in + s.subs[id].out;
const simulate = (s, sec, dt = 0.05, target = []) => { for (let t = 0; t < sec - 1e-9; t += dt) tick(s, dt, SUB, target); };

describe('build', () => {
  const goal = { type: 'build', cell: 'dyr', parts: ['membran', 'kjerne'] };
  it('canPlace: ok for en del av oppdraget', () => {
    expect(canPlace('kjerne', new Set(), goal, ORG)).toEqual({ ok: true });
  });
  it('canPlace: already', () => {
    expect(canPlace('kjerne', new Set(['kjerne']), goal, ORG)).toEqual({ ok: false, reason: 'already' });
  });
  it('canPlace: wrongCell når organellen ikke finnes i celletypen', () => {
    expect(canPlace('kloroplast', new Set(), goal, ORG)).toEqual({ ok: false, reason: 'wrongCell' });
  });
  it('canPlace: notNeeded når den finnes i celletypen, men ikke er med i oppdraget', () => {
    expect(canPlace('mito', new Set(), goal, ORG)).toEqual({ ok: false, reason: 'notNeeded' });
  });
  it('canPlace: ukjent id gir wrongCell', () => {
    expect(canPlace('finnesikke', new Set(), goal, ORG).reason).toBe('wrongCell');
  });
  it('buildStatus teller og lister manglende', () => {
    expect(buildStatus(new Set(), goal)).toEqual({ done: false, have: 0, need: 2, missing: ['membran', 'kjerne'] });
    expect(buildStatus(new Set(['membran']), goal)).toEqual({ done: false, have: 1, need: 2, missing: ['kjerne'] });
    expect(buildStatus(new Set(['kjerne', 'membran']), goal)).toEqual({ done: true, have: 2, need: 2, missing: [] });
  });
});

describe('energy', () => {
  const mito = { type: 'energy', organelle: 'mitokondrie', inputs: ['glukose', 'o2'], outputs: ['co2', 'h2o', 'atp'] };
  const kloro = { type: 'energy', organelle: 'kloroplast', inputs: ['co2', 'h2o'], outputs: ['glukose', 'o2'], light: true };
  it('riktige stoffer uten lys-krav', () => {
    expect(energyStatus(new Set(['glukose', 'o2']), mito)).toMatchObject({ done: true, missing: [], wrong: [], lightOk: true });
  });
  it('manglende og gale stoffer', () => {
    const st = energyStatus(new Set(['glukose', 'co2']), mito);
    expect(st.done).toBe(false);
    expect(st.missing).toEqual(['o2']);
    expect(st.wrong).toEqual(['co2']);
  });
  it('fotosyntese krever lys', () => {
    const chosen = new Set(['co2', 'h2o']);
    expect(energyStatus(chosen, kloro, false)).toMatchObject({ done: false, lightOk: false });
    expect(energyStatus(chosen, kloro, true)).toMatchObject({ done: true, lightOk: true });
  });
  it('lys har ingen betydning når målet ikke krever det', () => {
    expect(energyStatus(new Set(['glukose', 'o2']), mito, true).done).toBe(true);
  });
});

describe('proteiner', () => {
  it('parseProtein', () => {
    expect(parseProtein('kanal:na')).toEqual({ type: 'kanal', sub: 'na', dir: null });
    expect(parseProtein('pumpe:na:ut')).toEqual({ type: 'pumpe', sub: 'na', dir: 'ut' });
    expect(parseProtein('pumpe:na')).toEqual({ type: 'pumpe', sub: 'na', dir: 'inn' });
    expect(parseProtein('baerer:glukose').type).toBe('baerer');
  });
  it('maks 4 av samme slag, men ulik retning/stoff telles hver for seg', () => {
    const s = createState({ subs: [{ id: 'na', out: 5, in: 5 }] });
    for (let i = 0; i < 4; i++) expect(addProtein(s, 'kanal:na')).toBe(true);
    expect(addProtein(s, 'kanal:na')).toBe(false);
    expect(s.proteins).toHaveLength(4);
    expect(addProtein(s, 'pumpe:na:ut')).toBe(true);
    expect(addProtein(s, 'pumpe:na:inn')).toBe(true);
  });
  it('removeProtein fjerner ett av slaget', () => {
    const s = createState({ subs: [] });
    addProtein(s, 'kanal:na'); addProtein(s, 'kanal:na');
    expect(removeProtein(s, 'kanal:na')).toBe(true);
    expect(s.proteins).toHaveLength(1);
    expect(removeProtein(s, 'baerer:glukose')).toBe(false);
    expect(removeProtein(s, 'kanal:na')).toBe(true);
    expect(removeProtein(s, 'kanal:na')).toBe(false);
  });
  it('createState leser start-proteiner og atp', () => {
    const s = createState({ subs: [], proteins: ['kanal:na', 'pumpe:na:ut'], atp: 7 });
    expect(s.proteins).toHaveLength(2);
    expect(s.atp).toBe(7);
    expect(s.osmose).toBeNull();
  });
});

describe('fri diffusjon', () => {
  it('utjevner til likevekt og bevarer total mengde', () => {
    const s = createState({ subs: [{ id: 'o2', out: 14, in: 2 }] });
    simulate(s, 10);
    expect(s.subs.o2.in).toBeCloseTo(8, 2);
    expect(s.subs.o2.out).toBeCloseTo(8, 2);
    expect(total(s, 'o2')).toBeCloseTo(16, 9);
  });
  it('går også ut når det er mest inni', () => {
    const s = createState({ subs: [{ id: 'co2', out: 2, in: 14 }] });
    simulate(s, 10);
    expect(s.subs.co2.out).toBeCloseTo(8, 2);
  });
  it('i likevekt skjer ingen netto flytting og ingen hendelser', () => {
    const s = createState({ subs: [{ id: 'o2', out: 8, in: 8 }] });
    expect(step(s, 0.05, SUB)).toEqual([]);
    expect(s.subs.o2).toEqual({ out: 8, in: 8 });
  });
  it('kan aldri flytte mer enn det som finnes', () => {
    const s = createState({ subs: [{ id: 'o2', out: 0.1, in: 0 }] });
    simulate(s, 20);
    expect(s.subs.o2.in).toBeGreaterThanOrEqual(0);
    expect(s.subs.o2.out).toBeGreaterThanOrEqual(0);
    expect(total(s, 'o2')).toBeCloseTo(0.1, 9);
  });
});

describe('protein-stoffer og aldri-stoffer', () => {
  it('står stille uten protein', () => {
    const s = createState({ subs: [{ id: 'glukose', out: 12, in: 0 }, { id: 'na', out: 10, in: 1 }] });
    const ev = [];
    for (let i = 0; i < 400; i++) ev.push(...step(s, 0.05, SUB));
    expect(s.subs.glukose).toEqual({ out: 12, in: 0 });
    expect(s.subs.na).toEqual({ out: 10, in: 1 });
    expect(ev).toEqual([]);
  });
  it('protein-stoffet (pass aldri) flytter seg ikke selv med kanal', () => {
    const s = createState({ subs: [{ id: 'protein', out: 10, in: 0 }], proteins: ['kanal:protein'] });
    simulate(s, 20);
    expect(s.subs.protein).toEqual({ out: 10, in: 0 });
  });
  it('kanal utjevner Na⁺', () => {
    const s = createState({ subs: [{ id: 'na', out: 12, in: 2 }], proteins: ['kanal:na'] });
    simulate(s, 30);
    expect(s.subs.na.in).toBeCloseTo(7, 1);
  });
  it('bærer utjevner glukose, og flere bærere er raskere', () => {
    const one = createState({ subs: [{ id: 'glukose', out: 12, in: 0 }], proteins: ['baerer:glukose'] });
    const two = createState({ subs: [{ id: 'glukose', out: 12, in: 0 }], proteins: ['baerer:glukose', 'baerer:glukose'] });
    simulate(one, 2); simulate(two, 2);
    expect(two.subs.glukose.in).toBeGreaterThan(one.subs.glukose.in);
    simulate(one, 30);
    expect(one.subs.glukose.in).toBeCloseTo(6, 1);
  });
  it('kanal for et annet stoff hjelper ikke', () => {
    const s = createState({ subs: [{ id: 'glukose', out: 12, in: 0 }], proteins: ['kanal:na', 'baerer:na'] });
    simulate(s, 10);
    expect(s.subs.glukose.in).toBe(0);
  });
});

describe('pumpe (aktiv transport)', () => {
  it('flytter Na⁺ ut mot konsentrasjonsforskjellen og koster ATP', () => {
    const s = createState({ subs: [{ id: 'na', out: 10, in: 6 }], proteins: ['pumpe:na:ut'], atp: 14 });
    simulate(s, 3);
    expect(s.subs.na.in).toBeLessThan(6);
    expect(s.subs.na.out).toBeGreaterThan(10);
    expect(s.atpUsed).toBeGreaterThan(0);
    expect(s.atp + s.atpUsed).toBeCloseTo(14, 9);
    expect(total(s, 'na')).toBeCloseTo(16, 9);
  });
  it('en pumpe flytter ca. RATE.pumpe per sekund og bruker like mye ATP', () => {
    const s = createState({ subs: [{ id: 'na', out: 10, in: 20 }], proteins: ['pumpe:na:ut'], atp: 50 });
    simulate(s, 2);
    expect(20 - s.subs.na.in).toBeCloseTo(RATE.pumpe * 2, 6);
    expect(s.atpUsed).toBeCloseTo(RATE.pumpe * 2 * RATE.atpPerPump, 6);
  });
  it('pumpe inn flytter andre veien', () => {
    const s = createState({ subs: [{ id: 'na', out: 10, in: 1 }], proteins: ['pumpe:na:inn'], atp: 20 });
    simulate(s, 2);
    expect(s.subs.na.in).toBeGreaterThan(1 + 2);
  });
  it('stopper uten ATP', () => {
    const s = createState({ subs: [{ id: 'na', out: 10, in: 6 }], proteins: ['pumpe:na:ut'], atp: 0 });
    simulate(s, 10);
    expect(s.subs.na).toEqual({ out: 10, in: 6 });
  });
  it('stopper når ATP er brukt opp, og ATP blir aldri negativ', () => {
    const s = createState({ subs: [{ id: 'na', out: 10, in: 20 }], proteins: ['pumpe:na:ut'], atp: 3 });
    simulate(s, 10);
    expect(s.atp).toBeGreaterThanOrEqual(-1e-9);
    expect(s.atp).toBeLessThan(0.1);
    expect(20 - s.subs.na.in).toBeCloseTo(3, 1);
  });
  it('flere pumper er raskere', () => {
    const mk = (n) => createState({ subs: [{ id: 'na', out: 10, in: 30 }], proteins: Array(n).fill('pumpe:na:ut'), atp: 100 });
    const a = mk(1), b = mk(3);
    simulate(a, 2); simulate(b, 2);
    expect(b.subs.na.in).toBeLessThan(a.subs.na.in);
  });
  it('pumpe + kanal: kanalen lekker tilbake, så pumpa må jobbe hele tiden', () => {
    const s = createState({ subs: [{ id: 'na', out: 10, in: 2 }], proteins: ['kanal:na', 'pumpe:na:ut'], atp: 100 });
    simulate(s, 10);
    expect(s.atpUsed).toBeGreaterThan(10);
  });
});

describe('inside.use / inside.make', () => {
  it('bruker og lager per sekund', () => {
    const s = createState({
      subs: [{ id: 'x', out: 0, in: 20 }, { id: 'y', out: 0, in: 0 }],
      inside: { use: { x: 1 }, make: { y: 1, atp: 2 } },
    });
    simulate(s, 5, 0.05);
    expect(s.subs.x.in).toBeCloseTo(15, 3);
    expect(s.subs.y.in).toBeCloseTo(5, 3);
    expect(s.atp).toBeCloseTo(10, 3);
  });
  it('begrenses av råstoff: uten glukose lages ingen ATP', () => {
    const s = createState({ subs: [{ id: 'glukose', out: 10, in: 0 }], inside: { use: { glukose: 0.3 }, make: { atp: 1.5 } } });
    simulate(s, 10);
    expect(s.atp).toBe(0);
  });
  it('når råstoffet tar slutt, stopper produksjonen, og mengden blir ikke negativ', () => {
    const s = createState({ subs: [{ id: 'glukose', out: 0, in: 1 }], inside: { use: { glukose: 0.5 }, make: { atp: 2 } } });
    simulate(s, 10);
    expect(s.subs.glukose.in).toBeGreaterThanOrEqual(0);
    expect(s.atp).toBeCloseTo(4, 1); // 1 glukose gir 2 sek med 2 ATP/s
  });
  it('produksjonen følger råstofftilgangen (bærer inn → ATP ut)', () => {
    const s = createState({
      subs: [{ id: 'glukose', out: 20, in: 0 }], proteins: ['baerer:glukose'],
      inside: { use: { glukose: 0.3 }, make: { atp: 1.5 } },
    });
    simulate(s, 10);
    expect(s.atp).toBeGreaterThan(10);
  });
  it('hendelser: «brukt» og «laget» for hele partikler', () => {
    const s = createState({ subs: [{ id: 'x', out: 0, in: 5 }, { id: 'y', out: 0, in: 0 }], inside: { use: { x: 1 }, make: { y: 1 } } });
    const ev = [];
    for (let i = 0; i < 40; i++) ev.push(...step(s, 0.05, SUB)); // 2 s
    expect(ev.filter((e) => e.via === 'brukt' && e.sub === 'x')).toHaveLength(2);
    expect(ev.filter((e) => e.via === 'laget' && e.sub === 'y')).toHaveLength(2);
    expect(ev.every((e) => e.dir === null)).toBe(true);
  });
});

describe('hendelser for passeringer', () => {
  it('antall hendelser = antall hele partikler som passerte, med riktig retning', () => {
    const s = createState({ subs: [{ id: 'o2', out: 14, in: 2 }] });
    const ev = [];
    for (let i = 0; i < 200; i++) ev.push(...step(s, 0.05, SUB));
    const inn = ev.filter((e) => e.dir === 'inn').length;
    expect(ev.filter((e) => e.dir === 'ut')).toHaveLength(0);
    expect(inn).toBe(Math.floor(s.subs.o2.in + 1e-9) - 2);
    expect(ev.every((e) => e.via === 'fri' && e.sub === 'o2')).toBe(true);
  });
  it('via angir transporttype', () => {
    const s = createState({ subs: [{ id: 'na', out: 12, in: 2 }, { id: 'glukose', out: 12, in: 0 }], proteins: ['kanal:na', 'baerer:glukose', 'baerer:glukose'] });
    const ev = [];
    for (let i = 0; i < 60; i++) ev.push(...step(s, 0.05, SUB));
    expect(ev.some((e) => e.sub === 'na' && e.via === 'kanal')).toBe(true);
    expect(ev.some((e) => e.sub === 'glukose' && e.via === 'baerer')).toBe(true);
  });
  it('pumpe gir hendelser med via pumpe og retning ut', () => {
    const s = createState({ subs: [{ id: 'na', out: 1, in: 10 }], proteins: ['pumpe:na:ut'], atp: 10 });
    const ev = [];
    for (let i = 0; i < 60; i++) ev.push(...step(s, 0.05, SUB));
    const p = ev.filter((e) => e.via === 'pumpe');
    expect(p.length).toBeGreaterThan(0);
    expect(p.every((e) => e.dir === 'ut')).toBe(true);
  });
  it('tid går framover', () => {
    const s = createState({ subs: [] });
    step(s, 0.1, SUB); step(s, 0.1, SUB);
    expect(s.t).toBeCloseTo(0.2, 9);
  });
});

describe('osmose', () => {
  const mk = (o) => createState({ subs: [], osmose: o });
  it('likevekt: volum = solute / outside', () => {
    const s = mk({ solute: 1.4, outside: 2.0 });
    simulate(s, 40);
    expect(s.volume).toBeCloseTo(0.7, 2);
    const t = mk({ solute: 1, outside: 0.8 });
    simulate(t, 40);
    expect(t.volume).toBeCloseTo(1.25, 2);
  });
  it('isoton: volumet holder seg på 1, og formen er normal', () => {
    const s = mk({ solute: 1, outside: 1 });
    simulate(s, 20);
    expect(s.volume).toBeCloseTo(1, 6);
    expect(osmoseShape(s)).toBe('normal');
  });
  it('sprekker uten vegg i svært fortynnet løsning, og blir sprukket for godt', () => {
    const s = mk({ solute: 1, outside: 0.4, wall: false });
    simulate(s, 20);
    expect(s.burst).toBe(true);
    expect(osmoseShape(s)).toBe('sprukket');
    s.osmose.outside = 1; // for sent
    simulate(s, 20);
    expect(osmoseShape(s)).toBe('sprukket');
  });
  it('svulmer uten å sprekke når likevekt ligger under sprengningsgrensen', () => {
    const s = mk({ solute: 1, outside: 0.7, wall: false });
    simulate(s, 40);
    expect(s.burst).toBe(false);
    expect(osmoseShape(s)).toBe('svulmet');
  });
  it('krymper i saltvann, men ikke under minimumsvolum', () => {
    const s = mk({ solute: 1, outside: 2 });
    simulate(s, 40);
    expect(osmoseShape(s)).toBe('krympet');
    const t = mk({ solute: 1, outside: 10 });
    simulate(t, 40);
    expect(t.volume).toBeCloseTo(VOLUME.min, 9);
  });
  it('plantecelle med vegg i ferskvann: stram (turgor), sprekker ikke', () => {
    const s = mk({ solute: 1.5, outside: 0.4, wall: true });
    simulate(s, 40);
    expect(s.burst).toBe(false);
    expect(s.volume).toBeCloseTo(VOLUME.wall, 9);
    expect(osmoseShape(s)).toBe('stram');
  });
  it('plantecelle i saltvann: krymper (slapp)', () => {
    const s = mk({ solute: 1.5, outside: 2.4, wall: true });
    simulate(s, 40);
    expect(osmoseShape(s)).toBe('krympet');
  });
  it('plantecelle ved isoton løsning er normal, ikke stram', () => {
    const s = mk({ solute: 1, outside: 1, wall: true });
    simulate(s, 20);
    expect(osmoseShape(s)).toBe('normal');
  });
  it('ute-konsentrasjonen kan endres underveis (slider)', () => {
    const s = mk({ solute: 1.4, outside: 2.2, wall: false });
    simulate(s, 3);
    expect(s.volume).toBeLessThan(1);
    s.osmose.outside = 1.4;
    simulate(s, 40);
    expect(s.volume).toBeCloseTo(1, 1);
  });
  it('uten osmose-oppsett endres ikke volumet', () => {
    const s = createState({ subs: [{ id: 'o2', out: 5, in: 0 }] });
    simulate(s, 5);
    expect(s.volume).toBe(1);
    expect(s.osmose).toBeNull();
  });
  it('indre konsentrasjon følger volumet (conc)', () => {
    const s = createState({ subs: [{ id: 'o2', out: 4, in: 4 }] });
    s.volume = 2;
    expect(conc(s, 'o2', 'in')).toBe(2);
    expect(conc(s, 'o2', 'out')).toBe(4);
  });
});

describe('check()', () => {
  const s = createState({ subs: [{ id: 'o2', out: 6, in: 3 }, { id: 'na', out: 10, in: 2 }], atp: 5, proteins: ['pumpe:na:ut', 'kanal:na'] });
  it('sub: >= og <= på begge sider', () => {
    expect(check(s, [{ sub: 'o2', side: 'in', op: '>=', n: 3 }]).done).toBe(true);
    expect(check(s, [{ sub: 'o2', side: 'in', op: '>=', n: 3.5 }]).done).toBe(false);
    expect(check(s, [{ sub: 'o2', side: 'out', op: '<=', n: 6 }]).done).toBe(true);
    expect(check(s, [{ sub: 'o2', side: 'out', op: '<=', n: 5 }]).done).toBe(false);
  });
  it('sub: ukjent stoff gir 0', () => {
    const r = check(s, [{ sub: 'finnesikke', side: 'in', op: '<=', n: 1 }]);
    expect(r.items[0].value).toBe(0);
    expect(r.done).toBe(true);
  });
  it('equal: innenfor toleranse', () => {
    expect(check(s, [{ equal: 'o2', tol: 3 }]).done).toBe(true);
    expect(check(s, [{ equal: 'o2', tol: 2 }]).done).toBe(false);
    expect(check(s, [{ equal: 'o2' }]).done).toBe(false); // standard tol 1,5
  });
  it('shape', () => {
    expect(check(s, [{ shape: 'normal' }]).done).toBe(true);
    expect(check(s, [{ shape: 'krympet' }]).done).toBe(false);
  });
  it('atpMin', () => {
    expect(check(s, [{ atpMin: 5 }]).done).toBe(true);
    expect(check(s, [{ atpMin: 5.5 }]).done).toBe(false);
  });
  it('noProtein', () => {
    expect(check(s, [{ noProtein: 'pumpe' }]).done).toBe(false);
    expect(check(s, [{ noProtein: 'baerer' }]).done).toBe(true);
  });
  it('alle vilkår må være oppfylt, og tomt mål er aldri oppfylt', () => {
    expect(check(s, [{ atpMin: 5 }, { shape: 'normal' }]).done).toBe(true);
    expect(check(s, [{ atpMin: 5 }, { noProtein: 'pumpe' }]).done).toBe(false);
    expect(check(s, []).done).toBe(false);
    expect(check(s, undefined).done).toBe(false);
  });
  it('items gir verdi og vilkår for visning', () => {
    const r = check(s, [{ atpMin: 2 }, { sub: 'na', side: 'in', op: '<=', n: 1 }]);
    expect(r.items.map((i) => i.ok)).toEqual([true, false]);
    expect(r.items.map((i) => i.value)).toEqual([5, 2]);
  });
});

describe('tick() og run()', () => {
  it('held teller opp mens målet er oppfylt, og nullstilles når det brytes', () => {
    const s = createState({ subs: [{ id: 'na', out: 10, in: 1 }], proteins: ['kanal:na'] });
    const target = [{ sub: 'na', side: 'in', op: '<=', n: 2 }];
    tick(s, 0.1, SUB, target);
    tick(s, 0.1, SUB, target);
    expect(s.held).toBeCloseTo(0.2, 6);
    for (let i = 0; i < 200; i++) tick(s, 0.05, SUB, target);
    expect(s.held).toBe(0); // kanalen har utjevnet, målet brutt
  });
  it('run() returnerer sluttstatus', () => {
    const s = createState({ subs: [{ id: 'o2', out: 14, in: 2 }] });
    expect(run(s, 15, SUB, [{ sub: 'o2', side: 'in', op: '>=', n: 6 }]).done).toBe(true);
    const t = createState({ subs: [{ id: 'o2', out: 14, in: 2 }] });
    expect(run(t, 0.05, SUB, [{ sub: 'o2', side: 'in', op: '>=', n: 6 }]).done).toBe(false);
  });
  it('tick returnerer events og status', () => {
    const s = createState({ subs: [{ id: 'o2', out: 14, in: 2 }] });
    const r = tick(s, 0.1, SUB, [{ sub: 'o2', side: 'in', op: '>=', n: 100 }]);
    expect(Array.isArray(r.events)).toBe(true);
    expect(r.status.done).toBe(false);
  });
});
