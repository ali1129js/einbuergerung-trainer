import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { AppShell } from "@/components/AppShell";
import { Home } from "@/pages/Home";
import { MockTest } from "@/pages/MockTest";
import { PracticeIndex, PracticeSession } from "@/pages/Practice";
import { ProgressPage } from "@/pages/ProgressPage";
import { WeakList, WeakPractice } from "@/pages/Weak";
import { ProgressProvider } from "@/state/ProgressContext";

export function App() {
  return (
    <ProgressProvider>
      <Router hook={useHashLocation}>
        <AppShell>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/practice" component={PracticeIndex} />
            <Route path="/practice/:key">{(p) => <PracticeSession key={p.key} setKey={p.key} />}</Route>
            <Route path="/test" component={MockTest} />
            <Route path="/weak" component={WeakList} />
            <Route path="/weak/practice" component={WeakPractice} />
            <Route path="/progress" component={ProgressPage} />
            <Route>
              <p className="note">Page not found.</p>
            </Route>
          </Switch>
        </AppShell>
      </Router>
    </ProgressProvider>
  );
}
