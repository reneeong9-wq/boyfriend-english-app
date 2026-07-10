"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  deleteGrammarNote,
  getGrammarNoteById,
  toggleGrammarNoteFavorite,
} from "../../../lib/grammarStorage";
import type { GrammarNote } from "../../types/grammar";

export default function GrammarDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [note, setNote] = useState<GrammarNote | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [speechError, setSpeechError] = useState("");

  useEffect(() => {
    const foundNote = getGrammarNoteById(params.id);

    setNote(foundNote ?? null);
    setIsLoaded(true);
  }, [params.id]);

  function handleFavorite() {
    if (!note) {
      return;
    }

    const updatedNote = toggleGrammarNoteFavorite(
      note.id,
    );

    if (updatedNote) {
      setNote(updatedNote);
    }
  }

  function speakExample() {
    setSpeechError("");

    if (!note?.example) {
      return;
    }

    if (!("speechSynthesis" in window)) {
      setSpeechError(
        "目前的瀏覽器不支援英文發音。",
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(note.example);

    utterance.lang = "en-US";
    utterance.rate = 0.82;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }

  function handleEdit() {
    if (!note) {
      return;
    }

    router.push(`/grammar/${note.id}/edit`);
  }

  function handleDelete() {
    if (!note) {
      return;
    }

    const confirmed = window.confirm(
      `確定要刪除「${note.title}」嗎？`,
    );

    if (!confirmed) {
      return;
    }

    deleteGrammarNote(note.id);
    router.push("/grammar");
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-slate-500">
          載入文法筆記中……
        </p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen px-5 py-10">
        <button
          type="button"
          onClick={() => router.push("/grammar")}
          className="text-sm font-medium text-slate-600"
        >
          ← 返回文法首頁
        </button>

        <div className="mt-20 rounded-3xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-lg font-bold">
            找不到這篇文法筆記
          </p>

          <p className="mt-2 text-sm text-slate-500">
            這篇筆記可能已經被刪除。
          </p>

          <button
            type="button"
            onClick={() => router.push("/grammar")}
            className="mt-6 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white"
          >
            回到文法首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      <header className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push("/grammar")}
          className="text-sm font-medium text-slate-600"
        >
          ← 返回文法
        </button>

        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
          {note.level}
        </span>
      </header>

      <section className="mt-7 rounded-[32px] bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-100">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-indigo-100">
              Grammar note
            </p>

            <h1 className="mt-2 break-words text-3xl font-bold leading-10">
              {note.title}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleFavorite}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl transition hover:bg-white/25"
            aria-label={
              note.isFavorite
                ? "取消收藏"
                : "加入收藏"
            }
            title={
              note.isFavorite
                ? "取消收藏"
                : "加入收藏"
            }
          >
            {note.isFavorite ? "♥" : "♡"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs">
            {note.category}
          </span>

          <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs">
            {note.level}
          </span>
        </div>
      </section>

      {speechError && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {speechError}
        </p>
      )}

      <GrammarSection title="文法說明">
        <p className="leading-7 text-slate-700">
          {note.explanation}
        </p>
      </GrammarSection>

      {note.structure && (
        <GrammarSection title="句型結構">
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Structure
            </p>

            <p className="mt-2 font-semibold leading-7 text-slate-800">
              {note.structure}
            </p>
          </div>
        </GrammarSection>
      )}

      {note.example && (
        <GrammarSection title="英文例句">
          <div className="flex items-start justify-between gap-4">
            <p className="text-lg font-medium leading-8 text-slate-900">
              {note.example}
            </p>

            <button
              type="button"
              onClick={speakExample}
              className="shrink-0 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600"
            >
              🔊 播放
            </button>
          </div>

          {note.exampleTranslation && (
            <p className="mt-3 leading-7 text-slate-500">
              {note.exampleTranslation}
            </p>
          )}
        </GrammarSection>
      )}

      {note.commonMistake && (
        <GrammarSection title="常見錯誤">
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-sm leading-7 text-amber-900">
              {note.commonMistake}
            </p>
          </div>
        </GrammarSection>
      )}

      <button
        type="button"
        onClick={handleEdit}
        className="mt-8 w-full rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white transition hover:bg-indigo-700"
      >
        編輯文法筆記
      </button>

      <button
        type="button"
        onClick={handleDelete}
        className="mt-3 w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-bold text-red-600 transition hover:bg-red-100"
      >
        刪除這篇文法筆記
      </button>
    </div>
  );
}

function GrammarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
      <h2 className="font-bold text-slate-900">
        {title}
      </h2>

      <div className="mt-4">
        {children}
      </div>
    </section>
  );
}