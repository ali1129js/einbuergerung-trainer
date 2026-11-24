import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { describe, expect, it } from "vitest";
import { PRECACHE_GLOBS, QUESTION_IMAGE_PATHS } from "../src/lib/offlineAssets";
import viteConfig from "../vite.config";

const root = fileURLToPath(new URL("..", import.meta.url));

describe("offline asset list", () => {
  it("names all 13 question pictures that exist on disk and in questions.json", () => {
    const onDisk = readdirSync(join(root, "public/img"))
      .filter((n) => n.endsWith(".png"))
      .sort();
    expect(onDisk).toHaveLength(13);
    expect([...QUESTION_IMAGE_PATHS].map((p) => p.slice("img/".length)).sort()).toEqual(onDisk);

    const raw = JSON.parse(readFileSync(join(root, "data/questions.json"), "utf8")) as {
      questions: { image?: string }[];
    };
    const inData = [
      ...new Set(raw.questions.map((q) => q.image).filter((p): p is string => Boolean(p))),
    ]
      .map((p) => p.replace(/^\//, ""))
      .sort();
    expect(inData).toEqual([...QUESTION_IMAGE_PATHS].sort());
  });

  it("is wired into the Vite PWA precache config", () => {
    const globs = PRECACHE_GLOBS.join(",");
    expect(globs).toMatch(/js/);
    expect(globs).toMatch(/html/);
    expect(globs).toMatch(/png/);
    expect(globs).toMatch(/webmanifest|json/);
  });
});

/**
 * Playwright check (documented, not run in CI):
 *   npm run build && npm run preview
 *   Open the preview URL, go to Practice, open a question (with or without a picture).
 *   In DevTools, set Network to Offline, reload. The same Practice view and picture still load.
 */
describe("built service worker precache", () => {
  it(
    "caches the app shell, a questions chunk, and every question picture",
    { timeout: 180_000 },
    async () => {
      await build({ ...viteConfig, configFile: false, logLevel: "error" });
      const swPath = join(root, "dist/sw.js");
      expect(existsSync(swPath), "dist/sw.js should be emitted").toBe(true);
      const sw = readFileSync(swPath, "utf8");
      for (const img of QUESTION_IMAGE_PATHS) {
        expect(sw, img).toContain(img.split("/").pop());
      }
      expect(sw).toMatch(/index\.html/);
      expect(sw).toMatch(/manifest\.webmanifest/);
      expect(sw).toMatch(/\.js/);
      // The question bank is bundled into a JS chunk (imported from data/questions.json).
      expect(sw).toMatch(/assets\/.*\.js/);
      const urls = [...sw.matchAll(/url:"([^"]+)"/g)].map((m) => m[1]);
      expect(urls, "precache URLs must be unique").toEqual([...new Set(urls)]);
    }
  );
});
