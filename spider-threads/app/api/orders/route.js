import { NextResponse } from "next/server";
import { createOrder, getOrders, getOrdersByUser, getProduct } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/auth";

// Admin sees all orders; a logged-in user sees their own.
export async function GET() {
  const user = getSession();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  const orders = user.role === "ADMIN" ? getOrders() : getOrdersByUser(user.id);
  return NextResponse.json({ orders });
}

export async function POST(req) {
  const user = getSession();
  if (!user) return NextResponse.json({ error: "Log in to place an order." }, { status: 401 });

  const { items, phone, callTime, address } = await req.json();
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (!phone || !callTime || !address) {
    return NextResponse.json({ error: "Phone, call time and address are required." }, { status: 400 });
  }

  // Validate against live stock & price (never trust client totals).
  const cleanItems = [];
  let total = 0;
  for (const it of items) {
    const p = getProduct(it.id);
    if (!p) return NextResponse.json({ error: `A product is no longer available.` }, { status: 400 });
    if (p.stock <= 0) return NextResponse.json({ error: `"${p.name}" is sold out.` }, { status: 400 });
    const qty = Math.min(Math.max(1, Number(it.quantity) || 1), p.stock);
    cleanItems.push({ productId: p.id, name: p.name, price: p.price, quantity: qty });
    total += p.price * qty;
  }

  const order = createOrder({
    userId: user.id,
    userName: user.name,
    items: cleanItems,
    total,
    phone,
    callTime,
    address,
  });

  return NextResponse.json({ order }, { status: 201 });
}
