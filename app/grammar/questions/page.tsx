"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  deleteGrammarQuestion,
  getGrammarQuestions,
} from "../../../lib/grammarStorage";
import type { GrammarQuestion } from "../../types/grammar";

export default function GrammarQuestionsPage() {
  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);

  function loadQuestions() {
    setQuestions(getGrammarQuestions());
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  function handleDelete(question: GrammarQuestion) {
    const confirmed = window.confirm(
      `確定要刪除題目「${question.question}」嗎？`
    );

    if (!confirmed) {
      return;
    }

    deleteGrammarQuestion(question.id);
    loadQuestions();
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-8">
      {/* 返回 */}
      <Link
        href="/grammar"
        className="text-sm font-medium text-slate-600"
      >
        ← 返回文法
      </Link>

      {/* 標題 */}
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            文法題目管理
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            共 {questions.length} 題
          </p>
        </div>

        <Link
          href="/grammar/questions/new"
          className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white"
        >
          ＋ 新增
        </Link>
      </div>

      {/* 題目列表 */}
      <section className="mt-7 space-y-4">
        {questions.length > 0 ? (
          questions.map((question) => (
            <article
              key={question.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                    {question.category} ・ {question.level}
                  </span>

                  <h2 className="mt-4 text-lg font-bold leading-7">
                    {question.question}
                  </h2>
                </div>

                {/* 編輯 + 刪除 */}
                <div className="flex gap-4 shrink-0">
                  <Link
                    href={`/grammar/questions/${question.id}/edit`}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    編輯
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(question)}
                    className="text-sm font-semibold text-red-600 hover:text-red-800"
                  >
                    刪除
                  </button>
                </div>
              </div>

              {/* 正確答案 */}
              <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-700">
                  正確答案
                </p>

                <p className="mt-1 font-bold text-emerald-900">
                  {question.correctAnswer}
                </p>
              </div>

              {/* 統計 */}
              <div className="mt-4 flex gap-5 text-sm text-slate-500">
                <span>✅ 答對 {question.correctCount} 次</span>

                <span>❌ 答錯 {question.wrongCount} 次</span>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
            <p className="font-bold">
              還沒有文法題目
            </p>

            <p className="mt-2 text-sm text-slate-500">
              新增第一題開始練習吧！
            </p>

            <Link
              href="/grammar/questions/new"
              className="mt-5 inline-block rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
            >
              新增第一題
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}