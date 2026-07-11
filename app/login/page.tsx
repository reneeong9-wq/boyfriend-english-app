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

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isCheckingSession, setIsCheckingSession] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(sessionError);
        }

        if (
          isMounted &&
          session?.user
        ) {
          router.replace("/");
          router.refresh();
          return;
        }
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "SIGNED_IN" &&
          session?.user
        ) {
          router.replace("/");
          router.refresh();
        }
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  function changeMode(
    nextMode: AuthMode,
  ) {
    setMode(nextMode);
    setMessage("");
    setError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "請填寫 Email 與密碼。",
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "密碼至少需要 6 個字元。",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === "signup") {
        const emailRedirectTo =
          typeof window !== "undefined"
            ? `${window.location.origin}/login`
            : undefined;

        const {
          data,
          error: signUpError,
        } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo,
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        /*
          如果 Supabase 關閉 Email confirmation，
          註冊後可能直接取得 session。
        */
        if (data.session) {
          router.replace("/");
          router.refresh();
          return;
        }

        setMessage(
          "註冊成功！請到信箱點擊驗證連結，完成後再回來登入。",
        );

        setMode("login");
        setPassword("");
        return;
      }

      const {
        data,
        error: signInError,
      } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (signInError) {
        throw signInError;
      }

      if (!data.session) {
        throw new Error(
          "登入成功，但沒有取得登入狀態。請重新整理後再試。",
        );
      }

      router.replace("/");
      router.refresh();
    } catch (caughtError) {
      console.error(caughtError);

      const errorMessage =
        caughtError instanceof Error
          ? caughtError.message
          : "登入失敗，請稍後再試。";

      if (
        errorMessage
          .toLowerCase()
          .includes(
            "email not confirmed",
          )
      ) {
        setError(
          "Email 尚未驗證，請先到信箱點擊確認連結。",
        );
      } else if (
        errorMessage
          .toLowerCase()
          .includes(
            "invalid login credentials",
          )
      ) {
        setError(
          "Email 或密碼錯誤，請重新確認。",
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <p className="text-sm text-slate-500">
          確認登入狀態中……
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10">
      <main className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-xl">
        <p className="text-sm font-semibold text-indigo-600">
          Mengze English
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {mode === "login"
            ? "登入學習帳號"
            : "建立學習帳號"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          登入後，單字、文法與學習紀錄會同步儲存在雲端。
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() =>
              changeMode("login")
            }
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
              mode === "login"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            登入
          </button>

          <button
            type="button"
            onClick={() =>
              changeMode("signup")
            }
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
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
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="example@email.com"
              autoComplete="email"
              required
              className="input-style"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              密碼
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="至少 6 個字元"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              minLength={6}
              required
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