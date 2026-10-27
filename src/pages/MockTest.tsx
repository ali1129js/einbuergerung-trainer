import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { QuestionView } from "@/components/QuestionView";
import {
  composeMockTest,
  formatClock,
  MOCK_DURATION_MS,
  MOCK_TOTAL,
  PASS_MARK,
  remainingMs,
  scoreMockTest,
} from "@/lib/mockTest";
import { loadMock, saveMock, type MockState } from "@/lib/mockStore";
import { BY_ID, QUESTIONS } from "@/lib/questions";
import { browserKV } from "@/lib/storage";
import { useProgress } from "@/state/ProgressContext";

export function MockTest() {
  const kv = useMemo(() => browserKV(), []);
  const [state, setStateRaw] = useState<MockState | null>(() => loadMock(kv));
  const setState = (s: MockState | null) => {
    saveMock(kv, s);
    setStateRaw(s);
  };
  const { recordMany } = useProgress();
  const [now, setNow] = useState(() => Date.now());

  const running = !!state && state.finishedAt === undefined;
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  const finish = (s: MockState, at: number) => {
    const done = { ...s, finishedAt: at };
    setState(done);
    recordMany(
      s.ids
        .filter((id) => s.answers[id] !== undefined)
        .map((id) => ({ id, correct: s.answers[id] === BY_ID.get(id)?.answerIndex }))
    );
    window.scrollTo(0, 0);
  };

  const left = state ? remainingMs(state.startedAt, now) : MOCK_DURATION_MS;
  useEffect(() => {
    if (state && state.finishedAt === undefined && left === 0) finish(state, state.startedAt + MOCK_DURATION_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  if (!state)
    return (
      <>
        <section className="hero">
          <span className="eyebrow">Mock test</span>
          <h1>Like the real exam</h1>
          <p>
            {MOCK_TOTAL} questions: 30 random general questions + 3 Brandenburg questions. 60 minutes. You pass with{" "}
            {PASS_MARK} correct answers. You only see the results at the end.
          </p>
          <div className="row">
            <button
              className="btn btn--green"
              onClick={() => {
                const t = Date.now();
                setNow(t);
                setState({ ids: composeMockTest(QUESTIONS), answers: {}, startedAt: t, current: 0 });
              }}
            >
              Start mock test
            </button>
          </div>
        </section>
      </>
    );

  if (state.finishedAt !== undefined) return <MockResultView state={state} onRestart={() => setState(null)} />;

  const id = state.ids[state.current] as string;
  const q = BY_ID.get(id)!;
  const answeredCount = Object.keys(state.answers).length;
  const go = (i: number) => {
    setState({ ...state, current: Math.min(MOCK_TOTAL - 1, Math.max(0, i)) });
    window.scrollTo(0, 0);
  };
  return (
    <>
      <div className="card row" style={{ padding: "10px 14px" }}>
        <span className={`timer${left < 5 * 60_000 ? " timer--low" : ""}`} aria-label="Time left">
          ⏱ {formatClock(left)}
        </span>
        <span className="spacer" />
        <span className="small muted">
          {answeredCount}/{MOCK_TOTAL} answered
        </span>
      </div>
      <QuestionView
        key={q.id}
        q={q}
        label={`Question ${state.current + 1} of ${MOCK_TOTAL}`}
        selected={state.answers[q.id]}
        reveal={false}
        onSelect={(i) => setState({ ...state, answers: { ...state.answers, [q.id]: i } })}
      />
      <div className="sticky-actions">
        <button className="btn" disabled={state.current === 0} onClick={() => go(state.current - 1)}>
          ← Back
        </button>
        {state.current < MOCK_TOTAL - 1 ? (
          <button className="btn btn--primary" onClick={() => go(state.current + 1)}>
            Next →
          </button>
        ) : (
          <button className="btn btn--green" onClick={() => confirmFinish(state, answeredCount, finish)}>
            Finish test
          </button>
        )}
      </div>
      <details className="card">
        <summary>All questions · finish early</summary>
        <div className="stack" style={{ marginTop: 12 }}>
          <div className="qgrid">
            {state.ids.map((qid, i) => (
              <button
                key={qid}
                className={`${state.answers[qid] !== undefined ? "answered" : ""} ${i === state.current ? "current" : ""}`}
                onClick={() => go(i)}
                aria-label={`Question ${i + 1}${state.answers[qid] !== undefined ? ", answered" : ""}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button className="btn btn--danger" onClick={() => confirmFinish(state, answeredCount, finish)}>
            Finish test now
          </button>
        </div>
      </details>
    </>
  );
}

function confirmFinish(s: MockState, answered: number, finish: (s: MockState, at: number) => void) {
  const open = MOCK_TOTAL - answered;
  if (open > 0 && !window.confirm(`${open} question(s) not answered yet. Finish anyway?`)) return;
  finish(s, Date.now());
}

function MockResultView({ state, onRestart }: { state: MockState; onRestart: () => void }) {
  const r = scoreMockTest(state.ids, state.answers, BY_ID);
  const took = (state.finishedAt ?? state.startedAt) - state.startedAt;
  return (
    <>
      <section className="card stack" style={{ alignItems: "center", textAlign: "center" }}>
        <span className="eyebrow">Result</span>
        <div className={`result-score ${r.passed ? "pass" : "fail"}`}>
          {r.correct}/{r.total}
        </div>
        <h2 className={r.passed ? "pass" : "fail"}>{r.passed ? "Passed ✓" : "Not passed yet"}</h2>
        <p className="muted small">
          Pass mark {PASS_MARK} · time {formatClock(took)} · {r.answered} answered
        </p>
        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn btn--green" onClick={onRestart}>
            New mock test
          </button>
          <Link href="/weak" className="btn">
            Weak spots
          </Link>
        </div>
      </section>
      <h2>
        Review of mistakes{" "}
        <span className={`badge ${r.mistakes.length ? "badge--red" : "badge--green"}`}>{r.mistakes.length}</span>
      </h2>
      {r.mistakes.length === 0 && <p className="note">No mistakes. Excellent!</p>}
      {r.mistakes.map((id) => (
        <QuestionView
          key={id}
          q={BY_ID.get(id)!}
          label={`Question ${state.ids.indexOf(id) + 1}`}
          selected={state.answers[id]}
          reveal
        />
      ))}
    </>
  );
}
