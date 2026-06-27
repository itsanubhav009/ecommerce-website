"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Could not log in.");
    router.push(data.user.role === "ADMIN" ? "/admin" : "/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-5xl glitch">Log in</h1>
      <p className="mt-2 text-cream/70">Swing back into your account.</p>

      <form onSubmit={submit} className="panel-dark mt-8 space-y-4 p-6">
        {error && <p className="bg-web px-3 py-2 text-sm font-semibold text-cream">{error}</p>}
        <div>
          <label className="mb-1 block text-sm font-semibold">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-cream/40 bg-ink px-3 py-2 text-cream"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-cream/40 bg-ink px-3 py-2 text-cream"
          />
        </div>
        <button disabled={loading} className="btn btn-primary w-full py-3">
          {loading ? "..." : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-cream/70">
        No account?{" "}
        <Link href="/register" className="link-underline text-pop">
          Create one
        </Link>
      </p>

      <div className="mt-8 panel-dark p-4 text-xs text-cream/70">
        <p className="font-impact uppercase text-pop">Demo logins</p>
        <p className="mt-1">Admin — admin@spiderthreads.com / admin123</p>
        <p>User — user@example.com / user123</p>
      </div>
    </div>
  );
}
