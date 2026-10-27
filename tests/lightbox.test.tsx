// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionView } from "../src/components/QuestionView";
import { QUESTIONS } from "../src/lib/questions";

const picture = QUESTIONS.find((q) => q.image)!;
const plain = QUESTIONS.find((q) => !q.image)!;

function setup(selected?: number) {
  const onSelect = vi.fn();
  render(<QuestionView q={picture} selected={selected} reveal={false} onSelect={onSelect} label="Question 1 of 33" />);
  const thumb = screen.getByRole("button", { name: /enlarge picture/i });
  return { onSelect, thumb };
}
const dialog = () => screen.queryByRole("dialog");

beforeEach(() => {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
});
afterEach(() => {
  cleanup();
  document.getElementById("root")?.remove();
});

describe("picture lightbox", () => {
  it("has a picture question to test with", () => {
    expect(picture.image).toBeTruthy();
  });

  it("shows a zoomable thumbnail with a magnifier hint, only for picture questions", () => {
    const { thumb } = setup();
    expect(thumb.tagName).toBe("BUTTON");
    expect(thumb).toHaveProperty("type", "button");
    expect(thumb.getAttribute("aria-haspopup")).toBe("dialog");
    expect(thumb.querySelector("img")?.getAttribute("alt")).toBe(`Picture for question ${picture.id}`);
    expect(thumb.querySelector(".zoom-hint svg")).not.toBeNull();
    expect(thumb.querySelector(".zoom-hint")?.getAttribute("aria-hidden")).toBe("true");
    cleanup();
    render(<QuestionView q={plain} selected={undefined} reveal={false} onSelect={() => {}} />);
    expect(screen.queryByRole("button", { name: /enlarge picture/i })).toBeNull();
  });

  it("opens an accessible modal with the large image, caption and a focused close button", () => {
    const { thumb } = setup();
    expect(dialog()).toBeNull();
    fireEvent.click(thumb);
    const d = dialog()!;
    expect(d).not.toBeNull();
    expect(d.getAttribute("aria-modal")).toBe("true");
    const img = d.querySelector("img.lightbox__img")!;
    expect(img.getAttribute("src")).toBe(thumb.querySelector("img")!.getAttribute("src"));
    expect(img.getAttribute("alt")).toBe(`Picture for question ${picture.id}`);
    expect(d.querySelector("figcaption")?.textContent).toBe(`Picture for question ${picture.id}`);
    const close = screen.getByRole("button", { name: /close enlarged picture/i });
    expect(close.textContent).toContain("×");
    expect(document.activeElement).toBe(close);
    // the page behind is inert and not scrollable while open
    expect(document.getElementById("root")!.hasAttribute("inert")).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes on Escape and returns focus to the image", () => {
    const { thumb } = setup();
    thumb.focus();
    fireEvent.click(thumb);
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(thumb);
    expect(document.getElementById("root")!.hasAttribute("inert")).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("closes with the × button and returns focus", () => {
    const { thumb } = setup();
    fireEvent.click(thumb);
    fireEvent.click(screen.getByRole("button", { name: /close enlarged picture/i }));
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(thumb);
  });

  it("closes on a backdrop click but not on a click inside the panel or on the image", () => {
    const { thumb } = setup();
    fireEvent.click(thumb);
    fireEvent.click(dialog()!.querySelector("img")!);
    fireEvent.click(dialog()!);
    expect(dialog()).not.toBeNull();
    fireEvent.click(screen.getByTestId("lightbox-backdrop"));
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(thumb);
  });

  it("traps Tab focus inside the dialog", () => {
    const { thumb } = setup();
    fireEvent.click(thumb);
    const close = screen.getByRole("button", { name: /close enlarged picture/i });
    fireEvent.keyDown(close, { key: "Tab" });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(close);
  });

  it("clicking the picture (and using the lightbox) never selects an answer", () => {
    const { thumb, onSelect } = setup();
    fireEvent.click(thumb.querySelector("img")!);
    fireEvent.click(dialog()!.querySelector("img")!);
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    fireEvent.click(thumb);
    fireEvent.click(screen.getByRole("button", { name: /close enlarged picture/i }));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
  });

  it("keeps an existing answer selection untouched", () => {
    const { thumb, onSelect } = setup(2);
    fireEvent.click(thumb);
    fireEvent.click(screen.getByTestId("lightbox-backdrop"));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(1);
  });

  it("does not pause timers (mock test clock keeps running while open)", () => {
    vi.useFakeTimers();
    try {
      const tick = vi.fn();
      const t = window.setInterval(tick, 1000);
      const { thumb } = setup();
      fireEvent.click(thumb);
      act(() => vi.advanceTimersByTime(3000));
      expect(tick).toHaveBeenCalledTimes(3);
      expect(dialog()).not.toBeNull();
      window.clearInterval(t);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("pinch zoom is not blocked", () => {
  const html = readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
  const css = readFileSync(path.resolve(__dirname, "../src/index.css"), "utf8");
  it("viewport meta allows user scaling", () => {
    const vp = html.match(/<meta name="viewport" content="([^"]+)"/)?.[1] ?? "";
    expect(vp).not.toMatch(/user-scalable\s*=\s*(no|0)/i);
    expect(vp).not.toMatch(/maximum-scale\s*=\s*1(\.0)?\b/i);
  });
  it("no touch-action: none in the stylesheet; thumbnails use cursor zoom-in", () => {
    expect(css).not.toMatch(/touch-action:\s*none/);
    expect(css).toMatch(/\.zoom-thumb[^{]*\{[^}]*cursor:\s*zoom-in/);
  });
});
