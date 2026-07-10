"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWords } from "../lib/wordStorage";
import { getGrammarQuestions } from "../lib/grammarStorage";
import { supabase } from "../lib/supabase";

interface HomeStats {
  wordCount: number;
  grammarQuestionCount: number;
  accuracy: number;
  mistakeCount: number;
}

const emptyStats: HomeStats = {
  wordCount: 0,
  grammarQuestionCount: 0,
  accuracy: 0,
  mistakeCount: 0,
};

export default function HomePage() {
  const router = useRouter();

  const [stats, setStats] =
    useState<HomeStats>(emptyStats);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHomeData() {
      try {
        setError("");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        const words = await getWords();

        /*
          目前 grammarStorage 仍是 localStorage 版本，
          所以這裡暫時不加 await。
          等文法也改成 Supabase 後，再改成：
          const grammarQuestions =
            await getGrammarQuestions();
        */
        const grammarQuestions =
          getGrammarQuestions();

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

        const correct =
          wordCorrect + grammarCorrect;

        const wrong =
          wordWrong + grammarWrong;

        const total = correct + wrong;

        setStats({
          wordCount: words.length,

          grammarQuestionCount:
            grammarQuestions.length,

          accuracy:
            total > 0
              ? Math.round(
                  (correct / total) * 100,
                )
              : 0,

          mistakeCount:
            words.filter(
              (word) =>
                word.wrongCount > 0,
            ).length +
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
            : "首頁資料載入失敗。",
        );
      } finally {
        setIsLoaded(true);
      }
    }

    void loadHomeData();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-slate-500">
          載入學習資料中……
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-5 py-10">
        <div className="rounded-3xl bg-red-50 p-6">
          <h1 className="text-lg font-bold text-red-700">
            無法載入資料
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.replace("/login")
            }
            className="mt-5 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white"
          >
            前往登入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="rounded-b-[36px] bg-indigo-600 px-6 pb-8 pt-10 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-indigo-100">
              Welcome back
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              孟澤，今天也來學英文吧！
            </h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold"
          >
            登出
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-indigo-100">
          從單字、文法或錯題中選擇今天的練習。
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/15 p-4">
            <p className="text-sm text-indigo-100">
              已學單字
            </p>

            <p className="mt-2 text-2xl font-bold">
              {stats.wordCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white/15 p-4">
            <p className="text-sm text-indigo-100">
              答題正確率
            </p>

            <p className="mt-2 text-2xl font-bold">
              {stats.accuracy}%
            </p>
          </div>
        </div>
      </header>

      <main className="px-5 py-7">
        <section>
          <p className="text-sm text-slate-500">
            Today&apos;s learning
          </p>

          <h2 className="mt-1 text-xl font-bold">
            今天要練習什麼？
          </h2>

          <div className="mt-5 space-y-3">
            <HomeCard
              href="/practice/vocabulary"
              title="單字四選一"
              description={`目前共有 ${stats.wordCount} 個單字`}
              badge="Vocabulary"
            />

            <HomeCard
              href="/grammar/practice"
              title="文法四選一"
              description={`目前共有 ${stats.grammarQuestionCount} 題`}
              badge="Grammar"
            />

            <HomeCard
              href="/mistakes"
              title="錯題複習"
              description={
                stats.mistakeCount > 0
                  ? `目前有 ${stats.mistakeCount} 組內容需要複習`
                  : "目前沒有尚未複習的錯題"
              }
              badge="Review"
            />
          </div>
        </section>

        <Link
          href="/practice"
          className="mt-6 block rounded-2xl bg-indigo-600 px-5 py-4 text-center font-bold text-white"
        >
          進入練習中心
        </Link>

        <section className="mt-8 grid grid-cols-2 gap-3">
          <Link
            href="/words/new"
            className="rounded-3xl bg-amber-50 p-5"
          >
            <p className="text-2xl">＋</p>

            <p className="mt-4 font-bold">
              新增單字
            </p>
          </Link>

          <Link
            href="/grammar/new"
            className="rounded-3xl bg-emerald-50 p-5"
          >
            <p className="text-2xl">＋</p>

            <p className="mt-4 font-bold">
              新增文法
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}

function HomeCard({
  href,
  title,
  description,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-3xl border border-slate-200 bg-white p-5"
    >
      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
        {badge}
      </span>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold">{title}</h3>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <span className="text-2xl text-slate-300">
          ›
        </span>
      </div>
    </Link>
  );
}