"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getWords } from "../../lib/wordStorage";

import {
  getGrammarNotes,
  getGrammarQuestions,
} from "../../lib/grammarStorage";

import { supabase } from "../../lib/supabase";

interface LearningStats {
  wordCount: number;
  masteredWordCount: number;
  favoriteWordCount: number;

  grammarNoteCount: number;
  favoriteGrammarCount: number;
  grammarQuestionCount: number;

  correctAnswers: number;
  wrongAnswers: number;
  totalAnswers: number;
  accuracy: number;

  wordMistakeCount: number;
  grammarMistakeCount: number;
}

const emptyStats: LearningStats = {
  wordCount: 0,
  masteredWordCount: 0,
  favoriteWordCount: 0,

  grammarNoteCount: 0,
  favoriteGrammarCount: 0,
  grammarQuestionCount: 0,

  correctAnswers: 0,
  wrongAnswers: 0,
  totalAnswers: 0,
  accuracy: 0,

  wordMistakeCount: 0,
  grammarMistakeCount: 0,
};

export default function ProfilePage() {
  const router = useRouter();

  const [stats, setStats] =
    useState<LearningStats>(emptyStats);

  const [userEmail, setUserEmail] =
    useState("");

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(
            `無法取得登入資料：${userError.message}`,
          );
        }

        if (!user) {
          router.replace("/login");
          return;
        }

        setUserEmail(user.email ?? "");

        const [
          words,
          grammarNotes,
          grammarQuestions,
        ] = await Promise.all([
          getWords(),
          getGrammarNotes(),
          getGrammarQuestions(),
        ]);

        const wordCorrect = words.reduce(
          (total, word) =>
            total + word.correctCount,
          0,
        );

        const wordWrong = words.reduce(
          (total, word) =>
            total + word.wrongCount,
          0,
        );

        const grammarCorrect =
          grammarQuestions.reduce(
            (total, question) =>
              total +
              question.correctCount,
            0,
          );

        const grammarWrong =
          grammarQuestions.reduce(
            (total, question) =>
              total +
              question.wrongCount,
            0,
          );

        const correctAnswers =
          wordCorrect + grammarCorrect;

        const wrongAnswers =
          wordWrong + grammarWrong;

        const totalAnswers =
          correctAnswers + wrongAnswers;

        const accuracy =
          totalAnswers > 0
            ? Math.round(
                (correctAnswers /
                  totalAnswers) *
                  100,
              )
            : 0;

        setStats({
          wordCount: words.length,

          masteredWordCount:
            words.filter(
              (word) =>
                word.status === "mastered",
            ).length,

          favoriteWordCount:
            words.filter(
              (word) => word.isFavorite,
            ).length,

          grammarNoteCount:
            grammarNotes.length,

          favoriteGrammarCount:
            grammarNotes.filter(
              (note) => note.isFavorite,
            ).length,

          grammarQuestionCount:
            grammarQuestions.length,

          correctAnswers,
          wrongAnswers,
          totalAnswers,
          accuracy,

          wordMistakeCount:
            words.filter(
              (word) =>
                word.wrongCount > 0,
            ).length,

          grammarMistakeCount:
            grammarQuestions.filter(
              (question) =>
                question.wrongCount > 0,
            ).length,
        });
      } catch (caughtError) {
        console.error(caughtError);

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "無法讀取學習紀錄。",
        );
      } finally {
        setIsLoaded(true);
      }
    }

    void loadProfile();
  }, [router]);

  async function handleLogout() {
    const { error: signOutError } =
      await supabase.auth.signOut();

    if (signOutError) {
      setError(
        `登出失敗：${signOutError.message}`,
      );
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-slate-500">
          載入雲端學習紀錄中……
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-5 py-10">
        <div className="rounded-3xl bg-red-50 p-6">
          <h1 className="text-lg font-bold text-red-700">
            無法載入學習紀錄
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  const totalMistakes =
    stats.wordMistakeCount +
    stats.grammarMistakeCount;

  return (
    <div className="min-h-screen px-5 pb-10 pt-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            Learning profile
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            我的學習紀錄
          </h1>

          {userEmail && (
            <p className="mt-2 break-all text-sm text-slate-500">
              {userEmail}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600"
        >
          登出
        </button>
      </header>

      <section className="mt-7 rounded-[32px] bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-100">
        <p className="text-sm text-indigo-100">
          整體答題正確率
        </p>

        <div className="mt-3 flex items-end gap-3">
          <p className="text-5xl font-bold">
            {stats.accuracy}%
          </p>

          <p className="pb-1 text-sm text-indigo-100">
            共完成 {stats.totalAnswers} 題
          </p>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-300"
            style={{
              width: `${stats.accuracy}%`,
            }}
          />
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <StatCard
          label="答對題數"
          value={stats.correctAnswers}
          className="bg-emerald-50"
        />

        <StatCard
          label="答錯題數"
          value={stats.wrongAnswers}
          className="bg-rose-50"
        />

        <StatCard
          label="單字總數"
          value={stats.wordCount}
          className="bg-amber-50"
        />

        <StatCard
          label="已熟悉單字"
          value={stats.masteredWordCount}
          className="bg-sky-50"
        />

        <StatCard
          label="收藏單字"
          value={stats.favoriteWordCount}
          className="bg-pink-50"
        />

        <StatCard
          label="文法筆記"
          value={stats.grammarNoteCount}
          className="bg-violet-50"
        />

        <StatCard
          label="收藏文法"
          value={stats.favoriteGrammarCount}
          className="bg-fuchsia-50"
        />

        <StatCard
          label="文法題目"
          value={stats.grammarQuestionCount}
          className="bg-slate-100"
        />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">
          需要複習
        </h2>

        <div className="mt-4 rounded-3xl bg-rose-50 p-5">
          <p className="text-sm text-rose-700">
            目前需要複習
          </p>

          <p className="mt-2 text-3xl font-bold text-rose-900">
            {totalMistakes}
          </p>

          <p className="mt-2 text-sm text-rose-700">
            單字 {stats.wordMistakeCount} 個・文法{" "}
            {stats.grammarMistakeCount} 題
          </p>

          <Link
            href="/mistakes"
            className="mt-5 inline-block rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white"
          >
            前往錯題本
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">
          快速前往
        </h2>

        <div className="mt-4 space-y-3">
          <ProfileLink
            href="/practice/daily"
            title="每日任務"
            description="查看今天的任務進度"
          />

          <ProfileLink
            href="/practice/favorites"
            title="我的收藏"
            description="查看收藏單字與文法"
          />

          <ProfileLink
            href="/words"
            title="管理單字"
            description="新增、查看與編輯雲端單字"
          />

          <ProfileLink
            href="/grammar"
            title="管理文法"
            description="建立文法筆記與題目"
          />

          <ProfileLink
            href="/settings"
            title="資料設定"
            description="管理備份與網站資料"
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div
      className={`rounded-3xl p-5 ${className}`}
    >
      <p className="text-sm text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function ProfileLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5"
    >
      <div>
        <p className="font-bold">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <span className="text-2xl text-slate-300">
        ›
      </span>
    </Link>
  );
}