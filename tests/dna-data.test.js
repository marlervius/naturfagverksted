import { describe, it, expect } from 'vitest';
import { LEVELS, TESTS, TEST_DRAW, TEST_PASS, AMINO, PARTS, BASES, SOURCES } from '../dna/js/data.js';
import { STRINGS } from '../dna/js/strings.js';
import { CODE, codons, createState, expectedRows, placeBase, addAmino, codingToRNA, mutationEffect, translationSteps, status } from '../dna/js/sim.js';
import { VERKSTEDER } from '../verksteder.js';

describe('DNA-verkstedets oppdrag', () => {
  it('har 18 unike oppdrag og tre kapitler', () => {
    expect(LEVELS).toHaveLength(18); expect(new Set(LEVELS.map(l => l.id)).size).toBe(18);
    expect(new Set(LEVELS.map(l => l.chapter.fag)).size).toBe(3);
    expect(new Set(LEVELS.map(l => l.goal.type))).toEqual(new Set(['parts', 'pair', 'replicate', 'transcribe', 'translate', 'mutation']));
  });
  for (const level of LEVELS) {
    it(`${level.id}: kan løses med tilgjengelige handlinger og har ingen feil forhåndsutfylte baser`, () => {
      const g = level.goal, s = createState(g);
      expect(status(s, g).done).toBe(false);
      s.opened = true;
      if (g.type === 'parts') {
        g.parts.forEach(p => { expect(PARTS[p]).toBeTruthy(); expect(g.tray).toContain(p); }); s.parts.push(...g.parts);
      }
      expectedRows(g).forEach((row, r) => [...row].forEach((b, i) => {
        if (s.rows[r][i]) expect(s.rows[r][i]).toBe(b);
        else expect(placeBase(s, g, r, i, b).ok).toBe(true);
      }));
      if (g.type === 'translate' || g.type === 'mutation') {
        const steps = translationSteps(g);
        expect(steps[0]).toBe('AUG'); expect(CODE[steps.at(-1)]).toBe('STOP');
        for (const c of steps) { expect(g.tray).toContain(CODE[c]); expect(addAmino(s, g, CODE[c]).ok).toBe(true); }
        const seq = g.type === 'mutation' ? codingToRNA(g.changed) : g.rna;
        for (const c of codons(seq)) expect(AMINO[CODE[c]]).toBeTruthy();
        if (g.type === 'mutation') {
          expect(g.original.length).toBe(g.changed.length);
          s.effect = mutationEffect(g.original, g.changed);
          expect(['silent', 'changed', 'early']).toContain(s.effect);
          for (const c of codons(codingToRNA(g.original))) expect(AMINO[CODE[c]]).toBeTruthy();
        }
      }
      expect(status(s, g).done).toBe(true);
      expect(status(s, g).have).toBe(status(s, g).need);
    });
  }
  it('mutasjonsoppdragene viser tre forskjellige virkninger', () => {
    expect(LEVELS.filter(l => l.goal.type === 'mutation').map(l => mutationEffect(l.goal.original, l.goal.changed))).toEqual(['changed', 'silent', 'early']);
  });
  it('er koblet til portalen med separat lagringsnøkkel', () => {
    const entry = VERKSTEDER.find(v => v.id === 'dna');
    expect(entry).toMatchObject({ status: 'klar', href: 'dna/', data: './dna/js/data.js', storageKey: 'dnaverkstedet.v1' });
    expect(VERKSTEDER.filter(v => v.storageKey === entry.storageKey)).toHaveLength(1);
  });
});

describe('tester og faglig innhold', () => {
  it('har tre sammenhengende testsperrer, med 12 spørsmål hver', () => {
    expect(TESTS).toHaveLength(3); expect(TEST_DRAW).toBe(6); expect(TEST_PASS).toBe(5);
    TESTS.forEach((test, i) => {
      expect(test.from).toBe(LEVELS[i * 6].id); expect(test.after).toBe(LEVELS[i * 6 + 5].id);
      expect(test.questions).toHaveLength(12);
    });
  });
  const qs = [...LEVELS.map(l => l.predict), ...TESTS.flatMap(t => t.questions)];
  it('alle spørsmål har fire unike alternativer, gyldig fasit og forklaring', () => {
    qs.forEach(q => {
      expect(q.options).toHaveLength(4); expect(Number.isInteger(q.correct)).toBe(true);
      expect(q.correct).toBeGreaterThanOrEqual(0); expect(q.correct).toBeLessThan(4);
      for (const lang of ['enkel', 'fag']) {
        expect(new Set(q.options.map(o => o[lang])).size).toBe(4);
        expect(q.q[lang].length).toBeGreaterThan(8); expect(q.why[lang].length).toBeGreaterThan(15);
      }
    });
  });
  it('testspørsmål er unike og fasitposisjonene fordeles jevnt', () => {
    const all = TESTS.flatMap(t => t.questions);
    expect(new Set(all.map(q => q.q.fag)).size).toBe(all.length);
    for (const i of [0, 1, 2, 3]) expect(all.filter(q => q.correct === i)).toHaveLength(9);
  });
  it('har begge språkregistre i alle tekstobjekter', () => {
    let count = 0;
    function walk(o) {
      if (!o || typeof o !== 'object') return;
      if ('enkel' in o || 'fag' in o) {
        for (const lang of ['enkel', 'fag']) { expect(typeof o[lang]).toBe('string'); expect(o[lang].trim().length).toBeGreaterThan(0); }
        count++; return;
      }
      Object.values(o).forEach(walk);
    }
    [LEVELS, TESTS, STRINGS, AMINO, PARTS, BASES].forEach(walk); expect(count).toBeGreaterThan(300);
  });
  it('enkel-registeret har korte setninger', () => {
    const sentences = [];
    function walk(o) {
      if (!o || typeof o !== 'object') return;
      if ('enkel' in o) { sentences.push(...o.enkel.split(/[.!?]+/).map(s => s.trim()).filter(Boolean)); return; }
      Object.values(o).forEach(walk);
    }
    [LEVELS, TESTS, STRINGS].forEach(walk);
    for (const sentence of sentences) expect(sentence.split(/\s+/).length, sentence).toBeLessThanOrEqual(28);
    expect(sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length).toBeLessThan(14);
  });
  it('forklarer modellforenklinger og viser primærkilder', () => {
    expect(STRINGS['dn.modelNote'].fag).toContain('ikke i målestokk');
    expect(STRINGS['dn.replicationNote'].fag).toContain('5′–3′');
    expect(SOURCES).toHaveLength(5);
    SOURCES.forEach(s => expect(new URL(s.href).hostname).toMatch(/genome\.gov|ncbi\.nlm\.nih\.gov/));
  });
});
