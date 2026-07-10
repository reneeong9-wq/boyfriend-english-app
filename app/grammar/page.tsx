"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getGrammarNotes,
  getGrammarQuestions,
} from "../../lib/grammarStorage";
import type {
  GrammarNote,
  GrammarQuestion,
} from "../types/grammar";

export default function GrammarPage() {
  const [notes, setNotes] = useState<GrammarNote[]>([]);
  const [questions, setQuestions] = useState<
    GrammarQuestion[]
  >([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadGrammarData() {
      try {
        const [
          cloudNotes,
          cloudQuestions,
        ] = await Promise.all([
          getGrammarNotes(),
          getGrammarQuestions(),
        ]);
  
        setNotes(cloudNotes);
        setQuestions(cloudQuestions);
      } catch (caughtError) {
        console.error(caughtError);
  
        window.alert(
          caughtError instanceof Error
            ? caughtError.message
            : "無法讀取文法資料。",
        );
      } finally {
        setIsLoaded(true);
      }
    }
  
    void loadGrammarData();
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          載入文法內容中……
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-10">
      <header>
        <p className="text-sm text-slate-500">
          Grammar learning
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          文法學習
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          建立文法筆記、手動新增題目並進行練習。
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-indigo-50 p-5">
          <p className="text-sm text-slate-600">
            文法筆記
          </p>

          <p className="mt-2 text-3xl font-bold">
            {notes.length}
          </p>
        </div>

        <div className="rounded-3xl bg-emerald-50 p-5">
          <p className="text-sm text-slate-600">
            文法題目
          </p>

          <p className="mt-2 text-3xl font-bold">
            {questions.length}
          </p>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="/grammar/new"
          className="rounded-3xl bg-indigo-600 p-5 text-white"
        >
          <p className="text-2xl font-light">＋</p>

          <p className="mt-4 font-bold">
            新增文法筆記
          </p>

          <p className="mt-2 text-xs leading-5 text-indigo-100">
            新增說明、句型和例句
          </p>
        </Link>

        <Link
          href="/grammar/questions/new"
          className="rounded-3xl bg-slate-900 p-5 text-white"
        >
          <p className="text-2xl font-light">＋</p>

          <p className="mt-4 font-bold">
            新增文法題目
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-300">
            建立四選一與答案解析
          </p>
        </Link>
      </section>

      <Link
        href="/grammar/practice"
        className="mt-4 block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200"
      >
        <p className="text-sm font-medium text-indigo-600">
          Grammar quiz
        </p>

        <div className="mt-2 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">
              開始文法測驗
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              使用你手動新增的題目進行練習。
            </p>
          </div>

          <span className="text-2xl text-slate-300">
            ›
          </span>
        </div>
      </Link>

      <Link
        href="/grammar/questions"
        className="mt-3 block rounded-3xl border border-slate-200 bg-white p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">
              管理文法題目
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              查看與刪除已建立的題目
            </p>
          </div>

          <span className="text-2xl text-slate-300">
            ›
          </span>
        </div>
      </Link>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            文法筆記
          </h2>

          <span className="text-sm text-slate-500">
            共 {notes.length} 篇
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {notes.length > 0 ? (
            notes.map((note) => (
              <Link
                key={note.id}
                href={`/grammar/${note.id}`}
                className="block rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold leading-6">
                      {note.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {note.explanation}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                    {note.level}
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

                <div className="mt-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {note.category}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
              <p className="font-semibold">
                還沒有文法筆記
              </p>

              <p className="mt-2 text-sm text-slate-500">
                先新增第一篇文法筆記。
              </p>

              <Link
                href="/grammar/new"
                className="mt-5 inline-block rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
              >
                新增筆記
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}