"""Combine PDF text, cropped images and the two answer sources into data/questions.json + CONFLICTS.md."""
import json, re

pdf = json.load(open('raw/pdf_extract.json'))
match = {m['id']: m for m in json.load(open('raw/match.json'))}
oet_meta = json.load(open('raw/oet_brandenburg.json'))
eto_meta = json.load(open('raw/eto.json'))
oet = oet_meta['items']; eto = eto_meta['items']
images = json.load(open('raw/images.json'))

R = lambda a, b: set(range(a, b + 1))
TOPICS = {
    'Recht': {3, 4, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 43, 51, 53, 80, 96, 104, 111, 150, 245, 251, 252, 262, 263, 272, 274} | R(136, 148),
    'Wahlen': {5, 28, 44, 62, 93, 94, 133} | R(105, 110) | R(112, 117) | R(119, 130),
    'Bundesländer': {24, 25, 37, 39, 49, 64, 67, 90, 91, 192, 195, 197, 198, 200, 201},
    'Europa': {173} | R(221, 227) | R(229, 240),
    'Geschichte': (R(151, 170) | R(172, 211) | {215, 217, 218, 219, 220, 228}) - {173, 182, 192, 195, 197, 198, 200, 201},
    'Gesellschaft': {2, 23, 59, 66, 68, 95, 118, 132, 149, 182, 242, 248, 249, 250, 264, 267, 271, 277, 278, 281, 288, 289} | R(292, 300),
    'Alltag': {35, 36, 45, 97, 99, 100, 101, 102, 134, 135, 241, 243, 244, 246, 247, 265, 266, 268, 269, 270, 273, 275, 276, 279, 280, 282, 283, 284, 285, 286, 287, 290, 291} | R(253, 261),
}
for a in TOPICS:
    for b in TOPICS:
        if a < b:
            assert not (TOPICS[a] & TOPICS[b]), (a, b, TOPICS[a] & TOPICS[b])

def topic(section, num):
    if section == 'BB':
        return 'Bundesländer'
    for t, s in TOPICS.items():
        if num in s:
            return t
    return 'Politik/Demokratie'

OET_URL = 'https://oet.bamf.de/ords/oetut/f?p=514:30 (Bundesland Brandenburg)'
IMG_NOTES = {
    'G130': 'Picture-numbered options. BAMF Online-Testcenter uses a different ballot illustration than the 2025 PDF; checked by hand that PDF ballot 1 is the only one with exactly one Erststimme and one Zweitstimme.',
    'BB8': 'Map-numbered options; checked by hand that marker 4 points to Brandenburg in both the PDF map and the Online-Testcenter map.',
}
for k in ('G21', 'G209', 'G226', 'BB1'):
    IMG_NOTES[k] = 'Picture-numbered options; checked by hand that the PDF and the Online-Testcenter show the pictures in the same order.'

out, conflicts = [], []
for i, q in enumerate(pdf):
    sec, num = q['section'], q['num']
    qid = f'{sec}{num}'
    m = match[qid]
    question = q['question']
    notes = []
    pm = re.match(r'^(\d+)\.\s+', question)
    if pm and int(pm.group(1)) == num:
        question = question[pm.end():]
        notes.append(f'PDF prints a stray "{num}." before the question text; removed.')
    a_oet, a_eto = m['oet_answer_pdf_idx'], m['eto_answer_pdf_idx']
    eto_url = eto[i]['url'].rstrip('/') + '#' + eto[i]['id']
    sources = [
        {'name': 'BAMF Online-Testcenter', 'url': OET_URL, 'ref': f"Aufgabe {oet[i]['n']} von 310", 'answerIndex': a_oet, 'answerText': m['oet_answer_text']},
        {'name': 'einbuergerungstest-online.de', 'url': eto_url, 'ref': eto[i]['num'].replace('\u2009', ' ').rstrip(':'), 'answerIndex': a_eto, 'answerText': m['eto_answer_text']},
    ]
    verified = a_oet == a_eto
    if not verified:
        notes.append(f'Sources disagree: OET={a_oet}, ETO={a_eto}')
        conflicts.append((qid, a_oet, a_eto, question))
    if qid in IMG_NOTES:
        notes.append(IMG_NOTES[qid])
    rec = {
        'id': qid,
        'officialNumber': num,
        'catalogNumber': oet[i]['n'],  # 1..300 general, 301..310 = Brandenburg in the BAMF test tool
        'section': 'general' if sec == 'G' else 'state',
        **({'state': 'Brandenburg'} if sec == 'BB' else {}),
        'topic': topic(sec, num),
        'question': question,
        'options': q['options'],
        'answerIndex': a_oet,  # primary source = BAMF Online-Testcenter
        'verified': verified,
        'sources': sources,
        'pdfPage': q['page'],
    }
    if qid in images:
        rec['image'] = '/' + images[qid]['path']
        if q['credit']:
            rec['imageCredit'] = q['credit']
    if notes:
        rec['note'] = ' '.join(notes)
    out.append(rec)

doc = {
    'meta': {
        'title': 'Gesamtfragenkatalog zum Test „Leben in Deutschland“ und zum „Einbürgerungstest“',
        'catalogVersion': 'Stand: 07.05.2025',
        'pdfUrl': 'https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile&v=20',
        'state': 'Brandenburg',
        'answerSources': [
            {'name': 'BAMF Online-Testcenter', 'url': 'https://oet.bamf.de/ords/oetut/f?p=514:1', 'fetchedAt': oet_meta['fetchedAt']},
            {'name': 'einbuergerungstest-online.de', 'url': 'https://www.einbuergerungstest-online.de/fragen/1/', 'fetchedAt': eto_meta['fetchedAt']},
        ],
    },
    'questions': out,
}
import sys; sys.path.insert(0, 'scripts')
from apply_explanations import merge  # keep hand-written explanations on rebuild
merge(doc)
json.dump(doc, open('data/questions.json', 'w'), ensure_ascii=False, indent=2)

with open('CONFLICTS.md', 'w') as f:
    f.write('# Answer key conflicts\n\n')
    f.write('Sources compared: BAMF Online-Testcenter (oet.bamf.de, Brandenburg, 310 Aufgaben) and einbuergerungstest-online.de.\n')
    f.write('Answers are mapped onto the option order of the 2025 PDF by text, never by position (einbuergerungstest-online.de shuffles some options).\n\n')
    if conflicts:
        f.write('| id | OET | ETO | question |\n|---|---|---|---|\n')
        for c in conflicts:
            f.write(f'| {c[0]} | {c[1]} | {c[2]} | {c[3]} |\n')
    else:
        f.write(f'**No conflicts.** All {len(out)} questions have the same answer in both sources (`verified: true`).\n\n')
    f.write('## Things checked by hand\n\n')
    for k, v in IMG_NOTES.items():
        f.write(f'- **{k}**: {v}\n')
    f.write('\n## Wording differences (not answer conflicts)\n\n')
    f.write('The Online-Testcenter and einbuergerungstest-online.de still use the older wording (e.g. "der Bürger / die Bürgerin", "selbständig"). '
            'The 2025 PDF uses the newer gendered wording (e.g. "die Bürgerin/der Bürger", "selbstständig"). `options` in questions.json always use the PDF wording; '
            'the sources\' wording is kept in `sources[].answerText`. Lowest option-text similarity after normalisation: '
            + ', '.join(f"{m['id']} ({m['oet_min_score']})" for m in sorted(match.values(), key=lambda m: m['oet_min_score'])[:4]) + '.\n')
    f.write('\n## Time-sensitive questions\n\nThese depend on who is in office or on current figures. Both sources agree as of the fetch date, but check them again before the test: '
            'G72 (Bundeskanzler: Friedrich Merz), G73 (größte Fraktionen: CDU/CSU und AfD), G75 (Staatsoberhaupt: Frank-Walter Steinmeier), G213 (84 Millionen Einwohner), G236 (27 EU-Mitgliedstaaten).\n')
print(len(out), 'verified', sum(r['verified'] for r in out), 'conflicts', len(conflicts), 'images', sum('image' in r for r in out))
from collections import Counter
print(Counter(r['topic'] for r in out))
