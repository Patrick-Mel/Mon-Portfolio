# PLAN — Portfolio bilingue + administration

> Document de travail. Les choix structurants sont justifiés dans [DECISIONS.md](DECISIONS.md).

## 1. Concept de direction artistique — « Signal »

**Idée** : *une ingénierie rigoureuse, un design irréprochable.* Le site emprunte le
vocabulaire visuel des réseaux (nœuds, liaisons, paquets, couches OSI, invites de
terminal) mais le traite comme une publication éditoriale haut de gamme : beaucoup
d'air, une typographie très contrastée, une seule couleur de signal.

| Élément | Choix |
| --- | --- |
| Couleur de signal | Orange « signal » (`#FF5A1F`), utilisé avec parcimonie : liens actifs, paquets animés, CTA principal |
| Neutres | « Encre » graphite chaud (sombre) / « Papier » blanc cassé (clair), 11 niveaux |
| Display | **Bricolage Grotesque** (variable, expressive, chasse optique) |
| Texte | **Instrument Sans** (lisible, neutre, moderne) |
| Mono | **JetBrains Mono** (labels techniques, métadonnées, numéros de couche) |
| Motif | Grille de points fine + « traces » orthogonales façon schéma de câblage |
| Signature | Le monogramme est un nœud : initiales dans un cadre aux coins coupés, relié par un trait |
| Motion | Courbes `cubic-bezier(.2,.8,.2,1)`, durées 150/300/600 ms, paquets qui circulent sur la topologie du hero ; tout est coupé sous `prefers-reduced-motion` |

Chaque section est étiquetée comme une couche réseau (`L1 · Présentation`, `L2 · Services`…)
en mono : c'est le fil rouge typographique du site.

## 2. Arborescence

```
.
├── PLAN.md · DECISIONS.md · README.md · .env.example
├── site.config.ts                 # nom, marque, URL, contact, réseaux : source unique
├── supabase/
│   ├── migrations/                # SQL versionné (schéma, RLS, stockage, fonctions)
│   ├── seed.sql                   # GÉNÉRÉ depuis src/content/ (pnpm db:seed:generate)
│   └── tests/rls.test.sql         # vérifications RLS (pgTAP-like, SQL pur)
├── scripts/
│   ├── create-admin.mjs           # création du compte propriétaire (service_role)
│   └── generate-seed.ts           # contenu d'exemple TS → seed.sql
├── e2e/                           # Playwright
├── public/                        # favicons statiques, fichiers CV d'exemple
└── src/
    ├── proxy.ts                   # i18n + protection /admin + rafraîchissement session
    ├── i18n/                      # routing, request config, navigation
    ├── messages/fr.json · en.json # tous les textes d'interface
    ├── content/                   # contenu d'exemple typé (fallback hors Supabase + seed)
    ├── app/
    │   ├── [locale]/              # site public (fr, en)
    │   │   ├── page.tsx           # accueil
    │   │   ├── competences|skills, services, projets/[slug], blog/[slug], contact, devis,
    │   │   │   parcours, mentions-legales, confidentialite  (pathnames localisés)
    │   │   ├── blog/rss.xml       # flux RSS par langue
    │   │   └── opengraph-image    # images de partage générées
    │   ├── admin/                 # back-office (layout séparé, noindex)
    │   ├── api/                   # track (analytics), newsletter confirm/unsubscribe, cv
    │   ├── sitemap.ts · robots.ts · global-error.tsx · not-found.tsx
    ├── components/
    │   ├── ui/                    # design system : Button, Card, Badge, Tabs, Accordion,
    │   │                          #   Dialog, Toast, Table, Field, Skeleton, EmptyState…
    │   ├── brand/                 # Monogram, Logo
    │   ├── layout/                # Header, MobileMenu, Footer, ThemeToggle, LocaleSwitcher
    │   ├── sections/              # sections de l'accueil
    │   ├── visuals/               # HeroTopology, TopologyDiagram, motifs SVG
    │   ├── forms/                 # Contact, Devis, Commentaire, Newsletter
    │   └── admin/                 # composants spécifiques à l'admin
    ├── lib/
    │   ├── supabase/              # clients public / serveur (cookies) / service (server-only)
    │   ├── data/                  # couche d'accès au contenu (Supabase → fallback local)
    │   ├── validation/            # schémas zod partagés client/serveur
    │   ├── security/              # rate limit, honeypot, Turnstile, hash IP
    │   ├── markdown.ts            # unified : GFM, slug, TOC, Shiki, sanitize
    │   ├── email.ts               # Resend (fetch, sans SDK)
    │   └── seo.ts · jsonld.ts · i18n-helpers.ts
    └── styles/                    # tokens.css (design tokens), globals
```

## 3. Schéma de base de données (PostgreSQL / Supabase)

Contenu multilingue : colonnes `jsonb` typées `{ "fr": "...", "en": "..." }` validées par
une contrainte `CHECK (is_i18n(col))`. Une seule ligne par entité, pas de duplication.

| Table | Rôle | Lecture publique | Écriture |
| --- | --- | --- | --- |
| `admins` | utilisateurs autorisés (1 propriétaire) | non | SQL / script |
| `site_settings` | singleton : identité, contact, SEO, thème, accent, drapeaux de fonctionnalités, CV | oui | admin |
| `key_figures` | chiffres clés | oui | admin |
| `services` | offres freelance (bénéfices, livrables, processus) | si `published` | admin |
| `skills` | compétences (domaine, niveau qualitatif, icône) | oui | admin |
| `timeline_entries` | formation / expériences | oui | admin |
| `projects` | études de cas (contexte, problème, solution, résultats, apprentissages, schémas JSON) | si `published` | admin |
| `project_images` | galerie + schémas téléversés | si projet publié | admin |
| `post_categories`, `tags`, `post_tags` | taxonomie du blog | oui | admin |
| `posts` | articles (brouillon / planifié / publié, SEO par article) | si publié et `published_at <= now()` | admin |
| `comments` | commentaires modérés | si `approved` | service (formulaire) + admin |
| `contact_messages` | messages | **admin seulement** | service + admin |
| `quote_requests` | devis + pièces jointes privées | **admin seulement** | service + admin |
| `subscribers` | newsletter double opt-in | **admin seulement** | service + admin |
| `campaigns` | envois newsletter | admin | admin |
| `media` | médiathèque | oui (métadonnées) | admin |
| `legal_pages` | mentions légales / confidentialité éditables | oui | admin |
| `page_views` | analytics sans cookie (hash quotidien salé) | **admin seulement** | service |
| `activity_log` | journal d'activité | admin | admin + service |
| `rate_limits` | compteurs de limitation de débit | non | fonction `security definer` |

Fonctions : `is_admin()`, `is_i18n()`, `hit_rate_limit(key, max, window)`,
`admin_analytics(days)`, déclencheurs `updated_at`. Buckets Storage : `media` (public en
lecture, écriture admin), `private` (pièces jointes de devis, lecture admin uniquement).

**Principe de sécurité** : le rôle `anon` n'a *aucun* droit d'écriture. Les formulaires
publics passent par des Server Actions qui valident (zod), filtrent (pot de miel,
Turnstile, limitation de débit) puis écrivent avec la clé `service_role`, qui ne quitte
jamais le serveur (`import "server-only"`). L'admin écrit avec sa session : la RLS
(`is_admin()`) est la dernière barrière, la vérification `requireAdmin()` de chaque
action serveur la première.

## 4. Design system (tokens)

- `src/styles/tokens.css` : couleurs (sémantiques : `--bg`, `--surface`, `--fg`,
  `--muted`, `--line`, `--accent`, `--accent-ink`, `--accent-contrast`, `--success`,
  `--warning`, `--danger`), rayons (`--radius-xs`…`--radius-xl`), ombres (3 niveaux),
  espacements de section, durées et courbes de motion, largeur de lecture.
- `@theme` Tailwind v4 mappe ces variables → classes utilitaires (`bg-surface`,
  `text-muted`, `border-line`, `text-accent-ink`…).
- Thèmes : `:root[data-theme="dark"|"light"]`, script inline dans `<head>` (pas de flash),
  choix mémorisé dans `localStorage`, `system` par défaut (ou valeur admin).
- Accent personnalisable depuis l'admin : seul `--accent` change ; les variantes de
  contraste sont dérivées avec `color-mix()`.

## 5. Pages

**Public (fr / en, chemins localisés)** : accueil, compétences, services, projets
(liste filtrable + détail étude de cas), blog (liste paginée, catégories, tags,
recherche, article avec sommaire, partage, articles liés, commentaires), contact,
devis, parcours (timeline + CV), mentions légales, confidentialité, newsletter
(confirmation / désinscription), 404, erreur.

**Admin (`/admin`, français)** : connexion (+ TOTP), tableau de bord, projets, articles,
catégories & tags, services, compétences, parcours, chiffres clés, boîte de réception
(messages + devis), commentaires, newsletter (abonnés + campagnes), médiathèque,
pages légales, paramètres (identité, contact, SEO, thème, fonctionnalités, CV, 2FA),
journal d'activité.

## 6. Phases et tâches

### A — Fondations et design system
- [x] Squelette Next 16 + TypeScript strict + pnpm
- [x] Dépendances, ESLint, Prettier, Vitest, Playwright
- [x] `site.config.ts`, tokens, polices, thèmes sans flash
- [x] next-intl (routes `/fr` `/en`, détection navigateur, pathnames localisés)
- [x] Composants UI de base, monogramme SVG, en-tête, pied de page, menu mobile
- [x] Lint + type-check + build

### B — Site public
- [x] Contenu d'exemple typé FR/EN (services ×5, compétences ×26, projets ×4, articles ×3, parcours)
- [x] Couche de données (Supabase → repli sur le contenu local)
- [x] Accueil complet, compétences, services, projets + détail, parcours/CV
- [x] Blog : liste, filtres, recherche, article (TOC, Shiki), RSS
- [x] Contact, devis (pré-remplissage depuis un service), pages légales, 404/500

### C — Supabase et /admin
- [x] Migrations : schéma, contraintes, index, RLS, storage, fonctions
- [x] Générateur de seed depuis `src/content`
- [x] Clients Supabase, proxy (garde /admin, AAL2), `requireAdmin()`
- [x] Server Actions publiques (contact, devis + pièces jointes, commentaires, newsletter) + emails Resend
- [x] Admin : layout, connexion + TOTP + limitation, CRUD complet, boîte de réception, CSV, médiathèque (sharp), paramètres, journal

### D — Bonus
- [x] Analytics maison sans cookie + tableau de bord
- [x] Newsletter double opt-in + campagnes
- [x] Schémas de topologie interactifs (zoom), galerie lightbox
- [x] Recherche côté client du blog et des projets

### E — Qualité et livraison
- [x] SEO : metadata, hreflang, canonicals, OG dynamiques, JSON-LD, sitemap, robots
- [x] En-têtes de sécurité (CSP…)
- [x] Accessibilité (skip link, focus, contrastes, ARIA)
- [x] Tests unitaires (validation, slug, rate-limit, i18n, markdown) + e2e (navigation, langue, thème, formulaires, garde admin)
- [x] README, DECISIONS, rapport final
