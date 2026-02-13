insert into public.waitlist (email, source)
values ('chateshreyas231@gmail.com', 'manual-seed')
on conflict (lower(email)) do nothing;
