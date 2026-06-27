import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export async function POST(req) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const form = await req.formData();
  const files = form.getAll("images").filter((f) => typeof f === "object" && "arrayBuffer" in f);

  if (files.length === 0) {
    return NextResponse.json({ error: "No images provided." }, { status: 400 });
  }

  const client = supabase();
  const urls = [];

  for (const file of files) {
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `${file.name} is larger than 5MB.` }, { status: 400 });
    }

    const ext = EXT[file.type] || "png";
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
    urls.push(data.publicUrl);
  }

  return NextResponse.json({ urls });
}
