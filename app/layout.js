import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "SPIDER THREADS — comic streetwear",
  description: "Across-the-verse streetwear. Bold comic-book fits, dropped in limited runs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bangers&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="border-t-4 border-web mt-20 py-10 text-center text-sm text-cream/60">
            <p className="font-display text-2xl text-cream tracking-wider">SPIDER THREADS</p>
            <p className="mt-2">A comic-book streetwear concept store · built with Next.js</p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
