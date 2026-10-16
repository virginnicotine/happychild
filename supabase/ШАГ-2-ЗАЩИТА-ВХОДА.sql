-- Запустить ОДИН РАЗ в Supabase SQL Editor перед обновлением Edge Function.
-- Не удаляет пользователей или профили.
create table if not exists public.site_login_attempts (
  login_key text primary key,
  attempts integer not null default 0,
  window_start timestamptz not null default now()
);
alter table public.site_login_attempts enable row level security;
-- Нет политик доступа из браузера. Только service_role через Edge Function.

create or replace function public.site_login_rate_limit(p_login text)
returns boolean
language plpgsql security invoker set search_path = ''
as $$
declare n integer;
begin
  if p_login is null or length(p_login) > 24 then return false; end if;
  insert into public.site_login_attempts(login_key,attempts,window_start)
  values (lower(btrim(p_login)),1,now())
  on conflict(login_key) do update set
    attempts = case when public.site_login_attempts.window_start < now() - interval '15 minutes'
                    then 1 else public.site_login_attempts.attempts + 1 end,
    window_start = case when public.site_login_attempts.window_start < now() - interval '15 minutes'
                    then now() else public.site_login_attempts.window_start end
  returning attempts into n;
  return n <= 5;
end;
$$;

create or replace function public.site_lookup_login(p_login text)
returns table(email text, blocked boolean)
language sql stable security invoker set search_path = ''
as $$
  select p.email, p.blocked
  from public.profiles p
  where lower(btrim(p.login)) = lower(btrim(p_login))
  limit 1;
$$;

revoke all on function public.site_login_rate_limit(text) from public, anon, authenticated;
revoke all on function public.site_lookup_login(text) from public, anon, authenticated;
grant execute on function public.site_login_rate_limit(text) to service_role;
grant execute on function public.site_lookup_login(text) to service_role;
grant select,insert,update on public.site_login_attempts to service_role;

-- Проверка функций в SQL Editor:
-- select public.site_lookup_login('nonexistent'); -- пустая выборка
-- НЕ запускайте site_login_rate_limit вручную, чтобы не тратить попытки входа.
