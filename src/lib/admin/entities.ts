/**
 * Formulaires de chaque type de contenu (partagés par le rendu client et la validation serveur).
 */
import { ICON_NAMES } from "@/components/ui/icon";
import { SOCIAL_KEYS, SOCIAL_LABELS } from "@/lib/socials";
import type { FieldGroup, FieldOption } from "./fields";

const opts = (pairs: [string, string][]): FieldOption[] => pairs.map(([value, label]) => ({ value, label }));
const iconOptions = ICON_NAMES.map((n) => ({ value: n, label: n }));
const exampleField = {
  name: "is_example",
  type: "boolean" as const,
  label: "Contenu d'exemple (à remplacer)",
  help: "Décochez une fois le contenu personnalisé : le badge « Exemple » disparaît de l'admin.",
};

export const PROJECT_CATEGORY_OPTIONS = opts([
  ["network", "Réseaux"],
  ["systems", "Systèmes"],
  ["development", "Développement"],
  ["design", "Design"],
]);

export const projectGroups: FieldGroup[] = [
  {
    title: "Identité",
    fields: [
      { name: "title", type: "i18n", label: "Titre", required: true, max: 160 },
      { name: "slug", type: "slug", label: "Slug (URL)", required: true, slugFrom: "title.fr", width: "half" },
      { name: "category", type: "select", label: "Domaine", required: true, options: PROJECT_CATEGORY_OPTIONS, width: "half" },
      { name: "summary", type: "i18n-textarea", label: "Résumé (cartes et SEO)", required: true, max: 400 },
    ],
  },
  {
    title: "Publication",
    fields: [
      { name: "status", type: "select", label: "Statut", required: true, options: opts([["draft", "Brouillon"], ["published", "Publié"]]), width: "half", defaultValue: "draft" },
      { name: "sort_order", type: "number", label: "Ordre d'affichage", width: "half", defaultValue: 10 },
      { name: "featured", type: "boolean", label: "Mettre en avant sur l'accueil" },
      exampleField,
    ],
  },
  {
    title: "Fiche",
    fields: [
      { name: "role", type: "i18n", label: "Rôle", required: true },
      { name: "duration", type: "i18n", label: "Durée", required: true, width: "half" },
      { name: "year", type: "number", label: "Année", required: true, width: "half", defaultValue: new Date().getFullYear() },
      { name: "stack", type: "list", label: "Stack technique", help: "Séparez par des virgules ou des retours à la ligne.", max: 2000 },
      { name: "github_url", type: "url", label: "Lien GitHub (https://…)", width: "half" },
      { name: "demo_url", type: "url", label: "Lien de démo (https://…)", width: "half" },
      { name: "cover_url", type: "image", label: "Visuel de couverture", help: "Sans visuel, le premier schéma sert de couverture." },
    ],
  },
  {
    title: "Étude de cas",
    description: "Markdown accepté : titres ##, listes, **gras**, `code`, liens.",
    fields: [
      { name: "context", type: "i18n-markdown", label: "Contexte", required: true },
      { name: "problem", type: "i18n-markdown", label: "Problème", required: true },
      { name: "solution", type: "i18n-markdown", label: "Solution", required: true },
      { name: "results", type: "i18n-markdown", label: "Résultats", required: true },
      { name: "learnings", type: "i18n-markdown", label: "Ce que j'ai appris", required: true },
    ],
  },
  {
    title: "Schémas interactifs",
    description: "Topologies décrites en JSON (nœuds, liaisons, zones), rendues en SVG adapté aux deux thèmes.",
    fields: [{ name: "diagrams", type: "json", label: "Schémas (JSON)", max: 100000, defaultValue: [] }],
  },
  {
    title: "SEO",
    fields: [{ name: "seo_description", type: "i18n-textarea", label: "Description SEO (facultatif)", max: 300 }],
  },
];

export const POST_STATUS_OPTIONS = opts([
  ["draft", "Brouillon"],
  ["scheduled", "Planifié"],
  ["published", "Publié"],
]);

export const postGroups = (categories: FieldOption[]): FieldGroup[] => [
  {
    title: "Article",
    fields: [
      { name: "title", type: "i18n", label: "Titre", required: true, max: 200 },
      { name: "slug", type: "slug", label: "Slug (URL)", required: true, slugFrom: "title.fr", width: "half" },
      { name: "category_id", type: "select", label: "Catégorie", options: categories, width: "half" },
      { name: "excerpt", type: "i18n-textarea", label: "Chapeau", required: true, max: 400 },
      { name: "content", type: "i18n-markdown", label: "Contenu", required: true, max: 200000 },
      { name: "cover_url", type: "image", label: "Image de couverture" },
    ],
  },
  {
    title: "Publication",
    fields: [
      { name: "status", type: "select", label: "Statut", required: true, options: POST_STATUS_OPTIONS, width: "half", defaultValue: "draft" },
      { name: "published_at", type: "datetime", label: "Date de publication", help: "Obligatoire pour « Planifié » et « Publié ». Une date future planifie l'article.", width: "half" },
      exampleField,
    ],
  },
  {
    title: "SEO",
    fields: [
      { name: "seo_title", type: "i18n", label: "Titre SEO (facultatif)", max: 70 },
      { name: "seo_description", type: "i18n-textarea", label: "Description SEO (facultatif)", max: 300 },
    ],
  },
];

export const serviceGroups: FieldGroup[] = [
  {
    title: "Offre",
    fields: [
      { name: "title", type: "i18n", label: "Titre", required: true, max: 160 },
      { name: "slug", type: "slug", label: "Slug (ancre et pré-remplissage du devis)", required: true, slugFrom: "title.fr", width: "half" },
      { name: "icon", type: "select", label: "Icône", options: iconOptions, width: "half", defaultValue: "network" },
      { name: "summary", type: "i18n-textarea", label: "Accroche", required: true, max: 300 },
      { name: "description", type: "i18n-textarea", label: "Description", required: true, max: 2000 },
    ],
  },
  {
    title: "Contenu",
    fields: [
      { name: "benefits", type: "i18n-list", label: "Bénéfices (un par ligne)", required: true },
      { name: "deliverables", type: "i18n-list", label: "Livrables (un par ligne)", required: true },
      { name: "process", type: "steps", label: "Processus en étapes", defaultValue: [] },
    ],
  },
  {
    title: "Publication",
    fields: [
      { name: "published", type: "boolean", label: "Publié", defaultValue: true },
      { name: "sort_order", type: "number", label: "Ordre d'affichage", defaultValue: 10 },
      exampleField,
    ],
  },
];

export const skillGroups: FieldGroup[] = [
  {
    title: "Compétence",
    fields: [
      { name: "name", type: "i18n", label: "Nom", required: true, max: 120 },
      {
        name: "category",
        type: "select",
        label: "Domaine",
        required: true,
        options: opts([["network", "Réseaux"], ["systems", "Systèmes & sécurité"], ["fullstack", "Full-stack"], ["design", "Design"]]),
        width: "half",
      },
      {
        name: "level",
        type: "select",
        label: "Niveau",
        required: true,
        options: opts([["learning", "En progression"], ["proficient", "Opérationnel"], ["advanced", "Avancé"]]),
        width: "half",
        defaultValue: "proficient",
      },
      { name: "icon", type: "select", label: "Icône", options: iconOptions, width: "half", defaultValue: "code" },
      { name: "sort_order", type: "number", label: "Ordre", width: "half", defaultValue: 10 },
      { name: "featured", type: "boolean", label: "Compétence clé (accueil)" },
      exampleField,
    ],
  },
];

export const timelineGroups: FieldGroup[] = [
  {
    title: "Étape du parcours",
    fields: [
      { name: "kind", type: "select", label: "Type", required: true, options: opts([["education", "Formation"], ["experience", "Expérience"]]), width: "half", defaultValue: "education" },
      { name: "sort_order", type: "number", label: "Ordre", width: "half", defaultValue: 10 },
      { name: "title", type: "i18n", label: "Intitulé", required: true, max: 200 },
      { name: "organization", type: "text", label: "Établissement / entreprise", required: true, width: "half" },
      { name: "location", type: "text", label: "Lieu", width: "half" },
      { name: "start_date", type: "month", label: "Début", required: true, width: "half" },
      { name: "end_date", type: "month", label: "Fin (vide = en cours)", width: "half" },
      { name: "description", type: "i18n-textarea", label: "Description", required: true, max: 1500 },
      exampleField,
    ],
  },
];

export const figureGroups: FieldGroup[] = [
  {
    title: "Chiffre clé",
    description: "Uniquement des faits vérifiables (années, diplômes, projets livrés…).",
    fields: [
      { name: "value", type: "text", label: "Valeur", required: true, max: 12, width: "half" },
      { name: "sort_order", type: "number", label: "Ordre", width: "half", defaultValue: 10 },
      { name: "label", type: "i18n", label: "Libellé", required: true, max: 120 },
      exampleField,
    ],
  },
];

export const taxonomyGroups: FieldGroup[] = [
  {
    title: "Libellé",
    fields: [
      { name: "name", type: "i18n", label: "Nom", required: true, max: 80 },
      { name: "slug", type: "slug", label: "Slug", required: true, slugFrom: "name.fr" },
    ],
  },
];

export const legalGroups: FieldGroup[] = [
  {
    title: "Page",
    description: "Variables disponibles : {{ownerName}}, {{brandName}}, {{siteUrl}}, {{contactEmail}}, {{location}}.",
    fields: [
      { name: "title", type: "i18n", label: "Titre", required: true },
      { name: "content", type: "i18n-markdown", label: "Contenu", required: true, max: 100000 },
      exampleField,
    ],
  },
];

export const settingsGroups: FieldGroup[] = [
  {
    title: "Identité",
    description: "Nom et marque utilisés partout : en-tête, métadonnées, e-mails, JSON-LD.",
    fields: [
      { name: "owner_name", type: "text", label: "Nom complet", required: true, max: 80, width: "half" },
      { name: "brand_name", type: "text", label: "Nom de marque", required: true, max: 80, width: "half" },
      { name: "initials", type: "text", label: "Initiales du monogramme (1 à 3)", required: true, max: 3, width: "half" },
      { name: "site_url", type: "url", label: "URL du site (sans / final)", required: true, width: "half" },
      { name: "role", type: "i18n", label: "Titre professionnel (séparez les rôles par « · »)", required: true },
      { name: "tagline", type: "i18n", label: "Phrase d'accroche", required: true },
      { name: "hero_intro", type: "i18n-textarea", label: "Introduction de l'accueil", required: true, max: 500 },
      { name: "about", type: "i18n-textarea", label: "Présentation", required: true, max: 2000 },
      { name: "availability", type: "i18n", label: "Disponibilité", required: true },
      { name: "avatar_url", type: "image", label: "Photo de profil" },
    ],
  },
  {
    title: "Coordonnées",
    fields: [
      { name: "contact_email", type: "email", label: "E-mail public", required: true, width: "half" },
      { name: "phone", type: "text", label: "Téléphone", max: 40, width: "half" },
      { name: "whatsapp", type: "text", label: "WhatsApp (chiffres uniquement, ex. 2376…)", max: 20, width: "half" },
      { name: "location", type: "i18n", label: "Localisation générale", required: true },
    ],
  },
  {
    title: "Réseaux sociaux",
    description: "Laissez vide pour masquer un réseau.",
    fields: SOCIAL_KEYS.map((k) => ({ name: `socials.${k}`, type: "url" as const, label: SOCIAL_LABELS[k], width: "half" as const })),
  },
  {
    title: "CV",
    description: "Téléversez un PDF par langue. Sans fichier, le CV d'exemple livré avec le site est proposé.",
    fields: [
      { name: "cv_url.fr", type: "file", label: "CV français (PDF)", accept: "application/pdf", width: "half" },
      { name: "cv_url.en", type: "file", label: "CV anglais (PDF)", accept: "application/pdf", width: "half" },
    ],
  },
  {
    title: "SEO et partage",
    fields: [
      { name: "seo_title", type: "i18n", label: "Titre SEO par défaut", required: true, max: 70 },
      { name: "seo_description", type: "i18n-textarea", label: "Description SEO par défaut", required: true, max: 300 },
      { name: "og_image_url", type: "image", label: "Image de partage (1200×630, facultatif — sinon générée)" },
    ],
  },
  {
    title: "Apparence",
    fields: [
      { name: "accent_color", type: "color", label: "Couleur d'accent", required: true, width: "half", help: "Gardez une teinte saturée et lumineuse : le texte posé dessus est foncé." },
      {
        name: "default_theme",
        type: "select",
        label: "Thème par défaut",
        required: true,
        options: opts([["system", "Préférence du système"], ["light", "Clair"], ["dark", "Sombre"]]),
        width: "half",
      },
    ],
  },
  {
    title: "Fonctionnalités",
    fields: [
      { name: "features.blog", type: "boolean", label: "Blog" },
      { name: "features.comments", type: "boolean", label: "Commentaires (modérés)" },
      { name: "features.newsletter", type: "boolean", label: "Newsletter" },
      { name: "features.quotes", type: "boolean", label: "Formulaire de devis" },
      { name: "features.analytics", type: "boolean", label: "Statistiques de visite (sans cookie)" },
      exampleField,
    ],
  },
];
