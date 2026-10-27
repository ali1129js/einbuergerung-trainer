import type { Question } from "@/schema";
import { sample, shuffle, type Rng } from "./random";

/** Official format of the Einbürgerungstest. */
export const MOCK_GENERAL = 30;
export const MOCK_STATE = 3;
export const MOCK_TOTAL = MOCK_GENERAL + MOCK_STATE; // 33
export const MOCK_DURATION_MS = 60 * 60 * 1000; // 60 minutes
export const PASS_MARK = 17;

/** 30 random general + 3 random state questions (state questions at the end, like the real test). */
export function composeMockTest(questions: readonly Question[], rng: Rng = Math.random): string[] {
  const general = questions.filter((q) => q.section === "general");
  const state = questions.filter((q) => q.section === "state");
  return [
    ...sample(general, MOCK_GENERAL, rng).map((q) => q.id),
    ...shuffle(sample(state, MOCK_STATE, rng), rng).map((q) => q.id),
  ];
}

export type Answers = Record<string, number | undefined>;

export interface MockResult {
  total: number;
  correct: number;
  answered: number;
  passed: boolean;
  /** Ids answered wrongly or left blank, in test order. */
  mistakes: string[];
}

export function scoreMockTest(
  ids: readonly string[],
  answers: Answers,
  byId: ReadonlyMap<string, Question>
): MockResult {
  let correct = 0;
  let answered = 0;
  const mistakes: string[] = [];
  for (const id of ids) {
    const q = byId.get(id);
    if (!q) throw new Error(`Unknown question ${id}`);
    const a = answers[id];
    if (a !== undefined) answered++;
    if (a === q.answerIndex) correct++;
    else mistakes.push(id);
  }
  return { total: ids.length, correct, answered, passed: correct >= PASS_MARK, mistakes };
}

export function remainingMs(startedAt: number, now: number, durationMs = MOCK_DURATION_MS): number {
  return Math.max(0, startedAt + durationMs - now);
}

export function formatClock(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
