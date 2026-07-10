export interface GrammarNote {
    id: string;
    title: string;
    category: string;
    level: "A1" | "A2" | "B1" | "B2" | "C1";
    explanation: string;
    structure: string;
    example: string;
    exampleTranslation: string;
    commonMistake: string;
    isFavorite: boolean;
    createdAt: string;
  }
  
  export interface GrammarQuestion {
    id: string;
    grammarNoteId?: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    level: "A1" | "A2" | "B1" | "B2" | "C1";
    category: string;
    correctCount: number;
    wrongCount: number;
    createdAt: string;
  }