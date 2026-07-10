"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { addWord } from "../../../lib/wordStorage";
import { supabase } from "../../../lib/supabase";
import type { Word } from "../../types/word";

interface WordFormData {
  word: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
  category: string;
  level: Word["level"];
}

const initialForm: WordFormData = {
  word: "",
  meaning: "",
  partOfSpeech: "noun",
  example: "",
  exampleTranslation: "",
  category: "日常英文",
  level: "B1",
};

export default function NewWordPage() {
  const router = useRouter();

  const [form, setForm] =
    useState<WordFormData>(initialForm);

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] =
    useState(false);
  const [isCheckingUser, setIsCheckingUser] =
    useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setIsCheckingUser(false);
    }

    void checkUser();
  }, [router]);

  function updateField<
    K extends keyof WordFormData,
  >(
    field: K,
    value: WordFormData[K],
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
    setError("");

    const cleanWord = form.word.trim();
    const cleanMeaning =
      form.meaning.trim();

    if (!cleanWord || !cleanMeaning) {
      setError(
        "請填寫英文單字與中文意思。",
      );
      return;
    }

    try {
      setIsSaving(true);

      await addWord({
        word: cleanWord,
        meaning: cleanMeaning,
        partOfSpeech: form.partOfSpeech,
        example: form.example,
        exampleTranslation:
          form.exampleTranslation,
        category: form.category,
        level: form.level,
        status: "new",
        isFavorite: false,
      });

      router.push("/words");
      router.refresh();
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "新增單字失敗。",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isCheckingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          確認登入狀態中……
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      <header>
        <button
          type="button"
          onClick={() => router.push("/words")}
          className="text-sm font-medium text-slate-600"
        >
          ← 返回單字庫
        </button>

        <p className="mt-6 text-sm text-slate-500">
          Add cloud vocabulary
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          新增單字
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
      >
        <FormField label="英文單字" required>
          <input
            value={form.word}
            onChange={(event) =>
              updateField(
                "word",
                event.target.value,
              )
            }
            placeholder="例如：deadline"
            className="input-style"
          />
        </FormField>

        <FormField label="中文意思" required>
          <input
            value={form.meaning}
            onChange={(event) =>
              updateField(
                "meaning",
                event.target.value,
              )
            }
            placeholder="例如：截止日期"
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
            <option value="noun">
              名詞 noun
            </option>
            <option value="verb">
              動詞 verb
            </option>
            <option value="adjective">
              形容詞 adjective
            </option>
            <option value="adverb">
              副詞 adverb
            </option>
            <option value="phrase">
              片語 phrase
            </option>
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
            ? "儲存到雲端中……"
            : "儲存單字"}
        </button>
      </form>
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}