# Portfolio — infrastructure & design

Portfolio professionnel bilingue (français / anglais) avec administration sécurisée sur `/admin`.
Pensé pour deux publics : **recruteurs** (emploi, stage) et **clients freelance** (PME, particuliers).

- **Site public** : accueil, compétences, services, projets (études de cas avec schémas zoomables), blog (sommaire, coloration du code, commentaires modérés, RSS, newsletter), parcours + CV, contact, devis détaillé, pages légales.
- **Administration** : tableau de bord et statistiques sans cookie, gestion de tout le contenu, boîte de réception (messages + devis), modération, newsletter, médiathèque, paramètres, double authentification, journal d'activité.
- **Stack** : Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 · Motion · Supabase (PostgreSQL, Auth, Storage, RLS) · next-intl · react-hook-form + zod · Resend.

> **Guide pas à pas pour utiliser le site : [docs/GUIDE-UTILISATION.md](docs/GUIDE-UTILISATION.md).**
>
> Documents associés : [PLAN.md](PLAN.md) (architecture, schéma, design system) · [DECISIONS.md](DECISIONS.md) (choix techniques justifiés).

---

## Sommaire

1. [Démarrage rapide (5 minutes, sans compte)](#1-démarrage-rapide)
2. [Variables d'environnement](#2-variables-denvironnement)
3. [Configurer Supabase](#3-configurer-supabase)
4. [Créer le compte administrateur](#4-créer-le-compte-administrateur)
5. [Déployer sur Vercel](#5-déployer-sur-vercel)
6. [Nom de domaine](#6-nom-de-domaine)
7. [Changer le nom, la marque, les couleurs](#7-changer-le-nom-la-marque-les-couleurs)
8. [Ajouter et remplacer le contenu](#8-ajouter-et-remplacer-le-contenu)
9. [E-mails et anti-spam](#9-e-mails-et-anti-spam)
10. [Qualité : lint, types, tests](#10-qualité--lint-types-tests)
11. [Structure du projet](#11-structure-du-projet)
12. [Dépannage](#12-dépannage)

---

## 1. Démarrage rapide

Prérequis : **Node.js 20.9 ou plus récent** (24 recommandé).

```bash
corepack enable          # active pnpm (livré avec Node)
pnpm install
pnpm dev                 # http://localhost:3000
```

Sans aucune configuration, le site public fonctionne avec le **contenu d'exemple** de `src/content/`.
Les formulaires répondent « service non configuré » et `/admin` affiche les étapes de configuration.

## 2. Variables d'environnement

Copiez `.env.example` en `.env.local` et complétez. Chaque variable y est commentée.

| Variable | Obligatoire | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | en production | URL publique (`https://…`, sans `/` final) |
| `NEXT_PUBLIC_SUPABASE_URL` | pour l'admin | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | pour l'admin | clé publique (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | pour l'admin | **secret** — serveur uniquement |
| `HASH_SALT` | recommandé | **secret** — sel des empreintes anonymes |
| `RESEND_API_KEY`, `EMAIL_FROM` | pour les e-mails | notifications, réponses, newsletter |
| `OWNER_NOTIFICATION_EMAIL` | non | destinataire des notifications |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | non | anti-robot Cloudflare |

> ⚠️ Ne préfixez **jamais** `SUPABASE_SERVICE_ROLE_KEY` par `NEXT_PUBLIC_`. Le module qui l'utilise importe `server-only` : le build échoue s'il est importé côté navigateur.

## 3. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com) (région proche de vos visiteurs, par exemple `eu-west`).
2. **Project Settings → API** : copiez l'URL, la clé `anon` et la clé `service_role` dans `.env.local`.
3. **SQL Editor** : exécutez dans l'ordre le contenu de
   - `supabase/migrations/20261027000100_schema.sql`
   - `supabase/migrations/20261027000200_rls.sql`
   - `supabase/migrations/20261027000300_functions_storage.sql`
   - `supabase/seed.sql` (contenu d'exemple)

   Avec la CLI Supabase, c'est équivalent à `supabase link` puis `supabase db push` et l'exécution du seed.
4. **Vérifiez la sécurité** : exécutez `supabase/tests/rls.test.sql`. Le message attendu est « ✓ RLS : tous les contrôles sont passés » (le script s'exécute dans une transaction annulée).
5. **Authentication → Providers → Email** : décochez **« Allow new users to sign up »**. Les inscriptions publiques doivent rester fermées.
6. **Authentication → Multi-Factor** : vérifiez que **TOTP** est activé (c'est le cas par défaut).
7. **Authentication → URL Configuration** : renseignez votre URL de production comme *Site URL*.

Les buckets Storage (`media` public, `private` pour les pièces jointes des devis) sont créés par la 3ᵉ migration.

> Le seed est **généré** à partir de `src/content/` : après avoir modifié ces fichiers, lancez `pnpm db:seed:generate`.

## 4. Créer le compte administrateur

Il n'existe **aucune page d'inscription**. Le compte propriétaire se crée en ligne de commande avec la clé `service_role` :

```bash
pnpm admin:create votre@email.com
# le mot de passe (12 caractères minimum, 16+ conseillés) est demandé de façon masquée
```

Le script crée l'utilisateur (e-mail confirmé) et l'ajoute à la table `public.admins`. Relancé sur un compte existant, il réinitialise son mot de passe.

Ensuite :

1. Ouvrez `/admin`, connectez-vous.
2. Allez dans **Sécurité (2FA)** et activez la double authentification (Google Authenticator, Aegis, 1Password…).

*Sans terminal* : créez l'utilisateur dans **Authentication → Users → Add user** (cochez « Auto confirm »), copiez son UID, puis dans le SQL Editor : `insert into public.admins (user_id) values ('<UID>');`

## 5. Déployer sur Vercel

1. Poussez le dépôt sur GitHub/GitLab.
2. Sur [vercel.com](https://vercel.com) → **Add New Project** → importez le dépôt. Vercel détecte Next.js et pnpm automatiquement ; aucune modification de code n'est nécessaire.
3. **Environment Variables** : ajoutez les variables de la section 2 (au minimum `NEXT_PUBLIC_SITE_URL` avec l'URL Vercel ou votre domaine, les trois variables Supabase et `HASH_SALT`).
4. **Deploy**.
5. Dans l'admin → **Paramètres**, vérifiez l'URL du site.

Les pages publiques sont pré-générées et mises en cache (ISR) ; chaque enregistrement dans l'admin régénère le site. Les articles planifiés apparaissent au plus tard une heure après leur date.

## 6. Nom de domaine

1. Achetez le domaine (ex. chez un registrar comme Gandi, OVH, Namecheap ou Cloudflare).
2. Vercel → **Project → Settings → Domains** → ajoutez `votredomaine.com` et `www.votredomaine.com`, puis créez chez le registrar les enregistrements DNS indiqués (A / CNAME).
3. Mettez à jour `NEXT_PUBLIC_SITE_URL` sur Vercel (puis redéployez) et l'URL dans **/admin → Paramètres**.
4. Mettez à jour la *Site URL* dans Supabase (Authentication → URL Configuration).
5. Pour Resend, vérifiez le domaine (enregistrements DNS SPF/DKIM fournis par Resend) et utilisez une adresse de ce domaine dans `EMAIL_FROM`.

## 7. Changer le nom, la marque, les couleurs

**En deux minutes, sans toucher aux composants** :

- Dans l'admin → **Paramètres** : nom complet, nom de marque, initiales du monogramme, URL, e-mail, téléphone, WhatsApp, réseaux sociaux, textes d'accroche, SEO, couleur d'accent, thème par défaut, fonctionnalités actives.
- Valeurs par défaut (utilisées tant que la base est vide ou absente) : **`site.config.ts`**, à la racine.
- Design tokens (couleurs, rayons, ombres, typographie, motion) : **`src/app/globals.css`**, section « DESIGN TOKENS ». Polices : `src/app/fonts.ts`.

Le monogramme, le favicon, les images de partage et le CV d'exemple sont générés à partir des initiales et de la couleur d'accent.

## 8. Ajouter et remplacer le contenu

Tout le contenu d'exemple porte un badge **Exemple** dans l'admin et le tableau de bord indique combien il en reste. Décochez « Contenu d'exemple » une fois l'élément personnalisé.

| Quoi | Où dans l'admin | Conseils |
| --- | --- | --- |
| Identité, présentation, coordonnées, CV | Paramètres | Téléversez un PDF par langue (champ « CV ») |
| Photo de profil | Paramètres → Photo | Portrait vertical (4:5), 1200 px de haut suffisent |
| Projets | Projets | Rédigez en étude de cas ; ajoutez captures et schémas en bas de la fiche |
| Schémas réseau | Projets → Schémas interactifs | JSON avec aperçu en direct (voir ci-dessous) |
| Articles | Articles | Markdown, aperçu exact, planification par date |
| Services | Services | Bénéfices et livrables : un par ligne |
| Compétences | Compétences | Niveau qualitatif ; « clé » = visible sur l'accueil |
| Parcours | Parcours | Dates au format AAAA-MM |
| Chiffres clés | Chiffres clés | Uniquement des faits vérifiables |
| Mentions légales, confidentialité | Pages légales | À relire si vous activez/désactivez une fonctionnalité |

**Format d'un schéma** (coordonnées dans un repère `width × height`) :

```json
[{
  "id": "mon-schema",
  "title": { "fr": "Topologie cible", "en": "Target topology" },
  "width": 800, "height": 400,
  "zones": [{ "label": { "fr": "Siège", "en": "HQ" }, "x": 20, "y": 20, "w": 300, "h": 200 }],
  "nodes": [
    { "id": "fw", "label": "pfSense", "kind": "firewall", "x": 100, "y": 100 },
    { "id": "srv", "label": { "fr": "Serveur", "en": "Server" }, "sub": "Debian", "kind": "server", "x": 260, "y": 100 }
  ],
  "links": [{ "from": "fw", "to": "srv", "label": "VLAN 20", "style": "solid" }]
}]
```

Types de nœuds : `router`, `firewall`, `switch`, `server`, `client`, `cloud`, `database`, `app`, `monitor`, `vpn`. Styles de liaison : `solid`, `dashed`, `tunnel` (animé, couleur d'accent).

**Textes d'interface** (boutons, titres de sections…) : `src/messages/fr.json` et `en.json`. Les deux fichiers doivent garder les mêmes clés (vérifié par les tests).

## 9. E-mails et anti-spam

- **Resend** : créez une clé API, vérifiez votre domaine, renseignez `RESEND_API_KEY` et `EMAIL_FROM`. Vous recevez une notification pour chaque message, devis et commentaire, et pouvez répondre depuis l'admin. Sans Resend, tout est enregistré dans la base, simplement sans e-mail.
- **Newsletter** : double opt-in (lien de confirmation), lien de désinscription en un clic et en-têtes `List-Unsubscribe` dans chaque campagne.
- **Anti-spam** : pot de miel, délai minimal de saisie, limitation de débit par IP hachée (stockée dans Postgres) et, si configuré, Cloudflare Turnstile.

## 10. Qualité : lint, types, tests

```bash
pnpm lint            # ESLint
pnpm typecheck       # types Next + TypeScript strict
pnpm test            # tests unitaires (Vitest) : validation, i18n, Markdown, CSV…
pnpm build           # build de production
pnpm test:e2e        # Playwright (après pnpm build)
pnpm check           # lint + types + tests + build
```

Pour les tests e2e : `npx playwright install chromium` une fois, ou utilisez un navigateur installé : `PW_CHANNEL=msedge pnpm test:e2e`.

Scripts utiles : `pnpm db:seed:generate` (régénère le seed), `pnpm tsx scripts/generate-example-cv.ts` (régénère les CV d'exemple), `pnpm format`.

## 11. Structure du projet

```
site.config.ts            configuration centrale (nom, marque, contact…)
src/app/[locale]/         site public (fr, en) — chemins localisés dans src/i18n/routing.ts
src/app/admin/            administration (layout séparé, noindex) + actions serveur
src/app/api/              statistiques, newsletter
src/components/           ui/ (design system), layout/, sections/, projects/, blog/, forms/, admin/, visuals/
src/content/              contenu d'exemple (repli hors-ligne + source du seed)
src/lib/                  données, Supabase, sécurité, Markdown, SEO, validation
src/messages/             traductions de l'interface
src/proxy.ts              i18n + garde /admin + rafraîchissement de session
supabase/migrations/      schéma, RLS, fonctions, storage
supabase/seed.sql         contenu d'exemple (généré)
supabase/tests/           vérification des politiques RLS
scripts/                  création de l'admin, génération du seed et des CV
tests/ · e2e/             tests unitaires et de bout en bout
```

## 12. Dépannage

| Symptôme | Cause probable / solution |
| --- | --- |
| `/admin` affiche « Configuration requise » | Variables Supabase absentes ; redémarrez `pnpm dev` après avoir modifié `.env.local`. |
| « Identifiants invalides » alors que le mot de passe est bon | Le compte n'est pas dans `public.admins` → relancez `pnpm admin:create`. |
| « Trop de tentatives » | Limitation de 5 essais / 15 min par compte : patientez, ou videz la table `rate_limits`. |
| Le build échoue avec `[content] Lecture impossible…` | Supabase configuré mais migrations non exécutées. |
| Les formulaires répondent « service non configuré » | `SUPABASE_SERVICE_ROLE_KEY` manquante. |
| Aucun e-mail reçu | `RESEND_API_KEY` / `EMAIL_FROM` absents, ou domaine non vérifié chez Resend (voir les logs Resend). |
| Une modification n'apparaît pas | Rechargez sans cache ; les articles planifiés apparaissent dans l'heure suivant leur date. |
| Images Supabase refusées par `next/image` | `NEXT_PUBLIC_SUPABASE_URL` doit être définie **au moment du build** (domaine autorisé). |
| Code 2FA refusé | Vérifiez que l'heure du téléphone est synchronisée automatiquement. |
| `pnpm` introuvable | `corepack enable` (ou `npm i -g pnpm`). |
