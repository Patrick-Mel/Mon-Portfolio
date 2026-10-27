# DÉCISIONS

Choix non couverts (ou laissés ouverts) par le cahier des charges, pris pour ne pas bloquer le projet.
Chaque entrée : la décision, sa raison, et comment revenir dessus.

## Socle

**D-001 · pnpm via Corepack.** pnpm n'était pas installé ; Corepack (livré avec Node) fournit pnpm 12. Le champ `packageManager` du `package.json` fixe la version : `corepack enable` puis `pnpm dev`. Vercel détecte pnpm automatiquement.

**D-002 · Next.js 16 sans `cacheComponents`.** Next 16.4 active par défaut Cache Components. Le projet utilise le modèle éprouvé ISR (`revalidate = 3600`) + `revalidatePath` déclenché par chaque modification dans l'admin : pages publiques 100 % statiques (rapides sur réseau lent) et compatibles avec le rendu statique de next-intl (`setRequestLocale`). Migration possible plus tard sans toucher aux composants.

**D-003 · `proxy.ts` au lieu de `middleware.ts`.** Convention de Next 16. Le proxy gère l'i18n et une garde *optimiste* de `/admin` ; l'autorisation réelle est revérifiée côté serveur (`requireAdmin`) et par la RLS.

## Données et contenu

**D-004 · Multilingue en colonnes `jsonb {fr, en}`.** Une ligne par entité, une contrainte `is_i18n()` garantit les deux langues. Plus simple à éditer et à requêter que des tables de traduction pour deux langues. Ajouter une langue = ajouter une clé + un fichier `messages/xx.json`.

**D-005 · Un seul slug par contenu, partagé entre les langues.** Les *routes* sont localisées (`/fr/projets`, `/en/projects`), les slugs non. Évite les collisions et simplifie le sélecteur de langue.

**D-006 · Contenu d'exemple local en repli.** Sans Supabase, le site public sert `src/content/*` : il démarre et se build sans aucune configuration. Le même contenu génère `supabase/seed.sql` (`pnpm db:seed:generate`) : une seule source. Dès que Supabase est configuré, une erreur de lecture **lève une exception** au lieu de servir l'exemple (en ISR, Next continue alors de servir la dernière version valide).

**D-007 · Identité.** `site.config.ts` utilise « Patrick Melaga » et les initiales « PM ». Coordonnées factices (`contact@example.com`, `+237 600 000 000`). Réseaux sociaux vides = masqués (aucun lien mort). Tout se change dans `site.config.ts` ou `/admin → Paramètres`.

**D-008 · Pas de faux contenu.** Aucun client, témoignage, certification ni chiffre de performance inventé. Les chiffres clés sont des faits de parcours (années, diplômes, domaines). Les résultats de projets sont qualitatifs. Tout est marqué `is_example` et signalé dans l'admin.

**D-009 · `site_url` : la variable d'environnement prime sur une URL locale en base.** Le seed contient `http://localhost:3000` ; tant que la base contient une URL locale, `NEXT_PUBLIC_SITE_URL` est utilisée (canonicals justes dès le premier déploiement). Une vraie URL saisie dans l'admin prime ensuite.

## Sécurité

**D-010 · Le rôle `anon` n'écrit jamais.** Formulaires publics, statistiques et désinscriptions passent par le serveur (validation zod → anti-spam → limitation de débit → clé `service_role`, importée avec `server-only`). L'admin écrit avec sa propre session : RLS `is_admin()` en dernière barrière.

**D-011 · CSP avec `'unsafe-inline'` pour les scripts.** Les nonces imposent un rendu dynamique de chaque page, incompatible avec l'objectif de performance (pages statiques servies par le CDN). Atténuations : aucun HTML utilisateur rendu brut (Markdown assaini, HTML brut ignoré), JSON-LD échappé, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, liste blanche stricte des origines. HSTS et `upgrade-insecure-requests` ne s'activent que si `NEXT_PUBLIC_SITE_URL` est en HTTPS.

**D-012 · CSRF.** Les Server Actions de Next vérifient l'en-tête `Origin` ; la route `/api/track` le vérifie explicitement ; les cookies Supabase sont `SameSite=Lax`.

**D-013 · Limitation de débit dans Postgres.** Fonction `hit_rate_limit` (fenêtre fixe) partagée entre toutes les instances serverless, sans service externe (Redis/Upstash). Repli en mémoire en développement.

**D-014 · Turnstile facultatif.** Le pot de miel + délai minimal de remplissage + limitation de débit protègent déjà ; Turnstile s'active en renseignant ses deux clés, et son script n'est chargé qu'à l'approche du formulaire.

## Fonctionnalités

**D-015 · Éditeur Markdown plutôt que Tiptap.** Barre d'outils + aperçu rendu par **le même pipeline que le site** (fidélité exacte, coloration Shiki). Pas d'éditeur WYSIWYG de 200 Ko dans l'admin, contenu portable.

**D-016 · Schémas de topologie décrits en données.** Les schémas de projets sont du JSON (nœuds typés, liaisons, zones) rendu en SVG : nets à toutes les tailles, adaptés aux deux thèmes, traduisibles, zoomables, avec aperçu en direct dans l'admin. Les schémas exportés (PNG/SVG) restent possibles via la galerie du projet (type « Schéma »).

**D-017 · Statistiques maison sans cookie.** Une ligne par page vue ; empreinte visiteur = `sha256(IP + user-agent + date + sel)`, renouvelée chaque jour, jamais réversible. DNT et GPC respectés. Aucun bandeau de consentement nécessaire. Purge à 13 mois via `purge_old_page_views()`.

**D-018 · Aucun cookie côté visiteur.** Le cookie de langue de next-intl est désactivé (détection par `Accept-Language` + URL) ; le thème est stocké dans `localStorage`. Seule l'admin utilise des cookies (session, strictement nécessaires).

**D-019 · Pagination et recherche du blog côté client.** Avec quelques dizaines d'articles, la liste complète est légère ; recherche instantanée et pagination sans aller-retour serveur, pages catégorie/tag statiques pour le SEO.

**D-020 · Admin en français uniquement.** Un seul utilisateur, francophone. Le site public est intégralement bilingue.

**D-021 · Réseaux sociaux en libellés typographiques.** Lucide a retiré les logos de marques ; plutôt que de redessiner des logos approximatifs, les liens sociaux sont des libellés (« GitHub ↗ »), cohérents avec la direction artistique.

**D-022 · CV d'exemple généré.** `scripts/generate-example-cv.ts` produit `public/cv/cv-{fr,en}.pdf` à partir du contenu, avec un bandeau « exemple ». Les PDF téléversés dans l'admin les remplacent.

**D-023 · Animations.** Apparitions au scroll : un seul `IntersectionObserver` + transitions CSS (pas de librairie). Motion (chargé via `LazyMotion`) seulement pour le menu mobile et les filtres. Paquets du hero et transitions de page en CSS pur. Tout est coupé sous `prefers-reduced-motion`. Bascule de thème animée via View Transitions quand le navigateur la supporte.

**D-024 · Polices.** Bricolage Grotesque (titres), Instrument Sans (texte), JetBrains Mono (détails techniques) — auto-hébergées par `next/font`, `display: swap`, la mono n'est pas préchargée.
