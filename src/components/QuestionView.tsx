import type { Question } from "@/schema";
import { fill } from "@/lib/i18n";
import { imageUrl, TOPIC_LABEL } from "@/lib/questions";
import { ZoomableImage } from "@/components/ZoomableImage";
import { useLocale } from "@/state/LocaleContext";

const KEYS = ["A", "B", "C", "D"];

export function QuestionView({
  q,
  selected,
  reveal,
  onSelect,
  label,
}: {
  q: Question;
  selected: number | undefined;
  /** Show correct/wrong colouring and the explanation. */
  reveal: boolean;
  onSelect?: (i: number) => void;
  label?: string;
}) {
  const { locale, t } = useLocale();
  const topicName = locale === "de" ? q.topic : TOPIC_LABEL[q.topic];
  const pictureAlt = fill(t.pictureAlt, { id: q.id });
  return (
    <article className="card stack" aria-label={fill(t.questionN, { n: q.id })}>
      <div className="q-meta">
        {label && <span className="eyebrow">{label}</span>}
        <span className="spacer" />
        <span className="badge">
          {q.section === "state" ? fill(t.brandenburgBadge, { n: q.officialNumber }) : fill(t.numberBadge, { n: q.officialNumber })}
        </span>
        <span className="badge badge--blue" lang={locale === "de" ? "de" : undefined}>
          {topicName}
        </span>
      </div>
      <p className="q-text" lang="de">
        {q.question}
      </p>
      {q.image && (
        <figure style={{ margin: 0 }}>
          <ZoomableImage className="q-image" src={imageUrl(q.image)} alt={pictureAlt} title={q.imageCredit} />
        </figure>
      )}
      <ul className="options">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answerIndex;
          const isSel = i === selected;
          let cls = "option";
          let flag = "";
          if (reveal && isCorrect) {
            cls += " option--correct";
            flag = isSel ? `✓ ${t.yourAnswer}` : `✓ ${t.correctFlag}`;
          } else if (reveal && isSel) {
            cls += " option--wrong";
            flag = `✗ ${t.yourAnswer}`;
          } else if (!reveal && isSel) cls += " option--selected";
          return (
            <li key={i}>
              <button
                type="button"
                className={cls}
                disabled={reveal || !onSelect}
                aria-pressed={isSel}
                onClick={() => onSelect?.(i)}
              >
                <span className="option__key">{KEYS[i]}</span>
                <span className="option__text" lang="de">
                  {opt}
                </span>
                {flag && <span className="option__flag">{flag}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {reveal && (
        <>
          {selected !== undefined ? (
            <p className={`feedback ${selected === q.answerIndex ? "feedback--ok" : "feedback--bad"}`} role="status">
              {selected === q.answerIndex ? t.correctFeedback : fill(t.notQuite, { key: KEYS[q.answerIndex] ?? "" })}
            </p>
          ) : (
            <p className="feedback feedback--bad">{fill(t.notAnswered, { key: KEYS[q.answerIndex] ?? "" })}</p>
          )}
          <ExplanationBox q={q} />
        </>
      )}
    </article>
  );
}

export function ExplanationBox({ q }: { q: Question }) {
  const { t } = useLocale();
  const e = q.explanation;
  const has = !!(e && (e.why || e.trap || e.trick));
  if (!has) return null;
  return (
    <section className="explain" aria-label={t.explanation}>
      <p className="eyebrow" style={{ marginBottom: 6 }}>
        {t.explanation}
      </p>
      <dl style={{ margin: 0 }}>
        {e.why && (
          <>
            <dt>{t.why}</dt>
            <dd>{e.why}</dd>
          </>
        )}
        {e.trap && (
          <>
            <dt>{t.trap}</dt>
            <dd>{e.trap}</dd>
          </>
        )}
        {e.trick && (
          <>
            <dt>{t.trick}</dt>
            <dd>{e.trick}</dd>
          </>
        )}
      </dl>
    </section>
  );
}
