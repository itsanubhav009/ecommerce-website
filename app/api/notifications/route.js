import { NextResponse } from "next/server";
import { getNotifications, getUnreadCount, markAllRead } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  return NextResponse.json({
    notifications: await getNotifications(),
    unread: await getUnreadCount(),
  });
}

// Mark all as read
export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  await markAllRead();
  return NextResponse.json({ ok: true });
}
