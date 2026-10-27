import { useState } from "react";
import { Link } from "wouter";
import { QuestionView } from "@/components/QuestionView";
import { answerWeak, MASTERED_STREAK, startWeakSession, weakIds, weakSessionDone, type WeakSession } from "@/lib/progress";
import { BY_ID } from "@/lib/questions";
import { useProgress } from "@/state/ProgressContext";

export function WeakList() {
  const { progress } = useProgress();
  const ids = weakIds(progress);
  return (
    <>
      <div className="stack" style={{ gap: 4 }}>
        <span className="eyebrow">Weak spots</span>
        <h1>Questions to repeat</h1>
        <p className="muted small">
          A question stays here until you answer it right {MASTERED_STREAK} times in a row.
        </p>
      </div>
      {ids.length === 0 ? (
        <p className="note">No weak spots right now. Practise or take a mock test, and anything you get wrong shows up here.</p>
      ) : (
        <>
          <Link href="/weak/practice" className="btn btn--green btn--block">
            Practise weak spots ({ids.length})
          </Link>
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th className="num">Wrong</th>
                  <th className="num">Streak</th>
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
  const [session, setSession] = useState<WeakSession>(() => startWeakSession(weakIds(progress)));
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const total = session.queue.length + session.cleared.length;

  if (weakSessionDone(session))
    return (
      <div className="card stack">
        <h2>{total ? "All weak spots cleared 🎉" : "No weak spots"}</h2>
        <p className="muted">
          {total ? `You answered all ${total} questions right twice in a row.` : "Nothing to repeat right now."}
        </p>
        <Link href="/weak" className="btn btn--primary">
          Back
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
          ← Weak spots
        </Link>
        <span className="spacer" />
        <span className="small muted">
          {session.cleared.length}/{total} cleared · {session.queue.length} left
        </span>
      </div>
      <QuestionView
        key={`${id}-${session.cleared.length}-${session.queue.length}-${run}-${JSON.stringify(session.runs)}`}
        q={q}
        label={`In a row: ${run}/${MASTERED_STREAK}`}
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
          Next →
        </button>
      </div>
    </>
  );
}
