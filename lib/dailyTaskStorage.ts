import type { DailyTaskData } from "../app/types/dailyTask";

const STORAGE_KEY =
  "mengze-english-daily-task";

function getTodayString(): string {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(
      2,
      "0",
    ),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}

function createEmptyDailyTask(): DailyTaskData {
  return {
    date: getTodayString(),
    vocabularyAnswered: 0,
    grammarAnswered: 0,
    mistakeReviewed: false,
  };
}

export function getDailyTask(): DailyTaskData {
  if (typeof window === "undefined") {
    return createEmptyDailyTask();
  }

  const saved = window.localStorage.getItem(
    STORAGE_KEY,
  );

  if (!saved) {
    const emptyTask = createEmptyDailyTask();

    saveDailyTask(emptyTask);
    return emptyTask;
  }

  try {
    const task =
      JSON.parse(saved) as DailyTaskData;

    if (task.date !== getTodayString()) {
      const emptyTask =
        createEmptyDailyTask();

      saveDailyTask(emptyTask);
      return emptyTask;
    }

    return task;
  } catch {
    const emptyTask = createEmptyDailyTask();

    saveDailyTask(emptyTask);
    return emptyTask;
  }
}

export function saveDailyTask(
  task: DailyTaskData,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(task),
  );
}

export function recordVocabularyPractice(): void {
  const task = getDailyTask();

  saveDailyTask({
    ...task,
    vocabularyAnswered:
      task.vocabularyAnswered + 1,
  });
}

export function recordGrammarPractice(): void {
  const task = getDailyTask();

  saveDailyTask({
    ...task,
    grammarAnswered:
      task.grammarAnswered + 1,
  });
}

export function recordMistakeReview(): void {
  const task = getDailyTask();

  saveDailyTask({
    ...task,
    mistakeReviewed: true,
  });
}