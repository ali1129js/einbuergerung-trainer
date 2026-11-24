import { describe, expect, it } from "vitest";
import { fill, loadLocale, LOCALE_KEY, saveLocale, STRINGS } from "../src/lib/i18n";
import { memoryKV } from "../src/lib/storage";

describe("locale storage", () => {
  it("defaults to English when nothing is stored", () => {
    expect(loadLocale(memoryKV())).toBe("en");
  });

  it("round-trips a saved locale", () => {
    const kv = memoryKV();
    saveLocale(kv, "de");
    expect(JSON.parse(kv.getItem(LOCALE_KEY)!)).toBe("de");
    expect(loadLocale(kv)).toBe("de");
  });

  it("falls back to English for invalid values", () => {
    const kv = memoryKV();
    kv.setItem(LOCALE_KEY, "nope");
    expect(loadLocale(kv)).toBe("en");
    kv.setItem(LOCALE_KEY, JSON.stringify("fr"));
    expect(loadLocale(kv)).toBe("en");
  });
});

describe("fill", () => {
  it("substitutes named placeholders and leaves unknown ones", () => {
    expect(fill("{n} of {total}", { n: 2, total: 10 })).toBe("2 of 10");
    expect(fill("keep {missing}", { n: 1 })).toBe("keep {missing}");
  });
});

describe("string tables", () => {
  it("has the same keys in English and German", () => {
    expect(Object.keys(STRINGS.de).sort()).toEqual(Object.keys(STRINGS.en).sort());
  });
});
