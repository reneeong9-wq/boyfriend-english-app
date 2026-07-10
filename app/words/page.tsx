"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getWords } from "../../lib/wordStorage";
import { supabase } from "../../lib/supabase";
import type {
  Word,
  WordStatus,
} from "../types/word";

type FilterType = "all" | WordStatus;

const statusLabel: Record<WordStatus, string> = {
  new: "新單字",
  learning: "學習中",
  mastered: "已熟悉",
};

export default function WordsPage() {
  const router = useRouter();

  const [words, setWords] = useState<Word[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] =
    useState<FilterType>("all");
  const [isLoaded, setIsLoaded] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWords() {
      try {
        setError("");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        const cloudWords = await getWords();
        setWords(cloudWords);
      } catch (caughtError) {
        console.error(caughtError);

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "無法讀取單字。",
        );
      } finally {
        setIsLoaded(true);
      }
    }

    void loadWords();
  }, [router]);

  const filteredWords = useMemo(() => {
    const normalizedSearch =
      searchText.trim().toLowerCase();

    return words.filter((item) => {
      const matchesSearch =
        item.word
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.meaning.includes(
          searchText.trim(),
        );

      const matchesFilter =
        filter === "all" ||
        item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [words, searchText, filter]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          載入雲端單字中……
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-8 pt-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
        
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            我的單字庫
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            目前共有 {words.length} 個單字
          </p>
        </div>

        <Link
          href="/words/new"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-2xl text-white"
        >
          ＋
        </Link>
      </header>

      {error && (
        <div className="mt-5 rounded-2xl bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-slate-100 px-4 py-3">
        <input
          type="search"
          value={searchText}
          onChange={(event) =>
            setSearchText(event.target.value)
          }
          placeholder="搜尋英文或中文"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        <FilterButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
        >
          全部
        </FilterButton>

        <FilterButton
          active={filter === "new"}
          onClick={() => setFilter("new")}
        >
          新單字
        </FilterButton>

        <FilterButton
          active={filter === "learning"}
          onClick={() =>
            setFilter("learning")
          }
        >
          學習中
        </FilterButton>

        <FilterButton
          active={filter === "mastered"}
          onClick={() =>
            setFilter("mastered")
          }
        >
          已熟悉
        </FilterButton>
      </div>

      <div className="mt-5 space-y-3">
        {filteredWords.length > 0 ? (
          filteredWords.map((item) => (
            <Link
              key={item.id}
              href={`/words/${item.id}`}
              className="block rounded-3xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">
                      {item.word}
                    </h2>

                    {item.isFavorite && (
                      <span className="text-red-500">
                        ♥
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-slate-700">
                    {item.meaning}
                  </p>
                </div>

                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  {item.level}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {item.partOfSpeech}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {item.category}
                </span>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                  {statusLabel[item.status]}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-12 text-center">
            <p className="font-semibold">
              還沒有雲端單字
            </p>

            <p className="mt-2 text-sm text-slate-500">
              請先新增第一個單字。
            </p>

            <Link
              href="/words/new"
              className="mt-5 inline-block rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
            >
              新增單字
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
        active
          ? "bg-indigo-600 text-white"
          : "border border-slate-200 bg-white text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}