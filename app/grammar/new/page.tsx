"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { addGrammarNote } from "../../../lib/grammarStorage";
import type { GrammarNote } from "../../types/grammar";

type GrammarLevel = GrammarNote["level"];

export default function NewGrammarNotePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState("時態");
  const [level, setLevel] =
    useState<GrammarLevel>("B1");
  const [explanation, setExplanation] =
    useState("");
  const [structure, setStructure] =
    useState("");
  const [example, setExample] =
    useState("");
  const [
    exampleTranslation,
    setExampleTranslation,
  ] = useState("");
  const [commonMistake, setCommonMistake] =
    useState("");
  const [error, setError] = useState("");

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!title.trim() || !explanation.trim()) {
      setError("請填寫標題與文法說明。");
      return;
    }

    const note: GrammarNote = {
      id: crypto.randomUUID(),
      title: title.trim(),
      category,
      level,
      explanation: explanation.trim(),
      structure: structure.trim(),
      example: example.trim(),
      exampleTranslation:
        exampleTranslation.trim(),
      commonMistake: commonMistake.trim(),
      createdAt: new Date().toISOString(),
    };

    addGrammarNote(note);
    router.push("/grammar");
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm font-medium text-slate-600"
      >
        ← 返回文法
      </button>

      <h1 className="mt-6 text-2xl font-bold">
        新增文法筆記
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
      >
        <FormField label="文法標題" required>
          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="例如：Present Perfect 現在完成式"
            className="input-style"
          />
        </FormField>

        <FormField label="分類">
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
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
            value={level}
            onChange={(event) =>
              setLevel(
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
            value={explanation}
            onChange={(event) =>
              setExplanation(event.target.value)
            }
            rows={4}
            placeholder="說明這個文法在什麼情況使用。"
            className="input-style resize-none"
          />
        </FormField>

        <FormField label="句型結構">
          <input
            value={structure}
            onChange={(event) =>
              setStructure(event.target.value)
            }
            placeholder="Subject + have/has + past participle"
            className="input-style"
          />
        </FormField>

        <FormField label="英文例句">
          <textarea
            value={example}
            onChange={(event) =>
              setExample(event.target.value)
            }
            rows={3}
            className="input-style resize-none"
          />
        </FormField>

        <FormField label="例句翻譯">
          <textarea
            value={exampleTranslation}
            onChange={(event) =>
              setExampleTranslation(
                event.target.value,
              )
            }
            rows={3}
            className="input-style resize-none"
          />
        </FormField>

        <FormField label="常見錯誤">
          <textarea
            value={commonMistake}
            onChange={(event) =>
              setCommonMistake(event.target.value)
            }
            rows={3}
            placeholder="例如：不要與 yesterday 一起使用。"
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
          儲存文法筆記
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