import raw from "../../data/questions.json";
import { QuestionsFileSchema, type Question, type Topic } from "@/schema";

export const DATA = QuestionsFileSchema.parse(raw);
export const QUESTIONS: readonly Question[] = DATA.questions;
export const BY_ID: ReadonlyMap<string, Question> = new Map(QUESTIONS.map((q) => [q.id, q]));

export const TOPIC_LABEL: Record<Topic, string> = {
  "Politik/Demokratie": "Politics & democracy",
  Geschichte: "History",
  Gesellschaft: "Society",
  Recht: "Law & basic rights",
  Bundesländer: "Federal states & Brandenburg",
  Europa: "Europe",
  Wahlen: "Elections",
  Alltag: "Everyday life",
};

export function imageUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
