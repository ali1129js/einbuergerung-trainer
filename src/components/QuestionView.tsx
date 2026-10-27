import type { Question } from "@/schema";
import { imageUrl, TOPIC_LABEL } from "@/lib/questions";

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
  return (
    <article className="card stack" aria-label={`Question ${q.id}`}>
      <div className="q-meta">
        {label && <span className="eyebrow">{label}</span>}
        <span className="spacer" />
        <span className="badge">{q.section === "state" ? `Brandenburg ${q.officialNumber}` : `Nr. ${q.officialNumber}`}</span>
        <span className="badge badge--blue">{TOPIC_LABEL[q.topic]}</span>
      </div>
      <p className="q-text" lang="de">
        {q.question}
      </p>
      {q.image && (
        <figure style={{ margin: 0 }}>
          <img className="q-image" src={imageUrl(q.image)} alt={`Picture for question ${q.id}`}
            title={q.imageCredit} loading="lazy" />
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
            flag = isSel ? "✓ Your answer" : "✓ Correct";
          } else if (reveal && isSel) {
            cls += " option--wrong";
            flag = "✗ Your answer";
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
              {selected === q.answerIndex
                ? "Correct!"
                : `Not quite. The correct answer is ${KEYS[q.answerIndex]}.`}
            </p>
          ) : (
            <p className="feedback feedback--bad">Not answered. The correct answer is {KEYS[q.answerIndex]}.</p>
          )}
          <ExplanationBox q={q} />
        </>
      )}
    </article>
  );
}

export function ExplanationBox({ q }: { q: Question }) {
  const e = q.explanation;
  const has = !!(e && (e.why || e.trap || e.trick));
  return (
    <section className="explain" aria-label="Explanation">
      <p className="eyebrow" style={{ marginBottom: 6 }}>
        Explanation
      </p>
      {has ? (
        <dl style={{ margin: 0 }}>
          {e.why && (
            <>
              <dt>Why</dt>
              <dd>{e.why}</dd>
            </>
          )}
          {e.trap && (
            <>
              <dt>Trap</dt>
              <dd>{e.trap}</dd>
            </>
          )}
          {e.trick && (
            <>
              <dt>Trick</dt>
              <dd>{e.trick}</dd>
            </>
          )}
        </dl>
      ) : (
        <p className="muted">Explanation coming soon</p>
      )}
    </section>
  );
}
