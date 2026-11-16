// Celleverkstedet – nærbilde av cellemembranen (transport) og hele cellen ved osmose.
// Visningen leser simuleringstilstanden (sim.js) hvert bilde og animerer hendelsene fra step()/tick().
import {
  THREE, mergeGeometries, fresnelMat, glassMat, solidMat, at, makeLabel, particleKit, labelMat, pretty, subColor, reducedMotion, ENERGY,
} from './scene.js';
import { cellGeometry, CELL } from './celle3d.js';
import { VOLUME, RATE, osmoseShape } from './sim.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const rand = (a, b) => a + Math.random() * (b - a);
const W = 6.2, D = 2.2;                 // membranens halve bredde (x) og dybde (z)
const OUT = [1.15, 3.6], IN = [-3.6, -1.15]; // høydebånd for partiklene ute og inne
const MAXP = 120;                        // maks synlige partikler per stoff (60 per side)
const LBL = 3;                           // merkelapp på de første partiklene per side – ellers blir det rotete
const PS = 1.6;                          // partiklene vises større enn modellen, så formene kan skilles
const SLOTS = [0, -1.7, 1.7, -3.4, 3.4, -5, 5].flatMap((x) => [[x, 0.75], [x + 0.5, -0.95]]);

// ---------------------------------------------------------------------
// Transportproteiner
// ---------------------------------------------------------------------
function makeProtein(p) {
  const g = new THREE.Group(), col = subColor(p.sub);
  const body = solidMat('#8d7fe8', { emissive: '#5b4fc4', emissiveIntensity: 0.25, transparent: true, opacity: 0.92 });
  g.userData.parts = {};
  if (p.type === 'kanal') {
    // en ring av staver med en åpning i midten
    const staves = []; for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; staves.push(at(new THREE.CylinderGeometry(0.15, 0.17, 1.9, 10), Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38)); }
    g.add(new THREE.Mesh(mergeGeometries(staves), body));
  } else if (p.type === 'baerer') {
    // to halvdeler som vipper: åpen mot den ene siden, så mot den andre
    const half = (s) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 14, 0, Math.PI).scale(0.75, 1.55, 1).rotateY(s > 0 ? Math.PI / 2 : -Math.PI / 2), body); m.position.x = s * 0.06; g.add(m); return m; };
    g.userData.parts.l = half(-1); g.userData.parts.r = half(1);
  } else {
    // pumpe: kraftig kropp + ATP-sete som blinker når den bruker energi
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, 2.0, 18), body));
    const seat = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.08, 8, 20).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: ENERGY.clone().multiplyScalar(0.35), toneMapped: false }));
    seat.position.y = -1.05; g.add(seat); g.userData.parts.seat = seat;
    // pil på toppen: peker ut (opp) eller inn (ned)
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.36, 12), solidMat(col)); arrow.position.y = 1.3; arrow.rotation.x = p.dir === 'ut' ? 0 : Math.PI;
    g.add(arrow);
  }
  // fargebånd for stoffet proteinet slipper gjennom (i tillegg til merkelappen)
  const band = new THREE.Mesh(new THREE.TorusGeometry(p.type === 'pumpe' ? 0.64 : 0.6, 0.06, 6, 24).rotateX(Math.PI / 2), solidMat(col, { emissive: col, emissiveIntensity: 0.4 }));
  band.position.y = 0.98; g.add(band);
  return g;
}

// ---------------------------------------------------------------------
// Partikler: én instansiert mesh per stoff + delte merkelapper
// ---------------------------------------------------------------------
function particlePool(root, id, label) {
  const kit = particleKit(id);
  const mesh = new THREE.InstancedMesh(kit.geo, kit.mat, MAXP); mesh.count = 0; mesh.frustumCulled = false;
  mesh.userData.shared = true; // geometri og materiale deles i hele økta
  root.add(mesh);
  const lm = labelMat(label, kit.color);
  return { id, mesh, list: [], lm, label };
}
function spawnIn(band, x = rand(-W + 0.6, W - 0.6)) { return V(x, rand(band[0], band[1]), rand(-D + 0.4, D - 0.4)); }

/**
 * Transportvisning. subs = [{ id, label }]. Kall sync(state) hvert bilde og events(list) med hendelsene fra tick().
 */
export function createMembraneView({ subs, lowQ, labels }) {
  const root = new THREE.Group(), calm = () => reducedMotion();
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = V(1, 1, 1);

  // --- lipid-dobbeltlaget (instansiert): hode + to haler per lipid, to lag ---
  const sp = lowQ ? 0.46 : 0.34, nx = Math.floor((W * 2) / sp), nz = Math.floor((D * 2) / sp), n = nx * nz * 2;
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.15, 10, 8), solidMat('#e8c27a', { emissive: '#a07a3a', emissiveIntensity: 0.15 }), n);
  const tails = new THREE.InstancedMesh(mergeGeometries([at(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 5), -0.05, 0, 0), at(new THREE.CylinderGeometry(0.035, 0.035, 0.46, 5), 0.06, 0.02, 0)]), solidMat('#c9b48a', { transparent: true, opacity: 0.75 }), n);
  const lipids = [];
  for (let s = 0; s < 2; s++) for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
    lipids.push({ x: -W + (i + 0.5) * sp + (s ? sp / 2 : 0), z: -D + (k + 0.5) * sp + (s ? sp / 3 : 0), s: s ? -1 : 1, ph: Math.random() * 6.28 });
  }
  root.add(heads, tails);
  let holes = [];
  function placeLipids(t) {
    lipids.forEach((l, i) => {
      const hidden = holes.some(([x, z]) => Math.hypot(l.x - x, l.z - z) < 0.72);
      const wob = calm() ? 0 : Math.sin(t * 0.8 + l.ph) * 0.03;
      const sc = hidden ? 0 : 1;
      m4.compose(V(l.x, l.s * 0.62 + wob, l.z), q.identity(), V(sc, sc, sc)); heads.setMatrixAt(i, m4);
      m4.compose(V(l.x, l.s * 0.27 + wob, l.z), q.identity(), V(sc, sc, sc)); tails.setMatrixAt(i, m4);
    });
    heads.instanceMatrix.needsUpdate = true; tails.instanceMatrix.needsUpdate = true;
  }

  // --- sidene: svak farge inne (cytoplasma) + merkelapper ---
  const cyto = new THREE.Mesh(new THREE.BoxGeometry(W * 2, 3.0, D * 2), new THREE.MeshBasicMaterial({ color: '#3a8f7a', transparent: true, opacity: 0.07, depthWrite: false }));
  cyto.position.y = -2.4; root.add(cyto);
  const lblOut = makeLabel(labels.out, { size: 0.55, color: 'rgba(124,200,255,0.8)' }); lblOut.position.set(-W + 0.9, OUT[1] + 0.5, 0); root.add(lblOut);
  const lblIn = makeLabel(labels.in, { size: 0.55, color: 'rgba(111,227,165,0.8)' }); lblIn.position.set(W - 0.9, IN[0] - 0.5, 0); root.add(lblIn);

  // --- proteiner ---
  let proteins = []; // { key, p, group, slot, anim }
  function syncProteins(list) {
    const want = list.map((p, i) => ({ p, key: p.type + ':' + p.sub + ':' + (p.dir || '') + '#' + list.slice(0, i).filter((x) => x.type === p.type && x.sub === p.sub && x.dir === p.dir).length }));
    let changed = false;
    for (const pr of [...proteins]) if (!want.some((w) => w.key === pr.key)) { root.remove(pr.group); pr.group.traverse((o) => { o.geometry && o.geometry.dispose(); o.material && o.material.dispose(); }); if (pr.label) { pr.label.material.map.dispose(); pr.label.material.dispose(); } proteins = proteins.filter((x) => x !== pr); changed = true; }
    for (const w of want) if (!proteins.some((pr) => pr.key === w.key)) {
      const used = new Set(proteins.map((pr) => pr.slot)), slot = SLOTS.findIndex((_, i) => !used.has(i)); if (slot < 0) continue;
      const group = makeProtein(w.p); group.position.set(SLOTS[slot][0], 0, SLOTS[slot][1]); root.add(group);
      const label = labels.protein ? makeLabel(labels.protein(w.p), { size: 0.4, color: subColor(w.p.sub) }) : null;
      if (label) { label.position.set(SLOTS[slot][0], 1.5 + (slot % 2 ? 0.5 : 0), SLOTS[slot][1]); root.add(label); }
      proteins.push({ key: w.key, p: w.p, group, slot, label, flip: 0, blink: 0, grow: calm() ? 1 : 0 }); changed = true;
    }
    if (changed) { holes = proteins.map((pr) => SLOTS[pr.slot]); placeLipids(0); }
  }

  // --- partikler ---
  const pools = new Map(subs.map((s) => [s.id, particlePool(root, s.id, s.label)]));
  const labelSprites = []; // merkelapper over partiklene (deler materiale)
  function newParticle(pool, side, pos, fade = true) {
    const pt = { side, pos: pos || spawnIn(side === 'out' ? OUT : IN), vel: V(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(0.25), rot: V(rand(0, 6), rand(0, 6), rand(0, 6)), scale: fade && !calm() ? 0 : 1, die: false, path: null };
    const sp = new THREE.Sprite(pool.lm.mat); sp.scale.set(0.34 * pool.lm.aspect, 0.34, 1); sp.renderOrder = 5; sp.userData.shared = true;
    root.add(sp); pt.sprite = sp; labelSprites.push(sp);
    pool.list.push(pt); return pt;
  }
  function removeParticle(pool, pt) { root.remove(pt.sprite); pool.list.splice(pool.list.indexOf(pt), 1); }

  /** Antall synlige partikler: inne = hele partikler som har kommet inn, ute = resten av den avrundede totalen. */
  const visCount = (s) => { const vin = Math.floor(s.in + 1e-6); return { in: vin, out: Math.max(0, Math.round(s.in + s.out) - vin) }; };

  // hendelser fra simuleringen → én animert passering hver
  function events(list) {
    for (const ev of list) {
      const pool = pools.get(ev.sub); if (!pool) continue;
      if (ev.via === 'brukt') { const pt = pool.list.find((x) => x.side === 'in' && !x.path && !x.die); if (pt) pt.die = true; continue; }
      if (ev.via === 'laget') { newParticle(pool, 'in'); continue; }
      const from = ev.dir === 'inn' ? 'out' : 'in', to = ev.dir === 'inn' ? 'in' : 'out';
      let pt = pool.list.filter((x) => x.side === from && !x.path && !x.die).sort((a, b) => Math.abs(a.pos.y) - Math.abs(b.pos.y))[0];
      if (!pt) pt = newParticle(pool, from, null, false);
      let gate = null;
      if (ev.via !== 'fri') {
        const cands = proteins.filter((pr) => pr.p.sub === ev.sub && (ev.via === 'pumpe' ? pr.p.type === 'pumpe' : pr.p.type === ev.via));
        gate = cands[Math.floor(Math.random() * cands.length)] || null;
      }
      const gx = gate ? gate.group.position.x : THREE.MathUtils.clamp(pt.pos.x + rand(-0.6, 0.6), -W + 0.5, W - 0.5);
      const gz = gate ? gate.group.position.z : THREE.MathUtils.clamp(pt.pos.z, -D + 0.4, D - 0.4);
      const sy = from === 'out' ? 1 : -1;
      pt.side = to;
      pt.path = { t: 0, dur: calm() ? 0.5 : ev.via === 'fri' ? 1.3 : 1.1, p0: pt.pos.clone(), p1: V(gx, sy * 1.25, gz), p2: V(gx, -sy * 1.25, gz), p3: spawnIn(to === 'out' ? OUT : IN, gx + rand(-1.2, 1.2)), gate, via: ev.via };
      if (gate) { gate.flip = 1; if (ev.via === 'pumpe') gate.blink = 1; }
    }
  }

  function syncCounts(state) {
    for (const [id, pool] of pools) {
      const s = state.subs[id]; if (!s) continue;
      const want = visCount(s);
      for (const side of ['out', 'in']) {
        const live = pool.list.filter((x) => x.side === side && !x.die);
        for (let k = live.length; k < Math.min(want[side], MAXP / 2); k++) newParticle(pool, side);
        // for mange: la de som ikke er på vei, forsvinne rolig
        const extra = live.length - want[side];
        if (extra > 0) live.filter((x) => !x.path).slice(0, extra).forEach((x) => { x.die = true; });
      }
    }
    syncProteins(state.proteins);
  }

  const tmp = V();
  const bez = (a, b, c, d, t, out) => { const u = 1 - t; return out.set(0, 0, 0).addScaledVector(a, u * u * u).addScaledVector(b, 3 * u * u * t).addScaledVector(c, 3 * u * t * t).addScaledVector(d, t * t * t); };
  function update(dt, t) {
    const still = calm();
    if (!still) placeLipids(t);
    for (const pool of pools.values()) {
      let i = 0; const shownL = { out: 0, in: 0 };
      for (const pt of [...pool.list]) {
        if (pt.die) { pt.scale -= dt * 2.2; if (pt.scale <= 0) { removeParticle(pool, pt); continue; } }
        else pt.scale = Math.min(1, pt.scale + dt * 2.5);
        if (pt.path) {
          const P = pt.path; P.t = Math.min(1, P.t + dt / P.dur);
          // tre etapper: fram til porten, gjennom membranen, ut på den andre siden
          const k = P.t;
          if (k < 0.35) tmp.lerpVectors(P.p0, P.p1, k / 0.35);
          else if (k < 0.65) { tmp.lerpVectors(P.p1, P.p2, (k - 0.35) / 0.3); if (P.via === 'fri' && !still) tmp.x += Math.sin(k * 40) * 0.05; }
          else bez(P.p2, P.p2.clone().setY(P.p2.y * 1.6), P.p3, P.p3, (k - 0.65) / 0.35, tmp);
          pt.pos.copy(tmp);
          if (P.t >= 1) pt.path = null;
        } else if (!still) {
          pt.vel.x += rand(-1, 1) * dt * 0.8; pt.vel.y += rand(-1, 1) * dt * 0.8; pt.vel.z += rand(-1, 1) * dt * 0.8;
          pt.vel.clampLength(0, 0.45); pt.pos.addScaledVector(pt.vel, dt);
          const band = pt.side === 'out' ? OUT : IN;
          if (pt.pos.y < band[0] || pt.pos.y > band[1]) { pt.vel.y *= -1; pt.pos.y = THREE.MathUtils.clamp(pt.pos.y, band[0], band[1]); }
          if (Math.abs(pt.pos.x) > W - 0.3) { pt.vel.x *= -1; pt.pos.x = Math.sign(pt.pos.x) * (W - 0.3); }
          if (Math.abs(pt.pos.z) > D - 0.3) { pt.vel.z *= -1; pt.pos.z = Math.sign(pt.pos.z) * (D - 0.3); }
          pt.rot.x += dt * 0.4; pt.rot.y += dt * 0.3;
        }
        const s = Math.max(0.001, pt.scale), ss = s * PS;
        m4.compose(pt.pos, q.setFromEuler(e.set(pt.rot.x, pt.rot.y, pt.rot.z)), one.set(ss, ss, ss)); pool.mesh.setMatrixAt(i++, m4);
        pt.sprite.position.set(pt.pos.x, pt.pos.y + 0.55, pt.pos.z); pt.sprite.visible = s > 0.3 && (pt.path ? true : shownL[pt.side]++ < LBL); // det som er på vei gjennom, har alltid merkelapp
        one.set(1, 1, 1);
      }
      pool.mesh.count = i; pool.mesh.instanceMatrix.needsUpdate = true;
    }
    for (const pr of proteins) {
      pr.grow = Math.min(1, pr.grow + dt * 3); pr.group.scale.setScalar(0.3 + 0.7 * pr.grow);
      const parts = pr.group.userData.parts;
      if (pr.flip > 0) pr.flip = Math.max(0, pr.flip - dt * 1.2);
      if (parts.l) { const a = Math.sin(pr.flip * Math.PI) * 0.35; parts.l.rotation.z = a; parts.r.rotation.z = -a; } // bæreren skifter form
      if (parts.seat) { pr.blink = Math.max(0, pr.blink - dt * 1.6); parts.seat.material.color.copy(ENERGY).multiplyScalar(0.35 + pr.blink * 1.4); }
    }
  }

  placeLipids(0);
  return {
    root, radius: 6.6, target: V(0, 0, 0), view: { dir: [0, 0.32, 1], minPolar: 0.6, maxPolar: 2.0, minAz: -0.7, maxAz: 0.7 },
    sync: syncCounts, events, update, dispose() { for (const pool of pools.values()) pool.list.slice().forEach((pt) => removeParticle(pool, pt)); },
  };
}

// ---------------------------------------------------------------------
// Osmose: hele cellen i en løsning; vannet strømmer mot siden med mest løst stoff
// ---------------------------------------------------------------------
export function createOsmoseView({ wall, lowQ, labels }) {
  const root = new THREE.Group(), calm = () => reducedMotion();
  const type = wall ? 'plante' : 'dyr';
  const K = 0.55; // cellen er mindre her, så vannet rundt får plass
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = V(1, 1, 1);
  const cellR = (v) => Math.pow(v, 0.5); // synlig størrelse – overdrevet litt i forhold til volum, så endringen ses

  // innholdet: membran + cytoplasma (skaleres med volumet)
  const proto = new THREE.Group(); root.add(proto);
  const memGeo = cellGeometry(type, K);
  const mem = new THREE.Mesh(memGeo, fresnelMat('#86cfdc', 1.2, 2.2)); proto.add(mem);
  const cyto = new THREE.Mesh(memGeo, new THREE.MeshBasicMaterial({ color: '#3a8f7a', transparent: true, opacity: 0.14, depthWrite: false })); proto.add(cyto);
  const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), glassMat('#7f78e6', 0.5)); nuc.position.set(-0.6, 0.3, 0); proto.add(nuc);
  if (wall) { const vac = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18).scale(1.3, 0.9, 0.8), glassMat('#6fb6ff', 0.22)); vac.position.x = 0.5; proto.add(vac); proto.userData.vac = vac; }
  // celleveggen holder formen sin
  let wallMesh = null;
  if (wall) {
    wallMesh = new THREE.Group();
    const wk = K * cellR(VOLUME.wall) * 1.02;
    wallMesh.add(new THREE.Mesh(cellGeometry(type, wk), fresnelMat('#a6e07a', 1.3, 1.6)));
    wallMesh.add(new THREE.Mesh(cellGeometry(type, wk), glassMat('#5c8f3e', 0.1)));
    root.add(wallMesh);
  }
  const lblCell = makeLabel(labels.cell, { size: 0.4 }); root.add(lblCell);

  // løst stoff (prikker) inne og ute + vann (H2O-partikler)
  const soluteGeo = new THREE.IcosahedronGeometry(0.09, 0);
  const soluteIn = new THREE.InstancedMesh(soluteGeo, solidMat('#ffd1a8', { emissive: '#ffb27a', emissiveIntensity: 0.3 }), 40);
  const soluteOut = new THREE.InstancedMesh(soluteGeo, soluteIn.material, 60);
  root.add(soluteIn, soluteOut);
  const R = () => Math.random();
  const inPts = Array.from({ length: 40 }, () => V(R() * 2 - 1, R() * 2 - 1, R() * 2 - 1).multiplyScalar(0.75));
  const outPts = Array.from({ length: 60 }, () => { const a = R() * Math.PI * 2, r = rand(3.6, 6.2); return V(Math.cos(a) * r, rand(-3, 3), Math.sin(a) * r * 0.5); });
  const lblSolute = makeLabel(labels.solute, { size: 0.3, color: 'rgba(255,209,168,0.8)' }); root.add(lblSolute);

  const water = particleKit('h2o'), NW = lowQ ? 26 : 44;
  const wmesh = new THREE.InstancedMesh(water.geo, water.mat, NW); wmesh.userData.shared = true; wmesh.frustumCulled = false; root.add(wmesh);
  const drops = Array.from({ length: NW }, () => ({ t: Math.random(), dir: 1, a: R() * Math.PI * 2, b: rand(-0.8, 0.8), active: false }));
  const lblWater = makeLabel(pretty('H2O'), { size: 0.3, color: water.color }); root.add(lblWater);

  // piler rundt cellen: inn eller ut, tykkelse etter hvor sterk strømmen er
  const arrows = [];
  const arrowGeo = mergeGeometries([at(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 8), 0, -0.2, 0), at(new THREE.ConeGeometry(0.18, 0.36, 12), 0, 0.33, 0)]);
  const arrowMat = new THREE.MeshBasicMaterial({ color: '#7cc8ff', transparent: true, opacity: 0.8 });
  for (let i = 0; i < 8; i++) { const a = new THREE.Mesh(arrowGeo, arrowMat); a.userData.ang = (i / 8) * Math.PI * 2 + 0.2; root.add(a); arrows.push(a); }

  // sprekk: biter av membranen som driver rolig utover og blekner
  let shards = null;

  let st = null, flux = 0, size = 1, shown = 1;
  function sync(state) {
    st = state;
    const o = state.osmose; flux = state.burst ? 0 : RATE.vann * (o.solute / state.volume - o.outside);
    if (state.burst && !shards) burst();
    if (!state.burst && shards) { root.remove(shards.group); shards.group.traverse((x) => { x.geometry && x.geometry.dispose(); }); shards = null; proto.visible = true; }
  }
  function burst() {
    proto.visible = false;
    const group = new THREE.Group(), mat = fresnelMat('#86cfdc', 1.1, 2.2), list = [];
    for (let i = 0; i < 18; i++) {
      const y = 1 - (i + 0.5) / 18 * 2, r = Math.sqrt(1 - y * y), a = i * 2.4, d = V(Math.cos(a) * r, y, Math.sin(a) * r);
      const m = new THREE.Mesh(new THREE.SphereGeometry(K * 4, 8, 6, 0, 0.7, 0, 0.6), mat);
      m.lookAt(d); m.position.copy(d).multiplyScalar(0.2); group.add(m); list.push({ m, d, spin: rand(-0.5, 0.5) });
    }
    root.add(group); shards = { group, list, t: 0, mat };
  }

  function update(dt, t) {
    if (!st) return;
    const still = calm();
    size += (cellR(st.volume) - size) * Math.min(1, dt * 4); shown = size;
    const shape = osmoseShape(st);
    proto.scale.setScalar(shown * (still ? 1 : 1 + Math.sin(t * 0.8) * 0.005));
    // slapp/plasmolyse: cellen trekker seg litt mer sammen i høyden; stram: presser helt ut
    if (wall) proto.scale.y *= shape === 'krympet' ? 0.92 : 1;
    if (proto.userData.vac) proto.userData.vac.scale.setScalar(Math.max(0.35, Math.min(1.1, st.volume * 0.9)));
    mem.material.uniforms.uIntensity.value = shape === 'stram' ? 1.7 : 1.2;
    const [hx, hy] = CELL[type].half;
    lblCell.position.set(0, (wall ? K * cellR(VOLUME.wall) : K * shown) * hy + 0.55, 0);

    // løst stoff inne (følger cellen) og ute
    const nIn = Math.min(40, Math.round(st.osmose.solute * 14)), nOut = Math.min(60, Math.round(st.osmose.outside * 14));
    for (let i = 0; i < 40; i++) {
      const p = inPts[i], s = i < nIn ? 1 : 0;
      const wob = still ? 0 : Math.sin(t * 0.7 + i) * 0.04;
      m4.compose(V(p.x * hx * K * shown + wob, p.y * hy * K * shown * 0.8, p.z * K * shown * 2.2), q, one.set(s, s, s)); soluteIn.setMatrixAt(i, m4);
    }
    for (let i = 0; i < 60; i++) {
      const p = outPts[i], s = i < nOut ? 1 : 0;
      const wob = still ? 0 : Math.sin(t * 0.5 + i * 1.3) * 0.08;
      if (st.burst && i < nIn) { /* innholdet sprer seg ut */ }
      m4.compose(V(p.x + wob, p.y, p.z), q, one.set(s, s, s)); soluteOut.setMatrixAt(i, m4);
    }
    soluteIn.instanceMatrix.needsUpdate = true; soluteOut.instanceMatrix.needsUpdate = true;
    lblSolute.position.set(outPts[0].x, outPts[0].y + 0.35, outPts[0].z); lblSolute.visible = nOut > 0;

    // vann: dråper som krysser membranen; de fleste går i nettoretningen
    const strength = Math.min(1, Math.abs(flux) * 1.4), net = Math.sign(flux);
    const rw = (K * Math.max(hx, hy) * shown) * 0.9;
    let w = 0;
    for (const d of drops) {
      d.t += dt * (still ? 0.25 : 0.4);
      if (d.t >= 1) { d.t = 0; d.a = Math.random() * Math.PI * 2; d.b = rand(-0.7, 0.7); d.dir = Math.random() < 0.5 + strength * 0.45 ? (net || 1) : -(net || 1); }
      // indre og ytre punkt langs en stråle fra midten
      const dirv = V(Math.cos(d.a) * Math.cos(d.b), Math.sin(d.b), Math.sin(d.a) * Math.cos(d.b) * 0.6);
      const r0 = rw * 0.55, r1 = rw * 1.9, k = d.dir > 0 ? d.t : 1 - d.t; // dir > 0: utenfra og inn
      const r = r1 + (r0 - r1) * k;
      const s = Math.sin(d.t * Math.PI) * 0.9;
      m4.compose(dirv.multiplyScalar(r), q, one.set(s, s, s)); wmesh.setMatrixAt(w++, m4);
    }
    wmesh.count = st.burst ? 0 : w; wmesh.instanceMatrix.needsUpdate = true;
    lblWater.position.set(-rw * 1.6, rw * 0.9, 0.5); lblWater.visible = !st.burst;

    arrows.forEach((a) => {
      const ang = a.userData.ang, r = rw * 1.45, dir = V(Math.cos(ang), Math.sin(ang), 0);
      a.position.copy(dir).multiplyScalar(r).add(V(0, 0, 0.6));
      a.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().multiplyScalar(flux > 0 ? -1 : 1));
      const vis = strength > 0.05 && !st.burst; a.visible = vis;
      a.scale.setScalar(0.6 + strength * 0.7);
    });
    arrowMat.opacity = 0.35 + strength * 0.55;

    if (shards) {
      shards.t += dt;
      for (const s of shards.list) { s.m.position.addScaledVector(s.d, dt * (still ? 0.2 : 0.5)); s.m.rotation.z += s.spin * dt; }
      shards.mat.uniforms.uIntensity.value = Math.max(0.15, 1.1 - shards.t * 0.35);
    }
  }

  return { root, radius: 4.8, target: V(0, 0, 0), view: { dir: [0, 0.2, 1] }, sync, update, dispose() {} };
}
