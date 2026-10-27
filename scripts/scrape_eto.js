// Scrapes einbuergerungstest-online.de question lists (correct answer marked with ✅ / bg-green-100).
const { chromium } = require('playwright-core');
const fs = require('fs');
const URLS = [...Array(10)].map((_, i) => `https://www.einbuergerungstest-online.de/fragen/${i + 1}/`).concat(['https://www.einbuergerungstest-online.de/fragen/bb']);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME_PATH });
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' });
  const out = [];
  for (const u of URLS) {
    const r = await p.goto(u, { waitUntil: 'domcontentloaded' });
    const items = await p.evaluate(() => [...document.querySelectorAll('div[id^="frage-"]')].map(d => {
      const lis = [...d.querySelectorAll('ul > li')];
      return {
        id: d.id,
        num: d.querySelector('h3 span') && d.querySelector('h3 span').textContent.trim(),
        question: d.querySelector('h3 strong') && d.querySelector('h3 strong').textContent.trim(),
        options: lis.map(li => li.textContent.replace('✅', '').replace(/\s+/g, ' ').trim()),
        correct: lis.findIndex(li => li.textContent.includes('✅')),
      };
    }));
    console.log(u, r.status(), items.length);
    out.push(...items.map(x => ({ ...x, url: u })));
    await p.waitForTimeout(1500);
  }
  fs.writeFileSync('raw/eto.json', JSON.stringify({ source: 'https://www.einbuergerungstest-online.de/fragen/{1..10}/ + /fragen/bb', fetchedAt: new Date().toISOString(), items: out }, null, 1));
  await b.close();
})();
