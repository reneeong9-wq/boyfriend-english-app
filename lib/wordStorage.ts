import { supabase } from "./supabase";
import type {
  Word,
  WordStatus,
} from "../app/types/word";

interface WordRow {
  id: string;
  owner_id: string;
  word: string;
  meaning: string;
  part_of_speech: string;
  example: string;
  example_translation: string;
  category: string;
  level: Word["level"];
  status: WordStatus;
  is_favorite: boolean;
  correct_count: number;
  wrong_count: number;
  created_at: string;
  updated_at: string;
}

interface NewWordInput {
  word: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
  category: string;
  level: Word["level"];
  status?: WordStatus;
  isFavorite?: boolean;
}

function mapRowToWord(row: WordRow): Word {
  return {
    id: row.id,
    word: row.word,
    meaning: row.meaning,
    partOfSpeech: row.part_of_speech,
    example: row.example,
    exampleTranslation:
      row.example_translation,
    category: row.category,
    level: row.level,
    status: row.status,
    isFavorite: row.is_favorite,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    createdAt: row.created_at,
  };
}

function mapWordToDatabase(
  word: Word,
): Omit<
  WordRow,
  "owner_id" | "created_at" | "updated_at"
> {
  return {
    id: word.id,
    word: word.word,
    meaning: word.meaning,
    part_of_speech: word.partOfSpeech,
    example: word.example,
    example_translation:
      word.exampleTranslation,
    category: word.category,
    level: word.level,
    status: word.status,
    is_favorite: word.isFavorite,
    correct_count: word.correctCount,
    wrong_count: word.wrongCount,
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
      "尚未登入，請先登入後再使用雲端單字庫。",
    );
  }

  return user.id;
}

export async function getWords(): Promise<Word[]> {
  const ownerId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("words")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `讀取單字失敗：${error.message}`,
    );
  }

  return (data as WordRow[]).map(
    mapRowToWord,
  );
}

export async function getWordById(
  id: string,
): Promise<Word | undefined> {
  const ownerId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("words")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `讀取單字失敗：${error.message}`,
    );
  }

  if (!data) {
    return undefined;
  }

  return mapRowToWord(data as WordRow);
}

export async function addWord(
  input: NewWordInput,
): Promise<Word> {
  const ownerId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("words")
    .insert({
      owner_id: ownerId,
      word: input.word.trim(),
      meaning: input.meaning.trim(),
      part_of_speech: input.partOfSpeech,
      example: input.example.trim(),
      example_translation:
        input.exampleTranslation.trim(),
      category: input.category,
      level: input.level,
      status: input.status ?? "new",
      is_favorite:
        input.isFavorite ?? false,
      correct_count: 0,
      wrong_count: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `新增單字失敗：${error.message}`,
    );
  }

  return mapRowToWord(data as WordRow);
}

export async function updateWord(
  updatedWord: Word,
): Promise<Word> {
  const ownerId = await getCurrentUserId();

  const databaseWord =
    mapWordToDatabase(updatedWord);

  const { data, error } = await supabase
    .from("words")
    .update({
      word: databaseWord.word,
      meaning: databaseWord.meaning,
      part_of_speech:
        databaseWord.part_of_speech,
      example: databaseWord.example,
      example_translation:
        databaseWord.example_translation,
      category: databaseWord.category,
      level: databaseWord.level,
      status: databaseWord.status,
      is_favorite:
        databaseWord.is_favorite,
      correct_count:
        databaseWord.correct_count,
      wrong_count:
        databaseWord.wrong_count,
      updated_at: new Date().toISOString(),
    })
    .eq("id", updatedWord.id)
    .eq("owner_id", ownerId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `更新單字失敗：${error.message}`,
    );
  }

  return mapRowToWord(data as WordRow);
}

export async function deleteWord(
  id: string,
): Promise<void> {
  const ownerId = await getCurrentUserId();

  const { error } = await supabase
    .from("words")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) {
    throw new Error(
      `刪除單字失敗：${error.message}`,
    );
  }
}

export async function recordAnswer(
  id: string,
  isCorrect: boolean,
): Promise<Word> {
  const word = await getWordById(id);

  if (!word) {
    throw new Error("找不到要更新的單字。");
  }

  const updatedWord: Word = {
    ...word,
    status:
      word.status === "new"
        ? "learning"
        : word.status,
    correctCount: isCorrect
      ? word.correctCount + 1
      : word.correctCount,
    wrongCount: isCorrect
      ? word.wrongCount
      : word.wrongCount + 1,
  };

  return updateWord(updatedWord);
}

export async function resetWordMistakes(
  id?: string,
): Promise<void> {
  const ownerId = await getCurrentUserId();

  let query = supabase
    .from("words")
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
      `清除錯題紀錄失敗：${error.message}`,
    );
  }
}

export async function toggleWordFavorite(
  id: string,
): Promise<Word> {
  const word = await getWordById(id);

  if (!word) {
    throw new Error("找不到要收藏的單字。");
  }

  return updateWord({
    ...word,
    isFavorite: !word.isFavorite,
  });
}

export async function getFavoriteWords(): Promise<
  Word[]
> {
  const ownerId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("words")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("is_favorite", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `讀取收藏單字失敗：${error.message}`,
    );
  }

  return (data as WordRow[]).map(
    mapRowToWord,
  );
}

export async function getMistakeWords(): Promise<
  Word[]
> {
  const ownerId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("words")
    .select("*")
    .eq("owner_id", ownerId)
    .gt("wrong_count", 0)
    .order("wrong_count", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `讀取錯題單字失敗：${error.message}`,
    );
  }

  return (data as WordRow[]).map(
    mapRowToWord,
  );
}