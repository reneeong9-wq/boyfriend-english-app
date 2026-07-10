"use client";

import {
  ChangeEvent,
  useRef,
  useState,
} from "react";
import {
  downloadBackup,
  restoreBackup,
  type BackupData,
} from "../../lib/backup";

export default function SettingsPage() {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleExport() {
    setError("");
    downloadBackup();
    setMessage("備份檔已匯出。");
  }

  async function handleImport(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setMessage("");
    setError("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const backup =
        JSON.parse(text) as BackupData;

      const confirmed = window.confirm(
        "匯入後會覆蓋目前的單字與文法資料，確定繼續嗎？",
      );

      if (!confirmed) {
        event.target.value = "";
        return;
      }

      restoreBackup(backup);

      setMessage(
        "資料匯入成功，請重新整理頁面。",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "無法讀取這個備份檔。",
      );
    }

    event.target.value = "";
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
          匯出教材與學習紀錄，或從備份檔恢復資料。
        </p>
      </header>

      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold">
          匯出備份
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          將單字、文法筆記、題目與答題次數儲存為 JSON 檔案。
        </p>

        <button
          type="button"
          onClick={handleExport}
          className="mt-5 w-full rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white"
        >
          匯出資料
        </button>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold">
          匯入備份
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          匯入之前匯出的 JSON 備份檔。
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
          className="hidden"
        />

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="mt-5 w-full rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 font-bold text-indigo-600"
        >
          選擇備份檔
        </button>
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