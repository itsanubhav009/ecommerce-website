import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getUserById } from "@/lib/db";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me-in-production";
export const COOKIE_NAME = "st_token";

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// Read the logged-in user (server components & route handlers, Node runtime).
export async function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload?.id) return null;
  const user = await getUserById(payload.id);
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

export async function requireAdmin() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
