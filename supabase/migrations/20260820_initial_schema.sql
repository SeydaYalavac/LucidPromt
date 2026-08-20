create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 4 and 140),
  content text not null check (char_length(content) >= 20),
  model_tag text,
  forked_from_prompt_id uuid references public.prompts (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  prompt_id uuid references public.prompts (id) on delete set null,
  title text not null check (char_length(title) between 8 and 160),
  slug text not null unique,
  body text not null check (char_length(body) >= 32),
  tags text[] not null default '{}'::text[],
  resolved_reply_id uuid,
  upvote_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) >= 8),
  is_solution boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.threads
  add constraint threads_resolved_reply_id_fkey
  foreign key (resolved_reply_id) references public.replies (id) on delete set null;

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  thread_id uuid references public.threads (id) on delete cascade,
  reply_id uuid references public.replies (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default timezone('utc', now()),
  constraint votes_target_check check (
    ((thread_id is not null)::int + (reply_id is not null)::int) = 1
  ),
  unique (user_id, thread_id),
  unique (user_id, reply_id)
);

create index if not exists threads_author_id_idx on public.threads (author_id);
create index if not exists threads_prompt_id_idx on public.threads (prompt_id);
create index if not exists replies_thread_id_idx on public.replies (thread_id);
create index if not exists votes_thread_id_idx on public.votes (thread_id);
create index if not exists votes_reply_id_idx on public.votes (reply_id);
create index if not exists prompts_author_id_idx on public.prompts (author_id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger prompts_set_updated_at
before update on public.prompts
for each row execute procedure public.set_updated_at();

create trigger threads_set_updated_at
before update on public.threads
for each row execute procedure public.set_updated_at();

create trigger replies_set_updated_at
before update on public.replies
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.threads enable row level security;
alter table public.replies enable row level security;
alter table public.votes enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create policy "Public profiles are readable"
on public.profiles
for select
to anon, authenticated
using (true);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Threads are readable by everyone"
on public.threads
for select
to anon, authenticated
using (true);

create policy "Authenticated users can create threads"
on public.threads
for insert
to authenticated
with check ((select auth.uid()) = author_id);

create policy "Authors can update own threads"
on public.threads
for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create policy "Prompts are readable by everyone"
on public.prompts
for select
to anon, authenticated
using (true);

create policy "Authenticated users can create prompts"
on public.prompts
for insert
to authenticated
with check ((select auth.uid()) = author_id);

create policy "Authors can update own prompts"
on public.prompts
for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create policy "Replies are readable by everyone"
on public.replies
for select
to anon, authenticated
using (true);

create policy "Authenticated users can create replies"
on public.replies
for insert
to authenticated
with check ((select auth.uid()) = author_id);

create policy "Authors can update own replies"
on public.replies
for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create policy "Thread authors can mark solution replies"
on public.replies
for update
to authenticated
using (
  exists (
    select 1
    from public.threads
    where threads.id = replies.thread_id
      and threads.author_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.threads
    where threads.id = replies.thread_id
      and threads.author_id = (select auth.uid())
  )
);

create policy "Votes are readable by everyone"
on public.votes
for select
to anon, authenticated
using (true);

create policy "Authenticated users can vote"
on public.votes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own votes"
on public.votes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own votes"
on public.votes
for delete
to authenticated
using ((select auth.uid()) = user_id);
