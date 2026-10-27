/**
 * MODÈLES DE PAGES LÉGALES — éditables dans /admin → Pages légales.
 * Variables remplacées au rendu : {{ownerName}}, {{brandName}}, {{siteUrl}},
 * {{contactEmail}}, {{location}}. La politique de confidentialité décrit
 * exactement ce que le site collecte ; la mettre à jour si les fonctionnalités changent.
 */
import type { LegalPage } from "@/lib/types";

export const legalPages: LegalPage[] = [
  {
    slug: "legal-notice",
    title: { fr: "Mentions légales", en: "Legal notice" },
    content: {
      fr: `## Éditeur du site

Le site {{siteUrl}} est édité à titre personnel par **{{ownerName}}**, {{location}}.
Contact : {{contactEmail}}.

## Directeur de la publication

{{ownerName}}.

## Hébergement

- Application : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com.
- Base de données et fichiers : Supabase Inc., 970 Toa Payoh North #07-04, Singapour 318992 — supabase.com.

## Propriété intellectuelle

Les textes, visuels, schémas et le code de présentation de ce site sont la propriété de {{ownerName}}, sauf mention contraire. Toute reproduction sans autorisation est interdite. Les marques citées appartiennent à leurs propriétaires respectifs.

## Responsabilité

Les informations publiées le sont à titre indicatif. Les articles techniques décrivent des procédures à adapter à votre contexte ; leur application se fait sous votre responsabilité.`,
      en: `## Publisher

The website {{siteUrl}} is published in a personal capacity by **{{ownerName}}**, {{location}}.
Contact: {{contactEmail}}.

## Publication director

{{ownerName}}.

## Hosting

- Application: Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA — vercel.com.
- Database and files: Supabase Inc., 970 Toa Payoh North #07-04, Singapore 318992 — supabase.com.

## Intellectual property

The texts, visuals, diagrams and presentation code of this site belong to {{ownerName}} unless stated otherwise. Reproduction without permission is prohibited. Trademarks mentioned belong to their respective owners.

## Liability

Information is published for guidance only. Technical articles describe procedures you must adapt to your context; applying them is your responsibility.`,
    },
    updatedAt: "2026-10-01T08:00:00.000Z",
    isExample: true,
  },
  {
    slug: "privacy",
    title: { fr: "Politique de confidentialité", en: "Privacy policy" },
    content: {
      fr: `Ce site collecte le strict minimum. Il n'utilise **aucun cookie publicitaire ni de traçage**, et aucune donnée n'est vendue ou cédée.

## Responsable du traitement

{{ownerName}} — {{contactEmail}}.

## Données collectées et finalités

| Origine | Données | Finalité | Conservation |
| --- | --- | --- | --- |
| Formulaire de contact | nom, e-mail, sujet, message | répondre à votre demande | 2 ans maximum |
| Demande de devis | nom, e-mail, téléphone et entreprise (facultatifs), besoin, budget, délai, pièces jointes | établir un devis | 3 ans maximum |
| Commentaires | nom, e-mail (jamais publié), commentaire | publication après modération | durée de publication |
| Newsletter | e-mail, langue | envoi des nouveaux articles | jusqu'à la désinscription |
| Statistiques de visite | page visitée, site de provenance, pays, type d'appareil, empreinte anonyme renouvelée chaque jour | mesurer l'audience de façon agrégée | 13 mois |

Votre adresse IP n'est jamais enregistrée en clair : elle est combinée à un sel quotidien puis hachée, ce qui empêche de vous suivre d'un jour à l'autre. Les signaux « Do Not Track » et « Global Privacy Control » sont respectés : aucune statistique n'est alors enregistrée.

## Stockage local

Votre choix de thème (clair ou sombre) est mémorisé dans le stockage local de votre navigateur. Il ne quitte jamais votre appareil.

## Protection anti-spam

Les formulaires peuvent utiliser Cloudflare Turnstile, un contrôle anti-robots qui ne dépose pas de cookie de traçage publicitaire.

## Destinataires et sous-traitants

Vos données ne sont accessibles qu'à {{ownerName}}. Elles sont hébergées par Supabase (base de données) et Vercel (application) ; les notifications e-mail sont envoyées via Resend.

## Vos droits

Vous pouvez demander l'accès, la rectification ou la suppression de vos données à {{contactEmail}}. Chaque e-mail de la newsletter contient un lien de désinscription en un clic.`,
      en: `This site collects the bare minimum. It uses **no advertising or tracking cookies**, and no data is sold or shared.

## Data controller

{{ownerName}} — {{contactEmail}}.

## Data collected and purposes

| Source | Data | Purpose | Retention |
| --- | --- | --- | --- |
| Contact form | name, email, subject, message | answering your request | 2 years maximum |
| Quote request | name, email, phone and company (optional), needs, budget, timeline, attachments | preparing a quote | 3 years maximum |
| Comments | name, email (never published), comment | publication after moderation | while published |
| Newsletter | email, language | sending new articles | until you unsubscribe |
| Visit statistics | page visited, referring site, country, device type, anonymous fingerprint renewed daily | aggregated audience measurement | 13 months |

Your IP address is never stored in clear: it is combined with a daily salt and hashed, which prevents tracking you from one day to the next. “Do Not Track” and “Global Privacy Control” signals are honored: no statistics are recorded in that case.

## Local storage

Your theme choice (light or dark) is saved in your browser's local storage. It never leaves your device.

## Spam protection

Forms may use Cloudflare Turnstile, a bot check that does not set advertising tracking cookies.

## Recipients and processors

Your data is only accessible to {{ownerName}}. It is hosted by Supabase (database) and Vercel (application); email notifications are sent through Resend.

## Your rights

You can request access to, correction or deletion of your data at {{contactEmail}}. Every newsletter email contains a one-click unsubscribe link.`,
    },
    updatedAt: "2026-10-01T08:00:00.000Z",
    isExample: true,
  },
];
