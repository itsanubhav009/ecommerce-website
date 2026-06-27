import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }) {
  const user = getSession();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-4 border-web pb-3">
        <h1 className="font-display text-4xl tracking-wide">Admin HQ</h1>
        <nav className="flex gap-4 text-sm font-semibold">
          <Link href="/admin" className="link-underline">
            Dashboard
          </Link>
          <Link href="/admin/products" className="link-underline">
            Products
          </Link>
          <Link href="/admin/orders" className="link-underline">
            Orders
          </Link>
          <Link href="/" className="link-underline text-pop">
            View store
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
