import { z } from "zod";
import type { KV } from "./storage";
import { MOCK_TOTAL } from "./mockTest";

export const MOCK_KEY = "einb-trainer.mock.v1";

export const MockStateSchema = z.object({
  ids: z.array(z.string()).length(MOCK_TOTAL),
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
  startedAt: z.number().int().nonnegative(),
  finishedAt: z.number().int().nonnegative().optional(),
  current: z.number().int().min(0).max(MOCK_TOTAL - 1),
});
export type MockState = z.infer<typeof MockStateSchema>;

/** Invalid or missing data -> null (a mock test is disposable; nothing to back up). */
export function loadMock(kv: KV): MockState | null {
  const raw = kv.getItem(MOCK_KEY);
  if (!raw) return null;
  try {
    const r = MockStateSchema.safeParse(JSON.parse(raw));
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}

export function saveMock(kv: KV, s: MockState | null): void {
  kv.setItem(MOCK_KEY, s ? JSON.stringify(MockStateSchema.parse(s)) : "");
}
