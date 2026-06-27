"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartContext";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;
  const low = product.stock > 0 && product.stock <= 5;

  function handleAdd() {
    if (soldOut) return;
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1100);
  }

  return (
    <div className="card-hover panel-dark relative flex flex-col">
      {soldOut && (
        <span className="absolute left-3 top-3 z-10 rotate-[-6deg] bg-ink px-2 py-1 font-impact text-xs uppercase text-web ring-2 ring-web">
          Sold out
        </span>
      )}
      {low && (
        <span className="absolute left-3 top-3 z-10 rotate-[-6deg] bg-pop px-2 py-1 font-impact text-xs uppercase text-ink">
          Only {product.stock} left
        </span>
      )}

      <Link href={`/product/${product.id}`} className="zoom-wrap block bg-[#0e0f17]">
        {/* plain img + lazy load: no optimizer dependency, still fast */}
        <img
          src={product.images?.[0] || "/uploads/placeholder.svg"}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="zoom-img aspect-square w-full object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="font-impact text-xs uppercase tracking-wider text-volt">
          {product.category}
        </span>
        <Link
          href={`/product/${product.id}`}
          className="font-display text-2xl leading-tight tracking-wide"
        >
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-cream/70">{product.description}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-impact text-2xl text-pop">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAdd}
            disabled={soldOut}
            className={`btn px-3 py-2 text-xs ${
              soldOut ? "cursor-not-allowed bg-cream/20 text-cream/40" : "btn-primary"
            }`}
          >
            {soldOut ? "Sold out" : added ? "Added!" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
