import { NextResponse } from "next/server";
import { getNotifications, getUnreadCount, markAllRead } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  return NextResponse.json({
    notifications: getNotifications(),
    unread: getUnreadCount(),
  });
}

// Mark all as read
export async function POST() {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  markAllRead();
  return NextResponse.json({ ok: true });
}
