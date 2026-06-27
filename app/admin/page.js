"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function AdminDashboard() {
  const [data, setData] = useState({ notifications: [], unread: 0 });
  const [stats, setStats] = useState({ products: 0, pending: 0, revenue: 0 });
  const [desktopOn, setDesktopOn] = useState(false);
  const lastUnread = useRef(0);

  async function load() {
    try {
      const [nRes, pRes, oRes] = await Promise.all([
        fetch("/api/notifications", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
      ]);
      const n = await nRes.json();
      const p = await pRes.json();
      const o = await oRes.json();

      // fire a desktop notification when new unread arrive
      if (desktopOn && n.unread > lastUnread.current && lastUnread.current !== 0) {
        try {
          new Notification("New order at Spider Threads", {
            body: n.notifications[0]?.message || "You have a new order.",
          });
        } catch {}
      }
      lastUnread.current = n.unread;

      const orders = o.orders || [];
      setData(n);
      setStats({
        products: (p.products || []).length,
        pending: orders.filter((x) => x.status === "PENDING").length,
        revenue: orders
          .filter((x) => x.status === "CONFIRMED")
          .reduce((s, x) => s + x.total, 0),
      });
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 8000); // poll every 8s
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktopOn]);

  async function enableDesktop() {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setDesktopOn(perm === "granted");
  }

  async function markAll() {
    await fetch("/api/notifications", { method: "POST" });
    load();
  }

  async function markOne(id) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    load();
  }

  return (
    <div className="space-y-8">
      {/* stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Products" value={stats.products} href="/admin/products" />
        <StatCard label="Pending calls" value={stats.pending} href="/admin/orders" accent />
        <StatCard label="Confirmed revenue" value={`$${stats.revenue.toFixed(2)}`} href="/admin/orders" />
      </div>

      {/* notifications */}
      <section className="panel-dark p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl tracking-wide">
            Notifications
            {data.unread > 0 && (
              <span className="ml-2 inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-web px-2 text-sm text-cream">
                {data.unread}
              </span>
            )}
          </h2>
          <div className="flex gap-3">
            {!desktopOn && (
              <button onClick={enableDesktop} className="btn btn-ghost px-3 py-1 text-xs">
                Enable desktop alerts
              </button>
            )}
            {data.unread > 0 && (
              <button onClick={markAll} className="btn btn-pop px-3 py-1 text-xs">
                Mark all read
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {data.notifications.length === 0 && (
            <p className="text-cream/60">No notifications yet. New orders show up here automatically.</p>
          )}
          {data.notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-3 border-2 p-3 ${
                n.read ? "border-cream/20 opacity-60" : "border-pop"
              }`}
            >
              <div>
                <p className="text-sm">{n.message}</p>
                <p className="mt-1 text-xs text-cream/50">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <Link href="/admin/orders" className="link-underline text-xs text-pop">
                  Open
                </Link>
                {!n.read && (
                  <button onClick={() => markOne(n.id)} className="text-xs text-cream/60 hover:text-cream">
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, href, accent }) {
  return (
    <Link
      href={href}
      className={`card-hover panel-dark block p-5 ${accent ? "!shadow-panelBlue" : ""}`}
    >
      <p className="font-impact text-sm uppercase tracking-wider text-cream/60">{label}</p>
      <p className="mt-1 font-display text-4xl text-pop">{value}</p>
    </Link>
  );
}
