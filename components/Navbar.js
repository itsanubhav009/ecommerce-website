"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";

export default function Navbar() {
  const { count } = useCart();
  const [user, setUser] = useState(null);
  const router = useRouter();

  async function loadUser() {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b-4 border-web bg-ink/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-3xl tracking-wider glitch">
          SPIDER THREADS
        </Link>

        <div className="flex items-center gap-5 text-sm font-semibold">
          <Link href="/" className="link-underline hidden sm:inline">
            Shop
          </Link>

          {user?.role === "ADMIN" && (
            <Link href="/admin" className="link-underline text-pop">
              Admin
            </Link>
          )}

          <Link href="/cart" className="relative link-underline">
            Cart
            {count > 0 && (
              <span className="absolute -right-4 -top-3 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-web px-1 text-xs font-bold text-cream">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <button onClick={logout} className="btn btn-ghost px-3 py-1 text-xs">
              Log out
            </button>
          ) : (
            <Link href="/login" className="btn btn-pop px-3 py-1 text-xs">
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
