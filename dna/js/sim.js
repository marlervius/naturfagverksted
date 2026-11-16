// Ren faglogikk. Sekvenser oppgis alltid med eksplisitt retning i grensesnittet.
// complement beholder kolonnerekkefølgen: 5′ ATGC 3′ → 3′ TACG 5′.
export const DNA = ['A', 'T', 'C', 'G'];
export const RNA = ['A', 'U', 'C', 'G'];
const PAIR = { A: 'T', T: 'A', C: 'G', G: 'C' };
const RNA_PAIR = { A: 'U', T: 'A', C: 'G', G: 'C' };
export function validate(sequence, alphabet = DNA) {
  if (typeof sequence !== 'string' || !sequence.length || [...sequence].some(b => !alphabet.includes(b))) {
    throw new Error('Ugyldig basesekvens');
  }
  return sequence;
}
export const complement = sequence => [...validate(sequence)].map(b => PAIR[b]).join('');
export const reverseComplement = sequence => [...complement(sequence)].reverse().join('');
// Maltråden er vist 3′ → 5′; mRNA bygges 5′ → 3′.
export const transcribe = template => [...validate(template)].map(b => RNA_PAIR[b]).join('');
export const codingToRNA = coding => validate(coding).replaceAll('T', 'U');
export function codons(rna) {
  validate(rna, RNA);
  if (rna.length % 3) throw new Error('Sekvensen må ha hele kodoner');
  return rna.match(/.{3}/g);
}
// Standard genetisk kode, NCBI tabell 1. Stoppsignal er ikke en aminosyre.
const GROUPS = {
  Phe: ['UUU', 'UUC'], Leu: ['UUA', 'UUG', 'CUU', 'CUC', 'CUA', 'CUG'],
  Ile: ['AUU', 'AUC', 'AUA'], Met: ['AUG'], Val: ['GUU', 'GUC', 'GUA', 'GUG'],
  Ser: ['UCU', 'UCC', 'UCA', 'UCG', 'AGU', 'AGC'], Pro: ['CCU', 'CCC', 'CCA', 'CCG'],
  Thr: ['ACU', 'ACC', 'ACA', 'ACG'], Ala: ['GCU', 'GCC', 'GCA', 'GCG'],
  Tyr: ['UAU', 'UAC'], STOP: ['UAA', 'UAG', 'UGA'], His: ['CAU', 'CAC'],
  Gln: ['CAA', 'CAG'], Asn: ['AAU', 'AAC'], Lys: ['AAA', 'AAG'],
  Asp: ['GAU', 'GAC'], Glu: ['GAA', 'GAG'], Cys: ['UGU', 'UGC'],
  Trp: ['UGG'], Arg: ['CGU', 'CGC', 'CGA', 'CGG', 'AGA', 'AGG'], Gly: ['GGU', 'GGC', 'GGA', 'GGG'],
};
export const CODE = Object.fromEntries(Object.entries(GROUPS).flatMap(([aa, list]) => list.map(c => [c, aa])));
export function translate(rna) {
  const list = codons(rna);
  const start = list.indexOf('AUG');
  if (start < 0) return { peptide: [], stopped: false, start: -1 };
  const peptide = [];
  for (let i = start; i < list.length; i++) {
    if (CODE[list[i]] === 'STOP') return { peptide, stopped: true, start, stop: i };
    peptide.push(CODE[list[i]]);
  }
  return { peptide, stopped: false, start };
}
export function mutationEffect(original, changed) {
  const a = translate(codingToRNA(original)), b = translate(codingToRNA(changed));
  if (original === changed) return 'same';
  if (a.peptide.join() === b.peptide.join() && a.stopped === b.stopped) return 'silent';
  if (b.stopped && b.peptide.length < a.peptide.length) return 'early';
  return 'changed';
}
export function expectedRows(goal) {
  if (goal.type === 'pair') return [complement(goal.template)];
  if (goal.type === 'replicate') return [complement(goal.template), goal.template];
  if (goal.type === 'transcribe') return [transcribe(goal.template)];
  return [];
}
export function createState(goal) {
  return {
    rows: expectedRows(goal).map((row, r) => [...row].map((_, i) => DNA.includes(goal.given?.[r]?.[i]) ? goal.given[r][i] : '')),
    parts: [], peptide: [], stopped: false, effect: null,
    opened: goal.type !== 'replicate', activeRow: 0, active: 0,
  };
}
export function placeBase(state, goal, row, index, base) {
  const expected = expectedRows(goal);
  if (!state.opened) return { ok: false, reason: 'closed' };
  if (!expected[row] || !Number.isInteger(index) || index < 0 || index >= expected[row].length) return { ok: false, reason: 'slot' };
  if (state.rows[row][index]) return { ok: false, reason: 'filled' };
  const alphabet = goal.type === 'transcribe' ? RNA : DNA;
  if (!alphabet.includes(base)) return { ok: false, reason: 'alphabet' };
  if (base !== expected[row][index]) return { ok: false, reason: 'pair', template: goal.type === 'replicate' && row === 1 ? complement(goal.template)[index] : goal.template[index] };
  state.rows[row][index] = base;
  return { ok: true };
}
export function translationSteps(goal) {
  const rna = goal.type === 'mutation' ? codingToRNA(goal.changed) : goal.rna;
  const list = codons(rna), start = list.indexOf('AUG');
  if (start < 0) return [];
  const end = list.findIndex((c, i) => i >= start && CODE[c] === 'STOP');
  return list.slice(start, end < 0 ? undefined : end + 1);
}
export function addAmino(state, goal, amino) {
  if (state.stopped) return { ok: false, reason: 'stopped' };
  const steps = translationSteps(goal), codon = steps[state.peptide.length];
  if (!codon || CODE[codon] !== amino) return { ok: false, reason: 'codon', codon };
  if (amino === 'STOP') state.stopped = true;
  else state.peptide.push(amino);
  return { ok: true, codon };
}
export function status(state, goal) {
  if (goal.type === 'parts') {
    const have = state.parts.filter(p => goal.parts.includes(p)).length;
    return { have, need: goal.parts.length, done: have === goal.parts.length && state.parts.length === have };
  }
  const rows = expectedRows(goal);
  if (rows.length) {
    const need = rows.reduce((n, row) => n + row.length, 0);
    const have = rows.reduce((n, row, r) => n + [...row].filter((b, i) => state.rows[r][i] === b).length, 0);
    return { have, need, done: state.opened && have === need };
  }
  const steps = translationSteps(goal), need = steps.length + (goal.type === 'mutation' ? 1 : 0);
  const have = state.peptide.length + Number(state.stopped) + Number(goal.type === 'mutation' && state.effect === mutationEffect(goal.original, goal.changed));
  return { have, need, done: need > 0 && have === need };
}
