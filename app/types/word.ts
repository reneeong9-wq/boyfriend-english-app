export type WordStatus =
  | "new"
  | "learning"
  | "mastered";

export interface Word {
  id: string;
  word: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
  category: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  status: WordStatus;
  isFavorite: boolean;
  correctCount: number;
  wrongCount: number;
  createdAt: string;
}