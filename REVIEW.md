# Explanation review notes

Explanations live in `data/explanations.json` and are merged into `data/questions.json` by
`scripts/apply_explanations.py` (also run automatically by `scripts/build_questions.py`).
`answerIndex` was not changed by this step.

## Batch 3: G1 to G60

**Disagreements with the verified answer: none.** For all 60 questions the reasoning supports
the verified answer.

### Nuance worth knowing (answer stays as is)

- **G12 (press freedom cannot be abolished).** Legally a bit simplified. Art. 5 GG is not itself
  listed in the "eternity clause" (Art. 79(3) GG), so whether a two-thirds amendment could remove
  press freedom is debated among lawyers (Art. 19(2) GG protects the essence of basic rights, and
  a free press is generally seen as part of the democracy principle that Art. 79(3) protects).
  For the test, option C is clearly the intended and best answer: option B is wrong anyway,
  since a constitutional change would also need two thirds of the Bundesrat (Art. 79(2) GG).
  The explanation says "protected against being removed by a parliamentary majority" and does not
  claim more than that.
- **G15 (Zwangsarbeit).** Art. 12(3) GG allows forced labour only as part of a deprivation of
  liberty ordered by a court; the explanation says so.
- **G19 (Freizügigkeit).** Art. 11 GG is a right of Germans ("Alle Deutschen"); the explanation
  says "Germans".
- **G35 (Sozialabgaben).** The federal budget also subsidises social insurance from taxes; the
  explanation says "mainly" paid by contributions.
- **G59 (1700 years).** The decree of 321 is the oldest *written record* of Jews in the area
  (Cologne). The explanation phrases it that way.
- **G57.** Electing a Bundestag President from the strongest group is parliamentary custom, not
  a written rule; the explanation says "by tradition".

## Batch 4: G61 to G130

**Disagreements with the verified answer: none.**

### Time-sensitive (why says "Check before the test"; facts checked on 27 Oct 2026)

| Question | Current fact (Oct 2026) | Source checked | Risk before 8 Dec 2026 |
|---|---|---|---|
| G72 Bundeskanzler | Friedrich Merz (CDU), elected 6 May 2025 | bundesregierung.de / bundeskanzler.de (Asia trip 26 to 30 Oct 2026) | Low |
| G73 größte Fraktionen | CDU/CSU 208, AfD 150 (2 MPs left the AfD group: 5 May 2025, 3 Mar 2026), SPD 120 | Bundestag Datenhandbuch ch. 5.4, wahlen-in-deutschland.de | Low (gap to SPD is 30 seats) |
| G75 Staatsoberhaupt | Frank-Walter Steinmeier; term ends 18 Mar 2027, Bundesversammlung on 30 Jan 2027 | bundestag.de, gesetze-im-internet.de (BVers18AnO), tagesschau.de | Low for 8 Dec 2026; the answer changes after 18 Mar 2027 |

If BAMF publishes a new catalogue before the test, re-run the data scripts and check these again.

### Nuance worth knowing (answer stays as is)

- **G99 (who pays social insurance).** True for health, pension, unemployment and care insurance;
  statutory accident insurance is paid by employers alone. The question's answer is the general rule.
- **G104 (dismissal during pregnancy).** The Mutterschutzgesetz protection also applies if the employer
  is told within two weeks after the dismissal; the explanation keeps to "if the employer knows".
- **G113 (most votes wins).** Simplified: seats are shared proportionally by Zweitstimmen, and the
  "winner" still needs a majority (often a coalition) to govern.
- **G117 / G121 / G123 (5%).** Exceptions exist: a party winning at least 3 constituencies also gets
  seats (Grundmandatsklausel, kept by the Bundesverfassungsgericht in 2024), and national-minority
  parties such as the SSW are exempt. The explanation for G117 says "normally".
- **G120 (Mehrheits- und Verhältniswahlrecht).** Since the 2023 electoral reform a constituency winner
  only gets the seat if it is covered by the party's Zweitstimmen, so the system is essentially
  proportional with a personal element. The official answer still matches the two-vote system.
- **G95 (Schulpflicht for "most" children).** In practice it applies to all children of school age.
- **G130.** Same note as in CONFLICTS.md: the online test centre shows a different ballot drawing than
  the 2025 PDF; the explanation describes the PDF picture (ballot 1 = one Erststimme for SPD, one
  Zweitstimme for CDU).

## Batch 5: G131 to G210

No disagreements with the verified answer key. No question in this range is time-sensitive: they cover law, courts and history (1933 to 1990), so none needs "check before the test". The four picture questions (G176, G181, G187, G209) were explained after viewing the images; tests check that each why describes its picture and that 16 history questions give the key date.

Nuance notes (answers unchanged):
- G173: "Gründungsmitglied der EU" is right in both senses: West Germany co-founded the EEC (Treaties of Rome, 1957) and was one of the 12 states that founded the EU in 1993. It joined NATO only in 1955 and the UN in 1973.
- G184: The UN resolution was Resolution 181 (29 Nov 1947), a partition plan; Israel declared independence on 14 May 1948. Historians debate how far a General Assembly recommendation is a "legal basis", but the catalogue answer is the UN option.
- G186: 17 June was West Germany's public holiday (Tag der deutschen Einheit) from 1954 to 1990.
- G204: Formally the DDR acceded to the Federal Republic (old Art. 23 GG) after the freely elected Volkskammer voted for it; the five Länder had been re-created just before. The catalogue wording "die fünf östlichen Bundesländer sind beigetreten" is the accepted simplification.
- G205: In 1990 the body was still the European Community; it became the EU in 1993.
- G181: Brandt also laid a wreath at the Tomb of the Unknown Soldier that day, which makes option D a real trap; the kneeling was at the Ghetto Heroes memorial.
- G201: The PDF has the typo "Niedersachen" in option D; kept as in the source.
