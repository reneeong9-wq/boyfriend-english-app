"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getFavoriteWords,
} from "../../../lib/wordStorage";

import {
  getFavoriteGrammarNotes,
} from "../../../lib/grammarStorage";

import type { Word } from "../../types/word";

import type {
  GrammarNote,
} from "../../types/grammar";

type FavoriteTab =
  | "words"
  | "grammar";

export default function FavoritesPage() {
  const [words, setWords] =
    useState<Word[]>([]);

  const [notes, setNotes] =
    useState<GrammarNote[]>([]);

  const [activeTab, setActiveTab] =
    useState<FavoriteTab>("words");

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFavorites() {
      try {
        setError("");

        const favoriteWords =
          await getFavoriteWords();

        setWords(favoriteWords);

        /*
          文法目前仍使用 localStorage，
          所以不需要 await。

          等 grammarStorage 改成 Supabase 後，
          再改成：

          const favoriteNotes =
            await getFavoriteGrammarNotes();

          setNotes(favoriteNotes);
        */
        const favoriteNotes =
        await getFavoriteGrammarNotes();

        setNotes(favoriteNotes);
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
          載入收藏內容中……
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
          查看你特別想複習的單字與文法。
        </p>
      </header>

      {error && (
        <section className="mt-5 rounded-3xl bg-red-50 p-5">
          <h2 className="font-bold text-red-700">
            無法讀取收藏
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>
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
          收藏單字 {words.length}
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
          收藏文法 {notes.length}
        </button>
      </section>

      {activeTab === "words" && (
        <section className="mt-6 space-y-3">
          {words.length > 0 ? (
            words.map((word) => (
              <Link
                key={word.id}
                href={`/words/${word.id}`}
                className="block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-bold">
                      {word.word}
                    </h2>

                    <p className="mt-1 text-slate-600">
                      {word.meaning}
                    </p>
                  </div>

                  <span className="shrink-0 text-xl text-rose-500">
                    ♥
                  </span>
                </div>

                {word.example && (
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                    {word.example}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {word.category}
                  </span>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                    {word.level}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              title="目前沒有收藏單字"
              description="到單字詳細頁按下愛心，就會顯示在這裡。"
              href="/words"
              buttonText="前往單字庫"
            />
          )}
        </section>
      )}

      {activeTab === "grammar" && (
        <section className="mt-6 space-y-3">
          {notes.length > 0 ? (
            notes.map((note) => (
              <Link
                key={note.id}
                href={`/grammar/${note.id}`}
                className="block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="break-words font-bold leading-7">
                      {note.title}
                    </h2>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                      {note.explanation}
                    </p>
                  </div>

                  <span className="shrink-0 text-xl text-rose-500">
                    ♥
                  </span>
                </div>

                {note.structure && (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Structure
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {note.structure}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {note.category}
                  </span>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                    {note.level}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState
              title="目前沒有收藏文法"
              description="到文法筆記詳細頁按下愛心，就會顯示在這裡。"
              href="/grammar"
              buttonText="前往文法筆記"
            />
          )}
        </section>
      )}
    </div>
  );
}

function EmptyState({
  title,
  description,
  href,
  buttonText,
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
      <p className="font-bold">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
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