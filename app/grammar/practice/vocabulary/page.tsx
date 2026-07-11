"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getWords,
  recordAnswer,
} from "../../../lib/wordStorage";

import {
  createQuizQuestions,
  type QuizQuestion,
} from "../../../lib/quiz";

export default function VocabularyPracticePage() {
  const [questions, setQuestions] =
    useState<QuizQuestion[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);

  const [score, setScore] =
    useState(0);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isFinished, setIsFinished] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    void createNewQuiz();
  }, []);

  async function createNewQuiz() {
    try {
      setIsLoaded(false);
      setError("");

      const words = await getWords();

      if (words.length < 4) {
        setQuestions([]);
        return;
      }

      const generatedQuestions =
        createQuizQuestions(words, 10);

      setQuestions(generatedQuestions);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setIsFinished(false);
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "無法建立單字測驗。",
      );
    } finally {
      setIsLoaded(true);
    }
  }

  const currentQuestion =
    questions[currentIndex];

  async function chooseAnswer(
    answer: string,
  ) {
    if (
      !currentQuestion ||
      selectedAnswer !== null ||
      isSaving
    ) {
      return;
    }

    const isCorrect =
      answer ===
      currentQuestion.correctAnswer;

    setSelectedAnswer(answer);

    if (isCorrect) {
      setScore(
        (previousScore) =>
          previousScore + 1,
      );
    }

    try {
      setIsSaving(true);
      setError("");

      await recordAnswer(
        currentQuestion.word.id,
        isCorrect,
      );
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "無法儲存答題紀錄。",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function nextQuestion() {
    if (
      selectedAnswer === null ||
      isSaving
    ) {
      return;
    }

    const isLastQuestion =
      currentIndex ===
      questions.length - 1;

    if (isLastQuestion) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex(
      (previousIndex) =>
        previousIndex + 1,
    );

    setSelectedAnswer(null);
    setError("");
  }

  function speakWord(text: string) {
    try {
      const speech =
        window.speechSynthesis;

      speech.cancel();

      const utterance =
        new SpeechSynthesisUtterance(text);

      utterance.lang = "en-US";
      utterance.rate = 0.85;

      speech.speak(utterance);
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        "目前無法播放英文發音。",
      );
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-slate-500">
          正在建立單字測驗……
        </p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen px-5 py-10">
        <Link
          href="/practice"
          className="text-sm font-medium text-slate-600"
        >
          ← 返回練習中心
        </Link>

        <div className="mt-8 rounded-3xl bg-red-50 p-6">
          <h1 className="font-bold text-red-700">
            無法載入單字測驗
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void createNewQuiz()
            }
            className="mt-5 rounded-2xl bg-red-600 px-5 py-3 font-bold text-white"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen px-5 py-10">
        <Link
          href="/practice"
          className="text-sm font-medium text-slate-600"
        >
          ← 返回練習中心
        </Link>

        <header className="mt-7">
          <p className="text-sm text-slate-500">
            Vocabulary quiz
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            單字四選一
          </h1>
        </header>

        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-lg font-bold">
            單字數量不足
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            四選一遊戲至少需要四個不同中文意思的單字。
          </p>

          <Link
            href="/words/new"
            className="mt-6 inline-block rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white"
          >
            新增單字
          </Link>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round(
      (score / questions.length) * 100,
    );

    const wrongCount =
      questions.length - score;

    return (
      <div className="min-h-screen px-5 py-10">
        <section className="rounded-[32px] bg-violet-600 p-7 text-center text-white">
          <p className="text-sm text-violet-100">
            Quiz completed
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            單字練習完成
          </h1>

          <p className="mt-8 text-6xl font-bold">
            {percentage}%
          </p>

          <p className="mt-3 text-violet-100">
            答對 {score}／
            {questions.length} 題
          </p>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-emerald-50 p-5 text-center">
            <p className="text-sm text-slate-500">
              答對
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {score}
            </p>
          </div>

          <div className="rounded-3xl bg-rose-50 p-5 text-center">
            <p className="text-sm text-slate-500">
              答錯
            </p>

            <p className="mt-2 text-3xl font-bold text-rose-700">
              {wrongCount}
            </p>
          </div>
        </section>

        <button
          type="button"
          onClick={() =>
            void createNewQuiz()
          }
          className="mt-6 w-full rounded-2xl bg-violet-600 px-5 py-4 font-bold text-white"
        >
          再玩一次
        </button>

        {wrongCount > 0 && (
          <Link
            href="/mistakes"
            className="mt-3 block rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-center font-bold text-rose-700"
          >
            查看錯題
          </Link>
        )}

        <Link
          href="/practice"
          className="mt-3 block rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-bold text-slate-700"
        >
          返回練習中心
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      <header>
        <div className="flex items-center justify-between">
          <Link
            href="/practice"
            className="text-sm font-medium text-slate-600"
          >
            ← 返回練習中心
          </Link>

          <span className="text-sm font-bold text-slate-600">
            {currentIndex + 1}／
            {questions.length}
          </span>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-violet-600 transition-all"
            style={{
              width: `${
                ((currentIndex + 1) /
                  questions.length) *
                100
              }%`,
            }}
          />
        </div>
      </header>

      <section className="mt-10 text-center">
        <p className="text-sm text-slate-500">
          請選出正確的中文意思
        </p>

        <div className="mt-5 flex items-center justify-center gap-3">
          <h1 className="break-words text-4xl font-bold">
            {currentQuestion.word.word}
          </h1>

          <button
            type="button"
            onClick={() =>
              speakWord(
                currentQuestion.word.word,
              )
            }
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50"
            aria-label="播放發音"
          >
            🔊
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-500">
          {
            currentQuestion.word
              .partOfSpeech
          }
          {" ・ "}
          {currentQuestion.word.level}
        </p>
      </section>

      {error && (
        <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="mt-9 space-y-3">
        {currentQuestion.options.map(
          (option, index) => {
            const isSelected =
              option === selectedAnswer;

            const isCorrect =
              option ===
              currentQuestion.correctAnswer;

            let cardStyle =
              "border-slate-200 bg-white text-slate-800";

            let letterStyle =
              "bg-slate-100 text-slate-700";

            if (selectedAnswer !== null) {
              if (isCorrect) {
                cardStyle =
                  "border-emerald-500 bg-emerald-50 text-emerald-800";

                letterStyle =
                  "bg-emerald-100 text-emerald-700";
              } else if (isSelected) {
                cardStyle =
                  "border-rose-500 bg-rose-50 text-rose-800";

                letterStyle =
                  "bg-rose-100 text-rose-700";
              } else {
                cardStyle =
                  "border-slate-200 bg-white text-slate-400";

                letterStyle =
                  "bg-slate-100 text-slate-400";
              }
            }

            return (
              <button
                key={`${option}-${index}`}
                type="button"
                disabled={
                  selectedAnswer !== null ||
                  isSaving
                }
                onClick={() =>
                  void chooseAnswer(option)
                }
                className={`flex w-full items-center gap-4 rounded-3xl border-2 p-4 text-left transition ${cardStyle}`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold ${letterStyle}`}
                >
                  {String.fromCharCode(
                    65 + index,
                  )}
                </span>

                <span className="font-semibold">
                  {option}
                </span>
              </button>
            );
          },
        )}
      </section>

      {selectedAnswer !== null && (
        <section
          className={`mt-6 rounded-3xl p-5 ${
            selectedAnswer ===
            currentQuestion.correctAnswer
              ? "bg-emerald-50"
              : "bg-rose-50"
          }`}
        >
          <h2
            className={`text-lg font-bold ${
              selectedAnswer ===
              currentQuestion.correctAnswer
                ? "text-emerald-700"
                : "text-rose-700"
            }`}
          >
            {selectedAnswer ===
            currentQuestion.correctAnswer
              ? "答對了！"
              : "答錯了"}
          </h2>

          {selectedAnswer !==
            currentQuestion.correctAnswer && (
            <p className="mt-2 text-sm text-slate-600">
              正確答案：
              <strong>
                {
                  currentQuestion.correctAnswer
                }
              </strong>
            </p>
          )}

          {currentQuestion.word.example && (
            <div className="mt-4 border-t border-black/5 pt-4">
              <p className="font-medium leading-7">
                {
                  currentQuestion.word
                    .example
                }
              </p>

              {currentQuestion.word
                .exampleTranslation && (
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {
                    currentQuestion.word
                      .exampleTranslation
                  }
                </p>
              )}
            </div>
          )}
        </section>
      )}

      <button
        type="button"
        disabled={
          selectedAnswer === null ||
          isSaving
        }
        onClick={nextQuestion}
        className="mt-6 w-full rounded-2xl bg-violet-600 px-5 py-4 font-bold text-white disabled:bg-slate-200 disabled:text-slate-400"
      >
        {isSaving
          ? "儲存答題紀錄中……"
          : currentIndex ===
              questions.length - 1
            ? "查看結果"
            : "下一題"}
      </button>
    </div>
  );
}