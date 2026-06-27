import { NextResponse } from "next/server";
import { getProduct, updateProduct, deleteProduct } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req, { params }) {
  const product = await getProduct(params.id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const body = await req.json();
  const product = await updateProduct(params.id, body);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function DELETE(req, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const ok = await deleteProduct(params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
