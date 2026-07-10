"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getDailyTask,
} from "../../../lib/dailyTaskStorage";
import type { DailyTaskData } from "../../types/dailyTask";

const emptyTask: DailyTaskData = {
  date: "",
  vocabularyAnswered: 0,
  grammarAnswered: 0,
  mistakeReviewed: false,
};

export default function DailyTaskPage() {
  const [task, setTask] =
    useState<DailyTaskData>(emptyTask);
  const [isLoaded, setIsLoaded] =
    useState(false);

  useEffect(() => {
    setTask(getDailyTask());
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        載入每日任務中……
      </div>
    );
  }

  const vocabularyComplete =
    task.vocabularyAnswered >= 10;

  const grammarComplete =
    task.grammarAnswered >= 5;

  const completedCount = [
    vocabularyComplete,
    grammarComplete,
    task.mistakeReviewed,
  ].filter(Boolean).length;

  const percentage = Math.round(
    (completedCount / 3) * 100,
  );

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      <Link
        href="/practice"
        className="text-sm font-medium text-slate-600"
      >
        ← 返回練習中心
      </Link>

      <header className="mt-6 rounded-[32px] bg-indigo-600 p-6 text-white">
        <p className="text-sm text-indigo-100">
          Daily mission
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          每日任務
        </h1>

        <p className="mt-2 text-sm text-indigo-100">
          {task.date}
        </p>

        <div className="mt-6 flex items-end gap-3">
          <p className="text-5xl font-bold">
            {percentage}%
          </p>

          <p className="pb-1 text-sm text-indigo-100">
            已完成 {completedCount}／3
          </p>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      </header>

      <section className="mt-6 space-y-3">
        <TaskCard
          title="單字練習"
          description={`${Math.min(
            task.vocabularyAnswered,
            10,
          )}／10 題`}
          complete={vocabularyComplete}
          href="/practice/vocabulary"
        />

        <TaskCard
          title="文法練習"
          description={`${Math.min(
            task.grammarAnswered,
            5,
          )}／5 題`}
          complete={grammarComplete}
          href="/grammar/practice"
        />

        <TaskCard
          title="複習錯題"
          description={
            task.mistakeReviewed
              ? "今天已複習"
              : "今天尚未複習"
          }
          complete={task.mistakeReviewed}
          href="/mistakes"
        />
      </section>

      {completedCount === 3 && (
        <section className="mt-6 rounded-3xl bg-emerald-50 p-6 text-center">
          <p className="text-3xl">🎉</p>

          <h2 className="mt-3 text-xl font-bold text-emerald-900">
            今天的任務完成了！
          </h2>

          <p className="mt-2 text-sm text-emerald-700">
            明天會自動產生新的每日任務。
          </p>
        </section>
      )}
    </div>
  );
}

function TaskCard({
  title,
  description,
  complete,
  href,
}: {
  title: string;
  description: string;
  complete: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5"
    >
      <div>
        <h2 className="font-bold">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
          complete
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {complete ? "✓" : "○"}
      </span>
    </Link>
  );
}