"use client";

import { useState } from "react";
import { downloadBackup } from "../../lib/backup";

export default function SettingsPage() {
  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [isExporting, setIsExporting] =
    useState(false);

  async function handleExport() {
    try {
      setIsExporting(true);
      setMessage("");
      setError("");

      await downloadBackup();

      setMessage("雲端資料已成功匯出。");
    } catch (caughtError) {
      console.error(caughtError);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "匯出備份失敗。",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="min-h-screen px-5 pb-10 pt-10">
      <header>
        <p className="text-sm text-slate-500">
          Data settings
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          資料設定
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          匯出目前帳號儲存在 Supabase 的單字與文法資料。
        </p>
      </header>

      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold">
          匯出雲端備份
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          備份檔將包含單字、文法筆記與文法題目。
        </p>

        <button
          type="button"
          disabled={isExporting}
          onClick={() => void handleExport()}
          className="mt-5 w-full rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white disabled:opacity-50"
        >
          {isExporting
            ? "正在整理資料……"
            : "匯出資料"}
        </button>
      </section>

      <section className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-bold text-amber-900">
          匯入功能暫時停用
        </h2>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          資料已改成 Supabase 雲端格式，之後再加入安全的匯入功能。
        </p>
      </section>

      {message && (
        <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}