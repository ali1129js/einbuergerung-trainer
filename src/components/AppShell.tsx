import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useProgress } from "@/state/ProgressContext";
import { ThemeButton } from "./ThemePicker";

export const TEST_DATE = new Date("2026-12-08T00:00:00+01:00");

export function daysUntilTest(now = new Date()): number {
  return Math.max(0, Math.ceil((TEST_DATE.getTime() - now.getTime()) / 86_400_000));
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/practice", label: "Practice" },
  { href: "/test", label: "Mock test" },
  { href: "/weak", label: "Weak spots" },
  { href: "/progress", label: "Progress" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [path] = useLocation();
  const { loadError } = useProgress();
  const days = daysUntilTest();
  return (
    <div>
      <header className="topbar">
        <div className="topbar__inner">
          <Link href="/" className="brand">
            Einbürgerungstest Trainer
            <small>Leben in Deutschland · Brandenburg</small>
          </Link>
          <span className="countdown" title="Test date: 8 Dec 2026">
            {days} days to go
          </span>
          <ThemeButton />
        </div>
        <nav className="nav" aria-label="Main navigation">
          {NAV.map((n) => {
            const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="accent-rule" />
      </header>
      {loadError && (
        <div role="alert" className="alert" style={{ margin: 14 }}>
          <strong>Saved progress could not be read.</strong> It was kept unchanged under{" "}
          <code>{loadError.backupKey}</code>. Starting with empty progress.
        </div>
      )}
      <main className="page">{children}</main>
      <footer className="footer">Questions: BAMF Gesamtfragenkatalog. Explanations are study help, not official.</footer>
    </div>
  );
}

export function Kpi({ label, value, accent }: { label: string; value: ReactNode; accent?: "green" | "blue" | "red" }) {
  return (
    <span className={`kpi${accent ? ` kpi--${accent}` : ""}`}>
      <span className="small">{label}</span>
      <strong>{value}</strong>
    </span>
  );
}

export function TopicBar({ total, mastered, seen, weak }: { total: number; mastered: number; seen: number; weak: number }) {
  const p = (n: number) => (total ? (n / total) * 100 : 0);
  const otherSeen = Math.max(0, seen - mastered - weak);
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={mastered}
      aria-label={`${mastered} of ${total} learned`}
    >
      <span className="p-mastered" style={{ width: `${p(mastered)}%` }} />
      <span className="p-seen" style={{ width: `${p(otherSeen)}%` }} />
      <span className="p-weak" style={{ width: `${p(weak)}%` }} />
    </div>
  );
}
