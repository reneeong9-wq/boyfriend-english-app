"use client";
import {
    getWords,
    recordAnswer,
  } from "../../../lib/wordStorage";
  
  import {
    createQuizQuestions,
    type QuizQuestion,
  } from "../../../lib/quiz";
  
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getGrammarQuestions,
  recordGrammarAnswer,
} from "../../../lib/grammarStorage";
import type { GrammarQuestion } from "../../types/grammar";

export default function GrammarPracticePage() {
  const [questions, setQuestions] = useState<
    GrammarQuestion[]
  >([]);
  const [currentIndex, setCurrentIndex] =
    useState(0);
  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] =
    useState(false);

  useEffect(() => {
    setQuestions(
      getGrammarQuestions().sort(
        () => Math.random() - 0.5,
      ),
    );
  }, []);

  const currentQuestion =
    questions[currentIndex];

  function chooseAnswer(answer: string) {
    if (!currentQuestion || selectedAnswer) {
      return;
    }

    const correct =
      answer === currentQuestion.correctAnswer;

    setSelectedAnswer(answer);
    recordGrammarAnswer(
      currentQuestion.id,
      correct,
    );

    if (correct) {
      setScore((previous) => previous + 1);
    }
  }

  function nextQuestion() {
    if (currentIndex === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentIndex((previous) => previous + 1);
    setSelectedAnswer(null);
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen px-5 py-10">
        <h1 className="text-2xl font-bold">
          文法測驗
        </h1>

        <p className="mt-4 text-slate-500">
          目前沒有文法題目。
        </p>

        <Link
          href="/grammar/questions/new"
          className="mt-6 inline-block rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white"
        >
          新增題目
        </Link>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round(
      (score / questions.length) * 100,
    );

    return (
      <div className="min-h-screen px-5 py-10">
        <div className="rounded-[32px] bg-indigo-600 p-8 text-center text-white">
          <p className="text-sm text-indigo-100">
            Grammar completed
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            文法測驗完成
          </h1>

          <p className="mt-8 text-5xl font-bold">
            {percentage}%
          </p>

          <p className="mt-2 text-indigo-100">
            答對 {score}／{questions.length} 題
          </p>
        </div>

        <Link
          href="/grammar"
          className="mt-6 block rounded-2xl bg-slate-900 px-5 py-4 text-center font-bold text-white"
        >
          返回文法首頁
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      <header>
        <Link
          href="/grammar"
          className="text-sm text-slate-600"
        >
          ← 返回文法
        </Link>

        <div className="mt-5 flex justify-between">
          <span className="text-sm text-slate-500">
            Grammar quiz
          </span>

          <span className="text-sm font-semibold">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </header>

      <section className="mt-10">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
          {currentQuestion.category}・
          {currentQuestion.level}
        </span>

        <h1 className="mt-5 text-2xl font-bold leading-9">
          {currentQuestion.question}
        </h1>
      </section>

      <section className="mt-8 space-y-3">
        {currentQuestion.options.map(
          (option, index) => {
            const correct =
              option ===
              currentQuestion.correctAnswer;
            const selected =
              option === selectedAnswer;

            let style =
              "border-slate-200 bg-white";

            if (selectedAnswer) {
              if (correct) {
                style =
                  "border-emerald-500 bg-emerald-50";
              } else if (selected) {
                style =
                  "border-red-500 bg-red-50";
              }
            }

            return (
              <button
                key={option}
                type="button"
                disabled={selectedAnswer !== null}
                onClick={() =>
                  chooseAnswer(option)
                }
                className={`flex w-full items-center gap-4 rounded-3xl border-2 p-4 text-left ${style}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 font-bold">
                  {String.fromCharCode(65 + index)}
                </span>

                <span className="font-semibold">
                  {option}
                </span>
              </button>
            );
          },
        )}
      </section>

      {selectedAnswer && (
        <section className="mt-6 rounded-3xl bg-slate-100 p-5">
          <p className="font-bold">
            {selectedAnswer ===
            currentQuestion.correctAnswer
              ? "答對了！"
              : "答錯了"}
          </p>

          <p className="mt-2 text-sm text-slate-600">
            正確答案：
            {currentQuestion.correctAnswer}
          </p>

          {currentQuestion.explanation && (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {currentQuestion.explanation}
            </p>
          )}
        </section>
      )}

      <button
        type="button"
        disabled={!selectedAnswer}
        onClick={nextQuestion}
        className="mt-6 w-full rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white disabled:bg-slate-200 disabled:text-slate-400"
      >
        {currentIndex === questions.length - 1
          ? "查看結果"
          : "下一題"}
      </button>
    </div>
  );
}