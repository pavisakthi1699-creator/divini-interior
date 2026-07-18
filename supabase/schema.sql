-- ============================================================
-- Divine Interior — Supabase Database Schema
-- ============================================================
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  description      text not null default '',
  price            numeric(12, 2) not null default 0,
  compare_at_price numeric(12, 2),
  currency         text not null default 'INR',
  category         text not null default '',
  tags             text[] not null default '{}',
  images           text[] not null default '{}',
  stock            integer not null default 0,
  sku              text,
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  options          jsonb not null default '[]',
  variants         jsonb not null default '[]',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null unique,
  phone        text,
  avatar       text,
  addresses    jsonb not null default '[]',
  total_orders integer not null default 0,
  total_spent  numeric(14, 2) not null default 0,
  notes        text,
  tags         text[] not null default '{}',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger customers_updated_at
  before update on public.customers
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────
create type order_status as enum (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
);

create type payment_status as enum (
  'pending', 'paid', 'failed', 'refunded'
);

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique,
  customer_id      uuid references public.customers(id) on delete set null,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text,
  shipping_address jsonb not null default '{}',
  items            jsonb not null default '[]',
  subtotal         numeric(14, 2) not null default 0,
  shipping_cost    numeric(10, 2) not null default 0,
  discount         numeric(10, 2) not null default 0,
  total            numeric(14, 2) not null default 0,
  currency         text not null default 'INR',
  status           order_status not null default 'pending',
  payment_status   payment_status not null default 'pending',
  payment_method   text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function update_updated_at();

-- Auto-generate order number: DI-YYYYMMDD-XXXX
create or replace function generate_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'DI-' ||
      to_char(now(), 'YYYYMMDD') || '-' ||
      lpad(floor(random() * 9000 + 1000)::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger orders_number_gen
  before insert on public.orders
  for each row execute function generate_order_number();

-- ─────────────────────────────────────────────────────────────
-- BLOGS
-- ─────────────────────────────────────────────────────────────
create type blog_status as enum ('draft', 'published', 'archived');

create table if not exists public.blogs (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  excerpt          text not null default '',
  content          text not null default '',
  cover_image      text,
  author           text not null default 'Admin',
  tags             text[] not null default '{}',
  status           blog_status not null default 'draft',
  meta_title       text,
  meta_description text,
  views            integer not null default 0,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger blogs_updated_at
  before update on public.blogs
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ADMIN USERS
-- ─────────────────────────────────────────────────────────────
create type admin_role as enum ('super_admin', 'admin', 'editor', 'viewer');

create table if not exists public.admin_users (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  name       text not null,
  email      text not null unique,
  role       admin_role not null default 'editor',
  avatar     text,
  is_active  boolean not null default true,
  last_login timestamptz,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────
-- Enable RLS on all tables
alter table public.products    enable row level security;
alter table public.customers   enable row level security;
alter table public.orders      enable row level security;
alter table public.blogs       enable row level security;
alter table public.admin_users enable row level security;

-- Helper: check if the calling user is an active admin
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
      and is_active = true
  );
$$;

-- Products: admins can do anything; public can read active products
create policy "admin_all_products" on public.products
  for all using (is_admin());

create policy "public_read_products" on public.products
  for select using (is_active = true);

-- Orders: admins only
create policy "admin_all_orders" on public.orders
  for all using (is_admin());

-- Customers: admins only
create policy "admin_all_customers" on public.customers
  for all using (is_admin());

-- Blogs: admins can do anything; public can read published blogs
create policy "admin_all_blogs" on public.blogs
  for all using (is_admin());

create policy "public_read_blogs" on public.blogs
  for select using (status = 'published');

-- Admin users: admins can read all; only super_admin can insert/update/delete
create policy "admin_read_users" on public.admin_users
  for select using (is_admin());

create policy "super_admin_manage_users" on public.admin_users
  for all using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
        and role = 'super_admin'
        and is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────
-- SEED: Create the first super-admin profile
-- ─────────────────────────────────────────────────────────────
-- After running this schema:
-- 1. Go to Supabase → Authentication → Users → "Add User"
-- 2. Create your admin email/password
-- 3. Copy the UUID shown in the Users table
-- 4. Run the INSERT below, replacing the UUID and email:
--
-- insert into public.admin_users (user_id, name, email, role)
-- values (
--   'paste-your-auth-user-uuid-here',
--   'Your Name',
--   'your@email.com',
--   'super_admin'
-- );

-- ─────────────────────────────────────────────────────────────
-- SAMPLE DATA (optional — remove in production)
-- ─────────────────────────────────────────────────────────────

-- Sample products
insert into public.products (title, slug, description, price, compare_at_price, category, tags, images, stock, sku, is_active, is_featured) values
  ('The Aurelia Velvet Sofa', 'aurelia-velvet-sofa',
   'Indulge in plush comfort. Upholstered in premium cotton velvet with deep tufting and solid brass legs.',
   145000, 175000, 'Sofas & Couches', array['featured','sale'],
   array['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'],
   12, 'DI-SOFA-001', true, true),

  ('Celeste Marble Coffee Table', 'celeste-marble-coffee-table',
   'Crafted from hand-selected Italian Carrara marble with a minimalist geometric iron base.',
   68000, 90000, 'Coffee Tables', array['featured'],
   array['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80'],
   5, 'DI-TABLE-001', true, true),

  ('Helios Brass Pendant Light', 'helios-brass-pendant-light',
   'Hand-brushed brass panels that reflect a warm, golden glow. Ideal for dining spaces.',
   32500, 45000, 'Lighting', array['featured'],
   array['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80'],
   20, 'DI-LIGHT-001', true, false),

  ('Kensington Oak Dining Chair', 'kensington-oak-dining-chair',
   'Solid white oak with a hand-woven paper cord seat for ergonomic support.',
   18900, 25000, 'Dining Chairs', array['sale'],
   array['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80'],
   30, 'DI-CHAIR-001', true, false),

  ('Elysian Silk Cushions', 'elysian-silk-cushions',
   'Spun from mulberry silk with a subtle sheen. Adds soft elegance to any arrangement.',
   6800, 12000, 'Accessories', array['sale'],
   array['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80'],
   50, 'DI-CUSH-001', true, false)
on conflict (slug) do nothing;

-- Sample blog posts
insert into public.blogs (title, slug, excerpt, content, author, tags, status, cover_image, published_at) values
  ('The Art of Luxury Minimalism',
   'art-of-luxury-minimalism',
   'Discover how less can truly be more when it comes to high-end interior design.',
   '<p>Luxury minimalism is not about stripping a space bare — it is about intentional curation...</p>',
   'Divine Interior Team',
   array['interior-design','minimalism','luxury'],
   'published',
   'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
   now()),

  ('Choosing the Perfect Statement Sofa',
   'choosing-perfect-statement-sofa',
   'A sofa is the centrepiece of any living room. Here is how to choose one that speaks to your style.',
   '<p>When selecting a statement sofa, consider scale, fabric, and the overall design language of your space...</p>',
   'Divine Interior Team',
   array['sofas','buying-guide','furniture'],
   'published',
   'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
   now() - interval '7 days'),

  ('Marble in Modern Interiors',
   'marble-in-modern-interiors',
   'Natural stone has made a dramatic comeback. We explore how marble fits into contemporary homes.',
   '<p>From Carrara white to Nero Marquina black, marble brings unmatched depth to any interior...</p>',
   'Divine Interior Team',
   array['marble','stone','trends'],
   'draft',
   'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
   null)
on conflict (slug) do nothing;

-- Sample orders
insert into public.orders (
  order_number, customer_name, customer_email, customer_phone,
  shipping_address, items, subtotal, shipping_cost, discount, total,
  status, payment_status, payment_method
) values
  ('DI-20240101-1001',
   'Priya Sharma', 'priya.sharma@example.com', '+91 98765 43210',
   '{"name":"Priya Sharma","line1":"12 Palm Grove","city":"Mumbai","state":"Maharashtra","postal_code":"400001","country":"India"}',
   '[{"id":"item-1","product_id":"prod-1","product_title":"The Aurelia Velvet Sofa","variant_title":"Emerald Green","price":145000,"quantity":1,"total":145000,"image":"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"}]',
   145000, 0, 0, 145000,
   'delivered', 'paid', 'UPI'),

  ('DI-20240115-1002',
   'Rahul Mehta', 'rahul.mehta@example.com', '+91 87654 32109',
   '{"name":"Rahul Mehta","line1":"45 Brigade Road","city":"Bengaluru","state":"Karnataka","postal_code":"560001","country":"India"}',
   '[{"id":"item-2","product_id":"prod-2","product_title":"Celeste Marble Coffee Table","variant_title":"Carrara Marble","price":68000,"quantity":1,"total":68000,"image":"https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400"},{"id":"item-3","product_id":"prod-5","product_title":"Elysian Silk Cushions","variant_title":"Champagne","price":6800,"quantity":2,"total":13600,"image":"https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400"}]',
   81600, 500, 0, 82100,
   'processing', 'paid', 'Credit Card'),

  ('DI-20240120-1003',
   'Ananya Patel', 'ananya.patel@example.com', null,
   '{"name":"Ananya Patel","line1":"78 Jodhpur Park","city":"Kolkata","state":"West Bengal","postal_code":"700068","country":"India"}',
   '[{"id":"item-4","product_id":"prod-3","product_title":"Helios Brass Pendant Light","variant_title":"Large","price":32500,"quantity":2,"total":65000}]',
   65000, 800, 5000, 60800,
   'pending', 'pending', null)
on conflict (order_number) do nothing;

-- Sample customers
insert into public.customers (name, email, phone, addresses, total_orders, total_spent, tags, is_active) values
  ('Priya Sharma', 'priya.sharma@example.com', '+91 98765 43210',
   '[{"name":"Priya Sharma","line1":"12 Palm Grove","city":"Mumbai","state":"Maharashtra","postal_code":"400001","country":"India"}]',
   1, 145000, array['vip'], true),

  ('Rahul Mehta', 'rahul.mehta@example.com', '+91 87654 32109',
   '[{"name":"Rahul Mehta","line1":"45 Brigade Road","city":"Bengaluru","state":"Karnataka","postal_code":"560001","country":"India"}]',
   1, 82100, array[]::text[], true),

  ('Ananya Patel', 'ananya.patel@example.com', null,
   '[{"name":"Ananya Patel","line1":"78 Jodhpur Park","city":"Kolkata","state":"West Bengal","postal_code":"700068","country":"India"}]',
   1, 60800, array[]::text[], true)
on conflict (email) do nothing;
