// Scrapes BAMF Online-Testcenter (oet.bamf.de, APEX app 514, page 30 "Fragenkatalog zur Testvorbereitung")
// The correct option is marked server-side in the HTML with id="FARBE" (shown green after answering).
// Run: NODE_PATH=<dir with playwright-core> node scripts/scrape_oet.js
const { chromium } = require('playwright-core');
const fs = require('fs');
const OUT = process.argv[2] || 'raw/oet_brandenburg.json';
const IMGDIR = 'raw/oet_img';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const p = await b.newPage();
  await p.goto('https://oet.bamf.de/ords/oetut/f?p=514:1:0');
  await p.selectOption('#P1_BUL_ID', '14'); // Brandenburg
  await Promise.all([p.waitForNavigation(), p.click('input[value="Zum Fragenkatalog"]')]);
  const res = [];
  for (let i = 0; i < 310; i++) {
    const d = await p.evaluate(() => {
      const hdr = [...document.querySelectorAll('td.RegionHeader')].map(e => e.textContent.trim()).find(t => /^Aufgabe \d+ von/.test(t));
      const rows = [...document.querySelectorAll('td[headers="ANTWORT"]')];
      const opts = rows.map(td => td.textContent.trim());
      const correct = rows.findIndex(td => td.getAttribute('name') === 'FARBE');
      const radios = [...document.querySelectorAll('input[name="f20"]')].map(r => r.value);
      const img = document.querySelector('#P30_AUFGABENSTELLUNG_BILD img');
      const besch = document.querySelector('#P30_BESCHREIBUNG');
      return { hdr, opts, correct, radios, img: img && img.getAttribute('src'), beschreibung: besch && besch.textContent.trim() };
    });
    const n = parseInt(d.hdr.match(/Aufgabe (\d+)/)[1]);
    d.n = n;
    if (d.img) {
      const r = await p.request.get(new URL(d.img, p.url()).toString());
      const buf = await r.body();
      fs.writeFileSync(`${IMGDIR}/q${n}.img`, buf);
      d.imgBytes = buf.length;
    }
    res.push(d);
    process.stdout.write(`${n}:${d.correct} `);
    if (n === 310) break;
    await Promise.all([p.waitForNavigation(), p.click('input[name="GET_NEXT_ID"]')]);
  }
  fs.writeFileSync(OUT, JSON.stringify({ source: 'https://oet.bamf.de/ords/oetut/f?p=514:30 (Bundesland Brandenburg, P1_BUL_ID=14)', fetchedAt: new Date().toISOString(), items: res }, null, 1));
  await b.close();
})();
