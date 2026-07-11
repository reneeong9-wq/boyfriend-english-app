"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getFavoriteWords,
} from "../../../lib/wordStorage";

import {
  getFavoriteGrammarNotes,
} from "../../../lib/grammarStorage";

import type {
  Word,
} from "../../types/word";

import type {
  GrammarNote,
} from "../../types/grammar";

type FavoriteTab =
  | "words"
  | "grammar";

export default function FavoritesPage() {
  const [favoriteWords, setFavoriteWords] =
    useState<Word[]>([]);

  const [
    favoriteGrammarNotes,
    setFavoriteGrammarNotes,
  ] = useState<GrammarNote[]>([]);

  const [activeTab, setActiveTab] =
    useState<FavoriteTab>("words");

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadFavorites() {
      try {
        setError("");

        const [
          words,
          grammarNotes,
        ] = await Promise.all([
          getFavoriteWords(),
          getFavoriteGrammarNotes(),
        ]);

        setFavoriteWords(words);
        setFavoriteGrammarNotes(
          grammarNotes,
        );
      } catch (caughtError) {
        console.error(caughtError);

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "無法讀取收藏內容。",
        );
      } finally {
        setIsLoaded(true);
      }
    }

    void loadFavorites();
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-slate-500">
          載入雲端收藏中……
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
          Favorites
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          我的收藏
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          查看特別收藏的單字與文法筆記。
        </p>
      </header>

      {error && (
        <section className="mt-5 rounded-3xl bg-red-50 p-5">
          <h2 className="font-bold text-red-700">
            無法載入收藏
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
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
          className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
            activeTab === "words"
              ? "bg-violet-600 text-white"
              : "border border-slate-200 bg-white text-slate-600"
          }`}
        >
          收藏單字{" "}
          {favoriteWords.length}
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("grammar")
          }
          className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
            activeTab === "grammar"
              ? "bg-teal-800 text-white"
              : "border border-slate-200 bg-white text-slate-600"
          }`}
        >
          收藏文法{" "}
          {favoriteGrammarNotes.length}
        </button>
      </section>

      {activeTab === "words" && (
        <section className="mt-6 space-y-3">
          {favoriteWords.length > 0 ? (
            favoriteWords.map((word) => (
              <Link
                key={word.id}
                href={`/words/${word.id}`}
                className="block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-bold text-slate-900">
                      {word.word}
                    </h2>

                    <p className="mt-1 text-slate-600">
                      {word.meaning}
                    </p>
                  </div>

                  <span className="shrink-0 text-2xl text-amber-500">
                    ★
                  </span>
                </div>

                {word.example && (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm leading-6 text-slate-700">
                      {word.example}
                    </p>

                    {word.exampleTranslation && (
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {
                          word.exampleTranslation
                        }
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
                    {word.level}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {word.category}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {word.partOfSpeech}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              icon="☆"
              title="目前沒有收藏單字"
              description="進入單字詳細頁後，按下收藏按鈕，單字就會顯示在這裡。"
              href="/words"
              buttonText="前往單字庫"
              buttonClassName="bg-violet-600"
            />
          )}
        </section>
      )}

      {activeTab === "grammar" && (
        <section className="mt-6 space-y-3">
          {favoriteGrammarNotes.length >
          0 ? (
            favoriteGrammarNotes.map(
              (note) => (
                <Link
                  key={note.id}
                  href={`/grammar/${note.id}`}
                  className="block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="break-words text-lg font-bold leading-7 text-slate-900">
                        {note.title}
                      </h2>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                        {note.explanation}
                      </p>
                    </div>

                    <span className="shrink-0 text-2xl text-amber-500">
                      ★
                    </span>
                  </div>

                  {note.structure && (
                    <div className="mt-4 rounded-2xl bg-teal-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                        Structure
                      </p>

                      <p className="mt-2 text-sm font-medium leading-6 text-teal-900">
                        {note.structure}
                      </p>
                    </div>
                  )}

                  {note.example && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm leading-6 text-slate-700">
                        {note.example}
                      </p>

                      {note.exampleTranslation && (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {
                            note.exampleTranslation
                          }
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      {note.level}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {note.category}
                    </span>
                  </div>
                </Link>
              ),
            )
          ) : (
            <EmptyState
              icon="☆"
              title="目前沒有收藏文法"
              description="進入文法筆記詳細頁後，按下收藏按鈕，筆記就會顯示在這裡。"
              href="/grammar"
              buttonText="前往文法筆記"
              buttonClassName="bg-teal-800"
            />
          )}
        </section>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  href,
  buttonText,
  buttonClassName,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  buttonClassName: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-4xl text-amber-500">
        {icon}
      </p>

      <h2 className="mt-4 text-lg font-bold">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <Link
        href={href}
        className={`mt-6 inline-block rounded-2xl px-5 py-3 text-sm font-bold text-white ${buttonClassName}`}
      >
        {buttonText}
      </Link>
    </div>
  );
}