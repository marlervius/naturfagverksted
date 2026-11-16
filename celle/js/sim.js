// Celleverkstedet – ren logikk. Ingen DOM, ingen three.
// Tre oppdragstyper deler denne fila:
//   build     – sett riktige organeller inn i en celle
//   energy    – gi en organell riktige stoffer (celleånding / fotosyntese)
//   transport – stoffer gjennom cellemembranen (diffusjon, transportproteiner, pumper, osmose)
//
// Transportmodellen er en skolemodell med kontinuerlige mengder (desimaltall). Scenen viser hele partikler
// og animerer én passering for hver hendelse step() returnerer.

// ---------------------------------------------------------------------------
// build
// ---------------------------------------------------------------------------

/**
 * goal: { type: 'build', cell: 'dyr'|'plante'|'bakterie', parts: [organell-id …] }
 * Kan organellen settes inn? → { ok: true } eller { ok: false, reason: 'already' | 'wrongCell' | 'notNeeded' }
 *   wrongCell = organellen finnes ikke i denne celletypen (ORG[id].in mangler celletypen)
 *   notNeeded = finnes i celletypen, men er ikke en del av dette oppdraget
 */
export function canPlace(id, placed, goal, ORG) {
  if (placed.has(id)) return { ok: false, reason: 'already' };
  if (goal.parts.includes(id)) return { ok: true };
  const o = ORG[id];
  return { ok: false, reason: o && o.in.includes(goal.cell) ? 'notNeeded' : 'wrongCell' };
}

/** → { done, have, need, missing: [id …] } */
export function buildStatus(placed, goal) {
  const missing = goal.parts.filter((id) => !placed.has(id));
  return { done: missing.length === 0, have: goal.parts.length - missing.length, need: goal.parts.length, missing };
}

// ---------------------------------------------------------------------------
// energy
// ---------------------------------------------------------------------------

/**
 * goal: { type: 'energy', organelle: 'mitokondrie'|'kloroplast', inputs: [stoff-id …], outputs: [stoff-id …], light?: true }
 * chosen: Set med stoff-id-er eleven har sendt inn. light: har eleven slått på lyset?
 * → { done, missing: [id …], wrong: [id …], lightOk }
 *   wrong = sendt inn, men skal ikke inn. lightOk = lyset står riktig (på hvis goal.light, ellers likegyldig).
 */
export function energyStatus(chosen, goal, light = false) {
  const missing = goal.inputs.filter((id) => !chosen.has(id));
  const wrong = [...chosen].filter((id) => !goal.inputs.includes(id));
  const lightOk = goal.light ? !!light : true;
  return { done: missing.length === 0 && wrong.length === 0 && lightOk, missing, wrong, lightOk };
}

// ---------------------------------------------------------------------------
// transport
// ---------------------------------------------------------------------------

// Hvordan et stoff kommer gjennom membranen (SUB[id].pass):
//   'fri'    – små, upolare molekyler (O2, CO2) går rett gjennom
//   'protein'– trenger et transportprotein (glukose, ioner). Uten protein: ingen passering.
//   'aldri'  – for stort (protein, stivelse). Kommer ikke gjennom i denne modellen.
// Vann behandles for seg (osmose), ikke som et tellbart stoff.
export const RATE = {
  fri: 0.9,       // andel av konsentrasjonsforskjellen som utjevnes per sekund
  kanal: 0.35,    // per kanal/bærerprotein
  pumpe: 1.2,     // partikler per sekund per pumpe
  atpPerPump: 1,  // ATP per pumpet partikkel
  vann: 0.6,      // hvor fort volumet følger osmosen
};
export const VOLUME = { min: 0.4, burst: 1.7, wall: 1.25 }; // relativt cellevolum (1 = normalt)

/**
 * setup (fra nivået):
 * {
 *   subs:  [{ id: 'o2', out: 12, in: 2 }, …],            // startmengder ute og inne
 *   tools: ['kanal:na', 'baerer:glukose', 'pumpe:na:ut'], // proteiner eleven KAN sette inn (form: type:stoff[:retning])
 *   proteins: ['kanal:na'],                               // proteiner som står der fra start (valgfritt)
 *   atp: 10,                                              // ATP ved start (valgfritt, 0 hvis utelatt)
 *   inside: { use: { o2: 0.6 }, make: { co2: 0.6, atp: 0.5 } },  // cellen bruker/lager per sekund (valgfritt)
 *   osmose: { solute: 1, outside: 1, wall: false, slider: true }, // valgfritt: løste stoffer inne, konsentrasjon ute, cellevegg, kan eleven endre ute-konsentrasjonen
 * }
 */
export function createState(setup) {
  const subs = {};
  for (const s of setup.subs || []) subs[s.id] = { out: s.out || 0, in: s.in || 0 };
  return {
    subs,
    proteins: (setup.proteins || []).map(parseProtein),
    atp: setup.atp || 0,
    atpUsed: 0,
    inside: setup.inside || null,
    osmose: setup.osmose ? { solute: setup.osmose.solute ?? 1, outside: setup.osmose.outside ?? 1, wall: !!setup.osmose.wall } : null,
    volume: 1,
    burst: false,
    t: 0,
    held: 0,
  };
}

/** 'pumpe:na:ut' → { type: 'pumpe', sub: 'na', dir: 'ut' }. Retning gjelder bare pumper ('inn' er standard). */
export function parseProtein(str) {
  const [type, sub, dir] = String(str).split(':');
  return { type, sub, dir: type === 'pumpe' ? (dir === 'ut' ? 'ut' : 'inn') : null };
}

/** Sett inn et protein eleven har valgt. → true hvis det ble satt inn (maks 4 av samme slag). */
export function addProtein(state, str) {
  const p = parseProtein(str);
  if (state.proteins.filter((x) => x.type === p.type && x.sub === p.sub && x.dir === p.dir).length >= 4) return false;
  state.proteins.push(p); return true;
}

/** Fjern ett protein av dette slaget. → true hvis noe ble fjernet. */
export function removeProtein(state, str) {
  const p = parseProtein(str);
  const i = state.proteins.findIndex((x) => x.type === p.type && x.sub === p.sub && x.dir === p.dir);
  if (i < 0) return false;
  state.proteins.splice(i, 1); return true;
}

/** Konsentrasjon av et stoff på en side. Ute-volumet er alltid 1; inne følger cellevolumet. */
export const conc = (state, id, side) => (side === 'in' ? state.subs[id].in / state.volume : state.subs[id].out);

/**
 * Ett tidssteg (dt i sekunder, bruk små steg ≤ 0,1).
 * → hendelser: [{ sub, dir: 'inn'|'ut', via: 'fri'|'kanal'|'baerer'|'pumpe' }] – én per hel partikkel som passerte,
 *   pluss { sub, dir: null, via: 'brukt'|'laget' } når cellen bruker eller lager en hel partikkel inne.
 * Endrer state på stedet.
 */
export function step(state, dt, SUB) {
  const events = [];
  const move = (id, amount, via) => {
    // amount > 0 = inn i cellen. Kan aldri flytte mer enn det som finnes.
    const s = state.subs[id];
    const a = amount > 0 ? Math.min(amount, s.out) : -Math.min(-amount, s.in);
    if (!a) return 0;
    const before = Math.floor(s.in + 1e-9);
    s.in += a; s.out -= a;
    const crossed = Math.floor(s.in + 1e-9) - before;
    for (let k = 0; k < Math.abs(crossed); k++) events.push({ sub: id, dir: crossed > 0 ? 'inn' : 'ut', via });
    return a;
  };

  for (const id in state.subs) {
    const pass = SUB[id] ? SUB[id].pass : 'aldri';
    const diff = conc(state, id, 'out') - conc(state, id, 'in');
    if (pass === 'fri') move(id, RATE.fri * diff * dt, 'fri');
    if (pass === 'protein') {
      const kan = state.proteins.filter((p) => p.sub === id && p.type === 'kanal').length;
      const bae = state.proteins.filter((p) => p.sub === id && p.type === 'baerer').length;
      if (kan) move(id, RATE.kanal * kan * diff * dt, 'kanal');
      if (bae) move(id, RATE.kanal * bae * diff * dt, 'baerer');
    }
  }

  // Pumper: aktiv transport, også mot konsentrasjonsforskjellen. Koster ATP.
  for (const p of state.proteins) {
    if (p.type !== 'pumpe' || !state.subs[p.sub] || state.atp <= 0) continue;
    const want = Math.min(RATE.pumpe * dt, state.atp / RATE.atpPerPump);
    const moved = Math.abs(move(p.sub, p.dir === 'ut' ? -want : want, 'pumpe'));
    state.atp -= moved * RATE.atpPerPump; state.atpUsed += moved * RATE.atpPerPump;
  }

  // Cellen bruker og lager stoffer inne (f.eks. celleånding: bruker O2, lager CO2 og ATP).
  if (state.inside) {
    const use = state.inside.use || {}, make = state.inside.make || {};
    let share = 1; // lager bare så mye som råstoffene rekker til
    for (const id in use) if (state.subs[id]) share = Math.min(share, state.subs[id].in / (use[id] * dt || 1e-9));
    share = Math.max(0, Math.min(1, share));
    for (const id in use) {
      const s = state.subs[id]; if (!s) continue;
      const before = Math.floor(s.in + 1e-9); s.in = Math.max(0, s.in - use[id] * dt * share);
      for (let k = Math.floor(s.in + 1e-9); k < before; k++) events.push({ sub: id, dir: null, via: 'brukt' });
    }
    for (const id in make) {
      if (id === 'atp') { state.atp += make[id] * dt * share; continue; }
      const s = state.subs[id]; if (!s) continue;
      const before = Math.floor(s.in + 1e-9); s.in += make[id] * dt * share;
      for (let k = before; k < Math.floor(s.in + 1e-9); k++) events.push({ sub: id, dir: null, via: 'laget' });
    }
  }

  // Osmose: vann går mot siden med mest løst stoff. Likevekt når konsentrasjonen er lik: volum = solute / outside.
  if (state.osmose && !state.burst) {
    const o = state.osmose;
    let v = state.volume + RATE.vann * (o.solute / state.volume - o.outside) * dt;
    if (o.wall) v = Math.min(v, VOLUME.wall);          // celleveggen holder imot: cellen blir stram (turgor), ikke sprengt
    v = Math.max(VOLUME.min, v);
    if (!o.wall && v >= VOLUME.burst) { v = VOLUME.burst; state.burst = true; }
    state.volume = v;
  }

  state.t += dt;
  return events;
}

/** Tilstanden til cellen ved osmose: 'sprukket' | 'svulmet' | 'stram' (plantecelle med turgor) | 'normal' | 'krympet' */
export function osmoseShape(state) {
  if (state.burst) return 'sprukket';
  const v = state.volume, wall = state.osmose && state.osmose.wall;
  if (wall && v >= VOLUME.wall - 0.03) return 'stram';
  if (v > 1.15) return 'svulmet';
  if (v < 0.85) return 'krympet';
  return 'normal';
}

/**
 * Er målet nådd? target = liste med vilkår, alle må være oppfylt:
 *   { sub: 'glukose', side: 'in'|'out', op: '>='|'<=', n: 8 }   – mengde av et stoff
 *   { equal: 'o2', tol: 1.5 }                                   – lik konsentrasjon ute og inne (innenfor tol)
 *   { shape: 'normal' }                                          – osmoseShape() er denne
 *   { atpMin: 2 }                                                – minst så mye ATP igjen
 *   { noProtein: 'pumpe' }                                       – løst uten denne proteintypen
 * → { done, items: [{ cond, ok, value }] }
 */
export function check(state, target) {
  const items = (target || []).map((cond) => {
    let ok = false, value = null;
    if (cond.sub) { value = state.subs[cond.sub] ? state.subs[cond.sub][cond.side === 'out' ? 'out' : 'in'] : 0; ok = cond.op === '<=' ? value <= cond.n + 1e-6 : value >= cond.n - 1e-6; }
    else if (cond.equal) { value = Math.abs(conc(state, cond.equal, 'out') - conc(state, cond.equal, 'in')); ok = value <= (cond.tol ?? 1.5); }
    else if (cond.shape) { value = osmoseShape(state); ok = value === cond.shape; }
    else if (cond.atpMin != null) { value = state.atp; ok = value >= cond.atpMin - 1e-6; }
    else if (cond.noProtein) { value = state.proteins.filter((p) => p.type === cond.noProtein).length; ok = value === 0; }
    return { cond, ok, value };
  });
  return { done: items.length > 0 && items.every((x) => x.ok), items };
}

/**
 * Kjør step() og hold rede på hvor lenge målet har vært oppfylt sammenhengende (state.held, sekunder).
 * Oppdraget er løst når held >= hold (nivåets holdetid, f.eks. 2 s) – så et tilfeldig øyeblikk ikke teller.
 * → { events, status }
 */
export function tick(state, dt, SUB, target) {
  const events = step(state, dt, SUB);
  const status = check(state, target);
  state.held = status.done ? state.held + dt : 0;
  return { events, status };
}

/** Hjelper for tester og «er oppdraget løsbart?»: kjør simuleringen i `seconds` og returner sluttstatus. */
export function run(state, seconds, SUB, target, dt = 0.05) {
  let status = check(state, target);
  for (let t = 0; t < seconds; t += dt) status = tick(state, dt, SUB, target).status;
  return status;
}
