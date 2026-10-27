# Answer key conflicts

Sources compared: BAMF Online-Testcenter (oet.bamf.de, Brandenburg, 310 Aufgaben) and einbuergerungstest-online.de.
Answers are mapped onto the option order of the 2025 PDF by text, never by position (einbuergerungstest-online.de shuffles some options).

**No conflicts.** All 310 questions have the same answer in both sources (`verified: true`).

## Things checked by hand

- **G130**: Picture-numbered options. BAMF Online-Testcenter uses a different ballot illustration than the 2025 PDF; checked by hand that PDF ballot 1 is the only one with exactly one Erststimme and one Zweitstimme.
- **BB8**: Map-numbered options; checked by hand that marker 4 points to Brandenburg in both the PDF map and the Online-Testcenter map.
- **G21**: Picture-numbered options; checked by hand that the PDF and the Online-Testcenter show the pictures in the same order.
- **G209**: Picture-numbered options; checked by hand that the PDF and the Online-Testcenter show the pictures in the same order.
- **G226**: Picture-numbered options; checked by hand that the PDF and the Online-Testcenter show the pictures in the same order.
- **BB1**: Picture-numbered options; checked by hand that the PDF and the Online-Testcenter show the pictures in the same order.

## Wording differences (not answer conflicts)

The Online-Testcenter and einbuergerungstest-online.de still use the older wording (e.g. "der Bürger / die Bürgerin", "selbständig"). The 2025 PDF uses the newer gendered wording (e.g. "die Bürgerin/der Bürger", "selbstständig"). `options` in questions.json always use the PDF wording; the sources' wording is kept in `sources[].answerText`. Lowest option-text similarity after normalisation: G138 (0.844), G231 (0.848), G159 (0.85), G126 (0.939).

## Time-sensitive questions

These depend on who is in office or on current figures. Both sources agree as of the fetch date, but check them again before the test: G72 (Bundeskanzler: Friedrich Merz), G73 (größte Fraktionen: CDU/CSU und AfD), G75 (Staatsoberhaupt: Frank-Walter Steinmeier), G213 (84 Millionen Einwohner), G236 (27 EU-Mitgliedstaaten).
