import { NextResponse } from "next/server";
import { markNotificationRead } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req, { params }) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const n = markNotificationRead(params.id);
  if (!n) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ notification: n });
}
