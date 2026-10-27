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

describe('explanations G1-G130 (Batches 3-4)', () => {
  const target = Array.from({ length: 130 }, (_, i) => `G${i + 1}`);
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
  const TIME_SENSITIVE = ['G72', 'G73', 'G75'];
  it.each(TIME_SENSITIVE)('%s states the current fact and says "check before the test"', (id) => {
    const why = byId.get(id)?.explanation?.why ?? '';
    expect(why).toMatch(/As of \w+ \d{4}/);
    expect(why.toLowerCase()).toContain('check before the test');
    const q = byId.get(id)!;
    const answer = q.options[q.answerIndex]!.replace(/\.$/, '');
    for (const part of answer.split(/ und /)) expect(why).toContain(part.trim());
  });
  it('explanations contain no em or en dashes', () => {
    for (const q of qs) for (const v of Object.values(q.explanation ?? {})) expect(v).not.toMatch(/[\u2013\u2014]/);
  });
});
