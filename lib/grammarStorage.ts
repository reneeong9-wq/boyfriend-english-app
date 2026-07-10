import { supabase } from "./supabase";

import type {
  GrammarNote,
  GrammarQuestion,
} from "../app/types/grammar";

interface GrammarNoteRow {
  id: string;
  owner_id: string;
  title: string;
  category: string;
  level: GrammarNote["level"];
  explanation: string;
  structure: string;
  example: string;
  example_translation: string;
  common_mistake: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface GrammarQuestionRow {
  id: string;
  owner_id: string;
  grammar_note_id: string | null;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  category: string;
  level: GrammarQuestion["level"];
  correct_count: number;
  wrong_count: number;
  created_at: string;
  updated_at: string;
}

interface NewGrammarNoteInput {
  title: string;
  category: string;
  level: GrammarNote["level"];
  explanation: string;
  structure: string;
  example: string;
  exampleTranslation: string;
  commonMistake: string;
  isFavorite?: boolean;
}

interface NewGrammarQuestionInput {
  grammarNoteId?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  level: GrammarQuestion["level"];
}

function mapNoteRowToGrammarNote(
  row: GrammarNoteRow,
): GrammarNote {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    level: row.level,
    explanation: row.explanation,
    structure: row.structure,
    example: row.example,
    exampleTranslation:
      row.example_translation,
    commonMistake: row.common_mistake,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
  };
}

function mapQuestionRowToGrammarQuestion(
  row: GrammarQuestionRow,
): GrammarQuestion {
  return {
    id: row.id,
    grammarNoteId:
      row.grammar_note_id ?? undefined,
    question: row.question,
    options: row.options,
    correctAnswer: row.correct_answer,
    explanation: row.explanation,
    category: row.category,
    level: row.level,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    createdAt: row.created_at,
  };
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(
      `無法取得登入使用者：${error.message}`,
    );
  }

  if (!user) {
    throw new Error(
      "尚未登入，請先登入後再使用雲端文法資料。",
    );
  }

  return user.id;
}

/* =========================
   Grammar notes
========================= */

export async function getGrammarNotes(): Promise<
  GrammarNote[]
> {
  const ownerId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("grammar_notes")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `讀取文法筆記失敗：${error.message}`,
    );
  }

  return (data as GrammarNoteRow[]).map(
    mapNoteRowToGrammarNote,
  );
}

export async function getGrammarNoteById(
  id: string,
): Promise<GrammarNote | undefined> {
  const ownerId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("grammar_notes")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `讀取文法筆記失敗：${error.message}`,
    );
  }

  if (!data) {
    return undefined;
  }

  return mapNoteRowToGrammarNote(
    data as GrammarNoteRow,
  );
}

export async function addGrammarNote(
  input: NewGrammarNoteInput,
): Promise<GrammarNote> {
  const ownerId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("grammar_notes")
    .insert({
      owner_id: ownerId,
      title: input.title.trim(),
      category: input.category,
      level: input.level,
      explanation: input.explanation.trim(),
      structure: input.structure.trim(),
      example: input.example.trim(),
      example_translation:
        input.exampleTranslation.trim(),
      common_mistake:
        input.commonMistake.trim(),
      is_favorite:
        input.isFavorite ?? false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `新增文法筆記失敗：${error.message}`,
    );
  }

  return mapNoteRowToGrammarNote(
    data as GrammarNoteRow,
  );
}

export async function updateGrammarNote(
  updatedNote: GrammarNote,
): Promise<GrammarNote> {
  const ownerId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("grammar_notes")
    .update({
      title: updatedNote.title.trim(),
      category: updatedNote.category,
      level: updatedNote.level,
      explanation:
        updatedNote.explanation.trim(),
      structure:
        updatedNote.structure.trim(),
      example: updatedNote.example.trim(),
      example_translation:
        updatedNote.exampleTranslation.trim(),
      common_mistake:
        updatedNote.commonMistake.trim(),
      is_favorite:
        updatedNote.isFavorite,
      updated_at: new Date().toISOString(),
    })
    .eq("id", updatedNote.id)
    .eq("owner_id", ownerId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `更新文法筆記失敗：${error.message}`,
    );
  }

  return mapNoteRowToGrammarNote(
    data as GrammarNoteRow,
  );
}

export async function deleteGrammarNote(
  id: string,
): Promise<void> {
  const ownerId = await getCurrentUserId();

  const { error } = await supabase
    .from("grammar_notes")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) {
    throw new Error(
      `刪除文法筆記失敗：${error.message}`,
    );
  }
}

export async function toggleGrammarNoteFavorite(
  id: string,
): Promise<GrammarNote> {
  const note = await getGrammarNoteById(id);

  if (!note) {
    throw new Error(
      "找不到要收藏的文法筆記。",
    );
  }

  return updateGrammarNote({
    ...note,
    isFavorite: !note.isFavorite,
  });
}

export async function getFavoriteGrammarNotes(): Promise<
  GrammarNote[]
> {
  const ownerId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("grammar_notes")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("is_favorite", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `讀取收藏文法失敗：${error.message}`,
    );
  }

  return (data as GrammarNoteRow[]).map(
    mapNoteRowToGrammarNote,
  );
}

/* =========================
   Grammar questions
========================= */

export async function getGrammarQuestions(): Promise<
  GrammarQuestion[]
> {
  const ownerId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("grammar_questions")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `讀取文法題目失敗：${error.message}`,
    );
  }

  return (data as GrammarQuestionRow[]).map(
    mapQuestionRowToGrammarQuestion,
  );
}

export async function getGrammarQuestionById(
  id: string,
): Promise<GrammarQuestion | undefined> {
  const ownerId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("grammar_questions")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `讀取文法題目失敗：${error.message}`,
    );
  }

  if (!data) {
    return undefined;
  }

  return mapQuestionRowToGrammarQuestion(
    data as GrammarQuestionRow,
  );
}

export async function addGrammarQuestion(
  input: NewGrammarQuestionInput,
): Promise<GrammarQuestion> {
  const ownerId = await getCurrentUserId();

  if (input.options.length !== 4) {
    throw new Error(
      "文法題目必須有四個選項。",
    );
  }

  const { data, error } = await supabase
    .from("grammar_questions")
    .insert({
      owner_id: ownerId,
      grammar_note_id:
        input.grammarNoteId ?? null,
      question: input.question.trim(),
      options: input.options.map(
        (option) => option.trim(),
      ),
      correct_answer:
        input.correctAnswer.trim(),
      explanation:
        input.explanation.trim(),
      category: input.category,
      level: input.level,
      correct_count: 0,
      wrong_count: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `新增文法題目失敗：${error.message}`,
    );
  }

  return mapQuestionRowToGrammarQuestion(
    data as GrammarQuestionRow,
  );
}

export async function updateGrammarQuestion(
  updatedQuestion: GrammarQuestion,
): Promise<GrammarQuestion> {
  const ownerId = await getCurrentUserId();

  if (updatedQuestion.options.length !== 4) {
    throw new Error(
      "文法題目必須有四個選項。",
    );
  }

  const { data, error } = await supabase
    .from("grammar_questions")
    .update({
      grammar_note_id:
        updatedQuestion.grammarNoteId ?? null,
      question:
        updatedQuestion.question.trim(),
      options:
        updatedQuestion.options.map(
          (option) => option.trim(),
        ),
      correct_answer:
        updatedQuestion.correctAnswer.trim(),
      explanation:
        updatedQuestion.explanation.trim(),
      category: updatedQuestion.category,
      level: updatedQuestion.level,
      correct_count:
        updatedQuestion.correctCount,
      wrong_count:
        updatedQuestion.wrongCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", updatedQuestion.id)
    .eq("owner_id", ownerId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `更新文法題目失敗：${error.message}`,
    );
  }

  return mapQuestionRowToGrammarQuestion(
    data as GrammarQuestionRow,
  );
}

export async function deleteGrammarQuestion(
  id: string,
): Promise<void> {
  const ownerId = await getCurrentUserId();

  const { error } = await supabase
    .from("grammar_questions")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) {
    throw new Error(
      `刪除文法題目失敗：${error.message}`,
    );
  }
}

export async function recordGrammarAnswer(
  id: string,
  isCorrect: boolean,
): Promise<GrammarQuestion> {
  const question =
    await getGrammarQuestionById(id);

  if (!question) {
    throw new Error(
      "找不到要更新的文法題目。",
    );
  }

  return updateGrammarQuestion({
    ...question,
    correctCount: isCorrect
      ? question.correctCount + 1
      : question.correctCount,
    wrongCount: isCorrect
      ? question.wrongCount
      : question.wrongCount + 1,
  });
}

export async function resetGrammarMistakes(
  id?: string,
): Promise<void> {
  const ownerId = await getCurrentUserId();

  let query = supabase
    .from("grammar_questions")
    .update({
      wrong_count: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("owner_id", ownerId);

  if (id) {
    query = query.eq("id", id);
  }

  const { error } = await query;

  if (error) {
    throw new Error(
      `清除文法錯題失敗：${error.message}`,
    );
  }
}

export async function getMistakeGrammarQuestions(): Promise<
  GrammarQuestion[]
> {
  const ownerId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("grammar_questions")
    .select("*")
    .eq("owner_id", ownerId)
    .gt("wrong_count", 0)
    .order("wrong_count", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `讀取文法錯題失敗：${error.message}`,
    );
  }

  return (data as GrammarQuestionRow[]).map(
    mapQuestionRowToGrammarQuestion,
  );
}