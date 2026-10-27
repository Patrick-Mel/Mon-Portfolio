-- =============================================================================
-- VÉRIFICATION DES POLITIQUES RLS
-- À exécuter dans Supabase → SQL Editor APRÈS les migrations et le seed.
-- Tout se déroule dans une transaction annulée : aucune donnée n'est modifiée.
-- Le script lève une exception au premier contrôle qui échoue ; sinon il affiche
-- « ✓ RLS : tous les contrôles sont passés ».
-- =============================================================================
begin;

-- Données de test : un brouillon, un commentaire en attente, un message privé.
insert into public.projects (id, slug, category, title, summary, context, problem, solution, results, learnings, role, duration, year, status)
values ('00000000-0000-0000-0000-0000000000aa', 'test-brouillon', 'network',
  '{"fr":"t","en":"t"}', '{"fr":"t","en":"t"}', '{"fr":"t","en":"t"}', '{"fr":"t","en":"t"}', '{"fr":"t","en":"t"}',
  '{"fr":"t","en":"t"}', '{"fr":"t","en":"t"}', '{"fr":"t","en":"t"}', '{"fr":"t","en":"t"}', 2026, 'draft');
insert into public.contact_messages (name, email, subject, message) values ('Test', 't@example.com', 'Sujet', 'Message de test privé');
insert into public.comments (post_id, author_name, author_email, content, status)
select id, 'Anonyme', 'secret@example.com', 'en attente', 'pending' from public.posts limit 1;

-- ---------- Rôle anon (visiteur) ----------
set local role anon;

do $$
declare n int;
begin
  -- Lecture du contenu publié uniquement
  select count(*) into n from public.projects where slug = 'test-brouillon';
  if n <> 0 then raise exception 'anon voit un projet brouillon'; end if;

  select count(*) into n from public.projects where status = 'published';
  if n = 0 then raise exception 'anon ne voit pas les projets publiés (seed exécuté ?)'; end if;

  -- Données privées invisibles
  begin
    select count(*) into n from public.contact_messages;
    raise exception 'anon peut lire contact_messages';
  exception when insufficient_privilege then null;
  end;
  begin
    select count(*) into n from public.subscribers;
    raise exception 'anon peut lire subscribers';
  exception when insufficient_privilege then null;
  end;
  begin
    select count(*) into n from public.page_views;
    raise exception 'anon peut lire page_views';
  exception when insufficient_privilege then null;
  end;

  -- Commentaires : non approuvés invisibles, e-mail jamais lisible
  select count(*) into n from public.comments where status = 'pending';
  if n <> 0 then raise exception 'anon voit des commentaires non approuvés'; end if;
  begin
    select count(author_email) into n from public.comments;
    raise exception 'anon peut lire author_email';
  exception when insufficient_privilege then null;
  end;

  -- Aucune écriture
  begin
    insert into public.contact_messages (name, email, subject, message) values ('x', 'x@x.io', 'xx', 'xxxxxxxxxxxx');
    raise exception 'anon peut écrire dans contact_messages';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.site_settings set owner_name = 'pirate';
    get diagnostics n = row_count;
    if n > 0 then raise exception 'anon peut modifier site_settings'; end if;
  exception when insufficient_privilege then null;
  end;

  -- Fonctions réservées
  begin
    perform public.hit_rate_limit('x', 1, 60);
    raise exception 'anon peut appeler hit_rate_limit';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_analytics(7);
    raise exception 'anon peut appeler admin_analytics';
  exception when insufficient_privilege then null;
  end;
end;
$$;

-- ---------- Utilisateur authentifié NON administrateur ----------
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

do $$
declare n int;
begin
  select count(*) into n from public.contact_messages;
  if n <> 0 then raise exception 'un compte non admin lit les messages'; end if;

  select count(*) into n from public.projects where slug = 'test-brouillon';
  if n <> 0 then raise exception 'un compte non admin voit les brouillons'; end if;

  update public.site_settings set owner_name = 'pirate';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'un compte non admin modifie les paramètres'; end if;

  begin
    perform public.admin_analytics(7);
    raise exception 'un compte non admin lit les statistiques';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
do $$ begin raise notice '✓ RLS : tous les contrôles sont passés'; end $$;
rollback;
