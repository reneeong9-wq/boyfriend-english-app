import { getWords, saveWords } from "./wordStorage";
import {
  getGrammarNotes,
  getGrammarQuestions,
  saveGrammarNotes,
  saveGrammarQuestions,
} from "./grammarStorage";
import type { Word } from "../app/types/word";
import type {
  GrammarNote,
  GrammarQuestion,
} from "../app/types/grammar";

export interface BackupData {
  version: 1;
  exportedAt: string;
  words: Word[];
  grammarNotes: GrammarNote[];
  grammarQuestions: GrammarQuestion[];
}

export function createBackup(): BackupData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    words: getWords(),
    grammarNotes: getGrammarNotes(),
    grammarQuestions:
      getGrammarQuestions(),
  };
}

export function downloadBackup(): void {
  const backup = createBackup();

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

export function restoreBackup(
  backup: BackupData,
): void {
  if (
    backup.version !== 1 ||
    !Array.isArray(backup.words) ||
    !Array.isArray(backup.grammarNotes) ||
    !Array.isArray(backup.grammarQuestions)
  ) {
    throw new Error("備份檔格式不正確。");
  }

  saveWords(backup.words);
  saveGrammarNotes(backup.grammarNotes);
  saveGrammarQuestions(
    backup.grammarQuestions,
  );
}