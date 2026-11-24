// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../src/App";
import { QuestionView } from "../src/components/QuestionView";
import { STRINGS } from "../src/lib/i18n";
import { QUESTIONS } from "../src/lib/questions";
import { LocaleProvider } from "../src/state/LocaleContext";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.lang = "en";
});

describe("language toggle", () => {
  it("defaults to English chrome and document.lang=en, then switches to German", () => {
    render(<App />);
    expect(document.documentElement.lang).toBe("en");
    expect(screen.getByRole("heading", { level: 1, name: STRINGS.en.homeTitle })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: STRINGS.en.navMain })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "DE" }));
    expect(document.documentElement.lang).toBe("de");
    expect(document.title).toBe(STRINGS.de.documentTitle);
    expect(screen.getByRole("heading", { level: 1, name: STRINGS.de.homeTitle })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: STRINGS.de.navMain })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(document.documentElement.lang).toBe("en");
    expect(screen.getByRole("heading", { level: 1, name: STRINGS.en.homeTitle })).toBeTruthy();
  });

  it("remembers the German choice", () => {
    window.localStorage.setItem("einb-trainer.locale.v1", JSON.stringify("de"));
    render(<App />);
    expect(document.documentElement.lang).toBe("de");
    expect(screen.getByRole("heading", { level: 1, name: STRINGS.de.homeTitle })).toBeTruthy();
  });
});

describe("official question wording", () => {
  it("keeps question and option text in German in both UIs", () => {
    const q = QUESTIONS.find((item) => !item.image)!;
    const { rerender } = render(
      <LocaleProvider>
        <QuestionView q={q} selected={undefined} reveal={false} />
      </LocaleProvider>
    );
    const question = screen.getByText(q.question);
    expect(question.lang).toBe("de");
    for (const opt of q.options) {
      expect(screen.getByText(opt).lang).toBe("de");
    }
    window.localStorage.setItem("einb-trainer.locale.v1", JSON.stringify("de"));
    rerender(
      <LocaleProvider>
        <QuestionView q={q} selected={undefined} reveal={false} />
      </LocaleProvider>
    );
    expect(screen.getByText(q.question).lang).toBe("de");
    expect(screen.getByText(q.options[0]!).lang).toBe("de");
  });
});
