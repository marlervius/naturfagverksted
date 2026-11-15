// Ren bindingslogikk – ingen DOM, ingen three. Skolemodellen fra ARCHITECTURE.md.

const countsKey = (syms) => {
  const c = {};
  for (const s of syms) c[s] = (c[s] || 0) + 1;
  return Object.keys(c).sort().map((s) => s + c[s]).join('');
};

const bondsKey = (list) => {
  // list: [symA, symB, order]
  const c = {};
  for (const [a, b, o] of list) {
    const k = (a <= b ? a + '-' + b : b + '-' + a) + ':' + o;
    c[k] = (c[k] || 0) + 1;
  }
  return Object.keys(c).sort().map((k) => k + 'x' + c[k]).join(',');
};

/** Signatur for et katalogmolekyl (samme format som World.signature). */
export function sigOfMolecule(mol) {
  if (mol.ionic) return countsKey(mol.atoms) + '|i';
  return countsKey(mol.atoms) + '|' + bondsKey(mol.bonds.map(([i, j, o]) => [mol.atoms[i], mol.atoms[j], o]));
}

export class World {
  constructor(EL) {
    this.EL = EL;
    this.atoms = new Map();
    this.bonds = []; // { a, b, kind: 'cov'|'ion', order }  – for 'ion' er a metallet (giver), order = antall elektroner
    this._next = 1;
  }

  clear() { this.atoms.clear(); this.bonds.length = 0; }

  addAtom(sym) {
    const el = this.EL[sym];
    if (!el || !el.buildable) return null;
    const atom = { id: this._next++, sym, el };
    this.atoms.set(atom.id, atom);
    return atom;
  }

  removeAtom(id) {
    this.bonds = this.bonds.filter((b) => b.a !== id && b.b !== id);
    this.atoms.delete(id);
  }

  bondsOf(id) { return this.bonds.filter((b) => b.a === id || b.b === id); }
  covSum(id) { let s = 0; for (const b of this.bonds) if (b.kind === 'cov' && (b.a === id || b.b === id)) s += b.order; return s; }
  gave(id) { let s = 0; for (const b of this.bonds) if (b.kind === 'ion' && b.a === id) s += b.order; return s; }
  got(id) { let s = 0; for (const b of this.bonds) if (b.kind === 'ion' && b.b === id) s += b.order; return s; }

  /** Uparede elektroner = hvor mange bindinger/overføringer atomet fortsatt «mangler». */
  unpaired(id) {
    const { el } = this.atoms.get(id);
    if (el.role === 'noble') return 0;
    if (el.role === 'metal') return el.bonds - this.gave(id);
    return el.bonds - this.covSum(id) - this.got(id);
  }

  lonePairs(id) {
    const { el } = this.atoms.get(id);
    if (el.role === 'noble') return el.valence / 2;
    if (el.role === 'metal') return 0;
    return (el.valence - el.bonds) / 2 + this.got(id);
  }

  charge(id) { return this.gave(id) - this.got(id); }

  info(id) {
    const atom = this.atoms.get(id);
    if (!atom) return null;
    const { el, sym } = atom;
    const unpaired = this.unpaired(id);
    let outer, max;
    if (el.role === 'noble') { outer = el.valence; max = el.valence; }
    else if (el.role === 'metal') {
      if (unpaired === 0) { outer = el.shells[el.shells.length - 2]; max = outer; } // ytterskallet er tømt – skallet innenfor er fullt
      else { outer = el.valence - this.gave(id); max = 8; }
    } else {
      max = sym === 'H' ? 2 : 8;
      outer = el.valence + this.covSum(id) + this.got(id);
    }
    return {
      sym, charge: this.charge(id), outer, max, full: unpaired === 0, unpaired,
      lonePairs: this.lonePairs(id), bondCount: this.covSum(id),
    };
  }

  /** Info for et fritt, nøytralt atom (brukes når eleven peker i periodesystemet). */
  static neutralInfo(el) {
    const v = el.valence ?? el.shells[el.shells.length - 1];
    const max = el.period === 1 ? 2 : 8;
    const unpaired = el.bonds ?? 0;
    return {
      sym: el.sym, charge: 0, outer: v, max, full: el.role === 'noble', unpaired,
      lonePairs: el.role === 'nonmetal' ? (v - unpaired) / 2 : el.role === 'noble' ? v / 2 : 0, bondCount: 0,
    };
  }

  /**
   * Én handling: del ett elektronpar (kovalent) eller flytt ett elektron (ione).
   * Returnerer { ok, reason, atom?, kind?, order?, from?, to? }.
   */
  tryBond(idA, idB) {
    if (idA === idB) return { ok: false, reason: 'same' };
    const A = this.atoms.get(idA), B = this.atoms.get(idB);
    if (!A || !B) return { ok: false, reason: 'same' };
    if (A.el.role === 'noble') return { ok: false, reason: 'noble', atom: A };
    if (B.el.role === 'noble') return { ok: false, reason: 'noble', atom: B };
    if (A.el.role === 'metal' && B.el.role === 'metal') return { ok: false, reason: 'metalMetal', atom: A, other: B };
    if (this.unpaired(idA) === 0) return { ok: false, reason: 'full', atom: A };
    if (this.unpaired(idB) === 0) return { ok: false, reason: 'full', atom: B };

    if (A.el.role === 'nonmetal' && B.el.role === 'nonmetal') {
      let b = this.bonds.find((x) => x.kind === 'cov' && ((x.a === idA && x.b === idB) || (x.a === idB && x.b === idA)));
      if (b && b.order >= 3) return { ok: false, reason: 'full', atom: A };
      if (b) b.order++; else { b = { a: idA, b: idB, kind: 'cov', order: 1 }; this.bonds.push(b); }
      return { ok: true, reason: 'cov', kind: 'cov', order: b.order, a: A, b: B };
    }
    const [M, N] = A.el.role === 'metal' ? [A, B] : [B, A];
    let b = this.bonds.find((x) => x.kind === 'ion' && x.a === M.id && x.b === N.id);
    if (b) b.order++; else { b = { a: M.id, b: N.id, kind: 'ion', order: 1 }; this.bonds.push(b); }
    return { ok: true, reason: 'ion', kind: 'ion', order: b.order, from: M, to: N };
  }

  /** Angre én binding/ett overført elektron mellom to atomer. */
  removeBond(idA, idB) {
    const i = this.bonds.findIndex((x) => (x.a === idA && x.b === idB) || (x.a === idB && x.b === idA));
    if (i < 0) return false;
    if (--this.bonds[i].order <= 0) this.bonds.splice(i, 1);
    return true;
  }

  component(id) {
    const seen = new Set([id]); const stack = [id];
    while (stack.length) {
      const cur = stack.pop();
      for (const b of this.bonds) {
        const o = b.a === cur ? b.b : b.b === cur ? b.a : null;
        if (o !== null && !seen.has(o)) { seen.add(o); stack.push(o); }
      }
    }
    return [...seen].sort((x, y) => x - y);
  }

  components() {
    const out = []; const seen = new Set();
    for (const id of this.atoms.keys()) {
      if (seen.has(id)) continue;
      const c = this.component(id); c.forEach((x) => seen.add(x)); out.push(c);
    }
    return out;
  }

  isStable(ids) { return ids.length > 1 && ids.every((id) => this.unpaired(id) === 0); }

  signature(ids) {
    const set = new Set(ids);
    const syms = ids.map((id) => this.atoms.get(id).sym);
    const inside = this.bonds.filter((b) => set.has(b.a) && set.has(b.b));
    if (inside.some((b) => b.kind === 'ion')) return countsKey(syms) + '|i';
    return countsKey(syms) + '|' + bondsKey(inside.map((b) => [this.atoms.get(b.a).sym, this.atoms.get(b.b).sym, b.order]));
  }
}
