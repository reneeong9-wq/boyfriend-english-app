"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  deleteGrammarQuestion,
  getGrammarQuestions,
} from "../../../lib/grammarStorage";

import type {
  GrammarQuestion,
} from "../../types/grammar";

export default function GrammarQuestionsPage() {
  const [questions, setQuestions] =
    useState<GrammarQuestion[]>([]);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  async function loadQuestions() {
    try {
      setError("");

      const cloudQuestions =
        await getGrammarQuestions();

      setQuestions(cloudQuestions);
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

  useEffect(() => {
    void loadQuestions();
  }, []);

  async function handleDelete(
    question: GrammarQuestion,
  ) {
    const confirmed = window.confirm(
      `確定要刪除題目「${question.question}」嗎？`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(question.id);
      setError("");

      await deleteGrammarQuestion(
        question.id,
      );

      await loadQuestions();
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "刪除文法題目失敗。",
      );
    } finally {
      setIsDeleting(null);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-slate-500">
          載入雲端文法題目中……
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      <Link
        href="/grammar"
        className="text-sm font-medium text-slate-600"
      >
        ← 返回文法
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            Grammar questions
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            文法題目管理
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            共 {questions.length} 題
          </p>
        </div>

        <Link
          href="/grammar/questions/new"
          className="shrink-0 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white"
        >
          ＋ 新增
        </Link>
      </div>

      {error && (
        <section className="mt-5 rounded-3xl bg-red-50 p-5">
          <h2 className="font-bold text-red-700">
            無法處理文法題目
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadQuestions()
            }
            className="mt-4 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            重新載入
          </button>
        </section>
      )}

      <section className="mt-7 space-y-4">
        {questions.length > 0 ? (
          questions.map((question) => (
            <article
              key={question.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                      {question.category}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {question.level}
                    </span>
                  </div>

                  <h2 className="mt-4 break-words font-bold leading-7">
                    {question.question}
                  </h2>
                </div>

                <div className="flex shrink-0 gap-3">
                  <Link
                    href={`/grammar/questions/${question.id}/edit`}
                    className="text-sm font-semibold text-indigo-600"
                  >
                    編輯
                  </Link>

                  <button
                    type="button"
                    disabled={
                      isDeleting ===
                      question.id
                    }
                    onClick={() =>
                      void handleDelete(
                        question,
                      )
                    }
                    className="text-sm font-semibold text-red-600 disabled:opacity-50"
                  >
                    {isDeleting ===
                    question.id
                      ? "刪除中"
                      : "刪除"}
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {question.options.map(
                  (option, index) => {
                    const isCorrect =
                      option ===
                      question.correctAnswer;

                    return (
                      <div
                        key={`${option}-${index}`}
                        className={`rounded-2xl px-4 py-3 text-sm ${
                          isCorrect
                            ? "bg-emerald-50 font-semibold text-emerald-800"
                            : "bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span className="mr-2 font-bold">
                          {String.fromCharCode(
                            65 + index,
                          )}
                          .
                        </span>

                        {option}

                        {isCorrect && (
                          <span className="ml-2">
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  },
                )}
              </div>

              {question.explanation && (
                <div className="mt-5 rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Explanation
                  </p>

                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    {question.explanation}
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">
                <span>
                  答對{" "}
                  {question.correctCount} 次
                </span>

                <span>
                  答錯{" "}
                  {question.wrongCount} 次
                </span>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
            <p className="font-bold">
              還沒有文法題目
            </p>

            <p className="mt-2 text-sm text-slate-500">
              建立第一題後，就可以開始文法測驗。
            </p>

            <Link
              href="/grammar/questions/new"
              className="mt-5 inline-block rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
            >
              新增第一題
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}