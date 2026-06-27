import { NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ products: await getProducts() });
}

export async function POST(req) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }
  const body = await req.json();
  if (!body.name || body.price == null) {
    return NextResponse.json({ error: "Name and price are required." }, { status: 400 });
  }
  const product = await createProduct(body);
  return NextResponse.json({ product }, { status: 201 });
}
