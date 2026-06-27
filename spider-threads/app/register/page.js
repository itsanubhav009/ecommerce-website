"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Could not sign up.");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-5xl glitch">Sign up</h1>
      <p className="mt-2 text-cream/70">Join the verse. It's free.</p>

      <form onSubmit={submit} className="panel-dark mt-8 space-y-4 p-6">
        {error && <p className="bg-web px-3 py-2 text-sm font-semibold text-cream">{error}</p>}
        <div>
          <label className="mb-1 block text-sm font-semibold">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full border-2 border-cream/40 bg-ink px-3 py-2 text-cream"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="w-full border-2 border-cream/40 bg-ink px-3 py-2 text-cream"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className="w-full border-2 border-cream/40 bg-ink px-3 py-2 text-cream"
          />
          <p className="mt-1 text-xs text-cream/50">At least 6 characters.</p>
        </div>
        <button disabled={loading} className="btn btn-primary w-full py-3">
          {loading ? "..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-cream/70">
        Already have an account?{" "}
        <Link href="/login" className="link-underline text-pop">
          Log in
        </Link>
      </p>
    </div>
  );
}
