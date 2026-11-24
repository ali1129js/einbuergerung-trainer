import { useMemo, useState } from "react";
import { Link } from "wouter";
import { TopicBar } from "@/components/AppShell";
import { QuestionView } from "@/components/QuestionView";
import { fill, practiceSetTitle } from "@/lib/i18n";
import { isMastered, isWeak } from "@/lib/progress";
import { PRACTICE_SETS, practiceSet } from "@/lib/practice";
import { QUESTIONS, TOPIC_LABEL } from "@/lib/questions";
import { shuffle } from "@/lib/random";
import type { Topic } from "@/schema";
import { TOPICS } from "@/schema";
import { useLocale } from "@/state/LocaleContext";
import { useProgress } from "@/state/ProgressContext";

export function PracticeIndex() {
  const { progress } = useProgress();
  const { locale, t } = useLocale();
  return (
    <>
      <div className="stack" style={{ gap: 4 }}>
        <span className="eyebrow">{t.practiceEyebrow}</span>
        <h1>{t.practiceTitle}</h1>
        <p className="muted small">{t.practiceIntro}</p>
      </div>
      <div className="grid">
        {PRACTICE_SETS.map((s) => {
          const qs = QUESTIONS.filter(s.filter);
          const seen = qs.filter((q) => progress.entries[q.id]).length;
          const mastered = qs.filter((q) => isMastered(progress.entries[q.id])).length;
          const weak = qs.filter((q) => isWeak(progress.entries[q.id])).length;
          const isTopic = (TOPICS as readonly string[]).includes(s.title);
          const title = practiceSetTitle(s.key, t, s.title);
          return (
            <Link key={s.key} href={`/practice/${s.key}`} className="card list-card">
              <div className="row" style={{ gap: 6 }}>
                <h3 lang={isTopic ? "de" : undefined}>{title}</h3>
                <span className="spacer" />
                <span className="badge">{qs.length}</span>
              </div>
              {isTopic && locale === "en" && <span className="muted small">{TOPIC_LABEL[s.title as Topic]}</span>}
              <TopicBar
                total={qs.length}
                seen={seen}
                mastered={mastered}
                weak={weak}
                label={fill(t.topicBarLabel, { mastered, total: qs.length })}
              />
              <span className="muted small">
                {fill(t.practiceStats, { mastered, seen })}
                {weak ? fill(t.practiceStatsWeak, { weak }) : ""}
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
  const { t } = useLocale();
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

  if (!set) return <p className="alert">{t.unknownSet}</p>;
  const id = order[pos];
  const q = id ? byId.get(id) : undefined;
  const done = Object.keys(answers).length;
  const right = Object.entries(answers).filter(([k, v]) => byId.get(k)?.answerIndex === v).length;
  const title = practiceSetTitle(set.key, t, set.title);

  if (!q)
    return (
      <div className="card stack">
        <h2>{t.setFinished}</h2>
        <p>{fill(t.setScore, { right, done })}</p>
        <Link href="/practice" className="btn btn--primary">
          {t.backToTopics}
        </Link>
      </div>
    );

  const selected = answers[q.id];
  return (
    <>
      <div className="row">
        <Link href="/practice" className="small">
          ← {t.backToTopics}
        </Link>
        <span className="spacer" />
        <span className="small muted">
          {fill(t.practiceProgress, { pos: pos + 1, total: order.length, right, done })}
        </span>
      </div>
      <QuestionView
        key={q.id}
        q={q}
        label={title}
        selected={selected}
        reveal={selected !== undefined}
        onSelect={(i) => {
          setAnswers((a) => ({ ...a, [q.id]: i }));
          record(q.id, i === q.answerIndex);
        }}
      />
      <div className="sticky-actions">
        <button className="btn" disabled={pos === 0} onClick={() => setPos((p) => p - 1)}>
          {t.back}
        </button>
        <button className="btn btn--primary" onClick={() => setPos((p) => p + 1)}>
          {selected === undefined ? t.skip : t.next}
        </button>
      </div>
    </>
  );
}
