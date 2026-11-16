// Celleverkstedet – håndlagde organeller og «bygg cellen»-visningen.
import {
  THREE, mergeGeometries, fresnelMat, glassMat, solidMat, paint, at, roundedBox, blob, makeLabel, reducedMotion,
} from './scene.js';

const rnd = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------
// Celleformer
// ---------------------------------------------------------------------
export const CELL = {
  dyr: { radius: 4.6, half: [4.0, 3.1, 3.3] },
  plante: { radius: 5.2, half: [4.5, 3.0, 2.7] },
  bakterie: { radius: 5.4, half: [3.6, 1.45, 1.45] },
};
/** Ytre form for en celletype, skalert med k (1 = membranen). */
export function cellGeometry(type, k = 1, seg = 1) {
  const [hx, hy, hz] = CELL[type].half;
  if (type === 'plante') return roundedBox(hx * k, hy * k, hz * k, 0.9 * k, Math.round(16 * seg));
  if (type === 'bakterie') return new THREE.CapsuleGeometry(hy * k, (hx - hy) * 2 * k, Math.round(10 * seg), Math.round(28 * seg)).rotateZ(Math.PI / 2);
  const g = blob(1, 0.05, 2.2, Math.round(56 * seg), Math.round(40 * seg)); g.scale(hx * k, hy * k, hz * k); return g;
}
/** Tilfeldig punkt i cytoplasma (innenfor membranen, utenfor det som er reservert). */
function insideFn(type, avoid = []) {
  const [hx, hy, hz] = CELL[type].half;
  return (r) => {
    for (let n = 0; n < 60; n++) {
      const p = V((r() * 2 - 1) * hx * 0.86, (r() * 2 - 1) * hy * 0.8, (r() * 2 - 1) * hz * 0.8);
      const inside = type === 'plante' ? true : type === 'bakterie'
        ? Math.hypot(Math.max(0, Math.abs(p.x) - (hx - hy)), p.y, p.z) < hy * 0.82
        : (p.x / hx) ** 2 + (p.y / hy) ** 2 + (p.z / hz) ** 2 < 0.72;
      if (inside && avoid.every(([c, rr]) => p.distanceTo(c) > rr)) return p;
    }
    return V(0, 0, 0);
  };
}

// ---------------------------------------------------------------------
// Organeller – hver gir en Group i lokale enheter
// ---------------------------------------------------------------------
export function makeNucleus(r = 1.2, lowQ = false) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), glassMat('#7f78e6', 0.32)));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r * 1.04, 40, 28), fresnelMat('#a9a2ff', 1.1)));
  const nucleolus = new THREE.Mesh(blob(r * 0.36, 0.12, 4), solidMat('#4b3fa8', { emissive: '#3a2f8a', emissiveIntensity: 0.25 }));
  nucleolus.position.set(r * 0.22, r * 0.1, r * 0.15); g.add(nucleolus);
  // kjerneporer: små ringer på overflaten
  const n = lowQ ? 24 : 44, pore = new THREE.InstancedMesh(new THREE.TorusGeometry(r * 0.075, r * 0.022, 6, 14), solidMat('#d6d2ff', { emissive: '#8f86ff', emissiveIntensity: 0.3 }), n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), z = V(0, 0, 1);
  for (let i = 0; i < n; i++) {
    const y = 1 - (i + 0.5) / n * 2, rad = Math.sqrt(1 - y * y), a = i * 2.39996;
    const d = V(Math.cos(a) * rad, y, Math.sin(a) * rad);
    q.setFromUnitVectors(z, d); m.compose(d.clone().multiplyScalar(r * 1.01), q, V(1, 1, 1)); pore.setMatrixAt(i, m);
  }
  g.add(pore);
  // kromatin: tynne tråder inni
  const R = rnd(7); const pts = [];
  for (let i = 0; i < 18; i++) pts.push(V((R() - 0.5) * r * 1.3, (R() - 0.5) * r * 1.3, (R() - 0.5) * r * 1.3));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, r * 0.025, 5), glassMat('#c9b8ff', 0.55)));
  return g;
}

export function makeMito(len = 1.5, w = 0.48) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CapsuleGeometry(w, len, 8, 20).rotateZ(Math.PI / 2).scale(1, 0.85, 1), glassMat('#ff9a6b', 0.38)));
  g.add(new THREE.Mesh(new THREE.CapsuleGeometry(w * 1.03, len, 8, 20).rotateZ(Math.PI / 2).scale(1, 0.85, 1), fresnelMat('#ffb28c', 0.9)));
  // indre membran: folder (cristae) som stikker inn fra veggene vekselvis
  const parts = [], n = Math.max(4, Math.round(len * 4.2));
  for (let i = 0; i < n; i++) {
    const x = -len / 2 - w * 0.4 + (i + 0.5) * ((len + w * 0.8) / n), up = i % 2 ? 1 : -1;
    parts.push(at(new THREE.BoxGeometry(0.045, w * 1.05, w * 1.35), x, up * w * 0.2, 0));
  }
  g.add(new THREE.Mesh(mergeGeometries(parts), solidMat('#ffcfb0', { emissive: '#ff8a5c', emissiveIntensity: 0.25, transparent: true, opacity: 0.85 })));
  return g;
}

export function makeER(r0 = 1.5, lowQ = false) {
  const g = new THREE.Group(), sheet = glassMat('#56c4b2', 0.42, { side: THREE.DoubleSide });
  const dots = [];
  for (let j = 0; j < 4; j++) {
    const R = r0 + j * 0.22;
    const geo = new THREE.SphereGeometry(R, 40, 16, -0.9, 1.9, 0.55 + j * 0.06, 1.9 - j * 0.1), p = geo.attributes.position, v = V();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const a = Math.atan2(v.z, v.x), k = 1 + 0.045 * Math.sin(a * 9 + v.y * 4 + j); p.setXYZ(i, v.x * k, v.y * k, v.z * k); }
    geo.computeVertexNormals(); g.add(new THREE.Mesh(geo, sheet));
    if (j % 2 === 1) for (let i = 0; i < p.count; i += lowQ ? 9 : 5) { v.fromBufferAttribute(p, i); dots.push(v.clone().multiplyScalar(1.02)); }
  }
  // ribosomer på ytre lag = ru ER
  const ri = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 6, 5), solidMat('#e9f5b0', { emissive: '#bcd36a', emissiveIntensity: 0.3 }), dots.length);
  const m = new THREE.Matrix4(); dots.forEach((d, i) => { m.makeTranslation(d.x, d.y, d.z); ri.setMatrixAt(i, m); }); g.add(ri);
  return g;
}

export function makeGolgi(w = 1.1) {
  const g = new THREE.Group(), parts = [];
  for (let i = 0; i < 5; i++) {
    const rad = w * (1 - Math.abs(i - 2) * 0.12), geo = new THREE.CylinderGeometry(rad, rad, 0.09, 36, 1), p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k), z = p.getZ(k); p.setXYZ(k, x * 1.25, p.getY(k) + 0.32 * (x * x) / (w * w) - 0.05 * z, z * 0.55); }
    geo.translate(0, i * 0.17, 0); parts.push(geo);
  }
  const stack = mergeGeometries(parts); stack.computeVertexNormals();
  g.add(new THREE.Mesh(stack, solidMat('#f0a3d0', { emissive: '#c46aa3', emissiveIntensity: 0.22, transparent: true, opacity: 0.88 })));
  const ves = solidMat('#f7c4e2', { emissive: '#c46aa3', emissiveIntensity: 0.25 });
  [[1.55, 0.7, 0.2], [-1.5, 0.75, -0.1], [1.35, 0.2, 0.35], [-1.25, 0.05, 0.3]].forEach(([x, y, z], i) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.09 + (i % 2) * 0.03, 10, 8), ves); s.position.set(x * w, y, z); g.add(s);
  });
  return g;
}

export function makeLyso(r = 0.36) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), glassMat('#c38bff', 0.45)));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r * 1.04, 24, 16), fresnelMat('#d6a8ff', 0.9)));
  const R = rnd(3), dots = [];
  for (let i = 0; i < 9; i++) { const d = V(R() - 0.5, R() - 0.5, R() - 0.5).normalize().multiplyScalar(r * 0.55 * R()); dots.push(at(new THREE.IcosahedronGeometry(r * 0.13, 0), d.x, d.y, d.z)); }
  g.add(new THREE.Mesh(mergeGeometries(dots), solidMat('#7a3fd1', { emissive: '#7a3fd1', emissiveIntensity: 0.4 })));
  return g;
}

export function makeChloro(s = 1, lowQ = false) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20).scale(1.0 * s, 0.42 * s, 0.6 * s), glassMat('#4fbf63', 0.35)));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(1.03, 32, 20).scale(1.0 * s, 0.42 * s, 0.6 * s), fresnelMat('#8cf09a', 1)));
  const discs = [], lam = [], n = lowQ ? 3 : 4;
  for (let k = 0; k < n; k++) {
    const x = (-0.6 + k * (1.2 / (n - 1))) * s, z = (k % 2 ? 0.12 : -0.12) * s;
    for (let j = 0; j < 5; j++) discs.push(at(new THREE.CylinderGeometry(0.17 * s, 0.17 * s, 0.035 * s, 18), x, (-0.13 + j * 0.065) * s, z));
    if (k) lam.push(at(new THREE.BoxGeometry(1.2 / (n - 1) * s, 0.02 * s, 0.05 * s), x - 0.6 / (n - 1) * s, 0, z * 0));
  }
  const grana = new THREE.Mesh(mergeGeometries(discs), solidMat('#2f9c48', { emissive: '#2fd157', emissiveIntensity: 0.3 }));
  grana.userData.glow = true; g.add(grana);
  g.add(new THREE.Mesh(mergeGeometries(lam), solidMat('#5bd477')));
  return g;
}

export function makeVacuole(rx = 2.2, ry = 1.6, rz = 1.4) {
  const g = new THREE.Group(), geo = blob(1, 0.07, 5, 40, 28); geo.scale(rx, ry, rz);
  g.add(new THREE.Mesh(geo, glassMat('#6fb6ff', 0.2)));
  const shell = geo.clone(); shell.scale(1.02, 1.02, 1.02);
  g.add(new THREE.Mesh(shell, fresnelMat('#8fd0ff', 1.1)));
  return g;
}

export function makeDNA(r = 1.3) {
  const R = rnd(11), pts = [];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    pts.push(V(Math.cos(a) * r * (0.6 + R() * 0.5), Math.sin(a * 3) * 0.35 + (R() - 0.5) * 0.4, Math.sin(a) * r * 0.55 * (0.6 + R() * 0.5)));
  }
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 260, 0.05, 6, true), solidMat('#ffae8a', { emissive: '#ff7d5c', emissiveIntensity: 0.35 })));
  return g;
}

/** Flagell: hale som bølger. Hjørnene flyttes hvert bilde ut fra den rette utgangsformen. */
export function makeFlagellum(len = 4) {
  const geo = new THREE.TubeGeometry(new THREE.LineCurve3(V(0, 0, 0), V(len, 0, 0)), 80, 0.05, 6), base = geo.attributes.position.array.slice();
  const mesh = new THREE.Mesh(geo, solidMat('#cfe7a8', { emissive: '#8fbf5a', emissiveIntensity: 0.25 }));
  const g = new THREE.Group(); g.add(mesh);
  g.userData.tick = (t) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], u = x / len, ph = u * 9 - t * 4;
      p.setXYZ(i, x, base[i * 3 + 1] + Math.sin(ph) * 0.32 * u, base[i * 3 + 2] + Math.cos(ph) * 0.32 * u);
    }
    p.needsUpdate = true;
  };
  return g;
}

/** Ribosomer: mange små prikker (instansiert). */
export function makeRibosomes(points) {
  const geo = mergeGeometries([at(new THREE.SphereGeometry(0.06, 7, 5), 0, 0.03, 0), at(new THREE.SphereGeometry(0.075, 7, 5), 0, -0.04, 0)]);
  const mesh = new THREE.InstancedMesh(geo, solidMat('#e9f5b0', { emissive: '#bcd36a', emissiveIntensity: 0.35 }), points.length);
  const m = new THREE.Matrix4(); points.forEach((p, i) => { m.makeTranslation(p.x, p.y, p.z); mesh.setMatrixAt(i, m); });
  const g = new THREE.Group(); g.add(mesh); return g;
}

// ---------------------------------------------------------------------
// Plassering per celletype: [posisjon, rotasjon-y, skala] – flere for organeller som finnes i flere eksemplarer
// ---------------------------------------------------------------------
const SLOTS = {
  dyr: {
    kjerne: [[V(-0.7, 0.25, 0)]], er: [[V(-0.7, 0.25, 0), 0.1]], golgi: [[V(1.75, -0.55, 0.5), -0.5]],
    mitokondrie: [[V(2.1, 1.25, -0.9), 0.6], [V(-2.4, -1.3, 0.7), -0.4], [V(0.5, -1.95, -1.1), 1.2]],
    lysosom: [[V(-2.3, 1.45, 0.4)], [V(0.9, 1.95, 1.0)]], kloroplast: [[V(1.3, 1.6, -0.6), 0.5]], vakuole: [[V(1.4, 0.2, -0.2), 0, 0.45]],
  },
  plante: {
    vakuole: [[V(0.7, -0.15, 0)]], kjerne: [[V(-2.85, 1.15, 0.6)]], er: [[V(-2.85, 1.15, 0.6), 2.6, 0.62]], golgi: [[V(-2.9, -1.4, 0.8), 0.3, 0.8]],
    kloroplast: [[V(-1.2, 2.25, -0.9), 0.2], [V(2.5, 2.2, 0.9), -0.3], [V(3.4, -1.9, -0.6), 0.6], [V(-1.0, -2.3, 1.1), -0.5], [V(-3.3, -0.7, -1.3), 1.4]],
    mitokondrie: [[V(1.5, 2.3, -1.4), 0.5, 0.85], [V(0.9, -2.35, -1.2), -0.3, 0.85]], lysosom: [[V(-3.6, 2.2, -0.6)]],
  },
  bakterie: {
    arvestoff: [[V(0, 0, 0)]], flagell: [[V(3.5, 0, 0)]], kjerne: [[V(0, 0, 0), 0, 0.6]], vakuole: [[V(1.6, 0, 0), 0, 0.5]],
    mitokondrie: [[V(-1.6, 0.3, 0.2), 0.3, 0.6]], kloroplast: [[V(1.5, 0, 0), 0, 0.6]],
  },
};
const FALLBACK = [[V(0.5, 0.5, 0.5)]];

// ---------------------------------------------------------------------
// Visningen
// ---------------------------------------------------------------------
/**
 * Bygg cellen. opts: { lowQ, labelOf(id) → tekst }.
 * Metoder: place(id, animate), has(id), select(id), parts.
 */
export function createCellView(type, opts = {}) {
  const root = new THREE.Group(), lowQ = !!opts.lowQ;
  const placed = new Map(); // id -> { group, slots:[{obj, base, phase}] , t }
  const pickables = [];
  const still = () => reducedMotion();

  // celleformen: prikket omriss før membranen er satt inn
  const ghostGeo = cellGeometry(type, 1, 0.7);
  const ghost = new THREE.Points(ghostGeo, new THREE.PointsMaterial({ color: '#9fe6ea', size: 0.07, transparent: true, opacity: 0.5, depthWrite: false }));
  root.add(ghost);
  const cyto = new THREE.Mesh(cellGeometry(type, 0.985), new THREE.MeshBasicMaterial({ color: '#2a6c74', transparent: true, opacity: 0.05, depthWrite: false, side: THREE.BackSide }));
  root.add(cyto);
  const selLabel = { sprite: null, id: null };

  const avoid = [[SLOTS[type]?.kjerne?.[0]?.[0] || V(99, 0, 0), 1.6], [SLOTS[type]?.vakuole?.[0]?.[0] || V(99, 0, 0), type === 'plante' ? 2.3 : 0.1]];
  const inside = insideFn(type, avoid);

  function build(id) {
    const [hx, hy, hz] = CELL[type].half;
    if (id === 'membran') {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(cellGeometry(type, 1), fresnelMat('#86cfdc', 1.15, 2.4)));
      g.add(new THREE.Mesh(cellGeometry(type, 1), new THREE.MeshBasicMaterial({ color: '#2a6c74', transparent: true, opacity: 0.07, depthWrite: false })));
      g.userData.shell = true; return [g];
    }
    if (id === 'cellevegg') {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(cellGeometry(type, 1.09), fresnelMat(type === 'plante' ? '#a6e07a' : '#d8c78a', 1.3, 1.6)));
      g.add(new THREE.Mesh(cellGeometry(type, 1.09), glassMat(type === 'plante' ? '#5c8f3e' : '#8f7f4a', 0.12)));
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cellGeometry(type, 1.095, 0.35), 25), new THREE.LineBasicMaterial({ color: '#c9e6a0', transparent: true, opacity: 0.18 }));
      g.add(edges); g.userData.shell = true; return [g];
    }
    if (id === 'ribosom') {
      const R = rnd(type.length * 31), pts = []; const n = lowQ ? 55 : 110;
      for (let i = 0; i < n; i++) pts.push(inside(R));
      return [makeRibosomes(pts)];
    }
    const slots = (SLOTS[type] && SLOTS[type][id]) || FALLBACK;
    return slots.map(([p, ry = 0, s = 1]) => {
      let g;
      switch (id) {
        case 'kjerne': g = makeNucleus(type === 'plante' ? 0.95 : 1.2, lowQ); break;
        case 'mitokondrie': g = makeMito(1.4); break;
        case 'er': g = makeER(type === 'plante' ? 1.2 : 1.5, lowQ); break;
        case 'golgi': g = makeGolgi(1.0); break;
        case 'lysosom': g = makeLyso(); break;
        case 'kloroplast': g = makeChloro(0.95, lowQ); break;
        case 'vakuole': g = makeVacuole(type === 'plante' ? 2.6 : 1.4, type === 'plante' ? 1.95 : 1.1, type === 'plante' ? 1.75 : 1); break;
        case 'arvestoff': g = makeDNA(type === 'bakterie' ? 1.5 : 1); break;
        case 'flagell': g = makeFlagellum(type === 'bakterie' ? 2.8 : 2.0); if (type !== 'bakterie') g.rotation.z = 0.5; break;
        default: g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), glassMat('#9fe6ea', 0.4)));
      }
      g.position.copy(p); g.rotation.y = ry; g.scale.setScalar(s); g.userData.baseScale = s;
      void hx; void hy; void hz;
      return g;
    });
  }

  const tmp = V(), startTmp = V();
  /** Sett inn en organell. from = startpunkt i verdenskoordinater (f.eks. ved brettet), eller null. */
  function place(id, from) {
    if (placed.has(id)) return;
    const objs = build(id), group = new THREE.Group(); group.userData.pickId = id; if (id === 'membran' || id === 'cellevegg') group.userData.pickLow = true;
    objs.forEach((o, i) => {
      group.add(o);
      o.userData.home = o.position.clone(); o.userData.phase = i * 1.7 + id.length;
      o.userData.from = from ? root.worldToLocal(startTmp.copy(from)).clone().add(V((i - (objs.length - 1) / 2) * 0.6, 0, 0)) : null;
    });
    root.add(group); pickables.push(group);
    placed.set(id, { group, objs, t: from && !still() ? 0 : 1, shell: !!objs[0].userData.shell });
    if (id === 'membran') ghost.visible = false;
  }

  function select(id) {
    if (selLabel.sprite) { root.remove(selLabel.sprite); selLabel.sprite.material.map.dispose(); selLabel.sprite.material.dispose(); selLabel.sprite = null; }
    selLabel.id = id;
    if (!id || !placed.has(id) || !opts.labelOf) return;
    const s = makeLabel(opts.labelOf(id), { color: 'rgba(230,243,242,0.75)', size: 0.5, depthTest: false, order: 8 });
    selLabel.sprite = s; root.add(s);
  }

  const ease = (x) => 1 - Math.pow(1 - x, 3);
  function update(dt, t) {
    const calm = still();
    for (const [id, p] of placed) {
      if (p.t < 1) p.t = Math.min(1, p.t + dt / 1.0);
      const e = ease(p.t), over = p.t < 1 ? Math.sin(p.t * Math.PI) * 0.12 : 0;
      if (p.shell) {
        // membran og vegg «legger seg rundt» cellen
        const k = 1 + (1 - e) * 0.35; p.group.scale.setScalar(k * (calm ? 1 : 1 + Math.sin(t * 0.6) * 0.006));
        p.group.traverse((o) => { if (o.material && o.material.uniforms) o.material.uniforms.uIntensity.value = (id === 'cellevegg' ? 1.1 : 0.85) * e * (selLabel.id === id ? 1.6 : 1); });
        continue;
      }
      for (const o of p.objs) {
        const home = o.userData.home, from = o.userData.from, ph = o.userData.phase, s = o.userData.baseScale || 1;
        if (from && p.t < 1) {
          // bue fra brettet og inn til plassen
          tmp.lerpVectors(from, home, e); tmp.y += Math.sin(e * Math.PI) * 1.4;
          o.position.copy(tmp); o.scale.setScalar(s * (0.35 + 0.65 * e + over));
        } else {
          const sel = selLabel.id === id ? 1.08 : 1;
          o.scale.setScalar(s * (o.scale.x / s + (sel - o.scale.x / s) * Math.min(1, dt * 6)));
          if (calm) o.position.copy(home);
          else o.position.set(home.x + Math.sin(t * 0.31 + ph) * 0.05, home.y + Math.sin(t * 0.27 + ph * 1.3) * 0.05, home.z + Math.cos(t * 0.23 + ph) * 0.05);
        }
        if (!calm && o.userData.tick) o.userData.tick(t);
        if (!calm && id !== 'vakuole' && id !== 'kjerne') o.rotation.x = Math.sin(t * 0.2 + ph) * 0.08;
      }
    }
    if (selLabel.sprite) {
      const p = placed.get(selLabel.id), o = p && (p.shell ? null : p.objs[0]);
      const top = o ? o.position.clone().add(V(0, 1.1 * (o.userData.baseScale || 1) + (selLabel.id === 'kjerne' ? 0.5 : 0), 0)) : V(0, CELL[type].half[1] + 0.6, 0);
      selLabel.sprite.position.copy(top);
    }
    if (!calm) cyto.scale.setScalar(1 + Math.sin(t * 0.6) * 0.006);
  }

  return {
    root, pickables, radius: CELL[type].radius, target: V(0, 0, 0), view: { dir: [0.18, 0.32, 1] },
    place, select, has: (id) => placed.has(id), update, dispose() { select(null); },
    get selected() { return selLabel.id; },
  };
}
