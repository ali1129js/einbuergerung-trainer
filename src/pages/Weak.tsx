import { useState } from "react";
import { Link } from "wouter";
import { QuestionView } from "@/components/QuestionView";
import { fill } from "@/lib/i18n";
import { answerWeak, MASTERED_STREAK, startWeakSession, weakIds, weakSessionDone, type WeakSession } from "@/lib/progress";
import { BY_ID } from "@/lib/questions";
import { useLocale } from "@/state/LocaleContext";
import { useProgress } from "@/state/ProgressContext";

export function WeakList() {
  const { progress } = useProgress();
  const { t } = useLocale();
  const ids = weakIds(progress);
  return (
    <>
      <div className="stack" style={{ gap: 4 }}>
        <span className="eyebrow">{t.weakEyebrow}</span>
        <h1>{t.weakTitle}</h1>
        <p className="muted small">{fill(t.weakIntro, { streak: MASTERED_STREAK })}</p>
      </div>
      {ids.length === 0 ? (
        <p className="note">{t.weakEmpty}</p>
      ) : (
        <>
          <Link href="/weak/practice" className="btn btn--green btn--block">
            {fill(t.practiseWeak, { count: ids.length })}
          </Link>
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>{t.colQuestion}</th>
                  <th className="num">{t.colWrong}</th>
                  <th className="num">{t.colStreak}</th>
                </tr>
              </thead>
              <tbody>
                {ids.map((id) => {
                  const q = BY_ID.get(id)!;
                  const e = progress.entries[id]!;
                  return (
                    <tr key={id}>
                      <td>
                        <span className="badge">{id}</span>{" "}
                        <span lang="de" className="small">
                          {q.question}
                        </span>
                      </td>
                      <td className="num">{e.wrong}×</td>
                      <td className="num">
                        {e.streak}/{MASTERED_STREAK}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

export function WeakPractice() {
  const { progress, record } = useProgress();
  const { t } = useLocale();
  const [session, setSession] = useState<WeakSession>(() => startWeakSession(weakIds(progress)));
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const total = session.queue.length + session.cleared.length;

  if (weakSessionDone(session))
    return (
      <div className="card stack">
        <h2>{total ? t.weakCleared : t.weakNone}</h2>
        <p className="muted">{total ? fill(t.weakClearedText, { total }) : t.weakNothing}</p>
        <Link href="/weak" className="btn btn--primary">
          {t.backPlain}
        </Link>
      </div>
    );

  const id = session.queue[0] as string;
  const q = BY_ID.get(id)!;
  const run = session.runs[id] ?? 0;
  return (
    <>
      <div className="row">
        <Link href="/weak" className="small">
          {t.weakBackLink}
        </Link>
        <span className="spacer" />
        <span className="small muted">
          {fill(t.weakSessionProgress, { cleared: session.cleared.length, total, left: session.queue.length })}
        </span>
      </div>
      <QuestionView
        key={`${id}-${session.cleared.length}-${session.queue.length}-${run}-${JSON.stringify(session.runs)}`}
        q={q}
        label={fill(t.inARow, { run, streak: MASTERED_STREAK })}
        selected={selected}
        reveal={selected !== undefined}
        onSelect={(i) => {
          setSelected(i);
          record(id, i === q.answerIndex);
        }}
      />
      <div className="sticky-actions">
        <button
          className="btn btn--primary"
          disabled={selected === undefined}
          onClick={() => {
            setSession((s) => answerWeak(s, selected === q.answerIndex));
            setSelected(undefined);
            window.scrollTo(0, 0);
          }}
        >
          {t.next}
        </button>
      </div>
    </>
  );
}
