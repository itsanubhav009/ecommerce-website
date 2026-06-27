import { NextResponse } from "next/server";
import { setOrderStatus } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const { status } = await req.json();
  if (!["CONFIRMED", "REJECTED", "PENDING"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const result = await setOrderStatus(params.id, status);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ order: result.order });
}
