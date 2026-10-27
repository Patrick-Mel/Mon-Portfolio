/**
 * CONFIGURATION CENTRALE DU SITE
 * ------------------------------------------------------------------
 * Source unique pour le nom, la marque, le domaine et les coordonnées.
 * Ces valeurs servent de valeurs par défaut : une fois Supabase configuré,
 * la table `site_settings` (modifiable dans /admin → Paramètres) les remplace.
 *
 * Aucun nom ni domaine n'est écrit ailleurs dans le code.
 * Les valeurs marquées EXEMPLE sont à remplacer.
 */
import type { SiteSettings } from "@/lib/types";

export const siteConfig: SiteSettings = {
  /** Nom complet affiché partout (en-tête, métadonnées, JSON-LD). */
  ownerName: "Patrick Melaga",
  /** Initiales du monogramme (1 à 3 caractères). */
  initials: "PM",
  /** Nom de marque (peut être identique au nom). */
  brandName: "Patrick Melaga",
  /** URL publique, sans barre finale. Surchargée par NEXT_PUBLIC_SITE_URL. */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /** EXEMPLE — adresse de contact publique. */
  contactEmail: "contact@example.com",
  /** EXEMPLE — format international recommandé. */
  phone: "+237 600 000 000",
  /** EXEMPLE — numéro WhatsApp, chiffres uniquement (format wa.me). */
  whatsapp: "237600000000",
  location: { fr: "Yaoundé, Cameroun", en: "Yaoundé, Cameroon" },
  role: {
    fr: "Administrateur Réseaux & Systèmes · Développeur Full-Stack · Designer",
    en: "Network & Systems Administrator · Full-Stack Developer · Designer",
  },
  tagline: {
    fr: "Une ingénierie rigoureuse, un design irréprochable.",
    en: "Rigorous engineering, impeccable design.",
  },
  heroIntro: {
    fr: "Je conçois des réseaux fiables, j'administre des serveurs qui tiennent la charge et je construis des applications web aussi solides que soignées.",
    en: "I design reliable networks, run servers that hold under load and build web applications that are as solid as they are polished.",
  },
  about: {
    fr: "Diplômé de l'IAI Cameroun (2023-2026), je me situe à la jonction de l'infrastructure et du produit : je sais câbler une salle serveur, segmenter un réseau, automatiser un déploiement Linux, puis concevoir l'interface qui rend tout cela utilisable. Mon parcours m'a mené du DTS à la licence professionnelle en Systèmes et Réseaux, puis au diplôme d'ingénieur des travaux informatiques, option Systèmes et Réseaux.",
    en: "A graduate of IAI Cameroon (2023-2026), I work where infrastructure meets product: I can wire a server room, segment a network, automate a Linux deployment, then design the interface that makes it all usable. My path took me from the DTS to a professional bachelor's degree in Systems and Networks, then to the computer engineering technologist degree, Systems and Networks track.",
  },
  availability: {
    fr: "Disponible pour un emploi, un stage ou une mission freelance.",
    en: "Available for a job, an internship or a freelance project.",
  },
  seoTitle: {
    fr: "Administrateur réseaux & systèmes, développeur full-stack et designer",
    en: "Network & systems administrator, full-stack developer and designer",
  },
  seoDescription: {
    fr: "Portfolio : conception et sécurisation de réseaux, administration de serveurs Linux/Windows, développement web full-stack et design. Basé au Cameroun, disponible à distance.",
    en: "Portfolio: network design and security, Linux/Windows server administration, full-stack web development and design. Based in Cameroon, available remotely.",
  },
  ogImageUrl: null,
  avatarUrl: null,
  /** Couleur de signal. Les variantes de contraste sont dérivées automatiquement. */
  accentColor: "#FF5A1F",
  defaultTheme: "system",
  /** Laisser vide une entrée la masque du site (aucun lien mort). */
  socials: {
    github: "",
    linkedin: "",
  },
  features: {
    blog: true,
    comments: true,
    newsletter: true,
    quotes: true,
    analytics: true,
  },
  /** Fichiers CV par défaut (remplacés par les PDF téléversés dans /admin). */
  cvUrl: {},
  isExample: true,
};
