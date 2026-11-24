import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { fill } from "@/lib/i18n";
import { useLocale } from "@/state/LocaleContext";
import { useProgress } from "@/state/ProgressContext";
import { LocaleToggle } from "./LocaleToggle";
import { MotionToggle } from "./MotionToggle";
import { ThemeButton } from "./ThemePicker";

export const TEST_DATE = new Date("2026-12-08T00:00:00+01:00");

export function daysUntilTest(now = new Date()): number {
  return Math.max(0, Math.ceil((TEST_DATE.getTime() - now.getTime()) / 86_400_000));
}

export function AppShell({ children }: { children: ReactNode }) {
  const [path] = useLocation();
  const { loadError } = useProgress();
  const { t } = useLocale();
  const days = daysUntilTest();
  const nav = [
    { href: "/", label: t.navHome },
    { href: "/practice", label: t.navPractice },
    { href: "/test", label: t.navMock },
    { href: "/weak", label: t.navWeak },
    { href: "/progress", label: t.navProgress },
  ];
  return (
    <div>
      <header className="topbar">
        <div className="topbar__inner">
          <Link href="/" className="brand">
            {t.brandTitle}
            <small>{t.brandSub}</small>
          </Link>
          <span className="countdown" title={t.testDateTitle}>
            {days === 1 ? t.daysToGoOne : fill(t.daysToGo, { days })}
          </span>
          <div className="theme-tools">
            <LocaleToggle />
            <ThemeButton />
            <MotionToggle />
          </div>
        </div>
        <nav className="nav" aria-label={t.navMain}>
          {nav.map((n) => {
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
          <strong>{t.loadError}</strong> {fill(t.loadErrorKept, { key: loadError.backupKey })}
        </div>
      )}
      <main className="page">{children}</main>
      <footer className="footer">{t.footer}</footer>
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

export function TopicBar({ total, mastered, seen, weak, label }: { total: number; mastered: number; seen: number; weak: number; label?: string }) {
  const p = (n: number) => (total ? (n / total) * 100 : 0);
  const otherSeen = Math.max(0, seen - mastered - weak);
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={mastered}
      aria-label={label ?? `${mastered} of ${total} learned`}
    >
      <span className="p-mastered" style={{ width: `${p(mastered)}%` }} />
      <span className="p-seen" style={{ width: `${p(otherSeen)}%` }} />
      <span className="p-weak" style={{ width: `${p(weak)}%` }} />
    </div>
  );
}
