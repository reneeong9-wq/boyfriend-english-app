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
import type { Word } from "../types/word";
import type { GrammarQuestion } from "../types/grammar";
import {
    recordMistakeReview,
  } from "../../lib/dailyTaskStorage";

type MistakeTab = "vocabulary" | "grammar";

export default function MistakesPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [grammarQuestions, setGrammarQuestions] =
    useState<GrammarQuestion[]>([]);
  const [activeTab, setActiveTab] =
    useState<MistakeTab>("vocabulary");
  const [isLoaded, setIsLoaded] = useState(false);

  function loadMistakes() {
    const wordMistakes = getWords()
      .filter((word) => word.wrongCount > 0)
      .sort(
        (first, second) =>
          second.wrongCount - first.wrongCount,
      );

    const grammarMistakes =
      getGrammarQuestions()
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
    setGrammarQuestions(grammarMistakes);
    setIsLoaded(true);
  }

  useEffect(() => {
    loadMistakes();
  }, []);

  function clearWordMistake(id: string) {
    resetWordMistakes(id);
    recordMistakeReview();
    loadMistakes();
  }

  function clearGrammarMistake(id: string) {
    resetGrammarMistakes(id);
    recordMistakeReview();
    loadMistakes();
  }
  function clearAllCurrentMistakes() {
    const confirmMessage =
      activeTab === "vocabulary"
        ? "確定要清除所有單字錯題紀錄嗎？"
        : "確定要清除所有文法錯題紀錄嗎？";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    if (activeTab === "vocabulary") {
      resetWordMistakes();
    } else {
      resetGrammarMistakes();
    }

    loadMistakes();
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          載入錯題中……
        </p>
      </div>
    );
  }

  const currentAmount =
    activeTab === "vocabulary"
      ? words.length
      : grammarQuestions.length;

  return (
    <div className="min-h-screen px-5 pb-10 pt-10">
      <header>
        <p className="text-sm text-slate-500">
          Mistake review
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          錯題本
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          優先複習曾經答錯的單字與文法題目。
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() =>
            setActiveTab("vocabulary")
          }
          className={`rounded-2xl px-4 py-3 text-sm font-bold ${
            activeTab === "vocabulary"
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
          文法錯題 {grammarQuestions.length}
        </button>
      </section>

      {currentAmount > 0 && (
        <button
          type="button"
          onClick={clearAllCurrentMistakes}
          className="mt-4 text-sm font-medium text-red-600"
        >
          清除目前全部錯題紀錄
        </button>
      )}

{activeTab === "vocabulary" &&
  words.length >= 4 && (
    <Link
      href="/mistakes/vocabulary"
      className="mt-5 block rounded-2xl bg-indigo-600 px-5 py-4 text-center font-bold text-white"
    >
      練習單字錯題
    </Link>
  )}

      {activeTab === "vocabulary" && (
        <section className="mt-6 space-y-3">
          {words.length > 0 ? (
            words.map((word) => (
              <article
                key={word.id}
                className="rounded-3xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/words/${word.id}`}
                      className="text-xl font-bold hover:text-indigo-600"
                    >
                      {word.word}
                    </Link>

                    <p className="mt-1 text-slate-700">
                      {word.meaning}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                    錯 {word.wrongCount} 次
                  </span>
                </div>

                {word.example && (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium leading-6">
                      {word.example}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {word.exampleTranslation}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    clearWordMistake(word.id)
                  }
                  className="mt-4 text-sm font-semibold text-indigo-600"
                >
                  標記為已複習
                </button>
              </article>
            ))
          ) : (
            <EmptyMistakes
              title="目前沒有單字錯題"
              description="完成單字測驗後，答錯的單字會出現在這裡。"
              href="/practice/vocabulary"
              linkText="開始單字練習"
            />
          )}
        </section>
      )}

{activeTab === "grammar" &&
  grammarQuestions.length > 0 && (
    <Link
      href="/mistakes/grammar"
      className="mt-5 block rounded-2xl bg-indigo-600 px-5 py-4 text-center font-bold text-white"
    >
      練習文法錯題
    </Link>
  )}

      {activeTab === "grammar" && (
        <section className="mt-6 space-y-3">
          {grammarQuestions.length > 0 ? (
            grammarQuestions.map(
              (question) => (
                <article
                  key={question.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                        {question.category}・
                        {question.level}
                      </span>

                      <h2 className="mt-4 font-bold leading-7">
                        {question.question}
                      </h2>
                    </div>

                    <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                      錯 {question.wrongCount} 次
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-semibold text-emerald-700">
                      正確答案
                    </p>

                    <p className="mt-1 font-bold text-emerald-900">
                      {question.correctAnswer}
                    </p>
                  </div>

                  {question.explanation && (
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {question.explanation}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      clearGrammarMistake(
                        question.id,
                      )
                    }
                    className="mt-4 text-sm font-semibold text-indigo-600"
                  >
                    標記為已複習
                  </button>
                </article>
              ),
            )
          ) : (
            <EmptyMistakes
              title="目前沒有文法錯題"
              description="完成文法測驗後，答錯的題目會出現在這裡。"
              href="/grammar/practice"
              linkText="開始文法練習"
            />
          )}
        </section>
      )}
    </div>
  );
}

function EmptyMistakes({
  title,
  description,
  href,
  linkText,
}: {
  title: string;
  description: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
      <p className="font-bold">{title}</p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <Link
        href={href}
        className="mt-5 inline-block rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
      >
        {linkText}
      </Link>
    </div>
  );
}