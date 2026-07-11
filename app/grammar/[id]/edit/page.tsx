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

import type {
  GrammarNote,
} from "../../../types/grammar";

type GrammarLevel =
  GrammarNote["level"];

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

  const params =
    useParams<{ id: string }>();

  const [
    originalNote,
    setOriginalNote,
  ] = useState<GrammarNote | null>(
    null,
  );

  const [form, setForm] =
    useState<GrammarForm>(emptyForm);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadNote() {
      try {
        setError("");

        const foundNote =
          await getGrammarNoteById(
            params.id,
          );

        if (!foundNote) {
          return;
        }

        setOriginalNote(foundNote);

        setForm({
          title: foundNote.title,
          category: foundNote.category,
          level: foundNote.level,
          explanation:
            foundNote.explanation,
          structure:
            foundNote.structure,
          example: foundNote.example,
          exampleTranslation:
            foundNote.exampleTranslation,
          commonMistake:
            foundNote.commonMistake,
        });
      } catch (caughtError) {
        console.error(caughtError);

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "無法讀取文法筆記。",
        );
      } finally {
        setIsLoaded(true);
      }
    }

    void loadNote();
  }, [params.id]);

  function updateField<
    K extends keyof GrammarForm,
  >(
    field: K,
    value: GrammarForm[K],
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

    if (!originalNote) {
      return;
    }

    setError("");

    if (!form.title.trim()) {
      setError("請填寫文法標題。");
      return;
    }

    if (!form.explanation.trim()) {
      setError("請填寫文法說明。");
      return;
    }

    try {
      setIsSaving(true);

      const updatedNote =
        await updateGrammarNote({
          ...originalNote,
          title: form.title.trim(),
          category: form.category,
          level: form.level,
          explanation:
            form.explanation.trim(),
          structure:
            form.structure.trim(),
          example:
            form.example.trim(),
          exampleTranslation:
            form.exampleTranslation.trim(),
          commonMistake:
            form.commonMistake.trim(),
        });

      router.push(
        `/grammar/${updatedNote.id}`,
      );

      router.refresh();
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "儲存文法筆記失敗。",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-slate-500">
          載入文法筆記中……
        </p>
      </div>
    );
  }

  if (!originalNote) {
    return (
      <div className="min-h-screen px-5 py-10">
        <button
          type="button"
          onClick={() =>
            router.push("/grammar")
          }
          className="text-sm font-medium text-slate-600"
        >
          ← 返回文法首頁
        </button>

        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-8 text-center">
          <p className="font-bold">
            找不到這篇文法筆記
          </p>

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
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

      <header className="mt-6">
        <p className="text-sm text-slate-500">
          Edit grammar note
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          編輯文法筆記
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
      >
        <FormField
          label="文法標題"
          required
        >
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
                event.target
                  .value as GrammarLevel,
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

        <FormField
          label="文法說明"
          required
        >
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
            value={
              form.exampleTranslation
            }
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
          disabled={isSaving}
          className="w-full rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
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
