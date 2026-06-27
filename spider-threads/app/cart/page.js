"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function CartPage() {
  const { items, setQty, remove, total, clear, loaded } = useCart();

  if (!loaded) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-5xl glitch">Your cart</h1>

      {items.length === 0 ? (
        <div className="panel-dark mt-8 p-10 text-center">
          <p className="font-display text-3xl">Empty as a quiet city</p>
          <p className="mt-2 text-cream/70">Add a fit and it'll show up here.</p>
          <Link href="/" className="btn btn-pop mt-5 inline-block px-6 py-3">
            Back to shop
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            {items.map((i) => (
              <div key={i.id} className="panel-dark flex items-center gap-4 p-3">
                <img
                  src={i.image || "/uploads/placeholder.svg"}
                  alt={i.name}
                  className="h-20 w-20 flex-shrink-0 object-cover"
                />
                <div className="flex-1">
                  <p className="font-display text-xl tracking-wide">{i.name}</p>
                  <p className="text-pop font-impact">${i.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center border-2 border-cream/40">
                  <button className="px-2 py-1 font-impact" onClick={() => setQty(i.id, i.quantity - 1)}>
                    −
                  </button>
                  <span className="w-8 text-center font-impact">{i.quantity}</span>
                  <button className="px-2 py-1 font-impact" onClick={() => setQty(i.id, i.quantity + 1)}>
                    +
                  </button>
                </div>
                <p className="w-20 text-right font-impact">${(i.price * i.quantity).toFixed(2)}</p>
                <button
                  onClick={() => remove(i.id)}
                  className="text-cream/60 hover:text-web"
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="panel-dark mt-6 flex items-center justify-between p-5">
            <button onClick={clear} className="link-underline text-sm text-cream/70">
              Clear cart
            </button>
            <div className="text-right">
              <p className="text-sm text-cream/60">Total</p>
              <p className="font-impact text-3xl text-pop">${total.toFixed(2)}</p>
            </div>
          </div>

          <Link href="/checkout" className="btn btn-primary mt-6 block w-full py-4 text-center text-lg">
            Checkout & schedule call
          </Link>
        </>
      )}
    </div>
  );
}
