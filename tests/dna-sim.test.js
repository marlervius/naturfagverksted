import { describe, it, expect } from 'vitest';
import {
  complement, reverseComplement, transcribe, codingToRNA, codons, CODE, translate,
  mutationEffect, createState, placeBase, addAmino, status, expectedRows,
} from '../dna/js/sim.js';

describe('DNA og RNA med eksplisitt retning', () => {
  it('komplementet står antiparallelt, i samme kolonnerekkefølge', () => {
    expect(complement('ATGC')).toBe('TACG'); // 5′ ATGC 3′ over 3′ TACG 5′
    expect(reverseComplement('ATGC')).toBe('GCAT'); // komplementet skrevet 5′ → 3′
    expect(complement(complement('ATGC'))).toBe('ATGC');
  });
  it('skriver RNA 5′ → 3′ fra DNA-mal 3′ → 5′', () => {
    expect(transcribe('TACCGAAAATTCATT')).toBe('AUGGCUUUUAAGUAA');
  });
  it('skiller kodende tråd fra maltråd', () => {
    expect(codingToRNA('ATGGCTTTTTAA')).toBe('AUGGCUUUUUAA');
    expect(transcribe('ATGGCTTTTTAA')).not.toBe('AUGGCUUUUUAA');
  });
  it.each(['', 'AXTG', 'atgc', 'AUGC', null])('avviser ugyldig DNA: %s', sequence => {
    expect(() => complement(sequence)).toThrow();
  });
  it.each(['AUGG', 'ATG', '', 'AUGXAA'])('avviser ufullstendige eller ugyldige RNA-kodoner: %s', sequence => {
    expect(() => codons(sequence)).toThrow();
  });
});

describe('standard genetisk kode', () => {
  it('dekker alle 64 kodonene med 20 aminosyrer og ett stoppsignal', () => {
    expect(Object.keys(CODE)).toHaveLength(64);
    expect(new Set(Object.values(CODE)).size).toBe(21);
    for (const a of 'UCAG') for (const b of 'UCAG') for (const c of 'UCAG') expect(CODE[a + b + c]).toBeTruthy();
  });
  it('kjenner alle tre stoppkodoner og AUG', () => {
    expect(CODE.AUG).toBe('Met');
    expect(Object.keys(CODE).filter(c => CODE[c] === 'STOP').sort()).toEqual(['UAA', 'UAG', 'UGA']);
  });
  it('gir riktig peptid og inkluderer ikke stopp som aminosyre', () => {
    expect(translate('AUGGCUUUUUAA')).toMatchObject({ peptide: ['Met', 'Ala', 'Phe'], stopped: true, stop: 3 });
  });
  it.each(['UAA', 'UAG', 'UGA'])('stopper ved %s og ignorerer senere kodoner', stop => {
    expect(translate('AUGGGU' + stop + 'UUU').peptide).toEqual(['Met', 'Gly']);
  });
  it('søker etter AUG i den viste leserammen', () => {
    expect(translate('CCCAUGGCUUAA')).toMatchObject({ peptide: ['Met', 'Ala'], start: 1 });
    expect(translate('CCCGGUUAA')).toEqual({ peptide: [], start: -1, stopped: false });
  });
  it('skiller manglende stopp fra en avsluttet kjede', () => {
    expect(translate('AUGGCU')).toMatchObject({ peptide: ['Met', 'Ala'], stopped: false });
  });
  it('kan gi samme aminosyre fra ulike kodoner', () => {
    expect(CODE.GCU).toBe('Ala'); expect(CODE.GCC).toBe('Ala');
    expect(CODE.GAU).toBe('Asp'); expect(CODE.GGU).toBe('Gly');
  });
});

describe('mutasjonskonsekvenser i modellens korte kodende sekvenser', () => {
  const before = 'ATGGCTTTTTAA';
  it.each([
    [before, 'same'], ['ATGGCCTTTTAA', 'silent'], ['ATGGATTTTTAA', 'changed'], ['ATGTAATTTTAA', 'early'],
  ])('%s gir %s', (after, result) => expect(mutationEffect(before, after)).toBe(result));
});

describe('bygging av DNA og RNA', () => {
  it('feil base endrer ikke oppdraget', () => {
    const goal = { type: 'pair', template: 'ATGC' }, state = createState(goal);
    expect(placeBase(state, goal, 0, 0, 'C')).toMatchObject({ ok: false, reason: 'pair', template: 'A' });
    expect(state.rows[0]).toEqual(['', '', '', '']);
    expect(status(state, goal)).toEqual({ have: 0, need: 4, done: false });
  });
  it('tar ikke imot ulovlige posisjoner eller overskriving', () => {
    const goal = { type: 'pair', template: 'AT' }, state = createState(goal);
    expect(placeBase(state, goal, 0, -1, 'T').ok).toBe(false);
    expect(placeBase(state, goal, 0, 0.5, 'T').ok).toBe(false);
    expect(placeBase(state, goal, 7, 0, 'T').ok).toBe(false);
    expect(placeBase(state, goal, 0, 0, 'T').ok).toBe(true);
    expect(placeBase(state, goal, 0, 0, 'A')).toMatchObject({ ok: false, reason: 'filled' });
    expect(state.rows[0][0]).toBe('T');
  });
  it('viser spesifikk alfabetfeil for T i RNA', () => {
    const goal = { type: 'transcribe', template: 'TAC' }, state = createState(goal);
    expect(placeBase(state, goal, 0, 1, 'T')).toMatchObject({ ok: false, reason: 'alphabet' });
    expect(placeBase(state, goal, 0, 1, 'U').ok).toBe(true);
  });
  it('krever åpning og begge dattermolekyler ved replikasjon', () => {
    const goal = { type: 'replicate', template: 'ATGC' }, state = createState(goal);
    expect(placeBase(state, goal, 0, 0, 'T')).toMatchObject({ ok: false, reason: 'closed' });
    state.opened = true;
    const expected = expectedRows(goal);
    expect(expected).toEqual(['TACG', 'ATGC']);
    [...expected[0]].forEach((b, i) => expect(placeBase(state, goal, 0, i, b).ok).toBe(true));
    expect(status(state, goal)).toEqual({ have: 4, need: 8, done: false });
    [...expected[1]].forEach((b, i) => expect(placeBase(state, goal, 1, i, b).ok).toBe(true));
    expect(status(state, goal).done).toBe(true);
  });
  it('lar ledige plasser velges fritt i skolemodellen', () => {
    const goal = { type: 'pair', template: 'AT' }, state = createState(goal);
    expect(placeBase(state, goal, 0, 1, 'A').ok).toBe(true);
    expect(status(state, goal).done).toBe(false);
    expect(placeBase(state, goal, 0, 0, 'T').ok).toBe(true);
    expect(status(state, goal).done).toBe(true);
  });
  it('tomrom i forhåndsutfylte rader blir ledige plasser', () => {
    const goal = { type: 'pair', template: 'ATGC', given: ['T C '] }, state = createState(goal);
    expect(state.rows[0]).toEqual(['T', '', 'C', '']);
    expect(status(state, goal)).toEqual({ have: 2, need: 4, done: false });
  });
  it('reset oppretter uavhengige tilstander', () => {
    const goal = { type: 'pair', template: 'AT' }, a = createState(goal), b = createState(goal);
    placeBase(a, goal, 0, 0, 'T'); expect(b.rows[0][0]).toBe('');
  });
});

describe('proteinsyntese som elevhandlinger', () => {
  const goal = { type: 'translate', rna: 'AUGGCUUAAUUU' };
  it('avviser feil aminosyre uten å flytte ribosomet', () => {
    const state = createState(goal);
    expect(addAmino(state, goal, 'Ala')).toMatchObject({ ok: false, codon: 'AUG' });
    expect(state.peptide).toEqual([]);
  });
  it('krever eksplisitt stopp, og tar ikke imot flere aminosyrer etterpå', () => {
    const state = createState(goal);
    addAmino(state, goal, 'Met'); addAmino(state, goal, 'Ala');
    expect(status(state, goal).done).toBe(false);
    expect(addAmino(state, goal, 'Phe').ok).toBe(false);
    expect(addAmino(state, goal, 'STOP').ok).toBe(true);
    expect(state.peptide).toEqual(['Met', 'Ala']);
    expect(status(state, goal).done).toBe(true);
    expect(addAmino(state, goal, 'Phe')).toMatchObject({ ok: false, reason: 'stopped' });
  });
  it('mutasjonsoppdrag krever både kjede og riktig sammenligning', () => {
    const g = { type: 'mutation', original: 'ATGGCTTTTTAA', changed: 'ATGTAATTTTAA' }, s = createState(g);
    addAmino(s, g, 'Met'); addAmino(s, g, 'STOP');
    expect(status(s, g).done).toBe(false);
    s.effect = 'silent'; expect(status(s, g).done).toBe(false);
    s.effect = 'early'; expect(status(s, g).done).toBe(true);
  });
  it('et nukleotid krever nøyaktig de tre riktige delene', () => {
    const g = { type: 'parts', parts: ['sukker', 'fosfat', 'base'] }, s = createState(g);
    s.parts = ['sukker', 'base']; expect(status(s, g).done).toBe(false);
    s.parts.push('fosfat'); expect(status(s, g).done).toBe(true);
    s.parts.push('fett'); expect(status(s, g).done).toBe(false);
  });
});
