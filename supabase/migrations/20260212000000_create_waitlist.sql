create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'web',
  created_at timestamptz not null default now(),
  constraint waitlist_email_format_check
    check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

create unique index if not exists waitlist_email_lower_uidx
  on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

drop policy if exists "Public can insert into waitlist" on public.waitlist;
create policy "Public can insert into waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

create or replace function public.get_waitlist_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint from public.waitlist;
$$;

create or replace function public.is_waitlist_email(email_input text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.waitlist
    where lower(email) = lower(trim(email_input))
  );
$$;

grant execute on function public.get_waitlist_count() to anon, authenticated;
grant execute on function public.is_waitlist_email(text) to anon, authenticated;
