import type { Word } from "../app/types/word";

export interface QuizQuestion {
  word: Word;
  options: string[];
  correctAnswer: string;
}

export function shuffleArray<T>(items: T[]): T[] {
  const copiedItems = [...items];

  for (let index = copiedItems.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [copiedItems[index], copiedItems[randomIndex]] = [
      copiedItems[randomIndex],
      copiedItems[index],
    ];
  }

  return copiedItems;
}

export function createQuizQuestions(
  words: Word[],
  questionCount = 10,
): QuizQuestion[] {
  if (words.length < 4) {
    return [];
  }

  const selectedWords = shuffleArray(words).slice(
    0,
    Math.min(questionCount, words.length),
  );

  return selectedWords.map((currentWord) => {
    const wrongAnswers = shuffleArray(
      words.filter(
        (item) => item.id !== currentWord.id,
      ),
    )
      .slice(0, 3)
      .map((item) => item.meaning);

    const options = shuffleArray([
      currentWord.meaning,
      ...wrongAnswers,
    ]);

    return {
      word: currentWord,
      options,
      correctAnswer: currentWord.meaning,
    };
  });
}