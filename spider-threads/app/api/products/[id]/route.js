import { NextResponse } from "next/server";
import { getProduct, updateProduct, deleteProduct } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req, { params }) {
  const product = getProduct(params.id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req, { params }) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const body = await req.json();
  const product = updateProduct(params.id, body);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function DELETE(req, { params }) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const ok = deleteProduct(params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
