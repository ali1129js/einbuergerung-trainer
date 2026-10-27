import { Link } from "wouter";
import { Kpi } from "@/components/AppShell";
import { MOCK_TOTAL, PASS_MARK } from "@/lib/mockTest";
import { isMastered, weakIds } from "@/lib/progress";
import { QUESTIONS } from "@/lib/questions";
import { useProgress } from "@/state/ProgressContext";

export function Home() {
  const { progress } = useProgress();
  const seen = QUESTIONS.filter((q) => progress.entries[q.id]).length;
  const mastered = QUESTIONS.filter((q) => isMastered(progress.entries[q.id])).length;
  const weak = weakIds(progress).length;
  return (
    <>
      <section className="hero">
        <span className="eyebrow">Test on 8 Dec 2026 · Brandenburg</span>
        <h1>Pass the Einbürgerungstest</h1>
        <p>
          All 310 official questions (300 general + 10 Brandenburg). In the real test you get {MOCK_TOTAL} questions in 60
          minutes and need {PASS_MARK} right.
        </p>
        <div className="kpis">
          <Kpi label="Seen" value={`${seen}/310`} accent="blue" />
          <Kpi label="Learned" value={mastered} accent="green" />
          <Kpi label="Weak" value={weak} accent="red" />
        </div>
      </section>
      <div className="grid">
        <Link href="/practice" className="card list-card">
          <span className="eyebrow">Practice</span>
          <h2>By topic</h2>
          <p className="muted small">Instant feedback with the correct answer.</p>
        </Link>
        <Link href="/test" className="card list-card">
          <span className="eyebrow">Exam mode</span>
          <h2>Mock test</h2>
          <p className="muted small">33 questions, 60 minutes, pass mark 17.</p>
        </Link>
        <Link href="/weak" className="card list-card">
          <span className="eyebrow">Repeat</span>
          <h2>Weak spots {weak > 0 && <span className="badge badge--red">{weak}</span>}</h2>
          <p className="muted small">Questions you got wrong, until you get them right twice in a row.</p>
        </Link>
        <Link href="/progress" className="card list-card">
          <span className="eyebrow">Overview</span>
          <h2>Progress</h2>
          <p className="muted small">See how far you are in each topic.</p>
        </Link>
      </div>
    </>
  );
}
