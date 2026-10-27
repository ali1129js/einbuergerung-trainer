import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { emptyProgress, recordAnswer, type Progress } from "@/lib/progress";
import { browserKV, loadProgress, saveProgress, type LoadResult } from "@/lib/storage";

interface Ctx {
  progress: Progress;
  loadError: Extract<LoadResult, { ok: false }> | null;
  record: (id: string, correct: boolean) => void;
  recordMany: (items: { id: string; correct: boolean }[]) => void;
  reset: () => void;
}

const ProgressCtx = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const kv = useMemo(() => browserKV(), []);
  const [initial] = useState(() => loadProgress(kv));
  const [progress, setProgress] = useState<Progress>(initial.progress);

  const update = useCallback(
    (fn: (p: Progress) => Progress) =>
      setProgress((p) => {
        const next = fn(p);
        saveProgress(kv, next);
        return next;
      }),
    [kv]
  );

  const value = useMemo<Ctx>(
    () => ({
      progress,
      loadError: initial.ok ? null : initial,
      record: (id, correct) => update((p) => recordAnswer(p, id, correct, Date.now())),
      recordMany: (items) =>
        update((p) => items.reduce((acc, it) => recordAnswer(acc, it.id, it.correct, Date.now()), p)),
      reset: () => update(() => emptyProgress()),
    }),
    [progress, initial, update]
  );
  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>;
}

export function useProgress(): Ctx {
  const c = useContext(ProgressCtx);
  if (!c) throw new Error("useProgress outside ProgressProvider");
  return c;
}
