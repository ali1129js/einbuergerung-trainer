import { useMemo, useState } from "react";
import { Link } from "wouter";
import { TopicBar } from "@/components/AppShell";
import { QuestionView } from "@/components/QuestionView";
import { isMastered, isWeak } from "@/lib/progress";
import { PRACTICE_SETS, practiceSet } from "@/lib/practice";
import { QUESTIONS, TOPIC_LABEL } from "@/lib/questions";
import { shuffle } from "@/lib/random";
import type { Topic } from "@/schema";
import { TOPICS } from "@/schema";
import { useProgress } from "@/state/ProgressContext";

export function PracticeIndex() {
  const { progress } = useProgress();
  return (
    <>
      <div className="stack" style={{ gap: 4 }}>
        <span className="eyebrow">Practice</span>
        <h1>Choose a topic</h1>
        <p className="muted small">Questions you haven't seen yet come first. You see the right answer straight away.</p>
      </div>
      <div className="grid">
        {PRACTICE_SETS.map((s) => {
          const qs = QUESTIONS.filter(s.filter);
          const seen = qs.filter((q) => progress.entries[q.id]).length;
          const mastered = qs.filter((q) => isMastered(progress.entries[q.id])).length;
          const weak = qs.filter((q) => isWeak(progress.entries[q.id])).length;
          const isTopic = (TOPICS as readonly string[]).includes(s.title);
          return (
            <Link key={s.key} href={`/practice/${s.key}`} className="card list-card">
              <div className="row" style={{ gap: 6 }}>
                <h3 lang={isTopic ? "de" : undefined}>{s.title}</h3>
                <span className="spacer" />
                <span className="badge">{qs.length}</span>
              </div>
              {isTopic && <span className="muted small">{TOPIC_LABEL[s.title as Topic]}</span>}
              <TopicBar total={qs.length} seen={seen} mastered={mastered} weak={weak} />
              <span className="muted small">
                {mastered} learned · {seen} seen{weak ? ` · ${weak} weak` : ""}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function PracticeSession({ setKey }: { setKey: string }) {
  const set = practiceSet(setKey);
  const { progress, record } = useProgress();
  // Order is fixed when the session starts: unseen first, then weak, then the rest; random within each group.
  const [order] = useState(() => {
    if (!set) return [];
    const qs = shuffle(QUESTIONS.filter(set.filter));
    const rank = (id: string) => {
      const e = progress.entries[id];
      return !e ? 0 : isWeak(e) ? 1 : isMastered(e) ? 3 : 2;
    };
    return qs.map((q) => q.id).sort((a, b) => rank(a) - rank(b));
  });
  const [pos, setPos] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const byId = useMemo(() => new Map(QUESTIONS.map((q) => [q.id, q])), []);

  if (!set) return <p className="alert">Unknown practice set.</p>;
  const id = order[pos];
  const q = id ? byId.get(id) : undefined;
  const done = Object.keys(answers).length;
  const right = Object.entries(answers).filter(([k, v]) => byId.get(k)?.answerIndex === v).length;

  if (!q)
    return (
      <div className="card stack">
        <h2>Set finished 🎉</h2>
        <p>
          {right} of {done} correct.
        </p>
        <Link href="/practice" className="btn btn--primary">
          Back to topics
        </Link>
      </div>
    );

  const selected = answers[q.id];
  return (
    <>
      <div className="row">
        <Link href="/practice" className="small">
          ← Topics
        </Link>
        <span className="spacer" />
        <span className="small muted">
          {pos + 1}/{order.length} · {right}/{done} correct
        </span>
      </div>
      <QuestionView
        key={q.id}
        q={q}
        label={set.title}
        selected={selected}
        reveal={selected !== undefined}
        onSelect={(i) => {
          setAnswers((a) => ({ ...a, [q.id]: i }));
          record(q.id, i === q.answerIndex);
        }}
      />
      <div className="sticky-actions">
        <button className="btn" disabled={pos === 0} onClick={() => setPos((p) => p - 1)}>
          ← Back
        </button>
        <button className="btn btn--primary" onClick={() => setPos((p) => p + 1)}>
          {selected === undefined ? "Skip →" : "Next →"}
        </button>
      </div>
    </>
  );
}
