import { describe, expect, it } from "vitest";
import { emptyProgress, recordAnswer } from "./progress";
import { loadProgress, memoryKV, PROGRESS_KEY, saveProgress } from "./storage";

describe("progress storage", () => {
  it("returns empty progress when nothing is stored", () => {
    expect(loadProgress(memoryKV())).toEqual({ ok: true, progress: emptyProgress() });
  });

  it("round-trips through save/load", () => {
    const kv = memoryKV();
    const p = recordAnswer(recordAnswer(emptyProgress(), "G1", false, 10), "BB3", true, 11);
    saveProgress(kv, p);
    expect(loadProgress(kv)).toEqual({ ok: true, progress: p });
  });

  it.each([
    ["broken JSON", "{not json"],
    ["wrong version", JSON.stringify({ version: 2, entries: {} })],
    ["negative counter", JSON.stringify({ version: 1, entries: { G1: { attempts: -1, correct: 0, wrong: 0, streak: 0, lastAnswered: 0, lastCorrect: true } } })],
    ["missing field", JSON.stringify({ version: 1, entries: { G1: { attempts: 1 } } })],
  ])("rejects %s and keeps a backup instead of overwriting", (_name, raw) => {
    const kv = memoryKV({ [PROGRESS_KEY]: raw });
    const r = loadProgress(kv, 123);
    expect(r.ok).toBe(false);
    expect(r.progress).toEqual(emptyProgress());
    if (!r.ok) {
      expect(r.backupKey).toBe(`${PROGRESS_KEY}.backup-123`);
      expect(kv.data[r.backupKey]).toBe(raw);
    }
    expect(kv.data[PROGRESS_KEY]).toBe(raw); // original untouched
  });

  it("refuses to save invalid progress", () => {
    const kv = memoryKV();
    // @ts-expect-error deliberately invalid
    expect(() => saveProgress(kv, { version: 1, entries: { G1: { attempts: "x" } } })).toThrow();
    expect(kv.data[PROGRESS_KEY]).toBeUndefined();
  });
});

import { loadMock, MOCK_KEY, saveMock } from "./mockStore";

describe("mock test storage", () => {
  const ids = Array.from({ length: 33 }, (_, i) => `G${i + 1}`);
  it("round-trips an active mock test", () => {
    const kv = memoryKV();
    const s = { ids, answers: { G1: 2 }, startedAt: 5, current: 3 };
    saveMock(kv, s);
    expect(loadMock(kv)).toEqual(s);
    saveMock(kv, null);
    expect(loadMock(kv)).toBeNull();
  });
  it("ignores invalid stored tests", () => {
    expect(loadMock(memoryKV({ [MOCK_KEY]: "{" }))).toBeNull();
    expect(loadMock(memoryKV({ [MOCK_KEY]: JSON.stringify({ ids: ["G1"], answers: {}, startedAt: 1, current: 0 }) }))).toBeNull();
    expect(loadMock(memoryKV({ [MOCK_KEY]: JSON.stringify({ ids, answers: { G1: 7 }, startedAt: 1, current: 0 }) }))).toBeNull();
  });
});
