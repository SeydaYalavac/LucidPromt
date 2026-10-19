-- Deploy the previous application revision before this rollback.
-- Keeping the column is the safest rollback because old code ignores it.
drop index if exists public.trends_retained_archive_idx;

-- Only remove the column after the previous application revision is live.
-- alter table public.trends drop column if exists archive_eligible;
