"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] =
    useState<AuthMode>("login");

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace("/");
      }
    }

    void checkUser();
  }, [router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim() || !password) {
      setError("請填寫 Email 與密碼。");
      return;
    }

    if (password.length < 6) {
      setError("密碼至少需要 6 個字元。");
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === "signup") {
        const { error: signUpError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
          });

        if (signUpError) {
          throw signUpError;
        }

        setMessage(
          "註冊成功。若 Supabase 開啟 Email confirmation，請先到信箱完成驗證。",
        );

        return;
      }

      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        throw signInError;
      }

      router.replace("/");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "登入失敗，請稍後再試。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10">
      <main className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-xl">
        <p className="text-sm text-indigo-600">
          Mengze English
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {mode === "login"
            ? "登入學習帳號"
            : "建立學習帳號"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          登入後，單字資料會儲存在 Supabase 雲端。
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
            className={`rounded-xl px-4 py-3 text-sm font-bold ${
              mode === "login"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            登入
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setMessage("");
            }}
            className={`rounded-xl px-4 py-3 text-sm font-bold ${
              mode === "signup"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            註冊
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="example@email.com"
              autoComplete="email"
              className="input-style"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              密碼
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="至少 6 個字元"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              className="input-style"
            />
          </label>

          {message && (
            <p className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-indigo-600 px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "處理中……"
              : mode === "login"
                ? "登入"
                : "建立帳號"}
          </button>
        </form>
      </main>
    </div>
  );
}