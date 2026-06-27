"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";

export default function ProductDetail({ product }) {
  const { add } = useCart();
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const images = product.images?.length ? product.images : ["/uploads/placeholder.svg"];
  const soldOut = product.stock <= 0;

  function handleAdd() {
    if (soldOut) return;
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  function buyNow() {
    if (soldOut) return;
    add(product, qty);
    router.push("/checkout");
  }

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-2">
      {/* Gallery */}
      <div>
        <div className="zoom-wrap panel-dark">
          <img
            src={images[active]}
            alt={product.name}
            className="zoom-img aspect-square w-full object-cover"
          />
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-16 w-16 overflow-hidden border-2 ${
                  i === active ? "border-pop" : "border-cream/30"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <span className="font-impact text-sm uppercase tracking-wider text-volt">
          {product.category}
        </span>
        <h1 className="mt-1 font-display text-5xl leading-tight tracking-wide">{product.name}</h1>
        <p className="mt-4 font-impact text-4xl text-pop">${product.price.toFixed(2)}</p>

        <p className="mt-5 text-cream/80">{product.description}</p>

        <p className="mt-4 font-impact text-sm uppercase">
          {soldOut ? (
            <span className="text-web">Sold out</span>
          ) : (
            <span className="text-cream/70">{product.stock} in stock</span>
          )}
        </p>

        {!soldOut && (
          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-semibold">Qty</span>
            <div className="flex items-center border-2 border-cream/40">
              <button
                className="px-3 py-1 font-impact text-lg"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="w-10 text-center font-impact text-lg">{qty}</span>
              <button
                className="px-3 py-1 font-impact text-lg"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-4">
          <button
            onClick={handleAdd}
            disabled={soldOut}
            className={`btn px-6 py-3 ${
              soldOut ? "cursor-not-allowed bg-cream/20 text-cream/40" : "btn-primary"
            }`}
          >
            {soldOut ? "Sold out" : added ? "Added!" : "Add to cart"}
          </button>
          {!soldOut && (
            <button onClick={buyNow} className="btn btn-pop px-6 py-3">
              Buy now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
