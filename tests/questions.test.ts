import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { QuestionSchema, QuestionsFileSchema } from '../src/schema';

const root = join(__dirname, '..');
const raw = JSON.parse(readFileSync(join(root, 'data/questions.json'), 'utf8'));
const data = QuestionsFileSchema.parse(raw);
const qs = data.questions;

describe('questions.json', () => {
  it('validates against the zod schema', () => {
    expect(QuestionsFileSchema.safeParse(raw).success).toBe(true);
  });

  it('has 300 general + 10 Brandenburg questions with unique ids', () => {
    expect(qs.length).toBe(310);
    expect(qs.filter((q) => q.section === 'general').length).toBe(300);
    expect(qs.filter((q) => q.section === 'state' && q.state === 'Brandenburg').length).toBe(10);
    expect(new Set(qs.map((q) => q.id)).size).toBe(310);
    for (let n = 1; n <= 300; n++) expect(qs.find((q) => q.id === `G${n}`)?.officialNumber).toBe(n);
    for (let n = 1; n <= 10; n++) expect(qs.find((q) => q.id === `BB${n}`)?.officialNumber).toBe(n);
  });

  it('has exactly 4 non-empty, distinct options per question', () => {
    for (const q of qs) {
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
    }
  });

  it('has answerIndex in 0..3', () => {
    for (const q of qs) {
      expect(Number.isInteger(q.answerIndex)).toBe(true);
      expect(q.answerIndex).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex).toBeLessThanOrEqual(3);
    }
  });

  it('has an existing image file for every image question', () => {
    const withImg = qs.filter((q) => q.image);
    expect(withImg.length).toBeGreaterThan(0);
    for (const q of withImg) expect(existsSync(join(root, 'public', q.image!)), `${q.id} ${q.image}`).toBe(true);
  });

  it('only marks a question verified when 2 sources agree', () => {
    for (const q of qs.filter((x) => x.verified)) {
      expect(q.sources.filter((s) => s.answerIndex === q.answerIndex).length, q.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('explanation field', () => {
  const base = qs[0]!;
  it('is optional and accepts partial why/trap/trick', () => {
    expect(QuestionSchema.safeParse({ ...base, explanation: undefined }).success).toBe(true);
    expect(QuestionSchema.safeParse({ ...base, explanation: { why: 'Weil …' } }).success).toBe(true);
    expect(QuestionSchema.safeParse({ ...base, explanation: { why: 'a', trap: 'b', trick: 'c' } }).success).toBe(true);
    expect(QuestionSchema.safeParse({ ...base, explanation: { why: 3 } }).success).toBe(false);
  });
});

describe('explanations for all 310 questions (Batches 3-6)', () => {
  const target = [
    ...Array.from({ length: 300 }, (_, i) => `G${i + 1}`),
    ...Array.from({ length: 10 }, (_, i) => `BB${i + 1}`),
  ];
  it('covers every question in the catalogue', () => {
    expect(target).toHaveLength(310);
    expect(qs.every((q) => q.explanation?.why && q.explanation.trap && q.explanation.trick)).toBe(true);
  });
  const byId = new Map(qs.map((q) => [q.id, q]));
  it.each(target)('%s has why, trap and trick', (id) => {
    const e = byId.get(id)?.explanation;
    expect(e).toBeDefined();
    for (const k of ['why', 'trap', 'trick'] as const) {
      expect(typeof e?.[k]).toBe('string');
      expect(e?.[k]?.trim().length).toBeGreaterThan(10);
    }
  });
  // Questions whose answer depends on who is in office or current figures.
  const TIME_SENSITIVE = ['G72', 'G73', 'G75', 'G213', 'G236', 'G297', 'BB3', 'BB4', 'BB7', 'BB9'];
  it.each(TIME_SENSITIVE)('%s states the current fact without a "check before the test" note', (id) => {
    const why = byId.get(id)?.explanation?.why ?? '';
    expect(why).toMatch(/As of \w+ \d{4}/);
    if (id.startsWith('BB') || ['G213', 'G236', 'G297'].includes(id)) expect(why).toContain('As of October 2026');
    expect(why).not.toMatch(/check\b[^.]*before (the|your) (test|exam)/i);
    const q = byId.get(id)!;
    const answer = q.options[q.answerIndex]!.replace(/\.$/, '');
    for (const part of answer.split(/ und /)) expect(why).toContain(part.trim());
  });
  // Batch 5: picture questions must describe what the picture shows.
  const PICTURES: Record<string, RegExp> = {
    G176: /map/i,
    G181: /photo/i,
    G187: /hammer, compass/i,
    G209: /Bild 4.*hammer and compass/i,
    G216: /eagle/i,
    G226: /Bild 2.*12 gold stars/i,
    G235: /photo.*Verdun/i,
    BB1: /Bild 1.*red eagle/i,
    BB8: /number 4/i,
  };
  it.each(Object.keys(PICTURES))('%s describes its picture', (id) => {
    const q = byId.get(id)!;
    expect(q.image).toBeDefined();
    expect(q.explanation?.why).toMatch(PICTURES[id]!);
  });
  // Batch 5: history questions must give the key date in the why.
  const DATES: Record<string, string[]> = {
    G152: ['1933', '1945'], G153: ['8 May 1945'], G155: ['1933', '1945'], G156: ['1933'],
    G162: ['20 July 1944'], G163: ['1938'], G164: ['9 November 1938'], G169: ['1949'],
    G174: ['7 October 1949'], G186: ['17 June 1953'], G188: ['1961'], G189: ['1961'],
    G191: ['9 November 1989'], G194: ['3 October', '1990'], G204: ['3 October 1990'], G210: ['17 June 1953'],
    G217: ['1949', '1990'], G219: ['1990'], G220: ['27 January 1945'], G237: ['1957'], G240: ['2002'], G300: ['1955'],
  };
  it.each(Object.keys(DATES))('%s gives the key date', (id) => {
    const why = byId.get(id)?.explanation?.why ?? '';
    for (const d of DATES[id]!) expect(why).toContain(d);
  });
  it('no explanation contains a "check before the test" note', () => {
    for (const q of qs) for (const v of Object.values(q.explanation ?? {})) expect(v).not.toMatch(/check\b[^.]*before (the|your) (test|exam)/i);
  });
  it('explanations contain no em or en dashes', () => {
    for (const q of qs) for (const v of Object.values(q.explanation ?? {})) expect(v).not.toMatch(/[\u2013\u2014]/);
  });
});
