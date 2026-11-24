import { TopicBar } from "@/components/AppShell";
import { ThemeOptions } from "@/components/ThemePicker";
import { fill } from "@/lib/i18n";
import { topicStats } from "@/lib/progress";
import { QUESTIONS, TOPIC_LABEL } from "@/lib/questions";
import { useLocale } from "@/state/LocaleContext";
import { useProgress } from "@/state/ProgressContext";

export function ProgressPage() {
  const { progress, reset } = useProgress();
  const { locale, t } = useLocale();
  const stats = topicStats(QUESTIONS, progress);
  const sum = stats.reduce(
    (a, s) => ({ total: a.total + s.total, seen: a.seen + s.seen, mastered: a.mastered + s.mastered, weak: a.weak + s.weak }),
    { total: 0, seen: 0, mastered: 0, weak: 0 }
  );
  return (
    <>
      <div className="stack" style={{ gap: 4 }}>
        <span className="eyebrow">{t.progressEyebrow}</span>
        <h1>{t.progressTitle}</h1>
        <p className="muted small">
          <span className="badge badge--green">{t.kpiLearned}</span> {t.progressLegendMid}{" "}
          <span className="badge badge--blue">{t.kpiSeen}</span> · <span className="badge badge--red">{t.kpiWeak}</span>
        </p>
      </div>
      <section className="card stack">
        <div className="row">
          <h2>{t.overall}</h2>
          <span className="spacer" />
          <strong>{fill(t.overallLearned, { mastered: sum.mastered, total: sum.total })}</strong>
        </div>
        <TopicBar {...sum} label={fill(t.topicBarLabel, { mastered: sum.mastered, total: sum.total })} />
        <span className="muted small">{fill(t.progressStats, { seen: sum.seen, weak: sum.weak })}</span>
      </section>
      <div className="stack">
        {stats.map((s) => (
          <section key={s.topic} className="card stack" style={{ gap: 8 }}>
            <div className="row" style={{ gap: 6 }}>
              <h3 lang="de">{s.topic}</h3>
              {locale === "en" && <span className="muted small">{TOPIC_LABEL[s.topic]}</span>}
              <span className="spacer" />
              <span className="small">
                <strong>{s.mastered}</strong>/{s.total}
              </span>
            </div>
            <TopicBar {...s} label={fill(t.topicBarLabel, { mastered: s.mastered, total: s.total })} />
            <span className="muted small">
              {fill(t.progressAccuracy, {
                seen: s.seen,
                weak: s.weak,
                accuracy: s.accuracy === null ? "–" : `${s.accuracy} %`,
              })}
            </span>
          </section>
        ))}
      </div>
      <section className="card stack" aria-labelledby="appearance-h">
        <h2 id="appearance-h">{t.appearance}</h2>
        <ThemeOptions />
      </section>
      <button
        className="btn btn--danger"
        onClick={() => {
          if (window.confirm(t.resetConfirm)) reset();
        }}
      >
        {t.resetProgress}
      </button>
    </>
  );
}
