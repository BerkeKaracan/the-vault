"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/i18n/provider";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function LoginForm({ next = "/desk" }: { next?: string }) {
  const { dictionary } = useI18n();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const supabase = createClient();

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) {
          setMessage(error.message);
          return;
        }
        setMessage(dictionary.login.signupSuccess);
        setMode("login");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      window.location.href = next;
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setMessage(null);
          }}
          className={
            mode === "login"
              ? "text-foreground underline underline-offset-4"
              : "text-muted hover:text-foreground/80"
          }
        >
          {dictionary.login.tabLogin}
        </button>
        <span className="text-muted">/</span>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setMessage(null);
          }}
          className={
            mode === "signup"
              ? "text-foreground underline underline-offset-4"
              : "text-muted hover:text-foreground/80"
          }
        >
          {dictionary.login.tabSignup}
        </button>
      </div>

      <label className="flex flex-col gap-1.5 text-sm text-muted">
        {dictionary.login.email}
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-border bg-elevated px-3 py-2 text-foreground outline-none focus:border-accent/50"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-muted">
        {dictionary.login.password}
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-border bg-elevated px-3 py-2 text-foreground outline-none focus:border-accent/50"
        />
      </label>

      {message ? (
        <output className="text-sm text-muted">{message}</output>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition hover:bg-foreground disabled:opacity-50"
      >
        {pending
          ? dictionary.busy
          : mode === "login"
            ? dictionary.login.submitLogin
            : dictionary.login.submitSignup}
      </button>
    </form>
  );
}
