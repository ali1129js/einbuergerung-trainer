import { emptyProgress, ProgressSchema, type Progress } from "./progress";

export const PROGRESS_KEY = "einb-trainer.progress.v1";

export type KV = Pick<Storage, "getItem" | "setItem">;

export type LoadResult =
  | { ok: true; progress: Progress }
  | { ok: false; progress: Progress; backupKey: string; reason: string };

/** Load and validate progress. Corrupt data is kept under a backup key, never silently overwritten. */
export function loadProgress(kv: KV, now = Date.now()): LoadResult {
  const raw = kv.getItem(PROGRESS_KEY);
  if (raw === null) return { ok: true, progress: emptyProgress() };
  let reason: string;
  try {
    const parsed = ProgressSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return { ok: true, progress: parsed.data };
    reason = parsed.error.issues[0]?.message ?? "invalid";
  } catch (e) {
    reason = e instanceof Error ? e.message : "unreadable JSON";
  }
  const backupKey = `${PROGRESS_KEY}.backup-${now}`;
  kv.setItem(backupKey, raw);
  return { ok: false, progress: emptyProgress(), backupKey, reason };
}

export function saveProgress(kv: KV, p: Progress): void {
  kv.setItem(PROGRESS_KEY, JSON.stringify(ProgressSchema.parse(p)));
}

/** In-memory KV for tests / when localStorage is unavailable. */
export function memoryKV(init: Record<string, string> = {}): KV & { data: Record<string, string> } {
  const data = { ...init };
  return {
    data,
    getItem: (k) => (k in data ? (data[k] as string) : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
  };
}

export function browserKV(): KV {
  try {
    const t = "__einb_probe__";
    window.localStorage.setItem(t, t);
    window.localStorage.removeItem(t);
    return window.localStorage;
  } catch {
    return memoryKV();
  }
}
