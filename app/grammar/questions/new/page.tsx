"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { addGrammarQuestion } from "../../../../lib/grammarStorage";
import type { GrammarQuestion } from "../../../types/grammar";

type GrammarLevel = GrammarQuestion["level"];

export default function NewGrammarQuestionPage() {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    "",
    "",
    "",
    "",
  ]);
  const [correctIndex, setCorrectIndex] =
    useState(0);
  const [explanation, setExplanation] =
    useState("");
  const [category, setCategory] =
    useState("時態");
  const [level, setLevel] =
    useState<GrammarLevel>("B1");
  const [error, setError] = useState("");

  function updateOption(
    index: number,
    value: string,
  ) {
    setOptions((previous) =>
      previous.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const cleanedOptions = options.map(
      (option) => option.trim(),
    );

    if (
      !question.trim() ||
      cleanedOptions.some((option) => !option)
    ) {
      setError("請填寫題目與四個選項。");
      return;
    }

    const newQuestion: GrammarQuestion = {
      id: crypto.randomUUID(),
      question: question.trim(),
      options: cleanedOptions,
      correctAnswer:
        cleanedOptions[correctIndex],
      explanation: explanation.trim(),
      level,
      category,
      correctCount: 0,
      wrongCount: 0,
      createdAt: new Date().toISOString(),
    };

    addGrammarQuestion(newQuestion);
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
        新增文法題目
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
      >
        <FormField label="題目" required>
          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            rows={3}
            placeholder="I ______ here since 2023."
            className="input-style resize-none"
          />
        </FormField>

        {options.map((option, index) => (
          <FormField
            key={index}
            label={`選項 ${String.fromCharCode(
              65 + index,
            )}`}
            required
          >
            <input
              value={option}
              onChange={(event) =>
                updateOption(
                  index,
                  event.target.value,
                )
              }
              className="input-style"
            />
          </FormField>
        ))}

        <FormField label="正確答案">
          <select
            value={correctIndex}
            onChange={(event) =>
              setCorrectIndex(
                Number(event.target.value),
              )
            }
            className="input-style"
          >
            <option value={0}>選項 A</option>
            <option value={1}>選項 B</option>
            <option value={2}>選項 C</option>
            <option value={3}>選項 D</option>
          </select>
        </FormField>

        <FormField label="答案解析">
          <textarea
            value={explanation}
            onChange={(event) =>
              setExplanation(event.target.value)
            }
            rows={4}
            placeholder="說明為什麼這個答案是正確的。"
            className="input-style resize-none"
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

        {error && (
          <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white"
        >
          儲存文法題目
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