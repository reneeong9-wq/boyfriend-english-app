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

import {
  recordVocabularyPractice,
} from "../../../lib/dailyTaskStorage";

type AnswerState =
  | "correct"
  | "wrong"
  | null;

export default function VocabularyPracticePage() {
  const [questions, setQuestions] =
    useState<QuizQuestion[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);

  const [answerState, setAnswerState] =
    useState<AnswerState>(null);

  const [score, setScore] = useState(0);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [isFinished, setIsFinished] =
    useState(false);

  const [isSavingAnswer, setIsSavingAnswer] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    void createNewQuiz();
  }, []);

  async function createNewQuiz() {
    try {
      setIsLoaded(false);
      setError("");

      const words = await getWords();

      const generatedQuestions =
        createQuizQuestions(words, 10);

      setQuestions(generatedQuestions);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setAnswerState(null);
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
      isSavingAnswer
    ) {
      return;
    }

    const isCorrect =
      answer ===
      currentQuestion.correctAnswer;

    setSelectedAnswer(answer);

    setAnswerState(
      isCorrect ? "correct" : "wrong",
    );

    if (isCorrect) {
      setScore(
        (previousScore) =>
          previousScore + 1,
      );
    }

    try {
      setIsSavingAnswer(true);

      await recordAnswer(
        currentQuestion.word.id,
        isCorrect,
      );

      recordVocabularyPractice();
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "無法儲存答題紀錄。",
      );
    } finally {
      setIsSavingAnswer(false);
    }
  }

  function goToNextQuestion() {
    if (isSavingAnswer) {
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
    setAnswerState(null);
    setError("");
  }

  function speakText(
    text: string,
    rate = 0.85,
  ) {
    if (!("speechSynthesis" in window)) {
      window.alert(
        "目前的瀏覽器不支援英文發音。",
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = rate;
    utterance.pitch = 1;

    window.speechSynthesis.speak(
      utterance,
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-slate-500">
          正在建立雲端單字測驗……
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

        <div className="mt-10 rounded-3xl bg-red-50 p-6">
          <h1 className="text-lg font-bold text-red-700">
            無法建立測驗
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void createNewQuiz()
            }
            className="mt-5 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white"
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
            單字測驗
          </h1>
        </header>

        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-lg font-bold">
            單字數量不足
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            四選一測驗至少需要四個單字，
            而且中文意思不能全部相同。
          </p>

          <Link
            href="/words/new"
            className="mt-6 inline-block rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white"
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

    const wrongAmount =
      questions.length - score;

    return (
      <div className="min-h-screen px-5 py-10">
        <section className="rounded-[32px] bg-indigo-600 p-7 text-center text-white shadow-xl shadow-indigo-100">
          <p className="text-sm text-indigo-100">
            Quiz completed
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            單字練習完成！
          </h1>

          <div className="mx-auto mt-8 flex h-36 w-36 items-center justify-center rounded-full bg-white/15">
            <div>
              <p className="text-4xl font-bold">
                {percentage}%
              </p>

              <p className="mt-1 text-sm text-indigo-100">
                正確率
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-emerald-50 p-5 text-center">
            <p className="text-sm text-slate-600">
              答對
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-800">
              {score}
            </p>
          </div>

          <div className="rounded-3xl bg-rose-50 p-5 text-center">
            <p className="text-sm text-slate-600">
              答錯
            </p>

            <p className="mt-2 text-3xl font-bold text-rose-800">
              {wrongAmount}
            </p>
          </div>
        </section>

        <button
          type="button"
          onClick={() =>
            void createNewQuiz()
          }
          className="mt-6 w-full rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white"
        >
          再練習一次
        </button>

        {wrongAmount > 0 && (
          <Link
            href="/mistakes"
            className="mt-3 block rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-center font-semibold text-rose-700"
          >
            查看錯題本
          </Link>
        )}

        <Link
          href="/practice/daily"
          className="mt-3 block rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-semibold text-slate-700"
        >
          查看每日任務
        </Link>

        <Link
          href="/practice"
          className="mt-3 block rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-semibold text-slate-700"
        >
          返回練習中心
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      <header>
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/practice"
            className="text-sm font-medium text-slate-600"
          >
            ← 返回練習中心
          </Link>

          <span className="text-sm font-semibold text-slate-600">
            {currentIndex + 1}／
            {questions.length}
          </span>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
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

      <section className="mt-9 text-center">
        <p className="text-sm text-slate-500">
          What is the meaning of
        </p>

        <div className="mt-5 flex items-center justify-center gap-3">
          <h1 className="break-words text-4xl font-bold text-slate-900">
            {currentQuestion.word.word}
          </h1>

          <button
            type="button"
            onClick={() =>
              speakText(
                currentQuestion.word.word,
              )
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-lg"
            aria-label="播放英文發音"
          >
            🔊
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-500">
          {currentQuestion.word.partOfSpeech}
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
          (option, optionIndex) => {
            const optionLetter =
              String.fromCharCode(
                65 + optionIndex,
              );

            const isSelected =
              selectedAnswer === option;

            const isCorrectOption =
              option ===
              currentQuestion.correctAnswer;

            let optionStyle =
              "border-slate-200 bg-white text-slate-800 hover:border-indigo-300";

            let letterStyle =
              "bg-slate-100 text-slate-700";

            if (selectedAnswer !== null) {
              if (isCorrectOption) {
                optionStyle =
                  "border-emerald-500 bg-emerald-50 text-emerald-800";

                letterStyle =
                  "bg-emerald-100 text-emerald-700";
              } else if (isSelected) {
                optionStyle =
                  "border-rose-500 bg-rose-50 text-rose-800";

                letterStyle =
                  "bg-rose-100 text-rose-700";
              } else {
                optionStyle =
                  "border-slate-200 bg-white text-slate-400";

                letterStyle =
                  "bg-slate-100 text-slate-400";
              }
            }

            return (
              <button
                key={`${option}-${optionIndex}`}
                type="button"
                disabled={
                  selectedAnswer !== null ||
                  isSavingAnswer
                }
                onClick={() =>
                  void chooseAnswer(option)
                }
                className={`flex w-full items-center gap-4 rounded-3xl border-2 p-4 text-left transition disabled:cursor-not-allowed ${optionStyle}`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold ${letterStyle}`}
                >
                  {optionLetter}
                </span>

                <span className="font-semibold">
                  {option}
                </span>
              </button>
            );
          },
        )}
      </section>

      {answerState && (
        <section
          className={`mt-6 rounded-3xl p-5 ${
            answerState === "correct"
              ? "bg-emerald-50"
              : "bg-rose-50"
          }`}
        >
          <p
            className={`text-lg font-bold ${
              answerState === "correct"
                ? "text-emerald-700"
                : "text-rose-700"
            }`}
          >
            {answerState === "correct"
              ? "答對了！"
              : "答錯了"}
          </p>

          {answerState === "wrong" && (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              正確答案是：
              <strong className="ml-1">
                {
                  currentQuestion.correctAnswer
                }
              </strong>
            </p>
          )}

          {currentQuestion.word.example && (
            <div className="mt-4 border-t border-black/5 pt-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium leading-7 text-slate-800">
                  {
                    currentQuestion.word
                      .example
                  }
                </p>

                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      currentQuestion.word
                        .example,
                      0.82,
                    )
                  }
                  className="shrink-0 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold text-indigo-600"
                >
                  🔊
                </button>
              </div>

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
          isSavingAnswer
        }
        onClick={goToNextQuestion}
        className="mt-6 w-full rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        {isSavingAnswer
          ? "儲存答題紀錄中……"
          : currentIndex ===
              questions.length - 1
            ? "查看結果"
            : "下一題"}
      </button>
    </div>
  );
}