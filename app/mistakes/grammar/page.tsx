"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getGrammarQuestions,
  recordGrammarAnswer,
} from "../../../lib/grammarStorage";
import type { GrammarQuestion } from "../../types/grammar";

export default function GrammarMistakePracticePage() {
  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setQuestions(
      getGrammarQuestions()
        .filter((q) => q.wrongCount > 0)
        .sort(() => Math.random() - 0.5)
    );
  }, []);

  const currentQuestion = questions[currentIndex];

  function chooseAnswer(answer: string) {
    if (!currentQuestion || selectedAnswer) return;

    const correct = answer === currentQuestion.correctAnswer;

    setSelectedAnswer(answer);
    recordGrammarAnswer(currentQuestion.id, correct);

    if (correct) {
      setScore((s) => s + 1);
    }
  }

  function nextQuestion() {
    if (currentIndex === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen p-10">
        <h1 className="text-2xl font-bold">文法錯題練習</h1>

        <p className="mt-4 text-slate-500">
          沒有需要複習的文法錯題。
        </p>

        <Link
          href="/mistakes"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-white"
        >
          返回錯題本
        </Link>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen p-10">
        <h1 className="text-3xl font-bold">
          完成！
        </h1>

        <p className="mt-4 text-xl">
          {score}/{questions.length}
        </p>

        <Link
          href="/mistakes"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-white"
        >
          返回錯題本
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">

      <Link href="/mistakes">
        ← 返回錯題本
      </Link>

      <h2 className="mt-8 text-2xl font-bold">
        {currentQuestion.question}
      </h2>

      <div className="mt-8 space-y-3">

        {currentQuestion.options.map((option) => {

          let style = "border";

          if (selectedAnswer) {

            if (option === currentQuestion.correctAnswer) {
              style = "border-green-500 bg-green-100";
            }

            else if (option === selectedAnswer) {
              style = "border-red-500 bg-red-100";
            }

          }

          return (

            <button
              key={option}
              onClick={() => chooseAnswer(option)}
              disabled={selectedAnswer !== null}
              className={`block w-full rounded-xl p-4 text-left ${style}`}
            >
              {option}
            </button>

          );

        })}

      </div>

      {selectedAnswer && (

        <button
          onClick={nextQuestion}
          className="mt-8 w-full rounded-xl bg-indigo-600 p-4 text-white"
        >
          {currentIndex === questions.length - 1
            ? "完成"
            : "下一題"}
        </button>

      )}

    </div>
  );
}