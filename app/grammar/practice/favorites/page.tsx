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
import type { GrammarNote } from "../../types/grammar";

type FavoriteTab = "words" | "grammar";

export default function FavoritesPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [notes, setNotes] = useState<
    GrammarNote[]
  >([]);
  const [activeTab, setActiveTab] =
    useState<FavoriteTab>("words");
  const [isLoaded, setIsLoaded] =
    useState(false);

  useEffect(() => {
    setWords(getFavoriteWords());
    setNotes(getFavoriteGrammarNotes());
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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

        <p className="mt-2 text-sm text-slate-500">
          查看你特別想複習的單字與文法。
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("words")}
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
                className="block rounded-3xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {word.word}
                    </h2>

                    <p className="mt-1 text-slate-600">
                      {word.meaning}
                    </p>
                  </div>

                  <span className="text-xl text-red-500">
                    ♥
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-500">
                  {word.category}・{word.level}
                </p>
              </Link>
            ))
          ) : (
            <EmptyState text="目前沒有收藏單字。" />
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
                className="block rounded-3xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold">
                      {note.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {note.explanation}
                    </p>
                  </div>

                  <span className="text-xl text-red-500">
                    ♥
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-500">
                  {note.category}・{note.level}
                </p>
              </Link>
            ))
          ) : (
            <EmptyState text="目前沒有收藏文法。" />
          )}
        </section>
      )}
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
      <p className="font-semibold">{text}</p>

      <p className="mt-2 text-sm text-slate-500">
        到單字或文法詳細頁按下愛心收藏。
      </p>
    </div>
  );
}