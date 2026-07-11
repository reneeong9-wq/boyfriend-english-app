"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getGrammarQuestions,
  resetGrammarMistakes,
} from "../../../lib/grammarStorage";

import {
  recordMistakeReview,
} from "../../../lib/dailyTaskStorage";

import type {
  GrammarQuestion,
} from "../../types/grammar";

export default function GrammarMistakesPage() {
  const [questions, setQuestions] =
    useState<GrammarQuestion[]>([]);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [isClearing, setIsClearing] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  async function loadMistakes() {
    try {
      setError("");

      const allQuestions =
        await getGrammarQuestions();

      const mistakeQuestions =
        allQuestions
          .filter(
            (question) =>
              question.wrongCount > 0,
          )
          .sort(
            (first, second) =>
              second.wrongCount -
              first.wrongCount,
          );

      setQuestions(mistakeQuestions);
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "無法讀取文法錯題。",
      );
    } finally {
      setIsLoaded(true);
    }
  }

  useEffect(() => {
    void loadMistakes();
  }, []);

  async function clearMistake(
    question: GrammarQuestion,
  ) {
    const confirmed = window.confirm(
      `確定要清除「${question.question}」的錯題紀錄嗎？`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsClearing(question.id);
      setError("");

      await resetGrammarMistakes(
        question.id,
      );

      await recordMistakeReview();

      await loadMistakes();
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "清除錯題紀錄失敗。",
      );
    } finally {
      setIsClearing(null);
    }
  }

  async function clearAllMistakes() {
    if (questions.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "確定要清除全部文法錯題紀錄嗎？",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsClearing("all");
      setError("");

      await resetGrammarMistakes();

      await recordMistakeReview();

      await loadMistakes();
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "清除全部錯題失敗。",
      );
    } finally {
      setIsClearing(null);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-slate-500">
          載入雲端文法錯題中……
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      <Link
        href="/mistakes"
        className="text-sm font-medium text-slate-600"
      >
        ← 返回錯題本
      </Link>

      <header className="mt-6">
        <p className="text-sm text-slate-500">
          Grammar mistakes
        </p>

        <div className="mt-1 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              文法錯題
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              共 {questions.length} 題
            </p>
          </div>

          {questions.length > 0 && (
            <button
              type="button"
              disabled={
                isClearing !== null
              }
              onClick={() =>
                void clearAllMistakes()
              }
              className="shrink-0 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-50"
            >
              {isClearing === "all"
                ? "清除中……"
                : "全部清除"}
            </button>
          )}
        </div>
      </header>

      {error && (
        <section className="mt-5 rounded-3xl bg-red-50 p-5">
          <h2 className="font-bold text-red-700">
            無法處理文法錯題
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadMistakes()
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
              className="rounded-3xl border border-slate-200 bg-white p-5"
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

                <span className="shrink-0 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                  錯 {question.wrongCount} 次
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  正確答案
                </p>

                <p className="mt-2 font-bold text-emerald-900">
                  {question.correctAnswer}
                </p>
              </div>

              {question.explanation && (
                <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Explanation
                  </p>

                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    {question.explanation}
                  </p>
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <Link
                  href={`/grammar/questions/${question.id}/edit`}
                  className="flex-1 rounded-2xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  編輯題目
                </Link>

                <button
                  type="button"
                  disabled={
                    isClearing !== null
                  }
                  onClick={() =>
                    void clearMistake(
                      question,
                    )
                  }
                  className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-50"
                >
                  {isClearing ===
                  question.id
                    ? "清除中……"
                    : "清除紀錄"}
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
            <p className="text-3xl">
              🎉
            </p>

            <p className="mt-3 font-bold">
              目前沒有文法錯題
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              完成文法練習後，答錯的題目會顯示在這裡。
            </p>

            <Link
              href="/grammar/practice"
              className="mt-5 inline-block rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
            >
              開始文法練習
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}