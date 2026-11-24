# Learning notes

Short explanations of the ideas this project actually uses, and why they matter. Each one points at a file.

## Dual-source verification

Every answer has to be confirmed by two independent sources (the BAMF Online-Testcenter and einbuergerungstest-online.de), matched by option text, not by position. `verified: true` is not a free-form flag: a zod `superRefine` in `src/schema.ts` refuses it unless at least two sources agree with `answerIndex`. That keeps a scrape mismatch from being marked as settled.

See `src/schema.ts` and the answer-key section of the README.

## Content tests, not only unit tests

The 310 questions are data, so they need the same kind of checks as code. `tests/questions.test.ts` requires four distinct options, a real image file for picture questions, and a why / trap / trick explanation on every item. Time-sensitive answers (who is in office, current figures) must name the right answer with an "As of" date, so a stale fact cannot hide behind a passing suite.

See `tests/questions.test.ts`.

## Seeded shuffle

A mock test has to be random for the user and reproducible in tests. The composition uses a small mulberry32 PRNG and a Fisher-Yates shuffle, both seeded, so the same seed always produces the same 33 questions. That is why a failing test can be replayed instead of being a one-off.

See `src/lib/random.ts`.

## Storage backups

Progress lives in `localStorage`. If the stored JSON is corrupt, overwriting it would throw the user's history away. `src/lib/storage.ts` validates the payload with zod; on failure it copies the raw value to a `.backup-<timestamp>` key and starts fresh with a warning, so the old data can still be recovered.

See `src/lib/storage.ts`.
