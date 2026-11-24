import { z } from "zod";
import type { KV } from "./storage";

export const LOCALE_KEY = "einb-trainer.locale.v1";
export const LocaleSchema = z.enum(["en", "de"]);
export type Locale = z.infer<typeof LocaleSchema>;
export const LOCALES: readonly Locale[] = ["en", "de"];

export interface UIStrings {
  language: string;
  localeEn: string;
  localeDe: string;
  documentTitle: string;
  metaDescription: string;
  brandTitle: string;
  brandSub: string;
  testDateTitle: string;
  daysToGo: string;
  daysToGoOne: string;
  navMain: string;
  navHome: string;
  navPractice: string;
  navMock: string;
  navWeak: string;
  navProgress: string;
  theme: string;
  themeFollowingDevice: string;
  changeTheme: string;
  animatedBackground: string;
  animatedBackgroundReduced: string;
  loadError: string;
  loadErrorKept: string;
  footer: string;
  pageNotFound: string;
  homeEyebrow: string;
  homeTitle: string;
  homeIntro: string;
  kpiSeen: string;
  kpiLearned: string;
  kpiWeak: string;
  homePracticeEyebrow: string;
  homePracticeTitle: string;
  homePracticeText: string;
  homeExamEyebrow: string;
  homeExamTitle: string;
  homeExamText: string;
  homeWeakEyebrow: string;
  homeWeakTitle: string;
  homeWeakText: string;
  homeProgressEyebrow: string;
  homeProgressTitle: string;
  homeProgressText: string;
  practiceEyebrow: string;
  practiceTitle: string;
  practiceIntro: string;
  practiceSetAll: string;
  practiceSetBrandenburg: string;
  practiceSetImages: string;
  practiceStats: string;
  practiceStatsWeak: string;
  unknownSet: string;
  setFinished: string;
  setScore: string;
  backToTopics: string;
  practiceProgress: string;
  back: string;
  skip: string;
  next: string;
  topicBarLabel: string;
  mockEyebrow: string;
  mockTitle: string;
  mockIntro: string;
  startMock: string;
  timeLeft: string;
  mockAnswered: string;
  questionOf: string;
  questionN: string;
  questionNAnswered: string;
  allQuestionsFinishEarly: string;
  finishTest: string;
  finishTestNow: string;
  finishConfirm: string;
  result: string;
  passed: string;
  notPassed: string;
  resultMeta: string;
  newMock: string;
  reviewMistakes: string;
  noMistakes: string;
  weakEyebrow: string;
  weakTitle: string;
  weakIntro: string;
  weakEmpty: string;
  practiseWeak: string;
  colQuestion: string;
  colWrong: string;
  colStreak: string;
  weakCleared: string;
  weakNone: string;
  weakClearedText: string;
  weakNothing: string;
  inARow: string;
  backPlain: string;
  weakBackLink: string;
  weakSessionProgress: string;
  progressEyebrow: string;
  progressTitle: string;
  progressLegend: string;
  progressLegendMid: string;
  overall: string;
  overallLearned: string;
  progressStats: string;
  progressAccuracy: string;
  appearance: string;
  resetProgress: string;
  resetConfirm: string;
  pictureAlt: string;
  yourAnswer: string;
  correctFlag: string;
  correctFeedback: string;
  notQuite: string;
  notAnswered: string;
  explanation: string;
  why: string;
  trap: string;
  trick: string;
  enlargePicture: string;
  enlargedPicture: string;
  closePicture: string;
  brandenburgBadge: string;
  numberBadge: string;
}

export const STRINGS: Record<Locale, UIStrings> = {
  en: {
    language: "Language",
    localeEn: "EN",
    localeDe: "DE",
    documentTitle: "Einbürgerungstest Trainer",
    metaDescription:
      "Study app for the German Einbürgerungstest (Leben in Deutschland), Brandenburg.",
    brandTitle: "Einbürgerungstest Trainer",
    brandSub: "Leben in Deutschland · Brandenburg",
    testDateTitle: "Test date: 8 Dec 2026",
    daysToGo: "{days} days to go",
    daysToGoOne: "1 day to go",
    navMain: "Main navigation",
    navHome: "Home",
    navPractice: "Practice",
    navMock: "Mock test",
    navWeak: "Weak spots",
    navProgress: "Progress",
    theme: "Theme",
    themeFollowingDevice: "Theme (following your device)",
    changeTheme: "Change theme",
    animatedBackground: "Animated background",
    animatedBackgroundReduced: "Animated background (reduced motion is on)",
    loadError: "Saved progress could not be read.",
    loadErrorKept: "It was kept unchanged under {key}. Starting with empty progress.",
    footer: "Questions: BAMF Gesamtfragenkatalog. Explanations are study help, not official.",
    pageNotFound: "Page not found.",
    homeEyebrow: "Test on 8 Dec 2026 · Brandenburg",
    homeTitle: "Pass the Einbürgerungstest",
    homeIntro:
      "All 310 official questions (300 general + 10 Brandenburg). In the real test you get {total} questions in 60 minutes and need {pass} right.",
    kpiSeen: "Seen",
    kpiLearned: "Learned",
    kpiWeak: "Weak",
    homePracticeEyebrow: "Practice",
    homePracticeTitle: "By topic",
    homePracticeText: "Instant feedback with the correct answer.",
    homeExamEyebrow: "Exam mode",
    homeExamTitle: "Mock test",
    homeExamText: "33 questions, 60 minutes, pass mark 17.",
    homeWeakEyebrow: "Repeat",
    homeWeakTitle: "Weak spots",
    homeWeakText: "Questions you got wrong, until you get them right twice in a row.",
    homeProgressEyebrow: "Overview",
    homeProgressTitle: "Progress",
    homeProgressText: "See how far you are in each topic.",
    practiceEyebrow: "Practice",
    practiceTitle: "Choose a topic",
    practiceIntro: "Questions you haven't seen yet come first. You see the right answer straight away.",
    practiceSetAll: "All 310 questions",
    practiceSetBrandenburg: "Brandenburg (10 state questions)",
    practiceSetImages: "Picture questions",
    practiceStats: "{mastered} learned · {seen} seen",
    practiceStatsWeak: " · {weak} weak",
    unknownSet: "Unknown practice set.",
    setFinished: "Set finished 🎉",
    setScore: "{right} of {done} correct.",
    backToTopics: "Back to topics",
    practiceProgress: "{pos}/{total} · {right}/{done} correct",
    back: "← Back",
    skip: "Skip →",
    next: "Next →",
    topicBarLabel: "{mastered} of {total} learned",
    mockEyebrow: "Mock test",
    mockTitle: "Like the real exam",
    mockIntro:
      "{total} questions: 30 random general questions + 3 Brandenburg questions. 60 minutes. You pass with {pass} correct answers. You only see the results at the end.",
    startMock: "Start mock test",
    timeLeft: "Time left",
    mockAnswered: "{answered}/{total} answered",
    questionOf: "Question {n} of {total}",
    questionN: "Question {n}",
    questionNAnswered: "Question {n}, answered",
    allQuestionsFinishEarly: "All questions · finish early",
    finishTest: "Finish test",
    finishTestNow: "Finish test now",
    finishConfirm: "{open} question(s) not answered yet. Finish anyway?",
    result: "Result",
    passed: "Passed ✓",
    notPassed: "Not passed yet",
    resultMeta: "Pass mark {pass} · time {time} · {answered} answered",
    newMock: "New mock test",
    reviewMistakes: "Review of mistakes",
    noMistakes: "No mistakes. Excellent!",
    weakEyebrow: "Weak spots",
    weakTitle: "Questions to repeat",
    weakIntro: "A question stays here until you answer it right {streak} times in a row.",
    weakEmpty: "No weak spots right now. Practise or take a mock test, and anything you get wrong shows up here.",
    practiseWeak: "Practise weak spots ({count})",
    colQuestion: "Question",
    colWrong: "Wrong",
    colStreak: "Streak",
    weakCleared: "All weak spots cleared 🎉",
    weakNone: "No weak spots",
    weakClearedText: "You answered all {total} questions right twice in a row.",
    weakNothing: "Nothing to repeat right now.",
    inARow: "In a row: {run}/{streak}",
    backPlain: "Back",
    weakBackLink: "← Weak spots",
    weakSessionProgress: "{cleared}/{total} cleared · {left} left",
    progressEyebrow: "Progress",
    progressTitle: "By topic",
    progressLegend: "{learned} = right 2× in a row · {seen} · {weak}",
    progressLegendMid: "= right 2× in a row ·",
    overall: "Overall",
    overallLearned: "{mastered}/{total} learned",
    progressStats: "{seen} seen · {weak} weak",
    progressAccuracy: "{seen} seen · {weak} weak · accuracy {accuracy}",
    appearance: "Appearance",
    resetProgress: "Reset progress",
    resetConfirm: "Delete all saved progress on this device?",
    pictureAlt: "Picture for question {id}",
    yourAnswer: "Your answer",
    correctFlag: "Correct",
    correctFeedback: "Correct!",
    notQuite: "Not quite. The correct answer is {key}.",
    notAnswered: "Not answered. The correct answer is {key}.",
    explanation: "Explanation",
    why: "Why",
    trap: "Trap",
    trick: "Trick",
    enlargePicture: "Enlarge picture: {alt}",
    enlargedPicture: "Enlarged picture",
    closePicture: "Close enlarged picture",
    brandenburgBadge: "Brandenburg {n}",
    numberBadge: "Nr. {n}",
  },
  de: {
    language: "Sprache",
    localeEn: "EN",
    localeDe: "DE",
    documentTitle: "Einbürgerungstest-Trainer",
    metaDescription:
      "Lern-App für den Einbürgerungstest (Leben in Deutschland), Brandenburg.",
    brandTitle: "Einbürgerungstest-Trainer",
    brandSub: "Leben in Deutschland · Brandenburg",
    testDateTitle: "Prüfungstermin: 8. Dez. 2026",
    daysToGo: "noch {days} Tage",
    daysToGoOne: "noch 1 Tag",
    navMain: "Hauptnavigation",
    navHome: "Start",
    navPractice: "Üben",
    navMock: "Probetest",
    navWeak: "Schwachstellen",
    navProgress: "Fortschritt",
    theme: "Design",
    themeFollowingDevice: "Design (folgt dem Gerät)",
    changeTheme: "Design ändern",
    animatedBackground: "Animierter Hintergrund",
    animatedBackgroundReduced: "Animierter Hintergrund (reduzierte Bewegung ist an)",
    loadError: "Der gespeicherte Fortschritt konnte nicht gelesen werden.",
    loadErrorKept: "Er wurde unverändert unter {key} aufbewahrt. Es geht mit leerem Fortschritt weiter.",
    footer: "Fragen: BAMF-Gesamtfragenkatalog. Erklärungen sind Lernhilfe, nicht amtlich.",
    pageNotFound: "Seite nicht gefunden.",
    homeEyebrow: "Prüfung am 8. Dez. 2026 · Brandenburg",
    homeTitle: "Bestehe den Einbürgerungstest",
    homeIntro:
      "Alle 310 amtlichen Fragen (300 allgemein + 10 Brandenburg). In der echten Prüfung bekommst du {total} Fragen in 60 Minuten und brauchst {pass} richtige Antworten.",
    kpiSeen: "Gesehen",
    kpiLearned: "Gelernt",
    kpiWeak: "Schwach",
    homePracticeEyebrow: "Üben",
    homePracticeTitle: "Nach Thema",
    homePracticeText: "Sofortiges Feedback mit der richtigen Antwort.",
    homeExamEyebrow: "Prüfungsmodus",
    homeExamTitle: "Probetest",
    homeExamText: "33 Fragen, 60 Minuten, Bestehensgrenze 17.",
    homeWeakEyebrow: "Wiederholen",
    homeWeakTitle: "Schwachstellen",
    homeWeakText: "Fragen, die du falsch hattest, bis du sie zweimal hintereinander richtig beantwortest.",
    homeProgressEyebrow: "Überblick",
    homeProgressTitle: "Fortschritt",
    homeProgressText: "Sieh, wie weit du in jedem Thema bist.",
    practiceEyebrow: "Üben",
    practiceTitle: "Thema wählen",
    practiceIntro: "Ungesehene Fragen kommen zuerst. Die richtige Antwort siehst du sofort.",
    practiceSetAll: "Alle 310 Fragen",
    practiceSetBrandenburg: "Brandenburg (10 Landesfragen)",
    practiceSetImages: "Bildfragen",
    practiceStats: "{mastered} gelernt · {seen} gesehen",
    practiceStatsWeak: " · {weak} schwach",
    unknownSet: "Unbekannter Übungsordner.",
    setFinished: "Ordner geschafft 🎉",
    setScore: "{right} von {done} richtig.",
    backToTopics: "Zurück zu den Themen",
    practiceProgress: "{pos}/{total} · {right}/{done} richtig",
    back: "← Zurück",
    skip: "Überspringen →",
    next: "Weiter →",
    topicBarLabel: "{mastered} von {total} gelernt",
    mockEyebrow: "Probetest",
    mockTitle: "Wie in der echten Prüfung",
    mockIntro:
      "{total} Fragen: 30 zufällige allgemeine Fragen + 3 Brandenburg-Fragen. 60 Minuten. Du bestehst mit {pass} richtigen Antworten. Die Auswertung siehst du erst am Ende.",
    startMock: "Probetest starten",
    timeLeft: "Verbleibende Zeit",
    mockAnswered: "{answered}/{total} beantwortet",
    questionOf: "Frage {n} von {total}",
    questionN: "Frage {n}",
    questionNAnswered: "Frage {n}, beantwortet",
    allQuestionsFinishEarly: "Alle Fragen · früher beenden",
    finishTest: "Test beenden",
    finishTestNow: "Test jetzt beenden",
    finishConfirm: "{open} Frage(n) noch nicht beantwortet. Trotzdem beenden?",
    result: "Ergebnis",
    passed: "Bestanden ✓",
    notPassed: "Noch nicht bestanden",
    resultMeta: "Bestehensgrenze {pass} · Zeit {time} · {answered} beantwortet",
    newMock: "Neuer Probetest",
    reviewMistakes: "Fehlerüberblick",
    noMistakes: "Keine Fehler. Sehr gut!",
    weakEyebrow: "Schwachstellen",
    weakTitle: "Fragen zum Wiederholen",
    weakIntro: "Eine Frage bleibt hier, bis du sie {streak}-mal hintereinander richtig beantwortest.",
    weakEmpty:
      "Gerade keine Schwachstellen. Übe oder mach einen Probetest; falsch beantwortete Fragen erscheinen hier.",
    practiseWeak: "Schwachstellen üben ({count})",
    colQuestion: "Frage",
    colWrong: "Falsch",
    colStreak: "Serie",
    weakCleared: "Alle Schwachstellen geschafft 🎉",
    weakNone: "Keine Schwachstellen",
    weakClearedText: "Du hast alle {total} Fragen zweimal hintereinander richtig beantwortet.",
    weakNothing: "Gerade nichts zu wiederholen.",
    inARow: "In Folge: {run}/{streak}",
    backPlain: "Zurück",
    weakBackLink: "← Schwachstellen",
    weakSessionProgress: "{cleared}/{total} geschafft · {left} übrig",
    progressEyebrow: "Fortschritt",
    progressTitle: "Nach Thema",
    progressLegend: "{learned} = 2× hintereinander richtig · {seen} · {weak}",
    progressLegendMid: "= 2× hintereinander richtig ·",
    overall: "Gesamt",
    overallLearned: "{mastered}/{total} gelernt",
    progressStats: "{seen} gesehen · {weak} schwach",
    progressAccuracy: "{seen} gesehen · {weak} schwach · Trefferquote {accuracy}",
    appearance: "Darstellung",
    resetProgress: "Fortschritt zurücksetzen",
    resetConfirm: "Allen gespeicherten Fortschritt auf diesem Gerät löschen?",
    pictureAlt: "Bild zu Frage {id}",
    yourAnswer: "Deine Antwort",
    correctFlag: "Richtig",
    correctFeedback: "Richtig!",
    notQuite: "Leider falsch. Richtig ist {key}.",
    notAnswered: "Nicht beantwortet. Richtig ist {key}.",
    explanation: "Erklärung",
    why: "Warum",
    trap: "Falle",
    trick: "Tipp",
    enlargePicture: "Bild vergrößern: {alt}",
    enlargedPicture: "Vergrößertes Bild",
    closePicture: "Vergrößertes Bild schließen",
    brandenburgBadge: "Brandenburg {n}",
    numberBadge: "Nr. {n}",
  },
};

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(vars, key) ? String(vars[key]) : match,
  );
}

export function loadLocale(kv: KV): Locale {
  const raw = kv.getItem(LOCALE_KEY);
  if (!raw) return "en";
  try {
    const parsed = LocaleSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : "en";
  } catch {
    return "en";
  }
}

export function saveLocale(kv: KV, locale: Locale): void {
  kv.setItem(LOCALE_KEY, JSON.stringify(LocaleSchema.parse(locale)));
}

export function applyLocale(locale: Locale, root: HTMLElement = document.documentElement): void {
  root.lang = locale;
  const strings = STRINGS[locale];
  document.title = strings.documentTitle;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", strings.metaDescription);
}

export function practiceSetTitle(key: string, t: UIStrings, officialTitle: string): string {
  if (key === "all") return t.practiceSetAll;
  if (key === "brandenburg") return t.practiceSetBrandenburg;
  if (key === "images") return t.practiceSetImages;
  return officialTitle;
}
