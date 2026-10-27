-- =============================================================================
-- 0001 · SCHÉMA
-- Contenu multilingue : colonnes jsonb { "fr": ..., "en": ... } validées par is_i18n().
-- Conventions : snake_case, uuid, created_at / updated_at maintenus par trigger.
-- =============================================================================

-- ---------- Types ----------
create type public.publish_status as enum ('draft', 'published');
create type public.post_status as enum ('draft', 'scheduled', 'published');
create type public.skill_category as enum ('network', 'systems', 'fullstack', 'design');
create type public.skill_level as enum ('learning', 'proficient', 'advanced');
create type public.project_category as enum ('network', 'systems', 'development', 'design');
create type public.comment_status as enum ('pending', 'approved', 'rejected', 'spam');
create type public.inbox_status as enum ('new', 'read', 'in_progress', 'done');
create type public.subscriber_status as enum ('pending', 'confirmed', 'unsubscribed');

-- ---------- Fonctions utilitaires ----------
create or replace function public.is_i18n(v jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select v is not null and jsonb_typeof(v) = 'object' and v ? 'fr' and v ? 'en';
$$;

comment on function public.is_i18n(jsonb) is 'Vrai si la valeur contient une traduction fr et en.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Administrateurs ----------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
comment on table public.admins is 'Comptes autorisés à administrer le site (un seul propriétaire en pratique).';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;
comment on function public.is_admin() is 'Vrai si l''utilisateur courant figure dans public.admins. Utilisé par toutes les politiques RLS.';

-- ---------- Paramètres du site (singleton) ----------
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  owner_name text not null check (char_length(owner_name) between 2 and 80),
  initials text not null check (char_length(initials) between 1 and 3),
  brand_name text not null check (char_length(brand_name) between 2 and 80),
  site_url text not null check (site_url ~ '^https?://'),
  contact_email text not null check (contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null default '',
  whatsapp text not null default '' check (whatsapp ~ '^[0-9]*$'),
  location jsonb not null check (public.is_i18n(location)),
  role jsonb not null check (public.is_i18n(role)),
  tagline jsonb not null check (public.is_i18n(tagline)),
  hero_intro jsonb not null check (public.is_i18n(hero_intro)),
  about jsonb not null check (public.is_i18n(about)),
  availability jsonb not null check (public.is_i18n(availability)),
  seo_title jsonb not null check (public.is_i18n(seo_title)),
  seo_description jsonb not null check (public.is_i18n(seo_description)),
  og_image_url text,
  avatar_url text,
  accent_color text not null default '#FF5A1F' check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  default_theme text not null default 'system' check (default_theme in ('system', 'light', 'dark')),
  socials jsonb not null default '{}'::jsonb check (jsonb_typeof(socials) = 'object'),
  features jsonb not null default '{"blog":true,"comments":true,"newsletter":true,"quotes":true,"analytics":true}'::jsonb,
  cv_url jsonb not null default '{}'::jsonb check (jsonb_typeof(cv_url) = 'object'),
  is_example boolean not null default false,
  updated_at timestamptz not null default now()
);
comment on table public.site_settings is 'Identité, coordonnées, SEO et réglages globaux. Une seule ligne (id = 1).';

-- ---------- Chiffres clés ----------
create table public.key_figures (
  id uuid primary key default gen_random_uuid(),
  value text not null check (char_length(value) between 1 and 12),
  label jsonb not null check (public.is_i18n(label)),
  sort_order integer not null default 0,
  is_example boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Services ----------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  icon text not null default 'network',
  title jsonb not null check (public.is_i18n(title)),
  summary jsonb not null check (public.is_i18n(summary)),
  description jsonb not null check (public.is_i18n(description)),
  benefits jsonb not null check (public.is_i18n(benefits)),
  deliverables jsonb not null check (public.is_i18n(deliverables)),
  process jsonb not null default '[]'::jsonb check (jsonb_typeof(process) = 'array'),
  sort_order integer not null default 0,
  published boolean not null default true,
  is_example boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_order_idx on public.services (published, sort_order);

-- ---------- Compétences ----------
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null check (public.is_i18n(name)),
  category public.skill_category not null,
  level public.skill_level not null default 'proficient',
  icon text not null default 'code',
  featured boolean not null default false,
  sort_order integer not null default 0,
  is_example boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index skills_category_idx on public.skills (category, sort_order);

-- ---------- Parcours ----------
create table public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('education', 'experience')),
  title jsonb not null check (public.is_i18n(title)),
  organization text not null,
  location text not null default '',
  start_date text not null check (start_date ~ '^\d{4}-\d{2}$'),
  end_date text check (end_date is null or end_date ~ '^\d{4}-\d{2}$'),
  description jsonb not null check (public.is_i18n(description)),
  sort_order integer not null default 0,
  is_example boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Projets ----------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category public.project_category not null,
  title jsonb not null check (public.is_i18n(title)),
  summary jsonb not null check (public.is_i18n(summary)),
  context jsonb not null check (public.is_i18n(context)),
  problem jsonb not null check (public.is_i18n(problem)),
  solution jsonb not null check (public.is_i18n(solution)),
  results jsonb not null check (public.is_i18n(results)),
  learnings jsonb not null check (public.is_i18n(learnings)),
  role jsonb not null check (public.is_i18n(role)),
  duration jsonb not null check (public.is_i18n(duration)),
  year integer not null check (year between 2000 and 2100),
  stack text[] not null default '{}',
  cover_url text,
  github_url text check (github_url is null or github_url ~ '^https://'),
  demo_url text check (demo_url is null or demo_url ~ '^https://'),
  featured boolean not null default false,
  status public.publish_status not null default 'draft',
  sort_order integer not null default 0,
  diagrams jsonb not null default '[]'::jsonb check (jsonb_typeof(diagrams) = 'array'),
  seo_description jsonb check (seo_description is null or public.is_i18n(seo_description)),
  published_at timestamptz,
  is_example boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_status_idx on public.projects (status, sort_order);

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  url text not null,
  alt jsonb not null check (public.is_i18n(alt)),
  caption jsonb check (caption is null or public.is_i18n(caption)),
  kind text not null default 'gallery' check (kind in ('gallery', 'diagram')),
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index project_images_project_idx on public.project_images (project_id, sort_order);

-- ---------- Blog ----------
create table public.post_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name jsonb not null check (public.is_i18n(name)),
  created_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name jsonb not null check (public.is_i18n(name)),
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title jsonb not null check (public.is_i18n(title)),
  excerpt jsonb not null check (public.is_i18n(excerpt)),
  content jsonb not null check (public.is_i18n(content)),
  cover_url text,
  category_id uuid references public.post_categories (id) on delete set null,
  status public.post_status not null default 'draft',
  published_at timestamptz,
  seo_title jsonb check (seo_title is null or public.is_i18n(seo_title)),
  seo_description jsonb check (seo_description is null or public.is_i18n(seo_description)),
  is_example boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_published_at_required check (status = 'draft' or published_at is not null)
);
create index posts_listing_idx on public.posts (status, published_at desc);
create index posts_category_idx on public.posts (category_id);

create table public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);
create index post_tags_tag_idx on public.post_tags (tag_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 80),
  author_email text not null check (author_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  content text not null check (char_length(content) between 2 and 2000),
  status public.comment_status not null default 'pending',
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  ip_hash text,
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments (post_id, status, created_at);
create index comments_status_idx on public.comments (status, created_at desc);

-- ---------- Boîte de réception ----------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject text not null check (char_length(subject) between 2 and 150),
  message text not null check (char_length(message) between 10 and 5000),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  status public.inbox_status not null default 'new',
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contact_messages_status_idx on public.contact_messages (status, created_at desc);

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  service text not null,
  description text not null check (char_length(description) between 20 and 8000),
  budget text not null,
  timeline text not null,
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null default '',
  company text not null default '',
  attachments jsonb not null default '[]'::jsonb check (jsonb_typeof(attachments) = 'array'),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  status public.inbox_status not null default 'new',
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quote_requests_status_idx on public.quote_requests (status, created_at desc);

-- ---------- Newsletter ----------
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  status public.subscriber_status not null default 'pending',
  token uuid not null default gen_random_uuid() unique,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index subscribers_email_idx on public.subscribers (lower(email));
create index subscribers_status_idx on public.subscribers (status);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (char_length(subject) between 2 and 200),
  body text not null,
  audience text not null default 'all' check (audience in ('all', 'fr', 'en')),
  recipients integer not null default 0,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Médias ----------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'media',
  path text not null unique,
  url text not null,
  name text not null,
  mime text not null,
  size integer not null check (size >= 0),
  width integer,
  height integer,
  alt text not null default '',
  created_at timestamptz not null default now()
);
create index media_created_idx on public.media (created_at desc);

-- ---------- Pages légales ----------
create table public.legal_pages (
  slug text primary key check (slug in ('legal-notice', 'privacy')),
  title jsonb not null check (public.is_i18n(title)),
  content jsonb not null check (public.is_i18n(content)),
  is_example boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------- Statistiques (sans cookie) ----------
create table public.page_views (
  id bigint generated always as identity primary key,
  path text not null check (char_length(path) <= 300),
  locale text,
  referrer_host text,
  country text,
  device text check (device in ('mobile', 'tablet', 'desktop', 'bot')),
  visitor_hash text not null,
  created_at timestamptz not null default now()
);
create index page_views_created_idx on public.page_views (created_at desc);
create index page_views_path_idx on public.page_views (path, created_at desc);
comment on column public.page_views.visitor_hash is 'sha256(ip + user-agent + sel quotidien) : non réversible, change chaque jour.';

-- ---------- Journal d'activité ----------
create table public.activity_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  actor_email text,
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_log_created_idx on public.activity_log (created_at desc);

-- ---------- Limitation de débit ----------
create table public.rate_limits (
  key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now()
);

-- ---------- Triggers updated_at ----------
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings', 'key_figures', 'services', 'skills', 'timeline_entries', 'projects',
    'posts', 'contact_messages', 'quote_requests', 'subscribers', 'legal_pages'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_updated_at', t
    );
  end loop;
end;
$$;
