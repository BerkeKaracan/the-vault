"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/i18n/provider";
import { createClient } from "@/lib/supabase/client";

type OAuthProvider = "google" | "github";

function GoogleMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4">
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.42Z"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 4.96-.9 6.62-2.35l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.07v2.58A10 10 0 0 0 12 22Z"
        opacity=".8"
      />
      <path
        fill="currentColor"
        d="M6.42 13.99A6 6 0 0 1 6.1 12c0-.69.12-1.36.32-1.99V7.43H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.57l3.35-2.58Z"
        opacity=".65"
      />
      <path
        fill="currentColor"
        d="M12 5.96c1.47 0 2.78.5 3.82 1.49l2.86-2.86C16.95 2.97 14.7 2 12 2A10 10 0 0 0 3.07 7.43l3.35 2.58C7.2 7.72 9.4 5.96 12 5.96Z"
        opacity=".5"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.7.12 2.5.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export function LoginForm({
  next = "/desk",
  error = null,
}: {
  next?: string;
  error?: string | null;
}) {
  const { dictionary } = useI18n();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<OAuthProvider | null>(null);
  const [message, setMessage] = useState<string | null>(
    error ? dictionary.login.failed : null,
  );

  function signIn(provider: OAuthProvider) {
    setMessage(null);
    setActive(provider);
    startTransition(async () => {
      const supabase = createClient();
      const redirectTo = new URL("/auth/callback", window.location.origin);
      redirectTo.searchParams.set("next", next);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectTo.toString() },
      });

      if (oauthError) {
        setMessage(dictionary.login.failed);
        setActive(null);
      }
    });
  }

  const buttonClass =
    "flex items-center justify-center gap-3 rounded-full border border-border bg-elevated px-4 py-3 text-sm text-foreground transition hover:border-foreground/25 hover:bg-foreground/5 disabled:opacity-40";

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => signIn("google")}
        className={buttonClass}
      >
        <GoogleMark />
        {pending && active === "google"
          ? dictionary.busy
          : dictionary.login.google}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => signIn("github")}
        className={buttonClass}
      >
        <GitHubMark />
        {pending && active === "github"
          ? dictionary.busy
          : dictionary.login.github}
      </button>
      {message ? (
        <output className="mt-1 text-center text-sm text-muted">{message}</output>
      ) : null}
    </div>
  );
}
