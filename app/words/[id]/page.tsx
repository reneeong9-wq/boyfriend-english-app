"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  deleteWord,
  getWordById,
  toggleWordFavorite,
  updateWord,
} from "../../../lib/wordStorage";

import type {
  Word,
  WordStatus,
} from "../../types/word";

const statusLabel: Record<WordStatus, string> = {
  new: "新單字",
  learning: "學習中",
  mastered: "已熟悉",
};

const partOfSpeechLabel: Record<string, string> = {
  noun: "名詞 noun",
  verb: "動詞 verb",
  adjective: "形容詞 adjective",
  adverb: "副詞 adverb",
  phrase: "片語 phrase",
};

export default function WordDetailPage() {
  const router = useRouter();

  const params =
    useParams<{ id: string }>();

  const [word, setWord] =
    useState<Word | null>(null);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadWord() {
      try {
        setError("");

        const foundWord =
          await getWordById(params.id);

        setWord(foundWord ?? null);
      } catch (caughtError) {
        console.error(caughtError);

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "無法讀取單字。",
        );
      } finally {
        setIsLoaded(true);
      }
    }

    void loadWord();
  }, [params.id]);

  function speakText(
    text: string,
    rate = 0.85,
  ) {
    try {
      const speech =
        window.speechSynthesis;

      speech.cancel();

      const utterance =
        new SpeechSynthesisUtterance(text);

      utterance.lang = "en-US";
      utterance.rate = rate;
      utterance.pitch = 1;

      speech.speak(utterance);
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        "目前瀏覽器無法播放英文發音。",
      );
    }
  }

  async function changeStatus(
    status: WordStatus,
  ) {
    if (!word || isUpdating) {
      return;
    }

    try {
      setIsUpdating(true);
      setError("");

      const updatedWord =
        await updateWord({
          ...word,
          status,
        });

      setWord(updatedWord);
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "更新學習狀態失敗。",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleFavorite() {
    if (!word || isUpdating) {
      return;
    }

    try {
      setIsUpdating(true);
      setError("");

      const updatedWord =
        await toggleWordFavorite(
          word.id,
        );

      setWord(updatedWord);
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "收藏單字失敗。",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    if (!word || isUpdating) {
      return;
    }

    const confirmed =
      window.confirm(
        `確定要刪除「${word.word}」嗎？`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setIsUpdating(true);
      setError("");

      await deleteWord(word.id);

      router.push("/words");
      router.refresh();
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "刪除單字失敗。",
      );

      setIsUpdating(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-slate-500">
          載入雲端單字中……
        </p>
      </div>
    );
  }

  if (error && !word) {
    return (
      <div className="min-h-screen px-5 py-10">
        <button
          type="button"
          onClick={() =>
            router.push("/words")
          }
          className="text-sm font-medium text-slate-600"
        >
          ← 返回單字庫
        </button>

        <section className="mt-10 rounded-3xl bg-red-50 p-6">
          <h1 className="font-bold text-red-700">
            無法讀取單字
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>
        </section>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="min-h-screen px-5 py-10">
        <button
          type="button"
          onClick={() =>
            router.push("/words")
          }
          className="text-sm font-medium text-slate-600"
        >
          ← 返回單字庫
        </button>

        <div className="mt-16 rounded-3xl border border-dashed border-slate-300 p-8 text-center">
          <p className="font-bold">
            找不到這個單字
          </p>

          <p className="mt-2 text-sm text-slate-500">
            這個單字可能已經被刪除。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      <header className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() =>
            router.push("/words")
          }
          className="text-sm font-medium text-slate-600"
        >
          ← 返回單字庫
        </button>

        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
          {word.level}
        </span>
      </header>

      <section className="mt-7 rounded-[32px] bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-100">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-indigo-100">
              Cloud vocabulary
            </p>

            <h1 className="mt-2 break-words text-4xl font-bold">
              {word.word}
            </h1>

            <p className="mt-3 text-lg text-indigo-50">
              {word.meaning}
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() =>
                void handleFavorite()
              }
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl disabled:opacity-50"
              aria-label={
                word.isFavorite
                  ? "取消收藏"
                  : "加入收藏"
              }
            >
              {word.isFavorite
                ? "♥"
                : "♡"}
            </button>

            <button
              type="button"
              onClick={() =>
                speakText(word.word)
              }
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl"
              aria-label="播放單字發音"
            >
              🔊
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs">
            {partOfSpeechLabel[
              word.partOfSpeech
            ] ?? word.partOfSpeech}
          </span>

          <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs">
            {word.category}
          </span>

          <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs">
            {statusLabel[word.status]}
          </span>
        </div>
      </section>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="mt-6">
        <h2 className="font-bold">
          學習狀態
        </h2>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatusButton
            active={
              word.status === "new"
            }
            disabled={isUpdating}
            onClick={() =>
              void changeStatus("new")
            }
          >
            新單字
          </StatusButton>

          <StatusButton
            active={
              word.status ===
              "learning"
            }
            disabled={isUpdating}
            onClick={() =>
              void changeStatus(
                "learning",
              )
            }
          >
            學習中
          </StatusButton>

          <StatusButton
            active={
              word.status ===
              "mastered"
            }
            disabled={isUpdating}
            onClick={() =>
              void changeStatus(
                "mastered",
              )
            }
          >
            已熟悉
          </StatusButton>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-bold">
            英文例句
          </h2>

          {word.example && (
            <button
              type="button"
              onClick={() =>
                speakText(
                  word.example,
                  0.82,
                )
              }
              className="shrink-0 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600"
            >
              🔊 播放
            </button>
          )}
        </div>

        {word.example ? (
          <>
            <p className="mt-4 text-lg font-medium leading-8 text-slate-900">
              {word.example}
            </p>

            {word.exampleTranslation && (
              <p className="mt-3 leading-7 text-slate-500">
                {
                  word.exampleTranslation
                }
              </p>
            )}
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            尚未新增例句。
          </p>
        )}
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-emerald-50 p-5">
          <p className="text-sm text-slate-600">
            答對次數
          </p>

          <p className="mt-2 text-3xl font-bold">
            {word.correctCount}
          </p>
        </div>

        <div className="rounded-3xl bg-rose-50 p-5">
          <p className="text-sm text-slate-600">
            答錯次數
          </p>

          <p className="mt-2 text-3xl font-bold">
            {word.wrongCount}
          </p>
        </div>
      </section>

      <button
        type="button"
        onClick={() =>
          router.push(
            `/words/${word.id}/edit`,
          )
        }
        className="mt-8 w-full rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white"
      >
        編輯單字
      </button>

      <button
        type="button"
        disabled={isUpdating}
        onClick={() =>
          void handleDelete()
        }
        className="mt-3 w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-bold text-red-600 disabled:opacity-50"
      >
        {isUpdating
          ? "處理中……"
          : "刪除這個單字"}
      </button>
    </div>
  );
}

function StatusButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl px-3 py-3 text-sm font-semibold disabled:opacity-50 ${
        active
          ? "bg-indigo-600 text-white"
          : "border border-slate-200 bg-white text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}