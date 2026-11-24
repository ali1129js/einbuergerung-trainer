import { LOCALES } from "@/lib/i18n";
import { useLocale } from "@/state/LocaleContext";

export function LocaleToggle() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div role="group" aria-label={t.language} className="locale-toggle">
      {LOCALES.map((name) => (
        <button
          key={name}
          type="button"
          aria-pressed={locale === name}
          onClick={() => setLocale(name)}
        >
          {name === "en" ? t.localeEn : t.localeDe}
        </button>
      ))}
    </div>
  );
}
