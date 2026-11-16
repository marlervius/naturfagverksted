// Celleverkstedet – nærbilde av mitokondriet eller kloroplasten. Stoffer sendes inn; når alt stemmer, «går» organellen.
import { THREE, makeLabel, particleKit, labelMat, reducedMotion, ENERGY } from './scene.js';
import { makeMito, makeChloro } from './celle3d.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const rand = (a, b) => a + Math.random() * (b - a);
const IN_X = -5.2, OUT_X = 5.2;

/** opts: { organelle, light (har oppdraget sol?), lowQ, labelOf(id) → formeltekst, labels: { in, out, sun } } */
export function createEnergyView(opts) {
  const root = new THREE.Group(), calm = () => reducedMotion();
  const isMito = opts.organelle === 'mitokondrie';
  const org = isMito ? makeMito(3.0, 1.05) : makeChloro(2.6, opts.lowQ);
  org.scale.setScalar(isMito ? 1.15 : 1.2); root.add(org);
  const glowMats = []; org.traverse((o) => { if (o.material && o.material.emissive) glowMats.push({ m: o.material, base: o.material.emissiveIntensity }); });

  const lblIn = makeLabel(opts.labels.in, { size: 0.5, color: 'rgba(160,220,230,0.7)' }); lblIn.position.set(IN_X, 2.9, 0); root.add(lblIn);
  const lblOut = makeLabel(opts.labels.out, { size: 0.5, color: 'rgba(160,220,230,0.7)' }); lblOut.position.set(OUT_X, 2.9, 0); root.add(lblOut);

  // sola (bare når oppdraget handler om lys)
  let sun = null, light = false;
  if (opts.light) {
    sun = new THREE.Group(); sun.position.set(-3.2, 4.3, -1.5);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), new THREE.MeshBasicMaterial({ color: ENERGY.clone(), toneMapped: false }));
    sun.add(core);
    const rays = new THREE.Group();
    for (let i = 0; i < 10; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), core.material); const a = (i / 10) * Math.PI * 2; r.position.set(Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0); r.rotation.z = a - Math.PI / 2; rays.add(r); }
    sun.add(rays); sun.userData.rays = rays; sun.userData.core = core;
    // lysstråler ned mot kloroplasten
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.8, 4.2, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe9a8', transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    beam.position.set(1.5, -2.2, 0.7); beam.rotation.z = 0.6; sun.add(beam); sun.userData.beam = beam;
    const lbl = makeLabel(opts.labels.sun, { size: 0.36 }); lbl.position.set(0, 1.2, 0); sun.add(lbl); sun.userData.lbl = lbl;
    root.add(sun);
  }

  // stoffene eleven har sendt inn: venter ved inngangen
  const waiting = new Map(); // id -> [{ mesh, sprite, ph }]
  const flying = []; // { mesh, sprite, from, to, t, dur, kind: 'in'|'out' }
  const mkPart = (id) => {
    const kit = particleKit(id), mesh = new THREE.Mesh(kit.geo, kit.mat); mesh.userData.shared = true; mesh.scale.setScalar(1.5);
    const lm = labelMat(opts.labelOf(id), kit.color), sp = new THREE.Sprite(lm.mat); sp.userData.shared = true; sp.scale.set(0.32 * lm.aspect, 0.32, 1); sp.renderOrder = 5;
    root.add(mesh, sp); return { mesh, sprite: sp, id };
  };
  const drop = (p) => { root.remove(p.mesh, p.sprite); };

  function setChosen(ids) {
    for (const [id, list] of waiting) if (!ids.includes(id)) { list.forEach(drop); waiting.delete(id); }
    ids.forEach((id) => { if (!waiting.has(id)) waiting.set(id, [0, 1].map((k) => ({ ...mkPart(id), ph: Math.random() * 6, k }))); });
  }

  let running = false, stopped = false, shake = 0, spawnT = 0, inputs = [], outputs = [], k = 0;
  function setRunning(on, ins = [], outs = []) { running = on; inputs = ins; outputs = outs; }
  function setStopped(on) { if (on && !stopped) shake = 0.6; stopped = on; }
  function setLight(on) { light = !!on; }

  function update(dt, t) {
    const still = calm();
    // ventende stoffer: i en kolonne ved inngangen
    let row = 0;
    for (const [, list] of waiting) {
      list.forEach((p) => {
        const y = 1.6 - row * 0.85 - p.k * 0.0, x = IN_X + p.k * 0.75 - 0.35;
        p.mesh.position.set(x + (still ? 0 : Math.sin(t * 0.9 + p.ph) * 0.08), y + (still ? 0 : Math.sin(t * 1.1 + p.ph) * 0.08), 0.4);
        if (!still) p.mesh.rotation.y += dt * 0.5;
        p.sprite.position.set(IN_X + 0.05, y + 0.42, 0.4); p.sprite.visible = p.k === 0;
      });
      row++;
    }
    // når organellen går: strøm inn og ut
    if (running) {
      spawnT -= dt;
      if (spawnT <= 0 && inputs.length) {
        spawnT = still ? 0.9 : 0.45;
        const iid = inputs[k % inputs.length], oid = outputs[k % outputs.length]; k++;
        const a = mkPart(iid); flying.push({ ...a, from: V(IN_X + 0.4, rand(-1.4, 1.4), 0.4), to: V(rand(-0.6, 0.6), rand(-0.3, 0.3), 0), t: 0, dur: 1.3, kind: 'in' });
        if (oid) { const b = mkPart(oid); flying.push({ ...b, from: V(rand(-0.4, 0.4), rand(-0.3, 0.3), 0), to: V(OUT_X + rand(-0.3, 0.6), rand(-1.6, 1.6), 0.4), t: -0.4, dur: 1.6, kind: 'out' }); }
      }
    }
    for (let i = flying.length - 1; i >= 0; i--) {
      const f = flying[i]; f.t += dt / f.dur;
      const k2 = Math.max(0, Math.min(1, f.t)), e = k2 * k2 * (3 - 2 * k2);
      f.mesh.position.lerpVectors(f.from, f.to, e); f.mesh.position.y += Math.sin(e * Math.PI) * 0.5;
      const s = f.t < 0 ? 0 : f.kind === 'in' ? 1.5 * (1 - e * 0.9) : 1.5 * Math.min(1, e * 3) * (f.t > 1.6 ? Math.max(0, 1 - (f.t - 1.6) * 2) : 1);
      f.mesh.scale.setScalar(Math.max(0.001, s)); f.sprite.visible = s > 0.5;
      f.sprite.position.copy(f.mesh.position).add(V(0, 0.42, 0));
      if ((f.kind === 'in' && f.t >= 1) || f.t > 2.1) { drop(f); flying.splice(i, 1); }
    }
    // organellen: puls når den går, mørk og stille når den står
    const target = running ? 1 + (still ? 0.3 : 0.35 + Math.sin(t * 5) * 0.25) : stopped ? 0.25 : 0.7;
    glowMats.forEach((g) => { g.m.emissiveIntensity += (g.base * target * 1.6 - g.m.emissiveIntensity) * Math.min(1, dt * 4); });
    if (shake > 0) { shake -= dt; org.position.x = still ? 0 : Math.sin(shake * 50) * 0.08 * shake; } else org.position.x = 0;
    if (!still) org.rotation.y = Math.sin(t * 0.2) * 0.25; org.rotation.x = 0.35;
    if (sun) {
      const on = light ? 1 : 0;
      sun.userData.core.material.color.copy(ENERGY).multiplyScalar(0.15 + on * 0.85);
      sun.userData.rays.visible = !!on; sun.userData.beam.visible = !!on;
      if (on && !still) sun.userData.rays.rotation.z = t * 0.3;
    }
  }

  return {
    root, radius: 6.4, target: V(0, 0.2, 0), view: { dir: [0, 0.22, 1] },
    setChosen, setRunning, setStopped, setLight, update,
    dispose() { for (const list of waiting.values()) list.forEach(drop); waiting.clear(); flying.forEach(drop); flying.length = 0; },
  };
}
