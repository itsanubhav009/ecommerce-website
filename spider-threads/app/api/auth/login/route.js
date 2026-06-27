import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req) {
  const { email, password } = await req.json();
  const user = getUserByEmail(email || "");
  if (!user || !bcrypt.compareSync(password || "", user.password)) {
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }

  const token = signToken({ id: user.id, role: user.role });
  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
