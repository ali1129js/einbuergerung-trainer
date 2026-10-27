"""Find questions with embedded pictures in the BAMF PDF and render that region to public/img/<id>.png.
The crop is the union of the picture bboxes plus the 'Bild 1 … Bild 4' caption row / © credit directly below."""
import pymupdf, json, re, sys
PDF = sys.argv[1] if len(sys.argv) > 1 else '/workspace/bamf.pdf'
doc = pymupdf.open(PDF)
pdf = json.load(open('raw/pdf_extract.json'))
anchors = []
lines_by_page = {}
for pno in range(len(doc)):
    ls = []
    for b in doc[pno].get_text('dict')['blocks']:
        for l in b.get('lines', []):
            t = ''.join(s['text'] for s in l['spans']).strip()
            ls.append((l['bbox'], t))
            if re.fullmatch(r'Aufgabe \d+', t):
                anchors.append((pno, l['bbox'][1], t))
    lines_by_page[pno] = ls
images = {}
for q in pdf:
    pno = q['page'] - 1
    a = [x for x in anchors if x[0] == pno and x[2] == f"Aufgabe {q['num']}"][0]
    y1 = min([b[1] for b in anchors if b[0] == pno and b[1] > a[1]], default=doc[pno].rect.height)
    boxes = [pymupdf.Rect(i['bbox']) for i in doc[pno].get_image_info() if a[1] < (i['bbox'][1] + i['bbox'][3]) / 2 < y1]
    if not boxes:
        continue
    r = boxes[0]
    for bx in boxes[1:]:
        r |= bx
    base_bottom = r.y1
    opt_top = min([pymupdf.Rect(bb).y0 for bb, t in lines_by_page[pno] if t[:1] in ('\uf0a3', '\u25a1') and pymupdf.Rect(bb).y0 > base_bottom], default=y1)
    for bb, t in lines_by_page[pno]:
        rb = pymupdf.Rect(bb)
        if rb.y0 >= base_bottom - 2 and rb.y0 < min(base_bottom + 30, opt_top - 2) and (re.fullmatch(r'(Bild \d\s*)+', t) or t.startswith('©')):
            r |= rb
    r = pymupdf.Rect(r.x0 - 6, r.y0 - 6, r.x1 + 6, r.y1 + 6)
    qid = ('G%d' if q['section'] == 'G' else 'BB%d') % q['num']
    pix = doc[pno].get_pixmap(clip=r, dpi=150)
    path = f'public/img/{qid}.png'
    pix.save(path)
    images[qid] = {'path': f'img/{qid}.png', 'page': pno + 1, 'bbox': [round(v, 1) for v in r]}
    print(qid, path, pix.width, pix.height)
json.dump(images, open('raw/images.json', 'w'), indent=1)
