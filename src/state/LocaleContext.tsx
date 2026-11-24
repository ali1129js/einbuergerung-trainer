import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { applyLocale, loadLocale, saveLocale, STRINGS, type Locale, type UIStrings } from "@/lib/i18n";
import { browserKV, type KV } from "@/lib/storage";

interface Ctx {
  locale: Locale;
  t: UIStrings;
  setLocale: (locale: Locale) => void;
}

const LocaleCtx = createContext<Ctx | null>(null);

export function LocaleProvider({ children, kv }: { children: ReactNode; kv?: KV }) {
  const store = useMemo(() => kv ?? browserKV(), [kv]);
  const [locale, setLocaleState] = useState<Locale>(() => loadLocale(store));

  useEffect(() => {
    applyLocale(locale);
    saveLocale(store, locale);
  }, [locale, store]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const value = useMemo(() => ({ locale, t: STRINGS[locale], setLocale }), [locale, setLocale]);
  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale(): Ctx {
  const c = useContext(LocaleCtx);
  if (!c) throw new Error("useLocale outside LocaleProvider");
  return c;
}
