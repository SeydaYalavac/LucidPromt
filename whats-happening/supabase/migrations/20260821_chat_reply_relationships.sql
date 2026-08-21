-- Preserve lightweight reply relationships without turning trend discussion
-- into a separate forum product. The API verifies that a parent belongs to the
-- same trend before insertion.
alter table public.chat_messages
  add column if not exists reply_to_id uuid references public.chat_messages(id) on delete set null;

create index if not exists chat_messages_reply_idx
  on public.chat_messages (reply_to_id, created_at asc)
  where status = 'visible' and reply_to_id is not null;
