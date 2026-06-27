import Link from "next/link";
import { getProducts } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();
  const inStock = products.filter((p) => p.stock > 0).length;

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* ---------------- HERO ---------------- */}
      <section className="relative my-10 overflow-hidden panel-dark p-8 sm:p-14">
        <div className="absolute -right-10 -top-10 h-40 w-40 burst text-3xl sm:h-52 sm:w-52 sm:text-4xl">
          <span className="-rotate-12">NEW DROP!</span>
        </div>

        <p className="font-impact uppercase tracking-[0.3em] text-volt">Limited run · Issue #01</p>
        <h1 className="mt-3 font-display text-6xl leading-none glitch sm:text-8xl">
          ACROSS THE
          <br />
          <span className="glitch-pop">WARDROBE</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-cream/80">
          Comic-book streetwear with halftone prints, glitch graphics and pop-art cuts. Every fit is
          a limited panel — when it sells, it's gone.
        </p>
        <div className="mt-7 flex flex-wrap gap-4">
          <Link href="#shop" className="btn btn-primary px-6 py-3">
            Shop the drop
          </Link>
          <span className="self-center font-impact text-sm uppercase text-cream/60">
            {inStock} styles in stock
          </span>
        </div>
      </section>

      {/* ---------------- GRID ---------------- */}
      <section id="shop" className="mb-16 scroll-mt-24">
        <div className="mb-6 flex items-end justify-between border-b-4 border-web pb-3">
          <h2 className="font-display text-4xl tracking-wide">The Rack</h2>
          <span className="font-impact text-sm uppercase text-cream/60">{products.length} items</span>
        </div>

        {products.length === 0 ? (
          <div className="panel-dark p-10 text-center">
            <p className="font-display text-3xl">Nothing on the rack yet</p>
            <p className="mt-2 text-cream/70">
              An admin can add the first fit from the dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
