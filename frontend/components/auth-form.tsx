"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { saveAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { AuthResponse } from "@/lib/types";
import styles from "@/styles/auth.module.css";

type AuthMode = "login" | "signup";

const copy = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to continue building your personal knowledge library.",
    submitLabel: "Log in",
    altLabel: "Need an account?",
    altHref: "/signup",
    altAction: "Sign up",
    endpoint: "/auth/login",
  },
  signup: {
    title: "Create your hub",
    subtitle: "Start saving links, videos, and articles in one organized place.",
    submitLabel: "Create account",
    altLabel: "Already have an account?",
    altHref: "/login",
    altAction: "Log in",
    endpoint: "/auth/signup",
  },
} as const;

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const content = copy[mode];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data = await apiRequest<AuthResponse>(content.endpoint, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveAuth(data.access_token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Personal Knowledge Hub</p>
        <h1>{content.title}</h1>
        <p className={styles.subtitle}>{content.subtitle}</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" disabled={submitting}>
            {submitting ? "Please wait..." : content.submitLabel}
          </button>
        </form>

        <p className={styles.footerText}>
          {content.altLabel} <Link href={content.altHref}>{content.altAction}</Link>
        </p>
      </section>
    </main>
  );
}
