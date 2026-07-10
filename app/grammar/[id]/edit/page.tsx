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
  getGrammarNoteById,
  updateGrammarNote,
} from "../../../../lib/grammarStorage";
import type { GrammarNote } from "../../../types/grammar";

type GrammarLevel = GrammarNote["level"];

interface GrammarForm {
  title: string;
  category: string;
  level: GrammarLevel;
  explanation: string;
  structure: string;
  example: string;
  exampleTranslation: string;
  commonMistake: string;
}

const emptyForm: GrammarForm = {
  title: "",
  category: "時態",
  level: "B1",
  explanation: "",
  structure: "",
  example: "",
  exampleTranslation: "",
  commonMistake: "",
};

export default function EditGrammarNotePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [originalNote, setOriginalNote] =
    useState<GrammarNote | null>(null);

  const [form, setForm] =
    useState<GrammarForm>(emptyForm);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const foundNote =
      getGrammarNoteById(params.id);

    if (foundNote) {
      setOriginalNote(foundNote);

      setForm({
        title: foundNote.title,
        category: foundNote.category,
        level: foundNote.level,
        explanation: foundNote.explanation,
        structure: foundNote.structure,
        example: foundNote.example,
        exampleTranslation:
          foundNote.exampleTranslation,
        commonMistake:
          foundNote.commonMistake,
      });
    }

    setIsLoaded(true);
  }, [params.id]);

  function updateField<K extends keyof GrammarForm>(
    field: K,
    value: GrammarForm[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!originalNote) {
      return;
    }

    if (
      !form.title.trim() ||
      !form.explanation.trim()
    ) {
      setError("請填寫文法標題與文法說明。");
      return;
    }

    const updatedNote: GrammarNote = {
      ...originalNote,
      title: form.title.trim(),
      category: form.category,
      level: form.level,
      explanation: form.explanation.trim(),
      structure: form.structure.trim(),
      example: form.example.trim(),
      exampleTranslation:
        form.exampleTranslation.trim(),
      commonMistake:
        form.commonMistake.trim(),
    };

    updateGrammarNote(updatedNote);

    router.push(`/grammar/${updatedNote.id}`);
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        載入中……
      </div>
    );
  }

  if (!originalNote) {
    return (
      <div className="min-h-screen px-5 py-10">
        <p className="font-bold">
          找不到這篇文法筆記。
        </p>

        <button
          type="button"
          onClick={() => router.push("/grammar")}
          className="mt-5 rounded-2xl bg-indigo-600 px-5 py-3 text-white"
        >
          返回文法首頁
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm font-medium text-slate-600"
      >
        ← 返回文法筆記
      </button>

      <h1 className="mt-6 text-2xl font-bold">
        編輯文法筆記
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
      >
        <FormField label="文法標題" required>
          <input
            value={form.title}
            onChange={(event) =>
              updateField(
                "title",
                event.target.value,
              )
            }
            className="input-style"
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
            <option>時態</option>
            <option>助動詞</option>
            <option>介系詞</option>
            <option>比較級</option>
            <option>條件句</option>
            <option>關係代名詞</option>
            <option>常見錯誤</option>
            <option>其他</option>
          </select>
        </FormField>

        <FormField label="程度">
          <select
            value={form.level}
            onChange={(event) =>
              updateField(
                "level",
                event.target.value as GrammarLevel,
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

        <FormField label="文法說明" required>
          <textarea
            value={form.explanation}
            onChange={(event) =>
              updateField(
                "explanation",
                event.target.value,
              )
            }
            rows={4}
            className="input-style resize-none"
          />
        </FormField>

        <FormField label="句型結構">
          <input
            value={form.structure}
            onChange={(event) =>
              updateField(
                "structure",
                event.target.value,
              )
            }
            className="input-style"
          />
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

        <FormField label="常見錯誤">
          <textarea
            value={form.commonMistake}
            onChange={(event) =>
              updateField(
                "commonMistake",
                event.target.value,
              )
            }
            rows={3}
            className="input-style resize-none"
          />
        </FormField>

        {error && (
          <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white"
        >
          儲存修改
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
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      {children}
    </label>
  );
}