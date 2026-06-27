-- ===========================================================================
-- Spider Threads — seed data
-- Run AFTER schema.sql. Safe to run on a fresh database.
-- Demo logins:
--   admin@spiderthreads.com / admin123   (ADMIN)
--   user@example.com        / user123    (USER)
-- Passwords below are bcrypt hashes of those values.
-- ===========================================================================

insert into public.users (name, email, password, role) values
  ('Store Admin', 'admin@spiderthreads.com',
   '$2a$10$K0qgJmjyrDfqTXyTU65gx.51z8HJpZkXuPG4ZVGwwpJqL.7muFJBe', 'ADMIN'),
  ('Miles M.', 'user@example.com',
   '$2a$10$etKacwRP083g.X.lDhfpcucS6j3JMOCjZxvHpW9PpPo6tYeAQ/i0e', 'USER')
on conflict (email) do nothing;

insert into public.products (name, description, price, stock, category, images) values
  ('Across-the-Verse Hoodie',
   'Heavyweight 420gsm fleece with a halftone web print on the back. Boxy fit, ribbed cuffs.',
   64.00, 12, 'Hoodies', '["/uploads/sample-hoodie.svg"]'::jsonb),
  ('Glitch Panel Tee',
   'Oversized cotton tee with a chromatic-aberration comic panel graphic. Pre-shrunk.',
   32.00, 25, 'Tees', '["/uploads/sample-tee.svg"]'::jsonb),
  ('Pop-Art Bomber',
   'Satin bomber jacket with embroidered burst patch and ben-day dot lining.',
   98.00, 6, 'Jackets', '["/uploads/sample-bomber.svg"]'::jsonb),
  ('Spectro Cargo Pants',
   'Tech-cargo with magenta-and-cyan taping. Adjustable hem, six pockets.',
   78.00, 0, 'Pants', '["/uploads/sample-pants.svg"]'::jsonb);
