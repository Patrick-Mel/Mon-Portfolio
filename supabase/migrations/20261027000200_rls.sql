-- =============================================================================
-- 0002 · ROW LEVEL SECURITY
-- Règles :
--   · anon : lecture du contenu PUBLIÉ uniquement, aucune écriture ;
--   · authenticated : tout est conditionné à is_admin() ;
--   · service_role (serveur uniquement) : formulaires publics et analytics,
--     après validation, filtrage anti-spam et limitation de débit côté Next.js.
-- =============================================================================

-- Défense en profondeur : aucun droit d'écriture pour anon, quelle que soit la table.
revoke insert, update, delete, truncate on all tables in schema public from anon;
alter default privileges in schema public revoke insert, update, delete, truncate on tables from anon;

alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.key_figures enable row level security;
alter table public.services enable row level security;
alter table public.skills enable row level security;
alter table public.timeline_entries enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.post_categories enable row level security;
alter table public.tags enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;
alter table public.comments enable row level security;
alter table public.contact_messages enable row level security;
alter table public.quote_requests enable row level security;
alter table public.subscribers enable row level security;
alter table public.campaigns enable row level security;
alter table public.media enable row level security;
alter table public.legal_pages enable row level security;
alter table public.page_views enable row level security;
alter table public.activity_log enable row level security;
alter table public.rate_limits enable row level security;

-- ---------- admins : un admin peut voir la liste, personne ne la modifie via l'API ----------
create policy admins_read on public.admins for select to authenticated using (public.is_admin());

-- ---------- Contenu toujours public ----------
create policy site_settings_read on public.site_settings for select to anon, authenticated using (true);
create policy site_settings_admin on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy key_figures_read on public.key_figures for select to anon, authenticated using (true);
create policy key_figures_admin on public.key_figures for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy skills_read on public.skills for select to anon, authenticated using (true);
create policy skills_admin on public.skills for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy timeline_read on public.timeline_entries for select to anon, authenticated using (true);
create policy timeline_admin on public.timeline_entries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy post_categories_read on public.post_categories for select to anon, authenticated using (true);
create policy post_categories_admin on public.post_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy tags_read on public.tags for select to anon, authenticated using (true);
create policy tags_admin on public.tags for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy legal_pages_read on public.legal_pages for select to anon, authenticated using (true);
create policy legal_pages_admin on public.legal_pages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy media_read on public.media for select to anon, authenticated using (bucket = 'media');
create policy media_admin on public.media for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Contenu publié uniquement ----------
create policy services_read on public.services for select to anon, authenticated
  using (published or public.is_admin());
create policy services_admin on public.services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy projects_read on public.projects for select to anon, authenticated
  using (status = 'published' or public.is_admin());
create policy projects_admin on public.projects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy project_images_read on public.project_images for select to anon, authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.projects p where p.id = project_id and p.status = 'published')
  );
create policy project_images_admin on public.project_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Un article « planifié » devient visible dès que sa date de publication est passée.
create policy posts_read on public.posts for select to anon, authenticated
  using (
    public.is_admin()
    or (status in ('published', 'scheduled') and published_at <= now())
  );
create policy posts_admin on public.posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy post_tags_read on public.post_tags for select to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.posts p
      where p.id = post_id and p.status in ('published', 'scheduled') and p.published_at <= now()
    )
  );
create policy post_tags_admin on public.post_tags for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Commentaires : seuls les approuvés sont publics, sans l'e-mail ----------
revoke select on public.comments from anon;
grant select (id, post_id, author_name, content, status, created_at) on public.comments to anon;
create policy comments_public_read on public.comments for select to anon using (status = 'approved');
create policy comments_admin on public.comments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Données privées : admin uniquement ----------
revoke all on public.contact_messages, public.quote_requests, public.subscribers, public.campaigns,
  public.page_views, public.activity_log, public.rate_limits, public.admins from anon;

create policy contact_messages_admin on public.contact_messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy quote_requests_admin on public.quote_requests for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy subscribers_admin on public.subscribers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy campaigns_admin on public.campaigns for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy page_views_admin_read on public.page_views for select to authenticated
  using (public.is_admin());
create policy page_views_admin_delete on public.page_views for delete to authenticated
  using (public.is_admin());
create policy activity_log_admin_read on public.activity_log for select to authenticated
  using (public.is_admin());
create policy activity_log_admin_insert on public.activity_log for insert to authenticated
  with check (public.is_admin() and actor_id = (select auth.uid()));
-- rate_limits : aucune politique → accessible uniquement via la fonction security definer.
revoke all on public.rate_limits from authenticated;
