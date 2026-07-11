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
  getGrammarQuestionById,
  updateGrammarQuestion,
} from "../../../../../lib/grammarStorage";

import type {
  GrammarQuestion,
} from "../../../../types/grammar";

type GrammarLevel =
  GrammarQuestion["level"];

export default function EditGrammarQuestionPage() {
  const router = useRouter();

  const params =
    useParams<{ id: string }>();

  const [
    originalQuestion,
    setOriginalQuestion,
  ] = useState<GrammarQuestion | null>(
    null,
  );

  const [
    questionText,
    setQuestionText,
  ] = useState("");

  const [options, setOptions] = useState([
    "",
    "",
    "",
    "",
  ]);

  const [
    correctIndex,
    setCorrectIndex,
  ] = useState(0);

  const [
    explanation,
    setExplanation,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("時態");

  const [level, setLevel] =
    useState<GrammarLevel>("B1");

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadQuestion() {
      try {
        setError("");

        const foundQuestion =
          await getGrammarQuestionById(
            params.id,
          );

        if (!foundQuestion) {
          return;
        }

        setOriginalQuestion(
          foundQuestion,
        );

        setQuestionText(
          foundQuestion.question,
        );

        const normalizedOptions = [
          ...foundQuestion.options,
        ].slice(0, 4);

        while (
          normalizedOptions.length < 4
        ) {
          normalizedOptions.push("");
        }

        setOptions(normalizedOptions);

        const answerIndex =
          normalizedOptions.findIndex(
            (option) =>
              option ===
              foundQuestion.correctAnswer,
          );

        setCorrectIndex(
          answerIndex >= 0
            ? answerIndex
            : 0,
        );

        setExplanation(
          foundQuestion.explanation,
        );

        setCategory(
          foundQuestion.category,
        );

        setLevel(
          foundQuestion.level,
        );
      } catch (caughtError) {
        console.error(caughtError);

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "無法讀取文法題目。",
        );
      } finally {
        setIsLoaded(true);
      }
    }

    void loadQuestion();
  }, [params.id]);

  function updateOption(
    index: number,
    value: string,
  ) {
    setOptions((previous) =>
      previous.map(
        (option, optionIndex) =>
          optionIndex === index
            ? value
            : option,
      ),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!originalQuestion) {
      return;
    }

    setError("");

    const cleanedOptions =
      options.map((option) =>
        option.trim(),
      );

    if (!questionText.trim()) {
      setError("請填寫題目。");
      return;
    }

    if (
      cleanedOptions.some(
        (option) => !option,
      )
    ) {
      setError(
        "請完整填寫四個選項。",
      );
      return;
    }

    const correctAnswer =
      cleanedOptions[correctIndex];

    if (!correctAnswer) {
      setError(
        "請選擇正確答案。",
      );
      return;
    }

    try {
      setIsSaving(true);

      const updatedQuestion =
        await updateGrammarQuestion({
          ...originalQuestion,
          question:
            questionText.trim(),
          options: cleanedOptions,
          correctAnswer,
          explanation:
            explanation.trim(),
          category,
          level,
        });

      router.push(
        `/grammar/questions`,
      );

      router.refresh();

      console.log(
        "Updated grammar question:",
        updatedQuestion.id,
      );
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "儲存文法題目失敗。",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-slate-500">
          載入文法題目中……
        </p>
      </div>
    );
  }

  if (!originalQuestion) {
    return (
      <div className="min-h-screen px-5 py-10">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/grammar/questions",
            )
          }
          className="text-sm font-medium text-slate-600"
        >
          ← 返回題目管理
        </button>

        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-8 text-center">
          <p className="font-bold">
            找不到這個文法題目
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
        onClick={() =>
          router.push(
            "/grammar/questions",
          )
        }
        className="text-sm font-medium text-slate-600"
      >
        ← 返回題目管理
      </button>

      <header className="mt-6">
        <p className="text-sm text-slate-500">
          Edit grammar question
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          編輯文法題目
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
      >
        <FormField
          label="題目"
          required
        >
          <textarea
            value={questionText}
            onChange={(event) =>
              setQuestionText(
                event.target.value,
              )
            }
            rows={3}
            className="input-style resize-none"
          />
        </FormField>

        {options.map(
          (option, index) => (
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
          ),
        )}

        <FormField label="正確答案">
          <select
            value={correctIndex}
            onChange={(event) =>
              setCorrectIndex(
                Number(
                  event.target.value,
                ),
              )
            }
            className="input-style"
          >
            <option value={0}>
              選項 A
            </option>

            <option value={1}>
              選項 B
            </option>

            <option value={2}>
              選項 C
            </option>

            <option value={3}>
              選項 D
            </option>
          </select>
        </FormField>

        <FormField label="答案解析">
          <textarea
            value={explanation}
            onChange={(event) =>
              setExplanation(
                event.target.value,
              )
            }
            rows={4}
            className="input-style resize-none"
          />
        </FormField>

        <FormField label="分類">
          <select
            value={category}
            onChange={(event) =>
              setCategory(
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
            value={level}
            onChange={(event) =>
              setLevel(
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