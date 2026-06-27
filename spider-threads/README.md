# 🕸️ Spider Threads — comic streetwear store

A fully-functional Next.js clothing store with an **admin** and a **customer** side, built
around a comic-book / "spider-verse"–*inspired* aesthetic (halftone dots, glitch headlines,
pop-art bursts, hard-offset comic panels). The look is original artwork inspired by the genre —
it does **not** use Marvel/Sony's trademarked logo, characters, or proprietary font.

Everything here is free and open-source. No paid services, no external accounts.

---

## ✨ What it does

**Customers**
- Browse the shop, view product pages with an image gallery
- Add to cart, change quantities, remove items (cart persists in the browser)
- Checkout → **schedule a confirmation call** (phone + preferred time + address)
- See live stock; sold-out items can't be ordered

**Admin**
- Add products with **one or more photos** (drag-and-drop file upload)
- Edit / delete products and stock at any time
- Get a **notification for every new order** (in-app bell + optional desktop notification)
- Open an order, see the customer's phone & chosen call time (with a one-tap `tel:` link and an
  "add to Google Calendar" link), then mark it **Bought** or **Rejected**
- Confirming an order **automatically removes the items from stock**

---

## 🧰 Tech (all free)

| Concern        | Choice                              | Why |
|----------------|-------------------------------------|-----|
| Framework      | Next.js 14 (App Router) + React 18  | Free, modern, fast |
| Styling        | Tailwind CSS + custom comic CSS     | Free |
| Fonts          | Bangers + Anton + Inter (Google Fonts) | Free |
| Auth           | Cookie sessions, `bcryptjs` + `jsonwebtoken` | Pure JS, no native build |
| Database       | A JSON file at `data/db.json`       | Zero setup — no DB server or account |
| Image storage  | Files in `public/uploads`           | No cloud account needed |

> The JSON database keeps setup to **one command**. It's perfect for local use, a personal
> shop, or a portfolio piece, and is easy to swap for a real database later (see below).

---

## 🚀 Run it locally

You need **Node.js 18.18+** installed.

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

On first start the app seeds itself with sample products and two accounts:

| Role  | Email                       | Password   |
|-------|-----------------------------|------------|
| Admin | admin@spiderthreads.com     | admin123   |
| User  | user@example.com            | user123    |

Log in as the admin to reach **/admin**.

### Reset the data
```bash
npm run seed        # deletes data/db.json; it re-seeds on next start
node scripts/gen-images.js   # (re)create the sample product images
```

---

## 📦 Production build

```bash
npm run build
npm start
```

---

## ☁️ Deploying

This app writes to the local filesystem (`data/db.json` and `public/uploads`). That works on
any host with a **persistent disk**:

- ✅ Your own VPS / a Raspberry Pi / `npm start` on a server
- ✅ Render, Railway, Fly.io (attach a volume / persistent disk)
- ⚠️ **Vercel / Netlify** filesystems are read-only at runtime. To deploy there, swap the two
  storage pieces:
  - `lib/db.js` → a hosted database (free tiers: Supabase, Neon, Turso, MongoDB Atlas)
  - `app/api/upload/route.js` → a storage bucket (free tiers: Supabase Storage, Cloudinary)

  Everything else (pages, auth, cart, orders, notifications) stays the same — the data layer is
  isolated in `lib/db.js` on purpose.

---

## 🗂️ Project structure

```
app/
  page.js                 Shop home (hero + product grid)
  product/[id]/           Product detail + add-to-cart
  cart/                   Cart
  checkout/               Checkout + schedule call
  login/  register/       Auth pages
  admin/
    layout.js             Server-side admin guard
    page.js               Dashboard + notifications
    products/page.js      Add / edit / delete + image upload
    orders/page.js        Confirm (cut stock) / reject orders
  api/
    auth/                 register, login, logout, me
    products/             list, create, get, update, delete
    upload/               multi-image upload
    orders/               list/create, status update
    notifications/        list, mark read
components/
  CartContext.js  Navbar.js  ProductCard.js
lib/
  db.js     JSON data layer (swap this to use a real DB)
  auth.js   JWT + session helpers
scripts/
  gen-images.js  seed.js
```

---

## 🔒 Notes

- Change `JWT_SECRET` in `.env` before deploying.
- Passwords are hashed with bcrypt; the session is an httpOnly cookie.
- Hover/animation uses only GPU-friendly `transform`/`opacity`, respects
  `prefers-reduced-motion`, and lazy-loads images — so it stays smooth on low-end devices.
