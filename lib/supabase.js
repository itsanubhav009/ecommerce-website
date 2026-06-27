import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client. Uses the SERVICE ROLE key, which bypasses
// Row Level Security — so this file must NEVER be imported into client
// components. It is only used by route handlers and server components.
//
// The client is created lazily (on first use) rather than at import time so
// that `next build` doesn't crash when env vars aren't present in the build
// environment. All pages that read data are `force-dynamic`, so the client is
// only ever constructed at request time, when the env vars are available.

let _client = null;

export function supabase() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in your environment (.env locally, or the " +
        "Environment Variables section in Vercel)."
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

// Name of the public Storage bucket that holds uploaded product images.
export const STORAGE_BUCKET = "product-images";
