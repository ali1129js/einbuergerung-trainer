"""Extract Teil I (300 general) + Brandenburg (10) questions from the BAMF Gesamtfragenkatalog PDF.
Text: pdftotext -layout. Images: PyMuPDF render of the area between question text and first option.
Usage: python3 scripts/extract_pdf.py /workspace/bamf.pdf
"""
import re, sys, json, subprocess
from PIL import Image, ImageChops

PDF = sys.argv[1] if len(sys.argv) > 1 else '/workspace/bamf.pdf'
BOX = '\uf0a3'
txt = subprocess.run(['pdftotext', '-layout', PDF, '-'], capture_output=True, text=True).stdout
pages = txt.split('\f')

JUNK = [re.compile(p) for p in [r'^Seite \d+ von \d+$', r'^Teil I+$', r'^Allgemeine Fragen$', r'^Fragen für das Bundesland .*$', r'^(Bild \d\s*)+$']]

def is_junk(s):
    return any(p.match(s) for p in JUNK)

# Build linear list of (page_index, line) and split into sections
section = None
blocks = []  # dicts: section, num, page, lines
for pi, page in enumerate(pages):
    for raw in page.split('\n'):
        s = raw.strip()
        if s == 'Allgemeine Fragen':
            section = 'G'
        m = re.match(r'^Fragen für das Bundesland (.+)$', s)
        if m:
            section = 'BB' if m.group(1).strip() == 'Brandenburg' else 'other'
        m = re.match(r'^Aufgabe (\d+)$', s)
        if m:
            blocks.append({'section': section, 'num': int(m.group(1)), 'page': pi, 'lines': []})
            continue
        if blocks:
            blocks[-1]['lines'].append(raw)

def clean(s):
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def join(parts):
    out = ''
    for p in parts:
        p = p.strip()
        if not out:
            out = p
        elif out.endswith('-') and p[:1].islower() and not re.search(r'\s-$', out) and p.split()[0] not in ('und', 'oder', 'bzw.'):
            out = out + p  # hyphenated line break
        else:
            out = out + ' ' + p
    return clean(out)

result = []
for b in blocks:
    if b['section'] not in ('G', 'BB'):
        continue
    q_lines, opts, credit = [], [], []
    for raw in b['lines']:
        s = raw.strip()
        if not s or is_junk(s):
            continue
        if s.startswith('©') or s.startswith('In Anlehnung an'):
            credit.append(s); continue
        if s[:1] in (BOX, '\u25a1'):
            opts.append([s[1:].strip()])
        elif opts:
            opts[-1].append(s)
        else:
            q_lines.append(s)
    result.append({'section': b['section'], 'num': b['num'], 'page': b['page'] + 1,
                   'question': join(q_lines), 'options': [join(o) for o in opts],
                   'credit': ' '.join(credit) or None})

G = [r for r in result if r['section'] == 'G']
BB = [r for r in result if r['section'] == 'BB']
print('G', len(G), 'BB', len(BB), file=sys.stderr)
assert [r['num'] for r in G] == list(range(1, 301)), [r['num'] for r in G][:5]
assert [r['num'] for r in BB] == list(range(1, 11))
bad = [(r['section'], r['num'], len(r['options'])) for r in result if len(r['options']) != 4]
print('bad option counts', bad, file=sys.stderr)
json.dump(G + BB, open('raw/pdf_extract.json', 'w'), ensure_ascii=False, indent=1)
