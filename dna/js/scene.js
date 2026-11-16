// Deler renderer, lys, rotasjon og kvalitetsvakt med Celleverkstedet.
import { THREE, Stage, makeLabel, solidMat, disposeTree, reducedMotion } from '../../celle/js/scene.js';
import { BASES } from './data.js';
import { complement, codingToRNA, translationSteps } from './sim.js';
export { Stage };
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const COLOR = b => BASES[b]?.color || '#425e69';

export function createDNAView(goal, state, text, lowQ = false) {
  const root = new THREE.Group(), pickables = [];
  let content;
  const segments = lowQ ? 8 : 14;
  function sphere(parent, p, r, color) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, segments, segments), solidMat(color));
    mesh.position.copy(p); parent.add(mesh); return mesh;
  }
  function link(parent, a, b, color, radius = 0.045) {
    const d = b.clone().sub(a), mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, d.length(), 8), solidMat(color));
    mesh.position.copy(a).add(b).multiplyScalar(0.5); mesh.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); parent.add(mesh);
  }
  function label(parent, word, p, color = '#e6f3f2', size = 0.3) {
    const sprite = makeLabel(word, { fg: color, size, bg: false });
    // Three.js deler ett geometriobjekt mellom alle sprites. Bare materialet og teksten skal ryddes bort.
    sprite.geometry.userData.shared = true;
    sprite.position.copy(p); parent.add(sprite); return sprite;
  }
  function base(parent, letter, p, end, id, selected) {
    link(parent, p, end, COLOR(letter), 0.1);
    const mesh = sphere(parent, end, selected ? 0.25 : 0.2, COLOR(letter));
    if (id && !letter) { mesh.userData.pickId = id; pickables.push(mesh); }
    if (selected) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.035, 6, 28), solidMat('#ffd76a'));
      ring.position.copy(end); parent.add(ring);
    }
    label(parent, letter || '?', end.clone().add(V(0, 0, 0.32)), letter ? '#06141b' : '#c2dde1', 0.27);
  }
  function duplex(left, right, x, row, opts = {}) {
    const group = new THREE.Group(); group.position.x = x; content.add(group);
    const n = left.length, helix = goal.type !== 'transcribe';
    let prevL, prevR;
    for (let i = 0; i < n; i++) {
      const a = helix ? i * Math.PI * 2 / 10.5 + 0.24 : 0;
      const y = ((n - 1) / 2 - i) * 0.68;
      const l = V(-1.4 * Math.cos(a), y, -1.4 * Math.sin(a));
      const r = V(1.4 * Math.cos(a), y, 1.4 * Math.sin(a));
      sphere(group, l, 0.15, '#a2c8ce'); sphere(group, r, 0.15, opts.rna ? '#e7b49c' : '#9ba5c8');
      for (const [p, prev, c] of [[l, prevL, '#81aab5'], [r, prevR, opts.rna ? '#edba91' : '#b49cff']]) {
        if (!prev) continue;
        const mid = p.clone().add(prev).multiplyScalar(0.5);
        sphere(group, mid, 0.105, '#ffd76a'); link(group, p, mid, c); link(group, mid, prev, c);
      }
      const le = l.clone().multiply(V(0.27, 1, 0.27)), re = r.clone().multiply(V(0.27, 1, 0.27));
      base(group, left[i], l, le, null, false);
      base(group, right[i], r, re, `${row}:${i}`, state.activeRow === row && state.active === i && !right[i]);
      if (right[i]) {
        const count = 'CG'.includes(left[i]) ? 3 : 2;
        for (let j = 0; j < count; j++) {
          const offset = V(0, (j - (count - 1) / 2) * 0.1, 0);
          for (let k = 0; k < 3; k++) {
            const start = le.clone().lerp(re, (k + 0.1) / 3).add(offset), end = le.clone().lerp(re, (k + 0.65) / 3).add(offset);
            link(group, start, end, '#7896a0', 0.016);
          }
        }
      }
      prevL = l; prevR = r;
    }
    const top = n * 0.34 + 0.42, ldir = opts.template ? '3′' : opts.reverse ? '3′' : '5′';
    label(group, ldir, V(-1.5, top, 0), '#a2c8ce');
    label(group, ldir === '3′' ? '5′' : '3′', V(-1.5, -top, 0), '#a2c8ce');
    label(group, ldir === '3′' ? '5′' : '3′', V(1.5, top, 0), '#b49cff');
    label(group, ldir, V(1.5, -top, 0), '#b49cff');
    if (opts.title) label(group, opts.title, V(0, top + 0.55, 0), '#e6f3f2', 0.32);
  }
  function draw(s) {
    state = s;
    if (content) { root.remove(content); disposeTree(content); }
    content = new THREE.Group(); root.add(content); pickables.length = 0;
    if (goal.type === 'parts') {
      const p = V(-1.8, 0, 0), sugar = V(0, 0, 0), b = V(1.8, 0, 0);
      if (s.parts.includes('fosfat')) { sphere(content, p, 0.43, '#ffd76a'); label(content, text('part.fosfat'), V(-1.8, -0.95, 0)); }
      if (s.parts.includes('sukker')) {
        const shape = new THREE.Shape(); for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 + Math.PI / 2; i ? shape.lineTo(Math.cos(a) * 0.55, Math.sin(a) * 0.55) : shape.moveTo(Math.cos(a) * 0.55, Math.sin(a) * 0.55); } shape.closePath();
        const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 }), solidMat('#7cc8ff')); content.add(mesh);
        label(content, text('part.sukker'), V(0, -0.95, 0));
      }
      if (s.parts.includes('base')) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.65, 0.28), solidMat('#6fe3a5')); mesh.position.copy(b); content.add(mesh); label(content, text('part.base'), V(1.8, -0.95, 0)); }
      if (s.parts.includes('sukker') && s.parts.includes('fosfat')) link(content, p, sugar, '#a2c8ce', 0.09);
      if (s.parts.includes('sukker') && s.parts.includes('base')) link(content, sugar, b, '#a2c8ce', 0.09);
      if (!s.parts.length) label(content, text('dn.partReady'), V(0, 0, 0), '#8fb0b3', 0.28);
    } else if (goal.type === 'replicate' && s.opened) {
      duplex(goal.template, s.rows[0], -2.2, 0, { title: text('dn.copy', { n: 1 }) });
      duplex(complement(goal.template), s.rows[1], 2.2, 1, { reverse: true, title: text('dn.copy', { n: 2 }) });
    } else if (['pair', 'replicate', 'transcribe'].includes(goal.type)) {
      duplex(goal.template, goal.type === 'replicate' ? complement(goal.template) : s.rows[0], 0, 0, { template: goal.type === 'transcribe', rna: goal.type === 'transcribe' });
    } else {
      const rna = goal.type === 'mutation' ? codingToRNA(goal.changed) : goal.rna;
      const n = rna.length, y = 0.8, start = -((n - 1) * 0.39) / 2;
      const active = s.peptide.length * 3;
      let prev;
      for (let i = 0; i < n; i++) {
        const pos = V(start + i * 0.39, y, 0);
        sphere(content, pos, 0.145, COLOR(rna[i])); label(content, rna[i], pos.clone().add(V(0, 0.34, 0)), '#e6f3f2', 0.22);
        if (prev) link(content, prev, pos, '#e7b49c', 0.035); prev = pos;
      }
      label(content, '5′', V(start - 0.4, y, 0)); label(content, '3′', V(-start + 0.4, y, 0));
      const steps = translationSteps(goal);
      if (!s.stopped && s.peptide.length < steps.length) {
        const rib = new THREE.Mesh(new THREE.SphereGeometry(0.9, 22, 16), new THREE.MeshStandardMaterial({ color: '#9fe6ea', transparent: true, opacity: 0.18, roughness: 0.3, depthWrite: false }));
        rib.scale.set(1, 0.65, 0.65); rib.position.set(start + (active + 1) * 0.39, y, 0); content.add(rib);
      }
      label(content, text('dn.rna'), V(0, 2, 0), '#e7b49c', 0.3);
      for (let i = 0; i < s.peptide.length; i++) {
        const p = V((i - (s.peptide.length - 1) / 2) * 1.15, -1.1 + Math.sin(i * 1.1) * 0.2, 0.3);
        sphere(content, p, 0.34, ['#ffd76a', '#7cc8ff', '#6fe3a5', '#b49cff'][i % 4]);
        label(content, s.peptide[i], p.clone().add(V(0, 0, 0.4)), '#06141b', 0.24);
        if (i) link(content, V((i - 1 - (s.peptide.length - 1) / 2) * 1.15, -1.1 + Math.sin((i - 1) * 1.1) * 0.2, 0.3), p, '#a2c8ce', 0.07);
      }
      if (s.stopped) label(content, text('dn.stopPlaced'), V(0, -2.1, 0), '#6fe3a5', 0.23);
    }
  }
  draw(state);
  return {
    root, pickables, radius: goal.type === 'replicate' ? 5.3 : goal.type === 'parts' ? 3 : Math.max(3.7, (goal.template?.length || 0) * 0.35 + 0.9),
    view: { dir: [0, 0.04, 1], minPolar: 0.4, maxPolar: Math.PI - 0.4 },
    setState: draw,
    update(dt, t) { if (!reducedMotion()) content.position.y = Math.sin(t * 0.65) * 0.04; },
  };
}
