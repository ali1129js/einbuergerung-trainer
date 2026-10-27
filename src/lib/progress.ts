import { z } from "zod";
import type { Question, Topic } from "@/schema";
import { TOPICS } from "@/schema";

/** A question counts as learned after this many correct answers in a row. */
export const MASTERED_STREAK = 2;

export const EntrySchema = z.object({
  attempts: z.number().int().nonnegative(),
  correct: z.number().int().nonnegative(),
  wrong: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  lastAnswered: z.number().int().nonnegative(),
  lastCorrect: z.boolean(),
});
export type Entry = z.infer<typeof EntrySchema>;

export const ProgressSchema = z.object({
  version: z.literal(1),
  entries: z.record(z.string(), EntrySchema),
});
export type Progress = z.infer<typeof ProgressSchema>;

export const emptyProgress = (): Progress => ({ version: 1, entries: {} });

/** Pure: returns a new Progress with the answer recorded. */
export function recordAnswer(p: Progress, id: string, correct: boolean, now: number): Progress {
  const prev = p.entries[id];
  const e: Entry = {
    attempts: (prev?.attempts ?? 0) + 1,
    correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
    wrong: (prev?.wrong ?? 0) + (correct ? 0 : 1),
    streak: correct ? (prev?.streak ?? 0) + 1 : 0,
    lastAnswered: now,
    lastCorrect: correct,
  };
  return { ...p, entries: { ...p.entries, [id]: e } };
}

/** Weak = answered wrong at least once and not yet right MASTERED_STREAK times in a row since. */
export function isWeak(e: Entry | undefined): boolean {
  return !!e && e.wrong > 0 && e.streak < MASTERED_STREAK;
}

export function isMastered(e: Entry | undefined): boolean {
  return !!e && e.streak >= MASTERED_STREAK;
}

/** Weak question ids, worst first (most recent fail / most wrong). */
export function weakIds(p: Progress): string[] {
  return Object.entries(p.entries)
    .filter(([, e]) => isWeak(e))
    .sort(([, a], [, b]) => b.wrong - b.correct - (a.wrong - a.correct) || b.lastAnswered - a.lastAnswered)
    .map(([id]) => id);
}

/* ---------- weak-spot practice session ---------- */

export interface WeakSession {
  queue: string[];
  /** Correct answers in a row within this session, per id. */
  runs: Record<string, number>;
  cleared: string[];
}

export function startWeakSession(ids: readonly string[]): WeakSession {
  return { queue: [...ids], runs: {}, cleared: [] };
}

/**
 * Answer the question at the front of the queue. It leaves the queue after
 * MASTERED_STREAK correct answers in a row (within the session); otherwise it goes
 * to the back. A wrong answer resets the run.
 */
export function answerWeak(s: WeakSession, correct: boolean): WeakSession {
  const [id, ...rest] = s.queue;
  if (id === undefined) return s;
  const run = correct ? (s.runs[id] ?? 0) + 1 : 0;
  const runs = { ...s.runs, [id]: run };
  if (run >= MASTERED_STREAK) return { queue: rest, runs, cleared: [...s.cleared, id] };
  // put it back; if other questions are waiting, the same question doesn't come straight back
  return { queue: [...rest, id], runs, cleared: s.cleared };
}

export const weakSessionDone = (s: WeakSession) => s.queue.length === 0;

/* ---------- per-topic overview ---------- */

export interface TopicStats {
  topic: Topic;
  total: number;
  seen: number;
  mastered: number;
  weak: number;
  /** Correct answers / attempts, 0..100, null if never answered. */
  accuracy: number | null;
}

export function topicStats(questions: readonly Question[], p: Progress): TopicStats[] {
  return TOPICS.map((topic) => {
    const qs = questions.filter((q) => q.topic === topic);
    let seen = 0, mastered = 0, weak = 0, attempts = 0, correct = 0;
    for (const q of qs) {
      const e = p.entries[q.id];
      if (!e) continue;
      seen++;
      if (isMastered(e)) mastered++;
      if (isWeak(e)) weak++;
      attempts += e.attempts;
      correct += e.correct;
    }
    return {
      topic,
      total: qs.length,
      seen,
      mastered,
      weak,
      accuracy: attempts ? Math.round((correct / attempts) * 100) : null,
    };
  });
}
