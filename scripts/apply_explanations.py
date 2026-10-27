"""Merge data/explanations.json ({id: {why, trap, trick}}) into data/questions.json.

Only touches the `explanation` field; answerIndex and everything else stay unchanged.
build_questions.py calls merge() too, so rebuilding the data keeps the explanations.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def merge(doc: dict) -> int:
    path = ROOT / 'data' / 'explanations.json'
    if not path.exists():
        return 0
    expl = json.loads(path.read_text(encoding='utf-8'))
    ids = {q['id'] for q in doc['questions']}
    unknown = set(expl) - ids
    if unknown:
        raise SystemExit(f'explanations for unknown ids: {sorted(unknown)}')
    for q in doc['questions']:
        e = expl.get(q['id'])
        if e:
            q['explanation'] = {k: e[k] for k in ('why', 'trap', 'trick') if e.get(k)}
        else:
            q.pop('explanation', None)
    return len(expl)


if __name__ == '__main__':
    qp = ROOT / 'data' / 'questions.json'
    doc = json.loads(qp.read_text(encoding='utf-8'))
    before = [(q['id'], q['answerIndex']) for q in doc['questions']]
    n = merge(doc)
    assert before == [(q['id'], q['answerIndex']) for q in doc['questions']]
    qp.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'merged {n} explanations')
