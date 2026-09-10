-- DareDev Neon (Postgres) schema.
-- Run once against a fresh Neon database: psql "$DATABASE_URL" -f db/schema.sql

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Owner accounts. No role column: every account is an equal owner-level
-- admin now that multi-user drawing sharing has been removed.
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  tech_stack text[] not null default '{}',
  links jsonb not null default '[]'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  description text,
  url text not null,
  status smallint not null default 0 check (status in (0, 1, 2)),
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists resources_set_updated_at on resources;
create trigger resources_set_updated_at
  before update on resources
  for each row execute function set_updated_at();

-- Blog metadata only; body markdown lives in Firestore blogPosts/{slug}.
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  date date,
  author text,
  tags text[] not null default '{}',
  read_time integer,
  featured boolean not null default false,
  published boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists blog_posts_set_updated_at on blog_posts;
create trigger blog_posts_set_updated_at
  before update on blog_posts
  for each row execute function set_updated_at();

create index if not exists resources_category_idx on resources (category, order_index);
create index if not exists blog_posts_published_date_idx on blog_posts (published, date desc);
