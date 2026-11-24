import { Link } from "wouter";
import { Kpi } from "@/components/AppShell";
import { fill } from "@/lib/i18n";
import { MOCK_TOTAL, PASS_MARK } from "@/lib/mockTest";
import { isMastered, weakIds } from "@/lib/progress";
import { QUESTIONS } from "@/lib/questions";
import { useLocale } from "@/state/LocaleContext";
import { useProgress } from "@/state/ProgressContext";

export function Home() {
  const { progress } = useProgress();
  const { t } = useLocale();
  const seen = QUESTIONS.filter((q) => progress.entries[q.id]).length;
  const mastered = QUESTIONS.filter((q) => isMastered(progress.entries[q.id])).length;
  const weak = weakIds(progress).length;
  return (
    <>
      <section className="hero">
        <span className="eyebrow">{t.homeEyebrow}</span>
        <h1>{t.homeTitle}</h1>
        <p>{fill(t.homeIntro, { total: MOCK_TOTAL, pass: PASS_MARK })}</p>
        <div className="kpis">
          <Kpi label={t.kpiSeen} value={`${seen}/310`} accent="blue" />
          <Kpi label={t.kpiLearned} value={mastered} accent="green" />
          <Kpi label={t.kpiWeak} value={weak} accent="red" />
        </div>
      </section>
      <div className="grid">
        <Link href="/practice" className="card list-card">
          <span className="eyebrow">{t.homePracticeEyebrow}</span>
          <h2>{t.homePracticeTitle}</h2>
          <p className="muted small">{t.homePracticeText}</p>
        </Link>
        <Link href="/test" className="card list-card">
          <span className="eyebrow">{t.homeExamEyebrow}</span>
          <h2>{t.homeExamTitle}</h2>
          <p className="muted small">{t.homeExamText}</p>
        </Link>
        <Link href="/weak" className="card list-card">
          <span className="eyebrow">{t.homeWeakEyebrow}</span>
          <h2>
            {t.homeWeakTitle} {weak > 0 && <span className="badge badge--red">{weak}</span>}
          </h2>
          <p className="muted small">{t.homeWeakText}</p>
        </Link>
        <Link href="/progress" className="card list-card">
          <span className="eyebrow">{t.homeProgressEyebrow}</span>
          <h2>{t.homeProgressTitle}</h2>
          <p className="muted small">{t.homeProgressText}</p>
        </Link>
      </div>
    </>
  );
}
