-- Real-time trend intelligence, one-time Why Layer, and per-trend chat.
-- Apply with `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists pgcrypto;

create table public.countries (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z]{2}$'),
  slug text not null unique,
  name text not null,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create table public.trends (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default 'General',
  summary text,
  country_id uuid references public.countries(id) on delete set null,
  velocity_score smallint not null default 0 check (velocity_score between 0 and 100),
  reach_score smallint not null default 0 check (reach_score between 0 and 100),
  novelty_score smallint not null default 0 check (novelty_score between 0 and 100),
  score smallint not null default 0 check (score between 0 and 100),
  is_global_pulse boolean generated always as (score > 80) stored,
  source_count integer not null default 0 check (source_count >= 0),
  signal_count integer not null default 0 check (signal_count >= 0),
  growth_percent numeric(9,2),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  why_status text not null default 'pending'
    check (why_status in ('pending', 'processing', 'complete', 'failed', 'skipped')),
  why_generation_started_at timestamptz,
  why_generated_at timestamptz,
  why_model text,
  what_happened text,
  why_now text,
  where_started text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.signals (
  id uuid primary key default gen_random_uuid(),
  trend_id uuid not null references public.trends(id) on delete cascade,
  country_id uuid references public.countries(id) on delete set null,
  source text not null check (source in (
    'hacker_news', 'github', 'google_trends', 'reddit', 'x', 'tavily', 'exa'
  )),
  external_id text not null,
  title text not null,
  excerpt text,
  source_url text not null,
  author_label text,
  engagement_count integer not null default 0 check (engagement_count >= 0),
  audience_count integer check (audience_count is null or audience_count >= 0),
  published_at timestamptz not null,
  observed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (source, external_id)
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  trend_id uuid not null references public.trends(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_display_name text not null check (char_length(author_display_name) between 1 and 60),
  body text not null check (char_length(body) between 1 and 1000),
  moderation_provider text not null check (moderation_provider in ('openai', 'local')),
  moderation_labels text[] not null default '{}',
  status text not null default 'visible' check (status in ('visible', 'removed')),
  created_at timestamptz not null default now()
);

create table public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'complete', 'partial', 'failed')),
  sources_attempted text[] not null default '{}',
  sources_succeeded text[] not null default '{}',
  signals_seen integer not null default 0,
  signals_inserted integer not null default 0,
  trends_created integer not null default 0,
  errors jsonb not null default '[]'::jsonb
);

create index trends_global_pulse_idx
  on public.trends (score desc, last_seen_at desc)
  where is_global_pulse;
create index trends_recent_idx on public.trends (last_seen_at desc);
create index signals_trend_recent_idx on public.signals (trend_id, published_at desc);
create index signals_observed_idx on public.signals (observed_at desc);
create index chat_messages_room_idx on public.chat_messages (trend_id, created_at desc)
  where status = 'visible';
create index chat_messages_rate_limit_idx on public.chat_messages (author_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trends_touch_updated_at
before update on public.trends
for each row execute function public.touch_updated_at();

-- At most one successful/failed Why Layer attempt per trend. An operator can
-- explicitly reset a failed row to pending after diagnosing the provider.
create or replace function public.claim_why_generation(p_trend_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_count integer;
begin
  update public.trends
     set why_status = 'processing', why_generation_started_at = now()
   where id = p_trend_id
     and why_status = 'pending'
     and why_generated_at is null;
  get diagnostics claimed_count = row_count;
  return claimed_count = 1;
end;
$$;

create or replace function public.enforce_chat_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*)
      from public.chat_messages
     where author_id = new.author_id
       and created_at > now() - interval '1 minute'
  ) >= 8 then
    raise exception 'chat_rate_limit_exceeded' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger chat_messages_rate_limit
before insert on public.chat_messages
for each row execute function public.enforce_chat_rate_limit();

alter table public.countries enable row level security;
alter table public.trends enable row level security;
alter table public.signals enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ingestion_runs enable row level security;

grant select on public.countries, public.trends, public.signals to anon, authenticated;
grant select on public.chat_messages to anon, authenticated;
grant all on public.countries, public.trends, public.signals, public.chat_messages, public.ingestion_runs to service_role;
grant execute on function public.claim_why_generation(uuid) to service_role;

create policy "public countries are readable"
  on public.countries for select to anon, authenticated using (true);
create policy "public trends are readable"
  on public.trends for select to anon, authenticated using (true);
create policy "public signals are readable"
  on public.signals for select to anon, authenticated using (true);
create policy "visible chat messages are readable"
  on public.chat_messages for select to anon, authenticated using (status = 'visible');

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end;
$$;

insert into public.countries (code, slug, name, latitude, longitude) values
  ('US', 'united-states', 'United States', 37.0902, -95.7129),
  ('GB', 'united-kingdom', 'United Kingdom', 55.3781, -3.4360),
  ('DE', 'germany', 'Germany', 51.1657, 10.4515),
  ('FR', 'france', 'France', 46.2276, 2.2137),
  ('IN', 'india', 'India', 20.5937, 78.9629),
  ('JP', 'japan', 'Japan', 36.2048, 138.2529),
  ('KR', 'south-korea', 'South Korea', 35.9078, 127.7669),
  ('BR', 'brazil', 'Brazil', -14.2350, -51.9253),
  ('CA', 'canada', 'Canada', 56.1304, -106.3468),
  ('AU', 'australia', 'Australia', -25.2744, 133.7751),
  ('SG', 'singapore', 'Singapore', 1.3521, 103.8198),
  ('TR', 'turkey', 'Türkiye', 38.9637, 35.2433)
on conflict (code) do update set
  slug = excluded.slug,
  name = excluded.name,
  latitude = excluded.latitude,
  longitude = excluded.longitude;
