"""Map each source's correct answer onto the PDF option order (by text similarity, not by position)."""
import json, itertools, re, unicodedata, difflib, sys

pdf = json.load(open('raw/pdf_extract.json'))
oet = json.load(open('raw/oet_brandenburg.json'))['items']
eto = json.load(open('raw/eto.json'))['items']

GENDER_FEM = re.compile(r'\b(\w+?)(innen|in)\b')

def norm(s):
    s = unicodedata.normalize('NFKC', s).lower()
    s = s.replace('…', '...').replace('selbstständig', 'selbständig')
    s = re.sub(r'[^\wäöüß%]+', ' ', s)
    toks = s.split()
    # drop feminine/masc gender doublets & articles so "die Bürgerin/der Bürger" ~ "der Bürger / die Bürgerin"
    return toks

def sim(a, b):
    a2 = re.sub(r'^bild (\d)$', r'\1', ' '.join(norm(a)))
    b2 = re.sub(r'^bild (\d)$', r'\1', ' '.join(norm(b)))
    if a2.replace(' ', '') == b2.replace(' ', ''):
        return 1.0
    sa, sb = set(a2.split()), set(b2.split())
    jac = len(sa & sb) / len(sa | sb) if sa | sb else 0.0
    seq = difflib.SequenceMatcher(None, a2, b2).ratio()
    tset = difflib.SequenceMatcher(None, ' '.join(sorted(sa)), ' '.join(sorted(sb))).ratio()
    return max(jac, seq, tset)

def map_options(src_opts, pdf_opts):
    """Best bijective assignment src_index->pdf_index (max total similarity over all 24 permutations).
    Returns list of (pdf_idx, score, margin) where margin = total-score gap to the 2nd-best permutation."""
    S = [[sim(so, po) for po in pdf_opts] for so in src_opts]
    perms = sorted(itertools.permutations(range(4)), key=lambda pm: -sum(S[i][pm[i]] for i in range(4)))
    best, second = perms[0], perms[1]
    margin = sum(S[i][best[i]] for i in range(4)) - sum(S[i][second[i]] for i in range(4))
    return [(best[i], S[i][best[i]], margin) for i in range(4)]

out = []
for i, p in enumerate(pdf):
    key = ('G%d' if p['section'] == 'G' else 'BB%d') % p['num']
    o = oet[i]
    e = eto[i]
    rec = {'id': key, 'oet_n': o['n'], 'eto_id': e['id']}
    # OET
    mo = map_options(o['opts'], p['options'])
    rec['oet_perm'] = [x[0] for x in mo]
    rec['oet_min_score'] = round(min(x[1] for x in mo), 3)
    rec['oet_answer_pdf_idx'] = mo[o['correct']][0]
    # ETO
    me = map_options(e['options'], p['options'])
    rec['eto_perm'] = [x[0] for x in me]
    rec['eto_min_score'] = round(min(x[1] for x in me), 3)
    rec['eto_answer_pdf_idx'] = me[e['correct']][0]
    rec['eto_answer_score'] = round(me[e['correct']][1], 3)
    rec['eto_answer_margin'] = round(me[e['correct']][2], 3)
    rec['eto_question_sim'] = round(sim(e['question'], p['question']), 3)
    rec['eto_answer_text'] = e['options'][e['correct']]
    rec['oet_answer_text'] = o['opts'][o['correct']]
    out.append(rec)

json.dump(out, open('raw/match.json', 'w'), ensure_ascii=False, indent=1)
for r in out:
    flags = []
    if sorted(r['oet_perm']) != [0, 1, 2, 3]: flags.append('oet_perm_not_bijective')
    elif r['oet_perm'] != [0, 1, 2, 3]: flags.append('oet_order_differs')
    if sorted(r['eto_perm']) != [0, 1, 2, 3]: flags.append('eto_perm_not_bijective')
    if r['oet_min_score'] < 0.6: flags.append('oet_weak_opt(%s)' % r['oet_min_score'])
    if r['eto_min_score'] < 0.6: flags.append('eto_weak_opt(%s)' % r['eto_min_score'])
    if r['eto_question_sim'] < 0.6: flags.append('eto_q_sim=%s' % r['eto_question_sim'])
    if r['eto_answer_score'] < 0.7 or r['eto_answer_margin'] < 0.1: flags.append('eto_ans_weak(%s,%s)' % (r['eto_answer_score'], r['eto_answer_margin']))
    if r['oet_answer_pdf_idx'] != r['eto_answer_pdf_idx']: flags.append('DISAGREE oet=%d eto=%d' % (r['oet_answer_pdf_idx'], r['eto_answer_pdf_idx']))
    if flags: print(r['id'], flags)
