import { describe, expect, it } from "vitest";
import { BY_ID, QUESTIONS } from "./questions";
import { mulberry32 } from "./random";
import {
  composeMockTest,
  formatClock,
  MOCK_DURATION_MS,
  MOCK_TOTAL,
  PASS_MARK,
  remainingMs,
  scoreMockTest,
  type Answers,
} from "./mockTest";

describe("composeMockTest", () => {
  it("has 33 questions: 30 general + 3 Brandenburg, no duplicates", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const ids = composeMockTest(QUESTIONS, mulberry32(seed));
      expect(ids).toHaveLength(MOCK_TOTAL);
      expect(new Set(ids).size).toBe(33);
      const qs = ids.map((id) => BY_ID.get(id)!);
      expect(qs.filter((q) => q.section === "general")).toHaveLength(30);
      expect(qs.filter((q) => q.section === "state" && q.state === "Brandenburg")).toHaveLength(3);
      // state questions come last
      expect(qs.slice(30).every((q) => q.section === "state")).toBe(true);
    }
  });

  it("is random but reproducible with the same seed", () => {
    expect(composeMockTest(QUESTIONS, mulberry32(7))).toEqual(composeMockTest(QUESTIONS, mulberry32(7)));
    expect(composeMockTest(QUESTIONS, mulberry32(7))).not.toEqual(composeMockTest(QUESTIONS, mulberry32(8)));
  });

  it("throws when there are not enough questions", () => {
    expect(() => composeMockTest(QUESTIONS.slice(0, 20))).toThrow();
  });
});

describe("scoreMockTest", () => {
  const ids = composeMockTest(QUESTIONS, mulberry32(42));
  const answerFirst = (n: number): Answers => {
    const a: Answers = {};
    ids.forEach((id, i) => {
      const q = BY_ID.get(id)!;
      a[id] = i < n ? q.answerIndex : (q.answerIndex + 1) % 4;
    });
    return a;
  };

  it("uses pass mark 17 and a 60-minute limit", () => {
    expect(PASS_MARK).toBe(17);
    expect(MOCK_DURATION_MS).toBe(3_600_000);
  });

  it("16 correct fails, 17 correct passes", () => {
    const r16 = scoreMockTest(ids, answerFirst(16), BY_ID);
    expect(r16).toMatchObject({ correct: 16, total: 33, passed: false, answered: 33 });
    expect(r16.mistakes).toHaveLength(17);
    const r17 = scoreMockTest(ids, answerFirst(17), BY_ID);
    expect(r17).toMatchObject({ correct: 17, passed: true });
    expect(r17.mistakes).toEqual(ids.slice(17));
  });

  it("all correct = 33, nothing answered = 0 with every question listed as a mistake", () => {
    expect(scoreMockTest(ids, answerFirst(33), BY_ID)).toMatchObject({ correct: 33, passed: true, mistakes: [] });
    const empty = scoreMockTest(ids, {}, BY_ID);
    expect(empty).toMatchObject({ correct: 0, answered: 0, passed: false });
    expect(empty.mistakes).toEqual(ids);
  });

  it("rejects unknown ids", () => {
    expect(() => scoreMockTest(["X1"], {}, BY_ID)).toThrow(/Unknown/);
  });
});

describe("timer", () => {
  it("counts down and never goes below zero", () => {
    expect(remainingMs(0, 0)).toBe(3_600_000);
    expect(remainingMs(0, 3_599_000)).toBe(1000);
    expect(remainingMs(0, 4_000_000)).toBe(0);
    expect(formatClock(3_600_000)).toBe("60:00");
    expect(formatClock(61_000)).toBe("01:01");
    expect(formatClock(0)).toBe("00:00");
  });
});
