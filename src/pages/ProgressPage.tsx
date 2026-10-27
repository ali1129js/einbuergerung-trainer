import { TopicBar } from "@/components/AppShell";
import { ThemeOptions } from "@/components/ThemePicker";
import { topicStats } from "@/lib/progress";
import { QUESTIONS, TOPIC_LABEL } from "@/lib/questions";
import { useProgress } from "@/state/ProgressContext";

export function ProgressPage() {
  const { progress, reset } = useProgress();
  const stats = topicStats(QUESTIONS, progress);
  const sum = stats.reduce(
    (a, s) => ({ total: a.total + s.total, seen: a.seen + s.seen, mastered: a.mastered + s.mastered, weak: a.weak + s.weak }),
    { total: 0, seen: 0, mastered: 0, weak: 0 }
  );
  return (
    <>
      <div className="stack" style={{ gap: 4 }}>
        <span className="eyebrow">Progress</span>
        <h1>By topic</h1>
        <p className="muted small">
          <span className="badge badge--green">learned</span> = right 2× in a row ·{" "}
          <span className="badge badge--blue">seen</span> · <span className="badge badge--red">weak</span>
        </p>
      </div>
      <section className="card stack">
        <div className="row">
          <h2>Overall</h2>
          <span className="spacer" />
          <strong>
            {sum.mastered}/{sum.total} learned
          </strong>
        </div>
        <TopicBar {...sum} />
        <span className="muted small">
          {sum.seen} seen · {sum.weak} weak
        </span>
      </section>
      <div className="stack">
        {stats.map((s) => (
          <section key={s.topic} className="card stack" style={{ gap: 8 }}>
            <div className="row" style={{ gap: 6 }}>
              <h3 lang="de">{s.topic}</h3>
              <span className="muted small">{TOPIC_LABEL[s.topic]}</span>
              <span className="spacer" />
              <span className="small">
                <strong>{s.mastered}</strong>/{s.total}
              </span>
            </div>
            <TopicBar {...s} />
            <span className="muted small">
              {s.seen} seen · {s.weak} weak · accuracy {s.accuracy === null ? "–" : `${s.accuracy} %`}
            </span>
          </section>
        ))}
      </div>
      <section className="card stack" aria-labelledby="appearance-h">
        <h2 id="appearance-h">Appearance</h2>
        <ThemeOptions />
      </section>
      <button
        className="btn btn--danger"
        onClick={() => {
          if (window.confirm("Delete all saved progress on this device?")) reset();
        }}
      >
        Reset progress
      </button>
    </>
  );
}
