import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { QuestionView } from "@/components/QuestionView";
import { fill, type UIStrings } from "@/lib/i18n";
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
import { useLocale } from "@/state/LocaleContext";
import { useProgress } from "@/state/ProgressContext";

export function MockTest() {
  const kv = useMemo(() => browserKV(), []);
  const [state, setStateRaw] = useState<MockState | null>(() => loadMock(kv));
  const setState = (s: MockState | null) => {
    saveMock(kv, s);
    setStateRaw(s);
  };
  const { recordMany } = useProgress();
  const { t } = useLocale();
  const [now, setNow] = useState(() => Date.now());

  const running = !!state && state.finishedAt === undefined;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const finish = (s: MockState, at: number) => {
    const done = { ...s, finishedAt: at };
    setState(done);
    recordMany(
      s.ids
        .filter((qid) => s.answers[qid] !== undefined)
        .map((qid) => ({ id: qid, correct: s.answers[qid] === BY_ID.get(qid)?.answerIndex }))
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
          <span className="eyebrow">{t.mockEyebrow}</span>
          <h1>{t.mockTitle}</h1>
          <p>{fill(t.mockIntro, { total: MOCK_TOTAL, pass: PASS_MARK })}</p>
          <div className="row">
            <button
              className="btn btn--green"
              onClick={() => {
                const started = Date.now();
                setNow(started);
                setState({ ids: composeMockTest(QUESTIONS), answers: {}, startedAt: started, current: 0 });
              }}
            >
              {t.startMock}
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
        <span className={`timer${left < 5 * 60_000 ? " timer--low" : ""}`} aria-label={t.timeLeft}>
          ⏱ {formatClock(left)}
        </span>
        <span className="spacer" />
        <span className="small muted">{fill(t.mockAnswered, { answered: answeredCount, total: MOCK_TOTAL })}</span>
      </div>
      <QuestionView
        key={q.id}
        q={q}
        label={fill(t.questionOf, { n: state.current + 1, total: MOCK_TOTAL })}
        selected={state.answers[q.id]}
        reveal={false}
        onSelect={(i) => setState({ ...state, answers: { ...state.answers, [q.id]: i } })}
      />
      <div className="sticky-actions">
        <button className="btn" disabled={state.current === 0} onClick={() => go(state.current - 1)}>
          {t.back}
        </button>
        {state.current < MOCK_TOTAL - 1 ? (
          <button className="btn btn--primary" onClick={() => go(state.current + 1)}>
            {t.next}
          </button>
        ) : (
          <button className="btn btn--green" onClick={() => confirmFinish(state, answeredCount, finish, t)}>
            {t.finishTest}
          </button>
        )}
      </div>
      <details className="card">
        <summary>{t.allQuestionsFinishEarly}</summary>
        <div className="stack" style={{ marginTop: 12 }}>
          <div className="qgrid">
            {state.ids.map((qid, i) => (
              <button
                key={qid}
                className={`${state.answers[qid] !== undefined ? "answered" : ""} ${i === state.current ? "current" : ""}`}
                onClick={() => go(i)}
                aria-label={fill(state.answers[qid] !== undefined ? t.questionNAnswered : t.questionN, { n: i + 1 })}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button className="btn btn--danger" onClick={() => confirmFinish(state, answeredCount, finish, t)}>
            {t.finishTestNow}
          </button>
        </div>
      </details>
    </>
  );
}

function confirmFinish(s: MockState, answered: number, finish: (s: MockState, at: number) => void, t: UIStrings) {
  const open = MOCK_TOTAL - answered;
  if (open > 0 && !window.confirm(fill(t.finishConfirm, { open }))) return;
  finish(s, Date.now());
}

function MockResultView({ state, onRestart }: { state: MockState; onRestart: () => void }) {
  const { t } = useLocale();
  const r = scoreMockTest(state.ids, state.answers, BY_ID);
  const took = (state.finishedAt ?? state.startedAt) - state.startedAt;
  return (
    <>
      <section className="card stack" style={{ alignItems: "center", textAlign: "center" }}>
        <span className="eyebrow">{t.result}</span>
        <div className={`result-score ${r.passed ? "pass" : "fail"}`}>
          {r.correct}/{r.total}
        </div>
        <h2 className={r.passed ? "pass" : "fail"}>{r.passed ? t.passed : t.notPassed}</h2>
        <p className="muted small">
          {fill(t.resultMeta, { pass: PASS_MARK, time: formatClock(took), answered: r.answered })}
        </p>
        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn btn--green" onClick={onRestart}>
            {t.newMock}
          </button>
          <Link href="/weak" className="btn">
            {t.navWeak}
          </Link>
        </div>
      </section>
      <h2>
        {t.reviewMistakes}{" "}
        <span className={`badge ${r.mistakes.length ? "badge--red" : "badge--green"}`}>{r.mistakes.length}</span>
      </h2>
      {r.mistakes.length === 0 && <p className="note">{t.noMistakes}</p>}
      {r.mistakes.map((id) => (
        <QuestionView
          key={id}
          q={BY_ID.get(id)!}
          label={fill(t.questionN, { n: state.ids.indexOf(id) + 1 })}
          selected={state.answers[id]}
          reveal
        />
      ))}
    </>
  );
}
