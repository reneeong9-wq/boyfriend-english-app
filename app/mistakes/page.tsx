"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getWords,
  resetWordMistakes,
} from "../../lib/wordStorage";

import {
  getGrammarQuestions,
  resetGrammarMistakes,
} from "../../lib/grammarStorage";

import {
  recordMistakeReview,
} from "../../lib/dailyTaskStorage";

import type { Word } from "../types/word";
import type {
  GrammarQuestion,
} from "../types/grammar";

type MistakeTab = "words" | "grammar";

export default function MistakesPage() {
  const [words, setWords] =
    useState<Word[]>([]);

  const [grammarQuestions, setGrammarQuestions] =
    useState<GrammarQuestion[]>([]);

  const [activeTab, setActiveTab] =
    useState<MistakeTab>("words");

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [isClearing, setIsClearing] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  async function loadMistakes() {
    try {
      setError("");

      const [
        allWords,
        allGrammarQuestions,
      ] = await Promise.all([
        getWords(),
        getGrammarQuestions(),
      ]);

      const wordMistakes = allWords
        .filter(
          (word) => word.wrongCount > 0,
        )
        .sort(
          (first, second) =>
            second.wrongCount -
            first.wrongCount,
        );

      const grammarMistakes =
        allGrammarQuestions
          .filter(
            (question) =>
              question.wrongCount > 0,
          )
          .sort(
            (first, second) =>
              second.wrongCount -
              first.wrongCount,
          );

      setWords(wordMistakes);
      setGrammarQuestions(
        grammarMistakes,
      );
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "無法讀取錯題。",
      );
    } finally {
      setIsLoaded(true);
    }
  }

  useEffect(() => {
    void loadMistakes();
  }, []);

  async function clearWordMistake(
    word: Word,
  ) {
    const confirmed = window.confirm(
      `確定要清除「${word.word}」的錯題紀錄嗎？`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsClearing(word.id);
      setError("");

      await resetWordMistakes(word.id);
      await recordMistakeReview();
      await loadMistakes();
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "清除單字錯題失敗。",
      );
    } finally {
      setIsClearing(null);
    }
  }

  async function clearGrammarMistake(
    question: GrammarQuestion,
  ) {
    const confirmed = window.confirm(
      `確定要清除這題文法錯題紀錄嗎？`,
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
          : "清除文法錯題失敗。",
      );
    } finally {
      setIsClearing(null);
    }
  }

  async function clearAllWordMistakes() {
    if (words.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "確定要清除全部單字錯題紀錄嗎？",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsClearing("all-words");
      setError("");

      await resetWordMistakes();
      await recordMistakeReview();
      await loadMistakes();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "清除全部單字錯題失敗。",
      );
    } finally {
      setIsClearing(null);
    }
  }

  async function clearAllGrammarMistakes() {
    if (grammarQuestions.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "確定要清除全部文法錯題紀錄嗎？",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsClearing("all-grammar");
      setError("");

      await resetGrammarMistakes();
      await recordMistakeReview();
      await loadMistakes();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "清除全部文法錯題失敗。",
      );
    } finally {
      setIsClearing(null);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-slate-500">
          載入雲端錯題中……
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      <Link
        href="/practice"
        className="text-sm font-medium text-slate-600"
      >
        ← 返回練習中心
      </Link>

      <header className="mt-6">
        <p className="text-sm text-slate-500">
          Mistake review
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          錯題本
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          單字 {words.length} 個・文法{" "}
          {grammarQuestions.length} 題
        </p>
      </header>

      {error && (
        <section className="mt-5 rounded-3xl bg-red-50 p-5">
          <p className="text-sm leading-6 text-red-700">
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

      <section className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() =>
            setActiveTab("words")
          }
          className={`rounded-2xl px-4 py-3 text-sm font-bold ${
            activeTab === "words"
              ? "bg-indigo-600 text-white"
              : "border border-slate-200 bg-white text-slate-600"
          }`}
        >
          單字錯題 {words.length}
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("grammar")
          }
          className={`rounded-2xl px-4 py-3 text-sm font-bold ${
            activeTab === "grammar"
              ? "bg-indigo-600 text-white"
              : "border border-slate-200 bg-white text-slate-600"
          }`}
        >
          文法錯題{" "}
          {grammarQuestions.length}
        </button>
      </section>

      {activeTab === "words" && (
        <section className="mt-6">
          {words.length > 0 && (
            <button
              type="button"
              disabled={isClearing !== null}
              onClick={() =>
                void clearAllWordMistakes()
              }
              className="mb-4 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-50"
            >
              清除全部單字錯題
            </button>
          )}

          <div className="space-y-3">
            {words.length > 0 ? (
              words.map((word) => (
                <article
                  key={word.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">
                        {word.word}
                      </h2>

                      <p className="mt-1 text-slate-600">
                        {word.meaning}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                      錯 {word.wrongCount} 次
                    </span>
                  </div>

                  {word.example && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm leading-6 text-slate-700">
                        {word.example}
                      </p>

                      {word.exampleTranslation && (
                        <p className="mt-2 text-sm text-slate-500">
                          {
                            word.exampleTranslation
                          }
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex gap-3">
                    <Link
                      href={`/words/${word.id}`}
                      className="flex-1 rounded-2xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      查看單字
                    </Link>

                    <button
                      type="button"
                      disabled={
                        isClearing !== null
                      }
                      onClick={() =>
                        void clearWordMistake(
                          word,
                        )
                      }
                      className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-50"
                    >
                      {isClearing === word.id
                        ? "清除中……"
                        : "清除紀錄"}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="目前沒有單字錯題"
                href="/practice/vocabulary"
                buttonText="開始單字練習"
              />
            )}
          </div>
        </section>
      )}

      {activeTab === "grammar" && (
        <section className="mt-6">
          {grammarQuestions.length > 0 && (
            <button
              type="button"
              disabled={isClearing !== null}
              onClick={() =>
                void clearAllGrammarMistakes()
              }
              className="mb-4 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-50"
            >
              清除全部文法錯題
            </button>
          )}

          <div className="space-y-3">
            {grammarQuestions.length > 0 ? (
              grammarQuestions.map(
                (question) => (
                  <article
                    key={question.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="font-bold leading-7">
                        {question.question}
                      </h2>

                      <span className="shrink-0 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                        錯{" "}
                        {question.wrongCount} 次
                      </span>
                    </div>

                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs font-semibold text-emerald-700">
                        正確答案
                      </p>

                      <p className="mt-2 font-bold text-emerald-900">
                        {
                          question.correctAnswer
                        }
                      </p>
                    </div>

                    {question.explanation && (
                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {question.explanation}
                      </p>
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
                          void clearGrammarMistake(
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
                ),
              )
            ) : (
              <EmptyState
                title="目前沒有文法錯題"
                href="/grammar/practice"
                buttonText="開始文法練習"
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyState({
  title,
  href,
  buttonText,
}: {
  title: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
      <p className="text-3xl">🎉</p>

      <p className="mt-3 font-bold">
        {title}
      </p>

      <Link
        href={href}
        className="mt-5 inline-block rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
      >
        {buttonText}
      </Link>
    </div>
  );
}