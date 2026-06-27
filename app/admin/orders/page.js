"use client";

import { useEffect, useState } from "react";

const STATUS_STYLE = {
  PENDING: "bg-pop text-ink",
  CONFIRMED: "bg-volt text-cream",
  REJECTED: "bg-web text-cream",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/orders", { cache: "no-store" });
    const data = await res.json();
    setOrders(data.orders || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(id, status) {
    setBusy(id);
    setError("");
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setError(data.error || "Could not update order.");
      return;
    }
    load();
  }

  // Build a Google Calendar link for the scheduled call.
  function calendarLink(order) {
    const start = new Date(order.callTime);
    if (isNaN(start)) return null;
    const end = new Date(start.getTime() + 15 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const text = encodeURIComponent(`Confirm order — ${order.userName}`);
    const details = encodeURIComponent(
      `Call ${order.phone} to confirm order #${order.id.slice(0, 8)} ($${order.total.toFixed(2)}).`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${fmt(
      start
    )}/${fmt(end)}&details=${details}`;
  }

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {["ALL", "PENDING", "CONFIRMED", "REJECTED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn px-3 py-1 text-xs ${filter === f ? "btn-pop" : "btn-ghost"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="bg-web px-3 py-2 text-sm font-semibold text-cream">{error}</p>}

      {filtered.length === 0 && <p className="text-cream/60">No orders here.</p>}

      {filtered.map((o) => (
        <div key={o.id} className="panel-dark p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-2xl tracking-wide">
                Order #{o.id.slice(0, 8)}{" "}
                <span
                  className={`ml-1 inline-block px-2 py-0.5 align-middle font-impact text-xs uppercase ${
                    STATUS_STYLE[o.status]
                  }`}
                >
                  {o.status}
                </span>
              </p>
              <p className="text-sm text-cream/60">
                {o.userName} · {new Date(o.createdAt).toLocaleString()}
              </p>
            </div>
            <p className="font-impact text-2xl text-pop">${o.total.toFixed(2)}</p>
          </div>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="text-sm">
              <p className="font-impact uppercase text-cream/50">Items</p>
              {o.items.map((it) => (
                <p key={it.productId}>
                  {it.quantity} × {it.name} — ${(it.price * it.quantity).toFixed(2)}
                </p>
              ))}
            </div>
            <div className="text-sm">
              <p className="font-impact uppercase text-cream/50">Call & delivery</p>
              <p>
                Phone:{" "}
                <a href={`tel:${o.phone}`} className="link-underline text-pop">
                  {o.phone}
                </a>
              </p>
              <p>Call at: {o.callTime ? new Date(o.callTime).toLocaleString() : "—"}</p>
              <p className="text-cream/70">Ship to: {o.address}</p>
              {calendarLink(o) && (
                <a
                  href={calendarLink(o)}
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline text-volt"
                >
                  + Add call to Google Calendar
                </a>
              )}
            </div>
          </div>

          {o.status === "PENDING" && (
            <div className="mt-4 flex gap-3">
              <button
                disabled={busy === o.id}
                onClick={() => setStatus(o.id, "CONFIRMED")}
                className="btn btn-primary px-4 py-2 text-sm"
              >
                {busy === o.id ? "…" : "Bought — confirm & cut stock"}
              </button>
              <button
                disabled={busy === o.id}
                onClick={() => setStatus(o.id, "REJECTED")}
                className="btn btn-ghost px-4 py-2 text-sm"
              >
                Not bought — reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
