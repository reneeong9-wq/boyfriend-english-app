"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  getWordById,
  updateWord,
} from "../../../../lib/wordStorage";
import type { Word } from "../../../types/word";

interface FormData {
  word: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
  category: string;
  level: Word["level"];
}

const emptyForm: FormData = {
  word: "",
  meaning: "",
  partOfSpeech: "noun",
  example: "",
  exampleTranslation: "",
  category: "日常英文",
  level: "B1",
};

export default function EditWordPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [originalWord, setOriginalWord] =
    useState<Word | null>(null);

  const [form, setForm] =
    useState<FormData>(emptyForm);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWord() {
      try {
        const foundWord =
          await getWordById(params.id);

        if (foundWord) {
          setOriginalWord(foundWord);

          setForm({
            word: foundWord.word,
            meaning: foundWord.meaning,
            partOfSpeech:
              foundWord.partOfSpeech,
            example: foundWord.example,
            exampleTranslation:
              foundWord.exampleTranslation,
            category: foundWord.category,
            level: foundWord.level,
          });
        }
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "讀取單字失敗。",
        );
      } finally {
        setIsLoaded(true);
      }
    }

    void loadWord();
  }, [params.id]);

  function updateField<
    K extends keyof FormData,
  >(
    field: K,
    value: FormData[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!originalWord) {
      return;
    }

    if (
      !form.word.trim() ||
      !form.meaning.trim()
    ) {
      setError(
        "請填寫英文單字與中文意思。",
      );
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const updatedWord =
        await updateWord({
          ...originalWord,
          word: form.word.trim(),
          meaning: form.meaning.trim(),
          partOfSpeech:
            form.partOfSpeech,
          example: form.example.trim(),
          exampleTranslation:
            form.exampleTranslation.trim(),
          category: form.category,
          level: form.level,
        });

      router.push(
        `/words/${updatedWord.id}`,
      );

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "儲存修改失敗。",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        載入中……
      </div>
    );
  }

  if (!originalWord) {
    return (
      <div className="min-h-screen px-5 py-10">
        <p className="font-bold">
          找不到這個單字。
        </p>

        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm text-slate-600"
      >
        ← 返回單字
      </button>

      <h1 className="mt-6 text-2xl font-bold">
        編輯雲端單字
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
      >
        <FormField label="英文單字">
          <input
            value={form.word}
            onChange={(event) =>
              updateField(
                "word",
                event.target.value,
              )
            }
            className="input-style"
          />
        </FormField>

        <FormField label="中文意思">
          <input
            value={form.meaning}
            onChange={(event) =>
              updateField(
                "meaning",
                event.target.value,
              )
            }
            className="input-style"
          />
        </FormField>

        <FormField label="詞性">
          <select
            value={form.partOfSpeech}
            onChange={(event) =>
              updateField(
                "partOfSpeech",
                event.target.value,
              )
            }
            className="input-style"
          >
            <option value="noun">名詞</option>
            <option value="verb">動詞</option>
            <option value="adjective">
              形容詞
            </option>
            <option value="adverb">副詞</option>
            <option value="phrase">片語</option>
          </select>
        </FormField>

        <FormField label="英文例句">
          <textarea
            value={form.example}
            onChange={(event) =>
              updateField(
                "example",
                event.target.value,
              )
            }
            rows={3}
            className="input-style resize-none"
          />
        </FormField>

        <FormField label="例句翻譯">
          <textarea
            value={form.exampleTranslation}
            onChange={(event) =>
              updateField(
                "exampleTranslation",
                event.target.value,
              )
            }
            rows={3}
            className="input-style resize-none"
          />
        </FormField>

        <FormField label="分類">
          <select
            value={form.category}
            onChange={(event) =>
              updateField(
                "category",
                event.target.value,
              )
            }
            className="input-style"
          >
            <option>日常英文</option>
            <option>工作英文</option>
            <option>旅遊英文</option>
            <option>感情與聊天</option>
            <option>運動</option>
            <option>餐廳與食物</option>
            <option>學習英文</option>
          </select>
        </FormField>

        <FormField label="程度">
          <select
            value={form.level}
            onChange={(event) =>
              updateField(
                "level",
                event.target.value as Word["level"],
              )
            }
            className="input-style"
          >
            <option>A1</option>
            <option>A2</option>
            <option>B1</option>
            <option>B2</option>
            <option>C1</option>
          </select>
        </FormField>

        {error && (
          <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white disabled:opacity-50"
        >
          {isSaving
            ? "儲存中……"
            : "儲存修改"}
        </button>
      </form>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      {children}
    </label>
  );
}