"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";

export default function CheckoutPage() {
  const { items, total, clear, loaded } = useCart();
  const [user, setUser] = useState(undefined); // undefined = loading
  const [form, setForm] = useState({ phone: "", callTime: "", address: "" });
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function placeOrder(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        ...form,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Could not place order.");
    setPlaced(data.order);
    clear();
  }

  if (!loaded || user === undefined) return null;

  // ---- order placed confirmation ----
  if (placed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center burst text-2xl">
          THWIP!
        </div>
        <h1 className="font-display text-5xl glitch-pop">Order in!</h1>
        <p className="mt-4 text-cream/80">
          We've sent your order to the shop. The admin will <strong>call you at {placed.callTime}</strong> on{" "}
          <strong>{placed.phone}</strong> to confirm the purchase. Once they mark it as bought, the item
          comes out of stock.
        </p>
        <div className="panel-dark mt-6 p-4 text-left text-sm">
          <p className="font-impact uppercase text-pop">Order #{placed.id.slice(0, 8)}</p>
          {placed.items.map((it) => (
            <p key={it.productId} className="mt-1">
              {it.quantity} × {it.name} — ${(it.price * it.quantity).toFixed(2)}
            </p>
          ))}
          <p className="mt-2 font-impact text-lg">Total ${placed.total.toFixed(2)}</p>
          <p className="mt-1 text-cream/60">Status: {placed.status}</p>
        </div>
        <Link href="/" className="btn btn-pop mt-6 inline-block px-6 py-3">
          Keep shopping
        </Link>
      </div>
    );
  }

  // ---- not logged in ----
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-4xl glitch">Log in to check out</h1>
        <p className="mt-3 text-cream/70">You need an account so the shop can call you back.</p>
        <Link href="/login" className="btn btn-primary mt-6 inline-block px-6 py-3">
          Log in
        </Link>
      </div>
    );
  }

  // ---- empty cart ----
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-4xl">Nothing to check out</h1>
        <Link href="/" className="btn btn-pop mt-6 inline-block px-6 py-3">
          Back to shop
        </Link>
      </div>
    );
  }

  // ---- checkout form ----
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl glitch">Checkout</h1>
      <p className="mt-2 text-cream/70">
        We confirm every order with a quick call before it ships. Pick a time that works.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <form onSubmit={placeOrder} className="panel-dark space-y-4 p-6">
          {error && <p className="bg-web px-3 py-2 text-sm font-semibold text-cream">{error}</p>}
          <div>
            <label className="mb-1 block text-sm font-semibold">Phone number</label>
            <input
              required
              type="tel"
              placeholder="+1 555 123 4567"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="w-full border-2 border-cream/40 bg-ink px-3 py-2 text-cream"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Preferred call time</label>
            <input
              required
              type="datetime-local"
              value={form.callTime}
              onChange={(e) => set("callTime", e.target.value)}
              className="w-full border-2 border-cream/40 bg-ink px-3 py-2 text-cream"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Shipping address</label>
            <textarea
              required
              rows={3}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className="w-full border-2 border-cream/40 bg-ink px-3 py-2 text-cream"
            />
          </div>
          <button disabled={loading} className="btn btn-primary w-full py-3">
            {loading ? "Placing..." : "Place order & schedule call"}
          </button>
        </form>

        <div className="panel-dark h-fit p-6">
          <h2 className="font-display text-2xl">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between">
                <span>
                  {i.quantity} × {i.name}
                </span>
                <span className="font-impact">${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t-2 border-cream/30 pt-3">
            <span className="font-impact text-lg">Total</span>
            <span className="font-impact text-2xl text-pop">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
