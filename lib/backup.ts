import { getWords } from "./wordStorage";

import {
  getGrammarNotes,
  getGrammarQuestions,
} from "./grammarStorage";

import type { Word } from "../app/types/word";

import type {
  GrammarNote,
  GrammarQuestion,
} from "../app/types/grammar";

export interface BackupData {
  version: 2;
  exportedAt: string;
  words: Word[];
  grammarNotes: GrammarNote[];
  grammarQuestions: GrammarQuestion[];
}

export async function createBackup(): Promise<BackupData> {
  const [
    words,
    grammarNotes,
    grammarQuestions,
  ] = await Promise.all([
    getWords(),
    getGrammarNotes(),
    getGrammarQuestions(),
  ]);

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    words,
    grammarNotes,
    grammarQuestions,
  };
}

export async function downloadBackup(): Promise<void> {
  const backup = await createBackup();

  const file = new Blob(
    [JSON.stringify(backup, null, 2)],
    {
      type: "application/json",
    },
  );

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = `mengze-english-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}