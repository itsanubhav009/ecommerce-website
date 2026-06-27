import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/db";
import ProductDetail from "./ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) return notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/" className="link-underline text-sm text-cream/70">
        ← Back to the rack
      </Link>
      <ProductDetail product={product} />
    </div>
  );
}
