-- =============================================================================
-- 0003 · FONCTIONS (limitation de débit, statistiques) ET STORAGE
-- =============================================================================

-- ---------- Limitation de débit (fenêtre fixe) ----------
-- Renvoie true si l'action est autorisée. Appelée uniquement par le serveur (service_role).
create or replace function public.hit_rate_limit(p_key text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as r (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update set
    count = case
      when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
      else r.count + 1
    end,
    window_start = case
      when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
      else r.window_start
    end
  returning count into v_count;

  -- Nettoyage opportuniste des fenêtres expirées (1 appel sur 50 environ).
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_count <= p_max;
end;
$$;

revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

-- ---------- Statistiques agrégées pour le tableau de bord ----------
create or replace function public.admin_analytics(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_since timestamptz := date_trunc('day', now()) - make_interval(days => greatest(p_days, 1) - 1);
  v_prev_since timestamptz := v_since - make_interval(days => greatest(p_days, 1));
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  with v as (
    select * from public.page_views where created_at >= v_since and device is distinct from 'bot'
  ),
  prev as (
    select * from public.page_views
    where created_at >= v_prev_since and created_at < v_since and device is distinct from 'bot'
  ),
  days as (
    select generate_series(v_since, date_trunc('day', now()), interval '1 day') as day
  )
  select jsonb_build_object(
    'views', (select count(*) from v),
    'visitors', (select count(distinct visitor_hash) from v),
    'prevViews', (select count(*) from prev),
    'prevVisitors', (select count(distinct visitor_hash) from prev),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object(
        'day', to_char(d.day, 'YYYY-MM-DD'),
        'views', (select count(*) from v where date_trunc('day', v.created_at) = d.day),
        'visitors', (select count(distinct visitor_hash) from v where date_trunc('day', v.created_at) = d.day)
      ) order by d.day) from days d
    ), '[]'::jsonb),
    'pages', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select path as label, count(*) as value from v group by path order by value desc limit 10
      ) t
    ), '[]'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select coalesce(referrer_host, 'direct') as label, count(*) as value
        from v group by 1 order by value desc limit 8
      ) t
    ), '[]'::jsonb),
    'countries', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select coalesce(country, '??') as label, count(*) as value
        from v group by 1 order by value desc limit 8
      ) t
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select coalesce(device, 'desktop') as label, count(*) as value from v group by 1 order by value desc
      ) t
    ), '[]'::jsonb),
    'locales', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select coalesce(locale, '—') as label, count(*) as value from v group by 1 order by value desc
      ) t
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_analytics(integer) from public, anon;
grant execute on function public.admin_analytics(integer) to authenticated;

-- ---------- Purge des statistiques au-delà de 13 mois (cf. politique de confidentialité) ----------
create or replace function public.purge_old_page_views()
returns integer
language sql
security definer
set search_path = ''
as $$
  with d as (delete from public.page_views where created_at < now() - interval '13 months' returning 1)
  select count(*)::integer from d;
$$;
revoke all on function public.purge_old_page_views() from public, anon, authenticated;
grant execute on function public.purge_old_page_views() to service_role;

-- ---------- Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 10485760,
    array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml', 'application/pdf']),
  ('private', 'private', false, 5242880,
    array['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- media : lecture publique (bucket public), écriture admin.
create policy media_objects_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy media_objects_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy media_objects_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- private : pièces jointes des devis. Dépôt par le serveur (service_role), lecture admin.
create policy private_objects_admin_read on storage.objects for select to authenticated
  using (bucket_id = 'private' and public.is_admin());
create policy private_objects_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'private' and public.is_admin());
