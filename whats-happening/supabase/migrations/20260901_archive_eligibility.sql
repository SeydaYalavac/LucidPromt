-- Durable, fail-closed publication eligibility for retained trend archives.
-- The application backfill computes this field from the same strict source
-- validation used by public cards. The default prevents new or unreviewed rows
-- from appearing before ingestion attaches qualifying evidence.
alter table public.trends
  add column if not exists archive_eligible boolean not null default false;

create index if not exists trends_retained_archive_idx
  on public.trends (category, last_seen_at desc, score desc)
  where archive_eligible;

comment on column public.trends.archive_eligible is
  'True only when the trend has a public slug and current official or permissioned AI evidence.';
