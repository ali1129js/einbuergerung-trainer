import { describe, expect, it } from "vitest";
import {
  answerWeak,
  emptyProgress,
  isMastered,
  isWeak,
  recordAnswer,
  startWeakSession,
  topicStats,
  weakIds,
  weakSessionDone,
} from "./progress";
import { QUESTIONS } from "./questions";

describe("recordAnswer / weak spots", () => {
  it("counts attempts and streaks, and does not mutate the input", () => {
    const p0 = emptyProgress();
    const p1 = recordAnswer(p0, "G1", true, 1);
    expect(p0.entries).toEqual({});
    expect(p1.entries.G1).toEqual({ attempts: 1, correct: 1, wrong: 0, streak: 1, lastAnswered: 1, lastCorrect: true });
    const p2 = recordAnswer(p1, "G1", false, 2);
    expect(p2.entries.G1).toMatchObject({ attempts: 2, correct: 1, wrong: 1, streak: 0, lastCorrect: false });
  });

  it("a wrong question stays weak until answered right twice in a row", () => {
    let p = recordAnswer(emptyProgress(), "G5", false, 1);
    expect(isWeak(p.entries.G5)).toBe(true);
    p = recordAnswer(p, "G5", true, 2);
    expect(isWeak(p.entries.G5)).toBe(true);
    p = recordAnswer(p, "G5", false, 3); // reset
    p = recordAnswer(p, "G5", true, 4);
    expect(isWeak(p.entries.G5)).toBe(true);
    p = recordAnswer(p, "G5", true, 5);
    expect(isWeak(p.entries.G5)).toBe(false);
    expect(isMastered(p.entries.G5)).toBe(true);
  });

  it("never-wrong questions are not weak; weakIds lists only weak ones, worst first", () => {
    let p = recordAnswer(emptyProgress(), "G1", true, 1);
    p = recordAnswer(p, "G2", false, 2);
    p = recordAnswer(p, "G3", false, 3);
    p = recordAnswer(p, "G3", false, 4);
    expect(weakIds(p)).toEqual(["G3", "G2"]);
    expect(isWeak(undefined)).toBe(false);
  });
});

describe("weak-spot practice session", () => {
  it("repeats each question until it is answered right twice in a row", () => {
    let s = startWeakSession(["A", "B"]);
    s = answerWeak(s, true); // A run 1 -> back
    expect(s.queue).toEqual(["B", "A"]);
    s = answerWeak(s, false); // B wrong -> back
    expect(s.queue).toEqual(["A", "B"]);
    s = answerWeak(s, true); // A run 2 -> cleared
    expect(s.queue).toEqual(["B"]);
    expect(s.cleared).toEqual(["A"]);
    s = answerWeak(s, true); // B run 1
    s = answerWeak(s, false); // B wrong again -> run reset
    expect(s.runs.B).toBe(0);
    s = answerWeak(s, true);
    expect(weakSessionDone(s)).toBe(false);
    s = answerWeak(s, true);
    expect(weakSessionDone(s)).toBe(true);
    expect(s.cleared).toEqual(["A", "B"]);
  });

  it("answering on an empty queue is a no-op", () => {
    const s = startWeakSession([]);
    expect(answerWeak(s, true)).toBe(s);
    expect(weakSessionDone(s)).toBe(true);
  });
});

describe("topicStats", () => {
  it("covers all 310 questions across the 8 topics", () => {
    const stats = topicStats(QUESTIONS, emptyProgress());
    expect(stats).toHaveLength(8);
    expect(stats.reduce((n, s) => n + s.total, 0)).toBe(310);
    expect(stats.every((s) => s.seen === 0 && s.accuracy === null)).toBe(true);
  });

  it("counts seen, mastered, weak and accuracy", () => {
    const [a, b] = QUESTIONS.filter((q) => q.topic === "Wahlen");
    let p = recordAnswer(emptyProgress(), a!.id, true, 1);
    p = recordAnswer(p, a!.id, true, 2);
    p = recordAnswer(p, b!.id, false, 3);
    const w = topicStats(QUESTIONS, p).find((s) => s.topic === "Wahlen")!;
    expect(w).toMatchObject({ seen: 2, mastered: 1, weak: 1, accuracy: 67 });
  });
});
