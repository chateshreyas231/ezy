create table if not exists public.waitlist_backup (
  id uuid primary key default gen_random_uuid(),
  waitlist_id uuid references public.waitlist(id) on delete set null,
  email text not null,
  source text not null default 'web',
  created_at timestamptz not null default now(),
  backed_up_at timestamptz not null default now(),
  constraint waitlist_backup_email_format_check
    check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

create unique index if not exists waitlist_backup_email_lower_uidx
  on public.waitlist_backup (lower(email));

create index if not exists waitlist_backup_waitlist_id_idx
  on public.waitlist_backup (waitlist_id);

create or replace function public.backup_waitlist_entry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.waitlist_backup (waitlist_id, email, source, created_at, backed_up_at)
  values (new.id, new.email, new.source, new.created_at, now())
  on conflict (lower(email)) do update
    set waitlist_id = excluded.waitlist_id,
        source = excluded.source,
        created_at = excluded.created_at,
        backed_up_at = now();

  return new;
end;
$$;

drop trigger if exists trg_backup_waitlist_entry on public.waitlist;
create trigger trg_backup_waitlist_entry
after insert on public.waitlist
for each row
execute function public.backup_waitlist_entry();

insert into public.waitlist_backup (waitlist_id, email, source, created_at, backed_up_at)
select w.id, w.email, w.source, w.created_at, now()
from public.waitlist w
on conflict (lower(email)) do update
  set waitlist_id = excluded.waitlist_id,
      source = excluded.source,
      created_at = excluded.created_at,
      backed_up_at = now();
