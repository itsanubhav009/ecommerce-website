# 🕸️ Spider Threads — comic streetwear store

A fully-functional Next.js clothing store with an **admin** and a **customer** side, built
around a comic-book / "spider-verse"–*inspired* aesthetic (halftone dots, glitch headlines,
pop-art bursts, hard-offset comic panels). The look is original artwork inspired by the genre —
it does **not** use Marvel/Sony's trademarked logo, characters, or proprietary font.

Data and image storage are powered by **Supabase** (free tier), so the app runs on serverless
hosts like **Vercel** with no persistent disk required.

---

## ✨ What it does

**Customers**
- Browse the shop, view product pages with an image gallery
- Add to cart, change quantities, remove items (cart persists in the browser)
- Checkout → **schedule a confirmation call** (phone + preferred time + address)
- See live stock; sold-out items can't be ordered

**Admin**
- Add products with **one or more photos** (file upload → Supabase Storage)
- Edit / delete products and stock at any time
- Get a **notification for every new order** (in-app bell + optional desktop notification)
- Open an order, see the customer's phone & chosen call time (one-tap `tel:` link + an
  "add to Google Calendar" link), then mark it **Bought** or **Rejected**
- Confirming an order **automatically removes the items from stock**

---

## 🧰 Tech (all free)

| Concern        | Choice                                       | Why |
|----------------|----------------------------------------------|-----|
| Framework      | Next.js 14 (App Router) + React 18           | Free, modern, fast |
| Styling        | Tailwind CSS + custom comic CSS              | Free |
| Fonts          | Bangers + Anton + Inter (Google Fonts)       | Free |
| Auth           | Cookie sessions, `bcryptjs` + `jsonwebtoken` | Pure JS, no native build |
| Database       | **Supabase Postgres**                        | Free tier, works on serverless |
| Image storage  | **Supabase Storage** (public bucket)         | Free tier, works on serverless |

The whole data layer is isolated in `lib/db.js`, and the Supabase client in `lib/supabase.js`.

---

## 🟢 One-time Supabase setup (free)

1. Create a project at **https://supabase.com** (free tier is fine).
2. In the dashboard, open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and **Run**. This creates the tables, turns on
   Row Level Security, and creates the public `product-images` storage bucket.
3. New query again → paste [`supabase/seed.sql`](supabase/seed.sql) → **Run**. This adds the
   sample products and the two demo accounts.
4. Open **Project Settings → API** and copy two values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **`service_role` key** (under "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ The `service_role` key is a secret. Keep it server-side only, never commit it, and never
> prefix it with `NEXT_PUBLIC`. Do **not** use a Supabase *personal access token* (`sbp_…`) here —
> that's a different, far more powerful credential the app does not need.

---

## 🚀 Run it locally

You need **Node.js 18.18+**.

```bash
npm install
cp .env.example .env.local      # then fill in the three values
npm run dev
```

Open **http://localhost:3000**.

Demo logins (from `supabase/seed.sql`):

| Role  | Email                       | Password   |
|-------|-----------------------------|------------|
| Admin | admin@spiderthreads.com     | admin123   |
| User  | user@example.com            | user123    |

Log in as the admin to reach **/admin**.

---

## ☁️ Deploy to Vercel (free)

1. Push this folder to a GitHub repo.
2. On **vercel.com**, "Add New Project" → import the repo.
3. Under **Settings → Environment Variables**, add all three:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`  (a long random string — e.g. `openssl rand -base64 32`)
4. Deploy. Because data and images live in Supabase, there's no filesystem to persist —
   it just works on serverless.

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
    upload/               multi-image upload → Supabase Storage
    orders/               list/create, status update
    notifications/        list, mark read
components/
  CartContext.js  Navbar.js  ProductCard.js
lib/
  db.js         Supabase data layer (all queries live here)
  supabase.js   Lazy server-side Supabase client (service role)
  auth.js       JWT + session helpers
supabase/
  schema.sql    Tables, RLS, storage bucket  (run first)
  seed.sql      Demo accounts + sample products (run second)
scripts/
  gen-images.js Regenerate the sample SVG product images
```

---

## 🔒 Notes

- Set a strong `JWT_SECRET` before deploying.
- Passwords are hashed with bcrypt; the session is an httpOnly cookie.
- The app uses the Supabase **service role** key only on the server. RLS is enabled with no
  public policies, so the database can't be read or written directly from the browser.
- Hover/animation uses only GPU-friendly `transform`/`opacity`, respects
  `prefers-reduced-motion`, and lazy-loads images — so it stays smooth on low-end devices.
