import type { Question, Topic } from "@/schema";
import { TOPICS } from "@/schema";

export const TOPIC_SLUG: Record<Topic, string> = {
  "Politik/Demokratie": "politik",
  Geschichte: "geschichte",
  Gesellschaft: "gesellschaft",
  Recht: "recht",
  Bundesländer: "bundeslaender",
  Europa: "europa",
  Wahlen: "wahlen",
  Alltag: "alltag",
};

export type PracticeSet = { key: string; title: string; filter: (q: Question) => boolean };

export const PRACTICE_SETS: PracticeSet[] = [
  { key: "all", title: "All 310 questions", filter: () => true },
  { key: "brandenburg", title: "Brandenburg (10 state questions)", filter: (q) => q.section === "state" },
  { key: "images", title: "Picture questions", filter: (q) => !!q.image },
  ...TOPICS.map((t) => ({ key: TOPIC_SLUG[t], title: t, filter: (q: Question) => q.topic === t })),
];

export const practiceSet = (key: string) => PRACTICE_SETS.find((s) => s.key === key);
